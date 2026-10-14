'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  FileText,
  Upload,
  BookOpen,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  Globe,
  Trash2,
} from 'lucide-react';
import { LibroDigital, FuenteDigital, DisponibilidadDigital } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { compressImage } from '@/lib/utils/imageCompressor';

interface ModalLibroDigitalFormProps {
  libroParaEditar?: LibroDigital | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (libroGuardado: LibroDigital) => void;
  userId?: string;
}

const FUENTES_DISPONIBLES: { id: FuenteDigital; nombre: string; icono: string; badgeColor: string }[] = [
  { id: 'roncedo_digital', nombre: 'Biblioteca Roncedo (PDF)', icono: '🏛️', badgeColor: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'bnmm', nombre: 'BN Mariano Moreno (AR)', icono: '🇦🇷', badgeColor: 'bg-sky-100 text-sky-900 border-sky-300' },
  { id: 'bne', nombre: 'Bib. Nacional de España (BNE)', icono: '🇪🇸', badgeColor: 'bg-rose-100 text-rose-900 border-rose-300' },
  { id: 'wikisource', nombre: 'Wikisource en español', icono: '📖', badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'gutenberg', nombre: 'Project Gutenberg', icono: '📘', badgeColor: 'bg-blue-100 text-blue-900 border-blue-300' },
  { id: 'cervantes', nombre: 'Cervantes Virtual', icono: '🏛️', badgeColor: 'bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'openlibrary', nombre: 'Open Library / Archive', icono: '🌐', badgeColor: 'bg-slate-100 text-slate-900 border-slate-300' },
];

const DISPONIBILIDADES: { id: DisponibilidadDigital; label: string; badge: string }[] = [
  { id: 'descarga_libre', label: 'Descarga Libre (PDF / EPUB)', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'lectura_directa', label: 'Lectura Directa en la App', badge: 'bg-sky-100 text-sky-800 border-sky-300' },
  { id: 'prestamo_externo', label: 'Préstamo Digital / Externo', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
];

const LICENCIAS_FRECUENTES = [
  'Dominio Público',
  'Biblioteca Roncedo (Acceso Abierto)',
  'Creative Commons BY-NC 4.0',
  'Creative Commons BY-SA 4.0',
  'Autorizado por el Autor',
  'Obra Histórica Digitalizada',
];

const GENEROS_FRECUENTES = [
  'Historia Institucional y Local',
  'Literatura Argentina',
  'Novela y Ficción',
  'Cuentos y Relatos',
  'Poesía Hispanoamericana',
  'Filosofía y Ciencias Sociales',
  'Biografías y Memorias',
  'Investigación y Ensayos',
  'Teatro y Dramaturgia',
  'Educación y Pedagogía',
];

export function ModalLibroDigitalForm({
  libroParaEditar,
  isOpen,
  onClose,
  onSuccess,
  userId,
}: ModalLibroDigitalFormProps) {
  // Form fields
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [editorial, setEditorial] = useState('Ediciones Biblioteca Dr. Lautaro Roncedo');
  const [anio, setAnio] = useState(new Date().getFullYear().toString());
  const [idioma, setIdioma] = useState('es');
  const [genero, setGenero] = useState('Historia Institucional y Local');
  const [fuente, setFuente] = useState<FuenteDigital>('roncedo_digital');
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadDigital>('descarga_libre');
  const [tipoLicencia, setTipoLicencia] = useState('Biblioteca Roncedo (Acceso Abierto)');
  const [esArgentinoLatino, setEsArgentinoLatino] = useState(true);
  const [descripcion, setDescripcion] = useState('');
  const [enlaceOficial, setEnlaceOficial] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [epubUrl, setEpubUrl] = useState('');
  const [portadaUrl, setPortadaUrl] = useState('');

  // Files
  const [archivoPdf, setArchivoPdf] = useState<File | null>(null);
  const [archivoPortada, setArchivoPortada] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string>('');

  // UI state
  const [guardando, setGuardando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tabActiva, setTabActiva] = useState<'formulario' | 'preview'>('formulario');

  const filePdfInputRef = useRef<HTMLInputElement>(null);
  const filePortadaInputRef = useRef<HTMLInputElement>(null);

  // Inicializar campos según creación o edición
  useEffect(() => {
    if (libroParaEditar) {
      setTitulo(libroParaEditar.titulo || '');
      setAutor(libroParaEditar.autor || '');
      setEditorial(libroParaEditar.editorial || '');
      setAnio(libroParaEditar.anio?.toString() || new Date().getFullYear().toString());
      setIdioma(libroParaEditar.idioma || 'es');
      setGenero(libroParaEditar.genero_o_materia || 'Historia Institucional y Local');
      setFuente(libroParaEditar.fuente || 'roncedo_digital');
      setDisponibilidad(libroParaEditar.disponibilidad || 'descarga_libre');
      setTipoLicencia(libroParaEditar.tipo_licencia || 'Dominio Público');
      setEsArgentinoLatino(Boolean(libroParaEditar.es_argentino_o_latino));
      setDescripcion(libroParaEditar.descripcion || '');
      setEnlaceOficial(libroParaEditar.enlace_oficial || '');
      setPdfUrl(libroParaEditar.archivo_pdf_url || '');
      
      const epub = libroParaEditar.formatos?.find((f) => f.tipo === 'epub');
      setEpubUrl(epub ? epub.url : '');
      setPortadaUrl(libroParaEditar.portada_url || '');
      setPortadaPreview(libroParaEditar.portada_url || '');
    } else {
      // Valores por defecto para nueva carga
      setTitulo('');
      setAutor('Biblioteca Dr. Lautaro Roncedo');
      setEditorial('Ediciones Biblioteca Dr. Lautaro Roncedo');
      setAnio(new Date().getFullYear().toString());
      setIdioma('es');
      setGenero('Historia Institucional y Local');
      setFuente('roncedo_digital');
      setDisponibilidad('descarga_libre');
      setTipoLicencia('Biblioteca Roncedo (Acceso Abierto)');
      setEsArgentinoLatino(true);
      setDescripcion('');
      setEnlaceOficial('');
      setPdfUrl('');
      setEpubUrl('');
      setPortadaUrl('/images/escudo-roncedo.png');
      setPortadaPreview('/images/escudo-roncedo.png');
    }
    setArchivoPdf(null);
    setArchivoPortada(null);
    setErrorMsg(null);
    setMensajeEstado(null);
  }, [libroParaEditar, isOpen]);

  if (!isOpen) return null;

  // Manejo de archivo PDF
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg('Por favor selecciona un archivo con extensión .pdf');
        return;
      }
      setArchivoPdf(file);
      setErrorMsg(null);
      if (!titulo) {
        const nombreLimpio = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitulo(nombreLimpio);
      }
    }
  };

  // Manejo de imagen de portada
  const handlePortadaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressImage(file, 800, 0.85);
        setArchivoPortada(compressed.file);
        setPortadaPreview(compressed.previewUrl);
        // No colocamos la URL blob en el campo de texto para evitar URLs efímeras
        setPortadaUrl('');
      } catch (err) {
        console.warn('Error comprimiendo portada:', err);
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          setPortadaPreview(res);
          setPortadaUrl(res);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Subir portada a Supabase Storage con multi-bucket fallback
  const subirImagenPortada = async (file: File): Promise<string> => {
    const cleanName = `portada_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    if (isSupabaseConfigured && supabase) {
      // Intento 1: Bucket fototeca (carpeta portadas_digitales)
      try {
        const filePath = `portadas_digitales/${cleanName}`;
        const { data, error } = await supabase.storage
          .from('fototeca')
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type || 'image/webp',
          });
        if (!error && data) {
          const { data: publicData } = supabase.storage
            .from('fototeca')
            .getPublicUrl(filePath);
          if (publicData?.publicUrl) return publicData.publicUrl;
        }
      } catch (e) {
        console.warn('Fallo bucket fototeca para portada:', e);
      }

      // Intento 2: Bucket novedades
      try {
        const filePath = `portadas/${cleanName}`;
        const { data, error } = await supabase.storage
          .from('novedades')
          .upload(filePath, file, {
            upsert: true,
            contentType: file.type || 'image/webp',
          });
        if (!error && data) {
          const { data: publicData } = supabase.storage
            .from('novedades')
            .getPublicUrl(filePath);
          if (publicData?.publicUrl) return publicData.publicUrl;
        }
      } catch (e) {
        console.warn('Fallo bucket novedades para portada:', e);
      }
    }

    // Fallback: como la foto de portada comprimida pesa menos de 150 KB, Base64 es seguro y persistente
    try {
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    } catch {
      return '/images/escudo-roncedo.png';
    }
  };

  // Subir PDF a Supabase Storage con multi-bucket fallback
  const subirArchivoPdf = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    let lastErrorMsg = '';

    if (isSupabaseConfigured && supabase) {
      // Intento 1: Bucket dedicado libros_digitales_pdf
      try {
        const filePath = `obras/${timestamp}_${cleanName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('libros_digitales_pdf')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: 'application/pdf',
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('libros_digitales_pdf')
            .getPublicUrl(filePath);
          if (publicUrlData?.publicUrl) {
            return publicUrlData.publicUrl;
          }
        }
        if (uploadError) {
          console.warn('Intento en libros_digitales_pdf falló:', uploadError.message);
          lastErrorMsg = uploadError.message;
        }
      } catch (e: any) {
        console.warn('Excepción en libros_digitales_pdf:', e);
        lastErrorMsg = e.message;
      }

      // Intento 2: Bucket fototeca (carpeta digital_obras) con políticas abiertas
      try {
        const pathFototeca = `digital_obras/${timestamp}_${cleanName}`;
        const { data: dataFoto, error: errorFoto } = await supabase.storage
          .from('fototeca')
          .upload(pathFototeca, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: 'application/pdf',
          });

        if (!errorFoto && dataFoto) {
          const { data: publicUrlData } = supabase.storage
            .from('fototeca')
            .getPublicUrl(pathFototeca);
          if (publicUrlData?.publicUrl) {
            return publicUrlData.publicUrl;
          }
        }
        if (errorFoto) {
          console.warn('Intento en bucket fototeca falló:', errorFoto.message);
          lastErrorMsg = errorFoto.message;
        }
      } catch (e: any) {
        console.warn('Excepción en fototeca para PDF:', e);
        lastErrorMsg = e.message;
      }
    }

    // Si falló el almacenamiento en la nube y el archivo es muy liviano (< 2 MB), usar Base64
    if (file.size < 2 * 1024 * 1024) {
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    // Para archivos de más de 2 MB, jamás enviamos Base64 por JSON porque Vercel rechaza payloads > 4.5 MB con error 413
    throw new Error(
      `No se pudo subir el archivo PDF (${(file.size / (1024 * 1024)).toFixed(1)} MB) a Supabase Storage (${lastErrorMsg || 'permisos denegados o almacenamiento no disponible'}). Podés ingresar el enlace público directo al archivo en el campo de URL o verificar los permisos del bucket en Supabase.`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!titulo.trim()) {
      setErrorMsg('El título de la obra es obligatorio.');
      return;
    }

    if (!autor.trim()) {
      setErrorMsg('El autor de la obra es obligatorio.');
      return;
    }

    setGuardando(true);
    setMensajeEstado('Procesando datos bibliográficos...');

    try {
      let finalPdfUrl = pdfUrl.trim();
      let finalPortadaUrl = portadaUrl.trim();

      // 1. Subida de PDF físico si fue seleccionado
      if (archivoPdf) {
        setMensajeEstado(`Subiendo archivo PDF "${archivoPdf.name}" (${(archivoPdf.size / (1024 * 1024)).toFixed(1)} MB)...`);
        finalPdfUrl = await subirArchivoPdf(archivoPdf);
      }

      // 2. Subida de Portada física si fue seleccionada
      if (archivoPortada) {
        setMensajeEstado('Guardando imagen de portada...');
        finalPortadaUrl = await subirImagenPortada(archivoPortada);
      }

      // Si la URL de portada es un blob temporal de previsualización, limpiarlo o reemplazarlo
      if (!finalPortadaUrl || finalPortadaUrl.startsWith('blob:')) {
        finalPortadaUrl = portadaPreview && !portadaPreview.startsWith('blob:')
          ? portadaPreview
          : '/images/escudo-roncedo.png';
      }

      setMensajeEstado('Guardando en catálogo institucional...');

      const payload = {
        id: libroParaEditar?.id || undefined,
        titulo: titulo.trim(),
        autor: autor.trim(),
        editorial: editorial.trim() || 'Ediciones Biblioteca Dr. Lautaro Roncedo',
        anio: anio ? Number(anio) : new Date().getFullYear(),
        idioma: idioma.trim() || 'es',
        genero_o_materia: genero.trim() || 'Colección Digital Biblioteca Roncedo',
        descripcion: descripcion.trim(),
        fuente,
        disponibilidad,
        tipo_licencia: tipoLicencia.trim(),
        es_argentino_o_latino: esArgentinoLatino,
        archivo_pdf_url: finalPdfUrl || undefined,
        epub_url: epubUrl.trim() || undefined,
        portada_url: finalPortadaUrl,
        enlace_oficial: enlaceOficial.trim() || finalPdfUrl || undefined,
        subido_por: userId,
      };

      const res = await fetch('/api/digital/roncedo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        if (res.status === 413) {
          throw new Error('El tamaño de los datos enviados excede el límite del servidor (4.5 MB). El archivo PDF debe subirse al almacenamiento de Supabase o vincularse por enlace URL.');
        }
        throw new Error(`Error del servidor (${res.status}): ${responseText.substring(0, 150)}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Error al guardar el libro digital.');
      }

      onSuccess(data.libro);
      onClose();
    } catch (err: any) {
      console.error('Error al guardar libro digital:', err);
      setErrorMsg(err.message || 'Ocurrió un error inesperado al guardar la obra.');
    } finally {
      setGuardando(false);
      setMensajeEstado(null);
    }
  };

  const fuenteActualConfig = FUENTES_DISPONIBLES.find((f) => f.id === fuente) || FUENTES_DISPONIBLES[0];
  const dispActualConfig = DISPONIBILIDADES.find((d) => d.id === disponibilidad) || DISPONIBILIDADES[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Encabezado del Modal */}
        <div className="bg-gradient-to-r from-[#0C2340] via-[#123966] to-[#1A5C9E] text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-roncedo-gold text-slate-900 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full">
                  {libroParaEditar ? 'Modificación de Obra' : 'Alta de Libro Digital (PDF)'}
                </span>
                <span className="text-xs text-blue-200 hidden sm:inline">
                  Catálogo Multifuente Roncedo
                </span>
              </div>
              <h2 className="text-lg font-black text-white leading-tight mt-0.5">
                {libroParaEditar ? `Editar: "${libroParaEditar.titulo}"` : 'Cargar Nueva Obra Digital en PDF'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón de alternancia en pantallas pequeñas */}
            <div className="flex lg:hidden bg-white/10 rounded-xl p-0.5 border border-white/20">
              <button
                type="button"
                onClick={() => setTabActiva('formulario')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                  tabActiva === 'formulario' ? 'bg-roncedo-gold text-slate-900' : 'text-white'
                }`}
              >
                Campos
              </button>
              <button
                type="button"
                onClick={() => setTabActiva('preview')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                  tabActiva === 'preview' ? 'bg-roncedo-gold text-slate-900' : 'text-white'
                }`}
              >
                Vista Previa
              </button>
            </div>

            <button
              onClick={onClose}
              disabled={guardando}
              className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mensaje de error si ocurre */}
        {errorMsg && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 text-xs text-rose-800 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Cuerpo del Modal: Formulario + Vista Previa en Tiempo Real */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Panel Izquierdo: Formulario de Carga */}
          <form
            id="form-libro-digital"
            onSubmit={handleSubmit}
            className={`lg:col-span-7 space-y-5 ${
              tabActiva === 'formulario' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* SECCIÓN 1: Identificación Bibliográfica */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-roncedo-blue" />
                <span>1. Información Bibliográfica Principal</span>
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Título de la Obra *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Historia de Alcira Gigena y la Biblioteca Dr. Lautaro Roncedo"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Autor / Autores *
                  </label>
                  <input
                    type="text"
                    required
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    placeholder="Ej: Dr. Lautaro Roncedo / José Hernández"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Editorial / Edición
                  </label>
                  <input
                    type="text"
                    value={editorial}
                    onChange={(e) => setEditorial(e.target.value)}
                    placeholder="Ej: Ediciones Biblioteca Roncedo"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  />
                </div>
              </div>

              {/* Año, Idioma y Autor Argentino/Latino */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Año de Publicación
                  </label>
                  <input
                    type="number"
                    value={anio}
                    onChange={(e) => setAnio(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Idioma
                  </label>
                  <select
                    value={idioma}
                    onChange={(e) => setIdioma(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  >
                    <option value="es">Español (es)</option>
                    <option value="en">Inglés (en)</option>
                    <option value="fr">Francés (fr)</option>
                    <option value="it">Italiano (it)</option>
                    <option value="pt">Portugués (pt)</option>
                    <option value="la">Latín (la)</option>
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-300 cursor-pointer hover:bg-blue-50/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={esArgentinoLatino}
                      onChange={(e) => setEsArgentinoLatino(e.target.checked)}
                      className="w-4 h-4 text-roncedo-blue rounded focus:ring-roncedo-blue cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-slate-800 leading-tight">
                      🇦🇷 ¿Autor Argentino o Latino?
                    </span>
                  </label>
                </div>
              </div>

              {/* Género o Materia */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Género o Materia
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    placeholder="Escribe o selecciona abajo"
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  />
                </div>
                {/* Sugerencias de Géneros */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {GENEROS_FRECUENTES.slice(0, 5).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenero(g)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                        genero === g
                          ? 'bg-roncedo-blue text-white border-roncedo-blue font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: Repositorio, Disponibilidad y Licencia */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-roncedo-blue" />
                <span>2. Repositorio, Disponibilidad y Licencia</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Fuente / Plataforma */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Fuente / Repositorio Oficial
                  </label>
                  <select
                    value={fuente}
                    onChange={(e) => {
                      const nuevaFuente = e.target.value as FuenteDigital;
                      setFuente(nuevaFuente);
                      if (nuevaFuente === 'roncedo_digital' || nuevaFuente === 'bnmm') {
                        setEsArgentinoLatino(true);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  >
                    {FUENTES_DISPONIBLES.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.icono} {f.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Disponibilidad */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Tipo de Disponibilidad
                  </label>
                  <select
                    value={disponibilidad}
                    onChange={(e) => setDisponibilidad(e.target.value as DisponibilidadDigital)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  >
                    {DISPONIBILIDADES.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tipo de Licencia */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Licencia Legal de la Obra
                  </label>
                  <select
                    value={tipoLicencia}
                    onChange={(e) => setTipoLicencia(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  >
                    {LICENCIAS_FRECUENTES.map((lic) => (
                      <option key={lic} value={lic}>
                        {lic}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Enlace Oficial / Fuente Original */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Enlace a Fuente Original (Opcional)
                  </label>
                  <input
                    type="url"
                    value={enlaceOficial}
                    onChange={(e) => setEnlaceOficial(e.target.value)}
                    placeholder="https://gutenberg.org/... o sitio original"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: Archivos Digitales (PDF y EPUB) */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-amber-700" />
                  <span>3. Archivo PDF y Formatos Digitales</span>
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  Soporta Lector en App
                </span>
              </h3>

              {/* Subida de archivo PDF físico */}
              <div>
                <label className="block text-[11px] font-bold text-amber-900 uppercase mb-1">
                  Subir Archivo PDF desde tu Dispositivo
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    ref={filePdfInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => filePdfInputRef.current?.click()}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Seleccionar Archivo PDF</span>
                  </button>

                  {archivoPdf ? (
                    <div className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          📄 {archivoPdf.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {(archivoPdf.size / (1024 * 1024)).toFixed(2)} MB • Listo para subir
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setArchivoPdf(null);
                          if (filePdfInputRef.current) filePdfInputRef.current.value = '';
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Quitar archivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic self-center">
                      Ningún archivo seleccionado
                    </span>
                  )}
                </div>
              </div>

              {/* Input de URL directa de PDF (opcional o complementaria) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  O Enlace / URL directa al archivo PDF (si ya está online)
                </label>
                <input
                  type="url"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://.../libro.pdf"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                />
              </div>

              {/* Enlace EPUB (opcional) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Enlace / URL al archivo EPUB (Opcional)
                </label>
                <input
                  type="url"
                  value={epubUrl}
                  onChange={(e) => setEpubUrl(e.target.value)}
                  placeholder="https://.../libro.epub"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                />
              </div>
            </div>

            {/* SECCIÓN 4: Portada y Sinopsis */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-roncedo-blue" />
                <span>4. Imagen de Portada y Sinopsis</span>
              </h3>

              {/* Portada */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Portada del Libro (Subir foto o ingresar URL)
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input
                    ref={filePortadaInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePortadaChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => filePortadaInputRef.current?.click()}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs py-2 px-3 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir Portada (JPG/PNG/WEBP)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPortadaUrl('/images/escudo-roncedo.png');
                      setPortadaPreview('/images/escudo-roncedo.png');
                      setArchivoPortada(null);
                    }}
                    className="text-[11px] text-roncedo-blue hover:underline font-bold"
                  >
                    Usar Escudo Institucional Roncedo
                  </button>
                </div>

                <div className="mt-2">
                  <input
                    type="text"
                    value={portadaUrl}
                    onChange={(e) => {
                      setPortadaUrl(e.target.value);
                      setPortadaPreview(e.target.value);
                    }}
                    placeholder="/images/escudo-roncedo.png o URL externa"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  />
                </div>
              </div>

              {/* Sinopsis */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Descripción / Sinopsis de la Obra
                </label>
                <textarea
                  rows={4}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Reseña breve de la publicación, contexto histórico o contenido general..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                />
              </div>
            </div>
          </form>

          {/* Panel Derecho: Vista Previa en Tiempo Real */}
          <div
            className={`lg:col-span-5 flex flex-col ${
              tabActiva === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="sticky top-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-roncedo-gold" />
                  <span>Vista Previa en Tiempo Real</span>
                </span>
                <span className="text-[10px] bg-blue-100 text-roncedo-navy font-bold px-2 py-0.5 rounded-full">
                  Ficha Oficial del Catálogo
                </span>
              </div>

              {/* Tarjeta simulada de la Biblioteca Digital */}
              <div
                className={`bg-white rounded-3xl p-5 shadow-card border transition-all duration-200 flex flex-col justify-between ${
                  fuente === 'roncedo_digital'
                    ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                    : 'border-blue-200/80 shadow-md'
                }`}
              >
                <div>
                  {/* Cabecera de la Ficha: Fuente y Disponibilidad */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${fuenteActualConfig.badgeColor}`}
                    >
                      <span>{fuenteActualConfig.icono}</span>
                      {fuenteActualConfig.nombre}
                    </span>

                    {fuente === 'roncedo_digital' ? (
                      <span className="bg-amber-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                        🏛️ Archivo PDF Roncedo
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dispActualConfig.badge}`}>
                        {dispActualConfig.label.split(' ')[0]} {dispActualConfig.label.split(' ')[1] || ''}
                      </span>
                    )}
                  </div>

                  {/* Título y Autor */}
                  <div className="flex gap-3 items-start mb-3">
                    {portadaPreview ? (
                      <div className="relative w-16 h-24 flex-shrink-0 rounded-xl overflow-hidden shadow border border-slate-200 bg-slate-100">
                        <Image
                          src={portadaPreview}
                          alt={titulo || 'Portada'}
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-16 h-24 flex-shrink-0 rounded-xl text-white flex flex-col items-center justify-center p-1.5 text-center shadow ${
                          fuente === 'roncedo_digital'
                            ? 'bg-gradient-to-br from-[#0c2340] to-amber-600'
                            : 'bg-gradient-to-br from-roncedo-navy to-roncedo-celeste'
                        }`}
                      >
                        <FileText className="w-6 h-6 text-amber-300 mb-1" />
                        <span className="text-[8px] font-bold uppercase leading-tight line-clamp-2">
                          {fuente === 'roncedo_digital' ? 'Roncedo' : fuente}
                        </span>
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      {esArgentinoLatino && fuente !== 'roncedo_digital' && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mb-1">
                          🇦🇷 Autor Argentino / Latino
                        </span>
                      )}
                      {fuente === 'roncedo_digital' && (
                        <span className="text-[10px] font-bold text-slate-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 inline-block mb-1">
                          Colección Digital Local
                        </span>
                      )}
                      <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2" title={titulo || 'Título de la obra'}>
                        {titulo || 'Título de la obra en PDF'}
                      </h3>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        {autor || 'Autor de la obra'}
                      </p>
                      {editorial && (
                        <p className="text-[10px] text-slate-500 mt-0.5">Ed: {editorial}</p>
                      )}
                      {anio && (
                        <p className="text-[10px] text-slate-400 mt-0.5">Año: {anio}</p>
                      )}
                    </div>
                  </div>

                  {/* Descripción / Sinopsis */}
                  <p className="text-xs text-slate-500 line-clamp-3 mb-3 leading-relaxed">
                    {descripcion || 'Reseña bibliográfica y detalles de la obra cargada...'}
                  </p>

                  {/* Etiquetas de formatos disponibles y licencia */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(archivoPdf || pdfUrl) && (
                      <span className="text-[9px] font-bold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <FileText className="w-2.5 h-2.5" />
                        PDF disponible
                      </span>
                    )}
                    {epubUrl && (
                      <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                        EPUB disponible
                      </span>
                    )}
                    {tipoLicencia && (
                      <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {tipoLicencia}
                      </span>
                    )}
                    <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                      Idioma {idioma === 'es' ? 'Español' : idioma.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Botones de Acción Simulados */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled
                      className="w-full bg-roncedo-navy text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 opacity-90 cursor-default shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-roncedo-gold" />
                      <span>Leer en la App</span>
                    </button>

                    <button
                      type="button"
                      disabled
                      className="w-full bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 opacity-90 cursor-default shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar</span>
                    </button>
                  </div>

                  <div className="text-center">
                    <span className="text-[11px] font-bold text-slate-500 hover:text-roncedo-navy inline-flex items-center gap-1">
                      <span>Fuente original ({fuenteActualConfig.nombre.split(' ')[0]})</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarjeta de aclaración para biblioroncedo */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-[11px] text-blue-900 space-y-1">
                <span className="font-bold flex items-center gap-1 text-roncedo-navy">
                  <ShieldCheck className="w-4 h-4 text-roncedo-blue" />
                  Garantía de Persistencia Dual
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Al guardar, la obra se sincroniza automáticamente tanto en el archivo local de la biblioteca como en la nube de Supabase, asegurando disponibilidad permanente para todos los socios.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Acciones Inferior */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-600 font-semibold flex items-center gap-2">
            {guardando && (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-roncedo-blue" />
                <span className="text-roncedo-blue font-bold">{mensajeEstado || 'Guardando...'}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              form="form-libro-digital"
              disabled={guardando}
              className="bg-roncedo-navy hover:bg-blue-900 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {guardando ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-roncedo-gold" />
                  <span>Guardando Obra...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-roncedo-gold" />
                  <span>{libroParaEditar ? 'Guardar Cambios' : 'Publicar Obra Digital'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
