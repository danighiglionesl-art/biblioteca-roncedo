import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  ProductoTienda,
  PedidoTienda,
  EstadoPedidoTienda,
  TipoSocioProtector,
} from '@/types';
import { PRODUCTOS_INICIALES_TIENDA } from '@/lib/data/productosTienda';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';

const LOCAL_STORAGE_PRODUCTOS_KEY = 'roncedo_tienda_productos_v1';
const LOCAL_STORAGE_PEDIDOS_KEY = 'roncedo_tienda_pedidos_v1';

/**
 * Calcula precios según descuento de Socio Protector:
 * - Bronce: 2%
 * - Plata: 5%
 * - Oro: 10%
 */
export function calcularDescuentoProtector(
  precioBase: number,
  tipoProtector?: TipoSocioProtector | 'ninguno' | null
): {
  precioFinal: number;
  descuentoMonto: number;
  porcentaje: number;
} {
  if (!tipoProtector || tipoProtector === 'ninguno') {
    return { precioFinal: precioBase, descuentoMonto: 0, porcentaje: 0 };
  }

  let porcentaje = 0;
  if (tipoProtector === 'Bronce') porcentaje = 2;
  else if (tipoProtector === 'Plata') porcentaje = 5;
  else if (tipoProtector === 'Oro') porcentaje = 10;

  const descuentoMonto = Math.round((precioBase * porcentaje) / 100);
  const precioFinal = Math.max(0, precioBase - descuentoMonto);

  return { precioFinal, descuentoMonto, porcentaje };
}

/**
 * Obtener todos los productos de la tienda
 */
export async function getProductosTienda(): Promise<ProductoTienda[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tienda_productos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as ProductoTienda[];
      }
    } catch (err) {
      console.warn('Error conectando a Supabase tienda_productos, usando local:', err);
    }
  }

  // Fallback a localStorage o catálogo inicial
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(LOCAL_STORAGE_PRODUCTOS_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parseando productos de localStorage:', e);
      }
    }
    // Inicializar localStorage con productos por defecto
    localStorage.setItem(
      LOCAL_STORAGE_PRODUCTOS_KEY,
      JSON.stringify(PRODUCTOS_INICIALES_TIENDA)
    );
  }

  return PRODUCTOS_INICIALES_TIENDA;
}

/**
 * Guardar o actualizar un producto (Admin)
 */
export async function guardarProductoTienda(
  producto: ProductoTienda
): Promise<{ success: boolean; data?: ProductoTienda; error?: string }> {
  // Asegurar precios calculados
  const precios = {
    precio_socio_bronce: Math.round(producto.precio * 0.98),
    precio_socio_plata: Math.round(producto.precio * 0.95),
    precio_socio_oro: Math.round(producto.precio * 0.90),
  };

  const productoActualizado: ProductoTienda = {
    ...producto,
    ...precios,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tienda_productos')
        .upsert(productoActualizado)
        .select()
        .single();

      if (error) {
        console.warn('Error Supabase guardando producto, guardando en local:', error);
      } else if (data) {
        actualizarCacheLocalProducto(data as ProductoTienda);
        return { success: true, data: data as ProductoTienda };
      }
    } catch (err: any) {
      console.warn('Excepción guardando en Supabase:', err);
    }
  }

  actualizarCacheLocalProducto(productoActualizado);
  return { success: true, data: productoActualizado };
}

function actualizarCacheLocalProducto(producto: ProductoTienda) {
  if (typeof window === 'undefined') return;
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_PRODUCTOS_KEY);
    let list: ProductoTienda[] = local ? JSON.parse(local) : [...PRODUCTOS_INICIALES_TIENDA];
    const index = list.findIndex((p) => p.id === producto.id);
    if (index >= 0) {
      list[index] = producto;
    } else {
      list.unshift(producto);
    }
    localStorage.setItem(LOCAL_STORAGE_PRODUCTOS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error actualizando cache local de productos:', e);
  }
}

/**
 * Eliminar producto (Admin)
 */
export async function eliminarProductoTienda(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('tienda_productos').delete().eq('id', id);
    } catch (err) {
      console.warn('Error eliminando producto en Supabase:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_PRODUCTOS_KEY);
      if (local) {
        const list: ProductoTienda[] = JSON.parse(local);
        const filtered = list.filter((p) => p.id !== id);
        localStorage.setItem(LOCAL_STORAGE_PRODUCTOS_KEY, JSON.stringify(filtered));
      }
    } catch (e) {
      console.error('Error eliminando de localStorage:', e);
    }
  }

  return true;
}

/**
 * Obtener todos los pedidos
 */
export async function getPedidosTienda(): Promise<PedidoTienda[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tienda_pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as PedidoTienda[];
      }
    } catch (err) {
      console.warn('Error leyendo pedidos en Supabase:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(LOCAL_STORAGE_PEDIDOS_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error('Error parseando pedidos:', e);
      }
    }
  }

  return [];
}

/**
 * Guardar un nuevo pedido realizado
 */
export async function crearPedidoTienda(
  pedido: Omit<PedidoTienda, 'id' | 'codigo_pedido' | 'created_at'>
): Promise<PedidoTienda> {
  const codigo = `RON-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
  const nuevoPedido: PedidoTienda = {
    ...pedido,
    id: `ped-${Date.now()}`,
    codigo_pedido: codigo,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('tienda_pedidos')
        .insert(nuevoPedido)
        .select()
        .single();

      if (!error && data) {
        guardarPedidoEnLocal(data as PedidoTienda);
        return data as PedidoTienda;
      }
    } catch (err) {
      console.warn('Error guardando pedido en Supabase:', err);
    }
  }

  guardarPedidoEnLocal(nuevoPedido);
  return nuevoPedido;
}

function guardarPedidoEnLocal(pedido: PedidoTienda) {
  if (typeof window === 'undefined') return;
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_PEDIDOS_KEY);
    const list: PedidoTienda[] = local ? JSON.parse(local) : [];
    list.unshift(pedido);
    localStorage.setItem(LOCAL_STORAGE_PEDIDOS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error guardando pedido en localStorage:', e);
  }
}

/**
 * Actualizar estado de pedido
 */
export async function actualizarEstadoPedido(
  id: string,
  estado: EstadoPedidoTienda
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('tienda_pedidos')
        .update({ estado, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (err) {
      console.warn('Error actualizando pedido en Supabase:', err);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(LOCAL_STORAGE_PEDIDOS_KEY);
      if (local) {
        const list: PedidoTienda[] = JSON.parse(local);
        const idx = list.findIndex((p) => p.id === id);
        if (idx >= 0) {
          list[idx].estado = estado;
          list[idx].updated_at = new Date().toISOString();
          localStorage.setItem(LOCAL_STORAGE_PEDIDOS_KEY, JSON.stringify(list));
        }
      }
    } catch (e) {
      console.error('Error en localStorage pedidos:', e);
    }
  }

  return true;
}

/**
 * Genera el mensaje estructurado para WhatsApp con el pedido listo
 */
export function generarMensajeWhatsAppPedido(pedido: PedidoTienda): string {
  const lineasItems = pedido.items
    .map((item, idx) => {
      let variante = '';
      if (item.talleSeleccionado) variante += ` [Talle: ${item.talleSeleccionado}]`;
      if (item.colorSeleccionado) variante += ` [Color: ${item.colorSeleccionado}]`;
      return `${idx + 1}. *${item.producto.titulo}*${variante}\n   • Cantidad: ${item.cantidad} x $${item.precioFinalUnitario.toLocaleString('es-AR')} = *$${item.subtotal.toLocaleString('es-AR')}*`;
    })
    .join('\n\n');

  let entregaTexto =
    pedido.metodo_entrega === 'retiro_biblioteca'
      ? '🏛️ Retiro en Sede (Belgrano 450, Alcira Gigena)'
      : `🚚 Envío a domicilio:\n   Dirección: ${pedido.direccion_envio || 'A coordinar'} (${pedido.localidad || 'Alcira Gigena'})`;

  let beneficioProtector = '';
  if (pedido.tipo_protector_aplicado && pedido.tipo_protector_aplicado !== 'ninguno') {
    beneficioProtector = `🎖️ *Beneficio Socio Protector (${pedido.tipo_protector_aplicado}):* -$${pedido.descuento_protector.toLocaleString('es-AR')}\n`;
  }

  const mensaje = `🏛️ *NUEVO PEDIDO - TIENDA BIBLIOTECA RONCEDO*
═══════════════════════════
📋 *Código de Pedido:* ${pedido.codigo_pedido}
👤 *Cliente:* ${pedido.nombre_cliente}
📱 *WhatsApp:* ${pedido.telefono_whatsapp}
${pedido.email_cliente ? `✉️ *Email:* ${pedido.email_cliente}\n` : ''}${pedido.dni_cliente ? `🪪 *DNI:* ${pedido.dni_cliente}\n` : ''}
📍 *Forma de Entrega:*
${entregaTexto}

📦 *DETALLE DE PRODUCTOS:*
${lineasItems}

═══════════════════════════
${beneficioProtector}💰 *TOTAL A ABONAR:* *$${pedido.total_final.toLocaleString('es-AR')}*
💳 *Medio de Pago preferido:* ${
    pedido.metodo_pago === 'transferencia'
      ? 'Transferencia Bancaria (Alias: BIBLIOTECA.RONCEDO.MP)'
      : pedido.metodo_pago === 'mercadopago'
      ? 'Mercado Pago'
      : 'A coordinar por WhatsApp'
  }
${pedido.notas ? `\n📝 *Notas adicionales:* ${pedido.notas}` : ''}
═══════════════════════════
_Hola, envío el comprobante / confirmación de mi pedido realizado en la web oficial de la Biblioteca Roncedo. Aguardo confirmación._`;

  return mensaje;
}

/**
 * Genera la URL directa a WhatsApp con el pedido
 */
export function getWhatsAppPedidoUrl(pedido: PedidoTienda): string {
  const mensaje = generarMensajeWhatsAppPedido(pedido);
  return `https://wa.me/${CONTACTO_BIBLIOTECA.whatsappNumero}?text=${encodeURIComponent(mensaje)}`;
}
