'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Check,
  X,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckSquare,
  Square,
  AlertCircle,
  ExternalLink,
  Layers,
  Calendar,
  User,
  Building,
  Tag,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { IsbnMetadata, formatearIsbn } from '@/lib/isbn/isbnService';

export interface DatosLibroEdicion {
  titulo: string;
  autor: string;
  editorial?: string;
  edicion_anio?: string | number;
  isbn?: string;
  portada_url?: string;
  categoria?: string;
  sinopsis?: string;
}

interface ModalRevisionBibliograficaIsbnProps {
  isOpen: boolean;
  onClose: () => void;
  libroActual: DatosLibroEdicion;
  metadataEncontrada: IsbnMetadata | null;
  onAplicarCambios: (camposSeleccionados: Partial<DatosLibroEdicion>) => void;
}

export function ModalRevisionBibliograficaIsbn({
  isOpen,
  onClose,
  libroActual,
  metadataEncontrada,
  onAplicarCambios,
}: ModalRevisionBibliograficaIsbnProps) {
  // Estados para selección granular de campos a aplicar
  const [aplicarTitulo, setAplicarTitulo] = useState(true);
  const [aplicarAutor, setAplicarAutor] = useState(true);
  const [aplicarEditorial, setAplicarEditorial] = useState(true);
  const [aplicarAnio, setAplicarAnio] = useState(true);
  const [aplicarPortada, setAplicarPortada] = useState(true);
  const [aplicarIsbn, setAplicarIsbn] = useState(true);
  const [aplicarCategoria, setAplicarCategoria] = useState(true);
  const [aplicarSinopsis, setAplicarSinopsis] = useState(true);

  // Inicializar selección según si hay diferencias válidas
  useEffect(() => {
    if (metadataEncontrada) {
      setAplicarTitulo(Boolean(metadataEncontrada.titulo && metadataEncontrada.titulo !== libroActual.titulo));
      setAplicarAutor(Boolean(metadataEncontrada.autorTexto && metadataEncontrada.autorTexto !== libroActual.autor));
      setAplicarEditorial(Boolean(metadataEncontrada.editorial && metadataEncontrada.editorial !== (libroActual.editorial || '')));
      setAplicarAnio(Boolean(metadataEncontrada.anio_publicacion && String(metadataEncontrada.anio_publicacion) !== String(libroActual.edicion_anio || '')));
      setAplicarPortada(Boolean(metadataEncontrada.portada_url && metadataEncontrada.portada_url !== (libroActual.portada_url || '')));
      setAplicarIsbn(Boolean(metadataEncontrada.isbn13 || metadataEncontrada.isbn));
      setAplicarCategoria(Boolean(metadataEncontrada.categoria));
      setAplicarSinopsis(Boolean(metadataEncontrada.sinopsis));
    }
  }, [metadataEncontrada, libroActual]);

  if (!isOpen || !metadataEncontrada) return null;

  const handleSeleccionarTodos = () => {
    setAplicarTitulo(Boolean(metadataEncontrada.titulo));
    setAplicarAutor(Boolean(metadataEncontrada.autorTexto));
    setAplicarEditorial(Boolean(metadataEncontrada.editorial));
    setAplicarAnio(Boolean(metadataEncontrada.anio_publicacion));
    setAplicarPortada(Boolean(metadataEncontrada.portada_url));
    setAplicarIsbn(Boolean(metadataEncontrada.isbn13 || metadataEncontrada.isbn));
    setAplicarCategoria(Boolean(metadataEncontrada.categoria));
    setAplicarSinopsis(Boolean(metadataEncontrada.sinopsis));
  };

  const handleDeseleccionarTodos = () => {
    setAplicarTitulo(false);
    setAplicarAutor(false);
    setAplicarEditorial(false);
    setAplicarAnio(false);
    setAplicarPortada(false);
    setAplicarIsbn(false);
    setAplicarCategoria(false);
    setAplicarSinopsis(false);
  };

  const handleConfirmar = () => {
    const cambios: Partial<DatosLibroEdicion> = {};

    if (aplicarTitulo && metadataEncontrada.titulo) {
      cambios.titulo = metadataEncontrada.titulo;
    }
    if (aplicarAutor && metadataEncontrada.autorTexto) {
      cambios.autor = metadataEncontrada.autorTexto;
    }
    if (aplicarEditorial && metadataEncontrada.editorial) {
      cambios.editorial = metadataEncontrada.editorial;
    }
    if (aplicarAnio && metadataEncontrada.anio_publicacion) {
      cambios.edicion_anio = String(metadataEncontrada.anio_publicacion);
    }
    if (aplicarPortada && metadataEncontrada.portada_url) {
      cambios.portada_url = metadataEncontrada.portada_url;
    }
    if (aplicarIsbn) {
      cambios.isbn = metadataEncontrada.isbn13 || metadataEncontrada.isbn;
    }
    if (aplicarCategoria && metadataEncontrada.categoria) {
      cambios.categoria = metadataEncontrada.categoria;
    }
    if (aplicarSinopsis && metadataEncontrada.sinopsis) {
      cambios.sinopsis = metadataEncontrada.sinopsis;
    }

    onAplicarCambios(cambios);
    onClose();
  };

  const fuenteLabel =
    metadataEncontrada.fuente === 'google_books'
      ? 'Google Books API'
      : metadataEncontrada.fuente === 'open_library'
      ? 'Open Library API'
      : 'Google Books + Open Library';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] shadow-2xl flex flex-col border border-slate-200 overflow-hidden my-auto">
        {/* Cabecera */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-roncedo-navy via-[#1B4E85] to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-roncedo-gold/20 border border-roncedo-gold/40 flex items-center justify-center text-roncedo-gold flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-300/30">
                  Revisión Bibliográfica Inteligente
                </span>
                <span className="text-[10px] text-blue-200 flex items-center gap-1 font-medium">
                  Fuente: {fuenteLabel}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black leading-tight mt-0.5">
                Datos Encontrados para ISBN: {formatearIsbn(metadataEncontrada.isbn13 || metadataEncontrada.isbn)}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Cerrar sin aplicar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de control rápido de selección */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">
              Seleccioná los campos que deseás aplicar a la ficha:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSeleccionarTodos}
              className="text-roncedo-navy hover:text-blue-900 font-bold text-[11px] hover:underline"
            >
              Seleccionar todos
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleDeseleccionarTodos}
              className="text-slate-500 hover:text-slate-800 font-medium text-[11px] hover:underline"
            >
              Deseleccionar
            </button>
          </div>
        </div>

        {/* Cuerpo de Comparación / Diff */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Alerta de Confianza */}
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-3">
            <BadgeCheck className="w-5 h-5 text-roncedo-blue flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-700 leading-relaxed">
              <strong className="text-roncedo-navy">Control Bibliográfico Roncedo:</strong> Podés revisar
              campo por campo la información obtenida. Ningún dato existente será sobrescrito sin tu
              aprobación explícita.
            </div>
          </div>

          {/* Grilla comparativa: Portada */}
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none self-start sm:self-center">
              <input
                type="checkbox"
                checked={aplicarPortada}
                disabled={!metadataEncontrada.portada_url}
                onChange={(e) => setAplicarPortada(e.target.checked)}
                className="w-4 h-4 rounded text-roncedo-navy border-slate-300 focus:ring-roncedo-blue"
              />
              <span className="font-bold text-slate-800 text-xs">Foto de Portada</span>
            </label>

            <div className="flex-1 flex items-center justify-around w-full gap-4">
              {/* Portada actual */}
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Actual</span>
                <div className="relative w-16 h-24 rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs mx-auto flex items-center justify-center">
                  {libroActual.portada_url ? (
                    <Image
                      src={libroActual.portada_url}
                      alt="Portada actual"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="text-[9px] text-slate-400 px-1 text-center">Sin portada</span>
                  )}
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />

              {/* Portada encontrada */}
              <div className="text-center">
                <span className="text-[10px] text-emerald-600 block mb-1 font-bold uppercase">Encontrada en API</span>
                <div className="relative w-16 h-24 rounded-lg border-2 border-emerald-400 bg-white overflow-hidden shadow-md mx-auto flex items-center justify-center">
                  {metadataEncontrada.portada_url ? (
                    <Image
                      src={metadataEncontrada.portada_url}
                      alt="Nueva portada encontrada"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="text-[9px] text-slate-400 px-1 text-center">No disponible</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Grilla de campos de texto */}
          <div className="space-y-3">
            {/* Título */}
            <div className={`p-3.5 rounded-2xl border transition-all ${aplicarTitulo ? 'border-roncedo-blue/40 bg-blue-50/30' : 'border-slate-200 bg-slate-50/40'}`}>
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={aplicarTitulo}
                    disabled={!metadataEncontrada.titulo}
                    onChange={(e) => setAplicarTitulo(e.target.checked)}
                    className="w-4 h-4 rounded text-roncedo-navy border-slate-300 focus:ring-roncedo-blue"
                  />
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <BookOpen className="w-3.5 h-3.5 text-roncedo-blue" />
                    <span>Título de la Obra</span>
                  </div>
                </label>
                {metadataEncontrada.titulo && metadataEncontrada.titulo !== libroActual.titulo && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                    Modifica valor actual
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 pt-2 border-t border-slate-200/60 text-[11px]">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Actual en ficha:</span>
                  <p className="font-medium text-slate-700 mt-0.5 break-words">
                    {libroActual.titulo || <span className="text-slate-400 italic">Vacío</span>}
                  </p>
                </div>
                <div>
                  <span className="text-emerald-700 font-bold block text-[10px] uppercase">Encontrado en API:</span>
                  <p className="font-bold text-slate-900 mt-0.5 break-words">
                    {metadataEncontrada.titulo || <span className="text-slate-400 italic">No disponible</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Autor */}
            <div className={`p-3.5 rounded-2xl border transition-all ${aplicarAutor ? 'border-roncedo-blue/40 bg-blue-50/30' : 'border-slate-200 bg-slate-50/40'}`}>
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={aplicarAutor}
                    disabled={!metadataEncontrada.autorTexto}
                    onChange={(e) => setAplicarAutor(e.target.checked)}
                    className="w-4 h-4 rounded text-roncedo-navy border-slate-300 focus:ring-roncedo-blue"
                  />
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <User className="w-3.5 h-3.5 text-roncedo-blue" />
                    <span>Autor / Autores</span>
                  </div>
                </label>
                {metadataEncontrada.autorTexto && metadataEncontrada.autorTexto !== libroActual.autor && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                    Modifica valor actual
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 pt-2 border-t border-slate-200/60 text-[11px]">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Actual en ficha:</span>
                  <p className="font-medium text-slate-700 mt-0.5 break-words">
                    {libroActual.autor || <span className="text-slate-400 italic">Vacío</span>}
                  </p>
                </div>
                <div>
                  <span className="text-emerald-700 font-bold block text-[10px] uppercase">Encontrado en API:</span>
                  <p className="font-bold text-slate-900 mt-0.5 break-words">
                    {metadataEncontrada.autorTexto || <span className="text-slate-400 italic">No disponible</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Editorial */}
            <div className={`p-3.5 rounded-2xl border transition-all ${aplicarEditorial ? 'border-roncedo-blue/40 bg-blue-50/30' : 'border-slate-200 bg-slate-50/40'}`}>
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={aplicarEditorial}
                    disabled={!metadataEncontrada.editorial}
                    onChange={(e) => setAplicarEditorial(e.target.checked)}
                    className="w-4 h-4 rounded text-roncedo-navy border-slate-300 focus:ring-roncedo-blue"
                  />
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Building className="w-3.5 h-3.5 text-roncedo-blue" />
                    <span>Editorial</span>
                  </div>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 pt-2 border-t border-slate-200/60 text-[11px]">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Actual en ficha:</span>
                  <p className="font-medium text-slate-700 mt-0.5 break-words">
                    {libroActual.editorial || <span className="text-slate-400 italic">Sin editorial</span>}
                  </p>
                </div>
                <div>
                  <span className="text-emerald-700 font-bold block text-[10px] uppercase">Encontrado en API:</span>
                  <p className="font-bold text-slate-900 mt-0.5 break-words">
                    {metadataEncontrada.editorial || <span className="text-slate-400 italic">No disponible</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Año de Publicación / Edición */}
            <div className={`p-3.5 rounded-2xl border transition-all ${aplicarAnio ? 'border-roncedo-blue/40 bg-blue-50/30' : 'border-slate-200 bg-slate-50/40'}`}>
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={aplicarAnio}
                    disabled={!metadataEncontrada.anio_publicacion}
                    onChange={(e) => setAplicarAnio(e.target.checked)}
                    className="w-4 h-4 rounded text-roncedo-navy border-slate-300 focus:ring-roncedo-blue"
                  />
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-roncedo-blue" />
                    <span>Año de Edición / Publicación</span>
                  </div>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 pt-2 border-t border-slate-200/60 text-[11px]">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Actual en ficha:</span>
                  <p className="font-medium text-slate-700 mt-0.5">
                    {libroActual.edicion_anio ? String(libroActual.edicion_anio) : <span className="text-slate-400 italic">Sin año</span>}
                  </p>
                </div>
                <div>
                  <span className="text-emerald-700 font-bold block text-[10px] uppercase">Encontrado en API:</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {metadataEncontrada.anio_publicacion ? String(metadataEncontrada.anio_publicacion) : <span className="text-slate-400 italic">No disponible</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* ISBN Normalizado */}
            <div className={`p-3.5 rounded-2xl border transition-all ${aplicarIsbn ? 'border-roncedo-blue/40 bg-blue-50/30' : 'border-slate-200 bg-slate-50/40'}`}>
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={aplicarIsbn}
                    disabled={!metadataEncontrada.isbn13 && !metadataEncontrada.isbn}
                    onChange={(e) => setAplicarIsbn(e.target.checked)}
                    className="w-4 h-4 rounded text-roncedo-navy border-slate-300 focus:ring-roncedo-blue"
                  />
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Tag className="w-3.5 h-3.5 text-roncedo-blue" />
                    <span>ISBN Normalizado (ISBN-13 e ISBN-10)</span>
                  </div>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 pt-2 border-t border-slate-200/60 text-[11px]">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Actual en ficha:</span>
                  <p className="font-mono text-slate-700 mt-0.5">
                    {libroActual.isbn ? formatearIsbn(libroActual.isbn) : <span className="text-slate-400 italic">Sin ISBN</span>}
                  </p>
                </div>
                <div>
                  <span className="text-emerald-700 font-bold block text-[10px] uppercase">Encontrado y validado:</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">
                    {formatearIsbn(metadataEncontrada.isbn13 || metadataEncontrada.isbn)}
                    {metadataEncontrada.isbn10 && (
                      <span className="text-[10px] text-slate-500 font-normal block font-sans">
                        (Equivalente ISBN-10: {metadataEncontrada.isbn10})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Categoría / Género (si está disponible) */}
            {metadataEncontrada.categoria && (
              <div className={`p-3.5 rounded-2xl border transition-all ${aplicarCategoria ? 'border-roncedo-blue/40 bg-blue-50/30' : 'border-slate-200 bg-slate-50/40'}`}>
                <div className="flex items-start justify-between gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={aplicarCategoria}
                      onChange={(e) => setAplicarCategoria(e.target.checked)}
                      className="w-4 h-4 rounded text-roncedo-navy border-slate-300 focus:ring-roncedo-blue"
                    />
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Layers className="w-3.5 h-3.5 text-roncedo-blue" />
                      <span>Categoría / Temática</span>
                    </div>
                  </label>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                  <span className="text-emerald-700 font-bold block text-[10px] uppercase">Encontrado en API:</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{metadataEncontrada.categoria}</p>
                </div>
              </div>
            )}

            {/* Sinopsis / Reseña (si está disponible) */}
            {metadataEncontrada.sinopsis && (
              <div className={`p-3.5 rounded-2xl border transition-all ${aplicarSinopsis ? 'border-roncedo-blue/40 bg-blue-50/30' : 'border-slate-200 bg-slate-50/40'}`}>
                <div className="flex items-start justify-between gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={aplicarSinopsis}
                      onChange={(e) => setAplicarSinopsis(e.target.checked)}
                      className="w-4 h-4 rounded text-roncedo-navy border-slate-300 focus:ring-roncedo-blue"
                    />
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <FileText className="w-3.5 h-3.5 text-roncedo-blue" />
                      <span>Sinopsis Bibliográfica Oficial</span>
                    </div>
                  </label>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                  <span className="text-emerald-700 font-bold block text-[10px] uppercase">Reseña recuperada:</span>
                  <p className="text-slate-700 mt-1 max-h-24 overflow-y-auto leading-relaxed bg-white p-2 rounded-xl border border-slate-200">
                    {metadataEncontrada.sinopsis}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pie con Acciones */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors"
          >
            Descartar y Cerrar
          </button>

          <button
            type="button"
            onClick={handleConfirmar}
            className="bg-roncedo-navy hover:bg-blue-900 text-white font-black px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Check className="w-4 h-4 text-roncedo-gold" />
            <span>Aplicar Campos Seleccionados a la Ficha</span>
          </button>
        </div>
      </div>
    </div>
  );
}
