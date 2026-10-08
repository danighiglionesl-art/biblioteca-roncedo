'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FototecaGallery } from '@/components/fototeca/FototecaGallery';

export default function FotosPage() {
  return (
    <div className="min-h-screen bg-[#EDF5FD] pb-24 pt-4 sm:pt-6 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Navegación de retorno al inicio */}
        <div className="flex items-center justify-between">
          <Link
            href="/home"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-roncedo-navy hover:text-roncedo-celesteDark transition-colors bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-blue-200/60 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-roncedo-celeste" />
            <span>Volver al Inicio</span>
          </Link>

          <span className="text-[11px] font-semibold text-slate-500">
            Biblioteca Roncedo • Alcira Gigena
          </span>
        </div>

        {/* Galería Principal de la Fototeca Histórica */}
        <FototecaGallery />
      </div>
    </div>
  );
}
