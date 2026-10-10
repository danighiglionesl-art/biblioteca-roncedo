'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  ShoppingBag,
  Check,
  ShieldCheck,
  Sparkles,
  Award,
  Tag,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ProductoTienda, TipoSocioProtector } from '@/types';
import { calcularDescuentoProtector } from '@/lib/supabase/tienda';

interface ProductoDetalleModalProps {
  producto: ProductoTienda | null;
  onClose: () => void;
  tipoProtector: TipoSocioProtector | 'ninguno';
  onAgregarCarrito: (
    producto: ProductoTienda,
    cantidad: number,
    talle?: string,
    color?: string
  ) => void;
}

export function ProductoDetalleModal({
  producto,
  onClose,
  tipoProtector,
  onAgregarCarrito,
}: ProductoDetalleModalProps) {
  if (!producto) return null;

  const [talleSeleccionado, setTalleSeleccionado] = useState<string>(
    producto.talles && producto.talles.length > 0 ? producto.talles[0] : ''
  );
  const [colorSeleccionado, setColorSeleccionado] = useState<string>(
    producto.colores && producto.colores.length > 0 ? producto.colores[0] : ''
  );
  const [cantidad, setCantidad] = useState<number>(1);
  const [imagenActiva, setImagenActiva] = useState<string>(producto.imagen_url);
  const [agregadoAnim, setAgregadoAnim] = useState(false);

  const { precioFinal, descuentoMonto, porcentaje } = calcularDescuentoProtector(
    producto.precio,
    tipoProtector
  );

  const subtotal = precioFinal * cantidad;
  const sinStock = producto.stock <= 0;

  const handleAgregar = () => {
    if (sinStock) return;
    onAgregarCarrito(producto, cantidad, talleSeleccionado, colorSeleccionado);
    setAgregadoAnim(true);
    setTimeout(() => {
      setAgregadoAnim(false);
      onClose();
    }, 900);
  };

  const galeria = producto.imagenes_galeria || [producto.imagen_url];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-blue-200/80 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Columna Izquierda: Galería e Imagen */}
          <div className="bg-gradient-to-br from-[#EBF3FB] via-[#F4F9FD] to-[#DDEBFA] p-6 sm:p-8 flex flex-col justify-between items-center border-b md:border-b-0 md:border-r border-blue-100">
            <div className="w-full flex items-center justify-between">
              {producto.etiqueta_especial && (
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500 text-white shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{producto.etiqueta_especial}</span>
                </span>
              )}
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/80 text-slate-700 border border-slate-200">
                Stock: {producto.stock} unidades
              </span>
            </div>

            {/* Imagen Principal */}
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 my-6 drop-shadow-lg">
              <Image
                src={imagenActiva || '/images/escudo-roncedo.png'}
                alt={producto.titulo}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Miniaturas */}
            {galeria.length > 1 && (
              <div className="flex items-center gap-2 pt-2">
                {galeria.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImagenActiva(img)}
                    className={`relative w-12 h-12 rounded-xl p-1 bg-white border-2 transition-all ${
                      imagenActiva === img
                        ? 'border-roncedo-celeste shadow-md scale-105'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Miniatura ${i + 1}`}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Columna Derecha: Información y Compra */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <span>{producto.categoria}</span>
                  {producto.destacado && (
                    <span className="text-amber-600 font-extrabold">• Destacado Oficial</span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {producto.titulo}
                </h2>
                {producto.subtitulo && (
                  <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                    {producto.subtitulo}
                  </p>
                )}
              </div>

              {/* Precios y Descuento */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    {descuentoMonto > 0 ? (
                      <div>
                        <span className="text-xs text-slate-400 line-through font-semibold">
                          ${producto.precio.toLocaleString('es-AR')}
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                            ${precioFinal.toLocaleString('es-AR')}
                          </span>
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">
                            {porcentaje}% OFF
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-2xl sm:text-3xl font-black text-roncedo-navy">
                        ${producto.precio.toLocaleString('es-AR')}
                      </div>
                    )}
                  </div>

                  {tipoProtector !== 'ninguno' && (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-xl">
                        <Award className="w-3.5 h-3.5" />
                        <span>Socio {tipoProtector}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Tabla referencial de descuentos */}
                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Bronce: -2% (${(producto.precio * 0.98).toLocaleString('es-AR')})</span>
                  <span>Plata: -5% (${(producto.precio * 0.95).toLocaleString('es-AR')})</span>
                  <span className="font-bold text-amber-800">Oro: -10% (${(producto.precio * 0.90).toLocaleString('es-AR')})</span>
                </div>
              </div>

              {/* Descripción */}
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {producto.descripcion}
              </div>

              {/* Especificaciones Técnicas */}
              {producto.detalles_tecnicos && producto.detalles_tecnicos.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-roncedo-celeste" />
                    <span>Detalles y Especificaciones:</span>
                  </h4>
                  <ul className="grid grid-cols-1 gap-1 text-xs text-slate-600">
                    {producto.detalles_tecnicos.map((det, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-roncedo-celeste font-bold">•</span>
                        <span>{det}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Selector de Talle */}
              {producto.talles && producto.talles.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Seleccionar Talle: <strong className="text-roncedo-navy">{talleSeleccionado}</strong>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {producto.talles.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTalleSeleccionado(t)}
                        className={`px-3 py-1.5 text-xs rounded-xl font-bold border transition-all ${
                          talleSeleccionado === t
                            ? 'bg-roncedo-navy text-white border-roncedo-navy shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selector de Color */}
              {producto.colores && producto.colores.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Color: <strong className="text-roncedo-navy">{colorSeleccionado}</strong>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {producto.colores.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColorSeleccionado(c)}
                        className={`px-3 py-1.5 text-xs rounded-xl font-bold border transition-all ${
                          colorSeleccionado === c
                            ? 'bg-roncedo-navy text-white border-roncedo-navy shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stepper de Cantidad y Botón de Compra */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-700">Cantidad:</span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                    disabled={cantidad <= 1}
                    className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 font-bold text-sm text-roncedo-navy min-w-[2.5rem] text-center">
                    {cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCantidad((prev) => Math.min(producto.stock, prev + 1))}
                    disabled={cantidad >= producto.stock}
                    className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Subtotal:</span>
                  <span className="text-lg font-black text-roncedo-navy">
                    ${subtotal.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={sinStock}
                onClick={handleAgregar}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                  sinStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : agregadoAnim
                    ? 'bg-emerald-600 text-white'
                    : 'bg-roncedo-celeste hover:bg-roncedo-celesteDark text-white'
                }`}
              >
                {agregadoAnim ? (
                  <>
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>¡Agregado al Carrito!</span>
                  </>
                ) : sinStock ? (
                  <span>Producto agotado</span>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Agregar al Pedido (${subtotal.toLocaleString('es-AR')})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
