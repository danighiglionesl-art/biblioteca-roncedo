'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Film,
  FileText,
  Save,
  Trash2,
  AlertTriangle,
  Sparkles,
  Link as LinkIcon,
  MessageSquare,
  Calendar,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { ItemRoncedo, TipoItemRoncedo, CategoriaItemRoncedo } from '@/types/roncedo';
import { subirArchivoRoncedo } from '@/lib/supabase/roncedoService';

interface ModalABMRoncedoProps {
  isOpen: boolean;
  onClose: () => void;
  itemAEditar?: ItemRoncedo | null;
  onGuardar: (datos: Omit<ItemRoncedo, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onEliminar?: (id: string) => Promise<void>;
}

const CATEGORIAS_DISPONIBLES: CategoriaItemRoncedo[] = [
  'Medicina y Humanismo',
  'Cartas y Documentos',
  'Vida Personal y Familia',
  'Club e Historia Fundacional',
  'Homenajes y Reconocimientos',
  'General',
];

export function ModalABMRoncedo({
  isOpen,
  onClose,
  itemAEditar,
  onGuardar,
  onEliminar,
}: ModalABMRoncedoProps) {
  const isEditing = Boolean(itemAEditar);

  const [tipo, setTipo] = useState<TipoItemRoncedo>(itemAEditar?.tipo || 'foto');
  const [titulo, setTitulo] = useState(itemAEditar?.titulo || '');
  const [descripcion, setDescripcion] = useState(itemAEditar?.descripcion || '');
  const [comentarioAdmin, setComentarioAdmin] = useState(itemAEditar?.comentario_admin || '');
  const [url, setUrl] = useState(itemAEditar?.url || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(itemAEditar?.thumbnail_url || '');
  const [fechaOAnio, setFechaOAnio] = useState(itemAEditar?.fecha_o_anio || '');
  const [categoria, setCategoria] = useState<CategoriaItemRoncedo>(
    itemAEditar?.categoria || 'Medicina y Humanismo'
  );
  const [duracionOPaginas, setDuracionOPaginas] = useState(itemAEditar?.duracion_o_paginas || '');

  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemAEditar) {
      setTipo(itemAEditar.tipo);
      setTitulo(itemAEditar.titulo);
      setDescripcion(itemAEditar.descripcion || '');
      setComentarioAdmin(itemAEditar.comentario_admin || '');
      setUrl(itemAEditar.url);
      setThumbnailUrl(itemAEditar.thumbnail_url || '');
      setFechaOAnio(itemAEditar.fecha_o_anio || '');
      setCategoria(itemAEditar.categoria);
      setDuracionOPaginas(itemAEditar.duracion_o_paginas || '');
    } else {
      setTipo('foto');
      setTitulo('');
      setDescripcion('');
      setComentarioAdmin('');
      setUrl('');
      setThumbnailUrl('');
      setFechaOAnio(new Date().getFullYear().toString());
      setCategoria('Medicina y Humanismo');
      setDuracionOPaginas('');
    }
    setError(null);
  }, [itemAEditar, isOpen]);

  if (!isOpen) return null;

  // Manejar subida local de foto o PDF
  const handleSubirArchivoLocal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setError('El archivo no debe superar los 25 MB.');
      return;
    }

    try {
      setSubiendoArchivo(true);
      setError(null);
      const res = await subirArchivoRoncedo(file, tipo === 'pdf' ? 'pdf' : 'foto');
      if (res.success && res.url) {
        setUrl(res.url);
        if (tipo === 'foto' && !thumbnailUrl) {
          setThumbnailUrl(res.url);
        }
      } else {
        setError(res.error || 'Error al subir el archivo.');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al subir el archivo.');
    } finally {
      setSubiendoArchivo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('El título de la pieza histórica es obligatorio.');
      return;
    }
    if (!url.trim()) {
      setError('Debes ingresar o subir el archivo multimedia (URL o archivo).');
      return;
    }

    try {
      setGuardando(true);
      setError(null);

      await onGuardar({
        tipo,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        comentario_admin: comentarioAdmin.trim(),
        url: url.trim(),
        thumbnail_url: thumbnailUrl.trim() || undefined,
        fecha_o_anio: fechaOAnio.trim() || '1926',
        categoria,
        duracion_o_paginas: duracionOPaginas.trim() || undefined,
        creado_por: 'biblioroncedo',
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el ítem.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 text-slate-100 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col border border-amber-500/30 overflow-hidden my-auto">
        {/* Cabecera Museo */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-roncedo-navyDark to-blue-950 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-roncedo-gold text-slate-950 flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-roncedo-gold">
                Museo Digital Dr. Lautaro Roncedo • Panel Administrador
              </span>
              <h2 className="text-lg font-black leading-tight text-white">
                {isEditing ? `Modificar Ítem: "${itemAEditar?.titulo}"` : 'Agregar Nuevo Archivo al Museo Roncedo'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 text-red-200 rounded-xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Selector de Tipo de Archivo: Foto / Video / PDF */}
          <div>
            <label className="block font-bold text-amber-300 uppercase tracking-wider text-[10px] mb-2">
              Tipo de Pieza Histórica *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTipo('foto')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs transition-all border ${
                  tipo === 'foto'
                    ? 'bg-roncedo-gold text-slate-950 border-amber-300 shadow-md scale-102'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Foto</span>
              </button>

              <button
                type="button"
                onClick={() => setTipo('video')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs transition-all border ${
                  tipo === 'video'
                    ? 'bg-roncedo-gold text-slate-950 border-amber-300 shadow-md scale-102'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Video</span>
              </button>

              <button
                type="button"
                onClick={() => setTipo('pdf')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs transition-all border ${
                  tipo === 'pdf'
                    ? 'bg-roncedo-gold text-slate-950 border-amber-300 shadow-md scale-102'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Archivo PDF</span>
              </button>
            </div>
          </div>

          {/* Título de la pieza */}
          <div>
            <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">
              Título de la Pieza Histórica *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Retrato del Dr. Lautaro Roncedo en su Despacho Médico"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 font-bold text-white focus:outline-none focus:ring-2 focus:ring-roncedo-gold"
            />
          </div>

          {/* Categoría y Fecha / Año */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                Sala / Categoría Temática *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaItemRoncedo)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 font-bold text-white focus:outline-none focus:ring-2 focus:ring-roncedo-gold"
              >
                {CATEGORIAS_DISPONIBLES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                Año o Fecha Aproximada
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fechaOAnio}
                  onChange={(e) => setFechaOAnio(e.target.value)}
                  placeholder="Ej: 1924, 26 de Marzo de 1926"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-roncedo-gold"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Subida de Archivo o URL */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
            <span className="font-bold text-amber-300 block text-xs flex items-center gap-1.5">
              <Upload className="w-4 h-4" />
              <span>Archivo Multimedia o Enlace ({tipo.toUpperCase()}) *</span>
            </span>

            {/* Opciones de carga según el tipo */}
            {tipo === 'video' ? (
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Enlace directo de YouTube o video MP4:
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono text-xs focus:ring-2 focus:ring-roncedo-gold"
                  />
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer bg-roncedo-gold hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm">
                    {subiendoArchivo ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    ) : tipo === 'foto' ? (
                      <Camera className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <span>{subiendoArchivo ? 'Subiendo a la nube...' : `Subir ${tipo === 'foto' ? 'Foto' : 'PDF'} desde dispositivo`}</span>
                    <input
                      type="file"
                      accept={tipo === 'foto' ? 'image/*' : 'application/pdf'}
                      disabled={subiendoArchivo}
                      onChange={handleSubirArchivoLocal}
                      className="hidden"
                    />
                  </label>

                  {url && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Archivo cargado
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">O ingresar URL directa:</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={tipo === 'foto' ? 'https://.../foto.webp' : 'https://.../documento.pdf'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:ring-2 focus:ring-roncedo-gold"
                  />
                </div>
              </div>
            )}

            {/* Duración o Páginas opcional */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">
                Detalle técnico (Duración / Páginas / Formato)
              </label>
              <input
                type="text"
                value={duracionOPaginas}
                onChange={(e) => setDuracionOPaginas(e.target.value)}
                placeholder={tipo === 'video' ? 'Ej: 14 min' : tipo === 'pdf' ? 'Ej: 3 páginas (PDF facsimilar)' : 'Ej: Fotografía original restaurada'}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs focus:ring-2 focus:ring-roncedo-gold"
              />
            </div>
          </div>

          {/* Descripción Histórica */}
          <div>
            <label className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1">
              Descripción y Contexto Histórico
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Explicación histórica de la pieza, origen, protagonistas y significado patrimonial..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 font-medium text-white focus:outline-none focus:ring-2 focus:ring-roncedo-gold resize-none leading-relaxed"
            />
          </div>

          {/* COMENTARIO EXCLUSIVO DEL ADMINISTRADOR (REQUERIMIENTO CENTRAL) */}
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-300">
              <MessageSquare className="w-4 h-4 text-roncedo-gold" />
              <label className="font-bold uppercase tracking-wider text-[10px]">
                Comentario Editorial del Administrador (Exclusivo biblioroncedo)
              </label>
            </div>
            <p className="text-[11px] text-amber-200/80">
              Este comentario aparecerá destacado con placa dorada de curaduría oficial en el visor del museo para todos los socios y usuarios de la app.
            </p>
            <textarea
              rows={3}
              value={comentarioAdmin}
              onChange={(e) => setComentarioAdmin(e.target.value)}
              placeholder="Ingresá tu testimonio, memoria bibliotecaria o anécdota destacada sobre esta pieza..."
              className="w-full bg-slate-900 border border-amber-500/40 rounded-xl p-3 font-medium text-amber-100 placeholder-amber-400/40 focus:outline-none focus:ring-2 focus:ring-roncedo-gold resize-none leading-relaxed"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            {itemAEditar && onEliminar ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Estás seguro de que deseas eliminar este archivo del museo?')) {
                    onEliminar(itemAEditar.id);
                    onClose();
                  }
                }}
                className="text-red-400 hover:text-red-300 font-bold px-3 py-2 rounded-xl hover:bg-red-950/50 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Pieza</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando || subiendoArchivo}
                className="bg-roncedo-gold hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{guardando ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Publicar en Museo'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
