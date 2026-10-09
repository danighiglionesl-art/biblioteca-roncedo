'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { NovedadInstitucional } from '@/types';
import {
  X,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Share2,
  Bookmark,
  Sparkles,
  Star,
  Image as ImageIcon,
} from 'lucide-react';

interface ModalDetalleNovedadProps {
  novedad: NovedadInstitucional;
  onClose: () => void;
}

const CATEGORIA_COLORES: Record<string, { bg: string; text: string; border: string }> = {
  Institucional: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  Cultura: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  Libros: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  Archivo: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
};

export function ModalDetalleNovedad({ novedad, onClose }: ModalDetalleNovedadProps) {
  const [fotoActiva, setFotoActiva] = useState(0);

  const fotos = novedad.imagenes && novedad.imagenes.length > 0
    ? novedad.imagenes
    : novedad.imagen_url
    ? [novedad.imagen_url]
    : [];

  const colStyle = CATEGORIA_COLORES[novedad.categoria] || CATEGORIA_COLORES['Institucional'];

  const handleCopiarEnlace = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      alert('Enlace de la noticia copiado al portapapeles');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Cabecera del modal */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className={`${colStyle.bg} ${colStyle.text} ${colStyle.border} border text-[11px] font-bold px-2.5 py-0.5 rounded-full`}>
              {novedad.categoria}
            </span>
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              {novedad.fecha}
            </span>
            {novedad.destacado && (
              <span className="text-amber-800 bg-amber-100 border border-amber-300 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Destacada
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Galería de Fotografías (Hasta 5 fotos con visor HD y miniaturas) */}
          {fotos.length > 0 && (
            <div className="space-y-2">
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-950 shadow-md">
                <Image
                  src={fotos[fotoActiva] || fotos[0]}
                  alt={`${novedad.titulo} - Foto ${fotoActiva + 1}`}
                  fill
                  className="object-contain"
                  unoptimized
                />

                {/* Flechas de navegación para múltiples fotos */}
                {fotos.length > 1 && (
                  <>
                    <button
                      onClick={() => setFotoActiva((prev) => (prev > 0 ? prev - 1 : fotos.length - 1))}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                      title="Foto anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setFotoActiva((prev) => (prev < fotos.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                      title="Foto siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/75 px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/20 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-roncedo-celeste" />
                      <span>
                        {fotoActiva + 1} de {fotos.length}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Tira de Miniaturas */}
              {fotos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                  {fotos.map((f, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFotoActiva(idx)}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        fotoActiva === idx ? 'border-roncedo-blue scale-105 shadow-sm' : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={f} alt="Miniatura" fill className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Título de la Novedad */}
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {novedad.titulo}
          </h2>

          {/* Bajada destacada */}
          <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed border-l-4 border-roncedo-blue pl-3 py-1.5 bg-blue-50/50 rounded-r-xl">
            {novedad.bajada}
          </p>

          {/* Cuerpo completo */}
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line pt-2">
            {novedad.contenido}
          </div>

          {/* Pie de artículo */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Publicado por: {novedad.autor || 'Biblioteca Roncedo'}</span>
            <span>Club Sportivo y Biblioteca Dr. Lautaro Roncedo</span>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            onClick={handleCopiarEnlace}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2 rounded-xl hover:bg-slate-200"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-roncedo-navy text-white text-xs font-bold hover:bg-blue-900 transition-colors shadow-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
