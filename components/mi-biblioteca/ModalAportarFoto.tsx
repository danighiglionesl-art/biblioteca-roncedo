'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, Upload, X, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLibros } from '@/lib/context/LibrosContext';

interface ModalAportarFotoProps {
  onClose: () => void;
}

export function ModalAportarFoto({ onClose }: ModalAportarFotoProps) {
  const { user } = useAuth();
  const { aportarFoto } = useLibros();

  const [titulo, setTitulo] = useState('');
  const [anio, setAnio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La fotografía no debe superar los 5 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenUrl(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('Por favor indica un título para la fotografía.');
      return;
    }
    if (!descripcion.trim()) {
      setError('Por favor escribe una breve reseña o contexto de la foto.');
      return;
    }
    if (!imagenUrl.trim()) {
      setError('Por favor selecciona o sube una imagen.');
      return;
    }

    try {
      setGuardando(true);
      await aportarFoto({
        user_id: user?.id || 'anon',
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        anio_aproximado: anio.trim(),
        imagen_url: imagenUrl,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la fotografía');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col border border-slate-200 overflow-hidden my-auto">
        <div className="p-5 bg-gradient-to-r from-roncedo-navy to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-roncedo-gold" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200">
                Archivo Comunitario de Alcira Gigena
              </span>
              <h2 className="text-base font-black">Aportar Fotografía Histórica</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold">
              {error}
            </div>
          )}

          {/* Previsualización y subida */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-3">
            {imagenUrl ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-300">
                <Image src={imagenUrl} alt="Foto aportada" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="py-6">
                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-medium">Sube una fotografía antigua desde tu galería o cámara</p>
              </div>
            )}

            <div className="flex gap-2">
              <label className="cursor-pointer bg-roncedo-navy hover:bg-blue-900 text-white font-bold px-4 py-2 rounded-xl inline-flex items-center gap-2 transition-colors">
                <Camera className="w-4 h-4 text-roncedo-gold" />
                <span>{imagenUrl ? 'Cambiar Imagen' : 'Seleccionar Imagen'}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>

              {imagenUrl && (
                <button
                  type="button"
                  onClick={() => setImagenUrl('')}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-3 py-2 rounded-xl transition-colors"
                >
                  Quitar
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Título o Suceso *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Festejos del Centenario, Partido en cancha histórica, etc."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Año aproximado o década
            </label>
            <input
              type="text"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              placeholder="Ej: 1955, década del 60"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
              Descripción o Personas en la foto *
            </label>
            <textarea
              required
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Contanos quiénes aparecen, en qué lugar de Alcira Gigena fue tomada o qué anécdota recuerdas..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-roncedo-blue focus:bg-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
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
              className="bg-roncedo-navy hover:bg-blue-900 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              {guardando ? 'Aportando...' : 'Aportar al Archivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
