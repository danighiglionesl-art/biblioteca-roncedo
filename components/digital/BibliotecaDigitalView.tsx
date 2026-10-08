'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  Download,
  ExternalLink,
  Sparkles,
  Filter,
  CheckCircle2,
  Globe2,
  ArrowRight,
  Bookmark,
  RefreshCw,
  Library,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { LibroDigital, FuenteDigital, DisponibilidadDigital } from '@/types';
import { LIBROS_DIGITALES_CURADOS } from '@/lib/data/librosDigitalesCurados';
import { LectorDigitalModal } from './LectorDigitalModal';

export function BibliotecaDigitalView() {
  const [query, setQuery] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState<'todos' | 'titulo' | 'autor' | 'editorial' | 'genero'>('todos');
  const [fuenteFiltro, setFuenteFiltro] = useState<'todas' | FuenteDigital>('todas');
  const [dispFiltro, setDispFiltro] = useState<'todas' | DisponibilidadDigital>('todas');
  const [soloLatinos, setSoloLatinos] = useState<boolean>(false);
  const [categoriaPill, setCategoriaPill] = useState<string>('todos');

  const [libros, setLibros] = useState<LibroDigital[]>(LIBROS_DIGITALES_CURADOS);
  const [cargando, setCargando] = useState<boolean>(false);
  const [libroSeleccionadoParaLeer, setLibroSeleccionadoParaLeer] = useState<LibroDigital | null>(null);

  // Ejecutar búsqueda remota unificada con debounce cuando el usuario escribe
  useEffect(() => {
    if (!query.trim()) {
      setLibros(LIBROS_DIGITALES_CURADOS);
      return;
    }

    const timer = setTimeout(async () => {
      setCargando(true);
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          tipo_busqueda: tipoBusqueda,
          fuente: fuenteFiltro,
          disponibilidad: dispFiltro,
          solo_argentinos_latinos: soloLatinos ? 'true' : 'false',
        });

        const res = await fetch(`/api/digital/search?${params.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.libros)) {
          setLibros(data.libros);
        }
      } catch (err) {
        console.error('Error al buscar libros digitales:', err);
      } finally {
        setCargando(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [query, tipoBusqueda, fuenteFiltro, dispFiltro, soloLatinos]);

  // Filtrado local para categorías rápidas
  const librosFiltrados = useMemo(() => {
    let result = [...libros];

    if (categoriaPill === 'argentina') {
      result = result.filter(
        (l) =>
          l.es_argentino_o_latino &&
          (l.autor.toLowerCase().includes('hernández') ||
            l.autor.toLowerCase().includes('sarmiento') ||
            l.autor.toLowerCase().includes('quiroga') ||
            l.autor.toLowerCase().includes('borges') ||
            l.autor.toLowerCase().includes('storni') ||
            l.autor.toLowerCase().includes('echeverría') ||
            l.autor.toLowerCase().includes('cané') ||
            l.autor.toLowerCase().includes('lugones') ||
            l.autor.toLowerCase().includes('tucumán'))
      );
    } else if (categoriaPill === 'latino') {
      result = result.filter((l) => l.es_argentino_o_latino);
    } else if (categoriaPill === 'descargables') {
      result = result.filter((l) => l.disponibilidad === 'descarga_libre');
    } else if (categoriaPill === 'clasicos') {
      result = result.filter((l) => !l.es_argentino_o_latino);
    }

    if (fuenteFiltro !== 'todas') {
      result = result.filter((l) => l.fuente === fuenteFiltro || l.fuentes_adicionales?.includes(fuenteFiltro));
    }

    if (dispFiltro !== 'todas') {
      result = result.filter((l) => l.disponibilidad === dispFiltro);
    }

    if (soloLatinos) {
      result = result.filter((l) => l.es_argentino_o_latino);
    }

    return result;
  }, [libros, categoriaPill, fuenteFiltro, dispFiltro, soloLatinos]);

  const aplicarBusquedaRapida = (termino: string, filtroLatino = false) => {
    setQuery(termino);
    if (filtroLatino) setSoloLatinos(true);
  };

  const badgeFuente = (fuente: FuenteDigital) => {
    switch (fuente) {
      case 'wikisource':
        return {
          nombre: 'Wikisource',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
        };
      case 'gutenberg':
        return {
          nombre: 'Project Gutenberg',
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          dot: 'bg-blue-500',
        };
      case 'cervantes':
        return {
          nombre: 'Cervantes Virtual',
          bg: 'bg-purple-50 text-purple-800 border-purple-300',
          dot: 'bg-purple-500',
        };
      case 'openlibrary':
      default:
        return {
          nombre: 'Open Library',
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Encabezado de la Biblioteca Digital */}
      <div className="bg-gradient-to-br from-[#102A4E] via-[#1A457D] to-[#2B6CB5] rounded-3xl p-6 sm:p-8 text-white shadow-card border border-blue-300/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-roncedo-celeste/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-roncedo-celesteLight border border-white/20 mb-3">
            <Globe2 className="w-3.5 h-3.5 text-roncedo-gold" />
            <span>Red de Bibliotecas Gratuitas en Español</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Biblioteca Digital Unificada
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-2 leading-relaxed font-sans">
            Accedé desde una única interfaz a obras clásicas, autores argentinos e hispanos, documentos de dominio público y ediciones libres integradas con <strong>Wikisource</strong>, <strong>Project Gutenberg</strong>, <strong>Biblioteca Cervantes</strong> y <strong>Open Library</strong>.
          </p>

          {/* Badges de las 4 fuentes conectadas */}
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-xl border border-white/20 inline-flex items-center gap-1.5 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Wikisource
            </span>
            <span className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-xl border border-white/20 inline-flex items-center gap-1.5 transition-colors">
              <span className="w-2 h-2 rounded-full bg-blue-300"></span> Project Gutenberg
            </span>
            <span className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-xl border border-white/20 inline-flex items-center gap-1.5 transition-colors">
              <span className="w-2 h-2 rounded-full bg-purple-300"></span> Cervantes Virtual
            </span>
            <span className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-xl border border-white/20 inline-flex items-center gap-1.5 transition-colors">
              <span className="w-2 h-2 rounded-full bg-amber-300"></span> Open Library
            </span>
          </div>
        </div>
      </div>

      {/* Buscador Centralizado con Filtros Unificados */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-blue-200/80 space-y-4">
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, autor, editorial, tema (ej: Martín Fierro, Borges, Quiroga, Quijote)..."
            className="w-full pl-12 pr-28 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 px-2.5 py-1 rounded-xl transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filtros avanzados en una fila responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* Criterio de búsqueda */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Buscar en
            </label>
            <select
              value={tipoBusqueda}
              onChange={(e) => setTipoBusqueda(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
            >
              <option value="todos">Todos los campos</option>
              <option value="titulo">Solo Título</option>
              <option value="autor">Solo Autor</option>
              <option value="editorial">Solo Editorial</option>
              <option value="genero">Género o Materia</option>
            </select>
          </div>

          {/* Plataforma / Fuente */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Plataforma Digital
            </label>
            <select
              value={fuenteFiltro}
              onChange={(e) => setFuenteFiltro(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
            >
              <option value="todas">Todas las Plataformas (4)</option>
              <option value="wikisource">Wikisource en español</option>
              <option value="gutenberg">Project Gutenberg</option>
              <option value="cervantes">Biblioteca Cervantes</option>
              <option value="openlibrary">Open Library</option>
            </select>
          </div>

          {/* Disponibilidad */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Disponibilidad
            </label>
            <select
              value={dispFiltro}
              onChange={(e) => setDispFiltro(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
            >
              <option value="todas">Cualquier formato</option>
              <option value="descarga_libre">Descarga Libre (EPUB / PDF)</option>
              <option value="lectura_directa">Lectura Directa en PWA</option>
              <option value="prestamo_externo">Préstamo Digital</option>
            </select>
          </div>

          {/* Toggle de Prioridad Argentina / Latino */}
          <div className="flex flex-col justify-end">
            <button
              onClick={() => setSoloLatinos(!soloLatinos)}
              className={`w-full py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition-colors ${
                soloLatinos
                  ? 'bg-roncedo-navy text-white border-roncedo-navy shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>🇦🇷 Solo Autores Argentinos/Latinos</span>
            </button>
          </div>
        </div>

        {/* Pestañas de Colecciones Temáticas */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            Colecciones:
          </span>
          <button
            onClick={() => {
              setCategoriaPill('todos');
              setSoloLatinos(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              categoriaPill === 'todos' && !soloLatinos
                ? 'bg-roncedo-blue text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas las Obras
          </button>
          <button
            onClick={() => {
              setCategoriaPill('argentina');
              setSoloLatinos(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              categoriaPill === 'argentina'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
            }`}
          >
            🇦🇷 Literatura Argentina
          </button>
          <button
            onClick={() => {
              setCategoriaPill('latino');
              setSoloLatinos(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              categoriaPill === 'latino'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
            }`}
          >
            🌎 Clásicos Latinoamericanos
          </button>
          <button
            onClick={() => {
              setCategoriaPill('descargables');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              categoriaPill === 'descargables'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            📥 Descargas Libres (EPUB / PDF)
          </button>
          <button
            onClick={() => {
              setCategoriaPill('clasicos');
              setSoloLatinos(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              categoriaPill === 'clasicos'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📚 Letras Españolas e Hispanas
          </button>
        </div>

        {/* Chips de sugerencias rápidas de búsqueda */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-400">Autores destacados:</span>
          {['José Hernández', 'Horacio Quiroga', 'Jorge Luis Borges', 'Domingo F. Sarmiento', 'Alfonsina Storni', 'Rubén Darío', 'Miguel de Cervantes'].map(
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

      {/* Indicador de Resultados */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <div>
          <span>Mostrando </span>
          <strong className="text-slate-900 font-bold">{librosFiltrados.length}</strong>
          <span> obras disponibles exclusivamente en español</span>
          {query && (
            <span>
              {' '}para la búsqueda &ldquo;<span className="font-bold text-roncedo-navy">{query}</span>&rdquo;
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 text-roncedo-blue" />
          <span className="hidden sm:inline">Dominio público y acceso abierto garantizado</span>
        </div>
      </div>

      {/* Grilla de Obras Digitales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {librosFiltrados.map((libro) => {
          const badge = badgeFuente(libro.fuente);
          const formatoEpub = libro.formatos.find((f) => f.tipo === 'epub');
          const formatoPdf = libro.formatos.find((f) => f.tipo === 'pdf');
          const permiteLecturaPWA = libro.wikisource_page || libro.gutenberg_id || libro.texto_directo_pwa || libro.ia_id;

          return (
            <div
              key={libro.id}
              className="bg-white rounded-3xl p-5 shadow-card border border-blue-200/80 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
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

                  {libro.disponibilidad === 'descarga_libre' ? (
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
                    <div className="w-16 h-24 flex-shrink-0 rounded-xl bg-gradient-to-br from-roncedo-navy to-roncedo-celeste text-white flex flex-col items-center justify-center p-1.5 text-center shadow">
                      <BookOpen className="w-5 h-5 text-roncedo-gold mb-1" />
                      <span className="text-[8px] font-bold uppercase leading-tight line-clamp-2">
                        {libro.fuente}
                      </span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    {libro.es_argentino_o_latino && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mb-1">
                        🇦🇷 Autor Argentino / Latino
                      </span>
                    )}
                    <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2" title={libro.titulo}>
                      {libro.titulo}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">{libro.autor}</p>
                    {libro.anio && <p className="text-[10px] text-slate-400 mt-0.5">Año: {libro.anio}</p>}
                  </div>
                </div>

                {/* Descripción / Sinopsis */}
                {libro.descripcion && (
                  <p className="text-xs text-slate-500 line-clamp-3 mb-3 leading-relaxed">
                    {libro.descripcion}
                  </p>
                )}

                {/* Etiquetas de formatos disponibles */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {formatoEpub && (
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      EPUB disponible
                    </span>
                  )}
                  {formatoPdf && (
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      PDF disponible
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
                  {/* Botón Lector PWA */}
                  <button
                    onClick={() => setLibroSeleccionadoParaLeer(libro)}
                    className="w-full bg-roncedo-navy hover:bg-blue-900 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-roncedo-gold" />
                    <span>Leer en PWA</span>
                  </button>

                  {/* Botón Descarga si está autorizada */}
                  {formatoEpub ? (
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
                  ) : formatoPdf ? (
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
                    href={libro.enlace_oficial}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-roncedo-navy hover:underline flex items-center gap-1"
                  >
                    <span>Fuente original</span>
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

      {/* Si no se hallan resultados */}
      {librosFiltrados.length === 0 && !cargando && (
        <div className="bg-white rounded-3xl p-10 text-center shadow-card border border-slate-200 max-w-lg mx-auto space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No encontramos coincidencias</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Probá con otro autor o título en español, o desactivá el filtro de autor regional.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setFuenteFiltro('todas');
              setDispFiltro('todas');
              setSoloLatinos(false);
              setCategoriaPill('todos');
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
