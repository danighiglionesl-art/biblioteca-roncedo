import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { NovedadInstitucional } from '@/types';
import { NOVEDADES_INICIALES } from '@/lib/auth/mockData';
import { compressImage } from '@/lib/utils/imageCompressor';

const LOCAL_STORAGE_NOVEDADES_KEY = 'roncedo_novedades_custom_v1';

/**
 * Convierte un File o Blob a cadena Base64
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Procesa y comprime una imagen para guardado optimizado
 */
async function procesarImagen(file: File): Promise<string> {
  try {
    const compressed = await compressImage(file, 1400, 0.82);
    // Si Supabase Storage está disponible, intentar subir
    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = compressed.file.name.split('.').pop() || 'webp';
        const fileName = `novedad_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const storagePath = `novedades/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('novedades')
          .upload(storagePath, compressed.file, {
            contentType: 'image/webp',
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicData } = supabase.storage
            .from('novedades')
            .getPublicUrl(storagePath);
          return publicData.publicUrl;
        }
      } catch (storageErr) {
        console.warn('Storage falló, usando base64 optimizado:', storageErr);
      }
    }

    // Fallback: Base64 comprimido
    return await fileToBase64(compressed.file);
  } catch (err) {
    console.warn('Error comprimiendo imagen, usando archivo original en base64:', err);
    return await fileToBase64(file);
  }
}

/**
 * Obtiene todas las novedades institucionales activas.
 * Prioriza Supabase y utiliza localStorage + NOVEDADES_INICIALES como fallback local.
 */
export async function getNovedades(): Promise<NovedadInstitucional[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('novedades')
        .select('*')
        .order('destacado', { ascending: false })
        .order('fecha', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((n: any) => ({
          ...n,
          imagenes: n.imagenes && n.imagenes.length > 0 ? n.imagenes : n.imagen_url ? [n.imagen_url] : [],
        })) as NovedadInstitucional[];
      }
    } catch (e) {
      console.warn('Usando catálogo inicial local de Novedades:', e);
    }
  }

  // Fallback local en navegador
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_NOVEDADES_KEY);
      if (stored) {
        const parsed: NovedadInstitucional[] = JSON.parse(stored);
        if (parsed.length > 0) {
          return parsed.map((n) => ({
            ...n,
            imagenes: n.imagenes && n.imagenes.length > 0 ? n.imagenes : n.imagen_url ? [n.imagen_url] : [],
          }));
        }
      } else {
        // Inicializar localStorage con las iniciales enriquecidas
        localStorage.setItem(LOCAL_STORAGE_NOVEDADES_KEY, JSON.stringify(NOVEDADES_INICIALES));
      }
    } catch {
      // Ignorar error de parsing
    }
  }

  return NOVEDADES_INICIALES.map((n) => ({
    ...n,
    imagenes: n.imagenes && n.imagenes.length > 0 ? n.imagenes : n.imagen_url ? [n.imagen_url] : [],
  }));
}

/**
 * Registra una nueva novedad con hasta 5 fotografías.
 */
export async function crearNovedad(
  datos: {
    titulo: string;
    bajada: string;
    contenido: string;
    categoria: 'Institucional' | 'Cultura' | 'Libros' | 'Archivo';
    fecha: string;
    destacado?: boolean;
    autor?: string;
  },
  archivosFotos: File[] = []
): Promise<{ success: boolean; novedad?: NovedadInstitucional; error?: string }> {
  try {
    // Limitar estrictamente a 5 fotografías
    const archivosAProcesar = archivosFotos.slice(0, 5);
    const imagenesUrls: string[] = [];

    for (const file of archivosAProcesar) {
      const url = await procesarImagen(file);
      imagenesUrls.push(url);
    }

    const nuevaNovedad: NovedadInstitucional = {
      id: `nov-${Date.now()}`,
      titulo: datos.titulo.trim(),
      bajada: datos.bajada.trim(),
      contenido: datos.contenido.trim(),
      categoria: datos.categoria,
      fecha: datos.fecha || new Date().toISOString().split('T')[0],
      destacado: Boolean(datos.destacado),
      imagen_url: imagenesUrls[0] || undefined,
      imagenes: imagenesUrls,
      autor: datos.autor || 'Biblioteca Roncedo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Si Supabase está conectado, guardar en DB
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: inserted, error: insertError } = await supabase
          .from('novedades')
          .insert({
            titulo: nuevaNovedad.titulo,
            bajada: nuevaNovedad.bajada,
            contenido: nuevaNovedad.contenido,
            categoria: nuevaNovedad.categoria,
            fecha: nuevaNovedad.fecha,
            destacado: nuevaNovedad.destacado,
            imagen_url: nuevaNovedad.imagen_url,
            imagenes: nuevaNovedad.imagenes,
            autor: nuevaNovedad.autor,
          })
          .select()
          .single();

        if (!insertError && inserted) {
          nuevaNovedad.id = inserted.id;
        }
      } catch (dbErr) {
        console.warn('Fallo guardando en Supabase, persistiendo localmente:', dbErr);
      }
    }

    // Persistir siempre en localStorage para disponibilidad inmediata
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_NOVEDADES_KEY);
      const list: NovedadInstitucional[] = stored ? JSON.parse(stored) : [...NOVEDADES_INICIALES];
      list.unshift(nuevaNovedad);
      localStorage.setItem(LOCAL_STORAGE_NOVEDADES_KEY, JSON.stringify(list));
      // Disparar evento para sincronización reactiva en tiempo real
      window.dispatchEvent(new Event('roncedo_novedades_updated'));
    }

    return { success: true, novedad: nuevaNovedad };
  } catch (err: any) {
    console.error('Error al crear novedad:', err);
    return { success: false, error: err.message || 'Error al guardar la novedad' };
  }
}

/**
 * Actualiza una novedad existente, administrando hasta 5 fotografías (existentes + nuevas).
 */
export async function actualizarNovedad(
  id: string,
  datos: {
    titulo: string;
    bajada: string;
    contenido: string;
    categoria: 'Institucional' | 'Cultura' | 'Libros' | 'Archivo';
    fecha: string;
    destacado?: boolean;
    autor?: string;
  },
  imagenesExistentes: string[] = [],
  archivosFotosNuevas: File[] = []
): Promise<{ success: boolean; novedad?: NovedadInstitucional; error?: string }> {
  try {
    const imagenesFinales = [...imagenesExistentes];
    const cupoDisponible = Math.max(0, 5 - imagenesFinales.length);
    const fotosAProcesar = archivosFotosNuevas.slice(0, cupoDisponible);

    for (const file of fotosAProcesar) {
      const url = await procesarImagen(file);
      imagenesFinales.push(url);
    }

    const novedadActualizada: Partial<NovedadInstitucional> = {
      titulo: datos.titulo.trim(),
      bajada: datos.bajada.trim(),
      contenido: datos.contenido.trim(),
      categoria: datos.categoria,
      fecha: datos.fecha,
      destacado: Boolean(datos.destacado),
      imagen_url: imagenesFinales[0] || undefined,
      imagenes: imagenesFinales,
      autor: datos.autor || 'Biblioteca Roncedo',
      updated_at: new Date().toISOString(),
    };

    // Actualizar en Supabase si está disponible
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('novedades')
          .update(novedadActualizada)
          .eq('id', id);
      } catch (dbErr) {
        console.warn('Fallo actualizando en Supabase:', dbErr);
      }
    }

    // Actualizar en localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_NOVEDADES_KEY);
      let list: NovedadInstitucional[] = stored ? JSON.parse(stored) : [...NOVEDADES_INICIALES];
      list = list.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...novedadActualizada,
          } as NovedadInstitucional;
        }
        return item;
      });
      localStorage.setItem(LOCAL_STORAGE_NOVEDADES_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('roncedo_novedades_updated'));
    }

    return {
      success: true,
      novedad: { id, ...datos, imagenes: imagenesFinales, imagen_url: imagenesFinales[0] } as NovedadInstitucional,
    };
  } catch (err: any) {
    console.error('Error al actualizar novedad:', err);
    return { success: false, error: err.message || 'Error al actualizar la novedad' };
  }
}

/**
 * Elimina una novedad por su ID.
 */
export async function eliminarNovedad(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('novedades').delete().eq('id', id);
      } catch (dbErr) {
        console.warn('Fallo eliminando en Supabase:', dbErr);
      }
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_NOVEDADES_KEY);
      if (stored) {
        let list: NovedadInstitucional[] = JSON.parse(stored);
        list = list.filter((item) => item.id !== id);
        localStorage.setItem(LOCAL_STORAGE_NOVEDADES_KEY, JSON.stringify(list));
        window.dispatchEvent(new Event('roncedo_novedades_updated'));
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error al eliminar novedad:', err);
    return { success: false, error: err.message || 'Error al eliminar la novedad' };
  }
}
