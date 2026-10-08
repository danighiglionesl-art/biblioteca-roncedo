import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { FotoHistorica, EtiquetaPersona, ComentarioFoto, EstadoModeracionFoto } from '@/types';
import { FOTOS_HISTORICAS_INICIALES } from '@/lib/data/fototecaInicial';

const LOCAL_STORAGE_FOTOS_KEY = 'roncedo_fototeca_custom_v1';
const LOCAL_STORAGE_ETIQUETAS_KEY = 'roncedo_fototeca_etiquetas_v1';
const LOCAL_STORAGE_COMENTARIOS_KEY = 'roncedo_fototeca_comentarios_v1';

/**
 * Obtiene todas las fotos históricas activas.
 * Prioriza Supabase y si no está conectado o la tabla aún no existe,
 * usa la base inicial local + aportes guardados en localStorage.
 */
export async function getFotosHistoricas(): Promise<FotoHistorica[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: fotosData, error: fotosError } = await supabase
        .from('fototeca_fotos')
        .select(`
          *,
          etiquetas_personas:fototeca_etiquetas_personas(*),
          comentarios:fototeca_comentarios(*)
        `)
        .order('created_at', { ascending: false });

      if (!fotosError && fotosData && fotosData.length > 0) {
        return fotosData as FotoHistorica[];
      }
    } catch (e) {
      console.warn('Usando catálogo inicial local de la Fototeca:', e);
    }
  }

  // Fallback local enriquecido con aportes de la sesión local
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_FOTOS_KEY);
      const extraFotos: FotoHistorica[] = stored ? JSON.parse(stored) : [];

      const storedEtiq = localStorage.getItem(LOCAL_STORAGE_ETIQUETAS_KEY);
      const extraEtiquetas: EtiquetaPersona[] = storedEtiq ? JSON.parse(storedEtiq) : [];

      const storedCom = localStorage.getItem(LOCAL_STORAGE_COMENTARIOS_KEY);
      const extraComentarios: ComentarioFoto[] = storedCom ? JSON.parse(storedCom) : [];

      // Combinar iniciales con extras
      const all = [...extraFotos, ...FOTOS_HISTORICAS_INICIALES];
      return all.map((f) => {
        const misEtiquetas = [
          ...(f.etiquetas_personas || []),
          ...extraEtiquetas.filter((e) => e.foto_id === f.id),
        ];
        const misComentarios = [
          ...(f.comentarios || []),
          ...extraComentarios.filter((c) => c.foto_id === f.id),
        ];
        return {
          ...f,
          etiquetas_personas: misEtiquetas,
          comentarios: misComentarios,
        };
      });
    } catch {
      // Ignorar error de parsing
    }
  }

  return FOTOS_HISTORICAS_INICIALES;
}

/**
 * Sube una fotografía histórica con publicación directa (sin bloqueo).
 */
export async function subirFotoHistorica(
  file: File,
  datos: {
    titulo: string;
    descripcion?: string;
    anio_estimado?: number;
    decada?: string;
    lugar?: string;
    institucion?: string;
    acontecimiento?: string;
    coleccion?: string;
    autor_fotografo?: string;
    donante_fuente?: string;
    subido_por_user_id?: string;
    subido_por_nombre: string;
  }
): Promise<{ success: boolean; foto?: FotoHistorica; error?: string }> {
  try {
    let imagen_url = '';
    let storage_path = '';

    if (isSupabaseConfigured && supabase) {
      const fileExt = file.name.split('.').pop() || 'webp';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      storage_path = `historicas/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fototeca')
        .upload(storage_path, file, {
          contentType: file.type || 'image/webp',
          upsert: true,
        });

      if (uploadError) {
        console.warn('Error en storage, usando preview en base64:', uploadError);
        imagen_url = await fileToBase64(file);
      } else if (uploadData) {
        const { data: publicData } = supabase.storage
          .from('fototeca')
          .getPublicUrl(storage_path);
        imagen_url = publicData.publicUrl;
      }

      // Insertar registro en tabla fototeca_fotos
      const { data: inserted, error: insertError } = await supabase
        .from('fototeca_fotos')
        .insert({
          titulo: datos.titulo,
          descripcion: datos.descripcion || null,
          anio_estimado: datos.anio_estimado || null,
          decada: datos.decada || (datos.anio_estimado ? `${Math.floor(datos.anio_estimado / 10) * 10}s` : 'Sin fecha'),
          lugar: datos.lugar || 'Alcira Gigena',
          institucion: datos.institucion || 'Club Roncedo',
          acontecimiento: datos.acontecimiento || null,
          coleccion: datos.coleccion || 'Club Roncedo y Deportes',
          imagen_url,
          storage_path,
          autor_fotografo: datos.autor_fotografo || null,
          donante_fuente: datos.donante_fuente || datos.subido_por_nombre,
          subido_por_user_id: datos.subido_por_user_id || null,
          subido_por_nombre: datos.subido_por_nombre,
          estado_moderacion: 'publicada',
        })
        .select()
        .single();

      if (!insertError && inserted) {
        return { success: true, foto: inserted as FotoHistorica };
      }
    }

    // Modo local / Fallback
    if (!imagen_url) {
      imagen_url = await fileToBase64(file);
    }

    const nuevaFoto: FotoHistorica = {
      id: `foto-local-${Date.now()}`,
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      anio_estimado: datos.anio_estimado,
      decada: datos.decada || (datos.anio_estimado ? `${Math.floor(datos.anio_estimado / 10) * 10}s` : 'Sin fecha'),
      lugar: datos.lugar || 'Alcira Gigena',
      institucion: datos.institucion || 'Club Roncedo',
      acontecimiento: datos.acontecimiento,
      coleccion: datos.coleccion || 'Club Roncedo y Deportes',
      imagen_url,
      autor_fotografo: datos.autor_fotografo,
      donante_fuente: datos.donante_fuente || datos.subido_por_nombre,
      subido_por_user_id: datos.subido_por_user_id,
      subido_por_nombre: datos.subido_por_nombre,
      estado_moderacion: 'publicada',
      destacada: false,
      etiquetas_personas: [],
      comentarios: [],
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_FOTOS_KEY);
      const list: FotoHistorica[] = stored ? JSON.parse(stored) : [];
      list.unshift(nuevaFoto);
      localStorage.setItem(LOCAL_STORAGE_FOTOS_KEY, JSON.stringify(list));
    }

    return { success: true, foto: nuevaFoto };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al guardar la fotografía.' };
  }
}

/**
 * Agrega una etiqueta facial o identificación de persona en la fotografía.
 */
export async function agregarEtiquetaPersona(
  fotoId: string,
  etiqueta: {
    nombre_persona: string;
    rol_o_detalle?: string;
    pos_x_porcentaje?: number;
    pos_y_porcentaje?: number;
    identificado_por_user_id?: string;
    identificado_por_nombre: string;
  }
): Promise<{ success: boolean; data?: EtiquetaPersona; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('fototeca_etiquetas_personas')
        .insert({
          foto_id: fotoId,
          nombre_persona: etiqueta.nombre_persona,
          rol_o_detalle: etiqueta.rol_o_detalle || null,
          pos_x_porcentaje: etiqueta.pos_x_porcentaje ?? 50,
          pos_y_porcentaje: etiqueta.pos_y_porcentaje ?? 50,
          identificado_por_user_id: etiqueta.identificado_por_user_id || null,
          identificado_por_nombre: etiqueta.identificado_por_nombre,
        })
        .select()
        .single();

      if (!error && data) {
        return { success: true, data: data as EtiquetaPersona };
      }
    }

    // Local
    const newEtiq: EtiquetaPersona = {
      id: `etiq-loc-${Date.now()}`,
      foto_id: fotoId,
      nombre_persona: etiqueta.nombre_persona,
      rol_o_detalle: etiqueta.rol_o_detalle,
      pos_x_porcentaje: etiqueta.pos_x_porcentaje ?? 50,
      pos_y_porcentaje: etiqueta.pos_y_porcentaje ?? 50,
      identificado_por_user_id: etiqueta.identificado_por_user_id,
      identificado_por_nombre: etiqueta.identificado_por_nombre,
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_ETIQUETAS_KEY);
      const list: EtiquetaPersona[] = stored ? JSON.parse(stored) : [];
      list.push(newEtiq);
      localStorage.setItem(LOCAL_STORAGE_ETIQUETAS_KEY, JSON.stringify(list));
    }

    return { success: true, data: newEtiq };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Agrega un comentario o memoria comunitaria a una fotografía.
 */
export async function agregarComentarioFoto(
  fotoId: string,
  user_id: string | undefined,
  nombre_usuario: string,
  comentario: string
): Promise<{ success: boolean; data?: ComentarioFoto; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('fototeca_comentarios')
        .insert({
          foto_id: fotoId,
          user_id: user_id || null,
          nombre_usuario,
          comentario,
        })
        .select()
        .single();

      if (!error && data) {
        return { success: true, data: data as ComentarioFoto };
      }
    }

    // Local
    const newCom: ComentarioFoto = {
      id: `com-loc-${Date.now()}`,
      foto_id: fotoId,
      user_id,
      nombre_usuario,
      comentario,
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_COMENTARIOS_KEY);
      const list: ComentarioFoto[] = stored ? JSON.parse(stored) : [];
      list.push(newCom);
      localStorage.setItem(LOCAL_STORAGE_COMENTARIOS_KEY, JSON.stringify(list));
    }

    return { success: true, data: newCom };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Reporta una foto si incumple las normas de la Biblioteca.
 */
export async function reportarFotoHistorica(
  fotoId: string,
  motivo: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      await supabase.rpc('increment_reporte_foto', { foto_id_param: fotoId, motivo_param: motivo });
      // Alternativa con update directo si no está el RPC:
      await supabase
        .from('fototeca_fotos')
        .update({
          estado_moderacion: 'reportada',
          motivo_ultimo_reporte: motivo,
        })
        .eq('id', fotoId);
      return { success: true };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Función de Administrador: Modera una fotografía (ocultar, volver a publicar o eliminar).
 */
export async function moderarFotoHistorica(
  fotoId: string,
  nuevoEstado: EstadoModeracionFoto
): Promise<{ success: boolean; error?: string }> {
  try {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('fototeca_fotos')
        .update({ estado_moderacion: nuevoEstado })
        .eq('id', fotoId);

      if (error) throw error;
      return { success: true };
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_FOTOS_KEY);
      if (stored) {
        const list: FotoHistorica[] = JSON.parse(stored);
        const updated = list.map((f) => (f.id === fotoId ? { ...f, estado_moderacion: nuevoEstado } : f));
        localStorage.setItem(LOCAL_STORAGE_FOTOS_KEY, JSON.stringify(updated));
      }
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
