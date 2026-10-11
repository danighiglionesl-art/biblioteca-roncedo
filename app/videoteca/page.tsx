'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Film,
  Video,
  ArrowLeft,
  Sparkles,
  Clock,
  PlayCircle,
  MessageCircle,
  Tv,
  Award,
  Users,
} from 'lucide-react';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';

export default function VideotecaPage() {
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
            <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-full shadow-xs">
              Próximamente
            </span>
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
              Biblioteca Roncedo • Archivo Videográfico
            </span>
          </div>
        </div>

        {/* Banner Principal Institucional */}
        <div className="bg-gradient-to-br from-[#1E1B4B] via-[#2E1065] to-[#4338CA] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/20">
          <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none w-48 h-48 sm:w-64 sm:h-64">
            <Image
              src="/images/logo-biblioteca.png"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-purple-400/20 text-purple-200 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-purple-300" />
              <span>Memoria Audiovisual en Restauración</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md">
                <Video className="w-7 h-7 sm:w-8 sm:h-8 text-purple-300" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Archivo Videográfico
                </h1>
                <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-xl leading-relaxed">
                  Videos históricos de eventos, partidos inolvidables, celebraciones patronales, aniversarios institucionales y testimonios de protagonistas de la historia de Roncedo (Videoteca).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estado: Próximamente y Adelanto de Contenidos */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-blue-200/80 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-roncedo-navy">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Patrimonio en Cinta y Digital</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              ¿Qué podrás revivir en la Videoteca?
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Un archivo fílmico y en video para que toda la comunidad pueda acceder a momentos imborrables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#F8F7FF] border border-purple-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <PlayCircle className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Partidos y Hazañas Deportivas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Resúmenes fílmicos, finales históricas, goles recordados y consagraciones de primera división e inferiores en la Liga Regional.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F7FF] border border-purple-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Tv className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Cenas, Festejos y Aniversarios
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Grabaciones de veladas artísticas, kermeses, aniversarios oficiales del Club y eventos culturales organizados por la Biblioteca.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F7FF] border border-purple-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Users className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Testimonios y Voces Albicelestes
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Entrevistas en video y relatos orales de directivos históricos, vecinos ilustres, profesores y glorias deportivas de Alcira Gigena.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F7FF] border border-purple-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <Film className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Restauración de Cintas VHS y Súper 8
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Conversión digital de soportes magnéticos analógicos para preservar la imagen y sonido contra el paso del tiempo.
              </p>
            </div>
          </div>

          {/* Tarjeta de Aporte de Videos Familiares */}
          <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 bg-purple-200/70 px-2.5 py-0.5 rounded-full">
                Campaña de Preservación
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                ¿Tenés casetes VHS, DVD o videos caseros con eventos del Club?
              </h4>
              <p className="text-xs text-slate-600 max-w-lg">
                La biblioteca cuenta con equipamiento para digitalizarlos sin costo para tu familia y sumarlos al archivo histórico comunitario.
              </p>
            </div>

            <a
              href={`https://wa.me/${CONTACTO_BIBLIOTECA.telefonoRaw}?text=${encodeURIComponent(
                '¡Hola! Tengo videos/grabaciones históricas de eventos de Roncedo y me gustaría compartirlos para la Videoteca.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-purple-800 hover:bg-purple-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Sumar mi Video</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
