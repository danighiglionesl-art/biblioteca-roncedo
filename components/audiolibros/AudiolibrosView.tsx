'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
  Headphones,
  Play,
  Pause,
  Search,
  Sparkles,
  Heart,
  Clock,
  BookOpen,
  Filter,
  PlusCircle,
  Pencil,
  Trash2,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  RefreshCw,
  Globe2,
  Award,
  Layers,
  Music,
  Bookmark,
  CheckCircle2,
  Radio,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Audiolibro, GeneroAudiolibro, ProgresoAudiolibro } from '@/types/audiolibros';
import { useAudioPlayer } from '@/lib/context/AudioPlayerContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { ModalABMAudiolibro } from './ModalABMAudiolibro';

export function AudiolibrosView() {
  const { user } = useAuth();
  const esAdmin = user?.role === 'admin' || user?.email?.toLowerCase().includes('biblioroncedo');

  const {
    audiolibroActual,
    capituloActual,
    isPlaying,
    reproducirAudiolibro,
    togglePlayPause,
    toggleFavorito,
    isFavorito,
    historial,
    favoritosIds,
  } = useAudioPlayer();

  // Estados de Búsqueda y Filtrado
  const [query, setQuery] = useState('');
  const [generoSeleccionado, setGeneroSeleccionado] = useState<string>('todos');
  const [seccionPill, setSeccionPill] = useState<'catalogo' | 'argentina' | 'clasicos' | 'infantil' | 'mis_audiolibros'>('catalogo');
  const [duracionFiltro, setDuracionFiltro] = useState<'todas' | 'corta' | 'media' | 'larga'>('todas');
  const [orden, setOrden] = useState<'populares' | 'recientes' | 'alfabetico'>('populares');

  const [audiolibros, setAudiolibros] = useState<Audiolibro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [metricas, setMetricas] = useState<any>(null);

  // Estados de ABM de Admin
  const [modalAbmOpen, setModalAbmOpen] = useState(false);
  const [audiolibroAEditar, setAudiolibroAEditar] = useState<Audiolibro | null>(null);

  // Cargar catálogo de audiolibros desde la API
  const cargarAudiolibros = useCallback(async () => {
    try {
      setCargando(true);
      const params = new URLSearchParams({
        q: query.trim(),
        genero: seccionPill === 'argentina' ? 'Literatura Argentina' : generoSeleccionado,
        solo_argentinos: seccionPill === 'argentina' ? 'true' : 'false',
        duracion: duracionFiltro,
        orden,
        limite: '50',
      });

      const res = await fetch(`/api/audiolibros/search?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.audiolibros)) {
        setAudiolibros(data.audiolibros);
        if (data.metricas) setMetricas(data.metricas);
      }
    } catch (err) {
      console.error('Error cargando audiolibros:', err);
    } finally {
      setCargando(false);
    }
  }, [query, generoSeleccionado, seccionPill, duracionFiltro, orden]);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarAudiolibros();
    }, query ? 350 : 0);
    return () => clearTimeout(timer);
  }, [cargarAudiolibros, query]);

  // Audiolibro más reciente en curso para el bloque "Continuar Escuchando"
  const ultimoEnCurso: ProgresoAudiolibro | null = useMemo(() => {
    if (!historial || historial.length === 0) return null;
    return historial.find((h) => !h.completado && h.segundo_actual > 10) || historial[0] || null;
  }, [historial]);

  const audiolibroEnCursoObjeto: Audiolibro | undefined = useMemo(() => {
    if (!ultimoEnCurso) return undefined;
    return audiolibros.find((a) => a.id === ultimoEnCurso.audiolibro_id);
  }, [ultimoEnCurso, audiolibros]);

  // Libros para la pestaña "Mis Audiolibros"
  const misAudiolibrosFiltrados = useMemo(() => {
    if (seccionPill !== 'mis_audiolibros') return [];
    return audiolibros.filter((a) => {
      const esFav = favoritosIds.includes(a.id);
      const tieneHistorial = historial.some((h) => h.audiolibro_id === a.id);
      return esFav || tieneHistorial;
    });
  }, [seccionPill, audiolibros, favoritosIds, historial]);

  const listaFinalAMostrar = seccionPill === 'mis_audiolibros' ? misAudiolibrosFiltrados : audiolibros;

  const generosDisponibles = [
    'todos',
    'Literatura Argentina',
    'Novelas',
    'Cuentos',
    'Poesía',
    'Clásicos Universales',
    'Infantil y Juvenil',
    'Historia y Biografías',
  ];

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* CABECERA SPOTIFY STYLE - STREAMING DE AUDIOLIBROS */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0B2240] via-[#143D73] to-[#2B6CB5] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/20">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-roncedo-gold/15 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-roncedo-celesteLight border border-white/20">
              <Headphones className="w-3.5 h-3.5 text-roncedo-gold animate-pulse" />
              <span>Streaming Oficial • Calidad HD</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-white">
              Audiolibros Biblioteca Roncedo
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Escuchá obras maestras de la literatura argentina y universal directamente desde tu celular o
              computadora. Reproductor continuo, control de velocidad, temporizador para dormir y navegación
              por capítulos sin salir de la PWA.
            </p>

            {metricas && (
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-bold text-amber-200">
                <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                  📚 {metricas.obrasActivas || audiolibros.length} Obras en Español
                </span>
                <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                  ⏱️ +{metricas.totalHorasEscucha || 40} Horas de Narración
                </span>
                <span className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                  🇦🇷 Literatura Argentina y Memoria Oral
                </span>
              </div>
            )}
          </div>

          {/* Acciones de Administrador */}
          {esAdmin && (
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 self-start md:self-center flex-shrink-0">
              <button
                onClick={() => {
                  setAudiolibroAEditar(null);
                  setModalAbmOpen(true);
                }}
                className="bg-roncedo-gold hover:bg-amber-400 text-roncedo-navy font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Audiolibro</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BLOQUE HERMOSO: "CONTINUAR ESCUCHANDO" (Si existe progreso guardado) */}
      {ultimoEnCurso && audiolibroEnCursoObjeto && (
        <div className="bg-gradient-to-r from-[#0F284B] to-[#1E4D88] text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-blue-400/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-white/20 shadow-md flex-shrink-0">
              <Image
                src={audiolibroEnCursoObjeto.portada_url || '/images/logo-biblioteca.png'}
                alt={audiolibroEnCursoObjeto.titulo}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-roncedo-gold font-bold text-[10px] uppercase tracking-wider">
                <RotateCcw className="w-3 h-3" />
                <span>Continuar Escuchando</span>
              </div>
              <h3 className="font-extrabold text-sm text-white truncate">
                {audiolibroEnCursoObjeto.titulo}
              </h3>
              <p className="text-xs text-blue-200 truncate">
                Cap. {ultimoEnCurso.capitulo_numero}: {ultimoEnCurso.capitulo_titulo}
              </p>

              {/* Barra de progreso */}
              <div className="w-full sm:w-56 h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-roncedo-gold h-full rounded-full transition-all"
                  style={{ width: `${ultimoEnCurso.porcentaje}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (audiolibroActual?.id === audiolibroEnCursoObjeto.id) {
                togglePlayPause();
              } else {
                reproducirAudiolibro(
                  audiolibroEnCursoObjeto,
                  ultimoEnCurso.capitulo_numero,
                  ultimoEnCurso.segundo_actual
                );
              }
            }}
            className="w-full sm:w-auto bg-roncedo-gold hover:bg-amber-400 text-roncedo-navy font-black px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md hover:scale-102 active:scale-98 transition-all text-xs"
          >
            {audiolibroActual?.id === audiolibroEnCursoObjeto.id && isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Reanudar al {ultimoEnCurso.porcentaje}%</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* NAVEGACIÓN POR PESTAÑAS PRINCIPALES */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto text-xs font-bold">
        <button
          onClick={() => {
            setSeccionPill('catalogo');
            setGeneroSeleccionado('todos');
          }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            seccionPill === 'catalogo'
              ? 'bg-roncedo-navy text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Todo el Catálogo</span>
        </button>

        <button
          onClick={() => {
            setSeccionPill('argentina');
            setGeneroSeleccionado('todos');
          }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            seccionPill === 'argentina'
              ? 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>🇦🇷 Literatura Argentina</span>
        </button>

        <button
          onClick={() => {
            setSeccionPill('clasicos');
            setGeneroSeleccionado('Clásicos Universales');
          }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            seccionPill === 'clasicos'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-roncedo-gold" />
          <span>Clásicos Universales</span>
        </button>

        <button
          onClick={() => {
            setSeccionPill('infantil');
            setGeneroSeleccionado('Infantil y Juvenil');
          }}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            seccionPill === 'infantil'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Infantil y Juvenil</span>
        </button>

        <button
          onClick={() => setSeccionPill('mis_audiolibros')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            seccionPill === 'mis_audiolibros'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-300 fill-current" />
          <span>Mis Audiolibros ({favoritosIds.length})</span>
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS FACETADOS */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Input Buscador */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, autor, narrador, temática (Martín Fierro, Quiroga, Poe...)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-xs"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Duración */}
          <div className="flex items-center gap-2">
            <select
              value={duracionFiltro}
              onChange={(e) => setDuracionFiltro(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
            >
              <option value="todas">Cualquier duración</option>
              <option value="corta">Corta (&lt; 45 min)</option>
              <option value="media">Media (45 min - 2h)</option>
              <option value="larga">Extensa (&gt; 2h)</option>
            </select>

            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
            >
              <option value="populares">Más Escuchados</option>
              <option value="recientes">Novedades</option>
              <option value="alfabetico">Título A-Z</option>
            </select>
          </div>
        </div>

        {/* Píldoras de Géneros Rápidos */}
        {seccionPill === 'catalogo' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-[11px] font-bold">
            {generosDisponibles.map((gen) => (
              <button
                key={gen}
                onClick={() => setGeneroSeleccionado(gen)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                  generoSeleccionado === gen
                    ? 'bg-roncedo-blue text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {gen === 'todos' ? 'Todos los géneros' : gen}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GRILLA DE AUDIOLIBROS - EXPERIENCIA VISUAL SPOTIFY / RONCEDO */}
      {cargando ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-roncedo-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-slate-500">Cargando biblioteca de audiolibros...</p>
        </div>
      ) : listaFinalAMostrar.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {listaFinalAMostrar.map((audio) => {
            const estaReproduciendoEste = audiolibroActual?.id === audio.id && isPlaying;
            const esEsteAudio = audiolibroActual?.id === audio.id;
            const fav = isFavorito(audio.id);

            return (
              <div
                key={audio.id}
                className={`group bg-white rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between ${
                  esEsteAudio ? 'border-roncedo-gold ring-2 ring-roncedo-gold/30' : 'border-slate-200'
                }`}
              >
                {/* Portada Cuadrada con botón Play central */}
                <div className="relative aspect-square w-full bg-slate-900 overflow-hidden cursor-pointer">
                  <Image
                    src={audio.portada_url || '/images/logo-biblioteca.png'}
                    alt={audio.titulo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />

                  {/* Insignia de duración */}
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                    <Clock className="w-3 h-3 text-roncedo-gold" />
                    <span>{audio.duracion_texto}</span>
                  </div>

                  {/* Botón Favorito */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorito(audio.id);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xs flex items-center justify-center transition-colors shadow-xs"
                    title={fav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        fav ? 'fill-rose-500 text-rose-500' : 'text-white/90'
                      }`}
                    />
                  </button>

                  {/* Botón Play central con overlay */}
                  <div
                    onClick={() => {
                      if (esEsteAudio) {
                        togglePlayPause();
                      } else {
                        reproducirAudiolibro(audio);
                      }
                    }}
                    className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity ${
                      estaReproduciendoEste ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-roncedo-gold hover:bg-amber-400 text-roncedo-navy flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all">
                      {estaReproduciendoEste ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Indicador de que está sonando */}
                  {estaReproduciendoEste && (
                    <div className="absolute bottom-2 left-2 bg-emerald-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>Reproduciendo</span>
                    </div>
                  )}
                </div>

                {/* Información de la Tarjeta */}
                <div className="p-3 sm:p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-roncedo-blue block truncate uppercase tracking-wider">
                      {audio.genero}
                    </span>

                    <h4
                      onClick={() => reproducirAudiolibro(audio)}
                      className="font-extrabold text-xs text-slate-900 group-hover:text-roncedo-navy transition-colors line-clamp-2 leading-tight cursor-pointer"
                      title={audio.titulo}
                    >
                      {audio.titulo}
                    </h4>

                    <p className="text-[11px] font-semibold text-slate-600 truncate">
                      {audio.autor}
                    </p>

                    {audio.narrador && (
                      <p className="text-[10px] text-slate-400 truncate">
                        Voz: {audio.narrador}
                      </p>
                    )}
                  </div>

                  {/* Pie de la Tarjeta: Capítulos y Botón Escuchar */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{audio.capitulos.length} {audio.capitulos.length === 1 ? 'capítulo' : 'capítulos'}</span>
                      <span className="truncate max-w-[90px]">{audio.fuente_nombre}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (esEsteAudio) {
                            togglePlayPause();
                          } else {
                            reproducirAudiolibro(audio);
                          }
                        }}
                        className={`w-full py-1.5 rounded-xl font-black text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                          estaReproduciendoEste
                            ? 'bg-amber-400 text-slate-900'
                            : 'bg-roncedo-navy hover:bg-blue-900 text-white'
                        }`}
                      >
                        {estaReproduciendoEste ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span>Pausar</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Escuchar</span>
                          </>
                        )}
                      </button>

                      {/* Botón de edición para administrador */}
                      {esAdmin && (
                        <button
                          onClick={() => {
                            setAudiolibroAEditar(audio);
                            setModalAbmOpen(true);
                          }}
                          className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                          title="Editar audiolibro"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
          <Headphones className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-base text-slate-800">
            No se encontraron audiolibros con los filtros seleccionados
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Probá buscando por otro término o limpiá los filtros de duración o género.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setGeneroSeleccionado('todos');
              setDuracionFiltro('todas');
              setSeccionPill('catalogo');
            }}
            className="bg-roncedo-navy text-white font-bold px-4 py-2 rounded-xl text-xs"
          >
            Restablecer Filtros
          </button>
        </div>
      )}

      {/* Modal ABM de Edición / Creación para el Administrador */}
      {modalAbmOpen && (
        <ModalABMAudiolibro
          audiolibroAEditar={audiolibroAEditar}
          onClose={() => {
            setModalAbmOpen(false);
            setAudiolibroAEditar(null);
          }}
          onGuardadoExitoso={() => {
            cargarAudiolibros();
          }}
        />
      )}
    </div>
  );
}
