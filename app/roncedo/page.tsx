'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, ArrowLeft, Sparkles, CheckCircle2, BookOpen } from 'lucide-react';

export default function RoncedoPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24 pt-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-roncedo-goldLight hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>

        <div className="bg-gradient-to-br from-slate-900 via-roncedo-navyDark to-blue-950 rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-roncedo-gold text-slate-900 flex items-center justify-center shadow-lg font-black">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-roncedo-gold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Espacio Patrimonial • Etapa 6
                </span>
                <h1 className="text-2xl font-black text-white mt-0.5">
                  Museo Digital Dr. Lautaro Roncedo
                </h1>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Un espacio museológico virtual con estética patrimonial diferenciada dedicado a la memoria, cartas manuscritas, instrumental médico, fotografías personales y trayectoria comunitaria del querido Dr. Lautaro Roncedo, figura señera de nuestra localidad.
            </p>

            <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-roncedo-goldLight mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-roncedo-gold" />
                <span>Salas que integrarán el Museo Digital:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-roncedo-gold flex-shrink-0" />
                  <span><strong>Biografía y Cronología Interactiva:</strong> Su vida y vínculo con el club.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-roncedo-gold flex-shrink-0" />
                  <span><strong>Archivo Epistolar y Manuscritos:</strong> Cartas originales digitalizadas.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-roncedo-gold flex-shrink-0" />
                  <span><strong>Objetos y Pertenencias:</strong> Fichas 3D/galería de piezas históricas.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-roncedo-gold flex-shrink-0" />
                  <span><strong>Homenajes y Testimonios:</strong> Relatos orales de vecinos y pacientes.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
