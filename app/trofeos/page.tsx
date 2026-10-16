'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trophy,
  ArrowLeft,
  Sparkles,
  Clock,
  Award,
  Medal,
  Calendar,
  Shield,
  MessageCircle,
  Camera,
  History,
  Star,
} from 'lucide-react';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';

export default function TrofeosPage() {
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
              Club Roncedo • Vitrina de Campeonatos
            </span>
          </div>
        </div>

        {/* Banner Principal Institucional */}
        <div className="bg-gradient-to-br from-[#0B2545] via-[#143B6B] to-[#B45309] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/20">
          <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none w-48 h-48 sm:w-64 sm:h-64">
            <Image
              src="/images/escudo-roncedo.png"
              alt="Escudo Oficial Roncedo"
              fill
              className="object-contain"
            />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-200 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Vitrina Histórica Digital en Preparación</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Copas y Trofeos
                </h1>
                <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-xl leading-relaxed">
                  Fotos de copas y trofeos con sus historias, anécdotas, vueltas olímpicas y recuerdos inolvidables de los campeonatos del Club Sp. y Bibl. Dr. Lautaro Roncedo.
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
              <span>Un siglo de hazañas deportivas rescatadas del olvido</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              ¿Qué vas a encontrar en la Vitrina de Trofeos?
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Estamos fotografiando, catalogando y documentando cada trofeo que descansa en nuestra sede social.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#F0F7FF] border border-blue-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Camera className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Galería Fotográfica en Alta Definición
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fotografías en primer plano de cada copa, plaqueta, medalla y trofeo histórico, con detalles de su orfebrería, grabados originales y estado de conservación.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0F7FF] border border-blue-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <History className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                La Historia Detrás de Cada Conquista
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ficha detallada por torneo: fecha de la final, rivales, resultado del partido consagratorio, formación del equipo campeón, cuerpo técnico y goleadores.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0F7FF] border border-blue-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Star className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Anécdotas y Festejos Populares
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Los entretelones del vestuario, los viajes épicos de la hinchada por la región, las caravanas por las calles de Alcira Gigena y los festejos que marcaron época.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0F7FF] border border-blue-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Medal className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Todas las Disciplinas de la Institución
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fútbol de Primera y Reserva, divisiones formativas, básquetbol, bochas, tenis, atletismo y torneos interclubes que honraron la camiseta albiceleste.
              </p>
            </div>
          </div>

          {/* Tarjeta de Aporte Comunitario */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                Memoria Roncedista
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                ¿Tenés fotos de algún campeonato, vuelta olímpica o copa olvidada?
              </h4>
              <p className="text-xs text-slate-600 max-w-lg">
                Queremos que ningún logro quede afuera. Si tenés fotos de finales, recortes de copas o relatos de familiares campeones, envianos tu testimonio.
              </p>
            </div>

            <a
              href={`https://wa.me/${CONTACTO_BIBLIOTECA.telefonoRaw}?text=${encodeURIComponent(
                '¡Hola! Tengo fotos, anécdotas o recuerdos de copas y campeonatos de Roncedo para aportar a la vitrina histórica.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Aportar Foto o Anécdota</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
