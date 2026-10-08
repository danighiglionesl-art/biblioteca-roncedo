'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Library, Globe2 } from 'lucide-react';
import { BibliotecaDigitalView } from '@/components/digital/BibliotecaDigitalView';

export default function BibliotecaDigitalPage() {
  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-24 pt-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navegación Superior */}
        <div className="flex items-center justify-between">
          <Link
            href="/mi-biblioteca"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-roncedo-navy hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Mi Biblioteca</span>
          </Link>

          <Link
            href="/libros"
            className="inline-flex items-center gap-2 text-xs font-bold bg-white hover:bg-slate-50 text-roncedo-navy px-3.5 py-2 rounded-xl shadow-sm border border-blue-200 transition-colors"
          >
            <Library className="w-4 h-4 text-roncedo-gold" />
            <span>Ver Catálogo Físico (1.283 libros) →</span>
          </Link>
        </div>

        {/* Vista Principal de la Biblioteca Digital */}
        <BibliotecaDigitalView />
      </div>
    </div>
  );
}
