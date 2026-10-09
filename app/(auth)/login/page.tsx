'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle, registerWithEmail } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginWithEmail(email, password);
        if (!res.success) {
          setError(res.error || 'Credenciales no válidas');
          return;
        }
        router.push('/home');
      } else {
        if (!nombre.trim() || !apellido.trim()) {
          setError('Por favor indica tu nombre y apellido completo');
          return;
        }
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          return;
        }
        if (password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          return;
        }

        const res = await registerWithEmail(email, password, nombre, apellido);
        if (!res.success) {
          setError(res.error || 'No se pudo completar el registro');
          return;
        }
        router.push('/home');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setError(res.error || 'No se pudo iniciar con Google');
        return;
      }
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Error con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#0F2D54] via-[#1B5296] to-[#5B9BE5] text-slate-100 p-4 sm:p-6">
      <div className="max-w-md w-full mx-auto my-auto py-6">
        {/* Cabecera con Emblema Oficial */}
        <div className="text-center mb-6">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto mb-3 drop-shadow-2xl">
            <Image
              src="/images/logo-biblioteca.png"
              alt="Logo Oficial Biblioteca Roncedo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xs uppercase tracking-widest font-bold text-white inline-block bg-white/20 px-3.5 py-1 rounded-full border border-white/30 mb-2 backdrop-blur-sm">
            Plataforma Institucional Digital
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Biblioteca Roncedo
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Club Sportivo y Biblioteca Dr. Lautaro Roncedo
          </p>
        </div>

        {/* Tarjeta Principal de Autenticación */}
        <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          {/* Pestañas Iniciar Sesión / Registrarse */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-roncedo-navy text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-roncedo-navy text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* OPCIÓN A: Continuar con Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3.5 px-4 rounded-2xl shadow-sm transition-all text-sm mb-5 group active:scale-[0.99]"
          >
            {/* Icono Oficial de Google */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>

          {/* Separador */}
          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-xs uppercase font-semibold">
              o con tu correo
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* OPCIÓN B: Formulario Email y Contraseña */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Juan"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Apellido
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Pérez"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {mode === 'login' ? 'Usuario o Correo Electrónico' : 'Correo Electrónico'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={mode === 'login' ? 'text' : 'email'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'login' ? 'biblioroncedo o correo electrónico' : 'ejemplo@correo.com'}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Contraseña
                </label>
                {mode === 'login' && (
                  <Link
                    href="/recuperar"
                    className="text-xs font-semibold text-roncedo-blue hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-roncedo-navy hover:bg-blue-900 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              <span>{mode === 'login' ? 'Entrar a la Plataforma' : 'Crear mi Cuenta'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Enlace para Instalar App */}
        <div className="text-center mt-6">
          <Link
            href="/instalar"
            className="text-xs text-blue-200 hover:text-white underline inline-flex items-center gap-1 font-medium transition-colors"
          >
            ¿Cómo instalar la App en tu celular?
          </Link>
        </div>
      </div>

      <footer className="text-center text-xs text-slate-300/80 py-3 border-t border-white/10 font-medium">
        Club Sportivo y Biblioteca Dr. Lautaro Roncedo • www.bibliotecaroncedo.ar
      </footer>
    </div>
  );
}
