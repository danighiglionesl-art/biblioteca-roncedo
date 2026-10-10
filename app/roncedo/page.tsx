'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Award, ArrowLeft, Sparkles, CheckCircle2, Music2, Headphones } from 'lucide-react';
import { MarchasRoncedoPlayer } from '@/components/roncedo/MarchasRoncedoPlayer';

export default function RoncedoPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-28 pt-6 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Navegación Superior: Volver al Inicio */}
        <div className="flex items-center justify-between">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-xs font-bold text-roncedo-goldLight hover:text-white transition-colors bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-amber-500/30 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-roncedo-gold" />
            <span>Volver al Inicio</span>
          </Link>

          <span className="text-[11px] font-semibold text-slate-400">
            Biblioteca Roncedo • Museo Digital
          </span>
        </div>

        {/* Banner de Presentación Institucional del Museo */}
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
                <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                  Museo Digital Dr. Lautaro Roncedo
                </h1>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Un espacio museológico virtual con estética patrimonial diferenciada dedicado a la memoria, cartas manuscritas, instrumental médico, fotografías personales, música y trayectoria comunitaria del querido Dr. Lautaro Roncedo, figura señera y alma mater de nuestra localidad.
            </p>

            <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-roncedo-goldLight mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-roncedo-gold" />
                <span>Salas y Archivos del Museo Digital:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-roncedo-gold flex-shrink-0" />
                  <span><strong>Biografía y Cronología Interactiva:</strong> Su vida y obra comunitaria.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0">✓</span>
                  <span className="text-amber-200 font-semibold">
                    <strong>Archivo Sonoro y Marchas:</strong> Himno Tradicional y Versión Chébere.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-roncedo-gold flex-shrink-0" />
                  <span><strong>Archivo Epistolar y Manuscritos:</strong> Cartas originales digitalizadas.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-roncedo-gold flex-shrink-0" />
                  <span><strong>Objetos y Pertenencias:</strong> Fichas de piezas históricas y medicina.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Destacada: Archivo Sonoro - Las Dos Marchas del Club */}
        <section aria-label="Marchas del Club Lautaro Roncedo" className="space-y-4">
          <MarchasRoncedoPlayer />
        </section>
      </div>
    </div>
  );
}
