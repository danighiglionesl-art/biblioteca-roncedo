import { LibroFisico } from '@/types';

export const STORAGE_KEY_TOPOGRAFIAS = 'roncedo_topografias_custom_v1';

/**
 * Topografías y Secciones oficiales y más frecuentes de la Biblioteca Roncedo
 */
export const TOPOGRAFIAS_PREDEFINIDAS: string[] = [
  'LITERATURA',
  'COLECCIÓN ORIGINAL',
  'LITERATURA INFANTIL',
  'PSICOLOGIA',
  'HISTORIA',
  'DEPORTES',
  'INFANTIL',
  'Inaug. Sede',
  'CUENTOS',
  'NOVELAS',
  'POESIAS',
  'LITERATURA JUVENIL',
  'HISTORIA ARGENTINA',
  'HISTORIA DE CORDOBA',
  'HISTORIA LOCAL Y REGIONAL',
  'COLECCIÓN LOCAL',
  'FUTBOL',
  'EDUCACION',
  'RELIGION',
  'AUTOAYUDA',
  'ARTE',
  'SOCIOLOGIA',
  'CIENCIAS SOCIALES',
  'CIENCIAS NATURALES',
  'BIOLOGIA',
  'MEDICINA Y SALUD',
  'DERECHO',
  'ECONOMIA',
  'POLITICA',
  'TEATRO',
  'ENSAYOS',
  'BIOGRAFIAS',
  'MANUALIDADES',
];

/**
 * Extrae la sección principal de una cadena de topografía (ej: "LITERATURA / NOVELAS" -> "LITERATURA")
 */
export function extraerSeccionPrincipal(topografia?: string): string {
  if (!topografia) return '';
  const limpia = topografia.trim();
  if (limpia.includes('/')) {
    return limpia.split('/')[0].trim();
  }
  return limpia;
}

/**
 * Extrae la subsección o estante de una topografía (ej: "LITERATURA / NOVELAS" -> "NOVELAS")
 */
export function extraerSubseccion(topografia?: string): string {
  if (!topografia) return '';
  const limpia = topografia.trim();
  if (limpia.includes('/')) {
    const partes = limpia.split('/');
    partes.shift();
    return partes.join('/').trim();
  }
  return '';
}

/**
 * Compone la topografía completa a partir de la sección y subsección
 */
export function componerTopografia(seccion: string, subseccion?: string): string {
  const sec = seccion.trim();
  const sub = (subseccion || '').trim();
  if (!sec) return sub;
  if (!sub) return sec;
  return `${sec} / ${sub}`;
}

/**
 * Obtiene las topografías personalizadas guardadas en el navegador
 */
export function getTopografiasPersonalizadas(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TOPOGRAFIAS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo topografias personalizadas:', e);
  }
  return [];
}

/**
 * Guarda las topografías personalizadas
 */
export function guardarTopografiasPersonalizadas(lista: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TOPOGRAFIAS, JSON.stringify(lista));
  } catch (e) {
    console.error('Error guardando topografias personalizadas:', e);
  }
}

export const STORAGE_KEY_TOPOGRAFIAS_ELIMINADAS = 'roncedo_topografias_eliminadas_v1';

/**
 * Obtiene las topografías eliminadas u ocultas por el administrador
 */
export function getTopografiasEliminadas(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TOPOGRAFIAS_ELIMINADAS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo topografias eliminadas:', e);
  }
  return [];
}

/**
 * Guarda las topografías eliminadas u ocultas
 */
export function guardarTopografiasEliminadas(lista: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_TOPOGRAFIAS_ELIMINADAS, JSON.stringify(lista));
  } catch (e) {
    console.error('Error guardando topografias eliminadas:', e);
  }
}

/**
 * Unifica y ordena todas las secciones/topografías disponibles a partir del catálogo
 * y de las secciones personalizadas agregadas por el administrador.
 */
export function unificarListaTopografias(
  libros: LibroFisico[],
  personalizadas: string[] = [],
  eliminadas: string[] = []
): string[] {
  const setTopografias = new Set<string>();
  const setEliminadas = new Set(eliminadas.map((e) => e.trim().toLowerCase()));

  // 1. Agregar predefinidas prioritarias si no fueron eliminadas
  TOPOGRAFIAS_PREDEFINIDAS.forEach((top) => {
    if (!setEliminadas.has(top.toLowerCase())) {
      setTopografias.add(top);
    }
  });

  // 2. Agregar personalizadas creadas por el admin si no fueron eliminadas
  personalizadas.forEach((top) => {
    if (top && top.trim() && !setEliminadas.has(top.trim().toLowerCase())) {
      setTopografias.add(top.trim());
    }
  });

  // 3. Agregar secciones existentes en el catálogo de libros físicos (siempre visibles si tienen libros)
  libros.forEach((libro) => {
    const sec = extraerSeccionPrincipal(libro.topografia_ubicacion);
    if (sec) {
      setTopografias.add(sec);
    }
  });

  // Ordenar: primero las más frecuentes / estándar, luego alfabéticamente
  const counts: Record<string, number> = {};
  libros.forEach((l) => {
    const sec = extraerSeccionPrincipal(l.topografia_ubicacion);
    if (sec) {
      counts[sec] = (counts[sec] || 0) + 1;
    }
  });

  const array = Array.from(setTopografias);
  array.sort((a, b) => {
    const countA = counts[a] || 0;
    const countB = counts[b] || 0;
    // Si ambos tienen libros, ordenar por cantidad descendente
    if (countA > 0 || countB > 0) {
      if (countA !== countB) return countB - countA;
    }
    return a.localeCompare(b, 'es', { sensitivity: 'base' });
  });

  return array;
}

