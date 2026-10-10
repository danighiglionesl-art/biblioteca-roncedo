'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Download,
  RotateCcw,
  RotateCw,
  Music,
  Radio,
  Disc3,
  Sparkles,
  Share2,
  Check,
  Award,
  Layers,
} from 'lucide-react';

export interface MarchaTrack {
  id: string;
  titulo: string;
  subtitulo: string;
  artista: string;
  duracionEstimada: string;
  src: string;
  descripcion: string;
  badge: string;
  colorGradiente: string;
  tipo: 'tradicional' | 'chebere';
  detalles: string;
}

const MARCHAS: MarchaTrack[] = [
  {
    id: 'tradicional',
    titulo: 'Marcha Oficial Tradicional',
    subtitulo: 'Versión Solemne e Histórica',
    artista: 'Club Sp. y B. Dr. Lautaro Roncedo',
    duracionEstimada: '2:20',
    src: '/audios/marchaoriginal.mp3',
    descripcion:
      'La marcha institucional original que ha acompañado los grandes hitos, aniversarios y el fervor de varias generaciones en Alcira Gigena.',
    badge: 'Himno Histórico',
    colorGradiente: 'from-amber-600/30 via-slate-800 to-slate-900',
    tipo: 'tradicional',
    detalles: 'Banda y Coro Oficial • Registro Patrimonial',
  },
  {
    id: 'chebere',
    titulo: 'Marcha Versión Cuarteto Chébere',
    subtitulo: 'Grabación Especial de la Legendaria Orquesta',
    artista: 'Chébere (Córdoba)',
    duracionEstimada: '2:25',
    src: '/audios/marchachebere.mp3',
    descripcion:
      'Inmortalizada al ritmo característico del cuarteto cordobés por la orquesta Chébere. Un clásico festivo infaltable que enciende las tribunas albicelestes.',
    badge: 'Versión Cuarteto',
    colorGradiente: 'from-blue-600/30 via-slate-800 to-slate-900',
    tipo: 'chebere',
    detalles: 'Orquesta Chébere • Sello Popular Cordobés',
  },
];

export function MarchasRoncedoPlayer() {
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeTrack = MARCHAS[activeTrackIndex];

  // Configuración y eventos del elemento de audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [activeTrackIndex]);

  // Manejar cambio de volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
    } catch (err) {
      console.error('Error al reproducir audio:', err);
    }
  };

  const selectTrack = async (index: number) => {
    if (index === activeTrackIndex) {
      togglePlay();
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setActiveTrackIndex(index);
    setCurrentTime(0);
    setIsPlaying(false);

    // Permitir actualización de fuente y reproducción automática suave
    setTimeout(async () => {
      if (audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err) {
          console.error('Autoplay prevenido:', err);
        }
      }
    }, 100);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const seekRelative = (seconds: number) => {
    if (!audioRef.current) return;
    const target = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration || 9999);
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleShare = async (track: MarchaTrack) => {
    const shareData = {
      title: `${track.titulo} - Club Lautaro Roncedo`,
      text: `Escuchá la ${track.titulo} (${track.subtitulo}) de la Biblioteca y Club Dr. Lautaro Roncedo.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback a portapapeles
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Elemento de audio nativo oculto */}
      <audio
        ref={audioRef}
        src={activeTrack.src}
        preload="metadata"
      />

      {/* Título de la sección musical */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-roncedo-gold">
            <Disc3 className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Marchas del Club Lautaro Roncedo</span>
              <span className="text-[10px] uppercase font-bold text-roncedo-gold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                Archivo Sonoro
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Patrimonio musical e himnos que forjaron la identidad albiceleste en Alcira Gigena
            </p>
          </div>
        </div>

        {copiedShare && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl self-start sm:self-auto">
            <Check className="w-3.5 h-3.5" /> Enlace copiado al portapapeles
          </span>
        )}
      </div>

      {/* Tarjetas de Selección Rápida de las 2 Marchas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MARCHAS.map((track, idx) => {
          const isCurrent = activeTrackIndex === idx;
          const isCurrentlyPlaying = isCurrent && isPlaying;

          return (
            <div
              key={track.id}
              onClick={() => selectTrack(idx)}
              className={`group cursor-pointer rounded-2xl p-4 sm:p-5 transition-all duration-300 border relative overflow-hidden flex flex-col justify-between ${
                isCurrent
                  ? 'bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border-amber-500/50 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/30'
                  : 'bg-white/5 hover:bg-white/[0.08] border-white/10 hover:border-white/20'
              }`}
            >
              {/* Resplandor decorativo de fondo */}
              <div
                className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-opacity ${
                  track.tipo === 'tradicional'
                    ? 'bg-amber-500/15 group-hover:opacity-100 opacity-60'
                    : 'bg-blue-500/15 group-hover:opacity-100 opacity-60'
                }`}
              />

              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                      track.tipo === 'tradicional'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}
                  >
                    {track.tipo === 'tradicional' ? (
                      <Award className="w-3 h-3 text-amber-300" />
                    ) : (
                      <Radio className="w-3 h-3 text-blue-300" />
                    )}
                    {track.badge}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400 bg-black/30 px-2 py-0.5 rounded-md border border-white/5">
                    {track.duracionEstimada} min
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-200 transition-colors">
                  {track.titulo}
                </h3>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">
                  {track.subtitulo}
                </p>
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {track.descripcion}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectTrack(idx);
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isCurrentlyPlaying
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                        : isCurrent
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    aria-label={isCurrentlyPlaying ? 'Pausar' : 'Reproducir'}
                  >
                    {isCurrentlyPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-200">
                      {isCurrentlyPlaying ? 'Reproduciendo ahora' : isCurrent ? 'Pista Seleccionada' : 'Hacer clic para escuchar'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {track.detalles}
                    </span>
                  </div>
                </div>

                {/* Ecualizador animado si está sonando */}
                {isCurrentlyPlaying && (
                  <div className="flex items-end gap-1 h-4 px-2">
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce h-3" style={{ animationDuration: '0.6s' }} />
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce h-4" style={{ animationDuration: '0.8s', animationDelay: '0.2s' }} />
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2" style={{ animationDuration: '0.5s', animationDelay: '0.4s' }} />
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce h-3.5" style={{ animationDuration: '0.7s', animationDelay: '0.1s' }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reproductor Principal Ampliado y Control Central */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950/80 rounded-3xl p-5 sm:p-7 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        {/* Adorno superior con Escudo / Emblema */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
              <Image
                src="/images/escudo-roncedo.png"
                alt="Escudo Club Roncedo"
                width={56}
                height={56}
                className="object-contain drop-shadow"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-roncedo-gold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {activeTrack.badge}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  • {activeTrack.artista}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {activeTrack.titulo}
              </h3>
              <p className="text-xs text-slate-300">
                {activeTrack.subtitulo}
              </p>
            </div>
          </div>

          {/* Acciones de Pista: Compartir y Descargar */}
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              type="button"
              onClick={() => handleShare(activeTrack)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-white/10 transition-colors"
              title="Compartir marcha"
            >
              <Share2 className="w-3.5 h-3.5 text-roncedo-gold" />
              <span className="hidden sm:inline">Compartir</span>
            </button>

            <a
              href={activeTrack.src}
              download={`${activeTrack.titulo.replace(/\s+/g, '_')}.mp3`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-roncedo-gold hover:bg-amber-400 px-3.5 py-2 rounded-xl transition-all shadow-md shadow-amber-500/20"
              title="Descargar archivo de audio MP3"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar MP3</span>
            </a>
          </div>
        </div>

        {/* Barra de Progreso y Tiempo */}
        <div className="pt-5 space-y-2">
          <div className="relative group">
            {/* Barra de progreso visual con fondo estilizado */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-750 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
              style={{
                background: `linear-gradient(to right, #C99A2C ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%)`,
              }}
              aria-label="Progreso del audio"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : activeTrack.duracionEstimada}</span>
          </div>
        </div>

        {/* Panel de Controles: Play, Skip, Volumen */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Controles de Reproducción Centrales */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            {/* Retroceder 10s */}
            <button
              type="button"
              onClick={() => seekRelative(-10)}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="Retroceder 10 segundos"
              aria-label="Retroceder 10 segundos"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play / Pause Principal */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-13 h-13 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30 transition-transform active:scale-95 gap-2"
              aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span className="text-xs uppercase tracking-wider">Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                  <span className="text-xs uppercase tracking-wider">Reproducir</span>
                </>
              )}
            </button>

            {/* Adelantar 10s */}
            <button
              type="button"
              onClick={() => seekRelative(10)}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="Adelantar 10 segundos"
              aria-label="Adelantar 10 segundos"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Control de Volumen y Estado */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <button
              type="button"
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label={isMuted ? 'Desactivar silencio' : 'Silenciar'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4 text-roncedo-gold" />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-20 sm:w-24 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
              aria-label="Control de volumen"
            />

            <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
              {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>

        {/* Reseña Histórica y Mística del Club */}
        <div className="mt-6 pt-5 border-t border-white/10 bg-black/20 -mx-5 -mb-5 sm:-mx-7 sm:-mb-7 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-roncedo-gold flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-roncedo-goldLight">
                Memoria Sonora y Pasión Comunitaria
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                La marcha del Club Lautaro Roncedo es uno de los símbolos más queridos de Alcira Gigena. Expresa el compromiso deportivo, la hermandad de sus hinchas y el legado moral del Dr. Lautaro Roncedo. La versión original atesora la emoción clásica de los festejos institucionales, mientras que la grabación de la orquesta Chébere plasma con ritmo y alegría la identidad popular cordobesa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
