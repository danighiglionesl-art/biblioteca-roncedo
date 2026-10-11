'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Newspaper,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Calendar,
  FileText,
  Clock,
  MessageCircle,
  FolderArchive,
  BookOpen,
} from 'lucide-react';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';

export default function FolletosPage() {
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
              Biblioteca Roncedo • Archivo Gráfico
            </span>
          </div>
        </div>

        {/* Banner Principal Institucional */}
        <div className="bg-gradient-to-br from-[#0F284B] via-[#1A457D] to-[#2563EB] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/20">
          <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none w-48 h-48 sm:w-64 sm:h-64">
            <Image
              src="/images/logo-biblioteca.png"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Sección en digitalización y clasificación</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md">
                <Newspaper className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Folletos y Publicaciones
                </h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl leading-relaxed">
                  Folletos históricos de eventos, programas de fiestas y bailes, publicaciones en diarios y revistas que documentan la vida social, cultural y deportiva de nuestro Club.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estado: Próximamente y Qué vas a encontrar */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-blue-200/80 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-roncedo-navy">
              <Sparkles className="w-4 h-4 text-roncedo-celeste" />
              <span>Contenido en proceso de digitalización</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              ¿Qué vas a encontrar en esta sección?
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Estamos escaneando en alta definición el archivo impreso de casi un siglo de historia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#F4F9FE] border border-blue-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-roncedo-navy flex items-center justify-center font-bold">
                <FolderArchive className="w-5 h-5 text-roncedo-celesteDark" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Folletos y Programas Históricos
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Volantes de bailes patronales, programas oficiales de cenas aniversarias, eventos deportivos y kermeses tradicionales del Club Roncedo.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F9FE] border border-blue-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-roncedo-navy flex items-center justify-center font-bold">
                <FileText className="w-5 h-5 text-roncedo-celesteDark" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Recortes de Prensa y Diarios
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apariciones periodísticas en diarios locales, regionales y provinciales con crónicas de torneos, inauguraciones de obras y homenajes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F9FE] border border-blue-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-roncedo-navy flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5 text-roncedo-celesteDark" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Revistas y Memorias Anuales
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Publicaciones institucionales, revistas oficiales de época y boletines editados por las distintas comisiones a lo largo de las décadas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F9FE] border border-blue-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-roncedo-navy flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-roncedo-celesteDark" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Visor Interactivo y Descarga
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Navegación hoja por hoja en visor HD con zoom y posibilidad de búsqueda por década, temática o evento particular.
              </p>
            </div>
          </div>

          {/* Tarjeta de Aporte Comunitario */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full">
                Colaboración Comunitaria
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                ¿Conservás folletos, revistas o recortes antiguos del Club?
              </h4>
              <p className="text-xs text-slate-600 max-w-lg">
                Ayudanos a enriquecer el archivo digital. Si tenés material gráfico en tu casa, podés traerlo para digitalizarlo o enviarnos fotos para que quede preservado para siempre.
              </p>
            </div>

            <a
              href={`https://wa.me/${CONTACTO_BIBLIOTECA.telefonoRaw}?text=${encodeURIComponent(
                '¡Hola! Tengo folletos / publicaciones antiguas del Club Roncedo y me gustaría compartirlas con la Biblioteca.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
