import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { ItemRoncedo } from '@/types/roncedo';
import { RONCEDO_ITEMS_INICIALES } from '@/lib/data/roncedoItemsIniciales';
import { compressImage } from '@/lib/utils/imageCompressor';

const STORAGE_RONCEDO_ITEMS_KEY = 'roncedo_museo_items_v1';

/**
 * Obtiene la lista completa de ítems históricos del Museo Dr. Lautaro Roncedo
 */
export async function getItemsRoncedo(): Promise<ItemRoncedo[]> {
  let items: ItemRoncedo[] = [...RONCEDO_ITEMS_INICIALES];

  // 1. Cargar desde LocalStorage para sincronización inmediata
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_RONCEDO_ITEMS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          items = parsed;
        } else {
          localStorage.setItem(STORAGE_RONCEDO_ITEMS_KEY, JSON.stringify(RONCEDO_ITEMS_INICIALES));
        }
      } else {
        localStorage.setItem(STORAGE_RONCEDO_ITEMS_KEY, JSON.stringify(RONCEDO_ITEMS_INICIALES));
      }
    } catch (e) {
      console.warn('[RoncedoService] Error al leer localStorage:', e);
    }
  }

  // 2. Si Supabase está disponible, consultar tabla roncedo_items
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('roncedo_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapeados: ItemRoncedo[] = data.map((d: any) => ({
          id: d.id,
          tipo: d.tipo,
          titulo: d.titulo,
          descripcion: d.descripcion || '',
          comentario_admin: d.comentario_admin || '',
          url: d.url,
          thumbnail_url: d.thumbnail_url || '',
          fecha_o_anio: d.fecha_o_anio || '',
          categoria: d.categoria || 'General',
          duracion_o_paginas: d.duracion_o_paginas || '',
          creado_por: d.creado_por || 'biblioroncedo',
          created_at: d.created_at,
          updated_at: d.updated_at,
        }));

        // Combinar con base preservando ítems nuevos creados localmente
        const idsNube = new Set(mapeados.map((m) => m.id));
        const localesNuevos = items.filter((i) => !idsNube.has(i.id));
        items = [...localesNuevos, ...mapeados];

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_RONCEDO_ITEMS_KEY, JSON.stringify(items));
        }
      }
    } catch {
      // Usar respaldo local
    }
  }

  return items;
}

/**
 * Guarda la lista en localStorage y despacha evento reactivo
 */
function persistirItemsLocales(items: ItemRoncedo[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_RONCEDO_ITEMS_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('roncedo_items_update'));
  } catch (err) {
    console.warn('[RoncedoService] Error al persistir local:', err);
  }
}

/**
 * Sube un archivo (Foto comprimida o PDF) a Supabase Storage
 */
export async function subirArchivoRoncedo(
  file: File,
  tipo: 'foto' | 'pdf'
): Promise<{ success: boolean; url: string; error?: string }> {
  try {
    let archivoParaSubir = file;
    let contentType = file.type;

    // Si es foto, comprimir con WebP
    if (tipo === 'foto' && file.type.startsWith('image/')) {
      const comp = await compressImage(file, 1600, 0.85);
      archivoParaSubir = comp.file;
      contentType = 'image/webp';
    }

    if (isSupabaseConfigured && supabase) {
      const bucket = tipo === 'pdf' ? 'libros_digitales_pdf' : 'fototeca';
      const cleanName = `roncedo_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const filePath = `roncedo/${cleanName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, archivoParaSubir, {
          upsert: true,
          contentType: contentType || (tipo === 'pdf' ? 'application/pdf' : 'image/webp'),
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        if (publicData?.publicUrl) {
          return { success: true, url: publicData.publicUrl };
        }
      } else if (error) {
        console.warn(`[RoncedoService] Error subiendo a ${bucket}:`, error.message);
      }
    }

    // Fallback con base64/object URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ success: true, url: reader.result as string });
      reader.onerror = () => resolve({ success: false, url: '', error: 'Error al leer archivo local.' });
      reader.readAsDataURL(file);
    });
  } catch (err: any) {
    return { success: false, url: '', error: err.message || 'Error al procesar archivo.' };
  }
}

/**
 * Crea un nuevo ítem histórico (Solo Administrador)
 */
export async function crearItemRoncedo(
  datos: Omit<ItemRoncedo, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: ItemRoncedo; error?: string }> {
  const nuevoItem: ItemRoncedo = {
    ...datos,
    id: `roncedo-${datos.tipo}-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const items = await getItemsRoncedo();
  items.unshift(nuevoItem);
  persistirItemsLocales(items);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('roncedo_items').insert(nuevoItem);
    } catch (e) {
      console.warn('[RoncedoService] Error guardando en Supabase:', e);
    }
  }

  return { success: true, data: nuevoItem };
}

/**
 * Actualiza un ítem histórico existente (Solo Administrador)
 */
export async function actualizarItemRoncedo(
  id: string,
  datos: Partial<ItemRoncedo>
): Promise<{ success: boolean; error?: string }> {
  const items = await getItemsRoncedo();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) {
    return { success: false, error: 'Ítem no encontrado.' };
  }

  items[index] = {
    ...items[index],
    ...datos,
    updated_at: new Date().toISOString(),
  };

  persistirItemsLocales(items);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('roncedo_items')
        .update({ ...datos, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (e) {
      console.warn('[RoncedoService] Error actualizando en Supabase:', e);
    }
  }

  return { success: true };
}

/**
 * Elimina un ítem histórico (Solo Administrador)
 */
export async function eliminarItemRoncedo(id: string): Promise<{ success: boolean; error?: string }> {
  const items = await getItemsRoncedo();
  const filtrados = items.filter((i) => i.id !== id);

  persistirItemsLocales(filtrados);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('roncedo_items').delete().eq('id', id);
    } catch (e) {
      console.warn('[RoncedoService] Error eliminando en Supabase:', e);
    }
  }

  return { success: true };
}
