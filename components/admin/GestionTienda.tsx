'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MessageCircle,
  Eye,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  ProductoTienda,
  PedidoTienda,
  EstadoPedidoTienda,
  CategoriaProductoTienda,
} from '@/types';
import {
  getProductosTienda,
  eliminarProductoTienda,
  getPedidosTienda,
  actualizarEstadoPedido,
  getWhatsAppPedidoUrl,
} from '@/lib/supabase/tienda';
import { GestionProductoModal } from '@/components/tienda/GestionProductoModal';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';

export function GestionTienda() {
  const [productos, setProductos] = useState<ProductoTienda[]>([]);
  const [pedidos, setPedidos] = useState<PedidoTienda[]>([]);
  const [loading, setLoading] = useState(true);

  // Subpestaña: 'productos' o 'pedidos'
  const [vistaActiva, setVistaActiva] = useState<'productos' | 'pedidos'>('productos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaProductoTienda | 'todas'>('todas');
  const [filtroEstadoPedido, setFiltroEstadoPedido] = useState<EstadoPedidoTienda | 'todos'>('todos');

  // Modal de producto
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoTienda | null>(null);

  // Cargar datos
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [prods, peds] = await Promise.all([
        getProductosTienda(),
        getPedidosTienda(),
      ]);
      setProductos(prods);
      setPedidos(peds);
    } catch (err) {
      console.error('Error cargando datos de tienda:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleNuevoProducto = () => {
    setProductoSeleccionado(null);
    setModalAbierto(true);
  };

  const handleEditarProducto = (prod: ProductoTienda) => {
    setProductoSeleccionado(prod);
    setModalAbierto(true);
  };

  const handleEliminarProducto = async (id: string, titulo: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar "${titulo}" del catálogo?`)) {
      await eliminarProductoTienda(id);
      setProductos((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleGuardadoExitoso = (productoGuardado: ProductoTienda) => {
    setProductos((prev) => {
      const idx = prev.findIndex((p) => p.id === productoGuardado.id);
      if (idx >= 0) {
        const copia = [...prev];
        copia[idx] = productoGuardado;
        return copia;
      }
      return [productoGuardado, ...prev];
    });
  };

  const handleCambiarEstadoPedido = async (
    id: string,
    nuevoEstado: EstadoPedidoTienda
  ) => {
    await actualizarEstadoPedido(id, nuevoEstado);
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p))
    );
  };

  // Filtrado de productos
  const productosFiltrados = productos.filter((p) => {
    const matchCat = filtroCategoria === 'todas' || p.categoria === filtroCategoria;
    const matchSearch =
      p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filtrado de pedidos
  const pedidosFiltrados = pedidos.filter((p) => {
    const matchEstado =
      filtroEstadoPedido === 'todos' || p.estado === filtroEstadoPedido;
    const matchSearch =
      p.codigo_pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telefono_whatsapp.includes(searchTerm);
    return matchEstado && matchSearch;
  });

  // Métricas
  const totalStock = productos.reduce((acc, p) => acc + p.stock, 0);
  const pedidosPendientes = pedidos.filter((p) => p.estado === 'pendiente').length;
  const totalRecaudado = pedidos
    .filter((p) => p.estado === 'confirmado' || p.estado === 'entregado' || p.estado === 'preparado')
    .reduce((acc, p) => acc + p.total_final, 0);

  return (
    <div className="space-y-6">
      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-roncedo-navy flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-roncedo-celeste" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Catálogo
            </span>
            <span className="text-lg font-black text-slate-900">
              {productos.length} items
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Stock Total
            </span>
            <span className="text-lg font-black text-slate-900">
              {totalStock} unidades
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Pendientes
            </span>
            <span className="text-lg font-black text-amber-700">
              {pedidosPendientes} pedidos
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Ventas
            </span>
            <span className="text-lg font-black text-emerald-700">
              ${totalRecaudado.toLocaleString('es-AR')}
            </span>
          </div>
        </div>
      </div>

      {/* Selector de Vistas y Acciones */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-200/80 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setVistaActiva('productos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                vistaActiva === 'productos'
                  ? 'bg-white text-roncedo-navy shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Catálogo de Productos ({productos.length})
            </button>
            <button
              onClick={() => setVistaActiva('pedidos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                vistaActiva === 'pedidos'
                  ? 'bg-white text-roncedo-navy shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pedidos Recibidos ({pedidos.length})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={cargarDatos}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refrescar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {vistaActiva === 'productos' && (
              <button
                onClick={handleNuevoProducto}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-roncedo-navy hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-roncedo-celesteLight" />
                <span>Nuevo Producto</span>
              </button>
            )}
          </div>
        </div>

        {/* Buscador y Filtros */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                vistaActiva === 'productos'
                  ? 'Buscar por nombre de producto o descripción...'
                  : 'Buscar por código de pedido, cliente o WhatsApp...'
              }
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none"
            />
          </div>

          {vistaActiva === 'productos' ? (
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value as any)}
              className="w-full sm:w-auto p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-700"
            >
              <option value="todas">Todas las categorías</option>
              <option value="centenario">Edición Centenario</option>
              <option value="indumentaria">Indumentaria</option>
              <option value="libros">Libros</option>
              <option value="souvenirs">Souvenirs</option>
              <option value="accesorios">Accesorios</option>
            </select>
          ) : (
            <select
              value={filtroEstadoPedido}
              onChange={(e) => setFiltroEstadoPedido(e.target.value as any)}
              className="w-full sm:w-auto p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-700"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="confirmado">Confirmados</option>
              <option value="preparado">Preparados</option>
              <option value="entregado">Entregados</option>
              <option value="cancelado">Cancelados</option>
            </select>
          )}
        </div>

        {/* CONTENIDO 1: TABLA DE PRODUCTOS */}
        {vistaActiva === 'productos' && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Precio Base</th>
                    <th className="py-3 px-4">Precio Oro (-10%)</th>
                    <th className="py-3 px-4 text-center">Stock</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No se encontraron productos coincidentes.
                      </td>
                    </tr>
                  ) : (
                    productosFiltrados.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-lg bg-slate-100 p-1 flex-shrink-0 border border-slate-200">
                              <Image
                                src={prod.imagen_url || '/images/escudo-roncedo.png'}
                                alt={prod.titulo}
                                fill
                                className="object-contain p-0.5"
                              />
                            </div>
                            <div>
                              <strong className="text-slate-900 block font-bold">
                                {prod.titulo}
                              </strong>
                              {prod.etiqueta_especial && (
                                <span className="text-[10px] text-amber-700 font-bold">
                                  {prod.etiqueta_especial}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                            {prod.categoria}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-800">
                          ${prod.precio.toLocaleString('es-AR')}
                        </td>

                        <td className="py-3 px-4 font-bold text-emerald-700">
                          ${Math.round(prod.precio * 0.9).toLocaleString('es-AR')}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              prod.stock <= 0
                                ? 'bg-rose-100 text-rose-700'
                                : prod.stock <= 5
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {prod.stock} u.
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              prod.activo
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {prod.activo ? 'Publicado' : 'Pausado'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditarProducto(prod)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-roncedo-navy hover:bg-slate-100 transition-colors"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEliminarProducto(prod.id, prod.titulo)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTENIDO 2: LISTA DE PEDIDOS */}
        {vistaActiva === 'pedidos' && (
          <div className="space-y-3">
            {pedidosFiltrados.length === 0 ? (
              <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                No se registraron pedidos aún.
              </div>
            ) : (
              pedidosFiltrados.map((ped) => (
                <div
                  key={ped.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-roncedo-navy bg-blue-50 px-2.5 py-1 rounded-lg">
                        {ped.codigo_pedido}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {ped.nombre_cliente}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({new Date(ped.created_at).toLocaleDateString('es-AR')})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={ped.estado}
                        onChange={(e) =>
                          handleCambiarEstadoPedido(ped.id, e.target.value as any)
                        }
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl border outline-none ${
                          ped.estado === 'pendiente'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : ped.estado === 'confirmado'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : ped.estado === 'preparado'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : ped.estado === 'entregado'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="preparado">Preparado para entrega</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>

                      <a
                        href={`https://wa.me/${ped.telefono_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hola ${ped.nombre_cliente}, te escribimos desde la Biblioteca Roncedo sobre tu pedido ${ped.codigo_pedido}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span>Chat</span>
                      </a>
                    </div>
                  </div>

                  {/* Resumen de items */}
                  <div className="text-xs text-slate-600 space-y-1">
                    {ped.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span>
                          {it.cantidad}x {it.producto.titulo}{' '}
                          {it.talleSeleccionado && `[Talle ${it.talleSeleccionado}]`}
                        </span>
                        <strong className="text-slate-800">
                          ${it.subtotal.toLocaleString('es-AR')}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="text-slate-500">
                      <span>Entrega: </span>
                      <strong className="text-slate-700">
                        {ped.metodo_entrega === 'retiro_biblioteca'
                          ? 'Retiro en Sede'
                          : `Envío a domicilio (${ped.direccion_envio || ''})`}
                      </strong>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-500">Total abonado:</span>
                      <span className="text-base font-black text-emerald-700">
                        ${ped.total_final.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de Crear / Editar Producto */}
      <GestionProductoModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        productoParaEditar={productoSeleccionado}
        onGuardadoExitoso={handleGuardadoExitoso}
      />
    </div>
  );
}
