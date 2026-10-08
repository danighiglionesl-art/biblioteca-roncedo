import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { ActaHistorica, FolioArchivo } from '@/types';
import { ACTAS_HISTORICAS_INICIALES, FOLIOS_INICIALES } from '@/lib/data/actasIniciales';

const LOCAL_STORAGE_ACTAS_KEY = 'roncedo_actas_historicas_v1';
const LOCAL_STORAGE_FOLIOS_KEY = 'roncedo_actas_folios_v1';

/**
 * Obtiene la lista de actas institucionales.
 * Prioriza Supabase y si no está configurado usa LocalStorage con fallback a la base inicial curada.
 */
export async function getActasHistoricas(): Promise<ActaHistorica[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('actas_historicas')
        .select('*')
        .order('numero_acta', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as ActaHistorica[];
      }
    } catch (e) {
      console.warn('Fallback a catálogo de actas local:', e);
    }
  }

  // Fallback a LocalStorage o datos iniciales
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ACTAS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error leyendo actas locales:', e);
    }
  }

  return ACTAS_HISTORICAS_INICIALES;
}

/**
 * Obtiene el catálogo completo de folios escaneados (102 páginas).
 */
export async function getFoliosArchivo(): Promise<FolioArchivo[]> {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_FOLIOS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error leyendo folios locales:', e);
    }
  }

  return FOLIOS_INICIALES;
}

/**
 * Guarda o actualiza un acta histórica.
 * REGLA ESTRICTA DE PERMISOS: Solo el Administrador puede gestionar actas.
 */
export async function saveActaHistorica(
  acta: Partial<ActaHistorica> & { id?: string; titulo: string; numero_acta: number | string },
  userRole?: string
): Promise<{ success: boolean; data?: ActaHistorica; error?: string }> {
  // Validación de seguridad de rol
  if (userRole !== 'admin') {
    return {
      success: false,
      error: 'Acceso Denegado: Únicamente los usuarios con rol de Administrador pueden gestionar o modificar actas del archivo.',
    };
  }

  const existingActas = await getActasHistoricas();
  const isEditing = Boolean(acta.id && existingActas.some((a) => a.id === acta.id));

  const actaCompleta: ActaHistorica = {
    id: acta.id || `acta-manual-${Date.now()}`,
    numero_acta: acta.numero_acta,
    libro: acta.libro || 'Libro N° 1 de Actas',
    folio_inicio: acta.folio_inicio || 1,
    folio_fin: acta.folio_fin || 1,
    pagina_archivo_inicio: Number(acta.pagina_archivo_inicio) || 1,
    pagina_archivo_fin: Number(acta.pagina_archivo_fin) || Number(acta.pagina_archivo_inicio) || 1,
    fecha: acta.fecha || new Date().toISOString().split('T')[0],
    anio: acta.anio || (acta.fecha ? parseInt(acta.fecha.substring(0, 4), 10) : 1926),
    titulo: acta.titulo,
    tipo_reunion: acta.tipo_reunion || 'Reunión de Comisión Directiva',
    lugar: acta.lugar || 'Alcira Gigena, Córdoba',
    asistentes_count: acta.asistentes_count || 10,
    resumen: acta.resumen || '',
    transcripcion_completa: acta.transcripcion_completa || '',
    firmantes: acta.firmantes || [],
    temas_tratados: acta.temas_tratados || [],
    archivos: acta.archivos && acta.archivos.length > 0 ? acta.archivos : [`Libro Nb0 1-${acta.pagina_archivo_inicio || 1}.jpg`],
    imagenes_urls:
      acta.imagenes_urls && acta.imagenes_urls.length > 0
        ? acta.imagenes_urls
        : [`/api/actas/image?file=${encodeURIComponent(acta.archivos?.[0] || `Libro Nb0 1-${acta.pagina_archivo_inicio || 1}.jpg`)}`],
    estado_conservacion: acta.estado_conservacion || 'Excelente',
    es_destacada: Boolean(acta.es_destacada),
    notas_archivista: acta.notas_archivista || '',
    created_at: acta.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Guardar en Supabase si está disponible
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('actas_historicas')
        .upsert(actaCompleta)
        .select()
        .single();

      if (!error && data) {
        return { success: true, data: data as ActaHistorica };
      }
    } catch (e: any) {
      console.warn('Fallo guardado en Supabase, persistiendo en LocalStorage:', e.message);
    }
  }

  // Persistir en LocalStorage
  try {
    let updatedList: ActaHistorica[];
    if (isEditing) {
      updatedList = existingActas.map((a) => (a.id === actaCompleta.id ? actaCompleta : a));
    } else {
      updatedList = [actaCompleta, ...existingActas];
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_ACTAS_KEY, JSON.stringify(updatedList));
    }

    return { success: true, data: actaCompleta };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error guardando acta' };
  }
}

/**
 * Elimina un acta histórica.
 * REGLA ESTRICTA DE PERMISOS: Solo el Administrador puede eliminar actas.
 */
export async function deleteActaHistorica(
  id: string,
  userRole?: string
): Promise<{ success: boolean; error?: string }> {
  if (userRole !== 'admin') {
    return {
      success: false,
      error: 'Acceso Denegado: Solo el Administrador puede eliminar registros del archivo histórico.',
    };
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('actas_historicas').delete().eq('id', id);
    } catch (e) {
      console.warn('Error borrando en Supabase:', e);
    }
  }

  try {
    const existing = await getActasHistoricas();
    const filtered = existing.filter((a) => a.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_ACTAS_KEY, JSON.stringify(filtered));
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error eliminando acta' };
  }
}

/**
 * Restaura el archivo digital a su estado original inicial.
 * Solo Administrador.
 */
export async function restablecerActasOriginales(userRole?: string): Promise<{ success: boolean; error?: string }> {
  if (userRole !== 'admin') {
    return { success: false, error: 'Solo el Administrador puede reiniciar los datos del archivo.' };
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_ACTAS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_FOLIOS_KEY);
  }

  return { success: true };
}
