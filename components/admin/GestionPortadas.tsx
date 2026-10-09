'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useLibros } from '@/lib/context/LibrosContext';
import { LibroFisico } from '@/types';
import {
  buscarPortadaLibro,
  buscarAlternativasPortadas,
  procesarLoteLibros,
  PortadaAlternative,
  PortadaSearchResult,
} from '@/lib/services/bookCoversService';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Upload,
  Link as LinkIcon,
  RefreshCw,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Save,
  Play,
  Pause,
  ExternalLink,
  ShieldCheck,
  Eye,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export function GestionPortadas() {
  const {
    librosFisicos,
    actualizarPortada,
    aprobarPortada,
    descartarPortada,
    buscarYAsociarPortada,
    actualizarLoteLibros,
    guardarEnServidor,
  } = useLibros();

  // Estados de Filtros y Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'con_portada' | 'pendientes' | 'sin_portada'>('todos');
  const [filtroFuente, setFiltroFuente] = useState<'todas' | 'google_books' | 'open_library' | 'manual'>('todas');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 20;

  // Estados de Modales
  const [libroSeleccionado, setLibroSeleccionado] = useState<LibroFisico | null>(null);
  const [alternativas, setAlternativas] = useState<PortadaAlternative[]>([]);
  const [buscandoAlternativas, setBuscandoAlternativas] = useState(false);
  const [urlManual, setUrlManual] = useState('');
  const [isbnManual, setIsbnManual] = useState('');

  // Estados de Procesamiento Masivo / Lotes
  const [procesandoLote, setProcesandoLote] = useState(false);
  const [pausaLote, setPausaLote] = useState(false);
  const [progresoLote, setProgresoLote] = useState<{ actual: number; total: number; encontradas: number }>({
    actual: 0,
    total: 0,
    encontradas: 0,
  });
  const [modalLoteAbierto, setModalLoteAbierto] = useState(false);

  // Estados de la Prueba de Etapa 1 (20 Libros)
  const [modalEtapa1Abierto, setModalEtapa1Abierto] = useState(false);
  const [ejecutandoEtapa1, setEjecutandoEtapa1] = useState(false);
  const [resultadosEtapa1, setResultadosEtapa1] = useState<
    Array<{ libro: LibroFisico; resultado: PortadaSearchResult }>
  >([]);

  // Notificaciones / Mensajes
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [guardandoServidor, setGuardandoServidor] = useState(false);

  // -------------------------------------------------------------------------
  // Métricas
  // -------------------------------------------------------------------------
  const totalLibros = librosFisicos.length;
  const librosConPortada = useMemo(
    () => librosFisicos.filter((l) => l.portada_url && l.portada_url.trim() !== ''),
    [librosFisicos]
  );
  const librosPendientes = useMemo(
    () => librosFisicos.filter((l) => l.estado_portada === 'pendiente_revision'),
    [librosFisicos]
  );
  const librosSinPortada = useMemo(
    () => librosFisicos.filter((l) => !l.portada_url || l.portada_url.trim() === ''),
    [librosFisicos]
  );
  const librosConIsbn = useMemo(
    () => librosFisicos.filter((l) => l.isbn && l.isbn.trim() !== ''),
    [librosFisicos]
  );

  // -------------------------------------------------------------------------
  // Filtrado de Libros
  // -------------------------------------------------------------------------
  const librosFiltrados = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return librosFisicos.filter((l) => {
      // Filtro de texto
      if (q) {
        const matchesTitulo = l.titulo.toLowerCase().includes(q);
        const matchesAutor = l.autor.toLowerCase().includes(q);
        const matchesInv = String(l.numero_inventario).includes(q);
        const matchesEditorial = (l.editorial || '').toLowerCase().includes(q);
        const matchesIsbn = (l.isbn || '').toLowerCase().includes(q);

        if (!matchesTitulo && !matchesAutor && !matchesInv && !matchesEditorial && !matchesIsbn) {
          return false;
        }
      }

      // Filtro por estado
      if (filtroEstado === 'con_portada' && (!l.portada_url || l.portada_url.trim() === '')) return false;
      if (filtroEstado === 'pendientes' && l.estado_portada !== 'pendiente_revision') return false;
      if (filtroEstado === 'sin_portada' && l.portada_url && l.portada_url.trim() !== '') return false;

      // Filtro por fuente
      if (filtroFuente !== 'todas' && l.portada_fuente !== filtroFuente) return false;

      return true;
    });
  }, [librosFisicos, searchTerm, filtroEstado, filtroFuente]);

  const totalPaginas = Math.ceil(librosFiltrados.length / itemsPorPagina) || 1;
  const librosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return librosFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [librosFiltrados, paginaActual]);

  const notificar = (msg: string) => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(null), 4000);
  };

  // -------------------------------------------------------------------------
  // Acciones sobre libros individuales
  // -------------------------------------------------------------------------
  const handleAprobar = async (id: string) => {
    await aprobarPortada(id);
    notificar('Portada aprobada correctamente.');
  };

  const handleDescartar = async (id: string) => {
    await descartarPortada(id);
    notificar('Portada descartada.');
  };

  const handleBuscarIndividual = async (id: string) => {
    try {
      const res = await buscarYAsociarPortada(id);
      if (res.success) {
        notificar(`Portada encontrada en ${res.resultado.fuente} (${res.resultado.confianza}).`);
      } else {
        notificar('No se encontró portada para este ejemplar.');
      }
    } catch {
      notificar('Error al consultar las APIs.');
    }
  };

  const handleAbrirModalReemplazar = async (libro: LibroFisico) => {
    setLibroSeleccionado(libro);
    setUrlManual(libro.portada_url || '');
    setIsbnManual(libro.isbn || '');
    setAlternativas([]);
    setBuscandoAlternativas(true);

    try {
      const alts = await buscarAlternativasPortadas(libro);
      setAlternativas(alts);
    } finally {
      setBuscandoAlternativas(false);
    }
  };

  const handleSeleccionarAlternativa = async (alt: PortadaAlternative) => {
    if (!libroSeleccionado) return;
    await actualizarPortada(libroSeleccionado.id, alt.portada_url, {
      estado_portada: 'aprobada',
      fuente: alt.fuente,
      confianza: alt.confianza,
      detalles: `Seleccionada por el administrador desde ${alt.fuente} ("${alt.titulo}").`,
    });
    setLibroSeleccionado(null);
    notificar('Portada asignada y aprobada.');
  };

  const handleGuardarManual = async () => {
    if (!libroSeleccionado) return;
    if (!urlManual.trim()) {
      await descartarPortada(libroSeleccionado.id);
      setLibroSeleccionado(null);
      notificar('Portada removida.');
      return;
    }

    await actualizarPortada(libroSeleccionado.id, urlManual.trim(), {
      estado_portada: 'aprobada',
      fuente: 'manual',
      confianza: 'alta',
      detalles: 'Cargada manualmente por el administrador.',
    });

    setLibroSeleccionado(null);
    notificar('Portada manual guardada exitosamente.');
  };

  const handleSubirArchivoManual = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUrlManual(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------------------
  // Sincronización Permanente con el Servidor
  // -------------------------------------------------------------------------
  const handleGuardarEnServidor = async () => {
    try {
      setGuardandoServidor(true);
      const res = await guardarEnServidor();
      if (res.success) {
        notificar('¡Archivo lib/data/librosFisicos.json sincronizado y persistido con éxito!');
      } else {
        notificar('Error al guardar en el servidor: ' + (res.message || 'desconocido'));
      }
    } finally {
      setGuardandoServidor(false);
    }
  };

  // -------------------------------------------------------------------------
  // Ejecución de Prueba Etapa 1 (20 Libros de muestra con y sin ISBN)
  // -------------------------------------------------------------------------
  const handleEjecutarEtapa1 = async () => {
    setModalEtapa1Abierto(true);
    setEjecutandoEtapa1(true);
    setResultadosEtapa1([]);

    try {
      // 20 libros representativos: primeros 16 + 4 con ISBN conocido de la institución
      const muestra = librosFisicos.slice(0, 16).map((b) => ({ ...b }));

      // Enriquecer o agregar 4 registros con ISBN para evaluar ambos escenarios requeridos
      if (librosFisicos[2]) {
        muestra.push({
          ...librosFisicos[2],
          id: 'test-isbn-galeano',
          isbn: '9789505817818',
        });
      }
      if (librosFisicos[7]) {
        muestra.push({
          ...librosFisicos[7],
          id: 'test-isbn-diego',
          isbn: '9789504908906',
        });
      }
      if (librosFisicos[17]) {
        muestra.push({
          ...librosFisicos[17],
          id: 'test-isbn-panzeri',
          isbn: '9789874412195',
        });
      }
      if (librosFisicos[19]) {
        muestra.push({
          ...librosFisicos[19],
          id: 'test-isbn-fontanarrosa',
          isbn: '9789505151974',
        });
      }

      const resultados: Array<{ libro: LibroFisico; resultado: PortadaSearchResult }> = [];

      for (let i = 0; i < muestra.length; i++) {
        const libro = muestra[i];
        const res = await buscarPortadaLibro(libro);
        resultados.push({ libro, resultado: res });
        setResultadosEtapa1([...resultados]);
        await new Promise((r) => setTimeout(r, 350));
      }
    } finally {
      setEjecutandoEtapa1(false);
    }
  };

  const aplicarResultadosEtapa1 = async () => {
    const actualizados = [...librosFisicos];
    let cambios = 0;

    resultadosEtapa1.forEach(({ libro, resultado }) => {
      if (resultado.portada_url) {
        const idx = actualizados.findIndex((l) => l.numero_inventario === libro.numero_inventario);
        if (idx !== -1) {
          actualizados[idx] = {
            ...actualizados[idx],
            portada_url: resultado.portada_url,
            estado_portada: resultado.confianza === 'alta' ? 'aprobada' : 'pendiente_revision',
            portada_fuente: resultado.fuente,
            portada_confianza: resultado.confianza,
            portada_detalles: resultado.detalles,
            isbn: libro.isbn || actualizados[idx].isbn,
          };
          cambios++;
        }
      }
    });

    actualizarLoteLibros(actualizados);
    await guardarEnServidor(actualizados);
    setModalEtapa1Abierto(false);
    notificar(`Se aplicaron y persistieron ${cambios} portadas de la Etapa 1.`);
  };

  // -------------------------------------------------------------------------
  // Procesamiento Masivo / Lotes de Libros
  // -------------------------------------------------------------------------
  const iniciarProcesoMasivo = async (soloSinPortada: boolean = true) => {
    setModalLoteAbierto(true);
    setProcesandoLote(true);
    setPausaLote(false);

    const librosAProcesar = soloSinPortada ? librosSinPortada : librosFisicos;
    setProgresoLote({ actual: 0, total: librosAProcesar.length, encontradas: 0 });

    const actualizados = [...librosFisicos];
    let encontradas = 0;

    for (let i = 0; i < librosAProcesar.length; i++) {
      if (pausaLote) {
        break;
      }

      const libro = librosAProcesar[i];
      const resultado = await buscarPortadaLibro(libro);

      if (resultado.portada_url) {
        encontradas++;
        const idx = actualizados.findIndex((l) => l.id === libro.id);
        if (idx !== -1) {
          actualizados[idx] = {
            ...actualizados[idx],
            portada_url: resultado.portada_url,
            estado_portada: resultado.confianza === 'alta' ? 'aprobada' : 'pendiente_revision',
            portada_fuente: resultado.fuente,
            portada_confianza: resultado.confianza,
            portada_detalles: resultado.detalles,
          };
        }
      }

      setProgresoLote({ actual: i + 1, total: librosAProcesar.length, encontradas });

      // Guardar cada 20 libros en el estado local
      if ((i + 1) % 20 === 0 || i === librosAProcesar.length - 1) {
        actualizarLoteLibros(actualizados);
      }

      await new Promise((r) => setTimeout(r, 350));
    }

    actualizarLoteLibros(actualizados);
    await guardarEnServidor(actualizados);
    setProcesandoLote(false);
    notificar(`Proceso completado: se encontraron ${encontradas} portadas nuevas.`);
  };

  // -------------------------------------------------------------------------
  // Exportación a Excel
  // -------------------------------------------------------------------------
  const exportarReportePortadas = () => {
    const data = librosFisicos.map((l) => ({
      'N° Inv': l.numero_inventario,
      'Título': l.titulo,
      'Autor': l.autor,
      'Editorial': l.editorial || '-',
      'Año': l.edicion_anio || '-',
      'ISBN': l.isbn || '-',
      'Tiene Portada': l.portada_url ? 'SÍ' : 'NO',
      'Estado Portada':
        l.estado_portada === 'aprobada'
          ? 'Aprobada'
          : l.estado_portada === 'pendiente_revision'
          ? 'Pendiente de Revisión'
          : 'Sin Portada',
      'Fuente': l.portada_fuente || (l.portada_url ? 'Google/OpenLibrary' : 'Ninguna'),
      'Confianza': l.portada_confianza || '-',
      'URL Portada': l.portada_url || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Gestión de Portadas');
    XLSX.writeFile(workbook, `portadas_biblioteca_roncedo_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Banner de Cabecera con Métricas */}
      <div className="bg-gradient-to-r from-roncedo-navy via-[#163761] to-[#255A9B] rounded-3xl p-6 sm:p-8 text-white shadow-card border border-blue-300/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-roncedo-celesteLight border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-roncedo-gold" />
              <span>Módulo de Automatización Bibliográfica</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Gestión de Portadas de Libros
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Sistema automático de recolección, validación y administración visual para los{' '}
              <strong>{totalLibros} libros</strong> de Biblioteca Roncedo. Prioriza Google Books y Open Library,
              verificando ISBN, título, autor, editorial y año.
            </p>
          </div>

          {/* Acciones Rápidas del Encabezado */}
          <div className="flex flex-wrap gap-2.5 sm:self-start lg:self-center">
            <button
              onClick={handleEjecutarEtapa1}
              className="bg-roncedo-gold hover:bg-amber-400 text-roncedo-navy font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Prueba Etapa 1 (20 Libros)</span>
            </button>

            <button
              onClick={() => iniciarProcesoMasivo(true)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-roncedo-celesteLight" />
              <span>Búsqueda Masiva ({librosSinPortada.length} sin portada)</span>
            </button>

            <button
              onClick={handleGuardarEnServidor}
              disabled={guardandoServidor}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              title="Guarda los cambios de portadas en lib/data/librosFisicos.json"
            >
              <Save className="w-4 h-4" />
              <span>{guardandoServidor ? 'Sincronizando...' : 'Persistir en Servidor'}</span>
            </button>

            <button
              onClick={exportarReportePortadas}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs p-2.5 rounded-xl border border-white/20 transition-all"
              title="Descargar reporte en Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            </button>
          </div>
        </div>

        {/* Notificación de éxito flotante */}
        {mensajeExito && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* Las 4 Métricas Obligatorias */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <span className="text-[10px] uppercase font-bold text-blue-200 block">Total Libros</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-white">{totalLibros}</span>
              <BookOpen className="w-5 h-5 text-blue-200" />
            </div>
            <span className="text-[10px] text-blue-200/80 mt-1 block">Inventario oficial completo</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Portadas Encontradas</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-emerald-300">{librosConPortada.length}</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="text-[10px] text-emerald-100/80 mt-1 block">
              {((librosConPortada.length / totalLibros) * 100).toFixed(1)}% del catálogo
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <span className="text-[10px] uppercase font-bold text-amber-200 block">Pendientes de Revisión</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-amber-300">{librosPendientes.length}</span>
              <Clock className="w-5 h-5 text-amber-300" />
            </div>
            <span className="text-[10px] text-amber-100/80 mt-1 block">Coincidencias aproximadas</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <span className="text-[10px] uppercase font-bold text-rose-200 block">Libros sin Portada</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-rose-300">{librosSinPortada.length}</span>
              <AlertCircle className="w-5 h-5 text-rose-300" />
            </div>
            <span className="text-[10px] text-rose-100/80 mt-1 block">Listos para búsqueda o carga</span>
          </div>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-card border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPaginaActual(1);
              }}
              placeholder="Buscar por título, autor, editorial, N° de inventario o ISBN..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
            />
          </div>

          {/* Filtros de Estado */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setFiltroEstado('todos');
                setPaginaActual(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filtroEstado === 'todos' ? 'bg-white text-roncedo-navy shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({totalLibros})
            </button>
            <button
              onClick={() => {
                setFiltroEstado('con_portada');
                setPaginaActual(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filtroEstado === 'con_portada'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Con Portada ({librosConPortada.length})
            </button>
            <button
              onClick={() => {
                setFiltroEstado('pendientes');
                setPaginaActual(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filtroEstado === 'pendientes'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendientes ({librosPendientes.length})
            </button>
            <button
              onClick={() => {
                setFiltroEstado('sin_portada');
                setPaginaActual(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filtroEstado === 'sin_portada'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sin Portada ({librosSinPortada.length})
            </button>
          </div>
        </div>
      </div>

      {/* Resumen de Resultados y Paginación */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <div>
          Mostrando{' '}
          <strong className="text-slate-900 font-bold">
            {librosFiltrados.length === 0 ? 0 : (paginaActual - 1) * itemsPorPagina + 1} -{' '}
            {Math.min(paginaActual * itemsPorPagina, librosFiltrados.length)}
          </strong>{' '}
          de <strong className="text-slate-900 font-bold">{librosFiltrados.length}</strong> libros
        </div>

        {totalPaginas > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs px-2 text-slate-800">
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tabla / Tarjetas de Libros */}
      <div className="bg-white rounded-3xl shadow-card border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {librosPaginados.map((libro) => {
            const tienePortada = Boolean(libro.portada_url && libro.portada_url.trim() !== '');
            const esPendiente = libro.estado_portada === 'pendiente_revision';

            return (
              <div
                key={libro.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                {/* Lado Izquierdo: Portada + Información */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Vista Proporcional de la Portada */}
                  <div className="relative w-16 h-24 sm:w-20 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center p-0.5">
                    {tienePortada ? (
                      <Image
                        src={libro.portada_url!}
                        alt={libro.titulo}
                        fill
                        sizes="80px"
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="text-center p-1 text-slate-400">
                        <BookOpen className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                        <span className="text-[8px] font-black block leading-tight text-slate-500">
                          #{libro.numero_inventario}
                        </span>
                        <span className="text-[8px] text-slate-400">Sin foto</span>
                      </div>
                    )}
                  </div>

                  {/* Datos del Libro */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-roncedo-navy px-2 py-0.5 rounded-lg border border-slate-200">
                        Inv. #{libro.numero_inventario}
                      </span>

                      {tienePortada ? (
                        esPendiente ? (
                          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            Pendiente de Revisión
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Portada Aprobada
                          </span>
                        )
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                          Sin Portada
                        </span>
                      )}

                      {libro.portada_fuente && (
                        <span className="text-[9px] font-semibold text-slate-400 uppercase">
                          Fuente: {libro.portada_fuente.replace('_', ' ')}
                        </span>
                      )}

                      {libro.isbn && (
                        <span className="bg-blue-50 text-roncedo-blue text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                          ISBN: {libro.isbn}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-1" title={libro.titulo}>
                      {libro.titulo}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 line-clamp-1">{libro.autor}</p>
                    <p className="text-[11px] text-slate-400">
                      {libro.editorial ? `Editorial: ${libro.editorial} • ` : ''}
                      {libro.edicion_anio ? `Año: ${libro.edicion_anio}` : ''}
                    </p>

                    {libro.portada_detalles && (
                      <p className="text-[10px] text-slate-500 italic line-clamp-1 mt-0.5">
                        {libro.portada_detalles}
                      </p>
                    )}
                  </div>
                </div>

                {/* Lado Derecho: Acciones de Gestión de Portadas */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-end sm:self-center w-full sm:w-auto justify-end">
                  {esPendiente && (
                    <button
                      onClick={() => handleAprobar(libro.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                      title="Aprobar esta portada"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aprobar</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleBuscarIndividual(libro.id)}
                    className="bg-roncedo-navy hover:bg-blue-900 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                    title="Buscar automáticamente en Google Books y Open Library"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-roncedo-gold" />
                    <span>Auto-Buscar</span>
                  </button>

                  <button
                    onClick={() => handleAbrirModalReemplazar(libro)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
                    title="Reemplazar portada, buscar alternativas o cargar manualmente"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>Gestionar</span>
                  </button>

                  {tienePortada && (
                    <button
                      onClick={() => handleDescartar(libro.id)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors border border-rose-200"
                      title="Quitar portada actual"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: Gestionar / Reemplazar / Cargar Manualmente Portada */}
      {/* ========================================================================= */}
      {libroSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col border border-slate-200 overflow-hidden my-auto">
            {/* Cabecera */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-roncedo-navy to-blue-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-roncedo-celesteLight">
                  Gestión y Edición de Portada
                </span>
                <h3 className="text-base font-black leading-tight line-clamp-1">
                  Inv. #{libroSeleccionado.numero_inventario} - {libroSeleccionado.titulo}
                </h3>
              </div>
              <button
                onClick={() => setLibroSeleccionado(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs">
              {/* Vista Previa Actual */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
                <div className="relative w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                  {urlManual ? (
                    <Image
                      src={urlManual}
                      alt="Vista previa"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <BookOpen className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                      <span className="text-[9px]">Sin imagen</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="font-black text-slate-900 text-sm">{libroSeleccionado.titulo}</h4>
                  <p className="text-xs text-slate-600 font-semibold">{libroSeleccionado.autor}</p>
                  <p className="text-[11px] text-slate-400">
                    {libroSeleccionado.editorial} ({libroSeleccionado.edicion_anio || 's/d'})
                  </p>
                  {libroSeleccionado.isbn && (
                    <p className="text-[10px] text-roncedo-blue font-bold">ISBN: {libroSeleccionado.isbn}</p>
                  )}
                </div>
              </div>

              {/* Opción 1: Alternativas detectadas en Google Books y Open Library */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-roncedo-gold" />
                    <span>Alternativas encontradas en Google Books y Open Library</span>
                  </h4>
                  {buscandoAlternativas && (
                    <span className="text-[11px] text-roncedo-blue font-semibold animate-pulse">
                      Consultando APIs...
                    </span>
                  )}
                </div>

                {alternativas.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {alternativas.map((alt, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 hover:bg-blue-50/50 p-2.5 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between group"
                      >
                        <div className="relative w-full h-32 rounded-xl overflow-hidden bg-white mb-2 border border-slate-200 shadow-sm flex items-center justify-center">
                          <Image
                            src={alt.portada_url}
                            alt={alt.titulo}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform"
                            unoptimized
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <span className="text-[9px] font-black uppercase text-roncedo-navy block">
                            {alt.fuente.replace('_', ' ')}
                          </span>
                          <p className="text-[10px] font-bold text-slate-800 line-clamp-1">{alt.titulo}</p>
                          <p className="text-[9px] text-slate-500 line-clamp-1">{alt.autor || 's/d'}</p>
                          <button
                            onClick={() => handleSeleccionarAlternativa(alt)}
                            className="w-full mt-2 bg-roncedo-navy hover:bg-blue-900 text-white font-bold text-[10px] py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1"
                          >
                            <Check className="w-3 h-3 text-roncedo-gold" />
                            <span>Elegir ésta</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !buscandoAlternativas && (
                    <p className="text-slate-400 text-xs italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                      No se encontraron alternativas automáticas adicionales para este ejemplar. Puedes cargar una portada manualmente a continuación.
                    </p>
                  )
                )}
              </div>

              {/* Opción 2: Carga Manual (URL o Archivo) */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-roncedo-blue" />
                  <span>Cargar Manualmente Portada</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      URL directa de la imagen (HTTPS):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={urlManual}
                        onChange={(e) => setUrlManual(e.target.value)}
                        placeholder="https://ejemplo.com/portada.jpg"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      O subir archivo desde el dispositivo:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSubirArchivoManual}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-roncedo-navy file:text-white hover:file:bg-blue-900 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => setLibroSeleccionado(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarManual}
                className="bg-roncedo-navy hover:bg-blue-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
              >
                <Save className="w-4 h-4 text-roncedo-gold" />
                <span>Guardar Portada</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Resultados de Prueba Etapa 1 (20 Libros con y sin ISBN) */}
      {/* ========================================================================= */}
      {modalEtapa1Abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col border border-slate-200 overflow-hidden my-auto">
            {/* Cabecera */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-roncedo-navy to-blue-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-roncedo-celesteLight">
                  Etapa 1 • Prueba Piloto de Validación
                </span>
                <h3 className="text-base sm:text-lg font-black leading-tight">
                  Evaluación de 20 Libros (Con y Sin ISBN)
                </h3>
              </div>
              <button
                onClick={() => setModalEtapa1Abierto(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumen Superior */}
            <div className="p-5 bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Prueba</span>
                  <span className="text-xl font-black text-slate-900">
                    {resultadosEtapa1.length} / 20
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase block">Portadas Halladas</span>
                  <span className="text-xl font-black text-emerald-700">
                    {resultadosEtapa1.filter((r) => r.resultado.portada_url).length}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-blue-600 font-bold uppercase block">Coincidencia Alta</span>
                  <span className="text-xl font-black text-roncedo-navy">
                    {resultadosEtapa1.filter((r) => r.resultado.confianza === 'alta').length}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-amber-600 font-bold uppercase block">Revisión / Sin Hallar</span>
                  <span className="text-xl font-black text-amber-700">
                    {resultadosEtapa1.filter((r) => r.resultado.confianza !== 'alta').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Lista detallada de los 20 libros */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-3 text-xs flex-1">
              {ejecutandoEtapa1 && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-roncedo-navy rounded-2xl flex items-center justify-between font-bold animate-pulse">
                  <span>Procesando lote de 20 libros con Google Books y Open Library...</span>
                  <span>{resultadosEtapa1.length} de 20</span>
                </div>
              )}

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {resultadosEtapa1.map(({ libro, resultado }, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-white hover:bg-slate-50">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Portada */}
                      <div className="relative w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center p-0.5">
                        {resultado.portada_url ? (
                          <Image
                            src={resultado.portada_url}
                            alt={libro.titulo}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <span className="text-[8px] text-slate-400 font-bold">Sin foto</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase">
                            #{libro.numero_inventario}
                          </span>
                          {libro.isbn ? (
                            <span className="text-[9px] font-bold text-roncedo-blue bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                              ISBN: {libro.isbn}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                              Sin ISBN
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-slate-900 text-xs line-clamp-1">{libro.titulo}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{libro.autor}</p>
                        <p className="text-[10px] text-slate-400 italic line-clamp-1">{resultado.detalles}</p>
                      </div>
                    </div>

                    {/* Badge de resultado */}
                    <div className="text-right flex-shrink-0">
                      {resultado.confianza === 'alta' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          ALTA ({resultado.fuente.replace('_', ' ')})
                        </span>
                      ) : resultado.confianza === 'media' ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          MEDIA (Revisar)
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200">
                          Sin resultado
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => setModalEtapa1Abierto(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={aplicarResultadosEtapa1}
                disabled={ejecutandoEtapa1 || resultadosEtapa1.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Aprobar y Persistir Resultados de Etapa 1</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Progreso de Búsqueda Masiva por Lotes */}
      {/* ========================================================================= */}
      {modalLoteAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 border border-slate-200 space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-roncedo-navy text-roncedo-gold flex items-center justify-center mx-auto mb-2">
                <RefreshCw className={`w-6 h-6 ${procesandoLote ? 'animate-spin' : ''}`} />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {procesandoLote ? 'Procesando Búsqueda Automática...' : 'Búsqueda por Lote Finalizada'}
              </h3>
              <p className="text-xs text-slate-500">
                Recorriendo catálogo bibliográfico contra Google Books y Open Library.
              </p>
            </div>

            {/* Barra de Progreso */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Progreso: {progresoLote.actual} de {progresoLote.total}</span>
                <span>
                  {progresoLote.total > 0
                    ? `${((progresoLote.actual / progresoLote.total) * 100).toFixed(0)}%`
                    : '0%'}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-roncedo-navy to-roncedo-blue h-full transition-all duration-300"
                  style={{
                    width: `${progresoLote.total > 0 ? (progresoLote.actual / progresoLote.total) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-emerald-700 font-bold text-center">
                Portadas encontradas hasta el momento: {progresoLote.encontradas}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              {procesandoLote ? (
                <button
                  onClick={() => setPausaLote(true)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pausar Búsqueda</span>
                </button>
              ) : (
                <button
                  onClick={() => setModalLoteAbierto(false)}
                  className="bg-roncedo-navy hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
