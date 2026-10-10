'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Truck,
  Building,
  CreditCard,
  Award,
  Sparkles,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ItemCarritoTienda,
  MetodoEntregaTienda,
  MetodoPagoTienda,
  TipoSocioProtector,
  UserProfile,
  PedidoTienda,
} from '@/types';
import {
  crearPedidoTienda,
  getWhatsAppPedidoUrl,
} from '@/lib/supabase/tienda';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';

interface CarritoModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ItemCarritoTienda[];
  onActualizarCantidad: (index: number, delta: number) => void;
  onEliminarItem: (index: number) => void;
  onVaciarCarrito: () => void;
  tipoProtector: TipoSocioProtector | 'ninguno';
  user: UserProfile | null;
}

export function CarritoModal({
  isOpen,
  onClose,
  items,
  onActualizarCantidad,
  onEliminarItem,
  onVaciarCarrito,
  tipoProtector,
  user,
}: CarritoModalProps) {
  if (!isOpen) return null;

  // Formulario de datos
  const [nombre, setNombre] = useState(
    user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : ''
  );
  const [whatsapp, setWhatsapp] = useState(
    user?.whatsapp || user?.telefono || ''
  );
  const [email, setEmail] = useState(user?.email || '');
  const [dni, setDni] = useState(user?.dni || '');
  const [metodoEntrega, setMetodoEntrega] =
    useState<MetodoEntregaTienda>('retiro_biblioteca');
  const [direccion, setDireccion] = useState(user?.domicilio || '');
  const [localidad, setLocalidad] = useState(
    user?.localidad || 'Alcira Gigena'
  );
  const [metodoPago, setMetodoPago] =
    useState<MetodoPagoTienda>('whatsapp_acordar');
  const [notas, setNotas] = useState('');

  // Estados de proceso
  const [enviando, setEnviando] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<PedidoTienda | null>(null);
  const [copiadoAlias, setCopiadoAlias] = useState(false);

  // Totales
  const totalBruto = items.reduce(
    (acc, item) => acc + item.producto.precio * item.cantidad,
    0
  );
  const totalConDescuento = items.reduce(
    (acc, item) => acc + item.subtotal,
    0
  );
  const totalDescuento = Math.max(0, totalBruto - totalConDescuento);

  const handleCopiarAlias = () => {
    navigator.clipboard.writeText('BIBLIOTECA.RONCEDO.MP');
    setCopiadoAlias(true);
    setTimeout(() => setCopiadoAlias(false), 2000);
  };

  const handleConfirmarPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!nombre.trim() || !whatsapp.trim()) {
      alert('Por favor, ingresá tu Nombre y WhatsApp de contacto para coordinar la entrega.');
      return;
    }

    setEnviando(true);
    try {
      const nuevoPedido = await crearPedidoTienda({
        user_id: user?.id,
        nombre_cliente: nombre.trim(),
        telefono_whatsapp: whatsapp.trim(),
        email_cliente: email.trim() || undefined,
        dni_cliente: dni.trim() || undefined,
        metodo_entrega: metodoEntrega,
        direccion_envio:
          metodoEntrega === 'envio_domicilio' ? direccion.trim() : undefined,
        localidad:
          metodoEntrega === 'envio_domicilio' ? localidad.trim() : undefined,
        items,
        total_bruto: totalBruto,
        descuento_protector: totalDescuento,
        total_final: totalConDescuento,
        tipo_protector_aplicado: tipoProtector,
        metodo_pago: metodoPago,
        estado: 'pendiente',
        notas: notas.trim() || undefined,
      });

      // Efecto festivo de confeti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setPedidoConfirmado(nuevoPedido);
      onVaciarCarrito();

      // Abrir WhatsApp en nueva pestaña
      const urlWa = getWhatsAppPedidoUrl(nuevoPedido);
      window.open(urlWa, '_blank');
    } catch (err) {
      console.error('Error generando pedido:', err);
      alert('Ocurrió un error al procesar el pedido. Por favor, reintentalo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-blue-200/80 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Carrito */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-roncedo-navy to-[#1B5699] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShoppingBag className="w-5 h-5 text-roncedo-celesteLight" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">
                {pedidoConfirmado ? '¡Pedido Confirmado!' : 'Tu Carrito de Compras'}
              </h2>
              <p className="text-xs text-blue-100">
                {pedidoConfirmado
                  ? `Orden #${pedidoConfirmado.codigo_pedido}`
                  : `${items.length} ${items.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}`}
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

        {/* Pantalla de Éxito / Confirmación */}
        {pedidoConfirmado ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                ¡Muchas gracias por tu pedido, {pedidoConfirmado.nombre_cliente}!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Hemos registrado tu orden{' '}
                <strong className="text-roncedo-navy">
                  {pedidoConfirmado.codigo_pedido}
                </strong>{' '}
                por un total de{' '}
                <strong className="text-emerald-700">
                  ${pedidoConfirmado.total_final.toLocaleString('es-AR')}
                </strong>
                .
              </p>
            </div>

            {/* Datos para transferencia si eligió ese método */}
            {pedidoConfirmado.metodo_pago === 'transferencia' && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-left max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Datos Bancarios Oficiales:</span>
                  <span className="text-roncedo-celesteDark">Banco de Córdoba</span>
                </div>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Alias Mercado Pago / Bancario
                    </span>
                    <strong className="text-xs text-roncedo-navy font-mono">
                      BIBLIOTECA.RONCEDO.MP
                    </strong>
                  </div>
                  <button
                    onClick={handleCopiarAlias}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 text-roncedo-navy hover:bg-blue-200 transition-colors"
                  >
                    {copiadoAlias ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Una vez transferido, enviá el comprobante adjunto en el chat de WhatsApp.
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={getWhatsAppPedidoUrl(pedidoConfirmado)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Reabrir Chat de WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setPedidoConfirmado(null);
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Seguir Explorando
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* Carrito Vacío */
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                Tu carrito está vacío
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Elegí libros conmemorativos, indumentaria del centenario o recuerdos institucionales para iniciar tu pedido.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-roncedo-navy text-white text-xs font-bold hover:bg-slate-900 transition-colors shadow-sm"
            >
              Ver Catálogo
            </button>
          </div>
        ) : (
          /* Formulario de Checkout y Lista de Productos */
          <form onSubmit={handleConfirmarPedido} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Lista de Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Productos en el pedido</span>
                <button
                  type="button"
                  onClick={onVaciarCarrito}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 sm:p-4 flex items-center gap-3 bg-white">
                    <div className="relative w-14 h-14 rounded-xl bg-slate-100 p-1 flex-shrink-0 border border-slate-200">
                      <Image
                        src={item.producto.imagen_url || '/images/escudo-roncedo.png'}
                        alt={item.producto.titulo}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {item.producto.titulo}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        {item.talleSeleccionado && (
                          <span className="font-semibold text-roncedo-navy">
                            Talle: {item.talleSeleccionado}
                          </span>
                        )}
                        {item.colorSeleccionado && (
                          <span>Color: {item.colorSeleccionado}</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-700 mt-1">
                        ${item.precioFinalUnitario.toLocaleString('es-AR')}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">c/u</span>
                      </div>
                    </div>

                    {/* Stepper de Cantidad */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        type="button"
                        onClick={() => onActualizarCantidad(idx, -1)}
                        className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 py-1 text-xs font-bold text-roncedo-navy min-w-[1.5rem] text-center">
                        {item.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => onActualizarCantidad(idx, 1)}
                        className="px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal del item */}
                    <div className="text-right min-w-[4.5rem]">
                      <span className="text-xs sm:text-sm font-black text-roncedo-navy">
                        ${item.subtotal.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onEliminarItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Desglose de Descuentos para Socios Protectores */}
            {tipoProtector !== 'ninguno' && totalDescuento > 0 ? (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-amber-900">
                    Descuento Socio Protector {tipoProtector}:
                  </span>
                </div>
                <span className="font-black text-emerald-700">
                  -${totalDescuento.toLocaleString('es-AR')}
                </span>
              </div>
            ) : null}

            {/* Forma de Entrega */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Forma de Entrega:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoEntrega('retiro_biblioteca')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    metodoEntrega === 'retiro_biblioteca'
                      ? 'bg-blue-50/80 border-roncedo-celeste ring-1 ring-roncedo-celeste'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Building className="w-4 h-4 text-roncedo-celeste mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Retiro en Sede Social
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Belgrano 450, Alcira Gigena • Sin costo
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoEntrega('envio_domicilio')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    metodoEntrega === 'envio_domicilio'
                      ? 'bg-blue-50/80 border-roncedo-celeste ring-1 ring-roncedo-celeste'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Truck className="w-4 h-4 text-roncedo-celeste mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Envío a Domicilio
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Alcira Gigena y zona • Costo a convenir
                    </span>
                  </div>
                </button>
              </div>

              {metodoEntrega === 'envio_domicilio' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 animate-fade-in">
                  <input
                    type="text"
                    required
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle y número de domicilio..."
                    className="p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={localidad}
                    onChange={(e) => setLocalidad(e.target.value)}
                    placeholder="Localidad (ej: Alcira Gigena)..."
                    className="p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none"
                  />
                </div>
              )}
            </div>

            {/* Datos del Cliente */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">
                Tus datos de contacto:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre y Apellido *"
                  className="p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none text-slate-800"
                />
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Número de WhatsApp *"
                  className="p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none text-slate-800"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo Electrónico (opcional)"
                  className="p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none text-slate-800"
                />
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="DNI (opcional para recibo)"
                  className="p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-roncedo-celeste outline-none text-slate-800"
                />
              </div>
            </div>

            {/* Método de Pago */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">
                Forma de Pago preferida:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoPago('whatsapp_acordar')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    metodoPago === 'whatsapp_acordar'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 text-xs'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <span className="text-[11px] block">WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago('transferencia')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    metodoPago === 'transferencia'
                      ? 'bg-blue-50 border-roncedo-celeste text-roncedo-navy font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 text-xs'
                  }`}
                >
                  <Building className="w-4 h-4 mx-auto mb-1 text-roncedo-celeste" />
                  <span className="text-[11px] block">Transferencia</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago('mercadopago')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    metodoPago === 'mercadopago'
                      ? 'bg-sky-50 border-sky-400 text-sky-900 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 text-xs'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-sky-600" />
                  <span className="text-[11px] block">Mercado Pago</span>
                </button>
              </div>
            </div>

            {/* Resumen Final de Pago */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal bruto:</span>
                <span>${totalBruto.toLocaleString('es-AR')}</span>
              </div>
              {totalDescuento > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                  <span>Descuento Socio Protector ({tipoProtector}):</span>
                  <span>-${totalDescuento.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-600">
                <span>Entrega:</span>
                <span>
                  {metodoEntrega === 'retiro_biblioteca'
                    ? 'Retiro gratis en Sede'
                    : 'A coordinar'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total a pagar:</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-700">
                  ${totalConDescuento.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Botón de Enviar Pedido */}
            <button
              type="submit"
              disabled={enviando}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-50"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>
                {enviando
                  ? 'Registrando pedido...'
                  : 'Confirmar Pedido y Abrir WhatsApp Oficial'}
              </span>
            </button>
            <p className="text-[11px] text-center text-slate-400">
              Al confirmar, tu pedido se guarda en el sistema institucional y se abre el chat directo con la Biblioteca ({CONTACTO_BIBLIOTECA.whatsappFormato}).
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
