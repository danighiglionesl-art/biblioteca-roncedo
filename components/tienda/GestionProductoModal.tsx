'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Plus,
  Save,
  Trash2,
  Sparkles,
  ShoppingBag,
  Tag,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { ProductoTienda, CategoriaProductoTienda } from '@/types';
import { guardarProductoTienda } from '@/lib/supabase/tienda';

interface GestionProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  productoParaEditar: ProductoTienda | null;
  onGuardadoExitoso: (producto: ProductoTienda) => void;
}

export function GestionProductoModal({
  isOpen,
  onClose,
  productoParaEditar,
  onGuardadoExitoso,
}: GestionProductoModalProps) {
  if (!isOpen) return null;

  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<CategoriaProductoTienda>('centenario');
  const [precio, setPrecio] = useState<number>(10000);
  const [stock, setStock] = useState<number>(20);
  const [etiquetaEspecial, setEtiquetaEspecial] = useState('');
  const [destacado, setDestacado] = useState(false);
  const [activo, setActivo] = useState(true);
  const [tallesTexto, setTallesTexto] = useState('');
  const [coloresTexto, setColoresTexto] = useState('');
  const [detallesTexto, setDetallesTexto] = useState('');
  const [imagenUrl, setImagenUrl] = useState('/images/escudo-roncedo.png');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (productoParaEditar) {
      setTitulo(productoParaEditar.titulo);
      setSubtitulo(productoParaEditar.subtitulo || '');
      setDescripcion(productoParaEditar.descripcion);
      setCategoria(productoParaEditar.categoria);
      setPrecio(productoParaEditar.precio);
      setStock(productoParaEditar.stock);
      setEtiquetaEspecial(productoParaEditar.etiqueta_especial || '');
      setDestacado(!!productoParaEditar.destacado);
      setActivo(productoParaEditar.activo);
      setTallesTexto(productoParaEditar.talles?.join(', ') || '');
      setColoresTexto(productoParaEditar.colores?.join(', ') || '');
      setDetallesTexto(productoParaEditar.detalles_tecnicos?.join('\n') || '');
      setImagenUrl(productoParaEditar.imagen_url || '/images/escudo-roncedo.png');
    } else {
      setTitulo('');
      setSubtitulo('');
      setDescripcion('');
      setCategoria('centenario');
      setPrecio(15000);
      setStock(25);
      setEtiquetaEspecial('');
      setDestacado(false);
      setActivo(true);
      setTallesTexto('');
      setColoresTexto('');
      setDetallesTexto('');
      setImagenUrl('/images/escudo-roncedo.png');
    }
  }, [productoParaEditar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || precio <= 0) {
      alert('Ingresá un título válido y un precio mayor a 0');
      return;
    }

    setGuardando(true);
    try {
      const talles = tallesTexto
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const colores = coloresTexto
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      const detalles_tecnicos = detallesTexto
        .split('\n')
        .map((d) => d.trim())
        .filter(Boolean);

      const productoPayload: ProductoTienda = {
        id: productoParaEditar?.id || `prod-${Date.now()}`,
        titulo: titulo.trim(),
        subtitulo: subtitulo.trim() || undefined,
        descripcion: descripcion.trim(),
        categoria,
        precio: Number(precio),
        stock: Number(stock),
        etiqueta_especial: etiquetaEspecial.trim() || undefined,
        destacado,
        activo,
        talles: talles.length > 0 ? talles : undefined,
        colores: colores.length > 0 ? colores : undefined,
        detalles_tecnicos: detalles_tecnicos.length > 0 ? detalles_tecnicos : undefined,
        imagen_url: imagenUrl,
        imagenes_galeria: [imagenUrl],
        created_at: productoParaEditar?.created_at || new Date().toISOString(),
      };

      const res = await guardarProductoTienda(productoPayload);
      if (res.success && res.data) {
        onGuardadoExitoso(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Error guardando producto:', err);
      alert('Error al guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  const imagenesPredefinidas = [
    { url: '/images/escudo-roncedo.png', label: 'Escudo Roncedo' },
    { url: '/images/emblema-biblioteca.png', label: 'Emblema Biblioteca' },
    { url: '/images/logo-biblioteca-hd.png', label: 'Logo HD' },
    { url: '/images/socio-protector/tarjeta-oro.png', label: 'Dorado Centenario' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-blue-200/80 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-roncedo-navy to-[#1B5699] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShoppingBag className="w-5 h-5 text-roncedo-celesteLight" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">
                {productoParaEditar ? 'Editar Producto' : 'Nuevo Producto Oficial'}
              </h2>
              <p className="text-xs text-blue-100">
                Panel de Administración • Tienda Institucional
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Título y Subtítulo */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Título del Producto *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Camiseta Oficial Titular Edición Centenario"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Subtítulo / Bajada descriptiva
              </label>
              <input
                type="text"
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
                placeholder="Ej: Bastones celestes y blancos clásicos con cuello polo retro"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none text-slate-700"
              />
            </div>
          </div>

          {/* Categoría, Precio y Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Categoría *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaProductoTienda)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none text-slate-800 font-semibold"
              >
                <option value="centenario">Edición Centenario</option>
                <option value="indumentaria">Indumentaria</option>
                <option value="libros">Libros y Biblioteca</option>
                <option value="souvenirs">Souvenirs y Mates</option>
                <option value="accesorios">Accesorios</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Precio Base ($ ARS) *
              </label>
              <input
                type="number"
                required
                min="100"
                step="100"
                value={precio}
                onChange={(e) => setPrecio(Number(e.target.value))}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Stock Disponible *
              </label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none font-bold text-roncedo-navy"
              />
            </div>
          </div>

          {/* Previsualización de Descuentos para Socios Protectores */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold text-roncedo-navy">
              Precios con Descuento Socio Protector:
            </span>
            <span>Bronce (2%): <strong>${Math.round(precio * 0.98).toLocaleString('es-AR')}</strong></span>
            <span>Plata (5%): <strong>${Math.round(precio * 0.95).toLocaleString('es-AR')}</strong></span>
            <span className="text-amber-800">Oro (10%): <strong>${Math.round(precio * 0.90).toLocaleString('es-AR')}</strong></span>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Descripción Completa del Producto
            </label>
            <textarea
              rows={3}
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detallá los materiales, historia, confección o valor del producto..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none text-slate-800"
            />
          </div>

          {/* Talles y Colores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Talles disponibles (separar con comas)
              </label>
              <input
                type="text"
                value={tallesTexto}
                onChange={(e) => setTallesTexto(e.target.value)}
                placeholder="Ej: S, M, L, XL, XXL (dejar vacío si no aplica)"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Colores / Variantes (separar con comas)
              </label>
              <input
                type="text"
                value={coloresTexto}
                onChange={(e) => setColoresTexto(e.target.value)}
                placeholder="Ej: Celeste y Blanco, Azul Marino"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Especificaciones Técnicas */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Especificaciones Técnicas (una por línea)
            </label>
            <textarea
              rows={3}
              value={detallesTexto}
              onChange={(e) => setDetallesTexto(e.target.value)}
              placeholder="320 páginas satinadas&#10;Tapa dura con gofrado al oro&#10;Formato 22x28 cm"
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none text-slate-800"
            />
          </div>

          {/* Imagen y Selector Rápido */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Imagen del Producto
            </label>
            <input
              type="text"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              placeholder="URL de la imagen (ej: /images/escudo-roncedo.png)"
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none text-slate-800"
            />

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500 font-medium">Imágenes sugeridas:</span>
              {imagenesPredefinidas.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImagenUrl(item.url)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                    imagenUrl === item.url
                      ? 'bg-roncedo-navy text-white border-roncedo-navy'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opciones Especiales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Etiqueta Especial
              </label>
              <input
                type="text"
                value={etiquetaEspecial}
                onChange={(e) => setEtiquetaEspecial(e.target.value)}
                placeholder="Ej: Edición Centenario, Novedad"
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div className="flex items-center gap-2 self-end pb-2">
              <input
                type="checkbox"
                id="checkDestacado"
                checked={destacado}
                onChange={(e) => setDestacado(e.target.checked)}
                className="w-4 h-4 text-roncedo-celeste rounded border-slate-300 focus:ring-roncedo-celeste"
              />
              <label htmlFor="checkDestacado" className="text-xs font-bold text-slate-700 cursor-pointer">
                Destacar en portada
              </label>
            </div>

            <div className="flex items-center gap-2 self-end pb-2">
              <input
                type="checkbox"
                id="checkActivo"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="checkActivo" className="text-xs font-bold text-slate-700 cursor-pointer">
                Publicado y visible
              </label>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-roncedo-navy hover:bg-slate-900 text-white flex items-center gap-2 shadow-md transition-all active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>{guardando ? 'Guardando...' : 'Guardar Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
