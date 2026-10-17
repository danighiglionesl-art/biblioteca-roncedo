'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Award,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Plus,
  Camera,
  Film,
  FileText,
  Calendar,
  Tag,
  Filter,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Heart,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ItemRoncedo, TipoItemRoncedo } from '@/types/roncedo';
import {
  getItemsRoncedo,
  crearItemRoncedo,
  actualizarItemRoncedo,
  eliminarItemRoncedo,
} from '@/lib/supabase/roncedoService';
import { MarchasRoncedoPlayer } from '@/components/roncedo/MarchasRoncedoPlayer';
import { ModalABMRoncedo } from '@/components/roncedo/ModalABMRoncedo';
import { VisorItemRoncedoModal } from '@/components/roncedo/VisorItemRoncedoModal';
import { getResumenReaccionesSocialesSync } from '@/lib/services/socialInteractionsService';

export default function RoncedoPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase().includes('biblioroncedo');

  // Estados del Archivo Histórico
  const [items, setItems] = useState<ItemRoncedo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | TipoItemRoncedo>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [modalAbmAbierto, setModalAbmAbierto] = useState(false);
  const [itemParaEditar, setItemParaEditar] = useState<ItemRoncedo | null>(null);
  const [itemParaVer, setItemParaVer] = useState<ItemRoncedo | null>(null);

  // Carga de datos
  const cargarItems = useCallback(async () => {
    try {
      setCargando(true);
      const data = await getItemsRoncedo();
      setItems(data);
    } catch (err) {
      console.error('Error al cargar archivo Roncedo:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarItems();
  }, [cargarItems]);

  // Manejo de ABM Guardar
  const handleGuardarItem = async (
    datos: Omit<ItemRoncedo, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (itemParaEditar) {
      await actualizarItemRoncedo(itemParaEditar.id, datos);
    } else {
      await crearItemRoncedo(datos);
    }
    await cargarItems();
    setItemParaEditar(null);
  };

  // Manejo de ABM Eliminar
  const handleEliminarItem = async (id: string) => {
    await eliminarItemRoncedo(id);
    await cargarItems();
    if (itemParaVer?.id === id) {
      setItemParaVer(null);
    }
  };

  // Filtrado de items
  const itemsFiltrados = items.filter((item) => {
    if (filtroTipo !== 'todos' && item.tipo !== filtroTipo) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const coincideTitulo = item.titulo.toLowerCase().includes(q);
      const coincideDesc = item.descripcion?.toLowerCase().includes(q);
      const coincideCat = item.categoria.toLowerCase().includes(q);
      const coincideAnio = item.fecha_o_anio?.toLowerCase().includes(q);
      if (!coincideTitulo && !coincideDesc && !coincideCat && !coincideAnio) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-28 pt-6 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Navegación Superior: Volver al Inicio */}
        <div className="flex items-center justify-between">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-xs font-bold text-roncedo-goldLight hover:text-white transition-colors bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-amber-500/30 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-roncedo-gold" />
            <span>Volver al Inicio</span>
          </Link>

          <span className="text-[11px] font-semibold text-slate-400">
            Biblioteca Roncedo • Museo Digital
          </span>
        </div>

        {/* Banner de Presentación Institucional del Museo */}
        <div className="bg-gradient-to-br from-slate-900 via-roncedo-navyDark to-blue-950 rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-roncedo-gold text-slate-900 flex items-center justify-center shadow-lg font-black flex-shrink-0">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-roncedo-gold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    Espacio Patrimonial y Comunitario
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                    Museo Digital Dr. Lautaro Roncedo
                  </h1>
                </div>
              </div>

              {/* Botón de Alta exclusivo para Administrador */}
              {isAdmin && (
                <button
                  onClick={() => {
                    setItemParaEditar(null);
                    setModalAbmAbierto(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-roncedo-gold hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all scale-100 hover:scale-102 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Nuevo Archivo (Admin)</span>
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Un espacio museológico virtual con estética patrimonial diferenciada dedicado a la memoria, cartas manuscritas, instrumental médico, fotografías personales, videos históricos y trayectoria comunitaria del querido Dr. Lautaro Roncedo. Todos los usuarios pueden reaccionar y dejar sus comentarios y memorias.
            </p>

            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-roncedo-goldLight mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-roncedo-gold" />
                <span>Salas y Archivos del Museo Digital:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-roncedo-gold flex-shrink-0" />
                  <span><strong>Galería Fotográfica Histórica:</strong> Retratos y vivencias comunitarias.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0">✓</span>
                  <span className="text-amber-200 font-semibold">
                    <strong>Archivo Sonoro y Marchas:</strong> Himno Tradicional y Versión Chébere.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-roncedo-gold flex-shrink-0" />
                  <span><strong>Archivo Epistolar y Manuscritos:</strong> Cartas y cuadernos en PDF.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-roncedo-gold flex-shrink-0" />
                  <span><strong>Archivo Audiovisual y Recuerdos:</strong> Documentales y testimonios.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Destacada: Archivo Sonoro - Las Dos Marchas del Club */}
        <section aria-label="Marchas del Club Sp. y Bibl. Dr. Lautaro Roncedo" className="space-y-4">
          <MarchasRoncedoPlayer />
        </section>

        {/* SECCIÓN DEL ARCHIVO HISTÓRICO CON ABM Y VISOR INTERACTIVO */}
        <section className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-roncedo-gold">
                Acervo Patrimonial Digitalizado
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Fotografías, Videos y Documentos PDF</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  {itemsFiltrados.length}
                </span>
              </h2>
            </div>

            {/* Buscador Rápido */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar en el archivo..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-roncedo-gold"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Filtros por tipo de archivo */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFiltroTipo('todos')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filtroTipo === 'todos'
                  ? 'bg-roncedo-gold text-slate-950 shadow-md font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>Todos</span>
              <span className="text-[10px] opacity-75">({items.length})</span>
            </button>

            <button
              onClick={() => setFiltroTipo('foto')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filtroTipo === 'foto'
                  ? 'bg-roncedo-gold text-slate-950 shadow-md font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Fotos</span>
              <span className="text-[10px] opacity-75">
                ({items.filter((i) => i.tipo === 'foto').length})
              </span>
            </button>

            <button
              onClick={() => setFiltroTipo('video')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filtroTipo === 'video'
                  ? 'bg-roncedo-gold text-slate-950 shadow-md font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Videos</span>
              <span className="text-[10px] opacity-75">
                ({items.filter((i) => i.tipo === 'video').length})
              </span>
            </button>

            <button
              onClick={() => setFiltroTipo('pdf')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filtroTipo === 'pdf'
                  ? 'bg-roncedo-gold text-slate-950 shadow-md font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Documentos PDF</span>
              <span className="text-[10px] opacity-75">
                ({items.filter((i) => i.tipo === 'pdf').length})
              </span>
            </button>
          </div>

          {/* Grilla de Piezas del Museo */}
          {cargando ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-roncedo-gold animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Cargando piezas del archivo patrimonial...</p>
            </div>
          ) : itemsFiltrados.length === 0 ? (
            <div className="py-16 text-center bg-slate-800/40 rounded-3xl border border-slate-700 p-8 space-y-3">
              <Award className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-200">No se encontraron piezas en esta categoría</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {busqueda ? 'Probá con otra búsqueda o limpiá el filtro.' : 'Pronto se digitalizarán nuevas piezas históricas.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {itemsFiltrados.map((item) => {
                const resumenSocial = getResumenReaccionesSocialesSync('roncedo', item.id);
                const totalReacciones = resumenSocial.total;

                return (
                  <div
                    key={item.id}
                    className="group bg-slate-800/80 hover:bg-slate-800 rounded-2xl border border-slate-700/80 hover:border-amber-500/40 shadow-lg transition-all duration-200 flex flex-col overflow-hidden relative"
                  >
                    {/* Contenedor Visual Superior */}
                    <div
                      onClick={() => setItemParaVer(item)}
                      className="relative h-44 bg-slate-950/80 cursor-pointer overflow-hidden flex items-center justify-center"
                    >
                      {item.tipo === 'foto' ? (
                        <img
                          src={item.thumbnail_url || item.url}
                          alt={item.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : item.tipo === 'video' ? (
                        <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-roncedo-gold/20 border border-roncedo-gold/40 flex items-center justify-center text-roncedo-gold mb-2 group-hover:scale-110 transition-transform shadow-lg">
                            <Film className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-300 line-clamp-1">
                            {item.duracion_o_paginas || 'Video Histórico'}
                          </span>
                        </div>
                      ) : (
                        <div className="relative w-full h-full bg-gradient-to-br from-amber-950/40 to-slate-950 flex flex-col items-center justify-center p-4 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition-transform shadow-lg">
                            <FileText className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-bold text-amber-200 line-clamp-1">
                            {item.duracion_o_paginas || 'Documento PDF'}
                          </span>
                        </div>
                      )}

                      {/* Badge de tipo de archivo */}
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-roncedo-gold border border-amber-500/30 flex items-center gap-1">
                        {item.tipo === 'foto' ? (
                          <Camera className="w-3 h-3" />
                        ) : item.tipo === 'video' ? (
                          <Film className="w-3 h-3" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        <span>{item.tipo}</span>
                      </span>

                      {/* Año badge */}
                      {item.fecha_o_anio && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 text-slate-300 text-[10px] font-semibold border border-white/10">
                          {item.fecha_o_anio}
                        </span>
                      )}

                      {/* Overlay Hover */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                        <span className="px-3 py-1.5 rounded-xl bg-roncedo-gold text-slate-950 font-black text-xs shadow-lg flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver y Comentar</span>
                        </span>
                      </div>
                    </div>

                    {/* Información y Metadatos */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-roncedo-gold">
                          <Tag className="w-3 h-3" />
                          <span className="truncate">{item.categoria}</span>
                        </div>

                        <h3
                          onClick={() => setItemParaVer(item)}
                          className="text-sm font-bold text-white hover:text-roncedo-gold cursor-pointer transition-colors line-clamp-2"
                        >
                          {item.titulo}
                        </h3>

                        {item.descripcion && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {item.descripcion}
                          </p>
                        )}
                      </div>

                      {/* Placa resumida si el Administrador dejó un comentario */}
                      {item.comentario_admin && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-roncedo-gold flex-shrink-0 mt-0.5" />
                          <p className="text-[11px] text-amber-200/90 italic line-clamp-2">
                            "{item.comentario_admin}"
                          </p>
                        </div>
                      )}

                      {/* Barra Inferior: Reacciones y Acciones */}
                      <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                        <button
                          onClick={() => setItemParaVer(item)}
                          className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 text-rose-500/70" />
                          <span className="text-[11px] font-bold">
                            {totalReacciones > 0 ? `${totalReacciones} reacciones` : 'Reaccionar'}
                          </span>
                        </button>

                        <div className="flex items-center gap-1">
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => {
                                  setItemParaEditar(item);
                                  setModalAbmAbierto(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-roncedo-gold hover:bg-white/5 transition-colors"
                                title="Editar (Admin)"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`¿Eliminar "${item.titulo}" del archivo?`)) {
                                    handleEliminarItem(item.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                                title="Eliminar (Admin)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setItemParaVer(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold transition-colors"
                          >
                            <span>Abrir</span>
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Modal ABM (Crear / Editar para Admin) */}
      <ModalABMRoncedo
        isOpen={modalAbmAbierto}
        onClose={() => {
          setModalAbmAbierto(false);
          setItemParaEditar(null);
        }}
        itemAEditar={itemParaEditar}
        onGuardar={handleGuardarItem}
        onEliminar={handleEliminarItem}
      />

      {/* Modal Visor de Pieza (Fotos, Videos, PDFs + Comentario de Curaduría + Reacciones/Comentarios Red Social) */}
      <VisorItemRoncedoModal
        item={itemParaVer}
        isOpen={Boolean(itemParaVer)}
        onClose={() => setItemParaVer(null)}
        isAdmin={isAdmin}
        onEditar={(item) => {
          setItemParaEditar(item);
          setModalAbmAbierto(true);
        }}
      />
    </div>
  );
}
