'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ActaHistorica, FolioArchivo } from '@/types';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Info,
  BookOpen,
  Calendar,
  Users,
  Award,
  Edit3,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ActaVisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  actaSeleccionada: ActaHistorica | null;
  folioSeleccionado: FolioArchivo | null;
  todosLosFolios: FolioArchivo[];
  todasLasActas: ActaHistorica[];
  onCambiarPagina: (numeroPagina: number) => void;
  isAdmin: boolean;
  isSocioProtector?: boolean;
  onEditarActa?: (acta: ActaHistorica) => void;
}

export function ActaVisorModal({
  isOpen,
  onClose,
  actaSeleccionada,
  folioSeleccionado,
  todosLosFolios,
  todasLasActas,
  onCambiarPagina,
  isAdmin,
  isSocioProtector,
  onEditarActa,
}: ActaVisorModalProps) {
  // Estado del visor de imagen
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabActiva, setTabActiva] = useState<'transcripcion' | 'ficha' | 'miniaturas'>('transcripcion');
  const [isPanning, setIsPanning] = useState(false);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Determinar página actual activa
  const paginaActual = folioSeleccionado?.numero_pagina || actaSeleccionada?.pagina_archivo_inicio || 1;
  const totalPaginas = todosLosFolios.length || 102;

  // Folio y Acta activos para la página actual
  const folioActual =
    todosLosFolios.find((f) => f.numero_pagina === paginaActual) ||
    folioSeleccionado ||
    todosLosFolios[0];

  const actaActual =
    actaSeleccionada ||
    todasLasActas.find(
      (a) => paginaActual >= a.pagina_archivo_inicio && paginaActual <= a.pagina_archivo_fin
    ) ||
    null;

  // Reset de transformaciones al cambiar de página
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPanPos({ x: 0, y: 0 });
  }, [paginaActual]);

  // Manejo de atajos de teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        if (paginaActual < totalPaginas) onCambiarPagina(paginaActual + 1);
      } else if (e.key === 'ArrowLeft') {
        if (paginaActual > 1) onCambiarPagina(paginaActual - 1);
      } else if (e.key === '+' || e.key === '=') {
        setZoom((z) => Math.min(z + 0.25, 3.5));
      } else if (e.key === '-') {
        setZoom((z) => Math.max(z - 0.25, 0.5));
      } else if (e.key === '0') {
        setZoom(1);
        setPanPos({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, paginaActual, totalPaginas, isFullscreen, onClose, onCambiarPagina]);

  if (!isOpen) return null;

  const currentImageUrl =
    folioActual?.imagen_url || `/api/actas/image?file=Libro%20Nb0%201-${paginaActual}.jpg`;

  // Controles de zoom
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.3, 3.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.3, 0.6));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
    setPanPos({ x: 0, y: 0 });
  };
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  // Arrastre (Pan) al estar con zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - panPos.x, y: e.clientY - panPos.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoom <= 1) return;
    setPanPos({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        ref={modalContainerRef}
        className={`relative w-full bg-[#0D1B2A] text-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/60 ${
          isFullscreen ? 'h-full max-h-none rounded-none' : 'max-w-7xl h-[92vh]'
        }`}
      >
        {/* Barra Superior de Control y Título */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#112233] border-b border-slate-700/80 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-roncedo-celeste flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-roncedo-celesteLight bg-blue-900/50 px-2 py-0.5 rounded border border-blue-700/40">
                  {folioActual?.libro || 'Libro N° 1 de Actas'}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  Página {paginaActual} de {totalPaginas}
                  {folioActual?.folio ? ` • Folio ${folioActual.folio} (${folioActual.lado})` : ''}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md sm:max-w-xl">
                {actaActual?.titulo || `Folio Manuscrito #${folioActual?.folio || paginaActual}`}
              </h2>
            </div>
          </div>

          {/* Permisos & Cierre */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {isAdmin ? (
              <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs px-2.5 py-1 rounded-lg border border-amber-500/40">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="font-semibold">Modo Administrador</span>
              </div>
            ) : isSocioProtector ? (
              <div className="hidden sm:flex items-center gap-1.5 bg-rose-500/20 text-rose-300 text-xs px-2.5 py-1 rounded-lg border border-rose-500/40">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-semibold">Socio Protector (Lectura)</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-xs px-2.5 py-1 rounded-lg border border-blue-500/40">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="font-semibold">Consulta / Solo Lectura</span>
              </div>
            )}

            {/* Si es Admin, botón rápido para editar metadatos */}
            {isAdmin && actaActual && onEditarActa && (
              <button
                onClick={() => {
                  onEditarActa(actaActual);
                }}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow transition-colors"
                title="Editar datos históricos de esta acta"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Editar Acta</span>
              </button>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-colors"
              title="Cerrar visor (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo Principal: Imagen HD + Panel Lateral */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Zona de Imagen / Documento Original */}
          <div
            className="flex-1 bg-black/60 relative flex items-center justify-center overflow-hidden select-none cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Controles flotantes sobre la imagen */}
            <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-[#0D1B2A]/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700 shadow-lg">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.6}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-300 disabled:opacity-40 transition-colors"
                title="Reducir zoom (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold px-1 text-roncedo-celesteLight">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3.5}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-300 disabled:opacity-40 transition-colors"
                title="Aumentar zoom (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-700 mx-1" />
              <button
                onClick={handleRotate}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-300 transition-colors"
                title="Rotar 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="text-[11px] px-2 py-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                title="Ajustar al centro (0)"
              >
                Centrar
              </button>
            </div>

            {/* Botón de descarga de imagen de alta resolución */}
            <div className="absolute top-3 right-3 z-30">
              <a
                href={currentImageUrl}
                download={`Acta-Roncedo-Pagina-${paginaActual}.jpg`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-[#0D1B2A]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors shadow-lg"
                title="Descargar documento en alta resolución"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Descargar HD</span>
              </a>
            </div>

            {/* Botones de Navegación Página Anterior / Siguiente */}
            <button
              onClick={() => paginaActual > 1 && onCambiarPagina(paginaActual - 1)}
              disabled={paginaActual <= 1}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[#0D1B2A]/80 hover:bg-roncedo-celeste text-white disabled:opacity-20 disabled:hover:bg-[#0D1B2A]/80 transition-all shadow-xl backdrop-blur-sm"
              title="Página Anterior (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => paginaActual < totalPaginas && onCambiarPagina(paginaActual + 1)}
              disabled={paginaActual >= totalPaginas}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[#0D1B2A]/80 hover:bg-roncedo-celeste text-white disabled:opacity-20 disabled:hover:bg-[#0D1B2A]/80 transition-all shadow-xl backdrop-blur-sm"
              title="Página Siguiente (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Contenedor del documento escaneado */}
            <div
              className="w-full h-full flex items-center justify-center p-4 transition-transform duration-75 ease-out"
              style={{
                transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoom}) rotate(${rotation}deg)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImageUrl}
                alt={`Acta página ${paginaActual}`}
                className="max-h-full max-w-full object-contain shadow-2xl rounded-sm border border-slate-800"
                draggable={false}
              />
            </div>
          </div>

          {/* Panel Lateral: Transcripción, Ficha Histórica y Miniaturas */}
          <div className="w-full lg:w-[420px] bg-[#112233] border-t lg:border-t-0 lg:border-l border-slate-700/80 flex flex-col h-72 lg:h-full z-20">
            {/* Pestañas del Panel */}
            <div className="flex items-center border-b border-slate-700/80 bg-[#0D1B2A]">
              <button
                onClick={() => setTabActiva('transcripcion')}
                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  tabActiva === 'transcripcion'
                    ? 'border-roncedo-celeste text-roncedo-celesteLight bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Transcripción Fiel</span>
              </button>
              <button
                onClick={() => setTabActiva('ficha')}
                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  tabActiva === 'ficha'
                    ? 'border-roncedo-celeste text-roncedo-celesteLight bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Ficha Histórica</span>
              </button>
              <button
                onClick={() => setTabActiva('miniaturas')}
                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  tabActiva === 'miniaturas'
                    ? 'border-roncedo-celeste text-roncedo-celesteLight bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Folios ({totalPaginas})</span>
              </button>
            </div>

            {/* Contenido según pestaña */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {tabActiva === 'transcripcion' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-roncedo-celesteLight">
                      Lectura Paleográfica Accesible
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      Transcripción fiel 1926
                    </span>
                  </div>

                  {actaActual?.transcripcion_completa ? (
                    <div className="bg-[#0A1624] p-4 rounded-xl border border-slate-700/80 text-xs sm:text-sm text-slate-200 leading-relaxed font-serif whitespace-pre-line shadow-inner">
                      {actaActual.transcripcion_completa}
                    </div>
                  ) : (
                    <div className="bg-[#0A1624] p-5 rounded-xl border border-slate-700/80 text-center space-y-2">
                      <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-300 font-medium">
                        Transcripción paleográfica en proceso de digitalización para este folio.
                      </p>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        {folioActual?.resumen_breve ||
                          'Documento original preservado en alta resolución. Puedes utilizar el visor para examinar la caligrafía histórica.'}
                      </p>
                      {isAdmin && (
                        <div className="pt-2">
                          <button
                            onClick={() => actaActual && onEditarActa && onEditarActa(actaActual)}
                            className="text-xs text-amber-400 hover:underline font-bold inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Agregar transcripción como Administrador</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {actaActual?.resumen && (
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                      <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Resumen Institucional
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{actaActual.resumen}</p>
                    </div>
                  )}
                </div>
              )}

              {tabActiva === 'ficha' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">
                      {actaActual?.titulo || `Folio de Acta #${folioActual?.folio || paginaActual}`}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Archivo Digital Oficial • Biblioteca Roncedo
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#0A1624] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Fecha</span>
                      <span className="font-semibold text-white">
                        {actaActual?.fecha || (folioActual?.anio_estimado ? `Año ${folioActual.anio_estimado}` : '1926')}
                      </span>
                    </div>

                    <div className="bg-[#0A1624] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Tipo de Reunión
                      </span>
                      <span className="font-semibold text-roncedo-celesteLight">
                        {actaActual?.tipo_reunion || 'Acta Oficial'}
                      </span>
                    </div>

                    <div className="bg-[#0A1624] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Folio / Página
                      </span>
                      <span className="font-semibold text-white">
                        Folio {folioActual?.folio} ({folioActual?.lado}) • Pág. {paginaActual}
                      </span>
                    </div>

                    <div className="bg-[#0A1624] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Conservación
                      </span>
                      <span className="font-semibold text-emerald-400">Excelente (Legible)</span>
                    </div>
                  </div>

                  {actaActual?.firmantes && actaActual.firmantes.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-roncedo-celeste" />
                        <span>Firmantes y Autoridades Presentes ({actaActual.firmantes.length})</span>
                      </h4>
                      <div className="space-y-1.5">
                        {actaActual.firmantes.map((f, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-[#0A1624] px-3 py-1.5 rounded-lg border border-slate-800 text-xs"
                          >
                            <span className="font-semibold text-white">{f.nombre}</span>
                            {f.cargo && (
                              <span className="text-[10px] text-roncedo-celesteLight bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                                {f.cargo}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {actaActual?.temas_tratados && actaActual.temas_tratados.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-roncedo-celeste" />
                        <span>Temas e Hitos Tratados</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {actaActual.temas_tratados.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-slate-800 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {actaActual?.notas_archivista && (
                    <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-800/40">
                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-1">
                        Nota del Archivero
                      </h5>
                      <p className="text-xs text-amber-200/90 leading-relaxed">
                        {actaActual.notas_archivista}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {tabActiva === 'miniaturas' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-300 font-bold">
                      Índice rápido de los 102 folios
                    </span>
                    <span className="text-[11px] text-roncedo-celesteLight font-mono">
                      Pág. {paginaActual} / {totalPaginas}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {todosLosFolios.map((f) => {
                      const isActive = f.numero_pagina === paginaActual;
                      return (
                        <button
                          key={f.id}
                          onClick={() => onCambiarPagina(f.numero_pagina)}
                          className={`group relative aspect-[3/4] rounded-lg overflow-hidden border text-left transition-all ${
                            isActive
                              ? 'border-roncedo-celeste ring-2 ring-roncedo-celeste scale-[1.03]'
                              : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={f.imagen_url}
                            alt={`Folio ${f.numero_pagina}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-black/80 p-1 text-[10px] text-center font-bold text-white">
                            Pág. {f.numero_pagina}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Barra Inferior del Panel Lateral: Salto de página */}
            <div className="p-3 bg-[#0D1B2A] border-t border-slate-700/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Ir a página:</span>
              <div className="flex items-center gap-1.5">
                <select
                  value={paginaActual}
                  onChange={(e) => onCambiarPagina(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-bold text-xs focus:ring-1 focus:ring-roncedo-celeste"
                >
                  {todosLosFolios.map((f) => (
                    <option key={f.id} value={f.numero_pagina}>
                      Página {f.numero_pagina} (Folio {f.folio} {f.lado})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
