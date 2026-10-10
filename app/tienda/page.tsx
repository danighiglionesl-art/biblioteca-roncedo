'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  Award,
  Layers,
  Settings,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  ProductoTienda,
  CategoriaProductoTienda,
  ItemCarritoTienda,
  TipoSocioProtector,
} from '@/types';
import {
  getProductosTienda,
  calcularDescuentoProtector,
} from '@/lib/supabase/tienda';
import { TiendaHeader } from '@/components/tienda/TiendaHeader';
import { ProductoCard } from '@/components/tienda/ProductoCard';
import { ProductoDetalleModal } from '@/components/tienda/ProductoDetalleModal';
import { CarritoModal } from '@/components/tienda/CarritoModal';

const LOCAL_STORAGE_CARRITO_KEY = 'roncedo_carrito_items_v1';

export default function TiendaPage() {
  const { user } = useAuth();

  const [productos, setProductos] = useState<ProductoTienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaProductoTienda | 'todos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Condición de socio protector
  const tipoProtectorReal: TipoSocioProtector | 'ninguno' =
    user?.es_socio_protector &&
    user?.estado_socio_protector === 'activo' &&
    user?.tipo_socio_protector
      ? user.tipo_socio_protector
      : 'ninguno';

  // Simulador de rol para visualización de precios
  const [tipoProtectorSimulado, setTipoProtectorSimulado] = useState<TipoSocioProtector | 'ninguno'>(
    tipoProtectorReal
  );

  useEffect(() => {
    setTipoProtectorSimulado(tipoProtectorReal);
  }, [tipoProtectorReal]);

  // Carrito de compras
  const [carrito, setCarrito] = useState<ItemCarritoTienda[]>([]);
  const [carritoModalAbierto, setCarritoModalAbierto] = useState(false);
  const [productoParaDetalle, setProductoParaDetalle] = useState<ProductoTienda | null>(null);

  // Cargar productos
  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await getProductosTienda();
        setProductos(data);
      } catch (err) {
        console.error('Error cargando tienda:', err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // Cargar carrito de localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem(LOCAL_STORAGE_CARRITO_KEY);
      if (local) {
        try {
          setCarrito(JSON.parse(local));
        } catch (e) {
          console.error('Error parseando carrito:', e);
        }
      }
    }
  }, []);

  // Guardar carrito en localStorage
  const guardarCarrito = (nuevosItems: ItemCarritoTienda[]) => {
    setCarrito(nuevosItems);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_CARRITO_KEY, JSON.stringify(nuevosItems));
    }
  };

  // Agregar al carrito
  const handleAgregarCarrito = (
    producto: ProductoTienda,
    cantidad: number = 1,
    talle?: string,
    color?: string
  ) => {
    const { precioFinal, descuentoMonto } = calcularDescuentoProtector(
      producto.precio,
      tipoProtectorSimulado
    );

    const copia = [...carrito];
    const indexExistente = copia.findIndex(
      (item) =>
        item.producto.id === producto.id &&
        item.talleSeleccionado === talle &&
        item.colorSeleccionado === color
    );

    if (indexExistente >= 0) {
      copia[indexExistente].cantidad += cantidad;
      copia[indexExistente].subtotal =
        copia[indexExistente].cantidad * copia[indexExistente].precioFinalUnitario;
    } else {
      copia.push({
        producto,
        cantidad,
        talleSeleccionado: talle,
        colorSeleccionado: color,
        precioUnitario: producto.precio,
        descuentoUnitario: descuentoMonto,
        precioFinalUnitario: precioFinal,
        subtotal: precioFinal * cantidad,
      });
    }

    guardarCarrito(copia);
  };

  // Actualizar cantidad en carrito
  const handleActualizarCantidadCarrito = (index: number, delta: number) => {
    const copia = [...carrito];
    if (index >= 0 && index < copia.length) {
      const nuevaCantidad = copia[index].cantidad + delta;
      if (nuevaCantidad <= 0) {
        copia.splice(index, 1);
      } else {
        copia[index].cantidad = nuevaCantidad;
        copia[index].subtotal = nuevaCantidad * copia[index].precioFinalUnitario;
      }
      guardarCarrito(copia);
    }
  };

  // Eliminar item de carrito
  const handleEliminarItemCarrito = (index: number) => {
    const copia = [...carrito];
    if (index >= 0 && index < copia.length) {
      copia.splice(index, 1);
      guardarCarrito(copia);
    }
  };

  // Vaciar carrito
  const handleVaciarCarrito = () => {
    guardarCarrito([]);
  };

  // Filtrado de catálogo
  const productosFiltrados = productos.filter((p) => {
    if (!p.activo) return false;
    const matchCat =
      categoriaActiva === 'todos' || p.categoria === categoriaActiva;
    const matchSearch =
      p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.subtitulo && p.subtitulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.talles && p.talles.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchCat && matchSearch;
  });

  const totalItemsEnCarrito = carrito.reduce((acc, it) => acc + it.cantidad, 0);
  const totalMontoCarrito = carrito.reduce((acc, it) => acc + it.subtotal, 0);

  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-28 pt-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner de acceso de administración para administradores */}
        {user?.role === 'admin' && (
          <div className="bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-roncedo-celeste flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-roncedo-navy">
              <Settings className="w-4 h-4 text-roncedo-celeste" />
              <span>Modo Administrador: Podés agregar o modificar stock y precios en el panel.</span>
            </div>
            <Link
              href="/admin?tab=tienda"
              className="px-3.5 py-1.5 bg-roncedo-navy hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              Gestionar Catálogo en Admin
            </Link>
          </div>
        )}

        {/* Encabezado con buscador, categorías y simulador */}
        <TiendaHeader
          categoriaActiva={categoriaActiva}
          onSelectCategoria={setCategoriaActiva}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          tipoProtector={tipoProtectorSimulado}
          onSimularProtector={setTipoProtectorSimulado}
          totalItemsCarrito={totalItemsEnCarrito}
          onAbrirCarrito={() => setCarritoModalAbierto(true)}
          totalProductos={productosFiltrados.length}
        />

        {/* Grilla de Productos */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-roncedo-celeste border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">
              Cargando catálogo institucional...
            </p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-blue-200/80 shadow-card space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-roncedo-navy flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7 text-roncedo-celeste" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No se encontraron productos
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No hay artículos que coincidan con la búsqueda actual o categoría seleccionada.
            </p>
            <button
              onClick={() => {
                setCategoriaActiva('todos');
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-roncedo-navy text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-xs"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {productosFiltrados.map((prod) => (
              <ProductoCard
                key={prod.id}
                producto={prod}
                tipoProtector={tipoProtectorSimulado}
                onVerDetalle={(p) => setProductoParaDetalle(p)}
                onAgregarCarrito={handleAgregarCarrito}
              />
            ))}
          </div>
        )}

        {/* Modal de Detalle de Producto */}
        <ProductoDetalleModal
          producto={productoParaDetalle}
          onClose={() => setProductoParaDetalle(null)}
          tipoProtector={tipoProtectorSimulado}
          onAgregarCarrito={handleAgregarCarrito}
        />

        {/* Modal de Carrito y Checkout de WhatsApp */}
        <CarritoModal
          isOpen={carritoModalAbierto}
          onClose={() => setCarritoModalAbierto(false)}
          items={carrito}
          onActualizarCantidad={handleActualizarCantidadCarrito}
          onEliminarItem={handleEliminarItemCarrito}
          onVaciarCarrito={handleVaciarCarrito}
          tipoProtector={tipoProtectorSimulado}
          user={user}
        />

        {/* Barra Flotante Inferior en Móviles si hay items en carrito */}
        {totalItemsEnCarrito > 0 && !carritoModalAbierto && (
          <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden animate-bounce-subtle">
            <button
              onClick={() => setCarritoModalAbierto(true)}
              className="w-full p-4 rounded-2xl bg-roncedo-navy text-white shadow-2xl border border-blue-400/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="w-6 h-6 text-roncedo-celesteLight" />
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.5 text-[10px] font-black bg-rose-500 rounded-full">
                    {totalItemsEnCarrito}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block">Ver mi pedido</span>
                  <span className="text-[11px] text-blue-200">
                    {totalItemsEnCarrito} {totalItemsEnCarrito === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-base font-black text-emerald-400">
                  ${totalMontoCarrito.toLocaleString('es-AR')}
                </span>
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-xl font-bold">
                  Continuar →
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
