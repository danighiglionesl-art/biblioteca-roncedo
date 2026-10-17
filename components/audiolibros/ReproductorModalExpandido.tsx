'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Clock,
  Heart,
  ChevronDown,
  ListMusic,
  Gauge,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { useAudioPlayer } from '@/lib/context/AudioPlayerContext';
import { VelocidadReproduccion, SleepTimerOption } from '@/types/audiolibros';
import { SocialInteractionsBlock } from '@/components/social/SocialInteractionsBlock';

export function ReproductorModalExpandido() {
  const {
    audiolibroActual,
    capituloActual,
    isPlaying,
    isLoadingAudio,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    sleepTimerMode,
    sleepTimerRemaining,
    isPlayerExpanded,
    setIsPlayerExpanded,
    togglePlayPause,
    adelantar15,
    retroceder15,
    seekTo,
    setVelocidad,
    setVolumen,
    toggleMute,
    siguienteCapitulo,
    anteriorCapitulo,
    cambiarCapitulo,
    setSleepTimer,
    toggleFavorito,
    isFavorito,
  } = useAudioPlayer();

  const [mostrarListaCapitulos, setMostrarListaCapitulos] = useState(false);
  const [mostrarMenuVelocidad, setMostrarMenuVelocidad] = useState(false);
  const [mostrarMenuSleep, setMostrarMenuSleep] = useState(false);

  if (!isPlayerExpanded || !audiolibroActual || !capituloActual) {
    return null;
  }

  const formatTiempo = (seg: number) => {
    if (isNaN(seg) || seg < 0) return '0:00';
    const minutos = Math.floor(seg / 60);
    const segundos = Math.floor(seg % 60);
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  };

  const durTotal = duration || capituloActual.duracion_segundos || 1;
  const progresoPorcentaje = Math.min(100, Math.max(0, (currentTime / durTotal) * 100));

  const velocidades: VelocidadReproduccion[] = [0.75, 1, 1.25, 1.5, 2];
  const opcionesSleep: { label: string; valor: SleepTimerOption }[] = [
    { label: 'Desactivado', valor: null },
    { label: '15 minutos', valor: 15 },
    { label: '30 minutos', valor: 30 },
    { label: '45 minutos', valor: 45 },
    { label: '60 minutos (1 hora)', valor: 60 },
    { label: 'Al terminar capítulo', valor: 'fin_capitulo' },
  ];

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${audiolibroActual.titulo} - Audiolibro en Biblioteca Roncedo`,
          text: `Escuchá "${audiolibroActual.titulo}" de ${audiolibroActual.autor} en la Biblioteca Roncedo.`,
          url: window.location.href,
        });
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0F284B] via-[#143765] to-[#0A1B33] text-white rounded-3xl shadow-2xl border border-white/15 overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Cabecera del Reproductor Expandido */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
          <button
            onClick={() => setIsPlayerExpanded(false)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Minimizar reproductor"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          <div className="text-center px-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-roncedo-gold block">
              Biblioteca Roncedo Streaming
            </span>
            <span className="text-xs font-semibold text-blue-200 truncate max-w-[220px] block">
              {audiolibroActual.genero}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleFavorito(audiolibroActual.id)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              title={isFavorito(audiolibroActual.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorito(audiolibroActual.id) ? 'fill-rose-500 text-rose-500' : 'text-white'
                }`}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              title="Compartir audiolibro"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {/* Portada Central con Relieve */}
          <div className="relative w-48 h-48 sm:w-60 sm:h-60 mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-900 group">
            <Image
              src={audiolibroActual.portada_url || '/images/logo-biblioteca.png'}
              alt={audiolibroActual.titulo}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
            {isLoadingAudio && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-roncedo-gold border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Información de la Obra */}
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-black leading-tight tracking-tight text-white line-clamp-2">
              {audiolibroActual.titulo}
            </h2>
            <p className="text-sm font-semibold text-roncedo-celesteLight">
              {audiolibroActual.autor}
            </p>
            <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-medium text-blue-200">
              <span className="text-roncedo-gold font-bold">Cap. {capituloActual.numero}</span>
              <span>•</span>
              <span className="truncate max-w-[240px]">{capituloActual.titulo}</span>
            </div>
          </div>

          {/* Barra de Progreso y Tiempos */}
          <div className="space-y-1.5 pt-2">
            <div
              className="relative w-full h-3 bg-white/15 rounded-full cursor-pointer overflow-hidden group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = clickX / rect.width;
                seekTo(ratio * durTotal);
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-roncedo-celeste via-roncedo-gold to-amber-400 rounded-full transition-all relative"
                style={{ width: `${progresoPorcentaje}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-blue-200 px-1">
              <span>{formatTiempo(currentTime)}</span>
              <span>-{formatTiempo(Math.max(0, durTotal - currentTime))}</span>
            </div>
          </div>

          {/* Controles Principales de Reproducción */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 pt-1">
            {/* Capítulo anterior */}
            <button
              onClick={anteriorCapitulo}
              className="p-2.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title="Capítulo anterior"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Retroceder 15s */}
            <button
              onClick={retroceder15}
              className="p-2.5 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition-colors relative"
              title="Retroceder 15 segundos"
            >
              <RotateCcw className="w-6 h-6" />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black pt-1">
                15
              </span>
            </button>

            {/* Play / Pausa Principal */}
            <button
              onClick={togglePlayPause}
              disabled={isLoadingAudio}
              className="w-16 h-16 rounded-full bg-roncedo-gold hover:bg-amber-400 text-roncedo-navy flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current ml-1" />
              )}
            </button>

            {/* Adelantar 15s */}
            <button
              onClick={adelantar15}
              className="p-2.5 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition-colors relative"
              title="Adelantar 15 segundos"
            >
              <RotateCw className="w-6 h-6" />
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black pt-1">
                15
              </span>
            </button>

            {/* Capítulo siguiente */}
            <button
              onClick={siguienteCapitulo}
              className="p-2.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title="Capítulo siguiente"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Controles de Utilidad: Velocidad, Temporizador, Capítulos y Volumen */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-blue-200">
            {/* Selector de Velocidad */}
            <div className="relative">
              <button
                onClick={() => {
                  setMostrarMenuVelocidad(!mostrarMenuVelocidad);
                  setMostrarMenuSleep(false);
                  setMostrarListaCapitulos(false);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 font-bold flex items-center gap-1 transition-colors"
              >
                <Gauge className="w-3.5 h-3.5 text-roncedo-gold" />
                <span>{playbackRate}x</span>
              </button>

              {mostrarMenuVelocidad && (
                <div className="absolute bottom-full left-0 mb-2 bg-[#0C1E38] border border-white/20 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 z-20 min-w-[90px]">
                  {velocidades.map((vel) => (
                    <button
                      key={vel}
                      onClick={() => {
                        setVelocidad(vel);
                        setMostrarMenuVelocidad(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-left font-bold text-xs transition-colors ${
                        playbackRate === vel
                          ? 'bg-roncedo-gold text-roncedo-navy'
                          : 'hover:bg-white/10 text-white'
                      }`}
                    >
                      {vel}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Temporizador de Apagado (Sleep Timer) */}
            <div className="relative">
              <button
                onClick={() => {
                  setMostrarMenuSleep(!mostrarMenuSleep);
                  setMostrarMenuVelocidad(false);
                  setMostrarListaCapitulos(false);
                }}
                className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors ${
                  sleepTimerMode ? 'bg-amber-400 text-slate-900' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Temporizador de apagado"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {sleepTimerRemaining ? `${sleepTimerRemaining}m` : sleepTimerMode ? 'Fin cap.' : 'Dormir'}
                </span>
              </button>

              {mostrarMenuSleep && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0C1E38] border border-white/20 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 z-20 min-w-[160px]">
                  <span className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase">
                    Apagar reproducción en:
                  </span>
                  {opcionesSleep.map((opc) => (
                    <button
                      key={String(opc.valor)}
                      onClick={() => {
                        setSleepTimer(opc.valor);
                        setMostrarMenuSleep(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-left font-bold text-xs transition-colors ${
                        sleepTimerMode === opc.valor
                          ? 'bg-roncedo-gold text-roncedo-navy'
                          : 'hover:bg-white/10 text-white'
                      }`}
                    >
                      {opc.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lista de Capítulos */}
            <div className="relative">
              <button
                onClick={() => {
                  setMostrarListaCapitulos(!mostrarListaCapitulos);
                  setMostrarMenuVelocidad(false);
                  setMostrarMenuSleep(false);
                }}
                className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors ${
                  mostrarListaCapitulos ? 'bg-roncedo-blue text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title="Ver lista de capítulos"
              >
                <ListMusic className="w-3.5 h-3.5 text-roncedo-celesteLight" />
                <span>Capítulos ({(audiolibroActual.capitulos || []).length})</span>
              </button>

              {mostrarListaCapitulos && (
                <div className="absolute bottom-full right-0 mb-2 bg-[#0C1E38] border border-white/20 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 z-20 w-72 max-h-60 overflow-y-auto">
                  <span className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
                    Seleccionar Capítulo:
                  </span>
                  {(audiolibroActual.capitulos || []).map((cap) => (
                    <button
                      key={cap.id}
                      onClick={() => {
                        cambiarCapitulo(cap.numero);
                        setMostrarListaCapitulos(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between gap-2 ${
                        capituloActual.id === cap.id
                          ? 'bg-roncedo-navy border border-roncedo-gold text-roncedo-gold font-bold'
                          : 'hover:bg-white/10 text-white font-medium'
                      }`}
                    >
                      <span className="truncate">
                        {cap.numero}. {cap.titulo}
                      </span>
                      <span className="text-[10px] opacity-70 whitespace-nowrap">{cap.duracion_texto}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Control Rápido de Volumen */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Atribución y Licencia Legal */}
          <div className="pt-2 text-center text-[10px] text-blue-300/70 space-y-0.5">
            <p>
              Fuente oficial: <strong>{audiolibroActual.fuente_nombre}</strong> • Licencia:{' '}
              {audiolibroActual.licencia}
            </p>
            <p className="text-white/40">
              Reproducción streaming directa integrada en la PWA de Biblioteca Roncedo.
            </p>
          </div>

          {/* Reacciones y Comentarios de la Comunidad (Red Social) */}
          <div className="pt-4 border-t border-white/10 text-left">
            <SocialInteractionsBlock
              seccion="audiolibros"
              itemId={audiolibroActual.id}
              tituloContenido={`${audiolibroActual.titulo} - ${audiolibroActual.autor}`}
              modoOscuro={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
