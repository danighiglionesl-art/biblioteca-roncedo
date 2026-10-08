'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLibros } from '@/lib/context/LibrosContext';
import { LibroFisico } from '@/types';
import {
  Search,
  BookOpen,
  PlusCircle,
  Filter,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Edit,
  Library,
} from 'lucide-react';
import { ModalDetalleLibroFisico } from './ModalDetalleLibroFisico';
import { ModalABMLibro } from './ModalABMLibro';

const ITEMS_POR_PAGINA = 24;

export function BibliotecaFisicaView() {
  const { user } = useAuth();
  const {
    librosFisicos,
    reservas,
    solicitarPrestamo,
    solicitarReserva,
    cancelarReserva,
    registrarDevolucion,
    agregarLibro,
    actualizarLibro,
    eliminarLibro,
  } = useLibros();

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'disponible' | 'prestado'>('todos');
  const [filtroTopografia, setFiltroTopografia] = useState<string>('todas');
  const [paginaActual, setPaginaActual] = useState(1);

  // Modales
  const [libroSeleccionado, setLibroSeleccionado] = useState<LibroFisico | null>(null);
  const [modalAbmAbierto, setModalAbmAbierto] = useState(false);
  const [libroAEditar, setLibroAEditar] = useState<LibroFisico | null>(null);

  const isAdmin = user && user.role === 'admin';
  const isSocio = user && (user.role === 'socio' || user.role === 'admin');

  // Obtener categorías topográficas más frecuentes
  const categoriasTopograficas = useMemo(() => {
    const counts: Record<string, number> = {};
    librosFisicos.forEach((l) => {
      const top = l.topografia_ubicacion?.trim();
      if (top) {
        // Normalizar grandes categorías
        const categoriaClave = top.split('/')[0].trim();
        counts[categoriaClave] = (counts[categoriaClave] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([cat]) => cat);
  }, [librosFisicos]);

  // Filtrar catálogo de libros físicos
  const librosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();

    return librosFisicos.filter((l) => {
      // Filtro de texto
      if (q) {
        const enTitulo = l.titulo.toLowerCase().includes(q);
        const enAutor = l.autor.toLowerCase().includes(q);
        const enEditorial = (l.editorial || '').toLowerCase().includes(q);
        const enInv = String(l.numero_inventario).includes(q);
        const enTop = (l.topografia_ubicacion || '').toLowerCase().includes(q);
        const enLugar = (l.lugar || '').toLowerCase().includes(q);
        const enDonante = (l.donante_o_detalle || '').toLowerCase().includes(q);

        if (!enTitulo && !enAutor && !enEditorial && !enInv && !enTop && !enLugar && !enDonante) {
          return false;
        }
      }

      // Filtro de disponibilidad
      if (filtroEstado !== 'todos' && l.estado !== filtroEstado) {
        return false;
      }

      // Filtro de topografía
      if (filtroTopografia !== 'todas') {
        const top = (l.topografia_ubicacion || '').toLowerCase();
        if (!top.includes(filtroTopografia.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [librosFisicos, busqueda, filtroEstado, filtroTopografia]);

  // Estadísticas rápidas
  const totalLibros = librosFisicos.length;
  const totalPrestados = librosFisicos.filter((l) => l.estado === 'prestado').length;
  const totalDisponibles = totalLibros - totalPrestados;

  // Paginación
  const totalPaginas = Math.ceil(librosFiltrados.length / ITEMS_POR_PAGINA) || 1;
  const librosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return librosFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [librosFiltrados, paginaActual]);

  const handleCambioPagina = (nuevaPag: number) => {
    setPaginaActual(Math.max(1, Math.min(totalPaginas, nuevaPag)));
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Buscar si el usuario actual tiene reserva en el libro seleccionado
  const reservaActualUsuario = useMemo(() => {
    if (!libroSeleccionado || !user) return null;
    const r = reservas.find((res) => res.libro_id === libroSeleccionado.id && res.user_id === user.id && res.estado !== 'cancelada');
    return r ? { id: r.id, posicion: r.posicion_espera } : null;
  }, [libroSeleccionado, reservas, user]);

  return (
    <div className="space-y-6">
      {/* Banner de la Biblioteca Física e Inventario */}
      <div className="bg-gradient-to-br from-roncedo-navy via-[#163761] to-[#255A9B] rounded-3xl p-6 sm:p-8 text-white shadow-card border border-blue-300/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-roncedo-celesteLight border border-white/20">
              <Library className="w-3.5 h-3.5 text-roncedo-gold" />
              <span>Inventario Oficial de Sala de Lectura</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Catálogo de Libros Físicos
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Consultá la ubicación física en estantería (topografía), datos de edición y disponibilidad de los <strong>{totalLibros} ejemplares</strong> de la institución. Los socios pueden gestionar préstamos o ingresar en lista de espera.
            </p>
          </div>

          {/* Estadísticas e Interacción de Admin */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex items-center justify-around gap-4 text-center">
              <div>
                <span className="text-xs text-blue-200 block font-medium">Total</span>
                <span className="text-lg font-black text-white">{totalLibros}</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <span className="text-xs text-emerald-300 block font-medium">Disponibles</span>
                <span className="text-lg font-black text-emerald-400">{totalDisponibles}</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <span className="text-xs text-amber-300 block font-medium">Prestados</span>
                <span className="text-lg font-black text-amber-400">{totalPrestados}</span>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  setLibroAEditar(null);
                  setModalAbmAbierto(true);
                }}
                className="bg-roncedo-gold hover:bg-yellow-600 text-roncedo-navyDark font-black text-xs px-4 py-2.5 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Agregar Libro al Inventario</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-blue-200/80 space-y-4">
        {/* Input Buscador */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            placeholder="Buscar libro físico por título, autor, editorial, n° inventario o ubicación..."
            className="w-full pl-12 pr-28 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white transition-all shadow-inner"
          />
          {busqueda && (
            <button
              onClick={() => {
                setBusqueda('');
                setPaginaActual(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 px-2.5 py-1 rounded-xl transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filtros de Disponibilidad y Categorías Topográficas */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Disponibilidad */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => {
                setFiltroEstado('todos');
                setPaginaActual(1);
              }}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                filtroEstado === 'todos' ? 'bg-white text-roncedo-navy shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({totalLibros})
            </button>
            <button
              onClick={() => {
                setFiltroEstado('disponible');
                setPaginaActual(1);
              }}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                filtroEstado === 'disponible' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Disponibles ({totalDisponibles})
            </button>
            <button
              onClick={() => {
                setFiltroEstado('prestado');
                setPaginaActual(1);
              }}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                filtroEstado === 'prestado' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Prestados ({totalPrestados})
            </button>
          </div>

          {/* Filtro por Topografía / Estantería */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Sección / Estante:
            </span>
            <select
              value={filtroTopografia}
              onChange={(e) => {
                setFiltroTopografia(e.target.value);
                setPaginaActual(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
            >
              <option value="todas">Todas las ubicaciones</option>
              {categoriasTopograficas.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen de Resultados y Paginación Superior */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <div>
          Mostrando{' '}
          <strong className="text-slate-900 font-bold">
            {librosFiltrados.length === 0 ? 0 : (paginaActual - 1) * ITEMS_POR_PAGINA + 1} -{' '}
            {Math.min(paginaActual * ITEMS_POR_PAGINA, librosFiltrados.length)}
          </strong>{' '}
          de <strong className="text-slate-900 font-bold">{librosFiltrados.length}</strong> ejemplares
        </div>

        {totalPaginas > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleCambioPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs px-2 text-slate-800">
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={() => handleCambioPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
              title="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Grilla de Libros Físicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {librosPaginados.map((libro) => {
          const estaPrestado = libro.estado === 'prestado';

          return (
            <div
              key={libro.id}
              className="bg-white rounded-3xl p-4 shadow-card border border-blue-200/80 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Cabecera de la tarjeta: Nº Inventario y Estado */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-roncedo-navy px-2 py-0.5 rounded-lg border border-slate-200">
                    Inv. #{libro.numero_inventario}
                  </span>

                  {estaPrestado ? (
                    <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      Prestado
                    </span>
                  ) : (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Disponible
                    </span>
                  )}
                </div>

                {/* Portada y Título */}
                <div className="flex gap-3 items-start mb-3">
                  {libro.portada_url ? (
                    <div className="relative w-14 h-20 flex-shrink-0 rounded-xl overflow-hidden shadow border border-slate-200 bg-slate-100">
                      <Image
                        src={libro.portada_url}
                        alt={libro.titulo}
                        fill
                        sizes="56px"
                        className="object-cover group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-20 flex-shrink-0 rounded-xl bg-gradient-to-br from-roncedo-navy to-[#2B6CB5] text-white flex flex-col items-center justify-center p-1 text-center shadow">
                      <BookOpen className="w-4 h-4 text-roncedo-gold mb-0.5" />
                      <span className="text-[8px] font-black leading-tight line-clamp-1">
                        #{libro.numero_inventario}
                      </span>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-2" title={libro.titulo}>
                      {libro.titulo}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-600 mt-0.5 line-clamp-1" title={libro.autor}>
                      {libro.autor}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {libro.editorial ? `${libro.editorial} ` : ''}
                      {libro.edicion_anio ? `(${libro.edicion_anio})` : ''}
                    </p>
                  </div>
                </div>

                {/* Topografía / Ubicación en Estante */}
                <div className="p-2 bg-roncedo-celesteSoft/70 rounded-xl border border-blue-100 text-[11px] mb-3">
                  <div className="flex items-center gap-1 text-roncedo-navy font-bold">
                    <MapPin className="w-3 h-3 text-roncedo-blue flex-shrink-0" />
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Ubicación física:</span>
                  </div>
                  <p className="font-bold text-slate-800 line-clamp-1 pl-4 text-[10px]">
                    {libro.topografia_ubicacion || 'Sala de Lectura General'}
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setLibroSeleccionado(libro)}
                  className="w-full bg-roncedo-navy hover:bg-blue-900 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5 text-roncedo-gold" />
                  <span>{estaPrestado ? 'Ver Espera' : 'Ver Ficha / Pedir'}</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setLibroAEditar(libro);
                      setModalAbmAbierto(true);
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Editar ejemplar"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación Inferior */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => handleCambioPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <span className="font-bold text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-800">
            {paginaActual} / {totalPaginas}
          </span>

          <button
            onClick={() => handleCambioPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modales */}
      {libroSeleccionado && (
        <ModalDetalleLibroFisico
          libro={libroSeleccionado}
          user={user}
          onClose={() => setLibroSeleccionado(null)}
          onSolicitarPrestamo={async (id) => {
            if (user) await solicitarPrestamo(id, user);
          }}
          onSolicitarReserva={async (id) => {
            if (user) await solicitarReserva(id, user);
          }}
          onCancelarReserva={async (resId) => {
            await cancelarReserva(resId);
          }}
          onRegistrarDevolucion={async (id) => {
            await registrarDevolucion(id);
          }}
          onAbrirEdicion={(l) => {
            setLibroAEditar(l);
            setModalAbmAbierto(true);
          }}
          reservaUsuario={reservaActualUsuario}
        />
      )}

      {modalAbmAbierto && (
        <ModalABMLibro
          libroAEditar={libroAEditar}
          ultimoInventario={librosFisicos.reduce((max, l) => Math.max(max, l.numero_inventario), 0)}
          onClose={() => {
            setModalAbmAbierto(false);
            setLibroAEditar(null);
          }}
          onGuardar={async (datos) => {
            if (libroAEditar) {
              await actualizarLibro(libroAEditar.id, datos);
            } else {
              await agregarLibro(datos);
            }
          }}
          onEliminar={async (id) => {
            await eliminarLibro(id);
          }}
        />
      )}
    </div>
  );
}
