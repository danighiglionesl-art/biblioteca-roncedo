'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

// Rutas públicas accesibles sin iniciar sesión
const PUBLIC_ROUTES = ['/login', '/recuperar', '/instalar'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const normalizedPath = (pathname ? pathname.replace(/\/+$/, '') : '') || '/';
  const isPublicRoute = PUBLIC_ROUTES.includes(normalizedPath);

  useEffect(() => {
    if (isLoading) return;

    // Caso 1: Ruta raíz '/' -> redirigir inmediatamente según estado de sesión
    if (normalizedPath === '/') {
      if (user) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
      return;
    }

    // Caso 2: Usuario NO logueado intentando acceder a una ruta privada -> enviar a /login
    if (!user && !isPublicRoute) {
      router.replace('/login');
      return;
    }

    // Caso 3: Usuario YA logueado intentando entrar a /login o /recuperar -> enviar a /home
    // (Nota: /instalar sigue siendo accesible aún estando logueado)
    if (user && (normalizedPath === '/login' || normalizedPath === '/recuperar')) {
      router.replace('/home');
      return;
    }
  }, [user, isLoading, isPublicRoute, normalizedPath, router]);

  // Pantalla de carga institucional mientras se comprueba la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F2D54] via-[#1B5296] to-[#5B9BE5] flex items-center justify-center text-white p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs animate-fade-in">
          <div className="relative w-20 h-20 drop-shadow-xl">
            <Image
              src="/images/logo-biblioteca.png"
              alt="Logo Biblioteca Roncedo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-blue-100 font-bold">
            Verificando Credenciales...
          </p>
        </div>
      </div>
    );
  }

  // Si estamos en la raíz '/', mostrar transición mientras se completa la redirección a /login o /home
  if (normalizedPath === '/') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F2D54] via-[#1B5296] to-[#5B9BE5] flex items-center justify-center text-white p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs animate-fade-in">
          <div className="relative w-20 h-20 drop-shadow-xl">
            <Image
              src="/images/logo-biblioteca.png"
              alt="Logo Biblioteca Roncedo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-blue-100 font-bold">
            Cargando Biblioteca Roncedo...
          </p>
        </div>
      </div>
    );
  }

  // Si no está autenticado y es ruta privada, mostrar pantalla mientras redirige a login
  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F2D54] via-[#1B5296] to-[#5B9BE5] flex items-center justify-center text-white p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs animate-fade-in">
          <div className="relative w-20 h-20 drop-shadow-xl">
            <Image
              src="/images/logo-biblioteca.png"
              alt="Logo Biblioteca Roncedo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-blue-100 font-bold">
            Acceso restringido • Redirigiendo a Login...
          </p>
        </div>
      </div>
    );
  }

  // Si está autenticado pero intenta entrar a /login o /recuperar, mostrar transición a /home
  if (user && (normalizedPath === '/login' || normalizedPath === '/recuperar')) {
    return (
      <div className="min-h-screen bg-[#EDF5FD] flex items-center justify-center text-slate-800 p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-roncedo-celeste border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-roncedo-navy font-bold">
            Ingresando a Biblioteca Roncedo...
          </p>
        </div>
      </div>
    );
  }

  // Ruta válida autorizada o pública (/login, /instalar, /recuperar, o rutas privadas autenticadas)
  return <>{children}</>;
}
