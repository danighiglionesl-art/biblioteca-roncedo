'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { NovedadInstitucional } from '@/types';
import {
  getNovedades,
  crearNovedad,
  actualizarNovedad,
  eliminarNovedad,
} from '@/lib/supabase/novedades';
import {
  Newspaper,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Upload,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';

const CATEGORIAS: Array<'Institucional' | 'Cultura' | 'Libros' | 'Archivo'> = [
  'Institucional',
  'Cultura',
  'Libros',
  'Archivo',
];

const CATEGORIA_COLORES: Record<string, { bg: string; text: string; border: string }> = {
  Institucional: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  Cultura: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  Libros: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  Archivo: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
};

export function GestionNovedades() {
  const [novedades, setNovedades] = useState<NovedadInstitucional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroDestacadas, setFiltroDestacadas] = useState<boolean>(false);

  // Estados de Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [novedadEditando, setNovedadEditando] = useState<NovedadInstitucional | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Modal Eliminar
  const [novedadAEliminar, setNovedadAEliminar] = useState<NovedadInstitucional | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Modal Previsualizar
  const [novedadPrevisualizar, setNovedadPrevisualizar] = useState<NovedadInstitucional | null>(null);
  const [fotoActivaPreview, setFotoActivaPreview] = useState(0);

  // Campos del formulario
  const [formTitulo, setFormTitulo] = useState('');
  const [formBajada, setFormBajada] = useState('');
  const [formContenido, setFormContenido] = useState('');
  const [formCategoria, setFormCategoria] = useState<'Institucional' | 'Cultura' | 'Libros' | 'Archivo'>('Institucional');
  const [formFecha, setFormFecha] = useState('');
  const [formDestacado, setFormDestacado] = useState(false);

  // Manejo de fotografías (hasta 5)
  const [imagenesExistentes, setImagenesExistentes] = useState<string[]>([]);
  const [nuevosArchivos, setNuevosArchivos] = useState<{ file: File; previewUrl: string }[]>([]);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const data = await getNovedades();
      setNovedades(data);
    } catch (err) {
      console.error('Error cargando novedades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();

    // Escuchar eventos de actualización local
    const handleUpdate = () => cargarDatos();
    window.addEventListener('roncedo_novedades_updated', handleUpdate);
    return () => window.removeEventListener('roncedo_novedades_updated', handleUpdate);
  }, []);

  // Métricas
  const totalNovedades = novedades.length;
  const totalDestacadas = novedades.filter((n) => n.destacado).length;
  const totalConFotos = novedades.filter((n) => (n.imagenes && n.imagenes.length > 0) || n.imagen_url).length;

  // Filtrado
  const novedadesFiltradas = useMemo(() => {
    return novedades.filter((nov) => {
      const matchSearch =
        nov.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nov.bajada.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nov.contenido.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = filtroCategoria === 'todas' || nov.categoria === filtroCategoria;
      const matchDestacado = !filtroDestacadas || nov.destacado;

      return matchSearch && matchCat && matchDestacado;
    });
  }, [novedades, searchTerm, filtroCategoria, filtroDestacadas]);

  // Apertura de modal para Crear
  const handleAbrirCrear = () => {
    setNovedadEditando(null);
    setFormTitulo('');
    setFormBajada('');
    setFormContenido('');
    setFormCategoria('Institucional');
    setFormFecha(new Date().toISOString().split('T')[0]);
    setFormDestacado(false);
    setImagenesExistentes([]);
    setNuevosArchivos([]);
    setErrorForm(null);
    setModalAbierto(true);
  };

  // Apertura de modal para Editar
  const handleAbrirEditar = (nov: NovedadInstitucional) => {
    setNovedadEditando(nov);
    setFormTitulo(nov.titulo);
    setFormBajada(nov.bajada);
    setFormContenido(nov.contenido);
    setFormCategoria(nov.categoria);
    setFormFecha(nov.fecha || new Date().toISOString().split('T')[0]);
    setFormDestacado(Boolean(nov.destacado));
    
    // Obtener array de imágenes existentes
    const fotos = nov.imagenes && nov.imagenes.length > 0
      ? nov.imagenes
      : nov.imagen_url
      ? [nov.imagen_url]
      : [];
    setImagenesExistentes(fotos);
    setNuevosArchivos([]);
    setErrorForm(null);
    setModalAbierto(true);
  };

  // Agregar archivos con límite estricto de 5
  const handleArchivosSeleccionados = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    const espacioDisponible = 5 - (imagenesExistentes.length + nuevosArchivos.length);

    if (espacioDisponible <= 0) {
      setErrorForm('Ya alcanzaste el límite máximo de 5 fotografías para esta novedad.');
      return;
    }

    const archivosAceptados = filesArray.slice(0, espacioDisponible);
    const nuevosItems = archivosAceptados.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNuevosArchivos((prev) => [...prev, ...nuevosItems]);
    setErrorForm(null);

    if (filesArray.length > espacioDisponible) {
      setErrorForm(`Solo se pudieron agregar ${espacioDisponible} foto(s). El límite es de 5 por novedad.`);
    }

    if (inputFileRef.current) inputFileRef.current.value = '';
  };

  // Quitar imagen existente
  const handleEliminarImagenExistente = (index: number) => {
    setImagenesExistentes((prev) => prev.filter((_, i) => i !== index));
  };

  // Quitar nuevo archivo pendiente
  const handleEliminarNuevoArchivo = (index: number) => {
    setNuevosArchivos((prev) => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Guardar (Crear o Actualizar)
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim()) {
      setErrorForm('El título de la novedad es obligatorio.');
      return;
    }
    if (!formBajada.trim()) {
      setErrorForm('El resumen o bajada breve es obligatorio.');
      return;
    }
    if (!formContenido.trim()) {
      setErrorForm('El contenido de la novedad es obligatorio.');
      return;
    }

    setGuardando(true);
    setErrorForm(null);

    try {
      const archivosFiles = nuevosArchivos.map((a) => a.file);

      if (novedadEditando) {
        // Modo Edición
        const res = await actualizarNovedad(
          novedadEditando.id,
          {
            titulo: formTitulo,
            bajada: formBajada,
            contenido: formContenido,
            categoria: formCategoria,
            fecha: formFecha,
            destacado: formDestacado,
          },
          imagenesExistentes,
          archivosFiles
        );

        if (!res.success) throw new Error(res.error);
      } else {
        // Modo Creación
        const res = await crearNovedad(
          {
            titulo: formTitulo,
            bajada: formBajada,
            contenido: formContenido,
            categoria: formCategoria,
            fecha: formFecha,
            destacado: formDestacado,
          },
          archivosFiles
        );

        if (!res.success) throw new Error(res.error);
      }

      await cargarDatos();
      setModalAbierto(false);
    } catch (err: any) {
      setErrorForm(err.message || 'Error al guardar la novedad');
    } finally {
      setGuardando(false);
    }
  };

  // Confirmar eliminación
  const handleConfirmarEliminar = async () => {
    if (!novedadAEliminar) return;
    setEliminando(true);
    try {
      await eliminarNovedad(novedadAEliminar.id);
      await cargarDatos();
      setNovedadAEliminar(null);
    } catch (err) {
      console.error('Error eliminando novedad:', err);
    } finally {
      setEliminando(false);
    }
  };

  const totalFotosCargadas = imagenesExistentes.length + nuevosArchivos.length;

  return (
    <div className="space-y-6">
      {/* Cabecera y botón de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-card border border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-roncedo-blue mb-1">
            <Newspaper className="w-4 h-4" />
            <span>Módulo de Noticias y Comunicación</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Gestión de Novedades (ABM)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Publicá y editá noticias, avisos institucionales y actividades de la Biblioteca con hasta 5 fotografías.
          </p>
        </div>

        <button
          onClick={handleAbrirCrear}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-roncedo-navy to-blue-800 text-white font-bold text-xs sm:text-sm shadow-md hover:from-blue-900 hover:to-blue-950 transition-all active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Novedad</span>
        </button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total de Novedades</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-slate-900">{totalNovedades}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-roncedo-blue flex items-center justify-center">
              <Newspaper className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Publicaciones registradas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400">Destacadas en Portada</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-amber-600">{totalDestacadas}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Aparecen en primer orden</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400">Con Álbum de Fotos</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-emerald-600">{totalConFotos}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Incluyen hasta 5 imágenes</span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título o contenido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-roncedo-blue/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="todas">Todas las categorías</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFiltroDestacadas(!filtroDestacadas)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              filtroDestacadas
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filtroDestacadas ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>Solo Destacadas</span>
          </button>
        </div>
      </div>

      {/* Lista de Novedades */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-card border border-slate-200">
          <div className="w-10 h-10 border-4 border-roncedo-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Cargando Novedades...
          </p>
        </div>
      ) : novedadesFiltradas.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-card border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-roncedo-blue flex items-center justify-center mx-auto mb-3">
            <Newspaper className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No se encontraron novedades</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || filtroCategoria !== 'todas' || filtroDestacadas
              ? 'Prueba modificando los filtros de búsqueda.'
              : 'Todavía no hay novedades creadas. Podés registrar la primera ahora.'}
          </p>
          <button
            onClick={handleAbrirCrear}
            className="mt-4 px-4 py-2 rounded-xl bg-roncedo-navy text-white text-xs font-bold hover:bg-blue-900 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Primera Novedad</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {novedadesFiltradas.map((nov) => {
            const fotos = nov.imagenes && nov.imagenes.length > 0
              ? nov.imagenes
              : nov.imagen_url
              ? [nov.imagen_url]
              : [];
            const colStyle = CATEGORIA_COLORES[nov.categoria] || CATEGORIA_COLORES['Institucional'];

            return (
              <div
                key={nov.id}
                className="bg-white rounded-2xl shadow-card border border-slate-200/80 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Foto de portada o contenedor de fotos */}
                  {fotos.length > 0 ? (
                    <div className="relative h-44 w-full bg-slate-900 overflow-hidden group">
                      <Image
                        src={fotos[0]}
                        alt={nov.titulo}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />

                      {/* Contador de fotos si tiene más de 1 */}
                      {fotos.length > 1 && (
                        <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-white/20">
                          <ImageIcon className="w-3 h-3 text-roncedo-celeste" />
                          <span>{fotos.length} fotos</span>
                        </div>
                      )}

                      {/* Badge Destacado */}
                      {nov.destacado && (
                        <div className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 shadow-md">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Destacada</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100/60 p-4 flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-roncedo-blue">
                        <Newspaper className="w-5 h-5" />
                      </div>
                      {nov.destacado && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>Destacada</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Contenido textual */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`${colStyle.bg} ${colStyle.text} ${colStyle.border} border text-[11px] font-bold px-2.5 py-0.5 rounded-full`}>
                        {nov.categoria}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {nov.fecha}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                      {nov.titulo}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {nov.bajada}
                    </p>
                  </div>
                </div>

                {/* Acciones de la Tarjeta */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setNovedadPrevisualizar(nov);
                      setFotoActivaPreview(0);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAbrirEditar(nov)}
                      className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Editar Novedad"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setNovedadAEliminar(nov)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                      title="Eliminar Novedad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL ABM: CREAR / EDITAR NOVEDAD CON HASTA 5 FOTOS                 */}
      {/* =================================================================== */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header del Modal */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/30">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-roncedo-blue">
                  {novedadEditando ? 'Edición de Publicación' : 'Nueva Noticia Institucional'}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  {novedadEditando ? 'Editar Novedad' : 'Publicar Novedad en la Biblioteca'}
                </h3>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario con Scroll */}
            <form onSubmit={handleGuardar} className="flex-1 overflow-y-auto p-6 space-y-4">
              {errorForm && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorForm}</span>
                </div>
              )}

              {/* Título */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Título de la Novedad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Nuevas incorporaciones al catálogo literario"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue/30 focus:border-roncedo-blue"
                />
              </div>

              {/* Categoría y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue/30"
                  >
                    {CATEGORIAS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha de Publicación
                  </label>
                  <input
                    type="date"
                    required
                    value={formFecha}
                    onChange={(e) => setFormFecha(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue/30"
                  />
                </div>
              </div>

              {/* Destacar en portada */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Destacar en la Portada de Inicio</h4>
                    <p className="text-[11px] text-slate-600">
                      Aparecerá en los primeros lugares y con insignia dorada.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formDestacado}
                  onChange={(e) => setFormDestacado(e.target.checked)}
                  className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                />
              </div>

              {/* Bajada / Resumen */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bajada / Resumen Breve *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Una o dos frases que sinteticen la noticia en la tarjeta de inicio..."
                  value={formBajada}
                  onChange={(e) => setFormBajada(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue/30 focus:border-roncedo-blue"
                />
              </div>

              {/* Contenido Completo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contenido Completo de la Noticia *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Detalle completo de la novedad, información para los socios, horarios, requisitos, etc..."
                  value={formContenido}
                  onChange={(e) => setFormContenido(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue/30 focus:border-roncedo-blue"
                />
              </div>

              {/* SECCIÓN DE FOTOGRAFÍAS (HASTA 5) */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-roncedo-blue" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Fotografías ({totalFotosCargadas} / 5)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {5 - totalFotosCargadas} disponibles
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mb-3">
                  Podés subir hasta 5 fotografías. La primera foto será utilizada como portada en la tarjeta de inicio.
                </p>

                {/* Galería de imágenes cargadas */}
                {totalFotosCargadas > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
                    {/* Fotos Existentes */}
                    {imagenesExistentes.map((url, idx) => (
                      <div
                        key={`existente-${idx}`}
                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 group bg-slate-900"
                      >
                        <Image
                          src={url}
                          alt={`Foto ${idx + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-roncedo-navy text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                            Portada
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEliminarImagenExistente(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 shadow transition-opacity"
                          title="Eliminar foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* Nuevos Archivos pendientes de subida */}
                    {nuevosArchivos.map((item, idx) => (
                      <div
                        key={`nuevo-${idx}`}
                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-emerald-400 group bg-slate-900"
                      >
                        <Image
                          src={item.previewUrl}
                          alt={`Nueva ${idx + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          Nueva
                        </span>
                        <button
                          type="button"
                          onClick={() => handleEliminarNuevoArchivo(idx)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 shadow transition-opacity"
                          title="Eliminar foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón / Input para subir más fotos */}
                {totalFotosCargadas < 5 && (
                  <div>
                    <input
                      ref={inputFileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      multiple
                      onChange={handleArchivosSeleccionados}
                      className="hidden"
                      id="upload-novedades-fotos"
                    />
                    <label
                      htmlFor="upload-novedades-fotos"
                      className="w-full border-2 border-dashed border-blue-200 hover:border-roncedo-blue bg-blue-50/40 hover:bg-blue-50/80 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                      <Upload className="w-5 h-5 text-roncedo-blue mb-1" />
                      <span className="text-xs font-bold text-roncedo-blue">
                        Seleccionar o arrastrar fotografías
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        JPG, PNG o WebP. Se comprimen automáticamente para máxima velocidad.
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-6 py-2.5 rounded-xl bg-roncedo-navy text-white text-xs font-bold hover:bg-blue-900 transition-colors shadow-md disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {guardando ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Guardando y optimizando fotos...</span>
                    </>
                  ) : (
                    <span>{novedadEditando ? 'Guardar Cambios' : 'Publicar Novedad'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN                                */}
      {/* =================================================================== */}
      {novedadAEliminar && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 text-center">
              ¿Eliminar Novedad?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              Vas a eliminar la publicación <strong>"{novedadAEliminar.titulo}"</strong>. Esta acción no se puede deshacer.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                disabled={eliminando}
                onClick={() => setNovedadAEliminar(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={eliminando}
                onClick={handleConfirmarEliminar}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-md disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {eliminando ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Eliminar Definitivamente</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL DE PREVISUALIZACIÓN DE LA NOVEDAD CON SLIDER DE HASTA 5 FOTOS */}
      {/* =================================================================== */}
      {novedadPrevisualizar && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-roncedo-navy text-white">
                  Vista Previa
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Así se ve en la plataforma
                </span>
              </div>
              <button
                onClick={() => setNovedadPrevisualizar(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo del Artículo */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Carrusel / Galería de Fotografías */}
              {(() => {
                const fotos = novedadPrevisualizar.imagenes && novedadPrevisualizar.imagenes.length > 0
                  ? novedadPrevisualizar.imagenes
                  : novedadPrevisualizar.imagen_url
                  ? [novedadPrevisualizar.imagen_url]
                  : [];

                if (fotos.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-950 shadow-md">
                      <Image
                        src={fotos[fotoActivaPreview] || fotos[0]}
                        alt="Foto Novedad"
                        fill
                        className="object-contain"
                        unoptimized
                      />

                      {/* Flechas de navegación si hay más de 1 foto */}
                      {fotos.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setFotoActivaPreview((prev) => (prev > 0 ? prev - 1 : fotos.length - 1))
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setFotoActivaPreview((prev) => (prev < fotos.length - 1 ? prev + 1 : 0))
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/75 px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/20">
                            {fotoActivaPreview + 1} de {fotos.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Miniaturas selectoras */}
                    {fotos.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {fotos.map((f, idx) => (
                          <button
                            key={idx}
                            onClick={() => setFotoActivaPreview(idx)}
                            className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                              fotoActivaPreview === idx ? 'border-roncedo-blue scale-105' : 'border-slate-200 opacity-70'
                            }`}
                          >
                            <Image src={f} alt="Miniatura" fill className="object-cover" unoptimized />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold px-2.5 py-0.5 rounded-full bg-roncedo-sky text-roncedo-navy text-[11px]">
                  {novedadPrevisualizar.categoria}
                </span>
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  {novedadPrevisualizar.fecha}
                </span>
                {novedadPrevisualizar.destacado && (
                  <span className="text-amber-700 bg-amber-100 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Destacada
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {novedadPrevisualizar.titulo}
              </h2>

              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed border-l-4 border-roncedo-blue pl-3 py-1 bg-slate-50 rounded-r-xl">
                {novedadPrevisualizar.bajada}
              </p>

              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line pt-2">
                {novedadPrevisualizar.contenido}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                onClick={() => setNovedadPrevisualizar(null)}
                className="px-5 py-2 rounded-xl bg-roncedo-navy text-white text-xs font-bold hover:bg-blue-900 transition-colors"
              >
                Cerrar Previsualización
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
