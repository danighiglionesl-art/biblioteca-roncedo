'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Save,
  Plus,
  Trash2,
  Headphones,
  Play,
  Pause,
  Sparkles,
  Link as LinkIcon,
  BookOpen,
  User,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Audiolibro, CapituloAudiolibro, GeneroAudiolibro, FuenteAudiolibro } from '@/types/audiolibros';

interface ModalABMAudiolibroProps {
  audiolibroAEditar?: Audiolibro | null;
  onClose: () => void;
  onGuardadoExitoso: () => void;
}

export function ModalABMAudiolibro({
  audiolibroAEditar,
  onClose,
  onGuardadoExitoso,
}: ModalABMAudiolibroProps) {
  const isEditing = Boolean(audiolibroAEditar);

  const [titulo, setTitulo] = useState(audiolibroAEditar?.titulo || '');
  const [subtitulo, setSubtitulo] = useState(audiolibroAEditar?.subtitulo || '');
  const [autor, setAutor] = useState(audiolibroAEditar?.autor || '');
  const [narrador, setNarrador] = useState(audiolibroAEditar?.narrador || '');
  const [genero, setGenero] = useState<GeneroAudiolibro>(
    (audiolibroAEditar?.genero as GeneroAudiolibro) || 'Literatura Argentina'
  );
  const [sinopsis, setSinopsis] = useState(audiolibroAEditar?.sinopsis || '');
  const [idioma, setIdioma] = useState(audiolibroAEditar?.idioma || 'Español');
  const [portadaUrl, setPortadaUrl] = useState(audiolibroAEditar?.portada_url || '');
  const [fuente, setFuente] = useState<FuenteAudiolibro>(audiolibroAEditar?.fuente || 'biblioteca_roncedo');
  const [fuenteNombre, setFuenteNombre] = useState(
    audiolibroAEditar?.fuente_nombre || 'Biblioteca Roncedo (Producción Oficial)'
  );
  const [enlaceFuente, setEnlaceFuente] = useState(audiolibroAEditar?.enlace_fuente || '');
  const [licencia, setLicencia] = useState(
    audiolibroAEditar?.licencia || 'Dominio Público / Acceso Libre'
  );
  const [esArgentino, setEsArgentino] = useState(
    audiolibroAEditar ? Boolean(audiolibroAEditar.es_argentino_o_latino) : true
  );
  const [anio, setAnio] = useState(String(audiolibroAEditar?.anio_publicacion || ''));
  const [activo, setActivo] = useState(audiolibroAEditar ? audiolibroAEditar.activo : true);

  // Lista dinámica de capítulos
  const [capitulos, setCapitulos] = useState<CapituloAudiolibro[]>(
    audiolibroAEditar?.capitulos?.length
      ? audiolibroAEditar.capitulos
      : [
          {
            id: `cap-${Date.now()}-1`,
            numero: 1,
            titulo: 'Capítulo 1: Introducción',
            audio_url: '',
            duracion_segundos: 600,
            duracion_texto: '10:00',
          },
        ]
  );

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio preview local para verificar enlaces antes de guardar
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const previewAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const toggleTestAudio = (url: string) => {
    if (!url) return;
    if (audioPreviewUrl === url && previewPlaying) {
      previewAudioRef.current?.pause();
      setPreviewPlaying(false);
    } else {
      setAudioPreviewUrl(url);
      if (previewAudioRef.current) {
        previewAudioRef.current.src = url;
        previewAudioRef.current.play().then(() => setPreviewPlaying(true)).catch((e) => {
          alert(`No se pudo reproducir el enlace: ${e.message}`);
          setPreviewPlaying(false);
        });
      }
    }
  };

  const handleAgregarCapitulo = () => {
    const nuevoNum = capitulos.length + 1;
    setCapitulos([
      ...capitulos,
      {
        id: `cap-${Date.now()}-${nuevoNum}`,
        numero: nuevoNum,
        titulo: `Capítulo ${nuevoNum}`,
        audio_url: '',
        duracion_segundos: 600,
        duracion_texto: '10:00',
      },
    ]);
  };

  const handleEliminarCapitulo = (index: number) => {
    if (capitulos.length <= 1) {
      alert('El audiolibro debe tener al menos un capítulo.');
      return;
    }
    const filtrados = capitulos.filter((_, i) => i !== index);
    // Renumerar
    const renumerados = filtrados.map((c, i) => ({ ...c, numero: i + 1 }));
    setCapitulos(renumerados);
  };

  const handleCapituloChange = (index: number, campo: keyof CapituloAudiolibro, valor: any) => {
    const actualizados = [...capitulos];
    actualizados[index] = { ...actualizados[index], [campo]: valor };
    setCapitulos(actualizados);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('El título de la obra es obligatorio.');
      return;
    }
    if (!autor.trim()) {
      setError('El autor es obligatorio.');
      return;
    }

    // Calcular duración total en segundos
    const durTotalSeg = capitulos.reduce((acc, c) => acc + (c.duracion_segundos || 600), 0);
    const horas = Math.floor(durTotalSeg / 3600);
    const minutos = Math.floor((durTotalSeg % 3600) / 60);
    const durTexto = horas > 0 ? `${horas}h ${minutos}m` : `${minutos} min`;

    const audiolibroPayload: Audiolibro = {
      id: audiolibroAEditar?.id || `audio-${Date.now()}`,
      titulo: titulo.trim(),
      subtitulo: subtitulo.trim() || undefined,
      autor: autor.trim(),
      narrador: narrador.trim() || undefined,
      genero,
      sinopsis: sinopsis.trim(),
      duracion_total_segundos: durTotalSeg,
      duracion_texto: durTexto,
      idioma: idioma.trim() || 'Español',
      portada_url: portadaUrl.trim() || '/images/logo-biblioteca.png',
      fuente,
      fuente_nombre: fuenteNombre.trim() || 'Biblioteca Roncedo',
      enlace_fuente: enlaceFuente.trim() || undefined,
      licencia: licencia.trim() || 'Dominio Público',
      es_argentino_o_latino: esArgentino,
      anio_publicacion: anio.trim() || undefined,
      capitulos,
      fecha_incorporacion: audiolibroAEditar?.fecha_incorporacion || new Date().toISOString().split('T')[0],
      activo,
      reproducciones: audiolibroAEditar?.reproducciones || 0,
      favoritos_count: audiolibroAEditar?.favoritos_count || 0,
    };

    try {
      setGuardando(true);
      setError(null);
      const res = await fetch('/api/audiolibros/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'guardar', audiolibro: audiolibroPayload }),
      });
      const data = await res.json();
      if (data.success) {
        onGuardadoExitoso();
        onClose();
      } else {
        setError(data.error || 'Error al guardar el audiolibro.');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-fade-in text-xs">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] shadow-2xl flex flex-col border border-slate-200 overflow-hidden my-auto">
        {/* Audio oculto para preview */}
        <audio
          ref={previewAudioRef}
          onEnded={() => setPreviewPlaying(false)}
          onPause={() => setPreviewPlaying(false)}
        />

        {/* Cabecera */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-roncedo-navy via-[#1A457D] to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-roncedo-gold/20 border border-roncedo-gold/40 flex items-center justify-center text-roncedo-gold">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-roncedo-celesteLight">
                Panel de Administración • Audiolibros
              </span>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                {isEditing ? `Modificar Audiolibro: "${audiolibroAEditar?.titulo}"` : 'Registrar Nuevo Audiolibro'}
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Grilla de Datos Generales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Título de la Obra *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: El Gaucho Martín Fierro"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Autor / Creador *
              </label>
              <input
                type="text"
                required
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder="Ej: José Hernández"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Narrador / Locutor / Voz
              </label>
              <input
                type="text"
                value={narrador}
                onChange={(e) => setNarrador(e.target.value)}
                placeholder="Ej: Marcelo Argüello, Karen Savage o Voces de la Comunidad"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Género Literario *
              </label>
              <select
                value={genero}
                onChange={(e) => setGenero(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
              >
                <option value="Literatura Argentina">Literatura Argentina</option>
                <option value="Novelas">Novelas</option>
                <option value="Cuentos">Cuentos</option>
                <option value="Poesía">Poesía</option>
                <option value="Clásicos Universales">Clásicos Universales</option>
                <option value="Infantil y Juvenil">Infantil y Juvenil</option>
                <option value="Historia y Biografías">Historia y Biografías</option>
                <option value="Teatro">Teatro</option>
                <option value="Filosofía y Ensayo">Filosofía y Ensayo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Año o Período
              </label>
              <input
                type="text"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                placeholder="Ej: 1872 o 2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Sinopsis y Descripción de la Obra
              </label>
              <textarea
                rows={3}
                value={sinopsis}
                onChange={(e) => setSinopsis(e.target.value)}
                placeholder="Breve reseña del contenido, contexto de la obra y temática..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white leading-relaxed"
              />
            </div>

            {/* Portada */}
            <div className="sm:col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-slate-300 bg-white shadow-xs flex-shrink-0 flex items-center justify-center">
                {portadaUrl ? (
                  <Image src={portadaUrl} alt="Portada" fill className="object-cover" unoptimized />
                ) : (
                  <BookOpen className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  URL de Imagen de Portada (HTTPS)
                </label>
                <input
                  type="text"
                  value={portadaUrl}
                  onChange={(e) => setPortadaUrl(e.target.value)}
                  placeholder="https://... o /images/logo-biblioteca.png"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                />
              </div>
            </div>

            {/* Plataforma de Origen y Licencia */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Plataforma de Origen
              </label>
              <select
                value={fuente}
                onChange={(e) => {
                  const val = e.target.value as FuenteAudiolibro;
                  setFuente(val);
                  if (val === 'librivox') setFuenteNombre('LibriVox / Internet Archive');
                  if (val === 'albalearning') setFuenteNombre('AlbaLearning');
                  if (val === 'internet_archive') setFuenteNombre('Internet Archive');
                  if (val === 'horacio_lanci') setFuenteNombre('Horacio Lanci');
                  if (val === 'biblioteca_roncedo') setFuenteNombre('Biblioteca Roncedo (Producción Oficial)');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
              >
                <option value="biblioteca_roncedo">Biblioteca Roncedo (Audio Propio)</option>
                <option value="librivox">LibriVox (Dominio Público)</option>
                <option value="albalearning">AlbaLearning</option>
                <option value="internet_archive">Internet Archive</option>
                <option value="horacio_lanci">Horacio Lanci</option>
                <option value="otra">Otra fuente autorizada</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Licencia o Condiciones de Uso
              </label>
              <input
                type="text"
                value={licencia}
                onChange={(e) => setLicencia(e.target.value)}
                placeholder="Ej: Dominio Público o Patrimonio Roncedo"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
              />
            </div>

            {/* Checkboxes de literatura argentina y activo */}
            <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={esArgentino}
                  onChange={(e) => setEsArgentino(e.target.checked)}
                  className="w-4 h-4 rounded text-roncedo-navy border-slate-300 focus:ring-roncedo-blue"
                />
                <span className="font-bold text-slate-800">
                  Es Literatura Argentina o Rioplatense
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                />
                <span className="font-bold text-emerald-800">
                  Activo para escucha inmediata en la PWA
                </span>
              </label>
            </div>
          </div>

          {/* SECCIÓN DE CAPÍTULOS Y ARCHIVOS DE AUDIO */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-roncedo-navy" />
                  <span>Capítulos y Enlaces de Audio MP3 ({capitulos.length})</span>
                </h3>
                <span className="text-[10px] text-slate-500">
                  Enlaces directos a archivos de audio reproducibles vía streaming.
                </span>
              </div>

              <button
                type="button"
                onClick={handleAgregarCapitulo}
                className="bg-blue-50 hover:bg-blue-100 text-roncedo-navy font-bold px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1 text-[11px] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Capítulo</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {capitulos.map((cap, index) => (
                <div
                  key={cap.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-roncedo-navy text-[11px]">
                      Capítulo #{cap.numero}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {cap.audio_url && (
                        <button
                          type="button"
                          onClick={() => toggleTestAudio(cap.audio_url)}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors ${
                            audioPreviewUrl === cap.audio_url && previewPlaying
                              ? 'bg-amber-500 text-slate-900'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {audioPreviewUrl === cap.audio_url && previewPlaying ? (
                            <>
                              <Pause className="w-3 h-3 fill-current" />
                              <span>Pausar</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              <span>Probar Audio</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleEliminarCapitulo(index)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                        title="Eliminar capítulo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={cap.titulo}
                        onChange={(e) => handleCapituloChange(index, 'titulo', e.target.value)}
                        placeholder="Título del capítulo"
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={cap.duracion_texto}
                        onChange={(e) => {
                          const txt = e.target.value;
                          // Estimación sencilla de segundos a partir de "mm:ss"
                          const parts = txt.split(':');
                          let seg = 600;
                          if (parts.length === 2) {
                            seg = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                          }
                          handleCapituloChange(index, 'duracion_texto', txt);
                          handleCapituloChange(index, 'duracion_segundos', isNaN(seg) ? 600 : seg);
                        }}
                        placeholder="Duración (ej: 14:30)"
                        className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-mono text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="url"
                      value={cap.audio_url}
                      onChange={(e) => handleCapituloChange(index, 'audio_url', e.target.value)}
                      placeholder="URL directa del archivo de audio MP3 (https://...)"
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botones del Formulario */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
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
              className="bg-roncedo-navy hover:bg-blue-900 text-white font-black px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4 text-roncedo-gold" />
              <span>{guardando ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Audiolibro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
