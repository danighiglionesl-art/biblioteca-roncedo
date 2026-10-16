'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error global capturado:', error);
  }, [error]);

  return (
    <html lang="es" className="h-full">
      <body className="h-full flex items-center justify-center bg-gradient-to-b from-[#0F2D54] via-[#1B5296] to-[#5B9BE5] text-white p-4 font-sans antialiased">
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
            Se ha completado una actualización en la plataforma. Por favor, pulsa el botón para recargar la aplicación.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                } else {
                  reset();
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-roncedo-gold hover:bg-amber-400 text-roncedo-navy font-black text-xs shadow-md transition-all active:scale-95"
            >
              <span>Recargar Aplicación</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
