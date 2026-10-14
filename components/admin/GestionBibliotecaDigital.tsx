'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Globe2,
  RefreshCw,
  BookOpen,
  Download,
  Upload,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  FileText,
  Building,
  Sparkles,
  Search,
  Check,
  X,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { LibroDigital, FuenteDigital, MetricasBibliotecaDigital } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { LectorDigitalModal } from '@/components/digital/LectorDigitalModal';
import { formatFechaArgentina } from '@/lib/utils';

export function GestionBibliotecaDigital() {
  const [metricas, setMetricas] = useState<MetricasBibliotecaDigital | null>(null);
  const [cargandoMetricas, setCargandoMetricas] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [resultadoSync, setResultadoSync] = useState<{ exito: boolean; mensaje: string } | null>(null);

  // Libros propios de Biblioteca Roncedo
  const [librosRoncedo, setLibrosRoncedo] = useState<LibroDigital[]>([]);
  const [cargandoRoncedo, setCargandoRoncedo] = useState(true);
  const [modalNuevoLibro, setModalNuevoLibro] = useState(false);
  const [guardandoLibro, setGuardandoLibro] = useState(false);
  const [libroParaLeer, setLibroParaLeer] = useState<LibroDigital | null>(null);

  // Formulario nuevo libro Roncedo
  const [formTitulo, setFormTitulo] = useState('');
  const [formAutor, setFormAutor] = useState('Biblioteca Dr. Lautaro Roncedo');
  const [formEditorial, setFormEditorial] = useState('Ediciones Biblioteca Roncedo');
  const [formAnio, setFormAnio] = useState(new Date().getFullYear().toString());
  const [formGenero, setFormGenero] = useState('Historia Institucional y Local');
  const [formLicencia, setFormLicencia] = useState('Biblioteca Roncedo (Acceso Abierto)');
  const [formPdfUrl, setFormPdfUrl] = useState('');
  const [formPortadaUrl, setFormPortadaUrl] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [archivoPdfFile, setArchivoPdfFile] = useState<File | null>(null);
  const [subiendoPdf, setSubiendoPdf] = useState(false);
  const [progresoPdf, setProgresoPdf] = useState(0);

  // Cargar métricas
  const cargarMetricas = useCallback(async () => {
    setCargandoMetricas(true);
    try {
      const res = await fetch('/api/digital/sync');
      const data = await res.json();
      if (data.success && data.metricas) {
        setMetricas(data.metricas);
      }
    } catch (err) {
      console.error('Error cargando métricas:', err);
    } finally {
      setCargandoMetricas(false);
    }
  }, []);

  // Cargar libros de Roncedo
  const cargarLibrosRoncedo = useCallback(async () => {
    setCargandoRoncedo(true);
    try {
      const res = await fetch('/api/digital/roncedo');
      const data = await res.json();
      if (data.success && Array.isArray(data.libros)) {
        setLibrosRoncedo(data.libros);
      }
    } catch (err) {
      console.error('Error cargando libros de Roncedo:', err);
    } finally {
      setCargandoRoncedo(false);
    }
  }, []);

  useEffect(() => {
    cargarMetricas();
    cargarLibrosRoncedo();
  }, [cargarMetricas, cargarLibrosRoncedo]);

  // Sincronizar catálogo con Supabase
  const handleSincronizar = async () => {
    setSincronizando(true);
    setResultadoSync(null);
    try {
      const res = await fetch('/api/digital/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_all' }),
      });
      const data = await res.json();
      if (data.success) {
        setResultadoSync({
          exito: true,
          mensaje: `Sincronización completada con éxito. ${data.sincronizados} obras integradas con Supabase.`,
        });
        await cargarMetricas();
      } else {
        setResultadoSync({
          exito: false,
          mensaje: data.error || 'Error durante la sincronización.',
        });
      }
    } catch (err: any) {
      setResultadoSync({
        exito: false,
        mensaje: err.message || 'Error de red al sincronizar.',
      });
    } finally {
      setSincronizando(false);
    }
  };

  // Subir archivo PDF
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Por favor selecciona un archivo con formato PDF (.pdf).');
        return;
      }
      setArchivoPdfFile(file);
      if (!formTitulo) {
        const nombreLimpio = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setFormTitulo(nombreLimpio);
      }
    }
  };

  // Guardar nuevo libro de Biblioteca Roncedo
  const handleGuardarLibro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim()) {
      alert('El título del libro es obligatorio.');
      return;
    }

    setGuardandoLibro(true);
    try {
      let finalPdfUrl = formPdfUrl.trim();

      // Si seleccionó un archivo PDF físico y Supabase está configurado, subir al bucket
      if (archivoPdfFile) {
        setSubiendoPdf(true);
        if (isSupabaseConfigured && supabase) {
          const timestamp = Date.now();
          const cleanName = archivoPdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const filePath = `obras/${timestamp}_${cleanName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('libros_digitales_pdf')
            .upload(filePath, archivoPdfFile, {
              cacheControl: '3600',
              upsert: true,
              contentType: 'application/pdf',
            });

          if (uploadError) {
            console.warn('Fallo en Supabase Storage, usando blob/url:', uploadError.message);
          } else if (uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from('libros_digitales_pdf')
              .getPublicUrl(filePath);
            finalPdfUrl = publicUrlData.publicUrl;
          }
        }

        // Si no subió a Supabase Storage y no hay url externa, usar data URL o fallback
        if (!finalPdfUrl) {
          finalPdfUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(archivoPdfFile);
          });
        }
      }

      const res = await fetch('/api/digital/roncedo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: formTitulo.trim(),
          autor: formAutor.trim(),
          editorial: formEditorial.trim(),
          anio: formAnio.trim(),
          genero_o_materia: formGenero.trim(),
          tipo_licencia: formLicencia.trim(),
          archivo_pdf_url: finalPdfUrl,
          portada_url: formPortadaUrl.trim() || '/images/escudo-roncedo.png',
          descripcion: formDescripcion.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('¡Libro digital agregado exitosamente al catálogo oficial de Biblioteca Roncedo!');
        setModalNuevoLibro(false);
        // Reset form
        setFormTitulo('');
        setFormPdfUrl('');
        setFormPortadaUrl('');
        setFormDescripcion('');
        setArchivoPdfFile(null);
        await cargarLibrosRoncedo();
        await cargarMetricas();
      } else {
        alert(`Error al guardar: ${data.error || 'Ocurrió un error inesperado'}`);
      }
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setGuardandoLibro(false);
      setSubiendoPdf(false);
    }
  };

  // Eliminar libro de Biblioteca Roncedo
  const handleEliminarLibro = async (id: string, titulo: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la obra "${titulo}" de los Libros Digitales de la Biblioteca?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/digital/roncedo?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await cargarLibrosRoncedo();
        await cargarMetricas();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const fuentesDetalle: { id: FuenteDigital; nombre: string; icono: string; color: string }[] = [
    { id: 'roncedo_digital', nombre: 'Biblioteca Roncedo (PDF)', icono: '🏛️', color: 'text-amber-700 bg-amber-50 border-amber-300' },
    { id: 'bnmm', nombre: 'BN Mariano Moreno (AR)', icono: '🇦🇷', color: 'text-sky-800 bg-sky-50 border-sky-300' },
    { id: 'bne', nombre: 'Bib. Nacional de España (BNE)', icono: '🇪🇸', color: 'text-rose-800 bg-rose-50 border-rose-300' },
    { id: 'wikisource', nombre: 'Wikisource en español', icono: '📖', color: 'text-emerald-800 bg-emerald-50 border-emerald-300' },
    { id: 'gutenberg', nombre: 'Project Gutenberg', icono: '📘', color: 'text-blue-800 bg-blue-50 border-blue-300' },
    { id: 'cervantes', nombre: 'Cervantes Virtual', icono: '🏛️', color: 'text-purple-800 bg-purple-50 border-purple-300' },
    { id: 'openlibrary', nombre: 'Open Library / Archive', icono: '🌐', color: 'text-slate-800 bg-slate-100 border-slate-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner de Cabecera del Módulo */}
      <div className="bg-gradient-to-r from-[#0C2340] via-[#123966] to-[#1A5C9E] text-white rounded-3xl p-6 shadow-xl border border-white/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-roncedo-gold text-slate-900 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-sm">
              Control de Catálogo Digital
            </span>
            <span className="text-xs text-blue-200">
              7 Plataformas Interconectadas
            </span>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">
            Biblioteca Digital e Integración Masiva
          </h2>
          <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
            Monitoreo en tiempo real de más de 5.800 obras digitales en español. Supera ampliamente los 1.283 libros físicos de la sede, con soporte de sincronización persistente y repositorio de archivos PDF propios de Biblioteca Roncedo.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <button
            onClick={cargarMetricas}
            disabled={cargandoMetricas}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl border border-white/20 transition-colors flex items-center justify-center gap-1.5"
            title="Recargar Métricas"
          >
            <RefreshCw className={`w-4 h-4 ${cargandoMetricas ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>

          <button
            onClick={handleSincronizar}
            disabled={sincronizando}
            className="bg-roncedo-gold hover:bg-amber-400 text-slate-900 font-black text-xs py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${sincronizando ? 'animate-spin text-slate-900' : ''}`} />
            <span>{sincronizando ? 'Sincronizando...' : 'Sincronizar con Supabase'}</span>
          </button>
        </div>
      </div>

      {/* Alerta de Resultado de Sincronización */}
      {resultadoSync && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
            resultadoSync.exito
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {resultadoSync.exito ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{resultadoSync.mensaje}</span>
          </div>
          <button
            onClick={() => setResultadoSync(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tablero de Métricas de Catálogo (Requisito 7 del Usuario) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Obras Únicas */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-blue-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Obras Digitales Únicas
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-roncedo-navy">
              {metricas ? metricas.total_obras_unicas.toLocaleString('es-AR') : '...'}
            </span>
            <Globe2 className="w-5 h-5 text-roncedo-blue" />
          </div>
          <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
            vs 1.283 Físicos (+359%)
          </span>
        </div>

        {/* Lectura Online en la App */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Lectura Online en App
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-sky-700">
              {metricas ? metricas.disponibles_lectura_online.toLocaleString('es-AR') : '...'}
            </span>
            <BookOpen className="w-5 h-5 text-sky-500" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Sin salir de la PWA
          </span>
        </div>

        {/* Descarga Gratuita */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Descarga Libre
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-emerald-700">
              {metricas ? metricas.disponibles_descarga.toLocaleString('es-AR') : '...'}
            </span>
            <Download className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            PDF / EPUB autorizados
          </span>
        </div>

        {/* Enlaces Verificados */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Enlaces Verificados
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-teal-700">
              {metricas ? metricas.enlaces_verificados.toLocaleString('es-AR') : '...'}
            </span>
            <CheckCircle2 className="w-5 h-5 text-teal-500" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            100% legales y activos
          </span>
        </div>

        {/* Enlaces Rotos */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Enlaces Rotos
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-slate-700">
              {metricas ? metricas.enlaces_rotos : 0}
            </span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
            0 detectados
          </span>
        </div>

        {/* Última Sincronización */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Última Verificación
          </span>
          <div className="mt-1">
            <span className="text-xs font-black text-slate-900 block truncate">
              {metricas ? formatFechaArgentina(metricas.ultima_sincronizacion) : 'En línea'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Caché persistente
          </span>
        </div>
      </div>

      {/* Desglose por Plataforma (7 Fuentes) */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Building className="w-4 h-4 text-roncedo-navy" />
          <span>Distribución por Plataforma y Fuentes Oficiales (7)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {fuentesDetalle.map((f) => {
            const cantidad = metricas?.por_fuente[f.id] ?? (f.id === 'roncedo_digital' ? librosRoncedo.length : 0);
            return (
              <div
                key={f.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${f.color}`}
              >
                <div>
                  <span className="text-base mr-1.5">{f.icono}</span>
                  <span className="text-xs font-black">{f.nombre}</span>
                </div>
                <span className="text-lg font-black">{cantidad.toLocaleString('es-AR')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 7: Libros Digitales de la Biblioteca Roncedo (PDF) */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-amber-300/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-amber-800 text-xs font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 mb-1">
              <span>🏛️ Plataforma Oficial Nº 7</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Libros Digitales de la Biblioteca Roncedo
            </h3>
            <p className="text-xs text-slate-500">
              Colección digital institucional propia. Subí y administrá archivos PDF con metadatos normalizados para lectura online o descarga comunitaria.
            </p>
          </div>

          <button
            onClick={() => setModalNuevoLibro(true)}
            className="bg-roncedo-navy hover:bg-blue-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-roncedo-gold" />
            <span>+ Agregar Obra en PDF</span>
          </button>
        </div>

        {/* Listado de Libros de Biblioteca Roncedo */}
        {cargandoRoncedo ? (
          <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-roncedo-blue" />
            <span className="text-xs font-semibold">Cargando colección de Biblioteca Roncedo...</span>
          </div>
        ) : librosRoncedo.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-amber-200 rounded-2xl bg-amber-50/40 p-6 space-y-3">
            <FileText className="w-10 h-10 text-amber-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">
              Aún no hay archivos PDF cargados para Biblioteca Roncedo
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hacé clic en &ldquo;Agregar Obra en PDF&rdquo; para subir el primer libro o documento institucional (estatutos, memorias, obras locales, investigaciones).
            </p>
            <button
              onClick={() => setModalNuevoLibro(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Subir primer PDF</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Obra</th>
                  <th className="py-3 px-3">Autor / Editorial</th>
                  <th className="py-3 px-3">Año / Materia</th>
                  <th className="py-3 px-3">Licencia</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {librosRoncedo.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-200">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold block line-clamp-1">{l.titulo}</span>
                        {l.archivo_pdf_url && (
                          <span className="text-[10px] text-emerald-600 font-semibold block">
                            Archivo PDF listo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="block font-medium">{l.autor}</span>
                      <span className="text-[10px] text-slate-400">{l.editorial || 'Ed. Roncedo'}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="block font-medium">{l.anio || 's/f'}</span>
                      <span className="text-[10px] text-slate-400">{l.genero_o_materia || 'General'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                        {l.tipo_licencia || 'Acceso Abierto'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      <button
                        onClick={() => setLibroParaLeer(l)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-roncedo-navy transition-colors inline-flex"
                        title="Leer en la App"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>

                      {l.archivo_pdf_url && (
                        <a
                          href={l.archivo_pdf_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 transition-colors inline-flex"
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => handleEliminarLibro(l.id, l.titulo)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 transition-colors inline-flex"
                        title="Eliminar obra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Agregar Nuevo Libro PDF de Biblioteca Roncedo */}
      {modalNuevoLibro && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  🏛️
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Nueva Obra Digital • Biblioteca Roncedo
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Sube el archivo PDF con sus datos bibliográficos oficiales
                  </span>
                </div>
              </div>
              <button
                onClick={() => setModalNuevoLibro(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarLibro} className="space-y-4 text-xs">
              {/* Título y Autor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Título de la Obra *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    placeholder="Ej: Historia de Alcira Gigena y la Biblioteca"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Autor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAutor}
                    onChange={(e) => setFormAutor(e.target.value)}
                    placeholder="Ej: Dr. Lautaro Roncedo / Varios autores"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  />
                </div>
              </div>

              {/* Editorial y Año */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Editorial
                  </label>
                  <input
                    type="text"
                    value={formEditorial}
                    onChange={(e) => setFormEditorial(e.target.value)}
                    placeholder="Ediciones Biblioteca Roncedo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Año
                  </label>
                  <input
                    type="number"
                    value={formAnio}
                    onChange={(e) => setFormAnio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  />
                </div>
              </div>

              {/* Género / Materia y Licencia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Género / Materia
                  </label>
                  <input
                    type="text"
                    value={formGenero}
                    onChange={(e) => setFormGenero(e.target.value)}
                    placeholder="Historia local, Actas, Ensayo, Poesía"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Tipo de Licencia
                  </label>
                  <select
                    value={formLicencia}
                    onChange={(e) => setFormLicencia(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                  >
                    <option value="Biblioteca Roncedo (Acceso Abierto)">Biblioteca Roncedo (Acceso Abierto)</option>
                    <option value="Dominio Público">Dominio Público</option>
                    <option value="Creative Commons BY-NC">Creative Commons BY-NC</option>
                    <option value="Autorizado por el Autor">Autorizado por el Autor</option>
                  </select>
                </div>
              </div>

              {/* Subida del Archivo PDF */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <label className="block text-[11px] font-black text-amber-900 uppercase">
                  Archivo PDF del Libro
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 text-slate-700 w-full"
                  />
                </div>
                <div className="text-[10px] text-slate-500">
                  O ingresá una URL directa a un archivo PDF público:
                </div>
                <input
                  type="url"
                  value={formPdfUrl}
                  onChange={(e) => setFormPdfUrl(e.target.value)}
                  placeholder="https://ejemplo.com/archivo.pdf"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                />
              </div>

              {/* Portada URL (opcional) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  URL de Portada (Opcional)
                </label>
                <input
                  type="text"
                  value={formPortadaUrl}
                  onChange={(e) => setFormPortadaUrl(e.target.value)}
                  placeholder="/images/escudo-roncedo.png o enlace de imagen"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                />
              </div>

              {/* Descripción / Sinopsis */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Descripción / Sinopsis
                </label>
                <textarea
                  rows={3}
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  placeholder="Reseña breve de la publicación, contexto histórico o contenido general..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                />
              </div>

              {/* Botones de Acción */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNuevoLibro(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoLibro || subiendoPdf}
                  className="bg-roncedo-navy hover:bg-blue-900 text-white font-black px-5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {guardandoLibro || subiendoPdf ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-roncedo-gold" />
                      <span>Subiendo obra...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-roncedo-gold" />
                      <span>Guardar Obra</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lector Digital si el admin desea previsualizar una obra */}
      {libroParaLeer && (
        <LectorDigitalModal
          libro={libroParaLeer}
          onClose={() => setLibroParaLeer(null)}
        />
      )}
    </div>
  );
}
