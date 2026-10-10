'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { isPerfilCompleto } from '@/lib/utils';

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

    // Si la URL contiene un token de OAuth o retorno de Supabase en el hash, esperar a que se procese
    if (typeof window !== 'undefined' && (
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('refresh_token') ||
      window.location.hash.includes('error=')
    )) {
      return;
    }

    // Caso 1: Ruta raíz '/' -> redirigir inmediatamente según estado de sesión y completitud de datos
    if (normalizedPath === '/') {
      if (user) {
        if (!isPerfilCompleto(user)) {
          router.replace('/perfil');
        } else {
          router.replace('/home');
        }
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

    // Caso 3: Usuario YA logueado intentando entrar a /login o /recuperar -> enviar a /home o /perfil
    // (Nota: /instalar sigue siendo accesible aún estando logueado)
    if (user && (normalizedPath === '/login' || normalizedPath === '/recuperar')) {
      if (!isPerfilCompleto(user)) {
        router.replace('/perfil');
      } else {
        router.replace('/home');
      }
      return;
    }

    // Caso 4: Usuario autenticado con datos obligatorios incompletos (primer ingreso)
    // Debe dirigirse a /perfil para completar su ficha de socio
    if (user && !isPerfilCompleto(user) && normalizedPath !== '/perfil' && normalizedPath !== '/instalar') {
      router.replace('/perfil');
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

  // Si está autenticado pero intenta entrar a /login o /recuperar, mostrar transición
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

  // Si está autenticado pero le faltan datos obligatorios y se encuentra fuera de /perfil o /instalar
  if (user && !isPerfilCompleto(user) && normalizedPath !== '/perfil' && normalizedPath !== '/instalar') {
    return (
      <div className="min-h-screen bg-[#EDF5FD] flex items-center justify-center text-slate-800 p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-8 h-8 border-3 border-roncedo-celeste border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-roncedo-navy font-bold">
            Dirigiendo a Datos Personales Obligatorios...
          </p>
        </div>
      </div>
    );
  }

  // Ruta válida autorizada o pública (/login, /instalar, /recuperar, o rutas privadas autenticadas)
  return <>{children}</>;
}
