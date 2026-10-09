'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BibliotecaDigitalView } from '@/components/digital/BibliotecaDigitalView';

export default function BibliotecaDigitalPage() {
  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-24 pt-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navegación Superior */}
        <div className="flex items-center justify-between">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-xs font-bold text-roncedo-navy hover:text-roncedo-celesteDark transition-colors bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-blue-200/80 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-roncedo-celeste" />
            <span>Volver al Inicio</span>
          </Link>

          <span className="text-[11px] font-semibold text-slate-500">
            Biblioteca Roncedo • Biblioteca Digital
          </span>
        </div>

        {/* Vista Principal de la Biblioteca Digital */}
        <BibliotecaDigitalView />
      </div>
    </div>
  );
}
