'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export default function EventosPage() {
  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-24 pt-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navegación Superior: Volver al Inicio */}
        <div className="flex items-center justify-between">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-xs font-bold text-roncedo-navy hover:text-roncedo-celesteDark transition-colors bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-blue-200/80 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-roncedo-celeste" />
            <span>Volver al Inicio</span>
          </Link>

          <span className="text-[11px] font-semibold text-slate-500">
            Biblioteca Roncedo • Agenda Cultural
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-blue-200/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#5B9BE5] text-white flex items-center justify-center shadow-md">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300">
                Módulo Programado • Etapa 5
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                Eventos, Cursos y Talleres Culturales
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Publicación de charlas, presentaciones de libros, cursos, talleres de arte y lectura, actividades infantiles y encuentros sociales organizados por la Biblioteca, con inscripción directa en un toque y control de cupos.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Funcionalidades listas para activarse en la Etapa 5:</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Inscripción online con un toque para socios y público</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Gestión de cupos máximos y recordatorios de inicio</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Sección &ldquo;Mis actividades&rdquo; dentro del perfil del socio</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Acreditación de asistencia en el ingreso con código QR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
