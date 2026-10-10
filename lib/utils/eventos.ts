import { EventoTaller, TipoSocioProtector } from '@/types';
import { formatFechaArgentina } from '@/lib/utils';

export interface LiquidacionTarifa {
  esGratuito: boolean;
  montoBase: number;
  descuentoPorcentaje: number;
  montoDescuento: number;
  montoFinal: number;
  etiquetaTramo: string;
  fechaLimiteTramo?: string;
  hayAumentoProximo: boolean;
  proximoPrecio?: number;
  proximaFechaLimite?: string;
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 */
export function getFechaHoyISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula la tarifa vigente para un evento según la fecha de inscripción
 * y el nivel de Socio Protector (Bronce 2%, Plata 5%, Oro 10% por defecto)
 */
export function calcularTarifaVigente(
  evento: EventoTaller,
  tipoProtector?: TipoSocioProtector | 'no_socio' | null,
  fechaReferencia: string = getFechaHoyISO()
): LiquidacionTarifa {
  if (evento.es_gratuito) {
    return {
      esGratuito: true,
      montoBase: 0,
      descuentoPorcentaje: 0,
      montoDescuento: 0,
      montoFinal: 0,
      etiquetaTramo: 'Actividad Gratuita',
      hayAumentoProximo: false,
    };
  }

  // Ordenar tramos por fecha_limite ascendente
  const tramos = Array.isArray(evento.tramos_precio)
    ? [...evento.tramos_precio].sort((a, b) => a.fecha_limite.localeCompare(b.fecha_limite))
    : [];

  let montoBase = evento.precio_base || 0;
  let etiquetaTramo = 'Precio General';
  let fechaLimiteTramo: string | undefined = undefined;
  let hayAumentoProximo = false;
  let proximoPrecio: number | undefined = undefined;
  let proximaFechaLimite: string | undefined = undefined;

  // Buscar el primer tramo cuya fecha_limite sea mayor o igual a la fecha de hoy
  const tramoIndex = tramos.findIndex((t) => t.fecha_limite >= fechaReferencia);

  if (tramoIndex !== -1) {
    const tramoActivo = tramos[tramoIndex];
    montoBase = tramoActivo.precio;
    etiquetaTramo = tramoActivo.etiqueta || `Vigente hasta ${formatFechaArgentina(tramoActivo.fecha_limite)}`;
    fechaLimiteTramo = tramoActivo.fecha_limite;

    // Verificar si hay un siguiente tramo que aumente el precio
    if (tramoIndex + 1 < tramos.length) {
      const siguiente = tramos[tramoIndex + 1];
      hayAumentoProximo = true;
      proximoPrecio = siguiente.precio;
      proximaFechaLimite = siguiente.fecha_limite;
    } else if (evento.precio_base && evento.precio_base > montoBase) {
      hayAumentoProximo = true;
      proximoPrecio = evento.precio_base;
    }
  } else if (tramos.length > 0) {
    // Si todos los tramos de fecha ya vencieron, se toma el precio_base general
    montoBase = evento.precio_base || tramos[tramos.length - 1].precio;
    etiquetaTramo = 'Precio Regular (Inscripción General)';
  }

  // Determinar descuento según nivel de Socio Protector
  let descuentoPorcentaje = 0;
  if (tipoProtector === 'Bronce') {
    descuentoPorcentaje = evento.descuento_bronce_porcentaje ?? 2;
  } else if (tipoProtector === 'Plata') {
    descuentoPorcentaje = evento.descuento_plata_porcentaje ?? 5;
  } else if (tipoProtector === 'Oro') {
    descuentoPorcentaje = evento.descuento_oro_porcentaje ?? 10;
  }

  const montoDescuento = Math.round((montoBase * descuentoPorcentaje) / 100);
  const montoFinal = Math.max(0, montoBase - montoDescuento);

  return {
    esGratuito: false,
    montoBase,
    descuentoPorcentaje,
    montoDescuento,
    montoFinal,
    etiquetaTramo,
    fechaLimiteTramo,
    hayAumentoProximo,
    proximoPrecio,
    proximaFechaLimite,
  };
}

/**
 * Genera un código de verificación institucional para el certificado de asistencia
 */
export function generarCodigoCertificado(eventoId: string, userId: string): string {
  const shortEvento = (eventoId || 'EV').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  const shortUser = (userId || 'US').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const anio = new Date().getFullYear();
  return `RONCEDO-${anio}-${shortEvento}-${shortUser}-${randomSuffix}`;
}
