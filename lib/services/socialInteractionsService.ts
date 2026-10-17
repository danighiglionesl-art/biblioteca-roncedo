import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  TipoSeccionSocial,
  TipoReaccionSocial,
  ReaccionSocial,
  ComentarioSocial,
  ResumenReaccionesSociales,
} from '@/types/social';
import { UserProfile } from '@/types';

const STORAGE_REACCIONES_KEY = 'roncedo_social_reacciones_v1';
const STORAGE_COMENTARIOS_KEY = 'roncedo_social_comentarios_v1';

// Sembrado inicial de memoria comunitaria y aportes en distintas secciones
const COMENTARIOS_INICIALES_PRESEMBRADOS: ComentarioSocial[] = [
  // Sección Dr. Lautaro Roncedo
  {
    id: 'com-roncedo-01',
    seccion: 'roncedo',
    item_id: 'roncedo-foto-01',
    user_id: 'user-carlos-arguello',
    user_nombre: 'Carlos',
    user_apellido: 'Argüello',
    user_rol: 'socio',
    user_categoria: 'Vitalicio',
    user_hincha: 'Lautaro Roncedo',
    comentario: 'Un orgullo inmenso ver el retrato del Dr. Roncedo conservado con tanta dignidad. En mi familia siempre recordamos que atendía sin cobrar a quienes no tenían recursos.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    likes_count: 8,
    liked_by: [],
  },
  {
    id: 'com-roncedo-02',
    seccion: 'roncedo',
    item_id: 'roncedo-video-01',
    user_id: 'user-marta-benitez',
    user_nombre: 'Marta',
    user_apellido: 'Benítez',
    user_rol: 'socio',
    user_categoria: 'Activo',
    user_hincha: 'Lautaro Roncedo',
    comentario: 'Excelente trabajo de digitalización del documental. Emociona escuchar las voces de los pioneros.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    likes_count: 5,
    liked_by: [],
  },
  // Sección Libros Físicos (INV 1 Maradona)
  {
    id: 'com-fisico-01',
    seccion: 'libros_fisicos',
    item_id: 'libro-1',
    user_id: 'user-diego-socio',
    user_nombre: 'Esteban',
    user_apellido: 'Ferrero',
    user_rol: 'socio',
    user_categoria: 'Activo',
    user_hincha: 'Lautaro Roncedo',
    comentario: 'Una de las mejores biografías de Maradona. Lo retiré el año pasado y es una joya imperdible en la biblioteca.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    likes_count: 12,
    liked_by: [],
  },
  // Sección Libros Digitales
  {
    id: 'com-digital-01',
    seccion: 'libros_digitales',
    item_id: 'dig-sexualidad-inclusion-2019',
    user_id: 'user-docente-maria',
    user_nombre: 'Prof. Silvia',
    user_apellido: 'Gómez',
    user_rol: 'socio',
    user_categoria: 'Activo',
    user_hincha: 'Lautaro Roncedo',
    comentario: 'Excelente material pedagógico y de derechos humanos. Muy valorable que la biblioteca lo ponga en descarga libre.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    likes_count: 9,
    liked_by: [],
  },
  // Sección Audiolibros
  {
    id: 'com-audio-01',
    seccion: 'audiolibros',
    item_id: 'audio-centenario-roncedo',
    user_id: 'user-cadete-joaquin',
    user_nombre: 'Joaquín',
    user_apellido: 'Vázquez',
    user_rol: 'socio',
    user_categoria: 'Cadete',
    user_hincha: 'Lautaro Roncedo',
    comentario: 'Lo escuché volviendo de entrenar en el club. La narración de la noche fundacional del 15 de marzo de 1926 te pone la piel de gallina.',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    likes_count: 14,
    liked_by: [],
  },
  // Sección Actas
  {
    id: 'com-acta-01',
    seccion: 'actas',
    item_id: 'acta-01',
    user_id: 'user-investigador-roberto',
    user_nombre: 'Lic. Roberto',
    user_apellido: 'Battaglino',
    user_rol: 'socio',
    user_categoria: 'Vitalicio',
    user_hincha: 'Lautaro Roncedo',
    comentario: 'El Acta Fundacional de 1926 es el tesoro documental más valioso de Gigena. Los 23 fundadores reunidos en el Hotel de Márquez marcaron para siempre la historia de nuestro pueblo.',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    likes_count: 22,
    liked_by: [],
  },
];

const REACCIONES_INICIALES_PRESEMBRADAS: ReaccionSocial[] = [
  { id: 'r1', seccion: 'roncedo', item_id: 'roncedo-foto-01', user_id: 'u1', user_nombre: 'Carlos A.', tipo: 'patrimonio', created_at: new Date().toISOString() },
  { id: 'r2', seccion: 'roncedo', item_id: 'roncedo-foto-01', user_id: 'u2', user_nombre: 'Marta B.', tipo: 'corazon', created_at: new Date().toISOString() },
  { id: 'r3', seccion: 'roncedo', item_id: 'roncedo-foto-01', user_id: 'u3', user_nombre: 'Esteban F.', tipo: 'aplauso', created_at: new Date().toISOString() },
  { id: 'r4', seccion: 'libros_fisicos', item_id: 'libro-1', user_id: 'u1', user_nombre: 'Carlos A.', tipo: 'corazon', created_at: new Date().toISOString() },
  { id: 'r5', seccion: 'libros_fisicos', item_id: 'libro-1', user_id: 'u2', user_nombre: 'Marta B.', tipo: 'pulgar', created_at: new Date().toISOString() },
  { id: 'r6', seccion: 'actas', item_id: 'acta-01', user_id: 'u1', user_nombre: 'Carlos A.', tipo: 'patrimonio', created_at: new Date().toISOString() },
  { id: 'r7', seccion: 'actas', item_id: 'acta-01', user_id: 'u2', user_nombre: 'Marta B.', tipo: 'patrimonio', created_at: new Date().toISOString() },
  { id: 'r8', seccion: 'actas', item_id: 'acta-01', user_id: 'u3', user_nombre: 'Esteban F.', tipo: 'aplauso', created_at: new Date().toISOString() },
];

/**
 * Obtiene las reacciones locales almacenadas
 */
function getReaccionesLocales(): ReaccionSocial[] {
  if (typeof window === 'undefined') return REACCIONES_INICIALES_PRESEMBRADAS;
  try {
    const raw = localStorage.getItem(STORAGE_REACCIONES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_REACCIONES_KEY, JSON.stringify(REACCIONES_INICIALES_PRESEMBRADAS));
      return REACCIONES_INICIALES_PRESEMBRADAS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : REACCIONES_INICIALES_PRESEMBRADAS;
  } catch {
    return REACCIONES_INICIALES_PRESEMBRADAS;
  }
}

/**
 * Guarda las reacciones locales
 */
function guardarReaccionesLocales(reacciones: ReaccionSocial[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_REACCIONES_KEY, JSON.stringify(reacciones));
    window.dispatchEvent(new CustomEvent('roncedo_social_reactions_update'));
  } catch (err) {
    console.warn('[SocialService] Error guardando reacciones en localStorage:', err);
  }
}

/**
 * Obtiene los comentarios locales almacenados
 */
function getComentariosLocales(): ComentarioSocial[] {
  if (typeof window === 'undefined') return COMENTARIOS_INICIALES_PRESEMBRADOS;
  try {
    const raw = localStorage.getItem(STORAGE_COMENTARIOS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_COMENTARIOS_KEY, JSON.stringify(COMENTARIOS_INICIALES_PRESEMBRADOS));
      return COMENTARIOS_INICIALES_PRESEMBRADOS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : COMENTARIOS_INICIALES_PRESEMBRADOS;
  } catch {
    return COMENTARIOS_INICIALES_PRESEMBRADOS;
  }
}

/**
 * Guarda los comentarios locales
 */
function guardarComentariosLocales(comentarios: ComentarioSocial[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_COMENTARIOS_KEY, JSON.stringify(comentarios));
    window.dispatchEvent(new CustomEvent('roncedo_social_comments_update'));
  } catch (err) {
    console.warn('[SocialService] Error guardando comentarios en localStorage:', err);
  }
}

/**
 * Obtiene el resumen de reacciones de forma síncrona desde caché local
 */
export function getResumenReaccionesSocialesSync(
  seccion: TipoSeccionSocial,
  itemId: string,
  userId?: string
): ResumenReaccionesSociales {
  const cleanId = String(itemId).trim();
  const cleanSeccion = seccion.trim();
  const todas = getReaccionesLocales();

  const itemsReacciones = todas.filter(
    (r) => r.seccion === cleanSeccion && String(r.item_id).trim() === cleanId
  );

  const porTipo: Record<TipoReaccionSocial, number> = {
    corazon: 0,
    pulgar: 0,
    aplauso: 0,
    bombilla: 0,
    patrimonio: 0,
  };

  let miReaccion: TipoReaccionSocial | undefined;

  for (const r of itemsReacciones) {
    if (porTipo[r.tipo] !== undefined) {
      porTipo[r.tipo]++;
    }
    if (userId && r.user_id === userId) {
      miReaccion = r.tipo;
    }
  }

  return {
    total: itemsReacciones.length,
    porTipo,
    miReaccion,
  };
}

/**
 * Obtiene el resumen consolidado de reacciones de un ítem (con sincronización Supabase)
 */
export async function getResumenReaccionesSociales(
  seccion: TipoSeccionSocial,
  itemId: string,
  userId?: string
): Promise<ResumenReaccionesSociales> {
  const cleanId = String(itemId).trim();
  const cleanSeccion = seccion.trim();

  let todas = getReaccionesLocales();

  // Si Supabase está disponible, consultar en segundo plano o combinar
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('social_reacciones')
        .select('*')
        .eq('seccion', cleanSeccion)
        .eq('item_id', cleanId);

      if (!error && data && data.length > 0) {
        // Unir datos de Supabase con los locales evitando duplicados
        const idsSupabase = new Set(data.map((d: any) => d.id));
        const localesOtros = todas.filter((r) => r.seccion !== cleanSeccion || r.item_id !== cleanId);
        todas = [...localesOtros, ...data];
        guardarReaccionesLocales(todas);
      }
    } catch {
      // Usar respaldo local
    }
  }

  const itemsReacciones = todas.filter(
    (r) => r.seccion === cleanSeccion && String(r.item_id).trim() === cleanId
  );

  const porTipo: Record<TipoReaccionSocial, number> = {
    corazon: 0,
    pulgar: 0,
    aplauso: 0,
    bombilla: 0,
    patrimonio: 0,
  };

  let miReaccion: TipoReaccionSocial | undefined;

  for (const r of itemsReacciones) {
    if (porTipo[r.tipo] !== undefined) {
      porTipo[r.tipo]++;
    }
    if (userId && r.user_id === userId) {
      miReaccion = r.tipo;
    }
  }

  return {
    total: itemsReacciones.length,
    porTipo,
    miReaccion,
  };
}

/**
 * Activa, cambia o retira una reacción a un contenido (Toggle estilo red social)
 */
export async function toggleReaccionSocial(
  seccion: TipoSeccionSocial,
  itemId: string,
  user: UserProfile | { id: string; nombre: string; apellido?: string },
  tipo: TipoReaccionSocial
): Promise<ResumenReaccionesSociales> {
  const cleanId = String(itemId).trim();
  const cleanSeccion = seccion.trim();
  const userId = user.id;

  const todas = getReaccionesLocales();
  const indexExistente = todas.findIndex(
    (r) => r.seccion === cleanSeccion && String(r.item_id).trim() === cleanId && r.user_id === userId
  );

  let accion: 'agregada' | 'cambiada' | 'removida' = 'agregada';
  let idParaNube = `reac-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  if (indexExistente >= 0) {
    const actual = todas[indexExistente];
    if (actual.tipo === tipo) {
      // Mismo tipo -> Toggle off (remover)
      idParaNube = actual.id;
      todas.splice(indexExistente, 1);
      accion = 'removida';
    } else {
      // Tipo diferente -> Cambiar reacción
      idParaNube = actual.id;
      todas[indexExistente] = {
        ...actual,
        tipo,
        created_at: new Date().toISOString(),
      };
      accion = 'cambiada';
    }
  } else {
    // Agregar nueva
    const nueva: ReaccionSocial = {
      id: idParaNube,
      seccion: cleanSeccion as TipoSeccionSocial,
      item_id: cleanId,
      user_id: userId,
      user_nombre: `${user.nombre || 'Usuario'} ${user.apellido || ''}`.trim(),
      tipo,
      created_at: new Date().toISOString(),
    };
    todas.push(nueva);
    accion = 'agregada';
  }

  guardarReaccionesLocales(todas);

  // Persistir en Supabase de forma asincrónica si está disponible
  if (isSupabaseConfigured && supabase) {
    try {
      if (accion === 'removida') {
        await supabase
          .from('social_reacciones')
          .delete()
          .eq('seccion', cleanSeccion)
          .eq('item_id', cleanId)
          .eq('user_id', userId);
      } else {
        await supabase.from('social_reacciones').upsert(
          {
            id: idParaNube,
            seccion: cleanSeccion,
            item_id: cleanId,
            user_id: userId,
            user_nombre: `${user.nombre || 'Usuario'} ${user.apellido || ''}`.trim(),
            tipo_reaccion: tipo,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'seccion,item_id,user_id' }
        );
      }
    } catch (e) {
      console.warn('[SocialService] Error sincronizando reacción con Supabase:', e);
    }
  }

  return getResumenReaccionesSociales(cleanSeccion as TipoSeccionSocial, cleanId, userId);
}

/**
 * Obtiene los comentarios de un ítem en una sección específica
 */
export async function getComentariosSociales(
  seccion: TipoSeccionSocial,
  itemId: string
): Promise<ComentarioSocial[]> {
  const cleanId = String(itemId).trim();
  const cleanSeccion = seccion.trim();

  let todos = getComentariosLocales();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('social_comentarios')
        .select('*')
        .eq('seccion', cleanSeccion)
        .eq('item_id', cleanId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Normalizar nombres de columnas de Supabase
        const mapeados: ComentarioSocial[] = data.map((d: any) => ({
          id: d.id,
          seccion: d.seccion,
          item_id: d.item_id,
          user_id: d.user_id,
          user_nombre: d.user_nombre,
          user_apellido: d.user_apellido || '',
          user_avatar: d.user_avatar || '',
          user_rol: d.user_rol || 'usuario',
          user_categoria: d.user_categoria || '',
          user_hincha: d.user_hincha || '',
          comentario: d.comentario,
          created_at: d.created_at,
          likes_count: d.likes_count || 0,
          liked_by: Array.isArray(d.liked_by) ? d.liked_by : [],
        }));

        const otrosLocales = todos.filter((c) => c.seccion !== cleanSeccion || c.item_id !== cleanId);
        todos = [...otrosLocales, ...mapeados];
        guardarComentariosLocales(todos);
      }
    } catch {
      // Usar datos locales
    }
  }

  // Filtrar para el ítem y ordenar cronológicamente (más recientes primero)
  return todos
    .filter((c) => c.seccion === cleanSeccion && String(c.item_id).trim() === cleanId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Publica un nuevo comentario en un ítem
 */
export async function agregarComentarioSocial(
  seccion: TipoSeccionSocial,
  itemId: string,
  user: UserProfile,
  comentarioTexto: string
): Promise<{ success: boolean; data?: ComentarioSocial; error?: string }> {
  const limpio = comentarioTexto.trim();
  if (!limpio) {
    return { success: false, error: 'El comentario no puede estar vacío.' };
  }

  const cleanId = String(itemId).trim();
  const cleanSeccion = seccion.trim();

  const nuevo: ComentarioSocial = {
    id: `com-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    seccion: cleanSeccion as TipoSeccionSocial,
    item_id: cleanId,
    user_id: user.id,
    user_nombre: user.nombre || 'Vecino/a',
    user_apellido: user.apellido || '',
    user_avatar: user.avatar_url || '',
    user_rol: user.role || 'usuario',
    user_categoria: user.categoria_socio || '',
    user_hincha: user.hincha_club || '',
    comentario: limpio,
    created_at: new Date().toISOString(),
    likes_count: 0,
    liked_by: [],
  };

  const todos = getComentariosLocales();
  todos.unshift(nuevo);
  guardarComentariosLocales(todos);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('social_comentarios').insert({
        id: nuevo.id,
        seccion: nuevo.seccion,
        item_id: nuevo.item_id,
        user_id: nuevo.user_id,
        user_nombre: nuevo.user_nombre,
        user_apellido: nuevo.user_apellido,
        user_avatar: nuevo.user_avatar,
        user_rol: nuevo.user_rol,
        user_categoria: nuevo.user_categoria,
        user_hincha: nuevo.user_hincha,
        comentario: nuevo.comentario,
        created_at: nuevo.created_at,
        likes_count: 0,
        liked_by: [],
      });
    } catch (err) {
      console.warn('[SocialService] Error guardando comentario en Supabase:', err);
    }
  }

  return { success: true, data: nuevo };
}

/**
 * Elimina un comentario (solo permitido al autor o al administrador)
 */
export async function eliminarComentarioSocial(
  comentarioId: string,
  userId: string,
  isAdmin: boolean = false
): Promise<{ success: boolean; error?: string }> {
  const todos = getComentariosLocales();
  const index = todos.findIndex((c) => c.id === comentarioId);
  if (index === -1) {
    return { success: false, error: 'Comentario no encontrado.' };
  }

  const com = todos[index];
  if (com.user_id !== userId && !isAdmin) {
    return { success: false, error: 'No tienes permiso para eliminar este comentario.' };
  }

  todos.splice(index, 1);
  guardarComentariosLocales(todos);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('social_comentarios').delete().eq('id', comentarioId);
    } catch (err) {
      console.warn('[SocialService] Error eliminando comentario en Supabase:', err);
    }
  }

  return { success: true };
}

/**
 * Alterna el "Me gusta" en un comentario
 */
export async function toggleLikeComentarioSocial(
  comentarioId: string,
  userId: string
): Promise<{ success: boolean; nuevoCount: number; isLiked: boolean }> {
  const todos = getComentariosLocales();
  const com = todos.find((c) => c.id === comentarioId);
  if (!com) return { success: false, nuevoCount: 0, isLiked: false };

  const likedBy = Array.isArray(com.liked_by) ? [...com.liked_by] : [];
  const index = likedBy.indexOf(userId);
  let isLiked = false;

  if (index >= 0) {
    likedBy.splice(index, 1);
    isLiked = false;
  } else {
    likedBy.push(userId);
    isLiked = true;
  }

  com.liked_by = likedBy;
  com.likes_count = likedBy.length;
  guardarComentariosLocales(todos);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('social_comentarios')
        .update({ likes_count: com.likes_count, liked_by: com.liked_by })
        .eq('id', comentarioId);
    } catch {
      // Ignorar fallback
    }
  }

  return { success: true, nuevoCount: com.likes_count, isLiked };
}
