'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trophy,
  ArrowLeft,
  Sparkles,
  Clock,
  Calendar,
  Users,
  Award,
  Medal,
  CheckCircle2,
  Shield,
  MessageCircle,
} from 'lucide-react';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';

export default function InferioresPage() {
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
            <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-300 px-2.5 py-0.5 rounded-full shadow-xs">
              Próximamente
            </span>
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
              Club Roncedo • Fútbol Formativo
            </span>
          </div>
        </div>

        {/* Banner Principal Institucional */}
        <div className="bg-gradient-to-br from-[#0B2545] via-[#134074] to-[#1D4ED8] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/20">
          <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none w-48 h-48 sm:w-64 sm:h-64">
            <Image
              src="/images/escudo-roncedo.png"
              alt="Escudo"
              fill
              className="object-contain"
            />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-sky-400/20 text-sky-200 border border-sky-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-sky-300" />
              <span>Semillero Albiceleste en la App</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Divisiones Inferiores
                </h1>
                <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xl leading-relaxed">
                  Toda la información del fútbol formativo del Club Sp. y B. Dr. Lautaro Roncedo: tablas de posiciones, cronograma de partidos, fixture, resultados y tabla de goleadores.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estado: Próximamente y Adelanto de Contenidos */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-blue-200/80 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-roncedo-navy">
              <Sparkles className="w-4 h-4 text-roncedo-celeste" />
              <span>El futuro de nuestro Club al alcance de tu mano</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              ¿Qué vas a poder seguir en este módulo?
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Un seguimiento completo de todas las categorías infantiles y juveniles en la Liga Regional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#F0F7FF] border border-blue-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <Medal className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Tablas de Posiciones Oficiales
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tablas actualizadas fecha a fecha por cada categoría: Sub-17, Sub-15, Sub-13 y categorías promocionales con puntos, partidos jugados y diferencia de goles.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0F7FF] border border-blue-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Goleadores y Estadísticas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Top de artilleros de cada categoría, valla menos vencida y estadísticas destacadas del semillero roncedista en la temporada.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0F7FF] border border-blue-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Fixture y Próxima Fecha
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Conocé con anticipación los rivales, sedes de juego (local o visitante), canchas asignadas y horarios de cada partido del fin de semana.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0F7FF] border border-blue-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <Users className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Cuerpo Técnico y Categorías
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nómina de profesores, preparadores físicos, coordinadores deportivos y planteles completos que defienden la camiseta albiceleste.
              </p>
            </div>
          </div>

          {/* Tarjeta de Acompañamiento a Juveniles */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-200/80 px-2.5 py-0.5 rounded-full">
                Subcomisión de Fútbol Infantil
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                ¿Querés enviar fotos o resultados de la jornada?
              </h4>
              <p className="text-xs text-slate-600 max-w-lg">
                Familias y delegados pueden acercar resultados, fotos de los equipos y novedades para ser publicadas en la plataforma oficial del Club.
              </p>
            </div>

            <a
              href={`https://wa.me/${CONTACTO_BIBLIOTECA.telefonoRaw}?text=${encodeURIComponent(
                '¡Hola! Me comunico por información o resultados de las Divisiones Inferiores del Club Roncedo.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar a la Subcomisión</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
