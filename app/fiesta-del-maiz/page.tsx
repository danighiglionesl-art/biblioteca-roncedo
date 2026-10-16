'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Crown,
  ArrowLeft,
  Sparkles,
  Clock,
  Award,
  Music,
  PartyPopper,
  Calendar,
  Camera,
  MessageCircle,
  History,
  Wheat,
} from 'lucide-react';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';

export default function FiestaDelMaizPage() {
  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-24 pt-4 sm:pt-6 px-3 sm:px-6">
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

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-xs">
              Próximamente
            </span>
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
              Alcira Gigena • Identidad y Tradición
            </span>
          </div>
        </div>

        {/* Banner Principal Institucional */}
        <div className="bg-gradient-to-br from-[#1C1917] via-[#78350F] to-[#CA8A04] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/20">
          <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none w-48 h-48 sm:w-64 sm:h-64">
            <Image
              src="/images/logo-biblioteca.png"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-200 border border-yellow-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-yellow-300" />
              <span>El Gran Homenaje a la Tierra y su Gente</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md">
                <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Fiesta Nacional del Maíz y la Cosecha Gruesa
                </h1>
                <p className="text-xs sm:text-sm text-yellow-100 mt-1 max-w-xl leading-relaxed">
                  El evento mayor de Alcira Gigena: reinas consagradas, grandes artistas invitados, desfiles de carrozas, exposiciones agropecuarias y los momentos más emotivos de su historia.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estado: Próximamente y Adelanto de Contenidos */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-blue-200/80 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Nuestra fiesta más representativa en la era digital</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              ¿Qué vas a revivir en esta sección especial?
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Un recorrido histórico y multimedia por cada una de las ediciones de la celebración que llena de orgullo a todo el sur cordobés.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FEFCE8] border border-yellow-200 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-yellow-100 text-yellow-900 flex items-center justify-center font-bold">
                <Crown className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Galería de Reinas y Soberanas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Registro fotográfico de todas las Reinas Nacionales, Virreinas y Princesas consagradas edición tras edición, con sus atributos, coronaciones y el orgullo de representar a nuestro pueblo.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FEFCE8] border border-yellow-200 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-yellow-100 text-yellow-900 flex items-center justify-center font-bold">
                <Music className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Artistas y Shows Inolvidables
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Las grandes figuras del folklore argentino, la música popular, el cuarteto, el pop y el humor que pisaron el escenario principal del Club Roncedo ante multitudes de espectadores.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FEFCE8] border border-yellow-200 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-yellow-100 text-yellow-900 flex items-center justify-center font-bold">
                <PartyPopper className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Desfiles de Carrozas y Colectividades
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Imágenes de las tradicionales carrozas ornamentadas por instituciones, comercios y escuelas, el colorido de las comparsas y el desfile cívico por las calles de Alcira Gigena.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FEFCE8] border border-yellow-200 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-yellow-100 text-yellow-900 flex items-center justify-center font-bold">
                <History className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Reconocimiento al Productor Agropecuario
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                La historia de la cosecha récord, las muestras industriales y comerciales, las premiaciones de granos y el homenaje perenne a los pioneros del campo que hicieron grande a la región.
              </p>
            </div>
          </div>

          {/* Tarjeta de Aporte Histórico */}
          <div className="rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                Archivo de la Fiesta
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                ¿Tenés fotos de reinas, programas o entradas de ediciones pasadas?
              </h4>
              <p className="text-xs text-slate-600 max-w-lg">
                Si fuiste reina, princesa, integrante de comisión, o si guardás afiches, fotos o filmaciones de la Fiesta Nacional del Maíz, contactanos para sumar tu recuerdo al museo virtual.
              </p>
            </div>

            <a
              href={`https://wa.me/${CONTACTO_BIBLIOTECA.telefonoRaw}?text=${encodeURIComponent(
                '¡Hola! Tengo fotos / recuerdos de ediciones pasadas de la Fiesta Nacional del Maíz y la Cosecha Gruesa.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Aportar Recuerdos de la Fiesta</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
