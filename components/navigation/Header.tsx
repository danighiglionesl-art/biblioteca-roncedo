'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { ShieldCheck, User as UserIcon, LogOut, Download, Sparkles, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, logout, switchUserRoleDemo } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-roncedo-navy text-white shadow-md border-b border-blue-900/40">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Logo e Identidad Institucional */}
        <Link href="/home" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-white/20 bg-white/10 flex-shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src="/images/emblema-biblioteca.jpg"
              alt="Escudo Biblioteca Dr. Lautaro Roncedo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase tracking-wider font-semibold text-roncedo-blueLight">
                Cultura y Deporte
              </span>
              <span className="text-[10px] bg-roncedo-gold/20 text-roncedo-goldLight px-1.5 py-0.2 rounded font-medium border border-roncedo-gold/30">
                Alcira Gigena
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
              Biblioteca Dr. Lautaro Roncedo
            </h1>
          </div>
        </Link>

        {/* Acciones y Perfil */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Indicador de Rol */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-white">
                {user.nombre} {user.apellido}
              </span>
              <span className="text-[11px] text-blue-200 capitalize flex items-center gap-1">
                {user.role === 'admin' && (
                  <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-amber-400/30">
                    Administrador
                  </span>
                )}
                {user.role === 'socio' && (
                  <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-emerald-400/30">
                    Socio N° {user.numero_socio || '1042'}
                  </span>
                )}
                {user.role === 'usuario' && (
                  <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-blue-400/30">
                    Usuario Registrado
                  </span>
                )}
              </span>
            </div>

            {/* Acceso a Instalar PWA */}
            <Link
              href="/instalar"
              className="hidden sm:flex items-center gap-1 bg-white/10 hover:bg-white/20 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors"
              title="Instalar App en el teléfono"
            >
              <Download className="w-3.5 h-3.5 text-roncedo-blueLight" />
              <span className="hidden lg:inline">Instalar PWA</span>
            </Link>

            {/* Perfil */}
            <Link
              href="/perfil"
              className="w-9 h-9 rounded-full bg-roncedo-blue/40 border border-white/20 flex items-center justify-center text-white hover:bg-roncedo-blue transition-colors"
              title="Mi Perfil"
            >
              <UserIcon className="w-4 h-4" />
            </Link>

            {/* Cerrar Sesión */}
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/20 hover:text-red-300 border border-white/10 flex items-center justify-center text-white/80 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-roncedo-blue hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Iniciar Sesión
          </Link>
        )}
      </div>

      {/* Switcher Demo para pruebas rápidas de roles (solo informativo/demo) */}
      {user && (
        <div className="bg-roncedo-navyDark/90 border-t border-blue-900/50 px-4 py-1 text-[11px] text-blue-300 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 text-slate-300 font-medium">
            <Sparkles className="w-3 h-3 text-roncedo-gold" />
            <span>Modo Demo Activo:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Probar como:</span>
            <button
              onClick={() => switchUserRoleDemo('usuario')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                user.role === 'usuario' ? 'bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              Usuario
            </button>
            <button
              onClick={() => switchUserRoleDemo('socio')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                user.role === 'socio' ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              Socio Activo
            </button>
            <button
              onClick={() => switchUserRoleDemo('admin')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                user.role === 'admin' ? 'bg-amber-500 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              Administrador
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
