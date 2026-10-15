import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { LibroFisico } from '@/types';
import LIBROS_RAW from '@/lib/data/librosFisicos.json';

export const LOCAL_STORAGE_LIBROS_KEY = 'roncedo_libros_fisicos_v4';

const RAW_MAP_BY_ID = new Map((LIBROS_RAW as any[]).map((r) => [r.id, r]));
const RAW_MAP_BY_INV = new Map((LIBROS_RAW as any[]).map((r) => [Number(r.numero_inventario), r]));

/**
 * Normaliza un objeto de libro físico para asegurar compatibilidad de esquema
 */
export function normalizarLibro(l: any): LibroFisico {
  const rawFallback = RAW_MAP_BY_ID.get(l.id) || RAW_MAP_BY_INV.get(Number(l.numero_inventario));
  const portadaFinal =
    (l.portada_url && String(l.portada_url).trim()) ||
    (rawFallback?.portada_url && String(rawFallback.portada_url).trim()) ||
    '';

  return {
    id: String(l.id || `libro-${l.numero_inventario || Date.now()}`),
    numero_inventario: Number(l.numero_inventario),
    anio_incorporacion: l.anio_incorporacion !== undefined && l.anio_incorporacion !== null ? String(l.anio_incorporacion) : '',
    autor: String(l.autor || 'Autor Desconocido').trim(),
    titulo: String(l.titulo || 'Sin Título').trim(),
    edicion_anio: l.edicion_anio !== undefined && l.edicion_anio !== null ? String(l.edicion_anio) : '',
    lugar: l.lugar ? String(l.lugar) : '',
    editorial: l.editorial ? String(l.editorial) : '',
    procedencia: l.procedencia ? String(l.procedencia) : 'Donación',
    donante_o_detalle: l.donante_o_detalle ? String(l.donante_o_detalle) : '',
    topografia_ubicacion: l.topografia_ubicacion ? String(l.topografia_ubicacion) : '',
    isbn: l.isbn ? String(l.isbn) : rawFallback?.isbn || undefined,
    portada_url: portadaFinal,
    estado_portada: l.estado_portada || (portadaFinal ? 'aprobada' : (rawFallback?.estado_portada || 'sin_portada')),
    portada_fuente: l.portada_fuente || (portadaFinal ? (rawFallback?.portada_fuente || 'manual') : 'ninguna'),
    portada_confianza: l.portada_confianza || (portadaFinal ? (rawFallback?.portada_confianza || 'alta') : 'ninguna'),
    portada_detalles: l.portada_detalles || (rawFallback?.portada_detalles || ''),
    estado: l.estado === 'prestado' ? 'prestado' : 'disponible',
    prestado_a: l.prestado_a || undefined,
    lista_espera: Array.isArray(l.lista_espera) ? l.lista_espera : [],
    categoria: l.categoria ? String(l.categoria) : rawFallback?.categoria || undefined,
    sinopsis: l.sinopsis ? String(l.sinopsis) : rawFallback?.sinopsis || undefined,
  };
}

/**
 * Obtiene todos los libros físicos.
 * Prioriza la nube (Supabase) con paginación transparente para catálogos masivos (>1000 libros).
 * Si Supabase está disponible:
 * - Recupera el inventario completo.
 * - Detecta y sube automáticamente libros que existan solo en el almacenamiento local del navegador
 *   (garantizando que ejemplares como el N° 1384 se migren inmediatamente a la nube).
 * - Sincroniza y actualiza la caché de localStorage para rendimiento y soporte offline.
 */
export async function getLibrosFisicos(): Promise<LibroFisico[]> {
  // 1. Intentar cargar desde Supabase si está disponible
  if (isSupabaseConfigured && supabase) {
    try {
      let librosNube: LibroFisico[] = [];
      let desde = 0;
      const CHUNK_SIZE = 1000; // Supera el límite estándar de PostgREST
      let masRegistros = true;
      let huboError = false;

      while (masRegistros) {
        const { data, error } = await supabase
          .from('libros_fisicos')
          .select('*')
          .order('numero_inventario', { ascending: true })
          .range(desde, desde + CHUNK_SIZE - 1);

        if (error) {
          huboError = true;
          // Si la tabla aún no existe o hay error de esquema, salimos al fallback
          console.warn('[LibrosFisicos] Error o tabla ausente en Supabase:', error.message);
          break;
        }

        if (data && data.length > 0) {
          librosNube = librosNube.concat(data.map(normalizarLibro));
          if (data.length < CHUNK_SIZE) {
            masRegistros = false;
          } else {
            desde += CHUNK_SIZE;
          }
        } else {
          masRegistros = false;
        }
      }

      // Si la tabla existe en Supabase y no hubo error de conexión/esquema
      if (!huboError) {
        if (typeof window !== 'undefined') {
          try {
            const localRaw = localStorage.getItem(LOCAL_STORAGE_LIBROS_KEY);
            let localList: LibroFisico[] = [];
            if (localRaw) {
              const parsed = JSON.parse(localRaw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                localList = parsed.map(normalizarLibro);
              }
            }
            if (localList.length === 0) {
              localList = (LIBROS_RAW as any[]).map(normalizarLibro);
            }

            // Caso A: La tabla en Supabase está recién creada (0 registros).
            // Sembramos el catálogo completo en la nube de fondo para dejarlo activo.
            if (librosNube.length === 0) {
              console.info(
                `[Auto-Sync Nube] Tabla libros_fisicos vacía detectada. Sincronizando catálogo completo inicial (${localList.length} libros)...`
              );
              sincronizarLoteLibrosEnNube(localList).catch((err) =>
                console.warn('[Auto-Sync Nube] Error sembrando inventario inicial:', err)
              );
              return localList;
            }

            // Caso B: Supabase ya tiene libros. Comprobar si en este navegador hay libros locales faltantes en la nube (ej: 1384)
            const invNubeSet = new Set(librosNube.map((l) => l.numero_inventario));
            const librosLocalesFaltantesEnNube = localList.filter(
              (l) => l.numero_inventario && !invNubeSet.has(l.numero_inventario)
            );

            if (librosLocalesFaltantesEnNube.length > 0) {
              console.info(
                `[Auto-Sync Nube] Se detectaron ${librosLocalesFaltantesEnNube.length} libros locales no presentes en Supabase (ej: libro ${librosLocalesFaltantesEnNube[0].numero_inventario}). Subiendo ahora...`
              );
              for (const libroFaltante of librosLocalesFaltantesEnNube) {
                await guardarLibroFisicoEnNube(libroFaltante);
                librosNube.push(normalizarLibro(libroFaltante));
              }
              librosNube.sort((a, b) => a.numero_inventario - b.numero_inventario);
            }

            // Actualizar la caché de localStorage con el estado de la nube
            localStorage.setItem(LOCAL_STORAGE_LIBROS_KEY, JSON.stringify(librosNube));
          } catch (syncErr) {
            console.warn('[LibrosFisicos] Error en auto-sync local a nube:', syncErr);
          }
        }

        if (librosNube.length > 0) {
          return librosNube;
        }
      }
    } catch (err) {
      console.warn('[LibrosFisicos] Fallo al consultar Supabase, usando fallback local:', err);
    }
  }

  // 2. Fallback: LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_LIBROS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizarLibro);
        }
      }
    } catch (localErr) {
      console.warn('[LibrosFisicos] Error al leer localStorage:', localErr);
    }
  }

  // 3. Fallback Inicial: archivo JSON curado
  return (LIBROS_RAW as any[]).map(normalizarLibro);
}

/**
 * Guarda o inserta un libro físico directamente en Supabase
 */
export async function guardarLibroFisicoEnNube(libro: LibroFisico): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase no está configurado.' };
  }

  try {
    const payload = {
      id: libro.id,
      numero_inventario: libro.numero_inventario,
      anio_incorporacion: String(libro.anio_incorporacion || ''),
      autor: libro.autor,
      titulo: libro.titulo,
      edicion_anio: libro.edicion_anio ? String(libro.edicion_anio) : null,
      lugar: libro.lugar || null,
      editorial: libro.editorial || null,
      procedencia: libro.procedencia || 'Donación',
      donante_o_detalle: libro.donante_o_detalle || null,
      topografia_ubicacion: libro.topografia_ubicacion || null,
      isbn: libro.isbn || null,
      portada_url: libro.portada_url || null,
      estado_portada: libro.estado_portada || 'sin_portada',
      portada_fuente: libro.portada_fuente || 'ninguna',
      portada_confianza: libro.portada_confianza || 'ninguna',
      portada_detalles: libro.portada_detalles || null,
      estado: libro.estado || 'disponible',
      prestado_a: libro.prestado_a || null,
      lista_espera: libro.lista_espera || [],
      categoria: libro.categoria || null,
      sinopsis: libro.sinopsis || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('libros_fisicos').upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('[LibrosFisicos] Error en upsert Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[LibrosFisicos] Excepción guardando en nube:', err);
    return { success: false, error: err.message || 'Error de conexión' };
  }
}

/**
 * Actualiza campos específicos de un libro físico en Supabase
 */
export async function actualizarLibroFisicoEnNube(
  id: string,
  datos: Partial<LibroFisico>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase no está configurado.' };
  }

  try {
    const payload: any = {
      ...datos,
      updated_at: new Date().toISOString(),
    };

    // Asegurar compatibilidad de tipos
    if (datos.anio_incorporacion !== undefined) payload.anio_incorporacion = String(datos.anio_incorporacion);
    if (datos.edicion_anio !== undefined) payload.edicion_anio = String(datos.edicion_anio);

    if (datos.portada_url && !datos.estado_portada) {
      payload.estado_portada = 'aprobada';
    }

    let query = supabase.from('libros_fisicos').update(payload);
    if (id) {
      query = query.eq('id', id);
    } else if (datos.numero_inventario) {
      query = query.eq('numero_inventario', Number(datos.numero_inventario));
    }

    const { error } = await query;

    if (error) {
      console.error('[LibrosFisicos] Error en update Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[LibrosFisicos] Excepción actualizando en nube:', err);
    return { success: false, error: err.message || 'Error de conexión' };
  }
}

/**
 * Elimina un libro físico de Supabase
 */
export async function eliminarLibroFisicoDeNube(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase no está configurado.' };
  }

  try {
    const { error } = await supabase.from('libros_fisicos').delete().eq('id', id);

    if (error) {
      console.error('[LibrosFisicos] Error en delete Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[LibrosFisicos] Excepción eliminando de nube:', err);
    return { success: false, error: err.message || 'Error de conexión' };
  }
}

/**
 * Sube un lote masivo de libros físicos a Supabase (ideal para inicialización o sincronización total)
 */
export async function sincronizarLoteLibrosEnNube(
  libros: LibroFisico[],
  onProgress?: (actual: number, total: number) => void
): Promise<{ success: boolean; insertados: number; errores: string[] }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, insertados: 0, errores: ['Supabase no está configurado.'] };
  }

  const BATCH_SIZE = 50;
  let insertados = 0;
  const errores: string[] = [];

  for (let i = 0; i < libros.length; i += BATCH_SIZE) {
    const batch = libros.slice(i, i + BATCH_SIZE).map((l) => ({
      id: l.id,
      numero_inventario: Number(l.numero_inventario),
      anio_incorporacion: String(l.anio_incorporacion || ''),
      autor: l.autor,
      titulo: l.titulo,
      edicion_anio: l.edicion_anio ? String(l.edicion_anio) : null,
      lugar: l.lugar || null,
      editorial: l.editorial || null,
      procedencia: l.procedencia || 'Donación',
      donante_o_detalle: l.donante_o_detalle || null,
      topografia_ubicacion: l.topografia_ubicacion || null,
      isbn: l.isbn || null,
      portada_url: l.portada_url || null,
      estado_portada: l.estado_portada || 'sin_portada',
      portada_fuente: l.portada_fuente || 'ninguna',
      portada_confianza: l.portada_confianza || 'ninguna',
      portada_detalles: l.portada_detalles || null,
      estado: l.estado || 'disponible',
      prestado_a: l.prestado_a || null,
      lista_espera: l.lista_espera || [],
      categoria: l.categoria || null,
      sinopsis: l.sinopsis || null,
    }));

    try {
      const { error } = await supabase.from('libros_fisicos').upsert(batch, { onConflict: 'id' });
      if (error) {
        errores.push(`Lote ${i} - ${i + batch.length}: ${error.message}`);
      } else {
        insertados += batch.length;
      }
    } catch (batchErr: any) {
      errores.push(`Lote ${i} - ${i + batch.length}: ${batchErr.message}`);
    }

    if (onProgress) {
      onProgress(Math.min(i + BATCH_SIZE, libros.length), libros.length);
    }
  }

  return {
    success: errores.length === 0,
    insertados,
    errores,
  };
}
