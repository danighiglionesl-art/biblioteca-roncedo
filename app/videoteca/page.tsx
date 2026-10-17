'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Film,
  Video,
  ArrowLeft,
  Sparkles,
  PlayCircle,
  MessageCircle,
  Tv,
  Award,
  Users,
  Eye,
  Calendar,
  Share2,
  X,
  ExternalLink,
  Heart,
} from 'lucide-react';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';
import { SocialInteractionsBlock } from '@/components/social/SocialInteractionsBlock';
import { getResumenReaccionesSocialesSync } from '@/lib/services/socialInteractionsService';

interface VideoItem {
  id: string;
  titulo: string;
  descripcion: string;
  duracion: string;
  anio: string;
  categoria: string;
  url: string;
  thumbnail: string;
  youtubeId?: string;
}

const VIDEOS_VIDEOTECA: VideoItem[] = [
  {
    id: 'videoteca-1',
    titulo: 'Documental: 100 Años de Pasión, Libros y Deporte (1926-2026)',
    descripcion: 'Homenaje cinematográfico con testimonios de directivos, socios históricos, bibliotecarios y familias pioneras que forjaron la identidad del Club Sp. y Bibl. Dr. Lautaro Roncedo en Alcira Gigena.',
    duracion: '14:20',
    anio: '2026',
    categoria: 'Documental Centenario',
    url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
    youtubeId: 'ScMzIvxBSi4',
  },
  {
    id: 'videoteca-2',
    titulo: 'Marcha Oficial Roncedo - Versión Cuarteto Chébere',
    descripcion: 'Versión bailable grabada en Córdoba Capital por la legendaria orquesta Chébere con ritmo característico, homenajeando los colores albicelestes del Club y la Biblioteca.',
    duracion: '3:38',
    anio: '1987',
    categoria: 'Archivo Musical',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    youtubeId: 'dQw4w9WgXcQ',
  },
  {
    id: 'videoteca-3',
    titulo: 'Final Histórica y Vuelta Olímpica en la Liga Regional',
    descripcion: 'Imágenes recuperadas y digitalizadas de cintas VHS con la consagración albiceleste, el recibimiento multitudinario en Alcira Gigena y la fiesta popular en la sede.',
    duracion: '8:45',
    anio: '1993',
    categoria: 'Hazañas Deportivas',
    url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    youtubeId: 'ScMzIvxBSi4',
  },
  {
    id: 'videoteca-4',
    titulo: 'Voces de Nuestra Gente: Testimonios de la Biblioteca Popular',
    descripcion: 'Registro oral audiovisual de socias vitalicias y maestras de la localidad relatando cómo se reunían en torno a la primera sala de lectura fundada bajo la presidencia del Dr. Lautaro Roncedo.',
    duracion: '11:15',
    anio: '2016',
    categoria: 'Memorias Comunitarias',
    url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80',
    youtubeId: 'ScMzIvxBSi4',
  },
];

export default function VideotecaPage() {
  const [videoSeleccionado, setVideoSeleccionado] = useState<VideoItem | null>(null);

  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-24 pt-4 sm:pt-6 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
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
              Archivo Activo
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
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Memoria Audiovisual Digitalizada</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md">
                <Video className="w-7 h-7 sm:w-8 sm:h-8 text-purple-300" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Archivo de Videos • Videoteca Roncedo
                </h1>
                <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-xl leading-relaxed">
                  Videos históricos de eventos, partidos inolvidables, celebraciones, música y testimonios de protagonistas de la historia albiceleste. Podés reproducir cada video, reaccionar y compartir tus anécdotas como en las redes sociales.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grilla de Videos Históricos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Film className="w-5 h-5 text-purple-700" />
              <span>Cintas y Registros Disponibles</span>
            </h2>
            <span className="text-xs font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
              {VIDEOS_VIDEOTECA.length} producciones
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {VIDEOS_VIDEOTECA.map((vid) => {
              const resumenSocial = getResumenReaccionesSocialesSync('videoteca', vid.id);

              return (
                <div
                  key={vid.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-card border border-blue-200/80 hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
                >
                  {/* Thumbnail / Visual de Video */}
                  <div
                    onClick={() => setVideoSeleccionado(vid)}
                    className="relative h-48 bg-slate-950 cursor-pointer overflow-hidden flex items-center justify-center"
                  >
                    <img
                      src={vid.thumbnail}
                      alt={vid.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                      loading="lazy"
                    />

                    {/* Botón Play central */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-purple-500 transition-all border-2 border-white/40">
                        <PlayCircle className="w-8 h-8 fill-white/20" />
                      </div>
                    </div>

                    <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/75 text-white text-[11px] font-bold backdrop-blur-sm">
                      {vid.duracion}
                    </span>

                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-purple-900/80 text-purple-200 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-purple-400/30">
                      {vid.categoria}
                    </span>
                  </div>

                  {/* Cuerpo de información */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>Año {vid.anio}</span>
                      </div>

                      <h3
                        onClick={() => setVideoSeleccionado(vid)}
                        className="text-base font-black text-slate-900 hover:text-purple-700 cursor-pointer transition-colors leading-snug line-clamp-2"
                      >
                        {vid.titulo}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {vid.descripcion}
                      </p>
                    </div>

                    {/* Barra de Reacciones y Abrir */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => setVideoSeleccionado(vid)}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 font-bold transition-colors"
                      >
                        <Heart className="w-4 h-4 text-rose-500/80" />
                        <span>
                          {resumenSocial.total > 0
                            ? `${resumenSocial.total} reacciones`
                            : 'Reaccionar y Comentar'}
                        </span>
                      </button>

                      <button
                        onClick={() => setVideoSeleccionado(vid)}
                        className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 text-xs shadow-sm"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Reproducir</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tarjeta de Aporte de Videos Familiares */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-blue-200/80 space-y-4">
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

      {/* Modal Reproductor y Espacio Social del Video */}
      {videoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 text-slate-100 rounded-3xl w-full max-w-3xl max-h-[92vh] shadow-2xl flex flex-col border border-purple-500/30 overflow-hidden my-auto">
            {/* Cabecera */}
            <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 border-b border-purple-500/20 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black flex-shrink-0 shadow-md">
                  <Film className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300">
                    Archivo Videográfico • {videoSeleccionado.categoria}
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-white truncate">
                    {videoSeleccionado.titulo}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setVideoSeleccionado(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* Visor Video */}
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${videoSeleccionado.youtubeId || 'ScMzIvxBSi4'}?autoplay=1&rel=0`}
                  title={videoSeleccionado.titulo}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Datos del video */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 text-[11px]">
                    {videoSeleccionado.categoria}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold text-[11px]">
                    Año {videoSeleccionado.anio}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px]">
                    {videoSeleccionado.duracion}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {videoSeleccionado.descripcion}
                </p>
              </div>

              {/* BLOQUE SOCIAL DE REACCIONES Y COMENTARIOS ESTILO RED SOCIAL */}
              <div className="pt-2 border-t border-slate-800">
                <SocialInteractionsBlock
                  seccion="videoteca"
                  itemId={videoSeleccionado.id}
                  tituloContenido={videoSeleccionado.titulo}
                  modoOscuro={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
