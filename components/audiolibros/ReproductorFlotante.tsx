'use client';

import React from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  RotateCw,
  X,
  ChevronUp,
  Headphones,
  Heart,
} from 'lucide-react';
import { useAudioPlayer } from '@/lib/context/AudioPlayerContext';
import { ReproductorModalExpandido } from './ReproductorModalExpandido';

export function ReproductorFlotante() {
  const {
    audiolibroActual,
    capituloActual,
    isPlaying,
    isLoadingAudio,
    currentTime,
    duration,
    togglePlayPause,
    adelantar15,
    setIsPlayerExpanded,
    toggleFavorito,
    isFavorito,
    reproducirAudiolibro,
    cerrarReproductor,
  } = useAudioPlayer();

  if (!audiolibroActual || !capituloActual) {
    return null;
  }

  const durTotal = duration || capituloActual.duracion_segundos || 1;
  const progresoPorcentaje = Math.min(100, Math.max(0, (currentTime / durTotal) * 100));

  return (
    <>
      {/* Barra de Reproducción Persistente Flotante */}
      <aside
        aria-label="Reproductor de audiolibro"
        className="fixed bottom-16 md:bottom-3 left-2 right-2 md:left-auto md:right-4 z-40 md:w-96 bg-gradient-to-r from-[#0B2240]/95 via-[#133560]/95 to-[#1E4D88]/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-slide-up select-none"
      >
        {/* Línea Superior de Progreso Delgado */}
        <div className="w-full h-1 bg-white/15 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-roncedo-celeste via-roncedo-gold to-amber-400 transition-all duration-300"
            style={{ width: `${progresoPorcentaje}%` }}
          />
        </div>

        <div className="p-2.5 sm:p-3 flex items-center justify-between gap-3">
          {/* Portada e Información Clickeable para Expandir */}
          <div
            onClick={() => setIsPlayerExpanded(true)}
            className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group"
            title="Expandir reproductor"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/20 bg-slate-900 flex-shrink-0 shadow-md">
              <Image
                src={audiolibroActual.portada_url || '/images/logo-biblioteca.png'}
                alt={audiolibroActual.titulo}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                unoptimized
              />
              {isLoadingAudio && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-roncedo-gold border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase text-roncedo-gold tracking-wider">
                  Escuchando
                </span>
                <span className="text-[9px] text-blue-200 truncate">
                  • Cap. {capituloActual.numero}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white truncate leading-tight group-hover:text-roncedo-celesteLight transition-colors">
                {audiolibroActual.titulo}
              </h4>
              <p className="text-[10px] text-blue-100/80 truncate">
                {audiolibroActual.autor}
              </p>
            </div>
          </div>

          {/* Botones de Control Rápido */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Botón Favorito */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorito(audiolibroActual.id);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title={isFavorito(audiolibroActual.id) ? 'En favoritos' : 'Guardar'}
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorito(audiolibroActual.id) ? 'fill-rose-500 text-rose-500' : 'text-white/80'
                }`}
              />
            </button>

            {/* Adelantar 15s */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                adelantar15();
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-colors relative"
              title="+15 seg"
            >
              <RotateCw className="w-4 h-4" />
              <span className="absolute inset-0 flex items-center justify-center text-[7px] font-black pt-0.5">
                15
              </span>
            </button>

            {/* Play / Pausa */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              disabled={isLoadingAudio}
              className="w-9 h-9 rounded-full bg-roncedo-gold hover:bg-amber-400 text-roncedo-navy flex items-center justify-center shadow-md active:scale-95 transition-all"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Abrir reproductor expandido */}
            <button
              type="button"
              onClick={() => setIsPlayerExpanded(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
              title="Abrir vista completa"
            >
              <ChevronUp className="w-4 h-4 text-roncedo-celesteLight" />
            </button>

            {/* Cerrar reproductor */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cerrarReproductor();
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors ml-0.5"
              title="Cerrar reproductor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Modal Expandido Completo (tipo Spotify / Audible) */}
      <ReproductorModalExpandido />
    </>
  );
}
