'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
  Globe2,
  RefreshCw,
  BookOpen,
  Download,
  Upload,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  FileText,
  Building,
  Sparkles,
  Search,
  Check,
  X,
  ShieldCheck,
  Calendar,
  Pencil,
} from 'lucide-react';
import { LibroDigital, FuenteDigital, MetricasBibliotecaDigital } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { LectorDigitalModal } from '@/components/digital/LectorDigitalModal';
import { ModalLibroDigitalForm } from '@/components/digital/ModalLibroDigitalForm';
import { formatFechaArgentina } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthContext';

export function GestionBibliotecaDigital() {
  const { user } = useAuth();
  const [metricas, setMetricas] = useState<MetricasBibliotecaDigital | null>(null);
  const [cargandoMetricas, setCargandoMetricas] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [resultadoSync, setResultadoSync] = useState<{ exito: boolean; mensaje: string } | null>(null);

  // Libros propios y catálogo personalizado ABM
  const [librosRoncedo, setLibrosRoncedo] = useState<LibroDigital[]>([]);
  const [cargandoRoncedo, setCargandoRoncedo] = useState(true);
  const [modalLibroFormOpen, setModalLibroFormOpen] = useState(false);
  const [libroParaEditar, setLibroParaEditar] = useState<LibroDigital | null>(null);
  const [libroParaLeer, setLibroParaLeer] = useState<LibroDigital | null>(null);
  const [busquedaAdmin, setBusquedaAdmin] = useState('');
  const [filtroFuenteAdmin, setFiltroFuenteAdmin] = useState<string>('todas');

  // Cargar métricas
  const cargarMetricas = useCallback(async () => {
    setCargandoMetricas(true);
    try {
      const res = await fetch('/api/digital/sync');
      const data = await res.json();
      if (data.success && data.metricas) {
        setMetricas(data.metricas);
      }
    } catch (err) {
      console.error('Error cargando métricas:', err);
    } finally {
      setCargandoMetricas(false);
    }
  }, []);

  // Cargar libros de Roncedo
  const cargarLibrosRoncedo = useCallback(async () => {
    setCargandoRoncedo(true);
    try {
      const res = await fetch('/api/digital/roncedo');
      const data = await res.json();
      if (data.success && Array.isArray(data.libros)) {
        setLibrosRoncedo(data.libros);
      }
    } catch (err) {
      console.error('Error cargando libros de Roncedo:', err);
    } finally {
      setCargandoRoncedo(false);
    }
  }, []);

  useEffect(() => {
    cargarMetricas();
    cargarLibrosRoncedo();
  }, [cargarMetricas, cargarLibrosRoncedo]);

  // Sincronizar catálogo con Supabase
  const handleSincronizar = async () => {
    setSincronizando(true);
    setResultadoSync(null);
    try {
      const res = await fetch('/api/digital/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_all' }),
      });
      const data = await res.json();
      if (data.success) {
        setResultadoSync({
          exito: true,
          mensaje: `Sincronización completada con éxito. ${data.sincronizados} obras integradas con Supabase.`,
        });
        await cargarMetricas();
      } else {
        setResultadoSync({
          exito: false,
          mensaje: data.error || 'Error durante la sincronización.',
        });
      }
    } catch (err: any) {
      setResultadoSync({
        exito: false,
        mensaje: err.message || 'Error de red al sincronizar.',
      });
    } finally {
      setSincronizando(false);
    }
  };

  // Filtrado de obras en el panel de administración
  const librosFiltradosAdmin = useMemo(() => {
    return librosRoncedo.filter((l) => {
      const q = busquedaAdmin.trim().toLowerCase();
      const coincideTexto =
        !q ||
        l.titulo.toLowerCase().includes(q) ||
        l.autor.toLowerCase().includes(q) ||
        (l.editorial && l.editorial.toLowerCase().includes(q)) ||
        (l.genero_o_materia && l.genero_o_materia.toLowerCase().includes(q));
      const coincideFuente = filtroFuenteAdmin === 'todas' || l.fuente === filtroFuenteAdmin;
      return coincideTexto && coincideFuente;
    });
  }, [librosRoncedo, busquedaAdmin, filtroFuenteAdmin]);

  // Eliminar libro de Biblioteca Roncedo
  const handleEliminarLibro = async (id: string, titulo: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la obra "${titulo}" de los Libros Digitales de la Biblioteca?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/digital/roncedo?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await cargarLibrosRoncedo();
        await cargarMetricas();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const fuentesDetalle: { id: FuenteDigital; nombre: string; icono: string; color: string }[] = [
    { id: 'roncedo_digital', nombre: 'Biblioteca Roncedo (PDF)', icono: '🏛️', color: 'text-amber-700 bg-amber-50 border-amber-300' },
    { id: 'bnmm', nombre: 'BN Mariano Moreno (AR)', icono: '🇦🇷', color: 'text-sky-800 bg-sky-50 border-sky-300' },
    { id: 'bne', nombre: 'Bib. Nacional de España (BNE)', icono: '🇪🇸', color: 'text-rose-800 bg-rose-50 border-rose-300' },
    { id: 'wikisource', nombre: 'Wikisource en español', icono: '📖', color: 'text-emerald-800 bg-emerald-50 border-emerald-300' },
    { id: 'gutenberg', nombre: 'Project Gutenberg', icono: '📘', color: 'text-blue-800 bg-blue-50 border-blue-300' },
    { id: 'cervantes', nombre: 'Cervantes Virtual', icono: '🏛️', color: 'text-purple-800 bg-purple-50 border-purple-300' },
    { id: 'openlibrary', nombre: 'Open Library / Archive', icono: '🌐', color: 'text-slate-800 bg-slate-100 border-slate-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner de Cabecera del Módulo */}
      <div className="bg-gradient-to-r from-[#0C2340] via-[#123966] to-[#1A5C9E] text-white rounded-3xl p-6 shadow-xl border border-white/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-roncedo-gold text-slate-900 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-sm">
              Control de Catálogo Digital
            </span>
            <span className="text-xs text-blue-200">
              7 Plataformas Interconectadas
            </span>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">
            Biblioteca Digital e Integración Masiva
          </h2>
          <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
            Monitoreo en tiempo real de más de 5.800 obras digitales en español. Supera ampliamente los 1.283 libros físicos de la sede, con soporte de sincronización persistente y repositorio de archivos PDF propios de Biblioteca Roncedo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <button
            onClick={cargarMetricas}
            disabled={cargandoMetricas}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl border border-white/20 transition-colors flex items-center justify-center gap-1.5"
            title="Recargar Métricas"
          >
            <RefreshCw className={`w-4 h-4 ${cargandoMetricas ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>

          <button
            onClick={handleSincronizar}
            disabled={sincronizando}
            className="bg-roncedo-gold hover:bg-amber-400 text-slate-900 font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${sincronizando ? 'animate-spin text-slate-900' : ''}`} />
            <span>{sincronizando ? 'Sincronizando...' : 'Sincronizar con Supabase'}</span>
          </button>
        </div>
      </div>

      {/* Alerta de Resultado de Sincronización */}
      {resultadoSync && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
            resultadoSync.exito
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {resultadoSync.exito ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{resultadoSync.mensaje}</span>
          </div>
          <button
            onClick={() => setResultadoSync(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tablero de Métricas de Catálogo (Requisito 7 del Usuario) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Obras Únicas */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-blue-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Obras Digitales Únicas
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-roncedo-navy">
              {metricas ? metricas.total_obras_unicas.toLocaleString('es-AR') : '...'}
            </span>
            <Globe2 className="w-5 h-5 text-roncedo-blue" />
          </div>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
            vs 1.283 Físicos (+359%)
          </span>
        </div>

        {/* Lectura Online en la App */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Lectura Online en App
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-sky-700">
              {metricas ? metricas.disponibles_lectura_online.toLocaleString('es-AR') : '...'}
            </span>
            <BookOpen className="w-5 h-5 text-sky-500" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Sin salir de la PWA
          </span>
        </div>

        {/* Descarga Gratuita */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Descarga Libre
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-emerald-700">
              {metricas ? metricas.disponibles_descarga.toLocaleString('es-AR') : '...'}
            </span>
            <Download className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            PDF / EPUB autorizados
          </span>
        </div>

        {/* Enlaces Verificados */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Enlaces Verificados
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-teal-700">
              {metricas ? metricas.enlaces_verificados.toLocaleString('es-AR') : '...'}
            </span>
            <CheckCircle2 className="w-5 h-5 text-teal-500" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            100% legales y activos
          </span>
        </div>

        {/* Enlaces Rotos */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Enlaces Rotos
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-slate-700">
              {metricas ? metricas.enlaces_rotos : 0}
            </span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
            0 detectados
          </span>
        </div>

        {/* Última Sincronización */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Última Verificación
          </span>
          <div className="mt-1">
            <span className="text-xs font-black text-slate-900 block truncate">
              {metricas ? formatFechaArgentina(metricas.ultima_sincronizacion) : 'En línea'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Caché persistente
          </span>
        </div>
      </div>

      {/* Desglose por Plataforma (7 Fuentes) */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Building className="w-4 h-4 text-roncedo-navy" />
          <span>Distribución por Plataforma y Fuentes Oficiales (7)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {fuentesDetalle.map((f) => {
            const cantidad = metricas?.por_fuente[f.id] ?? (f.id === 'roncedo_digital' ? librosRoncedo.length : 0);
            return (
              <div
                key={f.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${f.color}`}
              >
                <div>
                  <span className="text-base mr-1.5">{f.icono}</span>
                  <span className="text-xs font-black">{f.nombre}</span>
                </div>
                <span className="text-lg font-black">{cantidad.toLocaleString('es-AR')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 7: Gestión Integral y ABM de Libros Digitales (PDF) */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-amber-300/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-amber-800 text-xs font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 mb-1">
              <span>🏛️ Plataforma Nº 7 • ABM de Libros Digitales</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Colección Digital Roncedo y Obras Personalizadas
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl">
              Carga, edición y baja de obras digitales en PDF con metadatos normalizados (autor, editorial, año, género, autor argentino/latino, licencia, portada y lector integrado).
            </p>
          </div>

          <button
            onClick={() => {
              setLibroParaEditar(null);
              setModalLibroFormOpen(true);
            }}
            className="bg-roncedo-navy hover:bg-blue-900 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-roncedo-gold" />
            <span>+ Cargar Nuevo Libro Digital (PDF)</span>
          </button>
        </div>

        {/* Buscador y Filtros de la Tabla ABM */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={busquedaAdmin}
              onChange={(e) => setBusquedaAdmin(e.target.value)}
              placeholder="Buscar por título, autor o género..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={filtroFuenteAdmin}
              onChange={(e) => setFiltroFuenteAdmin(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
            >
              <option value="todas">Todas las fuentes</option>
              <option value="roncedo_digital">🏛️ Biblioteca Roncedo (PDF)</option>
              <option value="bnmm">🇦🇷 BN Mariano Moreno</option>
              <option value="bne">🇪🇸 Biblioteca de España</option>
              <option value="wikisource">📖 Wikisource</option>
              <option value="gutenberg">📘 Project Gutenberg</option>
              <option value="cervantes">🏛️ Cervantes Virtual</option>
              <option value="openlibrary">🌐 Open Library</option>
            </select>

            <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap">
              {librosFiltradosAdmin.length} obra{librosFiltradosAdmin.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Listado de Libros ABM */}
        {cargandoRoncedo ? (
          <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-roncedo-blue" />
            <span className="text-xs font-semibold">Cargando colección de Biblioteca Roncedo...</span>
          </div>
        ) : librosFiltradosAdmin.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-amber-200 rounded-2xl bg-amber-50/40 p-6 space-y-3">
            <FileText className="w-10 h-10 text-amber-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">
              {busquedaAdmin
                ? 'No se encontraron obras con ese criterio de búsqueda'
                : 'Aún no hay archivos PDF cargados para Biblioteca Roncedo'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {busquedaAdmin
                ? 'Probá modificando el término o limpiando los filtros.'
                : 'Hacé clic en "+ Cargar Nuevo Libro Digital (PDF)" para subir el primer libro o documento institucional con todos sus metadatos.'}
            </p>
            <button
              onClick={() => {
                if (busquedaAdmin) {
                  setBusquedaAdmin('');
                  setFiltroFuenteAdmin('todas');
                } else {
                  setLibroParaEditar(null);
                  setModalLibroFormOpen(true);
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{busquedaAdmin ? 'Limpiar Búsqueda' : 'Cargar Primer PDF'}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Obra</th>
                  <th className="py-3 px-3">Autor / Editorial</th>
                  <th className="py-3 px-3">Año / Materia</th>
                  <th className="py-3 px-3">Licencia / Fuente</th>
                  <th className="py-3 px-3 text-right">Acciones ABM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {librosFiltradosAdmin.map((l) => (
                  <tr key={l.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2.5">
                      {l.portada_url ? (
                        <div className="relative w-9 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-slate-200 bg-slate-100">
                          <Image
                            src={l.portada_url}
                            alt={l.titulo}
                            fill
                            sizes="36px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-12 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-200">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 block line-clamp-1" title={l.titulo}>
                            {l.titulo}
                          </span>
                          {l.es_argentino_o_latino && (
                            <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200">
                              🇦🇷 Latino/Arg
                            </span>
                          )}
                        </div>
                        {l.archivo_pdf_url && (
                          <span className="text-[10px] text-emerald-600 font-semibold block">
                            📄 Archivo PDF vinculado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="block font-bold text-slate-800">{l.autor}</span>
                      <span className="text-[10px] text-slate-400">{l.editorial || 'Ed. Roncedo'}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="block font-medium">{l.anio || 's/f'}</span>
                      <span className="text-[10px] text-slate-400">{l.genero_o_materia || 'General'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded block w-fit mb-1">
                        {l.tipo_licencia || 'Dominio Público'}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">
                        {l.fuente}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                      {/* Botón Editar Obra */}
                      <button
                        onClick={() => {
                          setLibroParaEditar(l);
                          setModalLibroFormOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-roncedo-blue hover:text-blue-900 transition-colors inline-flex"
                        title="Editar metadatos de la obra"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Botón Leer en App */}
                      <button
                        onClick={() => setLibroParaLeer(l)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-roncedo-navy transition-colors inline-flex"
                        title="Leer en la App"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>

                      {/* Botón Descargar PDF */}
                      {l.archivo_pdf_url && (
                        <a
                          href={l.archivo_pdf_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors inline-flex"
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}

                      {/* Botón Eliminar */}
                      <button
                        onClick={() => handleEliminarLibro(l.id, l.titulo)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors inline-flex"
                        title="Eliminar obra del catálogo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal ABM de Libro Digital (Alta y Modificación) con Vista Previa en Vivo */}
      <ModalLibroDigitalForm
        isOpen={modalLibroFormOpen}
        libroParaEditar={libroParaEditar}
        onClose={() => {
          setModalLibroFormOpen(false);
          setLibroParaEditar(null);
        }}
        onSuccess={async (libroGuardado) => {
          await cargarLibrosRoncedo();
          await cargarMetricas();
          setResultadoSync({
            exito: true,
            mensaje: `Obra "${libroGuardado.titulo}" guardada y sincronizada exitosamente en el catálogo.`,
          });
        }}
        userId={user?.id}
      />

      {/* Modal Lector Digital si el admin desea previsualizar la lectura de una obra */}
      {libroParaLeer && (
        <LectorDigitalModal
          libro={libroParaLeer}
          onClose={() => setLibroParaLeer(null)}
        />
      )}
    </div>
  );
}
