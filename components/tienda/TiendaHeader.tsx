'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowLeft,
  Search,
  Sparkles,
  ShieldCheck,
  Award,
  BookOpen,
  Shirt,
  Gift,
  Tag,
  Layers,
} from 'lucide-react';
import { CategoriaProductoTienda, TipoSocioProtector } from '@/types';
import { MEDALLAS_SOCIO_PROTECTOR } from '@/lib/payments/plans';

interface TiendaHeaderProps {
  categoriaActiva: CategoriaProductoTienda | 'todos';
  onSelectCategoria: (cat: CategoriaProductoTienda | 'todos') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  tipoProtector: TipoSocioProtector | 'ninguno';
  onSimularProtector: (tipo: TipoSocioProtector | 'ninguno') => void;
  totalItemsCarrito: number;
  onAbrirCarrito: () => void;
  totalProductos: number;
}

export function TiendaHeader({
  categoriaActiva,
  onSelectCategoria,
  searchTerm,
  onSearchChange,
  tipoProtector,
  onSimularProtector,
  totalItemsCarrito,
  onAbrirCarrito,
  totalProductos,
}: TiendaHeaderProps) {
  const categoriasConfig: {
    id: CategoriaProductoTienda | 'todos';
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: 'todos', label: 'Todo el Catálogo', icon: Layers },
    { id: 'centenario', label: 'Edición Centenario', icon: Sparkles },
    { id: 'indumentaria', label: 'Indumentaria', icon: Shirt },
    { id: 'libros', label: 'Libros y Biblioteca', icon: BookOpen },
    { id: 'souvenirs', label: 'Souvenirs y Mates', icon: Gift },
    { id: 'accesorios', label: 'Accesorios', icon: Tag },
  ];

  return (
    <div className="space-y-6">
      {/* Navegación Superior y Carrito Flotante */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-xs font-bold text-roncedo-navy hover:text-roncedo-celesteDark transition-colors bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-blue-200/80 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-roncedo-celeste" />
          <span>Volver al Inicio</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Botón de Carrito */}
          <button
            onClick={onAbrirCarrito}
            className="relative inline-flex items-center gap-2.5 px-4 py-2 bg-roncedo-navy hover:bg-slate-900 text-white rounded-xl shadow-md transition-all active:scale-95 border border-blue-400/40"
          >
            <ShoppingBag className="w-4 h-4 text-roncedo-celesteLight" />
            <span className="text-xs font-bold hidden sm:inline">Mi Pedido</span>
            {totalItemsCarrito > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-black bg-rose-500 text-white rounded-full animate-pulse shadow-sm">
                {totalItemsCarrito}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Banner Principal con Identidad Institucional */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F2D54] via-[#1B5699] to-[#5B9BE5] text-white p-6 sm:p-8 shadow-card border border-white/20">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-sm">
              <ShoppingBag className="w-3 h-3 text-roncedo-celesteLight" />
              Tienda Oficial Roncedo
            </span>
            <span className="text-xs text-blue-100 font-medium">
              1926 - 2026 • Centenario
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Tienda y Merchandising Institucional
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-2xl">
            Adquirí los libros históricos de la institución, indumentaria conmemorativa del Centenario,
            mates imperiales y recuerdos exclusivos. Cada adquisición apoya directamente el sostenimiento
            de la Biblioteca y el Club Dr. Lautaro Roncedo.
          </p>

          {/* Banner de Beneficio Socio Protector */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {tipoProtector !== 'ninguno' ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 border border-white/30 backdrop-blur-sm text-xs font-semibold text-white">
                <Award className="w-4 h-4 text-amber-300" />
                <span>
                  Beneficio Activo: <strong>Socio Protector {tipoProtector}</strong> (
                  {tipoProtector === 'Bronce' && '2% OFF'}
                  {tipoProtector === 'Plata' && '5% OFF'}
                  {tipoProtector === 'Oro' && '10% OFF'} en toda la tienda)
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-900/40 border border-blue-300/30 text-xs text-blue-100">
                <ShieldCheck className="w-4 h-4 text-roncedo-celesteLight" />
                <span>¿Sos Socio Protector? Accedé a hasta 10% de descuento automático en tus compras.</span>
              </div>
            )}

            {/* Simulador de Rol (Demo y visualización interactiva) */}
            <div className="inline-flex items-center gap-1 bg-black/20 backdrop-blur-sm p-1 rounded-xl border border-white/20 text-[11px]">
              <span className="text-blue-200 px-2 font-medium">Ver precios como:</span>
              {(['ninguno', 'Bronce', 'Plata', 'Oro'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onSimularProtector(t)}
                  className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                    tipoProtector === t
                      ? 'bg-white text-roncedo-navy shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t === 'ninguno' ? 'Público' : t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patrón decorativo de fondo */}
        <div className="absolute right-0 bottom-0 top-0 w-80 opacity-10 pointer-events-none flex items-center justify-center">
          <ShoppingBag className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Buscador y Filtros por Categoría */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-blue-200/80 space-y-4">
        {/* Input de Búsqueda */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por libro, camiseta, mate, taza, talle..."
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-slate-500 whitespace-nowrap self-end sm:self-center">
            {totalProductos} {totalProductos === 1 ? 'producto' : 'productos'}
          </div>
        </div>

        {/* Pestañas de Categoría */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categoriasConfig.map((cat) => {
            const Icon = cat.icon;
            const activa = categoriaActiva === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategoria(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activa
                    ? 'bg-roncedo-navy text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${activa ? 'text-roncedo-celesteLight' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
