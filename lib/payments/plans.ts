import { PlanSocioProtector } from './types';

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
    beneficios: [
      'Insignia oficial "Socio Protector ❤️" en tu carnet digital',
      'Reconocimiento institucional como colaborador de la cultura',
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
    beneficios: [
      'Insignia oficial "Socio Protector ❤️" en tu carnet digital',
      'Prioridad de reserva en talleres literarios y actividades del club',
      'Participación destacada en eventos y muestras patrimoniales',
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
    beneficios: [
      'Insignia oficial "Socio Protector ❤️" en tu carnet digital',
      'Mención de honor en la memoria institucional anual',
      'Acceso preferencial a presentaciones de libros y galas culturales',
      'Financiamiento directo de proyectos de innovación bibliotecaria',
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
