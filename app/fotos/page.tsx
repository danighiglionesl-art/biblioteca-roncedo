'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export default function FotosPage() {
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
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Módulo Programado • Etapa 3
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                Archivo Fotográfico Histórico Colaborativo
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Uno de los pilares centrales de la plataforma: un archivo digital de fotografías de la Biblioteca, del Club Roncedo y de Alcira Gigena. Permitirá etiquetar personas, lugares, fechas y acontecimientos, además de recibir fotografías aportadas por los vecinos con moderación previa del administrador.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Funcionalidades listas para activarse en la Etapa 3:</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Etiquetado de personas (al tocar un nombre se ven todas sus fotos)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Búsqueda por acontecimientos, años (ej: 1958) y lugares</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Subida de fotos históricas desde el celular por parte de socios</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Bandeja de moderación y aprobación de fotos por la administración</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
