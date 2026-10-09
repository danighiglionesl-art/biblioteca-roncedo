'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ActaHistorica, FolioArchivo } from '@/types';
import {
  BookOpen,
  Calendar,
  Users,
  Award,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  FileText,
  Grid3X3,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface ActasExploradorProps {
  actas: ActaHistorica[];
  folios: FolioArchivo[];
  onVerActa: (acta: ActaHistorica) => void;
  onVerFolio: (folio: FolioArchivo) => void;
  isAdmin: boolean;
  onEditarActa: (acta: ActaHistorica) => void;
  onEliminarActa: (acta: ActaHistorica) => void;
}

export function ActasExplorador({
  actas,
  folios,
  onVerActa,
  onVerFolio,
  isAdmin,
  onEditarActa,
  onEliminarActa,
}: ActasExploradorProps) {
  const [vistaModo, setVistaModo] = useState<'actas' | 'libro' | 'folios'>('actas');

  // Estado para el Modo Libro interactivo
  const [paginaLibroActual, setPaginaLibroActual] = useState(1);

  const folioActualLibro =
    folios.find((f) => f.numero_pagina === paginaLibroActual) || folios[0];

  const actaAsociadaLibro = actas.find(
    (a) =>
      paginaLibroActual >= a.pagina_archivo_inicio && paginaLibroActual <= a.pagina_archivo_fin
  );

  return (
    <div className="space-y-6">
      {/* Selector de Modos de Exploración */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl shadow-sm border border-blue-200/80">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setVistaModo('actas')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              vistaModo === 'actas'
                ? 'bg-[#0F284B] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-roncedo-celeste" />
            <span>Actas y Resoluciones ({actas.length})</span>
          </button>

          <button
            onClick={() => setVistaModo('libro')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              vistaModo === 'libro'
                ? 'bg-[#0F284B] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Visor Libro Folio a Folio</span>
          </button>

          <button
            onClick={() => setVistaModo('folios')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              vistaModo === 'folios'
                ? 'bg-[#0F284B] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Grid3X3 className="w-4 h-4 text-emerald-400" />
            <span>Galería de Folios ({folios.length})</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 pr-3">
          <span>Libro N° 1 (1926-1932)</span>
          <span>•</span>
          <span>Alcira Gigena</span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* VISTA 1: ACTAS HISTÓRICAS E HITOS */}
      {/* =================================================================== */}
      {vistaModo === 'actas' && (
        <div className="space-y-4">
          {actas.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-blue-200/80 shadow-sm space-y-3">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                No se encontraron actas con los filtros actuales
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Prueba a restablecer la búsqueda o seleccionar otro año en los filtros superiores.
              </p>
            </div>
          ) : (
            actas.map((acta) => (
              <div
                key={acta.id}
                className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-blue-200/70 hover:border-roncedo-celeste/60 hover:shadow-md transition-all group relative overflow-hidden"
              >
                {/* Indicador de acta destacada */}
                {acta.es_destacada && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-400 text-white text-[10px] uppercase font-black px-4 py-1 rounded-bl-2xl shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Hito Histórico</span>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Miniatura del folio inicial */}
                  <div
                    onClick={() => onVerActa(acta)}
                    className="relative w-full lg:w-44 h-56 sm:h-60 lg:h-52 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex-shrink-0 cursor-pointer group-hover:scale-[1.02] transition-transform"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        acta.imagenes_urls?.[0] ||
                        `/api/actas/image?file=Libro%20Nb0%201-${acta.pagina_archivo_inicio}.jpg`
                      }
                      alt={acta.titulo}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-roncedo-celesteLight">
                        Páginas {acta.pagina_archivo_inicio} a {acta.pagina_archivo_fin}
                      </span>
                      <span className="text-xs font-bold truncate">
                        Folio {acta.folio_inicio}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/95 text-slate-900 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg">
                        <Eye className="w-4 h-4 text-roncedo-celeste" />
                        <span>Abrir Visor</span>
                      </div>
                    </div>
                  </div>

                  {/* Contenido y Metadatos */}
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-[#0F284B] text-white px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide">
                        Acta N° {acta.numero_acta}
                      </span>
                      <span className="bg-blue-100/80 text-blue-900 border border-blue-300/50 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{acta.fecha}</span>
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {acta.tipo_reunion}
                      </span>
                      <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                        • {acta.libro}
                      </span>
                    </div>

                    <h3
                      onClick={() => onVerActa(acta)}
                      className="text-base sm:text-lg font-black text-slate-900 hover:text-roncedo-celeste cursor-pointer transition-colors"
                    >
                      {acta.titulo}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {acta.resumen}
                    </p>

                    {/* Firmantes */}
                    {acta.firmantes && acta.firmantes.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1">
                          <Users className="w-3 h-3" />
                          <span>Firmantes destacados:</span>
                        </span>
                        {acta.firmantes.slice(0, 5).map((f, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200"
                          >
                            <strong>{f.nombre}</strong>
                            {f.cargo && <span className="text-slate-500"> ({f.cargo})</span>}
                          </span>
                        ))}
                        {acta.firmantes.length > 5 && (
                          <span className="text-[10px] text-slate-500 font-bold">
                            +{acta.firmantes.length - 5} más
                          </span>
                        )}
                      </div>
                    )}

                    {/* Temas Tratados */}
                    {acta.temas_tratados && acta.temas_tratados.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {acta.temas_tratados.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                      <button
                        onClick={() => onVerActa(acta)}
                        className="inline-flex items-center gap-2 bg-[#0F284B] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-colors"
                      >
                        <Eye className="w-4 h-4 text-roncedo-celesteLight" />
                        <span>Ver Documento Original y Transcripción</span>
                      </button>

                      {/* Acciones de Administrador */}
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEditarActa(acta)}
                            className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl transition-colors"
                            title="Editar acta"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => onEliminarActa(acta)}
                            className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-300 px-3 py-1.5 rounded-xl transition-colors"
                            title="Eliminar acta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* VISTA 2: VISOR DEL LIBRO FOLIO A FOLIO */}
      {/* =================================================================== */}
      {vistaModo === 'libro' && (
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-blue-200/80 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-roncedo-celesteDark tracking-wider">
                Lectura Continua de Archivo
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Libro N° 1 de Actas • Página {paginaLibroActual} de {folios.length}
              </h2>
              <p className="text-xs text-slate-500">
                Folio {folioActualLibro?.folio} ({folioActualLibro?.lado}) • {folioActualLibro?.anio_estimado}
              </p>
            </div>

            {/* Selector rápido de página */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Salto rápido:</span>
              <select
                value={paginaLibroActual}
                onChange={(e) => setPaginaLibroActual(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
              >
                {folios.map((f) => (
                  <option key={f.id} value={f.numero_pagina}>
                    Página {f.numero_pagina} (Folio {f.folio} {f.lado})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navegador con imagen central grande */}
          <div className="relative bg-[#0B1522] rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center min-h-[500px] border border-slate-800 shadow-inner">
            {/* Botón Anterior */}
            <button
              onClick={() => paginaLibroActual > 1 && setPaginaLibroActual(paginaLibroActual - 1)}
              disabled={paginaLibroActual <= 1}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-roncedo-celeste text-white disabled:opacity-20 transition-all shadow-lg backdrop-blur-sm"
              title="Página Anterior (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Botón Siguiente */}
            <button
              onClick={() => paginaLibroActual < folios.length && setPaginaLibroActual(paginaLibroActual + 1)}
              disabled={paginaLibroActual >= folios.length}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-roncedo-celeste text-white disabled:opacity-20 transition-all shadow-lg backdrop-blur-sm"
              title="Página Siguiente (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Documento escaneado */}
            <div
              onClick={() => onVerFolio(folioActualLibro)}
              className="relative max-w-2xl w-full aspect-[2/3] sm:aspect-[3/4] cursor-pointer group flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={folioActualLibro?.imagen_url}
                alt={`Página ${paginaLibroActual}`}
                className="max-h-[520px] w-auto object-contain rounded-lg shadow-2xl border border-slate-700 group-hover:scale-[1.01] transition-transform"
              />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-lg">
                <div className="bg-white/95 text-slate-900 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xl">
                  <Eye className="w-4 h-4 text-roncedo-celeste" />
                  <span>Abrir con Zoom en Alta Definición</span>
                </div>
              </div>
            </div>

            {/* Slider de navegación */}
            <div className="w-full max-w-xl mt-6 px-4 space-y-2">
              <input
                type="range"
                min={1}
                max={folios.length}
                value={paginaLibroActual}
                onChange={(e) => setPaginaLibroActual(Number(e.target.value))}
                className="w-full accent-roncedo-celeste cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Pág. 1 (1926)</span>
                <span className="text-white font-bold">
                  Página {paginaLibroActual} / {folios.length}
                </span>
                <span>Pág. {folios.length} (1932)</span>
              </div>
            </div>
          </div>

          {/* Información del folio actual */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {actaAsociadaLibro ? actaAsociadaLibro.titulo : `Folio Manuscrito N° ${folioActualLibro?.folio}`}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {actaAsociadaLibro?.resumen || folioActualLibro?.resumen_breve}
              </p>
            </div>

            <button
              onClick={() => onVerFolio(folioActualLibro)}
              className="flex items-center gap-2 bg-[#0F284B] hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-colors flex-shrink-0"
            >
              <Eye className="w-4 h-4 text-roncedo-celesteLight" />
              <span>Ver en Alta Resolución</span>
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VISTA 3: GALERÍA DE LOS 102 FOLIOS DIGITALIZADOS */}
      {/* =================================================================== */}
      {vistaModo === 'folios' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-blue-200/80">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Catálogo Digital de 102 Folios Escaneados
              </h3>
              <p className="text-xs text-slate-500">
                Haz clic sobre cualquier folio para examinarlo en alta definición con zoom y transcripción.
              </p>
            </div>
            <span className="text-xs font-bold bg-blue-100 text-blue-900 px-3 py-1 rounded-full">
              {folios.length} Folios Disponibles
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {folios.map((folio) => (
              <div
                key={folio.id}
                onClick={() => onVerFolio(folio)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-roncedo-celeste hover:shadow-lg transition-all cursor-pointer flex flex-col"
              >
                {/* Imagen */}
                <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={folio.imagen_url}
                    alt={`Folio ${folio.numero_pagina}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                    Pág. {folio.numero_pagina}
                  </div>
                  {folio.numero_acta_asociada && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      Acta {folio.numero_acta_asociada}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white drop-shadow" />
                  </div>
                </div>

                {/* Pie de tarjeta */}
                <div className="p-2.5 text-[11px] bg-white flex flex-col justify-between flex-1">
                  <div className="font-bold text-slate-800 truncate">
                    Folio {folio.folio} ({folio.lado})
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>{folio.anio_estimado || '1926'}</span>
                    <span className="text-emerald-600 font-semibold">Excelente</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
