'use client';

import React from 'react';
import {
  X,
  Calendar,
  Tag,
  Share2,
  ExternalLink,
  Download,
  FileText,
  Film,
  Camera,
  Edit,
  Award,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { ItemRoncedo } from '@/types/roncedo';
import { SocialInteractionsBlock } from '@/components/social/SocialInteractionsBlock';

interface VisorItemRoncedoModalProps {
  item: ItemRoncedo | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onEditar?: (item: ItemRoncedo) => void;
}

// Helper para convertir links de YouTube a embed URL
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0`
    : null;
}

export function VisorItemRoncedoModal({
  item,
  isOpen,
  onClose,
  isAdmin = false,
  onEditar,
}: VisorItemRoncedoModalProps) {
  if (!isOpen || !item) return null;

  const youtubeEmbedUrl = item.tipo === 'video' ? getYouTubeEmbedUrl(item.url) : null;
  const isDirectVideo = item.tipo === 'video' && !youtubeEmbedUrl;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${item.titulo} • Museo Digital Dr. Lautaro Roncedo`,
        text: item.descripcion || item.titulo,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 text-slate-100 rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col border border-amber-500/30 overflow-hidden my-auto">
        {/* Cabecera del Visor */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-roncedo-navyDark to-blue-950 border-b border-amber-500/20 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-roncedo-gold text-slate-950 flex items-center justify-center font-black flex-shrink-0 shadow-md">
              {item.tipo === 'foto' ? (
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : item.tipo === 'video' ? (
                <Film className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </span>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-roncedo-gold flex items-center gap-1">
                <span>Museo Digital Roncedo</span>
                <span>•</span>
                <span className="capitalize">{item.tipo}</span>
              </span>
              <h2 className="text-base sm:text-lg font-black text-white truncate">
                {item.titulo}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isAdmin && onEditar && (
              <button
                onClick={() => {
                  onClose();
                  onEditar(item);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-roncedo-gold/20 hover:bg-roncedo-gold text-roncedo-gold hover:text-slate-950 text-xs font-bold border border-roncedo-gold/40 transition-colors"
                title="Editar este archivo (Admin)"
              >
                <Edit className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editar</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
              title="Compartir"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
              title="Cerrar visor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido Scrolleable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Zona de Reproducción / Visualización Multimedia */}
          <div className="rounded-2xl overflow-hidden bg-black/60 border border-slate-800 shadow-inner flex items-center justify-center min-h-[220px] max-h-[65vh]">
            {item.tipo === 'foto' && (
              <div className="relative w-full h-full flex items-center justify-center p-2">
                <img
                  src={item.url}
                  alt={item.titulo}
                  className="max-h-[55vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                  loading="lazy"
                />
              </div>
            )}

            {item.tipo === 'video' && (
              <div className="w-full aspect-video">
                {youtubeEmbedUrl ? (
                  <iframe
                    src={youtubeEmbedUrl}
                    title={item.titulo}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : isDirectVideo ? (
                  <video
                    src={item.url}
                    controls
                    className="w-full h-full object-contain bg-black"
                  >
                    Tu navegador no soporta el formato de video.
                  </video>
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <Film className="w-12 h-12 text-roncedo-gold mx-auto" />
                    <p className="text-sm text-slate-300">Enlace de video externo</p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-roncedo-gold text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-400"
                    >
                      <span>Abrir video en ventana nueva</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {item.tipo === 'pdf' && (
              <div className="w-full flex flex-col items-center justify-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="text-center max-w-md">
                  <h3 className="text-sm font-black text-white">{item.titulo}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Documento histórico digitalizado en formato PDF ({item.duracion_o_paginas || 'Documento facsimilar'})
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-roncedo-gold hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visualizar Documento Completo</span>
                  </a>
                  <a
                    href={item.url}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar PDF</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Metadatos de la Pieza Histórica */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-roncedo-gold border border-amber-500/30 font-bold text-[11px]">
              <Tag className="w-3.5 h-3.5" />
              <span>{item.categoria}</span>
            </span>

            {item.fecha_o_anio && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-roncedo-gold" />
                <span>Año {item.fecha_o_anio}</span>
              </span>
            )}

            {item.duracion_o_paginas && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                <span>{item.duracion_o_paginas}</span>
              </span>
            )}
          </div>

          {/* Descripción Histórica */}
          {item.descripcion && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Reseña Histórica y Contexto
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                {item.descripcion}
              </p>
            </div>
          )}

          {/* PLACA EDITORIAL: COMENTARIO DEL ADMINISTRADOR (Requerimiento Clave) */}
          {item.comentario_admin && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 shadow-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-2 text-roncedo-gold">
                <Award className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Comentario Editorial de Curaduría • Administrador (biblioroncedo)
                </span>
                <Sparkles className="w-3.5 h-3.5 ml-auto text-amber-300" />
              </div>
              <p className="text-xs sm:text-sm text-amber-100 font-serif italic leading-relaxed pl-1 border-l-2 border-roncedo-gold/60">
                "{item.comentario_admin}"
              </p>
            </div>
          )}

          {/* BLOQUE SOCIAL DE REACCIONES Y COMENTARIOS ESTILO RED SOCIAL */}
          <div className="pt-2 border-t border-slate-800">
            <SocialInteractionsBlock
              seccion="roncedo"
              itemId={item.id}
              tituloContenido={item.titulo}
              modoOscuro={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
