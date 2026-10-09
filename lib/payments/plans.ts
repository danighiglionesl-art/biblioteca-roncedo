import { PlanSocioProtector } from './types';
import { TipoSocioProtector } from '@/types';

export const MEDALLAS_SOCIO_PROTECTOR: Record<
  TipoSocioProtector,
  {
    medalla: string;
    insignia: string;
    color: string;
    border: string;
    bgBadge: string;
    label: string;
    descuento: string;
    prestamos: string;
  }
> = {
  Bronce: {
    medalla: '/images/socio-protector/medalla-bronce.png',
    insignia: '/images/socio-protector/insignia-bronce.png',
    color: '#B8652A',
    border: 'border-amber-700/30',
    bgBadge: 'bg-amber-100 text-amber-900 border-amber-300',
    label: 'Bronce',
    descuento: '2% de descuento',
    prestamos: 'Hasta 4 libros al año',
  },
  Plata: {
    medalla: '/images/socio-protector/medalla-plata.png',
    insignia: '/images/socio-protector/insignia-plata.png',
    color: '#8A99A8',
    border: 'border-slate-400/30',
    bgBadge: 'bg-slate-200 text-slate-800 border-slate-300',
    label: 'Plata',
    descuento: '5% de descuento',
    prestamos: 'Hasta 10 libros al año',
  },
  Oro: {
    medalla: '/images/socio-protector/medalla-oro.png',
    insignia: '/images/socio-protector/insignia-oro.png',
    color: '#D4AF37',
    border: 'border-yellow-500/40',
    bgBadge: 'bg-amber-50 text-amber-900 border-yellow-400',
    label: 'Oro',
    descuento: '10% de descuento',
    prestamos: 'Sin límites',
  },
};

export const PLANES_SOCIO_PROTECTOR: PlanSocioProtector[] = [
  {
    id: 'protector-bronce',
    tipo: 'Bronce',
    nombre: 'SOCIO PROTECTOR BRONCE',
    monto: 2000,
    periodo: 'por mes',
    descripcion: 'Aporte base para apoyar las compras regulares de nuevos libros y material infantil.',
    mercadoPagoUrl: 'https://mpago.la/1bJ23bK',
    destacado: false,
    imagenMedalla: '/images/socio-protector/medalla-bronce.png',
    imagenInsignia: '/images/socio-protector/insignia-bronce.png',
    descuentoComprasEventos: '2%',
    limitePrestamos: 'Hasta 4 libros al año',
    beneficios: [
      '2% de descuento en compras y eventos publicados',
      'Préstamos de hasta 4 libros al año',
      'Medalla Bronce y reconocimiento oficial "Socio Protector ❤️"',
      'Acceso al boletín digital y rendiciones semestrales',
      'Débito automático mensual simple y seguro vía Mercado Pago',
    ],
  },
  {
    id: 'protector-plata',
    tipo: 'Plata',
    nombre: 'SOCIO PROTECTOR PLATA',
    monto: 5000,
    periodo: 'por mes',
    descripcion: 'Aporte intermedio que impulsa talleres, eventos culturales y conservación histórica.',
    mercadoPagoUrl: 'https://mpago.la/24Q9V82',
    destacado: true,
    imagenMedalla: '/images/socio-protector/medalla-plata.png',
    imagenInsignia: '/images/socio-protector/insignia-plata.png',
    descuentoComprasEventos: '5%',
    limitePrestamos: 'Hasta 10 libros al año',
    beneficios: [
      '5% de descuento en compras y eventos publicados',
      'Préstamos de hasta 10 libros al año',
      'Medalla Plata y distinción destacada en carnet digital',
      'Prioridad de reserva en talleres literarios y actividades del club',
      'Aporte al fondo de digitalización de actas y fotos antiguas',
      'Débito automático mensual simple y seguro vía Mercado Pago',
    ],
  },
  {
    id: 'protector-oro',
    tipo: 'Oro',
    nombre: 'SOCIO PROTECTOR ORO',
    monto: 10000,
    periodo: 'por mes',
    descripcion: 'Máximo aporte solidario para obras de infraestructura, equipamiento y patrimonio de Alcira Gigena.',
    mercadoPagoUrl: 'https://mpago.la/2VSZx8G',
    destacado: false,
    imagenMedalla: '/images/socio-protector/medalla-oro.png',
    imagenInsignia: '/images/socio-protector/insignia-oro.png',
    descuentoComprasEventos: '10%',
    limitePrestamos: 'Préstamos de libros sin límites',
    beneficios: [
      '10% de descuento en compras y eventos publicados',
      'Préstamos de libros sin límites',
      'Medalla Oro y máxima distinción de honor institucional',
      'Mención de honor en la memoria institucional anual',
      'Acceso preferencial a presentaciones de libros y galas culturales',
      'Débito automático mensual simple y seguro vía Mercado Pago',
    ],
  },
];

export function obtenerPlanPorMonto(monto?: number): PlanSocioProtector | undefined {
  if (!monto) return undefined;
  return PLANES_SOCIO_PROTECTOR.find(p => p.monto === monto);
}

export function obtenerPlanPorTipo(tipo?: string): PlanSocioProtector | undefined {
  if (!tipo) return undefined;
  return PLANES_SOCIO_PROTECTOR.find(p => p.tipo.toLowerCase() === tipo.toLowerCase());
}

export function obtenerMedallaProtector(tipo?: TipoSocioProtector | string) {
  if (!tipo) return undefined;
  const normalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
  return (MEDALLAS_SOCIO_PROTECTOR as any)[normalizado];
}
