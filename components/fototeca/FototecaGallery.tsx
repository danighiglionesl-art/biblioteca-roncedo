'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { FotoHistorica, ColeccionFoto } from '@/types';
import { getFotosHistoricas } from '@/lib/supabase/fototeca';
import { FotoDetalleModal } from './FotoDetalleModal';
import { SubirFotoModal } from './SubirFotoModal';
import {
  Camera,
  Search,
  Calendar,
  Sparkles,
  Users,
  MapPin,
  Plus,
  Filter,
  ShieldCheck,
  Flag,
  Grid3X3,
  Clock,
  Layers,
  Heart,
  ChevronRight,
  Info,
  Building,
} from 'lucide-react';

const DECADAS = [
  'Todas',
  '1920s',
  '1930s',
  '1940s',
  '1950s',
  '1960s',
  '1970s',
  '1980s',
  '1990s',
  '2000s+',
];

const COLECCIONES: ColeccionFoto[] = [
  'Todas',
  'Club Roncedo y Deportes',
  'Alcira Gigena e Historia Urbana',
  'Familias y Vecinos Ilustres',
  'Escuelas e Instituciones',
  'Fiestas y Tradición',
  'Dr. Lautaro Roncedo',
];

export function FototecaGallery() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [fotos, setFotos] = useState<FotoHistorica[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDecada, setSelectedDecada] = useState('Todas');
  const [selectedColeccion, setSelectedColeccion] = useState<ColeccionFoto>('Todas');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [onlyReported, setOnlyReported] = useState(false);

  // Modales
  const [selectedFoto, setSelectedFoto] = useState<FotoHistorica | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Cargar fotos iniciales / de Supabase
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await getFotosHistoricas();
      setFotos(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Filtrado reactivo en tiempo real
  const fotosFiltradas = useMemo(() => {
    return fotos.filter((f) => {
      // Si no es admin y está oculta por moderación, no mostrar
      if (!isAdmin && f.estado_moderacion === 'oculta') {
        return false;
      }

      // Filtro especial admin de fotos reportadas
      if (onlyReported && f.estado_moderacion !== 'reportada') {
        return false;
      }

      // Filtro por década
      if (selectedDecada !== 'Todas') {
        if (selectedDecada === '2000s+') {
          const anio = f.anio_estimado || 0;
          if (anio < 2000) return false;
        } else if (f.decada !== selectedDecada) {
          return false;
        }
      }

      // Filtro por colección temática
      if (selectedColeccion !== 'Todas' && f.coleccion !== selectedColeccion) {
        return false;
      }

      // Búsqueda textual inteligente (título, descripción, personas, lugar, acontecimiento)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitulo = f.titulo.toLowerCase().includes(query);
        const matchDesc = f.descripcion?.toLowerCase().includes(query) ?? false;
        const matchLugar = f.lugar?.toLowerCase().includes(query) ?? false;
        const matchAcontecimiento = f.acontecimiento?.toLowerCase().includes(query) ?? false;
        const matchPersonas =
          f.etiquetas_personas?.some((et) =>
            et.nombre_persona.toLowerCase().includes(query)
          ) ?? false;
        const matchDonante = f.donante_fuente?.toLowerCase().includes(query) ?? false;

        return (
          matchTitulo ||
          matchDesc ||
          matchLugar ||
          matchAcontecimiento ||
          matchPersonas ||
          matchDonante
        );
      }

      return true;
    });
  }, [fotos, selectedDecada, selectedColeccion, searchTerm, onlyReported, isAdmin]);

  // Manejo de actualización de foto tras comentar, etiquetar o moderar
  const handleFotoActualizada = (updatedFoto: FotoHistorica) => {
    setFotos((prev) => prev.map((f) => (f.id === updatedFoto.id ? updatedFoto : f)));
    setSelectedFoto(updatedFoto);
  };

  const handleFotoSubida = (nuevaFoto: FotoHistorica) => {
    setFotos((prev) => [nuevaFoto, ...prev]);
    setSelectedFoto(nuevaFoto);
  };

  const reportadasCount = useMemo(() => {
    return fotos.filter((f) => f.estado_moderacion === 'reportada').length;
  }, [fotos]);

  return (
    <div className="space-y-6">
      {/* Cabecera Principal y Barra de Aporte Comunitario */}
      <div className="bg-gradient-to-r from-roncedo-navy via-[#143968] to-roncedo-celesteDark text-white rounded-3xl p-6 sm:p-8 shadow-card border border-white/10 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-roncedo-celesteLight border border-white/15 mb-3">
            <Camera className="w-3.5 h-3.5" />
            <span>Archivo Fotográfico Comunitario</span>
            <span className="w-1 h-1 rounded-full bg-roncedo-gold" />
            <span className="text-roncedo-gold font-bold">Patrimonio Histórico</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
            Fototeca Histórica Inteligente
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-2xl mb-6">
            Preservamos en alta resolución los rostros, hazañas deportivas y momentos que construyeron la historia del Club Sportivo y Biblioteca Dr. Lautaro Roncedo y de todo Alcira Gigena.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 bg-roncedo-gold hover:bg-[#d6a536] text-roncedo-navy font-bold px-5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-lg hover:scale-[1.02] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Aportar una Fotografía</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-blue-200 bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-2xl border border-white/10">
              <Sparkles className="w-4 h-4 text-roncedo-gold flex-shrink-0" />
              <span>Publicación directa y reconocimiento de personas</span>
            </div>
          </div>
        </div>

        {/* Adorno visual de fondo */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-72 h-72 bg-roncedo-celeste/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Alerta de Moderador para Administrador */}
      {isAdmin && reportadasCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-bold">Panel de Moderación:</span>
              <span className="ml-1">
                Hay {reportadasCount} {reportadasCount === 1 ? 'fotografía reportada' : 'fotografías reportadas'} por vecinos para revisar.
              </span>
            </div>
          </div>
          <button
            onClick={() => setOnlyReported(!onlyReported)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
              onlyReported
                ? 'bg-amber-600 text-white'
                : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
            }`}
          >
            {onlyReported ? 'Ver Todo el Archivo' : 'Ver Reportadas'}
          </button>
        </div>
      )}

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-card border border-blue-100/80 space-y-4">
        {/* Input de Búsqueda Inteligente */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por persona, lugar, acontecimiento o año (ej: Rostagno, Pileta, 1968, Belgrano)..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-roncedo-celeste focus:ring-4 focus:ring-roncedo-celeste/10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filtro por Décadas (Línea de tiempo) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-roncedo-celeste" />
              <span>Explorar por Décadas:</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-roncedo-navy shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista Cuadrícula"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-white text-roncedo-navy shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista Cronológica"
              >
                <Clock className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {DECADAS.map((dec) => (
              <button
                key={dec}
                onClick={() => setSelectedDecada(dec)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDecada === dec
                    ? 'bg-roncedo-navy text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {dec}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por Colecciones Temáticas */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-roncedo-celeste" />
            <span>Colección Temática:</span>
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {COLECCIONES.map((col) => (
              <button
                key={col}
                onClick={() => setSelectedColeccion(col)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedColeccion === col
                    ? 'bg-roncedo-celeste text-white shadow-sm font-bold'
                    : 'bg-blue-50/70 hover:bg-blue-100 text-slate-700 border border-blue-100'
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grilla / Listado de Fotografías */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl h-72 animate-pulse border border-slate-200/80 p-4"
            />
          ))}
        </div>
      ) : fotosFiltradas.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6'
              : 'space-y-6 max-w-3xl mx-auto'
          }
        >
          {fotosFiltradas.map((foto) => (
            <div
              key={foto.id}
              onClick={() => setSelectedFoto(foto)}
              className="bg-white rounded-3xl overflow-hidden border border-blue-100 shadow-card hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col hover:-translate-y-1"
            >
              {/* Imagen con Aspect Ratio y Badges */}
              <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                <img
                  src={foto.imagen_url}
                  alt={foto.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                  loading="lazy"
                />

                {/* Badges superpuestos */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                  <span className="bg-roncedo-navy/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/20">
                    {foto.decada || (foto.anio_estimado ? `${foto.anio_estimado}` : 'Histórica')}
                  </span>
                  {foto.destacada && (
                    <span className="bg-roncedo-gold text-roncedo-navy text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Destacada</span>
                    </span>
                  )}
                </div>

                {/* Badge de personas identificadas */}
                {(foto.etiquetas_personas?.length ?? 0) > 0 && (
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-white/10">
                    <Users className="w-3.5 h-3.5 text-roncedo-celesteLight" />
                    <span>{foto.etiquetas_personas?.length} identificados</span>
                  </div>
                )}

                {/* Estado de Moderación (si no está pública o si es reportada) */}
                {foto.estado_moderacion === 'reportada' && (
                  <div className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    <span>Reportada</span>
                  </div>
                )}
                {foto.estado_moderacion === 'oculta' && (
                  <div className="absolute top-3 right-3 bg-slate-800 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Oculta
                  </div>
                )}
              </div>

              {/* Contenido de la Tarjeta */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-roncedo-celesteDark mb-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{foto.lugar || 'Alcira Gigena'}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-roncedo-celesteDark transition-colors leading-snug line-clamp-2">
                    {foto.titulo}
                  </h3>

                  {foto.descripcion && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {foto.descripcion}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">
                    {foto.donante_fuente ? `Donación: ${foto.donante_fuente}` : 'Biblioteca Roncedo'}
                  </span>
                  <span className="text-roncedo-celesteDark font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                    <span>Ver</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-blue-100 shadow-card max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-roncedo-celesteDark flex items-center justify-center mx-auto">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No se encontraron fotografías
          </h3>
          <p className="text-xs text-slate-500">
            Probá ajustando la búsqueda o el filtro de décadas, o sé el primero en subir un recuerdo para este período.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedDecada('Todas');
              setSelectedColeccion('Todas');
              setOnlyReported(false);
            }}
            className="text-xs font-bold text-roncedo-celesteDark hover:underline pt-2 block mx-auto"
          >
            Restablecer todos los filtros
          </button>
        </div>
      )}

      {/* Modal de Detalle / Lightbox */}
      <FotoDetalleModal
        foto={selectedFoto}
        onClose={() => setSelectedFoto(null)}
        onFotoActualizada={handleFotoActualizada}
      />

      {/* Modal de Carga de Fotografías */}
      <SubirFotoModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFotoSubida={handleFotoSubida}
      />
    </div>
  );
}
