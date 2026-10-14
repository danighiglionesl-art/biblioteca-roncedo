'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Search,
  BookOpen,
  Download,
  ExternalLink,
  Sparkles,
  Globe2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Library,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { LibroDigital, FuenteDigital, DisponibilidadDigital, MetricasBibliotecaDigital } from '@/types';
import { LIBROS_DIGITALES_CURADOS } from '@/lib/data/librosDigitalesCurados';
import { LectorDigitalModal } from './LectorDigitalModal';

export function BibliotecaDigitalView() {
  const [query, setQuery] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState<'todos' | 'titulo' | 'autor' | 'editorial' | 'genero'>('todos');
  const [fuenteFiltro, setFuenteFiltro] = useState<'todas' | FuenteDigital>('todas');
  const [dispFiltro, setDispFiltro] = useState<'todas' | DisponibilidadDigital>('todas');
  const [soloLatinos, setSoloLatinos] = useState<boolean>(false);
  const [categoriaPill, setCategoriaPill] = useState<string>('todos');
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const ITEMS_POR_PAGINA = 24;

  const [libros, setLibros] = useState<LibroDigital[]>(LIBROS_DIGITALES_CURADOS);
  const [totalLibros, setTotalLibros] = useState<number>(5890);
  const [totalPaginas, setTotalPaginas] = useState<number>(246);
  const [metricas, setMetricas] = useState<MetricasBibliotecaDigital | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [libroSeleccionadoParaLeer, setLibroSeleccionadoParaLeer] = useState<LibroDigital | null>(null);

  // Ejecución de la búsqueda paginada centralizada
  const ejecutarBusqueda = useCallback(async (paginaObjetivo: number = paginaActual) => {
    setCargando(true);
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        tipo_busqueda: tipoBusqueda,
        fuente: fuenteFiltro,
        disponibilidad: dispFiltro,
        solo_argentinos_latinos: soloLatinos ? 'true' : 'false',
        pagina: paginaObjetivo.toString(),
        limite: ITEMS_POR_PAGINA.toString(),
      });

      const res = await fetch(`/api/digital/search?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.libros)) {
        setLibros(data.libros);
        setTotalLibros(data.total ?? 0);
        setTotalPaginas(data.totalPaginas ?? 1);
        if (data.metricas) {
          setMetricas(data.metricas);
        }
      }
    } catch (err) {
      console.error('Error al buscar libros digitales:', err);
    } finally {
      setCargando(false);
    }
  }, [query, tipoBusqueda, fuenteFiltro, dispFiltro, soloLatinos, paginaActual]);

  // Debounce para búsqueda cuando el usuario escribe o cambia filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      ejecutarBusqueda(paginaActual);
    }, query ? 400 : 0);

    return () => clearTimeout(timer);
  }, [ejecutarBusqueda, query, paginaActual]);

  const cambiarPagina = (nuevaPagina: number) => {
    const p = Math.max(1, Math.min(totalPaginas, nuevaPagina));
    setPaginaActual(p);
    const catalogoAnchor = document.getElementById('catalogo-digital-top');
    if (catalogoAnchor) {
      catalogoAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  const aplicarBusquedaRapida = (termino: string, filtroLatino = false) => {
    setQuery(termino);
    setPaginaActual(1);
    if (filtroLatino) setSoloLatinos(true);
  };

  const seleccionarCategoriaPill = (cat: string) => {
    setCategoriaPill(cat);
    setPaginaActual(1);

    if (cat === 'roncedo') {
      setFuenteFiltro('roncedo_digital');
      setSoloLatinos(false);
      setDispFiltro('todas');
    } else if (cat === 'argentina') {
      setFuenteFiltro('todas');
      setSoloLatinos(true);
      setDispFiltro('todas');
    } else if (cat === 'latino') {
      setFuenteFiltro('todas');
      setSoloLatinos(true);
      setDispFiltro('todas');
    } else if (cat === 'descargables') {
      setFuenteFiltro('todas');
      setSoloLatinos(false);
      setDispFiltro('descarga_libre');
    } else if (cat === 'clasicos') {
      setFuenteFiltro('todas');
      setSoloLatinos(false);
      setDispFiltro('todas');
    } else {
      setFuenteFiltro('todas');
      setSoloLatinos(false);
      setDispFiltro('todas');
    }
  };

  const badgeFuente = (fuente: FuenteDigital) => {
    switch (fuente) {
      case 'roncedo_digital':
        return {
          nombre: 'Biblioteca Roncedo (PDF)',
          bg: 'bg-amber-100 text-amber-900 border-amber-300 font-black',
          dot: 'bg-amber-600',
          icon: '🏛️',
        };
      case 'bnmm':
        return {
          nombre: 'BN Mariano Moreno (AR)',
          bg: 'bg-sky-50 text-sky-800 border-sky-300',
          dot: 'bg-sky-500',
          icon: '🇦🇷',
        };
      case 'bne':
        return {
          nombre: 'Bib. Nacional de España',
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
          icon: '🇪🇸',
        };
      case 'wikisource':
        return {
          nombre: 'Wikisource',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          icon: '📖',
        };
      case 'gutenberg':
        return {
          nombre: 'Project Gutenberg',
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          dot: 'bg-blue-500',
          icon: '📘',
        };
      case 'cervantes':
        return {
          nombre: 'Cervantes Virtual',
          bg: 'bg-purple-50 text-purple-800 border-purple-300',
          dot: 'bg-purple-500',
          icon: '🏛️',
        };
      case 'openlibrary':
      default:
        return {
          nombre: 'Open Library',
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          dot: 'bg-slate-500',
          icon: '🌐',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal de la Biblioteca Digital */}
      <div className="bg-gradient-to-br from-[#0c2340] via-[#102A4E] to-[#1d4f8f] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-300/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-roncedo-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-roncedo-celesteLight border border-white/20 mb-3 shadow-sm">
            <Globe2 className="w-4 h-4 text-roncedo-gold" />
            <span>Red Centralizada de 7 Plataformas Digitales</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Biblioteca Digital Unificada
          </h2>

          <p className="text-xs sm:text-sm text-blue-100/90 mt-2.5 leading-relaxed font-sans">
            Accedé libremente a más de <strong>5.800 obras en español verificadas</strong> con lectura online y descarga gratuita en PDF/EPUB, integrando las 7 mayores bibliotecas de acceso público hispanas y el fondo propio de <strong>Biblioteca Roncedo</strong> (superando con creces nuestro acervo físico de 1.283 libros).
          </p>

          {/* Estadísticas rápidas en el encabezado */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2.5 border border-white/15">
              <span className="block text-xl sm:text-2xl font-black text-roncedo-gold">
                {metricas ? metricas.total_obras_unicas.toLocaleString('es-AR') : '5.890+'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                Obras Digitales
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2.5 border border-white/15">
              <span className="block text-xl sm:text-2xl font-black text-emerald-300">
                {metricas ? metricas.disponibles_descarga.toLocaleString('es-AR') : '3.470+'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                Descarga Libre
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2.5 border border-white/15">
              <span className="block text-xl sm:text-2xl font-black text-sky-300">
                {metricas ? metricas.disponibles_lectura_online.toLocaleString('es-AR') : '2.410+'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                Lectura en la App
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2.5 border border-white/15">
              <span className="block text-xl sm:text-2xl font-black text-amber-300">7</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                Fuentes Conectadas
              </span>
            </div>
          </div>

          {/* Badges de las 7 fuentes interconectadas */}
          <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] font-bold">
            <span
              onClick={() => seleccionarCategoriaPill('roncedo')}
              className="cursor-pointer bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 px-2.5 py-1 rounded-xl border border-amber-300/40 inline-flex items-center gap-1.5 transition-colors"
              title="Libros Digitales propios de Biblioteca Roncedo"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> 🏛️ Biblioteca Roncedo (PDF)
            </span>
            <span
              onClick={() => { setFuenteFiltro('bnmm'); setPaginaActual(1); }}
              className="cursor-pointer bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-xl border border-white/20 inline-flex items-center gap-1.5 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-sky-400"></span> 🇦🇷 BN Mariano Moreno
            </span>
            <span
              onClick={() => { setFuenteFiltro('bne'); setPaginaActual(1); }}
              className="cursor-pointer bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-xl border border-white/20 inline-flex items-center gap-1.5 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span> 🇪🇸 BNE Digital
            </span>
            <span
              onClick={() => { setFuenteFiltro('wikisource'); setPaginaActual(1); }}
              className="cursor-pointer bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-xl border border-white/20 inline-flex items-center gap-1.5 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Wikisource
            </span>
            <span
              onClick={() => { setFuenteFiltro('gutenberg'); setPaginaActual(1); }}
              className="cursor-pointer bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-xl border border-white/20 inline-flex items-center gap-1.5 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-blue-300"></span> Project Gutenberg
            </span>
            <span
              onClick={() => { setFuenteFiltro('cervantes'); setPaginaActual(1); }}
              className="cursor-pointer bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-xl border border-white/20 inline-flex items-center gap-1.5 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-purple-300"></span> Cervantes Virtual
            </span>
            <span
              onClick={() => { setFuenteFiltro('openlibrary'); setPaginaActual(1); }}
              className="cursor-pointer bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-xl border border-white/20 inline-flex items-center gap-1.5 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-amber-300"></span> Open Library
            </span>
          </div>
        </div>
      </div>

      {/* Buscador Centralizado con Filtros Unificados */}
      <div id="catalogo-digital-top" className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-blue-200/80 space-y-4">
        {/* Barra de Búsqueda */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {cargando ? (
              <RefreshCw className="w-5 h-5 text-roncedo-blue animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPaginaActual(1);
            }}
            placeholder="Buscar por título, autor, editorial, tema (ej: Martín Fierro, Quiroga, Borges, Quijote, Historia Argentina)..."
            className="w-full pl-12 pr-28 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setPaginaActual(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 px-2.5 py-1 rounded-xl transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filtros avanzados en grilla responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* Criterio de búsqueda */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Buscar en
            </label>
            <select
              value={tipoBusqueda}
              onChange={(e) => {
                setTipoBusqueda(e.target.value as any);
                setPaginaActual(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
            >
              <option value="todos">Todos los campos</option>
              <option value="titulo">Solo Título</option>
              <option value="autor">Solo Autor</option>
              <option value="editorial">Solo Editorial</option>
              <option value="genero">Género o Materia</option>
            </select>
          </div>

          {/* Plataforma / Fuente (7 Plataformas) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Plataforma Digital (7)
            </label>
            <select
              value={fuenteFiltro}
              onChange={(e) => {
                setFuenteFiltro(e.target.value as any);
                setPaginaActual(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
            >
              <option value="todas">Todas las Plataformas (7)</option>
              <option value="roncedo_digital">🏛️ Libros Digitales Biblioteca Roncedo (PDF)</option>
              <option value="bnmm">🇦🇷 Biblioteca Nacional Mariano Moreno</option>
              <option value="bne">🇪🇸 Biblioteca Nacional de España (BNE)</option>
              <option value="wikisource">Wikisource en español</option>
              <option value="gutenberg">Project Gutenberg</option>
              <option value="cervantes">Biblioteca Cervantes Virtual</option>
              <option value="openlibrary">Open Library / Internet Archive</option>
            </select>
          </div>

          {/* Disponibilidad */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Disponibilidad
            </label>
            <select
              value={dispFiltro}
              onChange={(e) => {
                setDispFiltro(e.target.value as any);
                setPaginaActual(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
            >
              <option value="todas">Cualquier formato</option>
              <option value="descarga_libre">Descarga Libre (PDF / EPUB)</option>
              <option value="lectura_directa">Lectura Directa en la App</option>
              <option value="prestamo_externo">Préstamo Digital</option>
            </select>
          </div>

          {/* Toggle de Prioridad Argentina / Latino */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => {
                setSoloLatinos(!soloLatinos);
                setPaginaActual(1);
              }}
              className={`w-full py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-colors ${
                soloLatinos
                  ? 'bg-roncedo-navy text-white border-roncedo-navy shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>🇦🇷 Autores Argentinos e Hispanos</span>
            </button>
          </div>
        </div>

        {/* Pestañas de Colecciones Temáticas Rápidas */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            Colecciones:
          </span>
          <button
            onClick={() => seleccionarCategoriaPill('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              categoriaPill === 'todos' && fuenteFiltro === 'todas' && !soloLatinos && dispFiltro === 'todas'
                ? 'bg-roncedo-blue text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas las Obras ({totalLibros.toLocaleString('es-AR')})
          </button>
          <button
            onClick={() => seleccionarCategoriaPill('roncedo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              fuenteFiltro === 'roncedo_digital'
                ? 'bg-amber-500 text-slate-900 shadow-sm font-black'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            🏛️ Libros Biblioteca Roncedo (PDF)
          </button>
          <button
            onClick={() => seleccionarCategoriaPill('argentina')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              categoriaPill === 'argentina' && soloLatinos
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
            }`}
          >
            🇦🇷 Literatura Argentina
          </button>
          <button
            onClick={() => seleccionarCategoriaPill('descargables')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              dispFiltro === 'descarga_libre'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            📥 Descargas Libres (PDF / EPUB)
          </button>
          <button
            onClick={() => seleccionarCategoriaPill('clasicos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              categoriaPill === 'clasicos'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📚 Letras Hispanas y Universales
          </button>
        </div>

        {/* Chips de sugerencias rápidas de búsqueda */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-400">Autores destacados:</span>
          {['José Hernández', 'Horacio Quiroga', 'Jorge Luis Borges', 'Domingo F. Sarmiento', 'Alfonsina Storni', 'Rubén Darío', 'Miguel de Cervantes', 'Esteban Echeverría'].map(
            (autor) => (
              <button
                key={autor}
                onClick={() => aplicarBusquedaRapida(autor)}
                className="bg-slate-100 hover:bg-blue-100 hover:text-roncedo-navy px-2.5 py-0.5 rounded-lg transition-colors font-medium"
              >
                {autor}
              </button>
            )
          )}
        </div>
      </div>

      {/* Indicador de Resultados y Paginación Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2 px-1">
        <div>
          Mostrando{' '}
          <strong className="text-slate-900 font-bold">
            {totalLibros === 0 ? 0 : (paginaActual - 1) * ITEMS_POR_PAGINA + 1} -{' '}
            {Math.min(paginaActual * ITEMS_POR_PAGINA, totalLibros)}
          </strong>{' '}
          de <strong className="text-slate-900 font-bold">{totalLibros.toLocaleString('es-AR')}</strong> obras digitales en español
          {query && (
            <span>
              {' '}para la búsqueda &ldquo;<span className="font-bold text-roncedo-navy">{query}</span>&rdquo;
            </span>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1 || cargando}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-slate-800 shadow-sm">
              {paginaActual} / {totalPaginas}
            </span>
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas || cargando}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Grilla de Obras Digitales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {libros.map((libro) => {
          const badge = badgeFuente(libro.fuente);
          const formatoEpub = libro.formatos.find((f) => f.tipo === 'epub');
          const formatoPdf = libro.formatos.find((f) => f.tipo === 'pdf') || (libro.archivo_pdf_url ? { tipo: 'pdf', url: libro.archivo_pdf_url } : null);
          const esRoncedo = libro.fuente === 'roncedo_digital';

          return (
            <div
              key={libro.id}
              className={`bg-white rounded-3xl p-5 shadow-card border transition-all duration-200 flex flex-col justify-between group ${
                esRoncedo ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md' : 'border-blue-200/80 hover:shadow-lg'
              }`}
            >
              <div>
                {/* Cabecera de la Ficha: Fuente y Disponibilidad */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badge.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {badge.nombre}
                  </span>

                  {esRoncedo ? (
                    <span className="bg-amber-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                      🏛️ Archivo PDF Roncedo
                    </span>
                  ) : libro.disponibilidad === 'descarga_libre' ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                      Descarga Libre
                    </span>
                  ) : libro.disponibilidad === 'lectura_directa' ? (
                    <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-300">
                      Lectura Directa
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                      Préstamo / Externo
                    </span>
                  )}
                </div>

                {/* Título y Autor */}
                <div className="flex gap-3 items-start mb-3">
                  {libro.portada_url ? (
                    <div className="relative w-16 h-24 flex-shrink-0 rounded-xl overflow-hidden shadow border border-slate-200 bg-slate-100">
                      <Image
                        src={libro.portada_url}
                        alt={libro.titulo}
                        fill
                        sizes="64px"
                        className="object-cover group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className={`w-16 h-24 flex-shrink-0 rounded-xl text-white flex flex-col items-center justify-center p-1.5 text-center shadow ${
                      esRoncedo
                        ? 'bg-gradient-to-br from-[#0c2340] to-amber-600'
                        : 'bg-gradient-to-br from-roncedo-navy to-roncedo-celeste'
                    }`}>
                      {esRoncedo ? (
                        <FileText className="w-6 h-6 text-amber-300 mb-1" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-roncedo-gold mb-1" />
                      )}
                      <span className="text-[8px] font-bold uppercase leading-tight line-clamp-2">
                        {esRoncedo ? 'Roncedo' : libro.fuente}
                      </span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    {libro.es_argentino_o_latino && !esRoncedo && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mb-1">
                        🇦🇷 Autor Argentino / Latino
                      </span>
                    )}
                    {esRoncedo && (
                      <span className="text-[10px] font-bold text-slate-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 inline-block mb-1">
                        Colección Digital Local
                      </span>
                    )}
                    <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2" title={libro.titulo}>
                      {libro.titulo}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">{libro.autor}</p>
                    {libro.editorial && <p className="text-[10px] text-slate-500 mt-0.5">Ed: {libro.editorial}</p>}
                    {libro.anio && <p className="text-[10px] text-slate-400 mt-0.5">Año: {libro.anio}</p>}
                  </div>
                </div>

                {/* Descripción / Sinopsis */}
                {libro.descripcion && (
                  <p className="text-xs text-slate-500 line-clamp-3 mb-3 leading-relaxed">
                    {libro.descripcion}
                  </p>
                )}

                {/* Etiquetas de formatos disponibles y licencia */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {formatoPdf && (
                    <span className="text-[9px] font-bold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md">
                      PDF disponible
                    </span>
                  )}
                  {formatoEpub && (
                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                      EPUB disponible
                    </span>
                  )}
                  {libro.tipo_licencia && (
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {libro.tipo_licencia}
                    </span>
                  )}
                  <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                    Idioma Español
                  </span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* Botón Lector en la App */}
                  <button
                    onClick={() => setLibroSeleccionadoParaLeer(libro)}
                    className="w-full bg-roncedo-navy hover:bg-blue-900 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-roncedo-gold" />
                    <span>Leer en la App</span>
                  </button>

                  {/* Botón Descarga si está autorizada */}
                  {formatoPdf ? (
                    <a
                      href={formatoPdf.url}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </a>
                  ) : formatoEpub ? (
                    <a
                      href={formatoEpub.url}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>EPUB</span>
                    </a>
                  ) : (
                    <a
                      href={libro.enlace_oficial}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Visor Web</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
                  <a
                    href={libro.enlace_oficial || libro.enlace_lectura || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-roncedo-navy hover:underline flex items-center gap-1"
                  >
                    <span>{esRoncedo ? 'Biblioteca Roncedo' : 'Fuente original'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {libro.fuentes_adicionales && libro.fuentes_adicionales.length > 0 && (
                    <span className="text-[10px] text-slate-500">
                      También en: {libro.fuentes_adicionales.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación Inferior */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1 || cargando}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 text-xs font-bold shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-1">
            <span className="font-bold text-xs px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-slate-800 shadow-sm">
              Página {paginaActual} de {totalPaginas}
            </span>
          </div>

          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas || cargando}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 text-xs font-bold shadow-sm"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Si no se hallan resultados */}
      {libros.length === 0 && !cargando && (
        <div className="bg-white rounded-3xl p-10 text-center shadow-card border border-slate-200 max-w-lg mx-auto space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No encontramos coincidencias</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Probá con otro autor o título en español, o desactivá los filtros específicos.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setFuenteFiltro('todas');
              setDispFiltro('todas');
              setSoloLatinos(false);
              setCategoriaPill('todos');
              setPaginaActual(1);
            }}
            className="text-xs font-bold text-roncedo-navy hover:underline"
          >
            Restablecer todos los filtros
          </button>
        </div>
      )}

      {/* Modal de Lectura Integrada en PWA */}
      {libroSeleccionadoParaLeer && (
        <LectorDigitalModal
          libro={libroSeleccionadoParaLeer}
          onClose={() => setLibroSeleccionadoParaLeer(null)}
        />
      )}
    </div>
  );
}
