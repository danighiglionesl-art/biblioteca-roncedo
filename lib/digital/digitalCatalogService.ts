import fs from 'fs';
import path from 'path';
import { LibroDigital, FuenteDigital, DisponibilidadDigital, MetricasBibliotecaDigital, DigitalSearchParams } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

let memoryCatalogCache: LibroDigital[] | null = null;
let lastCacheLoad = 0;
const CACHE_TTL = 1000 * 60 * 15; // 15 minutos en memoria

function normalizar(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Carga el catálogo base desde el archivo maestro pre-indexado
 */
export function getCatalogoBaseMaestro(): LibroDigital[] {
  try {
    const jsonPath = path.join(process.cwd(), 'lib', 'data', 'catalogoDigitalMaestro.json');
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error leyendo catalogoDigitalMaestro.json:', err);
  }
  return [];
}

/**
 * Carga las obras personalizadas agregadas por el administrador
 */
export function getCatalogoPersonalizado(): LibroDigital[] {
  try {
    const jsonPath = path.join(process.cwd(), 'lib', 'data', 'librosDigitalesPersonalizados.json');
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, 'utf8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('Aviso leyendo librosDigitalesPersonalizados.json:', err);
  }
  return [];
}

/**
 * Guarda las obras personalizadas en el archivo local de persistencia
 */
export function guardarCatalogoPersonalizadoEnDisco(libros: LibroDigital[]): void {
  try {
    const jsonPath = path.join(process.cwd(), 'lib', 'data', 'librosDigitalesPersonalizados.json');
    fs.writeFileSync(jsonPath, JSON.stringify(libros, null, 2), 'utf8');
  } catch (err) {
    console.warn('Aviso guardando librosDigitalesPersonalizados.json:', err);
  }
}

/**
 * Obtiene todas las obras digitales combinando Supabase (si está disponible), catálogo personalizado y catálogo maestro
 */
export async function getTodosLosLibrosDigitales(): Promise<LibroDigital[]> {
  const now = Date.now();
  if (memoryCatalogCache && now - lastCacheLoad < CACHE_TTL) {
    return memoryCatalogCache;
  }

  // 1. Cargar base local de 5.800+ obras maestras
  const base = getCatalogoBaseMaestro();
  const mapa = new Map<string, LibroDigital>();

  base.forEach((l) => {
    mapa.set(l.id, l);
  });

  // 2. Cargar obras personalizadas agregadas por administradores en archivo local
  const personalizados = getCatalogoPersonalizado();
  personalizados.forEach((p) => {
    mapa.set(p.id, p);
  });

  // 3. Si Supabase está conectado, traer obras adicionales o actualizadas
  if (isSupabaseConfigured && supabase) {
    try {
      const fetchPromise = supabase
        .from('libros_digitales')
        .select('*')
        .order('created_at', { ascending: false });

      const timeoutPromise = new Promise<any>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error('Timeout') }), 2500)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (!error && Array.isArray(data)) {
        for (const item of data) {
          const libro: LibroDigital = {
            id: item.id,
            titulo: item.titulo,
            autor: item.autor,
            editorial: item.editorial,
            anio: item.anio,
            idioma: item.idioma || 'es',
            descripcion: item.descripcion,
            portada_url: item.portada_url,
            fuente: item.fuente as FuenteDigital,
            fuentes_adicionales: item.fuentes_adicionales || [],
            enlace_oficial: item.enlace_oficial,
            enlace_lectura: item.enlace_lectura,
            enlace_descarga: item.enlace_descarga,
            disponibilidad: item.disponibilidad as DisponibilidadDigital,
            formatos: item.formatos || [],
            es_argentino_o_latino: item.es_argentino_o_latino,
            genero_o_materia: item.genero_o_materia,
            archivo_pdf_url: item.archivo_pdf_url,
            tipo_licencia: item.tipo_licencia,
            estado_enlace: item.estado_enlace,
            ultima_verificacion: item.ultima_verificacion,
            subido_por: item.subido_por,
            created_at: item.created_at,
          };
          mapa.set(libro.id, libro);
        }
      }
    } catch (e) {
      console.warn('Aviso leyendo libros_digitales de Supabase:', e);
    }
  }

  const result = Array.from(mapa.values());

  // Ordenar priorizando obras locales de Roncedo y luego autores argentinos/latinos
  result.sort((a, b) => {
    if (a.fuente === 'roncedo_digital' && b.fuente !== 'roncedo_digital') return -1;
    if (b.fuente === 'roncedo_digital' && a.fuente !== 'roncedo_digital') return 1;

    const pA = a.es_argentino_o_latino ? 2 : 0;
    const pB = b.es_argentino_o_latino ? 2 : 0;
    return pB - pA;
  });

  memoryCatalogCache = result;
  lastCacheLoad = now;
  return result;
}

/**
 * Invalida la caché en memoria cuando el administrador agrega un libro
 */
export function invalidarCacheDigital() {
  memoryCatalogCache = null;
  lastCacheLoad = 0;
}

/**
 * Motor de búsqueda unificada y filtrado sobre las 5.800+ obras
 */
export async function buscarLibrosDigitales(params: DigitalSearchParams): Promise<{
  libros: LibroDigital[];
  total: number;
  pagina: number;
  totalPaginas: number;
  metricas: MetricasBibliotecaDigital;
}> {
  const todos = await getTodosLosLibrosDigitales();
  const q = params.q?.trim() || '';
  const tipoBusqueda = params.tipo_busqueda || 'todos';
  const filtroFuente = params.fuente || 'todas';
  const filtroDisp = params.disponibilidad || 'todas';
  const soloLatinos = Boolean(params.solo_argentinos_latinos);
  const pagina = Math.max(1, Number(params.pagina) || 1);
  const limite = Math.min(100, Math.max(1, Number(params.limite) || 24));

  let filtrados = todos;

  // 1. Filtro de búsqueda textual
  if (q) {
    const qNorm = normalizar(q);
    filtrados = filtrados.filter((l) => {
      const tit = normalizar(l.titulo);
      const aut = normalizar(l.autor);
      const edit = normalizar(l.editorial || '');
      const gen = normalizar(l.genero_o_materia || '');
      const desc = normalizar(l.descripcion || '');

      if (tipoBusqueda === 'titulo') return tit.includes(qNorm);
      if (tipoBusqueda === 'autor') return aut.includes(qNorm);
      if (tipoBusqueda === 'editorial') return edit.includes(qNorm);
      if (tipoBusqueda === 'genero') return gen.includes(qNorm);
      return (
        tit.includes(qNorm) ||
        aut.includes(qNorm) ||
        edit.includes(qNorm) ||
        gen.includes(qNorm) ||
        desc.includes(qNorm)
      );
    });
  }

  // 2. Filtro por Fuente / Plataforma
  if (filtroFuente !== 'todas') {
    filtrados = filtrados.filter(
      (l) => l.fuente === filtroFuente || l.fuentes_adicionales?.includes(filtroFuente)
    );
  }

  // 3. Filtro por Disponibilidad
  if (filtroDisp !== 'todas') {
    filtrados = filtrados.filter((l) => l.disponibilidad === filtroDisp);
  }

  // 4. Filtro por autores argentinos y latinoamericanos
  if (soloLatinos) {
    filtrados = filtrados.filter((l) => l.es_argentino_o_latino);
  }

  const total = filtrados.length;
  const totalPaginas = Math.ceil(total / limite) || 1;
  const inicio = (pagina - 1) * limite;
  const librosPaginados = filtrados.slice(inicio, inicio + limite);

  // Calcular métricas generales en tiempo real
  const porFuente: Record<FuenteDigital, number> = {
    gutenberg: 0,
    wikisource: 0,
    cervantes: 0,
    openlibrary: 0,
    bnmm: 0,
    bne: 0,
    roncedo_digital: 0,
  };

  let conLectura = 0;
  let conDescarga = 0;
  let enlacesRotos = 0;

  for (const l of todos) {
    if (porFuente[l.fuente] !== undefined) {
      porFuente[l.fuente]++;
    }
    if (l.disponibilidad === 'descarga_libre') conDescarga++;
    if (l.disponibilidad === 'lectura_directa' || l.disponibilidad === 'descarga_libre') conLectura++;
    if (l.estado_enlace === 'roto') enlacesRotos++;
  }

  const metricas: MetricasBibliotecaDigital = {
    total_obras_unicas: todos.length,
    por_fuente: porFuente,
    disponibles_lectura_online: conLectura,
    disponibles_descarga: conDescarga,
    enlaces_verificados: todos.length - enlacesRotos,
    enlaces_rotos: enlacesRotos,
    ultima_sincronizacion: new Date().toISOString(),
  };

  return {
    libros: librosPaginados,
    total,
    pagina,
    totalPaginas,
    metricas,
  };
}

/**
 * Agrega o edita un libro digital con todos los campos configurables
 */
export async function guardarLibroBibliotecaRoncedo(
  libro: Partial<LibroDigital>,
  userId?: string
): Promise<{ success: boolean; error?: string; libro?: LibroDigital }> {
  try {
    const id = libro.id || `roncedo-pdf-${Date.now()}`;
    const formatos = libro.formatos || [];

    if (libro.archivo_pdf_url && !formatos.some((f) => f.tipo === 'pdf')) {
      formatos.push({
        tipo: 'pdf',
        label: 'Descargar PDF (Biblioteca Roncedo)',
        url: libro.archivo_pdf_url,
      });
    }

    const fuente = (libro.fuente as FuenteDigital) || 'roncedo_digital';
    const disponibilidad = (libro.disponibilidad as DisponibilidadDigital) || 'descarga_libre';
    const esArgentinoLatino = typeof libro.es_argentino_o_latino === 'boolean'
      ? libro.es_argentino_o_latino
      : fuente === 'roncedo_digital' || fuente === 'bnmm';

    const nuevoLibro: LibroDigital = {
      id,
      titulo: libro.titulo?.trim() || 'Sin título',
      autor: libro.autor?.trim() || 'Biblioteca Roncedo',
      editorial: libro.editorial?.trim() || 'Ediciones Biblioteca Dr. Lautaro Roncedo',
      anio: libro.anio ? Number(libro.anio) : new Date().getFullYear(),
      idioma: libro.idioma?.trim() || 'es',
      descripcion: libro.descripcion?.trim() || 'Publicación digitalizada de la colección oficial de Biblioteca Roncedo.',
      portada_url: libro.portada_url?.trim() || '/images/escudo-roncedo.png',
      fuente,
      enlace_oficial: libro.enlace_oficial?.trim() || libro.archivo_pdf_url || `/biblioteca-digital?id=${id}`,
      enlace_lectura: libro.enlace_lectura?.trim() || libro.archivo_pdf_url,
      enlace_descarga: libro.enlace_descarga?.trim() || libro.archivo_pdf_url,
      disponibilidad,
      formatos,
      es_argentino_o_latino: esArgentinoLatino,
      genero_o_materia: libro.genero_o_materia?.trim() || 'Colección Digital Biblioteca Roncedo',
      archivo_pdf_url: libro.archivo_pdf_url?.trim(),
      tipo_licencia: libro.tipo_licencia?.trim() || 'Dominio Público',
      estado_enlace: 'verificado',
      ultima_verificacion: new Date().toISOString(),
      subido_por: userId || libro.subido_por,
      created_at: libro.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Guardar en catálogo personalizado local (persistencia garantizada)
    const personalizados = getCatalogoPersonalizado();
    const indice = personalizados.findIndex((p) => p.id === id);
    if (indice >= 0) {
      personalizados[indice] = nuevoLibro;
    } else {
      personalizados.unshift(nuevoLibro);
    }
    guardarCatalogoPersonalizadoEnDisco(personalizados);

    // 2. Guardar en Supabase si está disponible
    if (isSupabaseConfigured && supabase) {
      const payload = {
        id: nuevoLibro.id,
        titulo: nuevoLibro.titulo,
        autor: nuevoLibro.autor,
        editorial: nuevoLibro.editorial,
        idioma: nuevoLibro.idioma,
        genero_o_materia: nuevoLibro.genero_o_materia,
        anio: Number(nuevoLibro.anio) || new Date().getFullYear(),
        portada_url: nuevoLibro.portada_url,
        descripcion: nuevoLibro.descripcion,
        fuente: nuevoLibro.fuente,
        enlace_oficial: nuevoLibro.enlace_oficial,
        enlace_lectura: nuevoLibro.enlace_lectura,
        enlace_descarga: nuevoLibro.enlace_descarga,
        disponibilidad: nuevoLibro.disponibilidad,
        formatos: nuevoLibro.formatos,
        tipo_licencia: nuevoLibro.tipo_licencia,
        es_argentino_o_latino: nuevoLibro.es_argentino_o_latino,
        archivo_pdf_url: nuevoLibro.archivo_pdf_url,
        estado_enlace: 'verificado',
        ultima_verificacion: new Date().toISOString(),
        subido_por: userId || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('libros_digitales').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Aviso guardando en Supabase libros_digitales:', error.message);
      }
    }

    invalidarCacheDigital();
    return { success: true, libro: nuevoLibro };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al guardar libro digital' };
  }
}

/**
 * Elimina un libro digital de la Biblioteca Roncedo
 */
export async function eliminarLibroBibliotecaRoncedo(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Eliminar de catálogo personalizado local
    const personalizados = getCatalogoPersonalizado();
    const filtrados = personalizados.filter((p) => p.id !== id);
    guardarCatalogoPersonalizadoEnDisco(filtrados);

    // 2. Eliminar de Supabase
    if (isSupabaseConfigured && supabase) {
      await supabase.from('libros_digitales').delete().eq('id', id);
    }

    invalidarCacheDigital();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al eliminar libro digital' };
  }
}
