'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Search, ArrowLeft, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

export default function LibrosPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-roncedo-blue hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                Módulo Programado • Etapa 2
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                Biblioteca Digital y Catálogo de Libros
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Este espacio contendrá el catálogo bibliográfico completo de la institución: búsqueda por título, autor, género, editorial y palabras clave, consulta de ubicación física en estantería, solicitud de préstamos y reserva de ejemplares para socios con cuota al día.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Funcionalidades listas para activarse en la Etapa 2:</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Buscador por autor, género, editorial e ISBN</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Ficha individual de cada libro con foto de tapa</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Préstamos y devoluciones vinculadas al carnet QR</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Renovaciones en línea y control de vencimientos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
