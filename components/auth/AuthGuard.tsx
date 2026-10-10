'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

const PUBLIC_ROUTES = ['/login', '/recuperar'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!isLoading) {
      if (!user && !isPublicRoute && pathname !== '/') {
        router.replace('/login');
      } else if (user && isPublicRoute) {
        router.replace('/home');
      }
    }
  }, [user, isLoading, isPublicRoute, pathname, router]);

  // Pantalla de carga mientras se verifica la sesión
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

  // Si no está autenticado y no es una ruta pública, bloquear contenido mientras redirige
  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F2D54] via-[#1B5296] to-[#5B9BE5] flex items-center justify-center text-white p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs">
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

  // Si está autenticado pero intenta entrar a /login o /recuperar, bloquear mientras redirige a /home
  if (user && isPublicRoute) {
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

  return <>{children}</>;
}
