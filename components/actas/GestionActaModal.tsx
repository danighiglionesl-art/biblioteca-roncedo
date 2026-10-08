'use client';

import React, { useState, useEffect } from 'react';
import { ActaHistorica, TipoReunionActa, FirmanteActa } from '@/types';
import {
  X,
  Save,
  ShieldCheck,
  Plus,
  Trash2,
  Calendar,
  BookOpen,
  FileText,
  Users,
  Award,
  AlertTriangle,
} from 'lucide-react';

interface GestionActaModalProps {
  isOpen: boolean;
  onClose: () => void;
  actaParaEditar: ActaHistorica | null;
  onGuardar: (acta: Partial<ActaHistorica>) => Promise<void>;
  isAdmin: boolean;
}

const TIPOS_REUNION: TipoReunionActa[] = [
  'Asamblea General Constitutiva',
  'Asamblea General Ordinaria',
  'Asamblea General Extraordinaria',
  'Reunión de Comisión Directiva',
  'Reunión de Subcomisión',
  'Acta Notarial / Especial',
];

export function GestionActaModal({
  isOpen,
  onClose,
  actaParaEditar,
  onGuardar,
  isAdmin,
}: GestionActaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Estados del formulario
  const [numeroActa, setNumeroActa] = useState<string>('1');
  const [titulo, setTitulo] = useState('');
  const [libro, setLibro] = useState('Libro N° 1 de Actas');
  const [tipoReunion, setTipoReunion] = useState<TipoReunionActa>('Reunión de Comisión Directiva');
  const [fecha, setFecha] = useState('1926-03-15');
  const [paginaInicio, setPaginaInicio] = useState(1);
  const [paginaFin, setPaginaFin] = useState(1);
  const [lugar, setLugar] = useState('Alcira Gigena, Córdoba');
  const [asistentesCount, setAsistentesCount] = useState<number>(20);
  const [resumen, setResumen] = useState('');
  const [transcripcion, setTranscripcion] = useState('');
  const [temasInput, setTemasInput] = useState('');
  const [esDestacada, setEsDestacada] = useState(false);
  const [notasArchivista, setNotasArchivista] = useState('');

  // Firmantes dinámicos
  const [firmantes, setFirmantes] = useState<FirmanteActa[]>([]);
  const [nuevoFirmanteNombre, setNuevoFirmanteNombre] = useState('');
  const [nuevoFirmanteCargo, setNuevoFirmanteCargo] = useState('');

  useEffect(() => {
    if (actaParaEditar) {
      setNumeroActa(String(actaParaEditar.numero_acta));
      setTitulo(actaParaEditar.titulo);
      setLibro(actaParaEditar.libro || 'Libro N° 1 de Actas');
      setTipoReunion(actaParaEditar.tipo_reunion);
      setFecha(actaParaEditar.fecha);
      setPaginaInicio(actaParaEditar.pagina_archivo_inicio || 1);
      setPaginaFin(actaParaEditar.pagina_archivo_fin || 1);
      setLugar(actaParaEditar.lugar || 'Alcira Gigena, Córdoba');
      setAsistentesCount(actaParaEditar.asistentes_count || 10);
      setResumen(actaParaEditar.resumen || '');
      setTranscripcion(actaParaEditar.transcripcion_completa || '');
      setTemasInput(actaParaEditar.temas_tratados ? actaParaEditar.temas_tratados.join(', ') : '');
      setEsDestacada(Boolean(actaParaEditar.es_destacada));
      setNotasArchivista(actaParaEditar.notas_archivista || '');
      setFirmantes(actaParaEditar.firmantes ? [...actaParaEditar.firmantes] : []);
    } else {
      // Nueva acta
      setNumeroActa('1');
      setTitulo('');
      setLibro('Libro N° 1 de Actas');
      setTipoReunion('Reunión de Comisión Directiva');
      setFecha('1926-03-15');
      setPaginaInicio(1);
      setPaginaFin(1);
      setLugar('Alcira Gigena, Córdoba');
      setAsistentesCount(15);
      setResumen('');
      setTranscripcion('');
      setTemasInput('');
      setEsDestacada(false);
      setNotasArchivista('');
      setFirmantes([]);
    }
    setErrorMsg('');
  }, [actaParaEditar, isOpen]);

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-red-200">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Acceso Restringido</h3>
          <p className="text-xs text-slate-600">
            Únicamente los usuarios con rol de <strong>Administrador</strong> tienen autorización para gestionar o editar las actas institucionales.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white font-bold py-2 rounded-xl text-xs hover:bg-slate-800 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const handleAgregarFirmante = () => {
    if (!nuevoFirmanteNombre.trim()) return;
    setFirmantes([
      ...firmantes,
      { nombre: nuevoFirmanteNombre.trim(), cargo: nuevoFirmanteCargo.trim() || undefined },
    ]);
    setNuevoFirmanteNombre('');
    setNuevoFirmanteCargo('');
  };

  const handleEliminarFirmante = (index: number) => {
    setFirmantes(firmantes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setErrorMsg('El título del acta es obligatorio.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const temasArray = temasInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Calcular lista de archivos de imágenes según rango de páginas
      const archivosGenerados: string[] = [];
      const imagenesUrls: string[] = [];
      const minP = Math.min(paginaInicio, paginaFin);
      const maxP = Math.max(paginaInicio, paginaFin);

      for (let p = minP; p <= maxP; p++) {
        archivosGenerados.push(`Libro Nb0 1-${p}.jpg`);
        imagenesUrls.push(`/api/actas/image?file=Libro%20Nb0%201-${p}.jpg`);
      }

      const anioNum = parseInt(fecha.substring(0, 4), 10) || 1926;

      const datosActa: Partial<ActaHistorica> = {
        id: actaParaEditar?.id,
        numero_acta: numeroActa,
        libro,
        folio_inicio: Math.floor(minP / 2) || 1,
        folio_fin: Math.floor(maxP / 2) || 1,
        pagina_archivo_inicio: minP,
        pagina_archivo_fin: maxP,
        fecha,
        anio: anioNum,
        titulo: titulo.trim(),
        tipo_reunion: tipoReunion,
        lugar: lugar.trim(),
        asistentes_count: Number(asistentesCount) || 1,
        resumen: resumen.trim(),
        transcripcion_completa: transcripcion.trim(),
        firmantes,
        temas_tratados: temasArray,
        archivos: archivosGenerados,
        imagenes_urls: imagenesUrls,
        es_destacada: esDestacada,
        notas_archivista: notasArchivista.trim(),
      };

      await onGuardar(datosActa);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar los datos del acta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Encabezado */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0F284B] to-[#1E3A8A] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Panel de Gestión Institucional • Administrador
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                {actaParaEditar ? `Editar Acta N° ${actaParaEditar.numero_acta}` : 'Registrar Nueva Acta'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Fila 1: Título y Número */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-1">
              <label className="block font-bold text-slate-800 mb-1">Número de Acta</label>
              <input
                type="text"
                value={numeroActa}
                onChange={(e) => setNumeroActa(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-roncedo-celeste font-bold text-slate-900"
                placeholder="Ej. 1"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-bold text-slate-800 mb-1">Título del Acta / Objeto</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-roncedo-celeste text-slate-900 font-medium"
                placeholder="Ej. Acta Fundacional y Elección de la Primera Comisión Directiva"
              />
            </div>
          </div>

          {/* Fila 2: Libro, Tipo y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Libro de Registro</label>
              <input
                type="text"
                value={libro}
                onChange={(e) => setLibro(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-roncedo-celeste text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Tipo de Reunión</label>
              <select
                value={tipoReunion}
                onChange={(e) => setTipoReunion(e.target.value as TipoReunionActa)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-roncedo-celeste text-slate-900 bg-white"
              >
                {TIPOS_REUNION.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Fecha de Sesión</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-roncedo-celeste text-slate-900 font-semibold"
              />
            </div>
          </div>

          {/* Fila 3: Páginas en el escaneo (1 a 102), Lugar y Asistentes */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Página Archivo Inicio</label>
              <input
                type="number"
                min={1}
                max={102}
                value={paginaInicio}
                onChange={(e) => setPaginaInicio(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Del escaneo (1-102)</span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Página Archivo Fin</label>
              <input
                type="number"
                min={1}
                max={102}
                value={paginaFin}
                onChange={(e) => setPaginaFin(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Rango de folios</span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Lugar de Sesión</label>
              <input
                type="text"
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                placeholder="Ej. Hotel de B. Marquez"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Cantidad Asistentes</label>
              <input
                type="number"
                min={1}
                value={asistentesCount}
                onChange={(e) => setAsistentesCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>
          </div>

          {/* Resumen Histórico */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Resumen del Acta</label>
            <textarea
              rows={3}
              value={resumen}
              onChange={(e) => setResumen(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-roncedo-celeste text-slate-900"
              placeholder="Breve síntesis de los hechos y acuerdos para la búsqueda rápida..."
            />
          </div>

          {/* Transcripción Paleográfica Completa */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-800">
                Transcripción Paleográfica Completa (Fidedigna)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Texto manuscrito tipeado</span>
            </div>
            <textarea
              rows={6}
              value={transcripcion}
              onChange={(e) => setTranscripcion(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-roncedo-celeste font-serif text-slate-900 text-xs leading-relaxed"
              placeholder="Escribe o pega aquí la transcripción textual del documento histórico..."
            />
          </div>

          {/* Firmantes */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-roncedo-celeste" />
              <span>Firmantes y Autoridades Asistentes</span>
            </h4>

            {/* Formulario rápido para agregar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevoFirmanteNombre}
                onChange={(e) => setNuevoFirmanteNombre(e.target.value)}
                placeholder="Nombre (ej. Francisco Fagiano)"
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-slate-900"
              />
              <input
                type="text"
                value={nuevoFirmanteCargo}
                onChange={(e) => setNuevoFirmanteCargo(e.target.value)}
                placeholder="Cargo (ej. Presidente)"
                className="w-40 px-3 py-1.5 border border-slate-300 rounded-xl text-slate-900"
              />
              <button
                type="button"
                onClick={handleAgregarFirmante}
                className="px-3 py-1.5 bg-roncedo-celeste hover:bg-roncedo-celesteDark text-white font-bold rounded-xl flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </div>

            {/* Lista actual de firmantes */}
            {firmantes.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {firmantes.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 shadow-sm"
                  >
                    <strong>{f.nombre}</strong>
                    {f.cargo && <span className="text-[10px] text-slate-500">({f.cargo})</span>}
                    <button
                      type="button"
                      onClick={() => handleEliminarFirmante(i)}
                      className="text-red-500 hover:text-red-700 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Temas Tratados & Destacada */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">
                Temas Clave / Etiquetas (separadas por coma)
              </label>
              <input
                type="text"
                value={temasInput}
                onChange={(e) => setTemasInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                placeholder="Fundación, Pelota, Comisión, Homenaje Roncedo"
              />
            </div>

            <div className="flex items-center gap-2 sm:pt-4">
              <input
                type="checkbox"
                id="checkDestacada"
                checked={esDestacada}
                onChange={(e) => setEsDestacada(e.target.checked)}
                className="w-4 h-4 text-roncedo-celeste rounded border-slate-300 focus:ring-roncedo-celeste"
              />
              <label htmlFor="checkDestacada" className="font-bold text-slate-800 cursor-pointer">
                Marcar como Acta Destacada
              </label>
            </div>
          </div>

          {/* Notas del Archivista */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Notas de Preservación / Archivo</label>
            <input
              type="text"
              value={notasArchivista}
              onChange={(e) => setNotasArchivista(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
              placeholder="Estado de la tinta, notas sobre el libro, folio..."
            />
          </div>
        </form>

        {/* Barra de Acciones */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-[#0F284B] hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{isSubmitting ? 'Guardando...' : 'Guardar Acta Histórica'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
