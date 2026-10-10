'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Eye,
  Check,
  Tag,
  Sparkles,
  ShieldAlert,
  Award,
} from 'lucide-react';
import { ProductoTienda, TipoSocioProtector } from '@/types';
import { calcularDescuentoProtector } from '@/lib/supabase/tienda';

interface ProductoCardProps {
  producto: ProductoTienda;
  tipoProtector: TipoSocioProtector | 'ninguno';
  onVerDetalle: (producto: ProductoTienda) => void;
  onAgregarCarrito: (
    producto: ProductoTienda,
    cantidad: number,
    talle?: string,
    color?: string
  ) => void;
}

export function ProductoCard({
  producto,
  tipoProtector,
  onVerDetalle,
  onAgregarCarrito,
}: ProductoCardProps) {
  const [talleSeleccionado, setTalleSeleccionado] = useState<string>(
    producto.talles && producto.talles.length > 0 ? producto.talles[0] : ''
  );
  const [colorSeleccionado, setColorSeleccionado] = useState<string>(
    producto.colores && producto.colores.length > 0 ? producto.colores[0] : ''
  );
  const [agregadoAnim, setAgregadoAnim] = useState(false);

  const { precioFinal, descuentoMonto, porcentaje } = calcularDescuentoProtector(
    producto.precio,
    tipoProtector
  );

  const tieneDescuento = descuentoMonto > 0;
  const sinStock = producto.stock <= 0;
  const pocoStock = producto.stock > 0 && producto.stock <= 5;

  const handleAgregar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sinStock) return;
    onAgregarCarrito(producto, 1, talleSeleccionado, colorSeleccionado);
    setAgregadoAnim(true);
    setTimeout(() => setAgregadoAnim(false), 1200);
  };

  return (
    <div
      onClick={() => onVerDetalle(producto)}
      className="group bg-white rounded-3xl border border-blue-200/80 shadow-sm hover:shadow-xl hover:border-roncedo-celeste transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Cabecera / Imagen del Producto */}
      <div className="relative h-56 sm:h-64 bg-gradient-to-br from-[#EBF3FB] via-[#F4F9FD] to-[#DDEBFA] flex items-center justify-center p-6 overflow-hidden">
        {/* Badges Superiores */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          {producto.etiqueta_especial ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>{producto.etiqueta_especial}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 text-slate-700 border border-slate-200 shadow-xs">
              <Tag className="w-3 h-3 text-slate-500" />
              <span>{producto.categoria}</span>
            </span>
          )}

          {sinStock ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
              Sin Stock
            </span>
          ) : pocoStock ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
              ¡Últimas {producto.stock} u.!
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Stock: {producto.stock}
            </span>
          )}
        </div>

        {/* Imagen o Ilustración Representativa */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 group-hover:scale-105 transition-transform duration-300 drop-shadow-md">
          <Image
            src={producto.imagen_url || '/images/escudo-roncedo.png'}
            alt={producto.titulo}
            fill
            className="object-contain"
          />
        </div>

        {/* Overlay hover sutil con botón rápido de vista */}
        <div className="absolute inset-0 bg-roncedo-navy/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 text-roncedo-navy text-xs font-bold shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all">
            <Eye className="w-3.5 h-3.5 text-roncedo-celeste" />
            <span>Ver detalles</span>
          </span>
        </div>
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>{producto.categoria}</span>
            {producto.destacado && (
              <span className="text-amber-600 font-extrabold flex items-center gap-1">
                ★ Destacado
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 group-hover:text-roncedo-navy transition-colors line-clamp-2 leading-snug">
            {producto.titulo}
          </h3>

          {producto.subtitulo && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {producto.subtitulo}
            </p>
          )}
        </div>

        {/* Selectores de Variante (Talle / Color) si aplican */}
        {producto.talles && producto.talles.length > 0 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="pt-1 space-y-1.5"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>Talle disponible:</span>
              <span className="text-roncedo-navy font-black">{talleSeleccionado}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {producto.talles.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTalleSeleccionado(t)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-all ${
                    talleSeleccionado === t
                      ? 'bg-roncedo-navy text-white border-roncedo-navy shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Precio y Descuentos */}
        <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              {tieneDescuento ? (
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 line-through font-semibold">
                    ${producto.precio.toLocaleString('es-AR')}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-black text-emerald-700">
                      ${precioFinal.toLocaleString('es-AR')}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                      {porcentaje}% OFF
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xl sm:text-2xl font-black text-roncedo-navy">
                  ${producto.precio.toLocaleString('es-AR')}
                </div>
              )}
            </div>

            {tieneDescuento && (
              <span className="text-[10px] font-bold text-slate-500 text-right flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-500" />
                <span>Socio {tipoProtector}</span>
              </span>
            )}
          </div>

          {/* Botón de Acción */}
          <button
            type="button"
            disabled={sinStock}
            onClick={handleAgregar}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 ${
              sinStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : agregadoAnim
                ? 'bg-emerald-600 text-white shadow-emerald-200'
                : 'bg-roncedo-celeste hover:bg-roncedo-celesteDark text-white shadow-blue-200'
            }`}
          >
            {agregadoAnim ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>¡Agregado al Pedido!</span>
              </>
            ) : sinStock ? (
              <span>Agotado temporalmente</span>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Agregar al Carrito</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
