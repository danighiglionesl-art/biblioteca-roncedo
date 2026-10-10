'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { isPerfilCompleto } from '@/lib/utils';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Si la URL contiene un token de OAuth o retorno de Supabase en el hash, esperar a que AuthContext lo procese
    if (typeof window !== 'undefined' && (
      window.location.hash.includes('access_token') ||
      window.location.hash.includes('refresh_token') ||
      window.location.hash.includes('error=')
    )) {
      return;
    }

    if (!isLoading) {
      if (user) {
        if (!isPerfilCompleto(user)) {
          router.replace('/perfil');
        } else {
          router.replace('/home');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#E5F2FE] flex items-center justify-center text-slate-800">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-roncedo-celeste border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-[#102A4E] font-bold">
          Cargando Biblioteca Roncedo...
        </p>
      </div>
    </div>
  );
}
