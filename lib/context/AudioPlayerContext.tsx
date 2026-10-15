'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Audiolibro,
  CapituloAudiolibro,
  ProgresoAudiolibro,
  VelocidadReproduccion,
  SleepTimerOption,
} from '@/types/audiolibros';
import { useAuth } from '@/lib/auth/AuthContext';

interface AudioPlayerContextType {
  audiolibroActual: Audiolibro | null;
  capituloActual: CapituloAudiolibro | null;
  isPlaying: boolean;
  isLoadingAudio: boolean;
  currentTime: number;
  duration: number;
  playbackRate: VelocidadReproduccion;
  volume: number;
  isMuted: boolean;
  sleepTimerMode: SleepTimerOption;
  sleepTimerRemaining: number | null;
  isPlayerExpanded: boolean;
  favoritosIds: string[];
  historial: ProgresoAudiolibro[];
  reproducirAudiolibro: (
    audiolibro: Audiolibro,
    capituloNumero?: number,
    segundoInicio?: number
  ) => void;
  togglePlayPause: () => void;
  adelantar15: () => void;
  retroceder15: () => void;
  seekTo: (segundos: number) => void;
  setVelocidad: (rate: VelocidadReproduccion) => void;
  setVolumen: (vol: number) => void;
  toggleMute: () => void;
  siguienteCapitulo: () => void;
  anteriorCapitulo: () => void;
  cambiarCapitulo: (numeroCapitulo: number) => void;
  setSleepTimer: (opcion: SleepTimerOption) => void;
  setIsPlayerExpanded: (abierto: boolean) => void;
  toggleFavorito: (audiolibroId: string) => void;
  isFavorito: (audiolibroId: string) => boolean;
  obtenerProgreso: (audiolibroId: string) => ProgresoAudiolibro | null;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

const STORAGE_KEY_PROGRESO = 'roncedo_audiolibros_progreso_v1';
const STORAGE_KEY_FAVORITOS = 'roncedo_audiolibros_favoritos_v1';

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [audiolibroActual, setAudiolibroActual] = useState<Audiolibro | null>(null);
  const [capituloActual, setCapituloActual] = useState<CapituloAudiolibro | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState<VelocidadReproduccion>(1);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [sleepTimerMode, setSleepTimerMode] = useState<SleepTimerOption>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  // Estados persistentes de favoritos y progreso
  const [favoritosIds, setFavoritosIds] = useState<string[]>([]);
  const [historial, setHistorial] = useState<ProgresoAudiolibro[]>([]);

  // 1. Inicializar Audio element una única vez en cliente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    // Cargar favoritos y progreso guardados
    try {
      const favRaw = localStorage.getItem(STORAGE_KEY_FAVORITOS);
      if (favRaw) setFavoritosIds(JSON.parse(favRaw));

      const histRaw = localStorage.getItem(STORAGE_KEY_PROGRESO);
      if (histRaw) setHistorial(JSON.parse(histRaw));
    } catch (e) {
      console.warn('Error leyendo almacenamiento de audiolibros:', e);
    }

    // Eventos del elemento HTML5 Audio
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onLoadedMetadata = () => {
      setIsLoadingAudio(false);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onWaiting = () => setIsLoadingAudio(true);
    const onCanPlay = () => setIsLoadingAudio(false);
    const onPlaying = () => {
      setIsPlaying(true);
      setIsLoadingAudio(false);
    };
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.pause();
    };
  }, []);

  // 2. Manejo de fin de pista (Auto-play siguiente capítulo o parar)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (sleepTimerMode === 'fin_capitulo') {
        setIsPlaying(false);
        setSleepTimerMode(null);
        setSleepTimerRemaining(null);
        return;
      }

      if (audiolibroActual && capituloActual) {
        const index = audiolibroActual.capitulos.findIndex((c) => c.id === capituloActual.id);
        if (index >= 0 && index < audiolibroActual.capitulos.length - 1) {
          const siguiente = audiolibroActual.capitulos[index + 1];
          setCapituloActual(siguiente);
          audio.src = siguiente.audio_url;
          audio.play().catch(console.warn);
        } else {
          setIsPlaying(false);
        }
      }
    };

    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [audiolibroActual, capituloActual, sleepTimerMode]);

  // 3. Persistencia periódica del punto exacto de escucha (cada 3 segundos)
  useEffect(() => {
    if (!audiolibroActual || !capituloActual || !currentTime) return;

    const interval = setInterval(() => {
      const dur = duration || capituloActual.duracion_segundos || 1;
      const nuevoProgreso: ProgresoAudiolibro = {
        audiolibro_id: audiolibroActual.id,
        audiolibro_titulo: audiolibroActual.titulo,
        audiolibro_autor: audiolibroActual.autor,
        portada_url: audiolibroActual.portada_url,
        capitulo_id: capituloActual.id,
        capitulo_numero: capituloActual.numero,
        capitulo_titulo: capituloActual.titulo,
        segundo_actual: Math.floor(currentTime),
        segundo_total: Math.floor(dur),
        porcentaje: Math.min(100, Math.round((currentTime / dur) * 100)),
        completado: currentTime >= dur - 10,
        ultima_reproduccion: new Date().toISOString(),
      };

      setHistorial((prev) => {
        const filtrado = prev.filter((p) => p.audiolibro_id !== audiolibroActual.id);
        const actualizado = [nuevoProgreso, ...filtrado].slice(0, 30);
        try {
          localStorage.setItem(STORAGE_KEY_PROGRESO, JSON.stringify(actualizado));
        } catch (e) {
          console.warn('Error guardando progreso:', e);
        }
        return actualizado;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [audiolibroActual, capituloActual, currentTime, duration]);

  // 4. Temporizador de Apagado (Sleep Timer en cuenta regresiva)
  useEffect(() => {
    if (!sleepTimerRemaining || sleepTimerRemaining <= 0) return;

    const timer = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (!prev || prev <= 1) {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          setIsPlaying(false);
          setSleepTimerMode(null);
          return null;
        }
        return prev - 1;
      });
    }, 60000); // Decrementar cada minuto

    return () => clearInterval(timer);
  }, [sleepTimerRemaining]);

  // 5. Integración con MediaSession API (Segundo plano y controles de pantalla de bloqueo)
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    if (!audiolibroActual || !capituloActual) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: capituloActual.titulo,
        artist: audiolibroActual.autor,
        album: `Biblioteca Roncedo • ${audiolibroActual.titulo}`,
        artwork: [
          {
            src: audiolibroActual.portada_url || '/images/logo-biblioteca.png',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play().catch(console.warn);
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current?.pause();
      });

      navigator.mediaSession.setActionHandler('seekbackward', () => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
        }
      });

      navigator.mediaSession.setActionHandler('seekforward', () => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(
            audioRef.current.duration || Infinity,
            audioRef.current.currentTime + 15
          );
        }
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        anteriorCapitulo();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        siguienteCapitulo();
      });
    } catch (e) {
      console.warn('Error configurando MediaSession:', e);
    }
  }, [audiolibroActual, capituloActual]);

  // ---------------------------------------------------------------------------
  // ACCIONES PRINCIPALES DEL REPRODUCTOR
  // ---------------------------------------------------------------------------
  const reproducirAudiolibro = useCallback(
    (audiolibro: Audiolibro, capituloNumero?: number, segundoInicio?: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      const caps = audiolibro.capitulos || [];
      if (caps.length === 0) return;

      let capSeleccionado = caps[0];
      if (capituloNumero) {
        const encontrado = caps.find((c) => c.numero === capituloNumero);
        if (encontrado) capSeleccionado = encontrado;
      }

      setAudiolibroActual(audiolibro);
      setCapituloActual(capSeleccionado);
      setIsLoadingAudio(true);

      audio.src = capSeleccionado.audio_url;
      audio.playbackRate = playbackRate;
      audio.volume = isMuted ? 0 : volume;

      audio.oncanplay = () => {
        if (segundoInicio && segundoInicio > 0) {
          audio.currentTime = segundoInicio;
        }
        audio.play().catch((err) => {
          console.warn('Reproducción diferida por políticas del navegador:', err);
        });
        audio.oncanplay = null;
      };
    },
    [playbackRate, volume, isMuted]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.warn);
    }
  }, [isPlaying]);

  const adelantar15 = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + 15);
  }, []);

  const retroceder15 = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 15);
  }, []);

  const seekTo = useCallback((segundos: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || Infinity, segundos));
  }, []);

  const setVelocidad = useCallback((rate: VelocidadReproduccion) => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = rate;
    }
    setPlaybackRateState(rate);
  }, []);

  const setVolumen = useCallback((vol: number) => {
    const audio = audioRef.current;
    const clamped = Math.max(0, Math.min(1, vol));
    if (audio) {
      audio.volume = clamped;
    }
    setVolumeState(clamped);
    if (clamped > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume || 1;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const cambiarCapitulo = useCallback(
    (numeroCapitulo: number) => {
      if (!audiolibroActual) return;
      const cap = audiolibroActual.capitulos.find((c) => c.numero === numeroCapitulo);
      if (cap && audioRef.current) {
        setCapituloActual(cap);
        setIsLoadingAudio(true);
        audioRef.current.src = cap.audio_url;
        audioRef.current.play().catch(console.warn);
      }
    },
    [audiolibroActual]
  );

  const siguienteCapitulo = useCallback(() => {
    if (!audiolibroActual || !capituloActual) return;
    const idx = audiolibroActual.capitulos.findIndex((c) => c.id === capituloActual.id);
    if (idx >= 0 && idx < audiolibroActual.capitulos.length - 1) {
      const siguiente = audiolibroActual.capitulos[idx + 1];
      cambiarCapitulo(siguiente.numero);
    }
  }, [audiolibroActual, capituloActual, cambiarCapitulo]);

  const anteriorCapitulo = useCallback(() => {
    if (!audiolibroActual || !capituloActual) return;
    const idx = audiolibroActual.capitulos.findIndex((c) => c.id === capituloActual.id);
    if (idx > 0) {
      const anterior = audiolibroActual.capitulos[idx - 1];
      cambiarCapitulo(anterior.numero);
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [audiolibroActual, capituloActual, cambiarCapitulo]);

  const setSleepTimer = useCallback((opcion: SleepTimerOption) => {
    setSleepTimerMode(opcion);
    if (typeof opcion === 'number') {
      setSleepTimerRemaining(opcion);
    } else {
      setSleepTimerRemaining(null);
    }
  }, []);

  const toggleFavorito = useCallback((audiolibroId: string) => {
    setFavoritosIds((prev) => {
      const existe = prev.includes(audiolibroId);
      const nuevos = existe ? prev.filter((id) => id !== audiolibroId) : [...prev, audiolibroId];
      try {
        localStorage.setItem(STORAGE_KEY_FAVORITOS, JSON.stringify(nuevos));
      } catch (e) {
        console.warn('Error guardando favoritos:', e);
      }
      return nuevos;
    });
  }, []);

  const isFavorito = useCallback(
    (audiolibroId: string) => favoritosIds.includes(audiolibroId),
    [favoritosIds]
  );

  const obtenerProgreso = useCallback(
    (audiolibroId: string) => {
      return historial.find((h) => h.audiolibro_id === audiolibroId) || null;
    },
    [historial]
  );

  return (
    <AudioPlayerContext.Provider
      value={{
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
        favoritosIds,
        historial,
        reproducirAudiolibro,
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
        setIsPlayerExpanded,
        toggleFavorito,
        isFavorito,
        obtenerProgreso,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer debe usarse dentro de un AudioPlayerProvider');
  }
  return context;
}
