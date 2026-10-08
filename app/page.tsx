'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-roncedo-navy flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-roncedo-blueLight border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-slate-300 font-bold">
          Cargando Biblioteca Roncedo...
        </p>
      </div>
    </div>
  );
}
