'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageSquareHeart,
  ArrowLeft,
  Sparkles,
  Clock,
  Heart,
  Users,
  Mic,
  BookOpen,
  Volume2,
  Share2,
  MessageCircle,
  History,
} from 'lucide-react';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';

export default function AnecdotarioPage() {
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
            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300 px-2.5 py-0.5 rounded-full shadow-xs">
              Próximamente
            </span>
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
              Club Roncedo • Memoria Oral y Popular
            </span>
          </div>
        </div>

        {/* Banner Principal Institucional */}
        <div className="bg-gradient-to-br from-[#1E293B] via-[#4C1D95] to-[#BE185D] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/20">
          <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none w-48 h-48 sm:w-64 sm:h-64">
            <Image
              src="/images/escudo-roncedo.png"
              alt="Escudo"
              fill
              className="object-contain"
            />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-rose-400/20 text-rose-200 border border-rose-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-rose-300" />
              <span>Espacio de Historias y Relatos Populares</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md">
                <MessageSquareHeart className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Anecdotario de Hinchas
                </h1>
                <p className="text-xs sm:text-sm text-rose-100 mt-1 max-w-xl leading-relaxed">
                  Historias, recuerdos y anécdotas contadas en primera persona por sus protagonistas o recreadas por familiares, amigos y testigos de la pasión albiceleste.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estado: Próximamente y Adelanto de Contenidos */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-blue-200/80 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-800">
              <Sparkles className="w-4 h-4 text-rose-600" />
              <span>La voz de la tribuna y el corazón del pueblo</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              ¿Qué tipo de relatos vamos a compartir?
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              El Club no solo se construye con trofeos y actas; vive en la memoria afectiva y los momentos inolvidables de su gente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-rose-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-900 flex items-center justify-center font-bold">
                <Users className="w-5 h-5 text-rose-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Relatos en Primera Persona
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Testimonios directos de exjugadores, directores técnicos, utileros, simpatizantes de toda la vida y colaboradores incansables que dejaron su huella en el Club.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-rose-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-900 flex items-center justify-center font-bold">
                <History className="w-5 h-5 text-rose-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Historias Contadas por Terceros
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hijos que recuerdan las hazañas de sus padres, nietos que atesoran las vivencias de sus abuelos hinchas y homenajes a personajes entrañables del pueblo.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-rose-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-900 flex items-center justify-center font-bold">
                <Heart className="w-5 h-5 text-rose-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Viajes Inolvidables y Clásicos Calientes
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Las caravanas en camiones por caminos de tierra, las tardes de lluvia en canchas ajenas, las cábalas más insólitas y la emoción eterna del gol en tiempo de descuento.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-rose-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-900 flex items-center justify-center font-bold">
                <Volume2 className="w-5 h-5 text-rose-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Lectura y Audios de Memoria Oral
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cada anécdota podrá ser leída como una crónica literaria o escuchada directamente con la voz y el tono de quien la vivió en su propia piel.
              </p>
            </div>
          </div>

          {/* Tarjeta de Aporte de Relatos */}
          <div className="rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-900 bg-rose-200/80 px-2.5 py-0.5 rounded-full">
                Sumá tu historia
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                ¿Tenés una anécdota o recuerdo especial de Roncedo para compartir?
              </h4>
              <p className="text-xs text-slate-600 max-w-lg">
                Podés escribirnos un mensaje o enviarnos un audio de voz por WhatsApp contando tu historia. Desde el equipo de la Biblioteca nos encargamos de transcribirla y preservarla.
              </p>
            </div>

            <a
              href={`https://wa.me/${CONTACTO_BIBLIOTECA.telefonoRaw}?text=${encodeURIComponent(
                '¡Hola! Quiero compartir una anécdota / historia para el Anecdotario de Hinchas de Roncedo.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex-shrink-0"
            >
              <Mic className="w-4 h-4" />
              <span>Enviar mi Anécdota</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
