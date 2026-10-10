'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-card border border-blue-200/80 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-roncedo-celeste/20 text-roncedo-celeste flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Página no encontrada</h2>
        <p className="text-xs sm:text-sm text-slate-600">
          La página o recurso al que intentas acceder no existe o fue reubicado en el archivo.
        </p>
        <div className="pt-2">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 bg-[#0F284B] hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
