'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { FotoHistorica, EtiquetaPersona, ComentarioFoto } from '@/types';
import {
  agregarEtiquetaPersona,
  agregarComentarioFoto,
  reportarFotoHistorica,
  moderarFotoHistorica,
} from '@/lib/supabase/fototeca';
import {
  X,
  Calendar,
  MapPin,
  Building,
  User,
  Users,
  Download,
  Share2,
  Flag,
  MessageSquare,
  ShieldCheck,
  EyeOff,
  Eye,
  CheckCircle2,
  Send,
  Plus,
  Sparkles,
  Info,
  Maximize2,
  ZoomIn,
} from 'lucide-react';

interface FotoDetalleModalProps {
  foto: FotoHistorica | null;
  onClose: () => void;
  onFotoActualizada: (foto: FotoHistorica) => void;
}

export function FotoDetalleModal({
  foto,
  onClose,
  onFotoActualizada,
}: FotoDetalleModalProps) {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'info' | 'personas' | 'comentarios'>('info');
  const [showTagForm, setShowTagForm] = useState(false);
  const [tagNombre, setTagNombre] = useState('');
  const [tagRol, setTagRol] = useState('');
  const [tagPos, setTagPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isClickingPhotoToTag, setIsClickingPhotoToTag] = useState(false);

  const [nuevoComentario, setNuevoComentario] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingTag, setIsSubmittingTag] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMotivo, setReportMotivo] = useState('');
  const [reportEnviado, setReportEnviado] = useState(false);

  const [zoomNivel, setZoomNivel] = useState(false);

  if (!foto) return null;

  const isAdmin = user?.role === 'admin';

  // Manejar clic en la foto para colocar el pin de la persona
  const handlePhotoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isClickingPhotoToTag) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setTagPos({ x, y });
    setIsClickingPhotoToTag(false);
    setShowTagForm(true);
    setActiveTab('personas');
  };

  // Guardar etiqueta de persona
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagNombre.trim()) return;

    setIsSubmittingTag(true);
    const nombreIdentificador = user
      ? `${user.nombre} ${user.apellido}`.trim() || user.email
      : 'Vecino de Alcira';

    const res = await agregarEtiquetaPersona(foto.id, {
      nombre_persona: tagNombre.trim(),
      rol_o_detalle: tagRol.trim(),
      pos_x_porcentaje: tagPos.x,
      pos_y_porcentaje: tagPos.y,
      identificado_por_user_id: user?.id,
      identificado_por_nombre: nombreIdentificador,
    });

    if (res.success && res.data) {
      const updatedTags = [...(foto.etiquetas_personas || []), res.data];
      const updatedFoto = { ...foto, etiquetas_personas: updatedTags };
      onFotoActualizada(updatedFoto);
      setTagNombre('');
      setTagRol('');
      setShowTagForm(false);
    }
    setIsSubmittingTag(false);
  };

  // Enviar comentario / anécdota
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    setIsSubmittingComment(true);
    const autorNombre = user
      ? `${user.nombre} ${user.apellido}`.trim() || user.email
      : 'Vecino de Alcira';

    const res = await agregarComentarioFoto(
      foto.id,
      user?.id,
      autorNombre,
      nuevoComentario.trim()
    );

    if (res.success && res.data) {
      const updatedComms = [...(foto.comentarios || []), res.data];
      const updatedFoto = { ...foto, comentarios: updatedComms };
      onFotoActualizada(updatedFoto);
      setNuevoComentario('');
    }
    setIsSubmittingComment(false);
  };

  // Reportar foto
  const handleReport = async () => {
    if (!reportMotivo.trim()) return;
    await reportarFotoHistorica(foto.id, reportMotivo.trim());
    setReportEnviado(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportEnviado(false);
      setReportMotivo('');
    }, 2000);
  };

  // Moderar foto (Admin)
  const handleCambiarEstado = async (nuevoEstado: 'publicada' | 'oculta') => {
    const res = await moderarFotoHistorica(foto.id, nuevoEstado);
    if (res.success) {
      const updatedFoto = { ...foto, estado_moderacion: nuevoEstado };
      onFotoActualizada(updatedFoto);
    }
  };

  // Descargar foto
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = foto.imagen_url;
    a.download = `${foto.titulo.replace(/[^a-zA-Z0-9]/g, '_')}.webp`;
    a.target = '_blank';
    a.click();
  };

  // Compartir foto
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${foto.titulo} - Fototeca Biblioteca Roncedo`,
          text: `Mirá esta fotografía histórica en la Fototeca de Biblioteca Roncedo: ${foto.titulo}`,
          url: window.location.href,
        });
      } catch {
        // Ignorar cancelación
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-blue-200 overflow-hidden my-auto max-h-[95vh] flex flex-col lg:flex-row">
        {/* Columna Izquierda: Visor de Imagen interactivo */}
        <div className="lg:w-3/5 bg-slate-950 relative flex flex-col items-center justify-center min-h-[320px] sm:min-h-[440px] max-h-[50vh] lg:max-h-[95vh] overflow-hidden select-none">
          {/* Barra superior flotante sobre la imagen */}
          <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between text-white pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="bg-roncedo-navy/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20">
                {foto.decada || (foto.anio_estimado ? `${foto.anio_estimado}` : 'Histórica')}
              </span>
              {foto.estado_moderacion === 'reportada' && (
                <span className="bg-rose-600/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Flag className="w-3 h-3" />
                  <span>Reportada</span>
                </span>
              )}
              {foto.estado_moderacion === 'oculta' && (
                <span className="bg-slate-700/90 text-slate-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  <span>Oculta por Moderación</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoomNivel(!zoomNivel)}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-colors border border-white/20"
                title={zoomNivel ? 'Reducir tamaño' : 'Zoom de imagen'}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-colors border border-white/20"
                title="Descargar fotografía"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-colors border border-white/20"
                title="Compartir"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="lg:hidden w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-colors border border-white/20"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contenedor de la foto con pines interactivos */}
          <div
            onClick={handlePhotoClick}
            className={`relative w-full h-full flex items-center justify-center overflow-auto p-2 ${
              isClickingPhotoToTag ? 'cursor-crosshair' : ''
            }`}
          >
            <div className={`relative inline-block transition-transform duration-300 ${zoomNivel ? 'scale-125' : 'scale-100'}`}>
              <img
                src={foto.imagen_url}
                alt={foto.titulo}
                className="max-h-[46vh] lg:max-h-[88vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />

              {/* Pines de personas identificadas sobre la imagen */}
              {foto.etiquetas_personas?.map((et) => (
                <div
                  key={et.id}
                  style={{
                    left: `${et.pos_x_porcentaje ?? 50}%`,
                    top: `${et.pos_y_porcentaje ?? 50}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-roncedo-celeste border-2 border-white shadow-lg animate-pulse group-hover:scale-125 transition-transform flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  {/* Tooltip con nombre */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-20">
                    <div className="bg-slate-900/95 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-lg border border-white/20">
                      <p>{et.nombre_persona}</p>
                      {et.rol_o_detalle && (
                        <p className="text-[9px] font-normal text-roncedo-celesteLight">
                          {et.rol_o_detalle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pin temporal mientras se ubica la etiqueta */}
              {isClickingPhotoToTag && (
                <div className="absolute inset-0 bg-blue-950/30 flex items-center justify-center pointer-events-none">
                  <span className="bg-roncedo-navy text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20 animate-bounce">
                    Hacé clic sobre el rostro o persona que querés identificar
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Pie informativo sobre etiquetado */}
          <div className="absolute bottom-2 inset-x-3 z-10 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-auto">
            <span>
              {foto.etiquetas_personas && foto.etiquetas_personas.length > 0
                ? `${foto.etiquetas_personas.length} personas identificadas`
                : 'Ninguna persona identificada aún'}
            </span>
            <button
              onClick={() => {
                setIsClickingPhotoToTag(true);
                setShowTagForm(true);
              }}
              className="text-roncedo-celesteLight hover:text-white font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Identificar a alguien</span>
            </button>
          </div>
        </div>

        {/* Columna Derecha: Panel de Metadatos y Participación */}
        <div className="lg:w-2/5 flex flex-col bg-white overflow-hidden max-h-[50vh] lg:max-h-[95vh]">
          {/* Cabecera del Panel */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-roncedo-navy bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                {foto.coleccion || 'Historia General'}
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1 leading-snug">
                {foto.titulo}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="hidden lg:flex w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 items-center justify-center transition-colors flex-shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selector de Pestañas */}
          <div className="grid grid-cols-3 border-b border-slate-200 text-xs font-bold bg-white flex-shrink-0">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-roncedo-celeste text-roncedo-celesteDark'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Ficha</span>
            </button>
            <button
              onClick={() => setActiveTab('personas')}
              className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors relative ${
                activeTab === 'personas'
                  ? 'border-roncedo-celeste text-roncedo-celesteDark'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Personas</span>
              {(foto.etiquetas_personas?.length ?? 0) > 0 && (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-bold">
                  {foto.etiquetas_personas?.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('comentarios')}
              className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors relative ${
                activeTab === 'comentarios'
                  ? 'border-roncedo-celeste text-roncedo-celesteDark'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Memoria</span>
              {(foto.comentarios?.length ?? 0) > 0 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full font-bold">
                  {foto.comentarios?.length}
                </span>
              )}
            </button>
          </div>

          {/* Contenido scrolleable de pestañas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* PESTAÑA 1: FICHA HISTÓRICA */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                {foto.descripcion && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <p>{foto.descripcion}</p>
                  </div>
                )}

                <div className="space-y-2.5 text-xs text-slate-700">
                  {foto.anio_estimado && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/50">
                      <Calendar className="w-4 h-4 text-roncedo-celeste flex-shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">Año aproximado: </span>
                        <span>{foto.anio_estimado}</span>
                        {foto.decada && (
                          <span className="text-slate-500"> ({foto.decada})</span>
                        )}
                      </div>
                    </div>
                  )}

                  {foto.lugar && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/50">
                      <MapPin className="w-4 h-4 text-roncedo-celeste flex-shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">Lugar: </span>
                        <span>{foto.lugar}</span>
                      </div>
                    </div>
                  )}

                  {foto.institucion && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/50">
                      <Building className="w-4 h-4 text-roncedo-celeste flex-shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">Institución: </span>
                        <span>{foto.institucion}</span>
                      </div>
                    </div>
                  )}

                  {foto.acontecimiento && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/50">
                      <Sparkles className="w-4 h-4 text-roncedo-gold flex-shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">Acontecimiento: </span>
                        <span>{foto.acontecimiento}</span>
                      </div>
                    </div>
                  )}

                  {foto.donante_fuente && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/50">
                      <User className="w-4 h-4 text-roncedo-celeste flex-shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">Donante / Fuente: </span>
                        <span>{foto.donante_fuente}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón de Reportar para moderación comunitaria */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="text-slate-400 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Reportar fotografía</span>
                  </button>

                  <span className="text-[11px] text-slate-400">
                    Aportada por: {foto.subido_por_nombre || 'Vecino'}
                  </span>
                </div>
              </div>
            )}

            {/* PESTAÑA 2: PERSONAS IDENTIFICADAS */}
            {activeTab === 'personas' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Personas en la Fotografía
                  </h3>
                  {!showTagForm && (
                    <button
                      onClick={() => setShowTagForm(true)}
                      className="text-xs font-bold text-roncedo-celesteDark hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Nombre</span>
                    </button>
                  )}
                </div>

                {/* Formulario de Nueva Etiqueta */}
                {showTagForm && (
                  <form
                    onSubmit={handleAddTag}
                    className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-3 animate-fade-in"
                  >
                    <div className="text-xs font-bold text-roncedo-navy">
                      Identificar a una persona
                    </div>
                    <input
                      type="text"
                      value={tagNombre}
                      onChange={(e) => setTagNombre(e.target.value)}
                      placeholder="Nombre y Apellido (ej: Juan Pérez)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-roncedo-celeste/20"
                      required
                    />
                    <input
                      type="text"
                      value={tagRol}
                      onChange={(e) => setTagRol(e.target.value)}
                      placeholder="Rol o detalle (ej: Arquero, Presidente, Vecino)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-roncedo-celeste/20"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowTagForm(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingTag || !tagNombre.trim()}
                        className="bg-roncedo-celeste hover:bg-roncedo-celesteDark text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {isSubmittingTag ? 'Guardando...' : 'Guardar Identificación'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Listado de Personas Identificadas */}
                <div className="space-y-2">
                  {foto.etiquetas_personas && foto.etiquetas_personas.length > 0 ? (
                    foto.etiquetas_personas.map((et) => (
                      <div
                        key={et.id}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{et.nombre_persona}</p>
                          {et.rol_o_detalle && (
                            <p className="text-[11px] text-slate-500">{et.rol_o_detalle}</p>
                          )}
                        </div>
                        {et.identificado_por_nombre && (
                          <span className="text-[10px] text-slate-400">
                            por {et.identificado_por_nombre}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p>Aún no se han identificado personas en esta foto.</p>
                      <p className="text-[11px] text-roncedo-celesteDark font-medium mt-1">
                        ¿Reconocés a alguien? ¡Tu aporte ayuda a preservar la memoria!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PESTAÑA 3: MEMORIA VIVA Y COMENTARIOS */}
            {activeTab === 'comentarios' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Historias y Anécdotas de Vecinos
                </h3>

                {/* Listado de comentarios */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto">
                  {foto.comentarios && foto.comentarios.length > 0 ? (
                    foto.comentarios.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-roncedo-navy">
                            {c.nombre_usuario}
                          </span>
                          <span className="text-slate-400">
                            {new Date(c.created_at).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{c.comentario}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p>Todavía no hay historias compartidas sobre esta foto.</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Dejá tu recuerdo o testimonio para la posteridad.
                      </p>
                    </div>
                  )}
                </div>

                {/* Formulario para agregar recuerdo */}
                <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribí una anécdota o recuerdo..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-roncedo-celeste/20"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !nuevoComentario.trim()}
                    className="bg-roncedo-celeste hover:bg-roncedo-celesteDark text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Panel Exclusivo de Moderación para Administradores */}
          {isAdmin && (
            <div className="p-3 bg-amber-50 border-t border-amber-200 text-xs flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Herramientas de Moderador</span>
              </div>
              <div className="flex items-center gap-2">
                {foto.estado_moderacion === 'oculta' ? (
                  <button
                    onClick={() => handleCambiarEstado('publicada')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Volver a Publicar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleCambiarEstado('oculta')}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>Ocultar Fotografía</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mini Modal de Reporte */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-600" />
              <span>Reportar Fotografía</span>
            </h3>

            {reportEnviado ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Gracias. El reporte fue enviado al Administrador de la Biblioteca.</span>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-600">
                  Si esta foto incumple las normas de privacidad, respeto o derecho de imagen de la Biblioteca, indicalo aquí:
                </p>
                <textarea
                  rows={3}
                  value={reportMotivo}
                  onChange={(e) => setReportMotivo(e.target.value)}
                  placeholder="Motivo del reporte..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-rose-500/20"
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={!reportMotivo.trim()}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    Enviar Reporte
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
