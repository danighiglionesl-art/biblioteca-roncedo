'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  ThumbsUp,
  Award,
  Lightbulb,
  Landmark,
  MessageCircle,
  Share2,
  Trash2,
  Send,
  Sparkles,
  Check,
  User,
  Shield,
  Smile,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  TipoSeccionSocial,
  TipoReaccionSocial,
  ComentarioSocial,
  ResumenReaccionesSociales,
  REACCIONES_CONFIG,
} from '@/types/social';
import {
  getResumenReaccionesSociales,
  toggleReaccionSocial,
  getComentariosSociales,
  agregarComentarioSocial,
  eliminarComentarioSocial,
  toggleLikeComentarioSocial,
} from '@/lib/services/socialInteractionsService';
import { useAuth } from '@/lib/auth/AuthContext';

interface SocialInteractionsBlockProps {
  seccion: TipoSeccionSocial;
  itemId: string;
  itemTitulo?: string;
  tituloContenido?: string;
  layout?: 'card' | 'full' | 'compact';
  modoOscuro?: boolean;
  onActualizado?: () => void;
}

export function SocialInteractionsBlock({
  seccion,
  itemId,
  itemTitulo,
  tituloContenido,
  layout = 'full',
  modoOscuro = false,
  onActualizado,
}: SocialInteractionsBlockProps) {
  const { user } = useAuth();
  const tituloFinal = tituloContenido || itemTitulo;
  const isAdmin = user && (user.role === 'admin' || user.email === 'biblioroncedo');

  // Estados de reacciones
  const [resumen, setResumen] = useState<ResumenReaccionesSociales>({
    total: 0,
    porTipo: {
      corazon: 0,
      pulgar: 0,
      aplauso: 0,
      bombilla: 0,
      patrimonio: 0,
    },
    miReaccion: undefined,
  });
  const [pickerAbierto, setPickerAbierto] = useState(false);
  const [procesandoReaccion, setProcesandoReaccion] = useState(false);

  // Estados de comentarios
  const [comentarios, setComentarios] = useState<ComentarioSocial[]>([]);
  const [comentariosAbiertos, setComentariosAbiertos] = useState(layout === 'full');
  const [nuevoTexto, setNuevoTexto] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Cargar datos
  const cargarInteracciones = useCallback(async () => {
    if (!itemId) return;
    try {
      const res = await getResumenReaccionesSociales(seccion, itemId, user?.id);
      setResumen(res);
      const comms = await getComentariosSociales(seccion, itemId);
      setComentarios(comms);
    } catch (e) {
      console.warn('[SocialBlock] Error cargando interacciones:', e);
    }
  }, [seccion, itemId, user?.id]);

  useEffect(() => {
    cargarInteracciones();

    const handleReactionsUpdate = () => cargarInteracciones();
    const handleCommentsUpdate = () => cargarInteracciones();

    window.addEventListener('roncedo_social_reactions_update', handleReactionsUpdate);
    window.addEventListener('roncedo_social_comments_update', handleCommentsUpdate);

    return () => {
      window.removeEventListener('roncedo_social_reactions_update', handleReactionsUpdate);
      window.removeEventListener('roncedo_social_comments_update', handleCommentsUpdate);
    };
  }, [cargarInteracciones]);

  // Manejador de reacción
  const handleToggleReaccion = async (tipo: TipoReaccionSocial) => {
    if (procesandoReaccion) return;
    setPickerAbierto(false);
    setProcesandoReaccion(true);

    // Usuario activo o fallback visitante
    const usuarioActivo = user || {
      id: typeof window !== 'undefined' ? (localStorage.getItem('roncedo_visitor_id') || `guest-${Date.now()}`) : 'guest-0',
      nombre: 'Lector Roncedense',
      role: 'usuario' as const,
    };

    if (typeof window !== 'undefined' && !user && !localStorage.getItem('roncedo_visitor_id')) {
      localStorage.setItem('roncedo_visitor_id', usuarioActivo.id);
    }

    // Optimista
    const nuevoResumen = await toggleReaccionSocial(seccion, itemId, usuarioActivo, tipo);
    setResumen(nuevoResumen);
    setProcesandoReaccion(false);
    onActualizado?.();
  };

  // Enviar comentario
  const handlePublicarComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTexto.trim() || enviandoComentario) return;

    setEnviandoComentario(true);

    const usuarioActivo = user || {
      id: typeof window !== 'undefined' ? (localStorage.getItem('roncedo_visitor_id') || `guest-${Date.now()}`) : 'guest-0',
      nombre: 'Lector/a',
      apellido: 'de la Comunidad',
      role: 'usuario' as const,
      email: 'comunidad@roncedo.ar',
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined' && !user && !localStorage.getItem('roncedo_visitor_id')) {
      localStorage.setItem('roncedo_visitor_id', usuarioActivo.id);
    }

    const res = await agregarComentarioSocial(seccion, itemId, usuarioActivo as any, nuevoTexto.trim());
    if (res.success && res.data) {
      setComentarios((prev) => [res.data!, ...prev]);
      setNuevoTexto('');
      setComentariosAbiertos(true);
      onActualizado?.();
    }
    setEnviandoComentario(false);
  };

  // Eliminar comentario
  const handleEliminarComentario = async (comId: string) => {
    if (!confirm('¿Deseas eliminar este comentario?')) return;
    const userId = user?.id || '';
    const res = await eliminarComentarioSocial(comId, userId, Boolean(isAdmin));
    if (res.success) {
      setComentarios((prev) => prev.filter((c) => c.id !== comId));
      onActualizado?.();
    }
  };

  // Like a comentario
  const handleLikeComentario = async (comId: string) => {
    const userId = user?.id || (typeof window !== 'undefined' ? (localStorage.getItem('roncedo_visitor_id') || 'guest') : 'guest');
    const res = await toggleLikeComentarioSocial(comId, userId);
    if (res.success) {
      setComentarios((prev) =>
        prev.map((c) => (c.id === comId ? { ...c, likes_count: res.nuevoCount } : c))
      );
    }
  };

  // Copiar enlace para compartir
  const handleCompartir = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  };

  // Formato relativo de tiempo
  const formatTiempoRelativo = (isoStr: string) => {
    try {
      const diffMs = Date.now() - new Date(isoStr).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Hace un momento';
      if (diffMin < 60) return `Hace ${diffMin} min`;
      const diffHoras = Math.floor(diffMin / 60);
      if (diffHoras < 24) return `Hace ${diffHoras} h`;
      const diffDias = Math.floor(diffHoras / 24);
      if (diffDias === 1) return 'Ayer';
      if (diffDias < 7) return `Hace ${diffDias} días`;
      return new Date(isoStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  // Configuración de estilo según modo oscuro/claro
  const bgBox = modoOscuro ? 'bg-slate-800/80 border-slate-700/80 text-slate-100' : 'bg-white border-blue-100 text-slate-800';
  const textMuted = modoOscuro ? 'text-slate-400' : 'text-slate-500';
  const bgInput = modoOscuro ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400';
  const hoverBtn = modoOscuro ? 'hover:bg-slate-700/60' : 'hover:bg-slate-100';

  return (
    <div className={`rounded-2xl border ${bgBox} shadow-xs p-3 sm:p-4 space-y-3 transition-colors`}>
      {/* 1. BARRA SOCIAL: Reacciones, Contador y Botones de Acción */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
        {/* Resumen de Reacciones y Conteo */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center -space-x-1">
            {resumen.porTipo.corazon > 0 && <span className="text-xs" title="Me encanta">❤️</span>}
            {resumen.porTipo.pulgar > 0 && <span className="text-xs" title="Me gusta">👍</span>}
            {resumen.porTipo.aplauso > 0 && <span className="text-xs" title="Aplausos">👏</span>}
            {resumen.porTipo.patrimonio > 0 && <span className="text-xs" title="Orgullo Roncedo">🏛️</span>}
            {resumen.porTipo.bombilla > 0 && <span className="text-xs" title="Inspirador">💡</span>}
          </div>

          <span className={`text-xs font-bold ${resumen.total > 0 ? (modoOscuro ? 'text-amber-300' : 'text-roncedo-navy') : textMuted}`}>
            {resumen.total > 0 ? `${resumen.total} ${resumen.total === 1 ? 'reacción' : 'reacciones'}` : 'Sin reacciones aún'}
          </span>
        </div>

        {/* Contador de Comentarios y Compartir */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setComentariosAbiertos(!comentariosAbiertos)}
            className={`flex items-center gap-1 font-bold ${textMuted} hover:text-roncedo-blue transition-colors px-2 py-1 rounded-lg ${hoverBtn}`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{comentarios.length} {comentarios.length === 1 ? 'comentario' : 'comentarios'}</span>
            {comentariosAbiertos ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={handleCompartir}
            title="Copiar enlace directo"
            className={`flex items-center gap-1 font-bold ${textMuted} hover:text-roncedo-blue transition-colors px-2 py-1 rounded-lg ${hoverBtn}`}
          >
            {copiado ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">¡Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compartir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. BOTONERA DE INTERACCIÓN PRINCIPAL (Estilo Facebook / Red Social) */}
      <div className={`pt-2 border-t ${modoOscuro ? 'border-slate-700/60' : 'border-slate-100'} flex items-center justify-between relative`}>
        {/* Selector de Reacción Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerAbierto(!pickerAbierto)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              resumen.miReaccion
                ? `${REACCIONES_CONFIG[resumen.miReaccion]?.badgeBg} shadow-xs scale-102`
                : `${textMuted} ${hoverBtn}`
            }`}
          >
            {resumen.miReaccion ? (
              <>
                <span className="text-sm">{REACCIONES_CONFIG[resumen.miReaccion].emoji}</span>
                <span>{REACCIONES_CONFIG[resumen.miReaccion].label}</span>
              </>
            ) : (
              <>
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Reaccionar</span>
              </>
            )}
          </button>

          {/* Menú Flotante de Emojis al hacer click o hover */}
          {pickerAbierto && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setPickerAbierto(false)}
              />
              <div className="absolute left-0 bottom-full mb-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full shadow-2xl p-1.5 flex items-center gap-1 animate-scale-up">
                {(Object.keys(REACCIONES_CONFIG) as TipoReaccionSocial[]).map((key) => {
                  const cfg = REACCIONES_CONFIG[key];
                  const esSeleccionado = resumen.miReaccion === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleToggleReaccion(key)}
                      title={cfg.label}
                      className={`w-9 h-9 rounded-full flex flex-col items-center justify-center text-lg hover:scale-130 hover:-translate-y-1 transition-all duration-150 ${
                        esSeleccionado ? 'bg-amber-100 dark:bg-amber-900/50 ring-2 ring-amber-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{cfg.emoji}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Botón Comentar */}
        <button
          type="button"
          onClick={() => setComentariosAbiertos(!comentariosAbiertos)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs ${textMuted} ${hoverBtn} transition-colors`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Comentar</span>
        </button>
      </div>

      {/* 3. SECCIÓN EXPANDIBLE DE COMENTARIOS */}
      {comentariosAbiertos && (
        <div className={`space-y-3 pt-3 border-t ${modoOscuro ? 'border-slate-700/60' : 'border-slate-100'}`}>
          {/* Formulario de Nuevo Comentario */}
          <form onSubmit={handlePublicarComentario} className="space-y-2">
            <div className="flex gap-2.5 items-start">
              {/* Avatar del usuario actual */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-roncedo-navy to-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>

              <div className="flex-1 space-y-1.5">
                <textarea
                  rows={2}
                  value={nuevoTexto}
                  onChange={(e) => setNuevoTexto(e.target.value)}
                  placeholder="Escribí un comentario, recuerdo o anécdota..."
                  className={`w-full rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-roncedo-blue resize-none ${bgInput}`}
                />

                <div className="flex items-center justify-between flex-wrap gap-1.5">
                  {/* Botones de inserción rápida de emojis */}
                  <div className="flex items-center gap-1">
                    {['❤️', '👏', '🏛️', '📚', '⚽'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setNuevoTexto((prev) => prev + em)}
                        className="text-xs hover:scale-125 transition-transform p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        {em}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={enviandoComentario || !nuevoTexto.trim()}
                    className="bg-roncedo-navy hover:bg-blue-900 disabled:opacity-40 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3 text-roncedo-gold" />
                    <span>{enviandoComentario ? 'Publicando...' : 'Publicar'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Listado de Comentarios de la Comunidad */}
          <div className="space-y-2.5 pt-1">
            {comentarios.length === 0 ? (
              <p className={`text-xs italic text-center py-2 ${textMuted}`}>
                Aún no hay comentarios. ¡Sé el primero en compartir una memoria o reseña!
              </p>
            ) : (
              comentarios.map((c) => {
                const esMio = user?.id === c.user_id;
                const puedeEliminar = esMio || isAdmin;
                const yaLeDioLike = user?.id && Array.isArray(c.liked_by) && c.liked_by.includes(user.id);

                return (
                  <div
                    key={c.id}
                    className={`p-3 rounded-2xl ${
                      modoOscuro ? 'bg-slate-900/70 border border-slate-700/60' : 'bg-slate-50 border border-slate-200/80'
                    } flex gap-2.5 items-start text-xs group`}
                  >
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 shadow-xs">
                      {c.user_nombre ? c.user_nombre.charAt(0).toUpperCase() : 'U'}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {c.user_nombre} {c.user_apellido}
                          </span>

                          {/* Badge de Rol o Socio */}
                          {c.user_rol === 'admin' ? (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-roncedo-gold text-slate-950 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                              <Shield className="w-2.5 h-2.5" /> Admin
                            </span>
                          ) : c.user_categoria ? (
                            <span className="text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 px-1.5 py-0.2 rounded-md">
                              Socio {c.user_categoria}
                            </span>
                          ) : null}

                          <span className={`text-[10px] ${textMuted}`}>
                            • {formatTiempoRelativo(c.created_at)}
                          </span>
                        </div>

                        {/* Botón Eliminar para autor o admin */}
                        {puedeEliminar && (
                          <button
                            type="button"
                            onClick={() => handleEliminarComentario(c.id)}
                            title="Eliminar comentario"
                            className="text-red-400 hover:text-red-600 p-1 rounded transition-colors opacity-70 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <p className={`leading-relaxed font-normal ${modoOscuro ? 'text-slate-200' : 'text-slate-700'}`}>
                        {c.comentario}
                      </p>

                      {/* Botón Like al comentario */}
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleLikeComentario(c.id)}
                          className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${
                            yaLeDioLike ? 'text-red-500' : `${textMuted} hover:text-red-500`
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${yaLeDioLike ? 'fill-red-500 text-red-500' : ''}`} />
                          <span>{(c.likes_count ?? 0) > 0 ? c.likes_count : 'Me gusta'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
