'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RotateCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error capturado por ErrorBoundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F2D54] via-[#1B5296] to-[#5B9BE5] flex items-center justify-center text-white p-4">
      <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl max-w-md w-full text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <Image
            src="/images/logo-biblioteca.png"
            alt="Biblioteca Roncedo"
            fill
            className="object-contain drop-shadow-md"
          />
        </div>
        <h2 className="text-xl font-black text-white">
          Biblioteca Roncedo
        </h2>
        <p className="text-xs text-blue-100/90 leading-relaxed">
          Ha ocurrido una actualización o interrupción momentánea. Por favor, pulsa el botón para continuar.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-roncedo-gold hover:bg-amber-400 text-roncedo-navy font-black text-xs shadow-md transition-all active:scale-95"
          >
            <RotateCw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>
          <Link
            href="/home"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Ir al Inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
