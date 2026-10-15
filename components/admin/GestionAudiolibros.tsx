'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Headphones,
  PlusCircle,
  Pencil,
  Trash2,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  RotateCw,
  RefreshCw,
  Sparkles,
  Download,
  Eye,
  Filter,
  Check,
  X,
  Radio,
} from 'lucide-react';
import { Audiolibro } from '@/types/audiolibros';
import { ModalABMAudiolibro } from '@/components/audiolibros/ModalABMAudiolibro';

export function GestionAudiolibros() {
  const [audiolibros, setAudiolibros] = useState<Audiolibro[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('todos');

  // Modales
  const [modalAbmOpen, setModalAbmOpen] = useState(false);
  const [audiolibroAEditar, setAudiolibroAEditar] = useState<Audiolibro | null>(null);

  // Modal de importación masiva desde Internet Archive / LibriVox
  const [modalImportarOpen, setModalImportarOpen] = useState(false);
  const [queryImportar, setQueryImportar] = useState('literatura argentina');
  const [resultadosImportar, setResultadosImportar] = useState<Audiolibro[]>([]);
  const [buscandoExterno, setBuscandoExterno] = useState(false);
  const [importandoLote, setImportandoLote] = useState(false);

  // Verificación de enlaces
  const [verificandoEnlaces, setVerificandoEnlaces] = useState(false);
  const [resultadoVerificacion, setResultadoVerificacion] = useState<any[] | null>(null);

  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const notificar = (msg: string) => {
    setMensajeExito(msg);
    setTimeout(() => setMensajeExito(null), 4000);
  };

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      const res = await fetch('/api/audiolibros/admin');
      const data = await res.json();
      if (data.success) {
        setAudiolibros(data.audiolibros || []);
        setMetricas(data.metricas || null);
      }
    } catch (e) {
      console.error('Error cargando audiolibros admin:', e);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const toggleActivo = async (id: string, estadoActual: boolean) => {
    try {
      const res = await fetch('/api/audiolibros/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_activo', id, activo: !estadoActual }),
      });
      const data = await res.json();
      if (data.success) {
        notificar(data.message);
        cargarDatos();
      }
    } catch (err: any) {
      alert(`Error al cambiar estado: ${err.message}`);
    }
  };

  const eliminarAudiolibro = async (id: string, titulo: string) => {
    if (!confirm(`¿Estás seguro de que deseás eliminar el audiolibro "${titulo}"?`)) return;

    try {
      const res = await fetch(`/api/audiolibros/admin?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        notificar('Audiolibro eliminado.');
        cargarDatos();
      }
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const verificarSaludEnlaces = async () => {
    try {
      setVerificandoEnlaces(true);
      const res = await fetch('/api/audiolibros/admin?action=verificar_enlaces');
      const data = await res.json();
      if (data.success) {
        setResultadoVerificacion(data.verificaciones);
        notificar('Verificación completada.');
      }
    } catch (err: any) {
      alert(`Error verificando enlaces: ${err.message}`);
    } finally {
      setVerificandoEnlaces(false);
    }
  };

  const buscarExterno = async () => {
    try {
      setBuscandoExterno(true);
      const res = await fetch(`/api/audiolibros/admin?action=buscar_externo&q=${encodeURIComponent(queryImportar)}`);
      const data = await res.json();
      if (data.success) {
        setResultadosImportar(data.resultados || []);
      }
    } catch (err: any) {
      alert(`Error en búsqueda externa: ${err.message}`);
    } finally {
      setBuscandoExterno(false);
    }
  };

  const importarAudiolibroDirecto = async (audio: Audiolibro) => {
    try {
      const res = await fetch('/api/audiolibros/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'guardar', audiolibro: audio }),
      });
      const data = await res.json();
      if (data.success) {
        notificar(`¡"${audio.titulo}" importado al catálogo!`);
        cargarDatos();
      }
    } catch (err: any) {
      alert(`Error importando: ${err.message}`);
    }
  };

  const audiolibrosFiltrados = audiolibros.filter((a) => {
    if (filtroTexto.trim()) {
      const q = filtroTexto.toLowerCase();
      const match =
        a.titulo.toLowerCase().includes(q) ||
        a.autor.toLowerCase().includes(q) ||
        (a.narrador || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filtroGenero !== 'todos' && a.genero !== filtroGenero) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      {/* Alerta de Éxito */}
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

      {/* Cabecera del Panel */}
      <div className="bg-gradient-to-r from-[#0A2240] via-[#123866] to-[#1E5296] text-white p-6 rounded-3xl shadow-xl border border-white/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              Módulo de Streaming
            </span>
            <span className="text-[11px] text-blue-100 font-medium">Biblioteca Roncedo Audio</span>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">
            Gestión y Administración de Audiolibros
          </h2>
          <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
            Administrá el catálogo de audiolibros gratuitos con reproducción integrada, agregá obras propias,
            sincronizá con LibriVox e Internet Archive y verificá la disponibilidad de enlaces de streaming.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setAudiolibroAEditar(null);
              setModalAbmOpen(true);
            }}
            className="bg-roncedo-gold hover:bg-amber-400 text-roncedo-navy font-black px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-2 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Audiolibro</span>
          </button>

          <button
            onClick={() => {
              setModalImportarOpen(true);
              buscarExterno();
            }}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2.5 rounded-2xl border border-white/25 flex items-center gap-2 transition-colors text-xs"
          >
            <Sparkles className="w-4 h-4 text-roncedo-gold" />
            <span>Importar de Internet Archive</span>
          </button>

          <button
            onClick={verificarSaludEnlaces}
            disabled={verificandoEnlaces}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2.5 rounded-2xl border border-white/25 flex items-center gap-1.5 transition-colors text-xs disabled:opacity-50"
            title="Verificar que los enlaces de audio respondan con éxito HTTP 200"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-roncedo-celesteLight ${verificandoEnlaces ? 'animate-spin' : ''}`} />
            <span>{verificandoEnlaces ? 'Verificando...' : 'Salud de Enlaces'}</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      {metricas && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Obras</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900">{metricas.totalObras}</span>
              <Headphones className="w-5 h-5 text-roncedo-navy" />
            </div>
            <span className="text-[10px] text-emerald-600 font-bold mt-1">
              {metricas.obrasActivas} activas en streaming
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-blue-700">Horas de Audio</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-roncedo-blue">+{metricas.totalHorasEscucha}h</span>
              <Clock className="w-5 h-5 text-roncedo-blue" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1">{metricas.totalCapitulos} capítulos</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-700">Reproducciones</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-amber-600">
                {metricas.totalReproducciones?.toLocaleString('es-AR')}
              </span>
              <Play className="w-5 h-5 text-amber-500 fill-current" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Comunidad Roncedo</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-700">Lit. Argentina</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-emerald-600">{metricas.argentinosLatinos}</span>
              <span className="text-base">🇦🇷</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Hernández, Quiroga, Roncedo</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-indigo-700">Fuentes Conectadas</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-indigo-700">
                {Object.keys(metricas.porFuente || {}).length}
              </span>
              <Radio className="w-5 h-5 text-indigo-500" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1">LibriVox, Alba, Roncedo</span>
          </div>
        </div>
      )}

      {/* Resultados de Verificación de Enlaces */}
      {resultadoVerificacion && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-roncedo-navy text-xs">
              Informe de Salud de Enlaces de Audio (Última comprobación):
            </span>
            <button
              onClick={() => setResultadoVerificacion(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {resultadoVerificacion.map((ver) => (
              <div
                key={ver.id}
                className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2"
              >
                <span className="font-bold text-slate-800 truncate">{ver.titulo}</span>
                {ver.estado === 'activo' ? (
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Activo (200 OK)</span>
                  </span>
                ) : (
                  <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>Revisar enlace</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barra de Filtro y Búsqueda */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Filtrar por título, autor o narrador..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-xs"
          />
        </div>

        <select
          value={filtroGenero}
          onChange={(e) => setFiltroGenero(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-roncedo-blue w-full sm:w-auto"
        >
          <option value="todos">Todos los géneros</option>
          <option value="Literatura Argentina">Literatura Argentina</option>
          <option value="Novelas">Novelas</option>
          <option value="Cuentos">Cuentos</option>
          <option value="Poesía">Poesía</option>
          <option value="Clásicos Universales">Clásicos Universales</option>
          <option value="Infantil y Juvenil">Infantil y Juvenil</option>
          <option value="Historia y Biografías">Historia y Biografías</option>
        </select>
      </div>

      {/* Tabla de Gestión de Audiolibros */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-3 w-14 text-center">Portada</th>
                <th className="py-3 px-4">Título y Autor</th>
                <th className="py-3 px-3">Género / Duración</th>
                <th className="py-3 px-3">Capítulos</th>
                <th className="py-3 px-3">Fuente y Licencia</th>
                <th className="py-3 px-3 text-center">Reproducciones</th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audiolibrosFiltrados.map((audio) => (
                <tr key={audio.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Portada */}
                  <td className="py-3 px-3 text-center">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 mx-auto">
                      <Image
                        src={audio.portada_url || '/images/logo-biblioteca.png'}
                        alt={audio.titulo}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </td>

                  {/* Título y Autor */}
                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-bold text-slate-900 leading-tight truncate">{audio.titulo}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{audio.autor}</p>
                    {audio.narrador && (
                      <span className="text-[9px] text-slate-400 block truncate">
                        Voz: {audio.narrador}
                      </span>
                    )}
                  </td>

                  {/* Género y Duración */}
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-700 block">{audio.genero}</span>
                    <span className="text-[10px] text-blue-600 font-mono font-bold">
                      {audio.duracion_texto}
                    </span>
                  </td>

                  {/* Capítulos */}
                  <td className="py-3 px-3 font-semibold text-slate-700">
                    {audio.capitulos.length} {audio.capitulos.length === 1 ? 'cap.' : 'caps.'}
                  </td>

                  {/* Fuente */}
                  <td className="py-3 px-3 max-w-[150px]">
                    <span className="font-bold text-slate-800 block truncate">{audio.fuente_nombre}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{audio.licencia}</span>
                  </td>

                  {/* Reproducciones */}
                  <td className="py-3 px-3 text-center font-bold text-slate-700 font-mono">
                    {audio.reproducciones || 0}
                  </td>

                  {/* Estado Activo / Inactivo */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => toggleActivo(audio.id, audio.activo)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-colors ${
                        audio.activo
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {audio.activo ? '🟢 Activo' : '⚪ Pausado'}
                    </button>
                  </td>

                  {/* Acciones */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setAudiolibroAEditar(audio);
                          setModalAbmOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                        title="Editar metadatos y capítulos"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => eliminarAudiolibro(audio.id, audio.titulo)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-red-600 transition-colors"
                        title="Eliminar audiolibro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {audiolibrosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Headphones className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold">No se encontraron audiolibros.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE IMPORTACIÓN ASISTIDA DESDE INTERNET ARCHIVE / LIBRIVOX */}
      {modalImportarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-fade-in text-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col border border-slate-200 overflow-hidden my-auto">
            <div className="p-5 bg-gradient-to-r from-roncedo-navy to-blue-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-roncedo-gold" />
                <div>
                  <h3 className="font-black text-base">Importar Audiolibros desde Internet Archive / LibriVox</h3>
                  <span className="text-[10px] text-blue-200 font-medium">Búsqueda de archivos MP3 en español de acceso público</span>
                </div>
              </div>
              <button
                onClick={() => setModalImportarOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={queryImportar}
                  onChange={(e) => setQueryImportar(e.target.value)}
                  placeholder="Ej: Borges, Quiroga, Cervantes, novela española..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-medium text-slate-900"
                />
                <button
                  onClick={buscarExterno}
                  disabled={buscandoExterno}
                  className="bg-roncedo-navy text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>{buscandoExterno ? 'Buscando...' : 'Buscar'}</span>
                </button>
              </div>

              {/* Lista de Resultados Externos */}
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {resultadosImportar.map((res) => (
                  <div
                    key={res.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0">
                        <Image src={res.portada_url} alt={res.titulo} fill className="object-cover" unoptimized />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 truncate">{res.titulo}</h4>
                        <p className="text-[11px] text-slate-600 truncate">{res.autor}</p>
                        <span className="text-[10px] text-blue-600 font-medium">Fuente: {res.fuente_nombre}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => importarAudiolibroDirecto(res)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 text-[11px] flex-shrink-0 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Importar</span>
                    </button>
                  </div>
                ))}

                {resultadosImportar.length === 0 && !buscandoExterno && (
                  <p className="text-center text-slate-400 py-8">
                    Ingresá un término para buscar audiolibros disponibles en los repositorios abiertos.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ABM DE ALTA Y EDICIÓN */}
      {modalAbmOpen && (
        <ModalABMAudiolibro
          audiolibroAEditar={audiolibroAEditar}
          onClose={() => {
            setModalAbmOpen(false);
            setAudiolibroAEditar(null);
          }}
          onGuardadoExitoso={() => {
            cargarDatos();
            notificar('Audiolibro guardado con éxito.');
          }}
        />
      )}
    </div>
  );
}
