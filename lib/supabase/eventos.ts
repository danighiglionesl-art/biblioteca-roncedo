import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { EventoTaller, EventoInscripcion } from '@/types';
import { compressImage } from '@/lib/utils/imageCompressor';
import { generarCodigoCertificado } from '@/lib/utils/eventos';

const LOCAL_STORAGE_EVENTOS_KEY = 'roncedo_eventos_v1';
const LOCAL_STORAGE_INSCRIPCIONES_KEY = 'roncedo_evento_inscripciones_v1';

export const EVENTOS_INICIALES: EventoTaller[] = [
  {
    id: 'evt-yoga-01',
    titulo: 'Taller Integral de Yoga y Bienestar Postural',
    descripcion: 'Espacio de armonización, flexibilidad y respiración consciente orientado a todas las edades. No requiere experiencia previa. Traer mat o colchoneta.',
    organizador: 'Prof. Valeria Mansilla (Instructora Certificada)',
    tipo: 'taller_recurrente',
    categoria: 'Salud y Bienestar',
    es_recurrente: true,
    dias_dictado: ['Martes', 'Jueves'],
    horario_recurrente: '18:30 a 20:00 hs',
    fecha_inicio_ciclo: '2026-11-03',
    fecha_fin_ciclo: '2026-12-18',
    lugar: 'Salón de Usos Múltiples (Sede Roncedo)',
    cupo_maximo: 25,
    cupo_disponible: 18,
    imagen_url: '/images/socio-protector/tarjeta-bronce.png',
    es_gratuito: false,
    precio_base: 30000,
    tramos_precio: [
      { id: 't1', fecha_limite: '2026-10-31', precio: 20000, etiqueta: 'Preventa Octubre' },
      { id: 't2', fecha_limite: '2026-11-30', precio: 25000, etiqueta: 'Preventa Noviembre' },
      { id: 't3', fecha_limite: '2026-12-31', precio: 30000, etiqueta: 'Inscripción Regular Diciembre' },
    ],
    descuento_bronce_porcentaje: 2,
    descuento_plata_porcentaje: 5,
    descuento_oro_porcentaje: 10,
    link_pago: 'https://mpago.la/2qX4Jk1',
    datos_transferencia: 'Alias: BIBLIOTECA.RONCEDO.MP | CBU: 0000003100012345678901',
    estado: 'activo',
    destacado: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'evt-ajedrez-02',
    titulo: 'Taller de Ajedrez y Estrategia Cognitiva',
    descripcion: 'Clases semanales de táctica, aperturas y finales. Niveles inicial e intermedio para jóvenes y adultos. Incluye torneos internos amistosos.',
    organizador: 'Prof. Roberto Castagno',
    tipo: 'taller_recurrente',
    categoria: 'Cultura',
    es_recurrente: true,
    dias_dictado: ['Sábados'],
    horario_recurrente: '10:00 a 12:00 hs',
    fecha_inicio_ciclo: '2026-11-07',
    fecha_fin_ciclo: '2026-12-19',
    lugar: 'Sala de Lectura (Biblioteca Roncedo)',
    cupo_maximo: 16,
    cupo_disponible: 11,
    imagen_url: '/images/socio-protector/tarjeta-plata.png',
    es_gratuito: false,
    precio_base: 18000,
    tramos_precio: [
      { id: 'aj1', fecha_limite: '2026-10-31', precio: 12000, etiqueta: 'Preventa Inicial' },
      { id: 'aj2', fecha_limite: '2026-11-15', precio: 15000, etiqueta: 'Segunda Preventa' },
      { id: 'aj3', fecha_limite: '2026-12-31', precio: 18000, etiqueta: 'Precio General' },
    ],
    descuento_bronce_porcentaje: 2,
    descuento_plata_porcentaje: 5,
    descuento_oro_porcentaje: 10,
    link_pago: 'https://mpago.la/1qP8Lk9',
    datos_transferencia: 'Alias: BIBLIOTECA.RONCEDO.MP',
    estado: 'activo',
    destacado: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'evt-historia-03',
    titulo: 'Jornada Histórica: Presentación de Actas del Centenario',
    descripcion: 'Encuentro cultural abierto con historiadores locales, exhibición de documentos fundacionales del Club y la Biblioteca de 1926.',
    organizador: 'Comisión de Cultura y Archivo Histórico Roncedo',
    tipo: 'evento_unico',
    categoria: 'Cultura',
    fecha_realizacion: '2026-11-20',
    horario: '19:30 a 22:00 hs',
    es_recurrente: false,
    dias_dictado: [],
    lugar: 'Auditorio Principal Biblioteca Roncedo',
    cupo_maximo: 80,
    cupo_disponible: 54,
    imagen_url: '/images/socio-protector/tarjeta-oro.png',
    es_gratuito: true,
    precio_base: 0,
    tramos_precio: [],
    descuento_bronce_porcentaje: 2,
    descuento_plata_porcentaje: 5,
    descuento_oro_porcentaje: 10,
    estado: 'activo',
    destacado: false,
    created_at: new Date().toISOString(),
  },
];

export const INSCRIPCIONES_INICIALES: EventoInscripcion[] = [
  {
    id: 'ins-demo-01',
    evento_id: 'evt-yoga-01',
    evento_titulo: 'Taller Integral de Yoga y Bienestar Postural',
    user_id: 'user-socio-demo',
    user_nombre: 'Martín',
    user_apellido: 'Ferrero',
    user_email: 'martin.ferrero@ejemplo.com',
    user_dni: '34123456',
    user_telefono: '3584123456',
    user_tipo_protector: 'Oro',
    monto_base: 20000,
    descuento_porcentaje: 10,
    monto_descuento: 2000,
    monto_final: 18000,
    tramo_aplicado: 'Preventa Octubre',
    estado_pago: 'aprobado',
    asistencia: 'presente',
    certificado_emitido: true,
    codigo_certificado: 'RONCEDO-2026-YOGA-FERR-8A4F',
    fecha_inscripcion: '2026-10-05T14:30:00Z',
  },
];

function getStoredEventos(): EventoTaller[] {
  if (typeof window === 'undefined') return EVENTOS_INICIALES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EVENTOS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_EVENTOS_KEY, JSON.stringify(EVENTOS_INICIALES));
      return EVENTOS_INICIALES;
    }
    return JSON.parse(raw);
  } catch {
    return EVENTOS_INICIALES;
  }
}

function saveStoredEventos(eventos: EventoTaller[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_EVENTOS_KEY, JSON.stringify(eventos));
  } catch (e) {
    console.error('Error guardando eventos en localStorage:', e);
  }
}

function getStoredInscripciones(): EventoInscripcion[] {
  if (typeof window === 'undefined') return INSCRIPCIONES_INICIALES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_INSCRIPCIONES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_INSCRIPCIONES_KEY, JSON.stringify(INSCRIPCIONES_INICIALES));
      return INSCRIPCIONES_INICIALES;
    }
    return JSON.parse(raw);
  } catch {
    return INSCRIPCIONES_INICIALES;
  }
}

function saveStoredInscripciones(inscripciones: EventoInscripcion[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_INSCRIPCIONES_KEY, JSON.stringify(inscripciones));
  } catch (e) {
    console.error('Error guardando inscripciones en localStorage:', e);
  }
}

/**
 * Obtener todos los eventos / talleres
 */
export async function getEventos(): Promise<EventoTaller[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('eventos_talleres')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as EventoTaller[];
      }
    } catch (err) {
      console.warn('Supabase eventos no disponible, usando fallback local:', err);
    }
  }
  return getStoredEventos();
}

/**
 * Guardar o crear un nuevo evento / taller
 */
export async function crearEvento(
  datos: Omit<EventoTaller, 'id' | 'created_at'>
): Promise<EventoTaller> {
  const nuevoEvento: EventoTaller = {
    ...datos,
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('eventos_talleres')
        .insert([nuevoEvento])
        .select()
        .single();

      if (!error && data) {
        return data as EventoTaller;
      }
    } catch (err) {
      console.warn('Fallo creación en Supabase, guardando en local:', err);
    }
  }

  const eventos = getStoredEventos();
  const actualizados = [nuevoEvento, ...eventos];
  saveStoredEventos(actualizados);
  return nuevoEvento;
}

/**
 * Actualizar un evento existente
 */
export async function actualizarEvento(
  id: string,
  datos: Partial<EventoTaller>
): Promise<EventoTaller> {
  const datosActualizados = {
    ...datos,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('eventos_talleres')
        .update(datosActualizados)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return data as EventoTaller;
      }
    } catch (err) {
      console.warn('Fallo actualización en Supabase, actualizando local:', err);
    }
  }

  const eventos = getStoredEventos();
  const index = eventos.findIndex((e) => e.id === id);
  if (index !== -1) {
    eventos[index] = { ...eventos[index], ...datosActualizados };
    saveStoredEventos(eventos);
    return eventos[index];
  }
  throw new Error(`Evento con ID ${id} no encontrado.`);
}

/**
 * Eliminar un evento
 */
export async function eliminarEvento(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('eventos_talleres').delete().eq('id', id);
    } catch (err) {
      console.warn('Fallo eliminación en Supabase:', err);
    }
  }

  const eventos = getStoredEventos();
  const filtrados = eventos.filter((e) => e.id !== id);
  saveStoredEventos(filtrados);
}

/**
 * Obtener inscripciones (todas o por evento)
 */
export async function getInscripciones(eventoId?: string): Promise<EventoInscripcion[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('evento_inscripciones').select('*');
      if (eventoId) {
        query = query.eq('evento_id', eventoId);
      }
      const { data, error } = await query.order('fecha_inscripcion', { ascending: false });
      if (!error && data) {
        return data as EventoInscripcion[];
      }
    } catch (err) {
      console.warn('Fallo getInscripciones Supabase:', err);
    }
  }

  const todas = getStoredInscripciones();
  return eventoId ? todas.filter((i) => i.evento_id === eventoId) : todas;
}

/**
 * Obtener inscripciones de un usuario
 */
export async function getInscripcionesUsuario(userId: string): Promise<EventoInscripcion[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('evento_inscripciones')
        .select('*')
        .eq('user_id', userId)
        .order('fecha_inscripcion', { ascending: false });
      if (!error && data) {
        return data as EventoInscripcion[];
      }
    } catch (err) {
      console.warn('Fallo getInscripcionesUsuario Supabase:', err);
    }
  }

  const todas = getStoredInscripciones();
  return todas.filter((i) => i.user_id === userId);
}

/**
 * Registrar nueva inscripción a un evento
 */
export async function crearInscripcion(
  datos: Omit<EventoInscripcion, 'id' | 'fecha_inscripcion' | 'codigo_certificado'>
): Promise<EventoInscripcion> {
  const nuevaInscripcion: EventoInscripcion = {
    ...datos,
    id: `ins-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    codigo_certificado: generarCodigoCertificado(datos.evento_id, datos.user_id),
    fecha_inscripcion: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('evento_inscripciones')
        .insert([nuevaInscripcion])
        .select()
        .single();
      if (!error && data) {
        return data as EventoInscripcion;
      }
    } catch (err) {
      console.warn('Fallo creación inscripción en Supabase:', err);
    }
  }

  const inscripciones = getStoredInscripciones();
  const actualizadas = [nuevaInscripcion, ...inscripciones];
  saveStoredInscripciones(actualizadas);

  // Actualizar cupo_disponible si el evento tiene cupo
  try {
    const eventos = getStoredEventos();
    const ev = eventos.find((e) => e.id === datos.evento_id);
    if (ev && typeof ev.cupo_disponible === 'number' && ev.cupo_disponible > 0) {
      ev.cupo_disponible -= 1;
      saveStoredEventos(eventos);
    }
  } catch {}

  return nuevaInscripcion;
}

/**
 * Actualizar estado de inscripción (pago, asistencia, certificado)
 */
export async function actualizarInscripcion(
  id: string,
  patch: Partial<EventoInscripcion>
): Promise<EventoInscripcion> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('evento_inscripciones')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        return data as EventoInscripcion;
      }
    } catch (err) {
      console.warn('Fallo actualizarInscripcion Supabase:', err);
    }
  }

  const inscripciones = getStoredInscripciones();
  const index = inscripciones.findIndex((i) => i.id === id);
  if (index !== -1) {
    inscripciones[index] = { ...inscripciones[index], ...patch };
    saveStoredInscripciones(inscripciones);
    return inscripciones[index];
  }
  throw new Error(`Inscripción ${id} no encontrada.`);
}

/**
 * Subir o procesar imagen para evento/taller
 */
export async function subirImagenEvento(file: File): Promise<string> {
  try {
    const compressed = await compressImage(file, 1600, 0.85);
    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = compressed.file.name.split('.').pop() || 'webp';
        const fileName = `evento_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const storagePath = `eventos/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('eventos')
          .upload(storagePath, compressed.file, {
            contentType: 'image/webp',
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicData } = supabase.storage
            .from('eventos')
            .getPublicUrl(storagePath);
          return publicData.publicUrl;
        }
      } catch (storageErr) {
        console.warn('Storage falló, fallback a base64:', storageErr);
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(compressed.file);
    });
  } catch (err) {
    console.error('Error procesando imagen de evento:', err);
    throw err;
  }
}
