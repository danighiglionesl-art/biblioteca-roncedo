'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe2, Library } from 'lucide-react';
import { BibliotecaFisicaView } from '@/components/libros/BibliotecaFisicaView';

export default function LibrosPage() {
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
            href="/biblioteca-digital"
            className="inline-flex items-center gap-2 text-xs font-bold bg-white hover:bg-slate-50 text-roncedo-navy px-3.5 py-2 rounded-xl shadow-sm border border-blue-200 transition-colors"
          >
            <Globe2 className="w-4 h-4 text-roncedo-blue" />
            <span>Ir a Biblioteca Digital →</span>
          </Link>
        </div>

        {/* Vista Principal del Catálogo Físico */}
        <BibliotecaFisicaView />
      </div>
    </div>
  );
}
