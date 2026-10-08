'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LibroFisico } from '@/types';
import { X, Upload, Camera, BookOpen, Save, Trash2, CheckCircle2 } from 'lucide-react';

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
  const [procedencia, setProcedencia] = useState<string>(libroAEditar?.procedencia || 'Donación');
  const [donante, setDonante] = useState<string>(libroAEditar?.donante_o_detalle || '');
  const [topografia, setTopografia] = useState<string>(libroAEditar?.topografia_ubicacion || '');
  const [portadaUrl, setPortadaUrl] = useState<string>(libroAEditar?.portada_url || '');
  const [estado, setEstado] = useState<'disponible' | 'prestado'>(libroAEditar?.estado || 'disponible');

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manejador de subida de foto local (cámara o archivo) mediante FileReader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortadaUrl(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
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

    try {
      setGuardando(true);
      setError(null);

      await onGuardar({
        numero_inventario: Number(numeroInventario),
        anio_incorporacion: anioIncorporacion.trim(),
        autor: autor.trim(),
        titulo: titulo.trim(),
        edicion_anio: edicionAnio.trim(),
        lugar: lugar.trim(),
        editorial: editorial.trim(),
        procedencia: procedencia.trim(),
        donante_o_detalle: donante.trim(),
        topografia_ubicacion: topografia.trim(),
        portada_url: portadaUrl.trim(),
        estado,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el ejemplar.');
    } finally {
      setGuardando(false);
    }
  };

  return (
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
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold">
              {error}
            </div>
          )}

          {/* Sección Foto de Portada */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-24 h-32 rounded-xl border border-slate-300 bg-white shadow-sm overflow-hidden flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
              {portadaUrl ? (
                <Image
                  src={portadaUrl}
                  alt="Portada del libro"
                  fill
                  className="object-cover"
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
              <span className="font-bold text-slate-800 block text-xs">
                Foto de Portada del Libro Físico
              </span>
              <p className="text-[11px] text-slate-500">
                Subí una fotografía tomada con el celular o pegá un enlace de la tapa.
              </p>

              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer bg-roncedo-navy hover:bg-blue-900 text-white font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm">
                  <Camera className="w-4 h-4 text-roncedo-gold" />
                  <span>Subir / Tomar Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {portadaUrl && (
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
                value={portadaUrl.startsWith('data:') ? 'Imagen cargada localmente' : portadaUrl}
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

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                Topografía / Ubicación Física en Estantería
              </label>
              <input
                type="text"
                value={topografia}
                onChange={(e) => setTopografia(e.target.value)}
                placeholder="Ej: FUTBOL / FUTBOL ARGENTINO, LITERATURA / NOVELAS, Estante 3"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-roncedo-navy focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
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
  );
}
