'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { LibroFisico } from '@/types';
import {
  X,
  Upload,
  Camera,
  BookOpen,
  Save,
  Trash2,
  CheckCircle2,
  Sparkles,
  Barcode,
  Search,
  RefreshCw,
  AlertTriangle,
  Info,
  Check,
  Layers,
  ArrowRight,
  Copy,
} from 'lucide-react';
import { buscarPortadaLibro } from '@/lib/services/bookCoversService';
import {
  validarIsbn,
  formatearIsbn,
  convertirIsbn10AIsbn13,
  limpiarIsbn,
  IsbnMetadata,
} from '@/lib/isbn/isbnService';
import { ScannerCodigoBarrasModal } from '@/components/isbn/ScannerCodigoBarrasModal';
import { ModalRevisionBibliograficaIsbn, DatosLibroEdicion } from '@/components/isbn/ModalRevisionBibliograficaIsbn';
import { useLibros } from '@/lib/context/LibrosContext';
import { ModalGestionTopografias } from './ModalGestionTopografias';
import {
  extraerSeccionPrincipal,
  extraerSubseccion,
  componerTopografia,
} from '@/lib/services/topografiaService';
import { subirPortadaLibroFisico } from '@/lib/supabase/storagePortadas';

interface ModalABMLibroProps {
  libroAEditar?: LibroFisico | null;
  ultimoInventario: number;
  onClose: () => void;
  onGuardar: (libro: Omit<LibroFisico, 'id'>) => Promise<void>;
  onEliminar?: (id: string) => Promise<void>;
}

export function ModalABMLibro({
  libroAEditar,
  ultimoInventario,
  onClose,
  onGuardar,
  onEliminar,
}: ModalABMLibroProps) {
  const isEditing = !!libroAEditar;
  const { librosFisicos, topografiasDisponibles } = useLibros();

  const [numeroInventario, setNumeroInventario] = useState<number>(
    libroAEditar ? libroAEditar.numero_inventario : ultimoInventario + 1
  );
  const [anioIncorporacion, setAnioIncorporacion] = useState<string>(
    libroAEditar ? String(libroAEditar.anio_incorporacion || '') : String(new Date().getFullYear())
  );
  const [autor, setAutor] = useState<string>(libroAEditar?.autor || '');
  const [titulo, setTitulo] = useState<string>(libroAEditar?.titulo || '');
  const [edicionAnio, setEdicionAnio] = useState<string>(
    libroAEditar?.edicion_anio ? String(libroAEditar.edicion_anio) : ''
  );
  const [lugar, setLugar] = useState<string>(libroAEditar?.lugar || 'Bs.As.');
  const [editorial, setEditorial] = useState<string>(libroAEditar?.editorial || '');
  const [isbn, setIsbn] = useState<string>(libroAEditar?.isbn || '');
  const [procedencia, setProcedencia] = useState<string>(libroAEditar?.procedencia || 'Donación');
  const [donante, setDonante] = useState<string>(libroAEditar?.donante_o_detalle || '');
  const [topografia, setTopografia] = useState<string>(libroAEditar?.topografia_ubicacion || '');
  const [portadaUrl, setPortadaUrl] = useState<string>(libroAEditar?.portada_url || '');
  const [estado, setEstado] = useState<'disponible' | 'prestado'>(libroAEditar?.estado || 'disponible');

  // Gestión Estructurada de Topografía / Secciones
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<string>(() =>
    extraerSeccionPrincipal(libroAEditar?.topografia_ubicacion || '')
  );
  const [subseccion, setSubseccion] = useState<string>(() =>
    extraerSubseccion(libroAEditar?.topografia_ubicacion || '')
  );
  const [modoEdicionManual, setModoEdicionManual] = useState<boolean>(false);
  const [modalTopografiasAbierto, setModalTopografiasAbierto] = useState<boolean>(false);

  const handleCambioSeccion = (nuevaSec: string) => {
    setSeccionSeleccionada(nuevaSec);
    const comp = componerTopografia(nuevaSec, subseccion);
    setTopografia(comp);
  };

  const handleCambioSubseccion = (nuevaSub: string) => {
    setSubseccion(nuevaSub);
    const comp = componerTopografia(seccionSeleccionada, nuevaSub);
    setTopografia(comp);
  };

  const handleSeleccionarDesdeABM = (sec: string) => {
    handleCambioSeccion(sec);
    setModalTopografiasAbierto(false);
  };

  const opcionesSecciones = useMemo(() => {
    const lista = [...(topografiasDisponibles || [])];
    if (
      seccionSeleccionada &&
      !lista.some((t) => t.toLowerCase() === seccionSeleccionada.toLowerCase())
    ) {
      lista.unshift(seccionSeleccionada);
    }
    return lista;
  }, [topografiasDisponibles, seccionSeleccionada]);

  // Campos adicionales enriquecidos
  const [categoria, setCategoria] = useState<string>((libroAEditar as any)?.categoria || '');
  const [sinopsis, setSinopsis] = useState<string>((libroAEditar as any)?.sinopsis || '');

  // Modales y estados de búsqueda / escaneo
  const [modalScannerAbierto, setModalScannerAbierto] = useState(false);
  const [modalRevisionAbierto, setModalRevisionAbierto] = useState(false);
  const [metadataEncontrada, setMetadataEncontrada] = useState<IsbnMetadata | null>(null);
  const [buscandoIsbn, setBuscandoIsbn] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [buscandoPortada, setBuscandoPortada] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Validación de ISBN en Tiempo Real
  // -------------------------------------------------------------------------
  const isbnValidation = useMemo(() => {
    return validarIsbn(isbn);
  }, [isbn]);

  // -------------------------------------------------------------------------
  // Detección de Duplicados en el Catálogo
  // -------------------------------------------------------------------------
  const librosDuplicadosIsbn = useMemo(() => {
    if (!isbnValidation.valido) return [];
    const cleanCurrent = isbnValidation.clean;
    return librosFisicos.filter((l) => {
      if (isEditing && l.id === libroAEditar?.id) return false;
      if (!l.isbn) return false;
      const cleanOtro = limpiarIsbn(l.isbn);
      // Comparar tanto si es igual directo como por conversión a ISBN-13
      if (cleanOtro === cleanCurrent) return true;
      if (isbnValidation.isbn13 && cleanOtro === isbnValidation.isbn13) return true;
      if (isbnValidation.isbn10 && cleanOtro === isbnValidation.isbn10) return true;
      return false;
    });
  }, [isbnValidation, librosFisicos, isEditing, libroAEditar]);

  const conflictoInventario = useMemo(() => {
    return librosFisicos.find(
      (l) => l.numero_inventario === Number(numeroInventario) && (!isEditing || l.id !== libroAEditar?.id)
    );
  }, [librosFisicos, numeroInventario, isEditing, libroAEditar]);

  // -------------------------------------------------------------------------
  // Búsqueda Automática por ISBN
  // -------------------------------------------------------------------------
  const handleBuscarIsbnApi = async (codigoABuscar?: string) => {
    const rawCode = codigoABuscar || isbn;
    const val = validarIsbn(rawCode);

    if (!val.valido) {
      // Si no es un ISBN válido pero hay título, buscar por título
      if (titulo.trim()) {
        try {
          setBuscandoIsbn(true);
          setError(null);
          const res = await fetch(`/api/isbn/lookup?titulo=${encodeURIComponent(titulo)}&autor=${encodeURIComponent(autor)}`);
          const data = await res.json();
          if (data.success && data.metadata) {
            setMetadataEncontrada(data.metadata);
            setModalRevisionAbierto(true);
          } else {
            setError('No se encontraron registros bibliográficos coincidentes con el título.');
          }
        } catch {
          setError('Error al consultar los servicios bibliográficos.');
        } finally {
          setBuscandoIsbn(false);
        }
        return;
      }

      setError(val.error || 'Ingresá un ISBN válido para buscar la ficha bibliográfica.');
      return;
    }

    try {
      setBuscandoIsbn(true);
      setError(null);
      const res = await fetch(`/api/isbn/lookup?isbn=${encodeURIComponent(val.clean)}`);
      const data = await res.json();

      if (data.success && data.metadata) {
        setMetadataEncontrada(data.metadata);
        setModalRevisionAbierto(true);
      } else {
        setError(`No se encontraron registros para el ISBN ${formatearIsbn(val.clean)} en Google Books ni Open Library.`);
      }
    } catch {
      setError('Error de conexión al consultar el servicio bibliográfico.');
    } finally {
      setBuscandoIsbn(false);
    }
  };

  // Convertir ISBN-10 a ISBN-13 en el campo
  const handleConvertirAIsbn13 = () => {
    if (isbnValidation.tipo === 'isbn-10' && isbnValidation.isbn13) {
      setIsbn(isbnValidation.isbn13);
    }
  };

  // Callback cuando la cámara detecta un código
  const handleIsbnDetectadoPorCamara = (codigoDetectado: string) => {
    setIsbn(codigoDetectado);
    // Lanzar búsqueda automática inmediatamente
    handleBuscarIsbnApi(codigoDetectado);
  };

  // Aplicar datos aprobados por el administrador desde el modal de revisión
  const handleAplicarCambiosBibliograficos = (campos: Partial<DatosLibroEdicion>) => {
    if (campos.titulo) setTitulo(campos.titulo);
    if (campos.autor) setAutor(campos.autor);
    if (campos.editorial) setEditorial(campos.editorial);
    if (campos.edicion_anio) setEdicionAnio(String(campos.edicion_anio));
    if (campos.isbn) setIsbn(campos.isbn);
    if (campos.portada_url) setPortadaUrl(campos.portada_url);
    if (campos.categoria) setCategoria(campos.categoria);
    if (campos.sinopsis) setSinopsis(campos.sinopsis);
  };

  // Búsqueda sólo de portada
  const handleBuscarPortadaAuto = async () => {
    if (!titulo.trim() && !isbn.trim()) {
      setError('Ingresá al menos el título o el ISBN para buscar la portada.');
      return;
    }
    try {
      setBuscandoPortada(true);
      setError(null);
      const res = await buscarPortadaLibro({
        titulo: titulo.trim(),
        autor: autor.trim(),
        editorial: editorial.trim(),
        edicion_anio: edicionAnio.trim(),
        isbn: isbn.trim(),
      });
      if (res.portada_url) {
        setPortadaUrl(res.portada_url);
      } else {
        setError('No se encontró portada con coincidencia confiable en Google Books ni Open Library.');
      }
    } catch {
      setError('Error al consultar las APIs de búsqueda.');
    } finally {
      setBuscandoPortada(false);
    }
  };

  // Manejador de subida de foto local optimizada a la nube (Supabase Storage)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('La imagen no debe superar los 15 MB.');
      return;
    }

    try {
      setSubiendoFoto(true);
      setError(null);
      const res = await subirPortadaLibroFisico(file, Number(numeroInventario) || undefined);
      if (res.success && res.url) {
        setPortadaUrl(res.url);
      } else {
        setError(res.error || 'No se pudo procesar la foto de portada.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al subir la foto de portada.');
    } finally {
      setSubiendoFoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('El título del libro es obligatorio.');
      return;
    }
    if (!autor.trim()) {
      setError('El autor del libro es obligatorio.');
      return;
    }

    if (conflictoInventario) {
      if (
        !confirm(
          `¡Atención! El número de inventario #${numeroInventario} ya está asignado al libro "${conflictoInventario.titulo}". ¿Estás seguro de que deseas continuar con este número?`
        )
      ) {
        return;
      }
    }

    try {
      setGuardando(true);
      setError(null);

      // Si el ISBN fue ingresado, guardarlo limpio o formateado según corresponda
      const isbnFinal = isbn.trim() ? limpiarIsbn(isbn) : undefined;

      await onGuardar({
        numero_inventario: Number(numeroInventario),
        anio_incorporacion: anioIncorporacion.trim(),
        autor: autor.trim(),
        titulo: titulo.trim(),
        edicion_anio: edicionAnio.trim(),
        lugar: lugar.trim(),
        editorial: editorial.trim(),
        isbn: isbnFinal,
        procedencia: procedencia.trim(),
        donante_o_detalle: donante.trim(),
        topografia_ubicacion: topografia.trim(),
        portada_url: portadaUrl.trim(),
        estado,
        ...(categoria ? { categoria } : {}),
        ...(sinopsis ? { sinopsis } : {}),
      } as any);

      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el ejemplar.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-fade-in">
        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col border border-slate-200 overflow-hidden my-auto">
          {/* Cabecera */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-roncedo-navy to-blue-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-roncedo-gold/20 border border-roncedo-gold/40 flex items-center justify-center text-roncedo-gold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-roncedo-celesteLight">
                  Panel de Administración • Inventario Físico
                </span>
                <h2 className="text-lg font-black leading-tight">
                  {isEditing ? `Modificar Ejemplar #${libroAEditar.numero_inventario}` : 'Registrar Nuevo Libro en Inventario'}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* SECCIÓN ISBN INTELIGENTE Y CÓDIGOS DE BARRA */}
            <div className="bg-gradient-to-br from-blue-50/70 to-slate-50 p-4 rounded-2xl border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-roncedo-navy text-white flex items-center justify-center">
                    <Barcode className="w-4 h-4 text-roncedo-gold" />
                  </div>
                  <div>
                    <span className="font-extrabold text-roncedo-navy block text-xs">
                      Identificación ISBN (10 y 13 Dígitos)
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Opcional • Libros históricos se registran con N° de Inventario
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalScannerAbierto(true)}
                  className="bg-roncedo-navy hover:bg-blue-900 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs text-[11px]"
                >
                  <Camera className="w-3.5 h-3.5 text-roncedo-gold" />
                  <span>Escanear Código de Barras</span>
                </button>
              </div>

              {/* Input de ISBN + Botón Buscar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="Ej: 978-950-49-0890-6 o 9504908902"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-mono text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-roncedo-blue font-bold tracking-wide"
                  />
                  {isbn && (
                    <button
                      type="button"
                      onClick={() => setIsbn('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleBuscarIsbnApi()}
                  disabled={buscandoIsbn || (!isbn.trim() && !titulo.trim())}
                  className="bg-roncedo-gold hover:bg-amber-400 text-roncedo-navy font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 flex-shrink-0 text-xs"
                  title="Consultar Google Books y Open Library para completar automáticamente los datos"
                >
                  <Sparkles className={`w-4 h-4 ${buscandoIsbn ? 'animate-spin' : ''}`} />
                  <span>{buscandoIsbn ? 'Buscando...' : 'Buscar Ficha'}</span>
                </button>
              </div>

              {/* Insignia / Estado de validación matemática */}
              {isbn.trim() ? (
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-[11px]">
                  {isbnValidation.valido ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {isbnValidation.tipo === 'isbn-13'
                          ? `ISBN-13 Válido (${formatearIsbn(isbnValidation.clean)})`
                          : `ISBN-10 Válido (${formatearIsbn(isbnValidation.clean)})`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{isbnValidation.error || 'ISBN inválido'}</span>
                    </div>
                  )}

                  {/* Botón de conversión rápida ISBN-10 a ISBN-13 */}
                  {isbnValidation.tipo === 'isbn-10' && isbnValidation.isbn13 && (
                    <button
                      type="button"
                      onClick={handleConvertirAIsbn13}
                      className="text-roncedo-navy hover:text-blue-900 bg-white border border-slate-300 font-bold px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 text-[11px]"
                      title="Convertir a formato estándar internacional ISBN-13"
                    >
                      <RefreshCw className="w-3 h-3 text-roncedo-blue" />
                      <span>Convertir a ISBN-13 ({isbnValidation.isbn13})</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium pt-0.5">
                  <Info className="w-3 h-3 text-slate-400" />
                  <span>El ISBN no es obligatorio. Los libros antiguos se identifican con el N° de inventario.</span>
                </div>
              )}

              {/* ALERTA DE CONTROL DE DUPLICADOS */}
              {librosDuplicadosIsbn.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-amber-800">
                    <Copy className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Control de Duplicados / Múltiples Ejemplares Físicos</span>
                  </div>
                  <p className="leading-relaxed">
                    Ya existen <strong>{librosDuplicadosIsbn.length} ejemplar(es)</strong> registrado(s) con este mismo ISBN en la biblioteca:
                  </p>
                  <ul className="list-disc list-inside font-medium pl-1 text-[10px] space-y-0.5">
                    {librosDuplicadosIsbn.slice(0, 3).map((dup) => (
                      <li key={dup.id}>
                        Inv. #{dup.numero_inventario}: &ldquo;{dup.titulo}&rdquo; ({dup.autor})
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-amber-800 font-bold pt-1">
                    ✓ Podés registrar este nuevo libro igualmente como un ejemplar físico independiente con su propio N° de Inventario.
                  </p>
                </div>
              )}
            </div>

            {/* Sección Foto de Portada */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-24 h-32 rounded-xl border border-slate-300 bg-white shadow-sm overflow-hidden flex flex-col items-center justify-center text-slate-400 flex-shrink-0 p-1">
                {subiendoFoto ? (
                  <div className="text-center p-2 flex flex-col items-center justify-center">
                    <RefreshCw className="w-7 h-7 text-roncedo-blue animate-spin mb-1" />
                    <span className="text-[9px] font-bold text-roncedo-blue">Subiendo a la nube...</span>
                  </div>
                ) : portadaUrl ? (
                  <Image
                    src={portadaUrl}
                    alt="Portada del libro"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="text-center p-2">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                    <span className="text-[9px] font-semibold text-slate-400">Sin foto de portada</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-bold text-slate-800 block text-xs">
                    Foto de Portada del Libro Físico
                  </span>
                  {portadaUrl && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Portada activa y visible para todos
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Podés buscarla automáticamente en Google Books / Open Library, o subir una foto desde tu dispositivo (se almacena en la nube para todos los usuarios).
                </p>

                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    type="button"
                    onClick={handleBuscarPortadaAuto}
                    disabled={buscandoPortada || subiendoFoto || (!titulo.trim() && !isbn.trim())}
                    className="bg-roncedo-gold hover:bg-amber-400 text-roncedo-navy font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                    title="Buscar automáticamente en Google Books y Open Library"
                  >
                    <Sparkles className={`w-4 h-4 ${buscandoPortada ? 'animate-spin' : ''}`} />
                    <span>{buscandoPortada ? 'Buscando...' : 'Auto-Buscar Portada'}</span>
                  </button>

                  <label className={`cursor-pointer bg-roncedo-navy hover:bg-blue-900 text-white font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm ${subiendoFoto ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    {subiendoFoto ? (
                      <RefreshCw className="w-4 h-4 text-roncedo-gold animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-roncedo-gold" />
                    )}
                    <span>{subiendoFoto ? 'Subiendo a la nube...' : 'Subir / Tomar Foto'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      disabled={subiendoFoto}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {portadaUrl && !subiendoFoto && (
                    <button
                      type="button"
                      onClick={() => setPortadaUrl('')}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-2 rounded-xl transition-colors"
                    >
                      Quitar Foto
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={portadaUrl.startsWith('data:') ? 'Imagen comprimida' : portadaUrl}
                  disabled={portadaUrl.startsWith('data:')}
                  onChange={(e) => setPortadaUrl(e.target.value)}
                  placeholder="O ingresar URL directa de la imagen (https://...)"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 placeholder-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Grilla de campos requeridos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Número de Inventario *
                </label>
                <input
                  type="number"
                  required
                  value={numeroInventario}
                  onChange={(e) => setNumeroInventario(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
                />
                {conflictoInventario && (
                  <span className="text-[10px] text-amber-700 font-bold block mt-1">
                    ⚠️ Número ya asignado a &ldquo;{conflictoInventario.titulo}&rdquo;
                  </span>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Año de Incorporación
                </label>
                <input
                  type="text"
                  value={anioIncorporacion}
                  onChange={(e) => setAnioIncorporacion(e.target.value)}
                  placeholder="Ej: 2005 o 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Título del Libro *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Título completo de la obra"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Autor / Autores *
                </label>
                <input
                  type="text"
                  required
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  placeholder="Ej: Burns, Jimmy o Hernández, José"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Edición - Año
                </label>
                <input
                  type="text"
                  value={edicionAnio}
                  onChange={(e) => setEdicionAnio(e.target.value)}
                  placeholder="Ej: 1997"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Lugar de Edición
                </label>
                <input
                  type="text"
                  value={lugar}
                  onChange={(e) => setLugar(e.target.value)}
                  placeholder="Ej: Bs.As., Córdoba, Madrid"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Editorial
                </label>
                <input
                  type="text"
                  value={editorial}
                  onChange={(e) => setEditorial(e.target.value)}
                  placeholder="Ej: Planeta, Sudamericana, Catálogos"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Procedencia
                </label>
                <select
                  value={procedencia}
                  onChange={(e) => setProcedencia(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
                >
                  <option value="Donación">Donación</option>
                  <option value="Compra">Compra</option>
                  <option value="Fondo Histórico">Fondo Histórico</option>
                  <option value="Canje">Canje</option>
                  <option value="Comisión Directiva">Comisión Directiva</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Donante / Detalle (&ldquo;Por / En&rdquo;)
                </label>
                <input
                  type="text"
                  value={donante}
                  onChange={(e) => setDonante(e.target.value)}
                  placeholder="Ej: Battaglino, Roberto / Hugo, o Familia vecina"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
                />
              </div>

              {/* Sección y Topografía (Estantería) */}
              <div className="sm:col-span-2 bg-gradient-to-br from-blue-50/60 to-slate-50 border border-blue-200/80 rounded-2xl p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-roncedo-navy" />
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Sección y Topografía (Estantería)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModoEdicionManual(!modoEdicionManual)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors"
                    >
                      {modoEdicionManual ? '← Volver a lista' : 'Entrada libre'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalTopografiasAbierto(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-roncedo-navy hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      <Layers className="w-3.5 h-3.5 text-roncedo-gold" />
                      <span>ABM Secciones</span>
                    </button>
                  </div>
                </div>

                {modoEdicionManual ? (
                  <div>
                    <input
                      type="text"
                      value={topografia}
                      onChange={(e) => setTopografia(e.target.value)}
                      placeholder="Ej: LITERATURA / NOVELAS, HISTORIA / ARGENTINA..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-roncedo-navy focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Modo texto libre para casos especiales. Formato recomendado: <code className="text-roncedo-blue font-bold">SECCIÓN / SUBSECCIÓN</code>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Dropdown de Secciones principales unificadas con el usuario final */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Sección Principal *
                        </label>
                        <select
                          value={seccionSeleccionada}
                          onChange={(e) => handleCambioSeccion(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-roncedo-navy focus:outline-none focus:ring-2 focus:ring-roncedo-blue shadow-sm"
                        >
                          <option value="">-- Seleccionar Sección --</option>
                          {opcionesSecciones.map((sec) => (
                            <option key={sec} value={sec}>
                              {sec}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Subsección o Estante opcional */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                          Subsección / Estante (Opcional)
                        </label>
                        <input
                          type="text"
                          value={subseccion}
                          onChange={(e) => handleCambioSubseccion(e.target.value)}
                          placeholder="Ej: NOVELAS, CUENTOS, Estante 3..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-roncedo-blue shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Previsualización en vivo */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-xl border border-blue-100 text-xs">
                      <span className="text-[11px] font-semibold text-slate-500">Ubicación asignada:</span>
                      {topografia ? (
                        <span className="font-mono font-bold text-roncedo-navy bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {topografia}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          Sin ubicación (selecciona una sección)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Categoría / Género */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Categoría / Género
                </label>
                <input
                  type="text"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  placeholder="Ej: Novela, Historia Argentina, Deporte"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Estado Actual
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
                >
                  <option value="disponible">🟢 Disponible para préstamo</option>
                  <option value="prestado">🔴 Prestado a socio</option>
                </select>
              </div>

              {/* Sinopsis opcional */}
              {sinopsis && (
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Sinopsis / Resumen Bibliográfico
                  </label>
                  <textarea
                    rows={3}
                    value={sinopsis}
                    onChange={(e) => setSinopsis(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* Botones del formulario */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              {isEditing && onEliminar ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('¿Estás seguro de que deseas dar de baja este ejemplar del inventario?')) {
                      onEliminar(libroAEditar.id);
                      onClose();
                    }
                  }}
                  className="text-red-600 hover:text-red-700 font-bold px-3 py-2 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Dar de Baja</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-roncedo-navy hover:bg-blue-900 text-white font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4 text-roncedo-gold" />
                  <span>{guardando ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Libro'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Escaneo con Cámara */}
      <ScannerCodigoBarrasModal
        isOpen={modalScannerAbierto}
        onClose={() => setModalScannerAbierto(false)}
        onIsbnDetectado={handleIsbnDetectadoPorCamara}
      />

      {/* Modal de Revisión y Aprobación de Datos Bibliográficos */}
      <ModalRevisionBibliograficaIsbn
        isOpen={modalRevisionAbierto}
        onClose={() => setModalRevisionAbierto(false)}
        libroActual={{
          titulo,
          autor,
          editorial,
          edicion_anio: edicionAnio,
          isbn,
          portada_url: portadaUrl,
          categoria,
          sinopsis,
        }}
        metadataEncontrada={metadataEncontrada}
        onAplicarCambios={handleAplicarCambiosBibliograficos}
      />

      {/* Modal ABM de Topografías y Secciones */}
      <ModalGestionTopografias
        isOpen={modalTopografiasAbierto}
        onClose={() => setModalTopografiasAbierto(false)}
        onSeleccionarSeccion={handleSeleccionarDesdeABM}
      />
    </>
  );
}
