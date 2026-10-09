'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { compressImage, CompressionResult } from '@/lib/utils/imageCompressor';
import { subirFotoHistorica } from '@/lib/supabase/fototeca';
import { FotoHistorica, ColeccionFoto } from '@/types';
import {
  X,
  Upload,
  Camera,
  Sparkles,
  Calendar,
  MapPin,
  Building,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
} from 'lucide-react';

interface SubirFotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFotoSubida: (foto: FotoHistorica) => void;
}

const COLECCIONES: ColeccionFoto[] = [
  'Club Roncedo y Deportes',
  'Alcira Gigena e Historia Urbana',
  'Familias y Vecinos Ilustres',
  'Escuelas e Instituciones',
  'Fiestas y Tradición',
  'Dr. Lautaro Roncedo',
];

export function SubirFotoModal({ isOpen, onClose, onFotoSubida }: SubirFotoModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Campos del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [anioEstimado, setAnioEstimado] = useState<string>('');
  const [lugar, setLugar] = useState('Alcira Gigena');
  const [institucion, setInstitucion] = useState('Club Roncedo');
  const [acontecimiento, setAcontecimiento] = useState('');
  const [coleccion, setColeccion] = useState<ColeccionFoto>('Club Roncedo y Deportes');
  const [autorFotografo, setAutorFotografo] = useState('');
  const [donanteFuente, setDonanteFuente] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setIsCompressing(true);

    try {
      const result = await compressImage(file, 1600, 0.82);
      setSelectedFile(result.file);
      setCompressionInfo(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la fotografía.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Por favor seleccioná una fotografía para subir.');
      return;
    }
    if (!titulo.trim()) {
      setErrorMsg('Por favor ingresá un título o descripción breve.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const anioNum = anioEstimado ? parseInt(anioEstimado, 10) : undefined;
      const decadaCalc = anioNum ? `${Math.floor(anioNum / 10) * 10}s` : 'Sin fecha';

      const nombreColaborador = user
        ? `${user.nombre} ${user.apellido}`.trim() || user.email
        : 'Vecino Colaborador';

      const res = await subirFotoHistorica(selectedFile, {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        anio_estimado: anioNum,
        decada: decadaCalc,
        lugar: lugar.trim(),
        institucion: institucion.trim(),
        acontecimiento: acontecimiento.trim(),
        coleccion,
        autor_fotografo: autorFotografo.trim(),
        donante_fuente: donanteFuente.trim() || nombreColaborador,
        subido_por_user_id: user?.id,
        subido_por_nombre: nombreColaborador,
      });

      if (res.success && res.foto) {
        onFotoSubida(res.foto);
        handleClose();
      } else {
        setErrorMsg(res.error || 'Ocurrió un error al subir la foto.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la fotografía.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setCompressionInfo(null);
    setTitulo('');
    setDescripcion('');
    setAnioEstimado('');
    setAcontecimiento('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-blue-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Cabecera del Modal */}
        <div className="bg-gradient-to-r from-roncedo-navy via-[#163866] to-roncedo-celesteDark text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Camera className="w-5 h-5 text-roncedo-celesteLight" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Aportar Fotografía Histórica
              </h2>
              <p className="text-[11px] text-blue-200">
                Preservación de la memoria viva de Alcira Gigena y Club Roncedo
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario scrolleable */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Área de Carga / Vista Previa de la Fotografía */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-roncedo-navy mb-1.5">
              Fotografía Histórica *
            </label>

            {compressionInfo ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-roncedo-celeste bg-slate-950 group">
                <img
                  src={compressionInfo.previewUrl}
                  alt="Vista previa"
                  className="w-full max-h-64 object-contain mx-auto"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-roncedo-gold" />
                    <span className="font-semibold text-[11px]">
                      Optimizada: {compressionInfo.compressedSizeKb} KB
                    </span>
                    <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                      -{Math.round((1 - compressionInfo.compressedSizeKb / compressionInfo.originalSizeKb) * 100)}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                  >
                    Cambiar foto
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-roncedo-celeste rounded-2xl p-6 text-center cursor-pointer bg-roncedo-celesteSoft/30 hover:bg-roncedo-celesteSoft/60 transition-all group"
              >
                {isCompressing ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <Loader2 className="w-8 h-8 text-roncedo-celeste animate-spin mb-2" />
                    <span className="text-xs font-semibold text-slate-700">
                      Optimizando imagen para archivo histórico...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 group-hover:bg-blue-200 text-roncedo-celesteDark flex items-center justify-center mb-2 transition-transform group-hover:scale-105">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-roncedo-navy">
                      Tocá acá para seleccionar la foto desde tu celular o computadora
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Formatos JPG, PNG, WEBP. La aplicación la optimiza automáticamente para máxima nitidez.
                    </span>
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Título de la Foto */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-roncedo-navy mb-1.5">
              Título o Identificación de la Fotografía *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Equipo de Fútbol Roncedo Campeón 1968"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-roncedo-celeste focus:ring-2 focus:ring-roncedo-celeste/20 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
              required
            />
          </div>

          {/* Grid: Año y Colección */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-roncedo-navy mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-roncedo-celeste" />
                <span>Año Estimado (o exacto)</span>
              </label>
              <input
                type="number"
                min="1880"
                max="2030"
                value={anioEstimado}
                onChange={(e) => setAnioEstimado(e.target.value)}
                placeholder="Ej: 1958"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-roncedo-celeste focus:ring-2 focus:ring-roncedo-celeste/20 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-roncedo-navy mb-1.5 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-roncedo-celeste" />
                <span>Colección Temática</span>
              </label>
              <select
                value={coleccion}
                onChange={(e) => setColeccion(e.target.value as ColeccionFoto)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-roncedo-celeste focus:ring-2 focus:ring-roncedo-celeste/20 text-xs sm:text-sm text-slate-800 outline-none transition-all bg-white"
              >
                {COLECCIONES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid: Lugar y Acontecimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-roncedo-navy mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-roncedo-celeste" />
                <span>Lugar Histórico</span>
              </label>
              <input
                type="text"
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                placeholder="Ej: Sede Social, Plaza San Martín, Cancha"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-roncedo-celeste focus:ring-2 focus:ring-roncedo-celeste/20 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-roncedo-navy mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-roncedo-celeste" />
                <span>Acontecimiento / Evento</span>
              </label>
              <input
                type="text"
                value={acontecimiento}
                onChange={(e) => setAcontecimiento(e.target.value)}
                placeholder="Ej: Carnavales, Festejo, Torneo Regional"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-roncedo-celeste focus:ring-2 focus:ring-roncedo-celeste/20 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Grid: Donante y Fotógrafo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-roncedo-navy mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-roncedo-celeste" />
                <span>Donante o Fuente Familiar</span>
              </label>
              <input
                type="text"
                value={donanteFuente}
                onChange={(e) => setDonanteFuente(e.target.value)}
                placeholder="Ej: Donación Familia González"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-roncedo-celeste focus:ring-2 focus:ring-roncedo-celeste/20 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-roncedo-navy mb-1.5 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-roncedo-celeste" />
                <span>Autor / Fotógrafo (si se conoce)</span>
              </label>
              <input
                type="text"
                value={autorFotografo}
                onChange={(e) => setAutorFotografo(e.target.value)}
                placeholder="Ej: Foto Estudio Gigena"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-roncedo-celeste focus:ring-2 focus:ring-roncedo-celeste/20 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Descripción / Contexto Histórico */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-roncedo-navy mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-roncedo-celeste" />
              <span>Historia, Anécdota o Personas Reconocidas</span>
            </label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Contanos qué pasaba en ese momento, quiénes aparecen o cualquier detalle que ayude a preservar el recuerdo..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-roncedo-celeste focus:ring-2 focus:ring-roncedo-celeste/20 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
            />
          </div>

          {/* Aviso de Publicación Directa & Moderación */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-bold">Publicación Directa Comunitaria:</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Tu foto se publicará de inmediato para que todos los socios y vecinos puedan verla e identificar personas. La administración de la Biblioteca supervisa el archivo para asegurar el respeto a las normas comunitarias.
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="flex items-center gap-2 bg-gradient-to-r from-roncedo-celeste to-roncedo-celesteDark hover:from-roncedo-celesteDark hover:to-blue-700 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publicando Fotografía...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Publicar en la Fototeca</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
