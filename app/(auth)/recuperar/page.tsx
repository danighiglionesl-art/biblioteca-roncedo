'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Send } from 'lucide-react';

export default function RecuperarPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await resetPassword(email);
      if (!res.success) {
        setError(res.error || 'No se pudo enviar el correo de recuperación');
        return;
      }
      setEnviado(true);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-roncedo-navy via-slate-900 to-roncedo-navyDark text-slate-100 p-4 sm:p-6">
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Iniciar Sesión</span>
        </Link>

        <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-roncedo-sky rounded-2xl flex items-center justify-center mx-auto mb-3 text-roncedo-blue">
              <Mail className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Recuperar Contraseña
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ingresa el correo electrónico asociado a tu cuenta de la Biblioteca y te enviaremos las instrucciones de restablecimiento.
            </p>
          </div>

          {enviado ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-emerald-900">
                ¡Correo enviado con éxito!
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                Revisa tu bandeja de entrada en <strong>{email}</strong> y sigue el enlace para definir una nueva contraseña.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tu Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-roncedo-navy hover:bg-blue-900 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Instrucciones</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
