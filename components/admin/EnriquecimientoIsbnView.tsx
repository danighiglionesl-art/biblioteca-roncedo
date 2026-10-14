'use client';

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useLibros } from '@/lib/context/LibrosContext';
import { LibroFisico } from '@/types';
import {
  validarIsbn,
  formatearIsbn,
  limpiarIsbn,
  convertirIsbn10AIsbn13,
  IsbnValidation,
  IsbnMetadata,
} from '@/lib/isbn/isbnService';
import {
  Barcode,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Play,
  Pause,
  RotateCcw,
  Save,
  FileSpreadsheet,
  BookOpen,
  ArrowRight,
  Layers,
  Check,
  X,
  ExternalLink,
  Info,
  Calendar,
  Building,
  User,
  Copy,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Camera,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ModalRevisionBibliograficaIsbn, DatosLibroEdicion } from '@/components/isbn/ModalRevisionBibliograficaIsbn';
import { ScannerCodigoBarrasModal } from '@/components/isbn/ScannerCodigoBarrasModal';

export interface EnriquecimientoResultado {
  libroOriginal: LibroFisico;
  validacionIsbn: IsbnValidation;
  metadataEncontrada: IsbnMetadata | null;
  estadoProceso: 'pendiente' | 'procesando' | 'encontrado' | 'no_encontrado' | 'error';
  aprobado: boolean;
  cambiosPropuestos: Partial<LibroFisico>;
  errorMsg?: string;
}

export function EnriquecimientoIsbnView() {
  const { librosFisicos, actualizarLoteLibros, guardarEnServidor } = useLibros();

  // Estados de Filtros y Navegación
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<
    'todos' | 'con_isbn' | 'sin_isbn' | 'isbn_valido' | 'isbn_invalido' | 'duplicados' | 'sin_portada'
  >('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 20;

  // Estados del Motor de Procesamiento
  const [procesando, setProcesando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [alcanceProceso, setAlcanceProceso] = useState<'con_isbn' | 'sin_portada' | 'primeros_20' | 'todos'>(
    'con_isbn'
  );
  const [resultadosEnriquecimiento, setResultadosEnriquecimiento] = useState<
    Map<string, EnriquecimientoResultado>
  >(new Map());
  const [progreso, setProgreso] = useState({ actual: 0, total: 0, encontrados: 0 });

  // Referencia para pausar/detener el bucle asíncrono
  const stopRequestedRef = useRef(false);

  // Estados de Modales y Mensajes
  const [libroEnRevision, setLibroEnRevision] = useState<{
    libro: LibroFisico;
    metadata: IsbnMetadata;
  } | null>(null);
  const [modalScannerAbierto, setModalScannerAbierto] = useState(false);
  const [libroParaEscanear, setLibroParaEscanear] = useState<LibroFisico | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // -------------------------------------------------------------------------
  // 1. Diagnóstico Bibliográfico y Detección de Duplicados en Tiempo Real
  // -------------------------------------------------------------------------
  const diagnostico = useMemo(() => {
    let conIsbn = 0;
    let sinIsbn = 0;
    let isbnValidos = 0;
    let isbnInvalidos = 0;
    let isbn10Count = 0;
    let isbn13Count = 0;
    let conPortada = 0;
    let sinPortada = 0;

    // Mapa para detección de duplicados
    const isbnMap = new Map<string, LibroFisico[]>();

    librosFisicos.forEach((l) => {
      if (l.portada_url && l.portada_url.trim()) {
        conPortada++;
      } else {
        sinPortada++;
      }

      if (!l.isbn || !l.isbn.trim()) {
        sinIsbn++;
      } else {
        conIsbn++;
        const val = validarIsbn(l.isbn);
        if (val.valido) {
          isbnValidos++;
          if (val.tipo === 'isbn-10') isbn10Count++;
          if (val.tipo === 'isbn-13') isbn13Count++;

          const key = val.isbn13 || val.clean;
          const existentes = isbnMap.get(key) || [];
          existentes.push(l);
          isbnMap.set(key, existentes);
        } else {
          isbnInvalidos++;
        }
      }
    });

    // Libros que comparten ISBN (múltiples ejemplares)
    const duplicadosIsbn = new Set<string>();
    isbnMap.forEach((lista) => {
      if (lista.length > 1) {
        lista.forEach((l) => duplicadosIsbn.add(l.id));
      }
    });

    return {
      total: librosFisicos.length,
      conIsbn,
      sinIsbn,
      isbnValidos,
      isbnInvalidos,
      isbn10Count,
      isbn13Count,
      conPortada,
      sinPortada,
      duplicadosCount: duplicadosIsbn.size,
      duplicadosSet: duplicadosIsbn,
    };
  }, [librosFisicos]);

  // -------------------------------------------------------------------------
  // 2. Filtrado de Libros para la Tabla
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

      // Filtro de categoría bibliográfica
      if (filtroTipo === 'con_isbn') return Boolean(l.isbn && l.isbn.trim());
      if (filtroTipo === 'sin_isbn') return !l.isbn || !l.isbn.trim();
      if (filtroTipo === 'isbn_valido') {
        return Boolean(l.isbn && validarIsbn(l.isbn).valido);
      }
      if (filtroTipo === 'isbn_invalido') {
        return Boolean(l.isbn && !validarIsbn(l.isbn).valido);
      }
      if (filtroTipo === 'duplicados') {
        return diagnostico.duplicadosSet.has(l.id);
      }
      if (filtroTipo === 'sin_portada') {
        return !l.portada_url || !l.portada_url.trim();
      }

      return true;
    });
  }, [librosFisicos, searchTerm, filtroTipo, diagnostico.duplicadosSet]);

  const totalPaginas = Math.ceil(librosFiltrados.length / itemsPorPagina) || 1;
  const librosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return librosFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [librosFiltrados, paginaActual]);

  const notificar = (msg: string) => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(null), 5000);
  };

  // -------------------------------------------------------------------------
  // 3. Motor de Consulta Automatizada con Control de Tasa (350ms delay)
  // -------------------------------------------------------------------------
  const iniciarProcesamiento = async () => {
    stopRequestedRef.current = false;
    setProcesando(true);
    setPausado(false);

    // Determinar conjunto de libros a procesar
    let universo: LibroFisico[] = [];
    if (alcanceProceso === 'con_isbn') {
      universo = librosFisicos.filter((l) => l.isbn && l.isbn.trim());
    } else if (alcanceProceso === 'sin_portada') {
      universo = librosFisicos.filter((l) => !l.portada_url || !l.portada_url.trim());
    } else if (alcanceProceso === 'primeros_20') {
      universo = librosFisicos.slice(0, 20);
    } else {
      universo = [...librosFisicos];
    }

    setProgreso({ actual: 0, total: universo.length, encontrados: 0 });

    const nuevosResultados = new Map(resultadosEnriquecimiento);
    let encontradosContador = 0;

    for (let i = 0; i < universo.length; i++) {
      if (stopRequestedRef.current) break;

      const libro = universo[i];
      const validacion = validarIsbn(libro.isbn || '');

      // Marcamos como procesando
      nuevosResultados.set(libro.id, {
        libroOriginal: libro,
        validacionIsbn: validacion,
        metadataEncontrada: null,
        estadoProceso: 'procesando',
        aprobado: false,
        cambiosPropuestos: {},
      });
      setResultadosEnriquecimiento(new Map(nuevosResultados));

      try {
        let meta: IsbnMetadata | null = null;

        if (validacion.valido) {
          // Búsqueda por ISBN
          const res = await fetch(`/api/isbn/lookup?isbn=${encodeURIComponent(validacion.clean)}`);
          const data = await res.json();
          if (data.success && data.metadata) {
            meta = data.metadata;
          }
        } else if (libro.titulo.trim()) {
          // Búsqueda alternativa por Título y Autor
          const res = await fetch(
            `/api/isbn/lookup?titulo=${encodeURIComponent(libro.titulo)}&autor=${encodeURIComponent(libro.autor)}`
          );
          const data = await res.json();
          if (data.success && data.metadata) {
            meta = data.metadata;
          }
        }

        if (meta) {
          encontradosContador++;
          // Construir propuesta de cambios
          const cambios: Partial<LibroFisico> = {};
          if (meta.portada_url && (!libro.portada_url || libro.portada_url !== meta.portada_url)) {
            cambios.portada_url = meta.portada_url;
            cambios.estado_portada = 'pendiente_revision';
            cambios.portada_fuente = meta.fuente as any;
          }
          if (!libro.isbn && (meta.isbn13 || meta.isbn)) {
            cambios.isbn = meta.isbn13 || meta.isbn;
          }
          if (!libro.editorial && meta.editorial) {
            cambios.editorial = meta.editorial;
          }
          if (!libro.edicion_anio && meta.anio_publicacion) {
            cambios.edicion_anio = String(meta.anio_publicacion);
          }
          if (meta.categoria) {
            (cambios as any).categoria = meta.categoria;
          }
          if (meta.sinopsis) {
            (cambios as any).sinopsis = meta.sinopsis;
          }

          nuevosResultados.set(libro.id, {
            libroOriginal: libro,
            validacionIsbn: validacion,
            metadataEncontrada: meta,
            estadoProceso: 'encontrado',
            // Por defecto pre-aprobado si trae portada o ISBN faltante
            aprobado: Boolean(cambios.portada_url || cambios.isbn || cambios.editorial),
            cambiosPropuestos: cambios,
          });
        } else {
          nuevosResultados.set(libro.id, {
            libroOriginal: libro,
            validacionIsbn: validacion,
            metadataEncontrada: null,
            estadoProceso: 'no_encontrado',
            aprobado: false,
            cambiosPropuestos: {},
          });
        }
      } catch (err: any) {
        nuevosResultados.set(libro.id, {
          libroOriginal: libro,
          validacionIsbn: validacion,
          metadataEncontrada: null,
          estadoProceso: 'error',
          aprobado: false,
          cambiosPropuestos: {},
          errorMsg: err.message,
        });
      }

      setProgreso({
        actual: i + 1,
        total: universo.length,
        encontrados: encontradosContador,
      });
      setResultadosEnriquecimiento(new Map(nuevosResultados));

      // Respetar límite de tasa con delay de 350ms
      await new Promise((r) => setTimeout(r, 350));
    }

    setProcesando(false);
  };

  const pausarProcesamiento = () => {
    stopRequestedRef.current = true;
    setPausado(true);
    setProcesando(false);
  };

  // Alternar aprobación individual de un libro
  const toggleAprobacion = (libroId: string) => {
    const res = resultadosEnriquecimiento.get(libroId);
    if (!res) return;

    const actualizados = new Map(resultadosEnriquecimiento);
    actualizados.set(libroId, {
      ...res,
      aprobado: !res.aprobado,
    });
    setResultadosEnriquecimiento(actualizados);
  };

  // Aprobar todos los encontrados
  const handleAprobarTodos = () => {
    const actualizados = new Map(resultadosEnriquecimiento);
    actualizados.forEach((val, key) => {
      if (val.estadoProceso === 'encontrado') {
        actualizados.set(key, { ...val, aprobado: true });
      }
    });
    setResultadosEnriquecimiento(actualizados);
    notificar('Se seleccionaron todas las actualizaciones encontradas para su aplicación.');
  };

  // Deseleccionar todos
  const handleDeseleccionarTodos = () => {
    const actualizados = new Map(resultadosEnriquecimiento);
    actualizados.forEach((val, key) => {
      actualizados.set(key, { ...val, aprobado: false });
    });
    setResultadosEnriquecimiento(actualizados);
  };

  // -------------------------------------------------------------------------
  // 4. Aplicación Persistente de Cambios Aprobados por el Administrador
  // -------------------------------------------------------------------------
  const handleGuardarCambiosEnCatalogo = async () => {
    const aprobados = Array.from(resultadosEnriquecimiento.values()).filter((r) => r.aprobado);

    if (aprobados.length === 0) {
      alert('No hay libros con cambios aprobados para aplicar.');
      return;
    }

    if (
      !confirm(
        `¿Deseás aplicar y guardar definitivamente ${aprobados.length} actualizaciones bibliográficas en el catálogo físico de Biblioteca Roncedo?`
      )
    ) {
      return;
    }

    try {
      setGuardando(true);
      const cambiosMap = new Map<string, Partial<LibroFisico>>();
      aprobados.forEach((r) => {
        cambiosMap.set(r.libroOriginal.id, r.cambiosPropuestos);
      });

      // Crear nueva lista fusionada
      const nuevosLibros = librosFisicos.map((libro) => {
        const cambios = cambiosMap.get(libro.id);
        if (cambios) {
          return {
            ...libro,
            ...cambios,
          };
        }
        return libro;
      });

      // 1. Actualizar en el estado reactivo y localStorage
      actualizarLoteLibros(nuevosLibros);

      // 2. Guardar en el servidor (lib/data/librosFisicos.json)
      const resServidor = await guardarEnServidor(nuevosLibros);

      if (resServidor.success) {
        notificar(
          `¡Éxito! Se aplicaron y persistieron ${aprobados.length} fichas bibliográficas enriquecidas en el catálogo.`
        );
      } else {
        notificar(
          `Se actualizaron ${aprobados.length} libros en la sesión local. (Nota del servidor: ${resServidor.message || 'guardado local'})`
        );
      }
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  // -------------------------------------------------------------------------
  // 5. Exportar Informe de Auditoría a Excel (.xlsx)
  // -------------------------------------------------------------------------
  const exportarAuditoriaExcel = () => {
    const filas = librosFisicos.map((l) => {
      const val = validarIsbn(l.isbn || '');
      const enriquecimiento = resultadosEnriquecimiento.get(l.id);

      return {
        'N° Inventario': l.numero_inventario,
        'Título': l.titulo,
        'Autor': l.autor,
        'Editorial': l.editorial || 'No informada',
        'Año Edición': l.edicion_anio || 'No informado',
        'ISBN Original': l.isbn || 'Sin ISBN (Fondo Histórico)',
        'Tipo ISBN': val.tipo === 'isbn-13' ? 'ISBN-13' : val.tipo === 'isbn-10' ? 'ISBN-10' : val.raw ? 'Inválido' : 'No posee',
        'Estado ISBN': val.valido ? 'Válido' : val.raw ? `Inválido (${val.error})` : 'Opcional / Sin ISBN',
        'ISBN-13 Calculado': val.isbn13 || '-',
        'Posee Portada': l.portada_url ? 'Sí' : 'No',
        'Fuente Portada': l.portada_fuente || '-',
        'Topografía / Estantería': l.topografia_ubicacion || '-',
        'Estado Físico': l.estado === 'disponible' ? 'Disponible' : 'Prestado',
        'Enriquecimiento API': enriquecimiento?.estadoProceso || 'No procesado',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(filas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Auditoría ISBN');
    XLSX.writeFile(
      workbook,
      `auditoria_isbn_biblioteca_roncedo_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Alerta de notificación */}
      {mensajeExito && (
        <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg flex items-center justify-between font-bold text-xs animate-slide-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito(null)} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CABECERA DEL MÓDULO INTELIGENTE */}
      <div className="bg-gradient-to-r from-roncedo-navy via-[#18487D] to-[#2563EB] text-white p-6 rounded-3xl shadow-xl border border-white/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              Módulo Bibliográfico Inteligente
            </span>
            <span className="text-[11px] text-blue-100 font-medium">Norma ISO 2108</span>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">
            Gestión y Enriquecimiento de ISBN (10 y 13)
          </h2>
          <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
            Reconocimiento de códigos con o sin guiones, validación de dígitos verificadores, escaneo con cámara
            móvil y enriquecimiento masivo asistido desde Google Books y Open Library sin modificar datos sin
            autorización.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportarAuditoriaExcel}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-2xl border border-white/25 flex items-center gap-2 transition-colors text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar Auditoría Excel</span>
          </button>
        </div>
      </div>

      {/* TABLERO DE DIAGNÓSTICO METROLÓGICO DEL CATÁLOGO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Obras Físicas */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Ejemplares</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-slate-900">{diagnostico.total}</span>
            <BookOpen className="w-4 h-4 text-roncedo-navy" />
          </div>
          <span className="text-[9px] text-slate-500 mt-1">Fondo general</span>
        </div>

        {/* Con ISBN */}
        <div className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-blue-700">Con ISBN</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-roncedo-blue">{diagnostico.conIsbn}</span>
            <Barcode className="w-4 h-4 text-roncedo-blue" />
          </div>
          <span className="text-[9px] text-slate-500 mt-1">Identificados</span>
        </div>

        {/* Sin ISBN (Fondo Histórico) */}
        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-amber-700">Sin ISBN</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-amber-600">{diagnostico.sinIsbn}</span>
            <Info className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-[9px] text-slate-500 mt-1">Fondo histórico</span>
        </div>

        {/* ISBN Válidos */}
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-emerald-700">ISBN Válidos</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-emerald-600">{diagnostico.isbnValidos}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-[9px] text-slate-500 mt-1">
            {diagnostico.isbn13Count} (13) • {diagnostico.isbn10Count} (10)
          </span>
        </div>

        {/* ISBN Inválidos */}
        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-rose-700">ISBN Inválidos</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-rose-600">{diagnostico.isbnInvalidos}</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-[9px] text-rose-500 mt-1 font-semibold">Requieren revisión</span>
        </div>

        {/* Duplicados de ISBN */}
        <div className="bg-white p-3.5 rounded-2xl border border-indigo-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-indigo-700">Multiejemplares</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-indigo-700">{diagnostico.duplicadosCount}</span>
            <Copy className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-[9px] text-slate-500 mt-1">Mismo ISBN / N° Inv dist.</span>
        </div>

        {/* Con Portada */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-500">Con Portada</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-roncedo-navy">{diagnostico.conPortada}</span>
            <Sparkles className="w-4 h-4 text-roncedo-gold" />
          </div>
          <span className="text-[9px] text-slate-500 mt-1">{diagnostico.sinPortada} faltantes</span>
        </div>
      </div>

      {/* PANEL DE CONTROL DE ENRIQUECIMIENTO MASIVO */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-roncedo-navy text-white flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-roncedo-gold" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                Motor Asistido de Enriquecimiento Bibliográfico
              </h3>
              <p className="text-[11px] text-slate-500">
                Consulta Google Books y Open Library para recuperar portadas, editoriales, años y sinopsis sin
                sobreescribir datos arbitrariamente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={alcanceProceso}
              disabled={procesando}
              onChange={(e) => setAlcanceProceso(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
            >
              <option value="con_isbn">Procesar libros con ISBN ({diagnostico.conIsbn})</option>
              <option value="sin_portada">Procesar libros sin portada ({diagnostico.sinPortada})</option>
              <option value="primeros_20">Prueba rápida (Primeros 20 libros)</option>
              <option value="todos">Procesar todo el catálogo (1.283)</option>
            </select>

            {!procesando ? (
              <button
                type="button"
                onClick={iniciarProcesamiento}
                className="bg-roncedo-navy hover:bg-blue-900 text-white font-black px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
              >
                <Play className="w-4 h-4 text-roncedo-gold" />
                <span>{pausado ? 'Reanudar Proceso' : 'Iniciar Búsqueda'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={pausarProcesamiento}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
              >
                <Pause className="w-4 h-4" />
                <span>Pausar</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de Progreso del Enriquecimiento */}
        {(procesando || progreso.actual > 0) && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">
                Progreso: {progreso.actual} de {progreso.total} ejemplares evaluados
              </span>
              <span className="text-emerald-700 font-black">
                ✨ {progreso.encontrados} fichas enriquecidas encontradas
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-roncedo-blue to-emerald-500 h-full transition-all duration-300"
                style={{
                  width: `${progreso.total > 0 ? (progreso.actual / progreso.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Botones de Aprobación y Guardado Persistente */}
        {resultadosEnriquecimiento.size > 0 && (
          <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-roncedo-navy">
                Acciones de Aprobación:{' '}
                {Array.from(resultadosEnriquecimiento.values()).filter((r) => r.aprobado).length} seleccionados
              </span>
              <button
                type="button"
                onClick={handleAprobarTodos}
                className="text-roncedo-blue hover:text-blue-900 font-extrabold text-[11px] underline"
              >
                Aprobar todos
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleDeseleccionarTodos}
                className="text-slate-500 hover:text-slate-800 font-medium text-[11px] underline"
              >
                Deseleccionar
              </button>
            </div>

            <button
              type="button"
              disabled={guardando || Array.from(resultadosEnriquecimiento.values()).filter((r) => r.aprobado).length === 0}
              onClick={handleGuardarCambiosEnCatalogo}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>
                {guardando
                  ? 'Guardando en servidor...'
                  : `Guardar ${Array.from(resultadosEnriquecimiento.values()).filter((r) => r.aprobado).length} Actualizaciones`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Input de Búsqueda */}
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros por pestaña / píldoras */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => {
                setFiltroTipo('todos');
                setPaginaActual(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                filtroTipo === 'todos'
                  ? 'bg-roncedo-navy text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({diagnostico.total})
            </button>

            <button
              onClick={() => {
                setFiltroTipo('con_isbn');
                setPaginaActual(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                filtroTipo === 'con_isbn'
                  ? 'bg-roncedo-blue text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Con ISBN ({diagnostico.conIsbn})
            </button>

            <button
              onClick={() => {
                setFiltroTipo('sin_isbn');
                setPaginaActual(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                filtroTipo === 'sin_isbn'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sin ISBN ({diagnostico.sinIsbn})
            </button>

            <button
              onClick={() => {
                setFiltroTipo('isbn_valido');
                setPaginaActual(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                filtroTipo === 'isbn_valido'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Válidos ({diagnostico.isbnValidos})
            </button>

            <button
              onClick={() => {
                setFiltroTipo('isbn_invalido');
                setPaginaActual(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                filtroTipo === 'isbn_invalido'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Inválidos ({diagnostico.isbnInvalidos})
            </button>

            <button
              onClick={() => {
                setFiltroTipo('duplicados');
                setPaginaActual(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                filtroTipo === 'duplicados'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Multiejemplares ({diagnostico.duplicadosCount})
            </button>
          </div>
        </div>
      </div>

      {/* TABLA DE AUDITORÍA Y RESULTADOS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">Aprobar</th>
                <th className="py-3 px-3 w-16 text-center">Inv. #</th>
                <th className="py-3 px-3 w-14 text-center">Portada</th>
                <th className="py-3 px-4">Título y Autor</th>
                <th className="py-3 px-3">Editorial / Año</th>
                <th className="py-3 px-4">ISBN Registrado y Validación</th>
                <th className="py-3 px-4">Resultado Enriquecimiento API</th>
                <th className="py-3 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {librosPaginados.map((libro) => {
                const val = validarIsbn(libro.isbn || '');
                const enriquecimiento = resultadosEnriquecimiento.get(libro.id);
                const esDuplicado = diagnostico.duplicadosSet.has(libro.id);

                return (
                  <tr
                    key={libro.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      enriquecimiento?.aprobado ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    {/* Checkbox Aprobación */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(enriquecimiento?.aprobado)}
                        disabled={!enriquecimiento?.metadataEncontrada}
                        onChange={() => toggleAprobacion(libro.id)}
                        className="w-4 h-4 rounded text-roncedo-navy border-slate-300 focus:ring-roncedo-blue disabled:opacity-30 cursor-pointer"
                      />
                    </td>

                    {/* Número de Inventario */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-600">
                      #{libro.numero_inventario}
                    </td>

                    {/* Portada Miniatura */}
                    <td className="py-3 px-3 text-center">
                      <div className="relative w-10 h-14 rounded-md border border-slate-200 bg-slate-50 overflow-hidden mx-auto flex items-center justify-center shadow-2xs">
                        {libro.portada_url ? (
                          <Image
                            src={libro.portada_url}
                            alt={libro.titulo}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <BookOpen className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                    </td>

                    {/* Título y Autor */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 leading-tight break-words">{libro.titulo}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{libro.autor}</p>
                      {libro.topografia_ubicacion && (
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          📍 {libro.topografia_ubicacion}
                        </span>
                      )}
                    </td>

                    {/* Editorial y Año */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                      <p className="font-semibold">{libro.editorial || '-'}</p>
                      <p className="text-[10px] text-slate-400">{libro.edicion_anio || '-'}</p>
                    </td>

                    {/* ISBN y Validación Matemática */}
                    <td className="py-3 px-4">
                      {libro.isbn ? (
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-slate-800 block text-[11px]">
                            {formatearIsbn(libro.isbn)}
                          </span>
                          {val.valido ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{val.tipo.toUpperCase()} Válido</span>
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px] border border-rose-200"
                              title={val.error}
                            >
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Inválido</span>
                            </span>
                          )}
                          {esDuplicado && (
                            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded text-[9px] border border-indigo-200">
                              <Copy className="w-2.5 h-2.5" />
                              <span>Multiejemplar</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          Sin ISBN (Fondo Histórico)
                        </span>
                      )}
                    </td>

                    {/* Enriquecimiento Encontrado en API */}
                    <td className="py-3 px-4">
                      {enriquecimiento?.estadoProceso === 'encontrado' && enriquecimiento.metadataEncontrada ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-emerald-700 text-[11px]">
                              ✨ Ficha Encontrada ({enriquecimiento.metadataEncontrada.fuente})
                            </span>
                          </div>
                          {enriquecimiento.metadataEncontrada.portada_url && !libro.portada_url && (
                            <span className="text-[10px] text-slate-600 block">
                              + Portada disponible
                            </span>
                          )}
                          {enriquecimiento.metadataEncontrada.editorial && !libro.editorial && (
                            <span className="text-[10px] text-slate-600 block">
                              + Editorial: {enriquecimiento.metadataEncontrada.editorial}
                            </span>
                          )}
                        </div>
                      ) : enriquecimiento?.estadoProceso === 'procesando' ? (
                        <span className="text-roncedo-blue font-bold flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Consultando...</span>
                        </span>
                      ) : enriquecimiento?.estadoProceso === 'no_encontrado' ? (
                        <span className="text-slate-400 text-[10px] italic">Sin coincidencia en API</span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No evaluado</span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {enriquecimiento?.metadataEncontrada && (
                          <button
                            type="button"
                            onClick={() => {
                              setLibroEnRevision({
                                libro,
                                metadata: enriquecimiento.metadataEncontrada!,
                              });
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-roncedo-navy font-bold p-1.5 rounded-lg transition-colors"
                            title="Revisar comparativa y campos"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setLibroParaEscanear(libro);
                            setModalScannerAbierto(true);
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-1.5 rounded-lg transition-colors"
                          title="Escanear código de barras con cámara móvil"
                        >
                          <Camera className="w-3.5 h-3.5 text-roncedo-blue" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {librosPaginados.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold">No se encontraron libros con los criterios seleccionados.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong> (
              {librosFiltrados.length} resultados)
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Escaneo con Cámara */}
      <ScannerCodigoBarrasModal
        isOpen={modalScannerAbierto}
        onClose={() => {
          setModalScannerAbierto(false);
          setLibroParaEscanear(null);
        }}
        onIsbnDetectado={async (codigoDetectado) => {
          if (libroParaEscanear) {
            try {
              // Buscar metadatos para el código escaneado
              const res = await fetch(`/api/isbn/lookup?isbn=${encodeURIComponent(codigoDetectado)}`);
              const data = await res.json();
              if (data.success && data.metadata) {
                setLibroEnRevision({
                  libro: libroParaEscanear,
                  metadata: data.metadata,
                });
              } else {
                notificar(`Código detectado: ${codigoDetectado}. No se halló ficha en las APIs.`);
              }
            } catch {
              notificar(`Código detectado: ${codigoDetectado}.`);
            }
          }
        }}
      />

      {/* Modal de Revisión y Aprobación Fina */}
      {libroEnRevision && (
        <ModalRevisionBibliograficaIsbn
          isOpen={Boolean(libroEnRevision)}
          onClose={() => setLibroEnRevision(null)}
          libroActual={{
            titulo: libroEnRevision.libro.titulo,
            autor: libroEnRevision.libro.autor,
            editorial: libroEnRevision.libro.editorial,
            edicion_anio: libroEnRevision.libro.edicion_anio,
            isbn: libroEnRevision.libro.isbn,
            portada_url: libroEnRevision.libro.portada_url,
          }}
          metadataEncontrada={libroEnRevision.metadata}
          onAplicarCambios={(campos) => {
            const actualizados = new Map(resultadosEnriquecimiento);
            actualizados.set(libroEnRevision.libro.id, {
              libroOriginal: libroEnRevision.libro,
              validacionIsbn: validarIsbn(campos.isbn || libroEnRevision.libro.isbn || ''),
              metadataEncontrada: libroEnRevision.metadata,
              estadoProceso: 'encontrado',
              aprobado: true,
              cambiosPropuestos: campos as any,
            });
            setResultadosEnriquecimiento(actualizados);
            notificar(`Se preparó la actualización para "${libroEnRevision.libro.titulo}".`);
            setLibroEnRevision(null);
          }}
        />
      )}
    </div>
  );
}
