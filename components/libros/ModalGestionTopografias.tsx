'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  PlusCircle,
  Edit2,
  Trash2,
  Check,
  Layers,
  Search,
  BookOpen,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useLibros } from '@/lib/context/LibrosContext';
import { extraerSeccionPrincipal } from '@/lib/services/topografiaService';

interface ModalGestionTopografiasProps {
  isOpen: boolean;
  onClose: () => void;
  onSeleccionarSeccion?: (seccion: string) => void;
}

export function ModalGestionTopografias({
  isOpen,
  onClose,
  onSeleccionarSeccion,
}: ModalGestionTopografiasProps) {
  const {
    librosFisicos,
    topografiasDisponibles,
    agregarTopografia,
    renombrarTopografia,
    eliminarTopografia,
  } = useLibros();

  const [nuevaSeccion, setNuevaSeccion] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [seccionEnEdicion, setSeccionEnEdicion] = useState<string | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [feedback, setFeedback] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);
  const [procesando, setProcesando] = useState(false);

  // Conteo de libros por cada sección
  const conteoLibros = useMemo(() => {
    const counts: Record<string, number> = {};
    librosFisicos.forEach((l) => {
      const sec = extraerSeccionPrincipal(l.topografia_ubicacion);
      if (sec) {
        counts[sec.toLowerCase()] = (counts[sec.toLowerCase()] || 0) + 1;
      }
    });
    return counts;
  }, [librosFisicos]);

  // Lista filtrada
  const topografiasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return topografiasDisponibles;
    return topografiasDisponibles.filter((t) => t.toLowerCase().includes(q));
  }, [topografiasDisponibles, busqueda]);

  if (!isOpen) return null;

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaSeccion.trim()) return;

    setProcesando(true);
    setFeedback(null);
    try {
      const res = await agregarTopografia(nuevaSeccion.trim().toUpperCase());
      if (res.success) {
        setFeedback({ tipo: 'exito', mensaje: `Sección "${nuevaSeccion.trim().toUpperCase()}" agregada correctamente.` });
        if (onSeleccionarSeccion) {
          onSeleccionarSeccion(nuevaSeccion.trim().toUpperCase());
        }
        setNuevaSeccion('');
      } else {
        setFeedback({ tipo: 'error', mensaje: res.error || 'Error al agregar la sección.' });
      }
    } catch (err: any) {
      setFeedback({ tipo: 'error', mensaje: err.message || 'Error inesperado.' });
    } finally {
      setProcesando(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleIniciarEdicion = (sec: string) => {
    setSeccionEnEdicion(sec);
    setNombreEditado(sec);
  };

  const handleGuardarEdicion = async (seccionOriginal: string) => {
    if (!nombreEditado.trim() || nombreEditado.trim() === seccionOriginal) {
      setSeccionEnEdicion(null);
      return;
    }

    setProcesando(true);
    setFeedback(null);
    try {
      const res = await renombrarTopografia(seccionOriginal, nombreEditado.trim().toUpperCase());
      if (res.success) {
        setFeedback({
          tipo: 'exito',
          mensaje: `Sección renombrada a "${nombreEditado.trim().toUpperCase()}" (se actualizaron todos los libros asociados).`,
        });
        setSeccionEnEdicion(null);
      } else {
        setFeedback({ tipo: 'error', mensaje: res.error || 'Error al renombrar la sección.' });
      }
    } catch (err: any) {
      setFeedback({ tipo: 'error', mensaje: err.message || 'Error inesperado.' });
    } finally {
      setProcesando(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleEliminar = async (sec: string) => {
    const cant = conteoLibros[sec.toLowerCase()] || 0;
    if (cant > 0) {
      setFeedback({
        tipo: 'error',
        mensaje: `No se puede eliminar "${sec}" porque tiene ${cant} libro(s) asignados en el catálogo.`,
      });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    if (!confirm(`¿Estás seguro de quitar la sección "${sec}" de las opciones disponibles?`)) {
      return;
    }

    setProcesando(true);
    try {
      const res = await eliminarTopografia(sec);
      if (res.success) {
        setFeedback({ tipo: 'exito', mensaje: `Sección "${sec}" eliminada de las opciones.` });
      } else {
        setFeedback({ tipo: 'error', mensaje: res.error || 'Error al eliminar la sección.' });
      }
    } catch (err: any) {
      setFeedback({ tipo: 'error', mensaje: err.message || 'Error inesperado.' });
    } finally {
      setProcesando(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-roncedo-navy to-[#1a4175] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <Layers className="w-5 h-5 text-roncedo-gold" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                ABM de Topografías y Secciones
              </h3>
              <p className="text-xs text-blue-200">
                Ubicaciones físicas y estanterías oficiales para el usuario y la bibliotecaria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback visual */}
        {feedback && (
          <div
            className={`p-3.5 mx-5 mt-4 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
              feedback.tipo === 'exito'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-red-50 text-red-900 border-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.tipo === 'exito' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              )}
              <span>{feedback.mensaje}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 text-xs px-1">
              ✕
            </button>
          </div>
        )}

        {/* Formulario de Alta de Sección */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/60">
          <form onSubmit={handleAgregar} className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              + Agregar Nueva Sección / Estantería
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevaSeccion}
                onChange={(e) => setNuevaSeccion(e.target.value)}
                placeholder="Ej: CIENCIA Y TECNOLOGÍA, ARQUEOLOGÍA, TEATRO..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue shadow-inner"
              />
              <button
                type="submit"
                disabled={procesando || !nuevaSeccion.trim()}
                className="bg-roncedo-gold hover:bg-yellow-600 disabled:opacity-50 text-roncedo-navyDark font-black text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </div>
          </form>
        </div>

        {/* Buscador de Secciones */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar sección existente..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
            />
          </div>
        </div>

        {/* Listado de Secciones */}
        <div className="flex-1 overflow-y-auto px-5 py-2 divide-y divide-slate-100">
          {topografiasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No se encontraron secciones que coincidan con la búsqueda.
            </div>
          ) : (
            topografiasFiltradas.map((sec) => {
              const cant = conteoLibros[sec.toLowerCase()] || 0;
              const enEdicion = seccionEnEdicion === sec;

              return (
                <div
                  key={sec}
                  className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    {enEdicion ? (
                      <input
                        type="text"
                        value={nombreEditado}
                        autoFocus
                        onChange={(e) => setNombreEditado(e.target.value)}
                        className="bg-white border border-roncedo-blue rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 w-full max-w-sm focus:outline-none"
                      />
                    ) : (
                      <div className="min-w-0 flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 truncate">{sec}</span>
                        {onSeleccionarSeccion && (
                          <button
                            type="button"
                            onClick={() => {
                              onSeleccionarSeccion(sec);
                              onClose();
                            }}
                            className="text-[10px] bg-blue-50 text-roncedo-blue hover:bg-blue-100 px-2 py-0.5 rounded-md font-semibold transition-colors"
                          >
                            Usar en libro
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        cant > 0
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {cant} {cant === 1 ? 'libro' : 'libros'}
                    </span>

                    {enEdicion ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleGuardarEdicion(sec)}
                          disabled={procesando}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Guardar nombre"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSeccionEnEdicion(null)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleIniciarEdicion(sec)}
                          className="p-1.5 text-slate-400 hover:text-roncedo-navy hover:bg-slate-100 rounded-lg transition-colors"
                          title="Renombrar sección"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminar(sec)}
                          disabled={cant > 0}
                          className={`p-1.5 rounded-lg transition-colors ${
                            cant > 0
                              ? 'text-slate-200 cursor-not-allowed'
                              : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={cant > 0 ? 'No se puede eliminar mientras tenga libros asignados' : 'Eliminar sección'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pie del Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Total: <strong>{topografiasDisponibles.length}</strong> secciones registradas
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-4 py-2 rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
