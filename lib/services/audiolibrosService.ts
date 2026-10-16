/**
 * Servicio Central de Audiolibros de Biblioteca Roncedo
 * Manejo de catálogo, streaming, búsqueda inteligente, estadísticas y sincronización con LibriVox e Internet Archive.
 */

import { Audiolibro, CapituloAudiolibro, FuenteAudiolibro } from '@/types/audiolibros';
import AUDIOLIBROS_BASE from '@/lib/data/audiolibrosBase.json';
import fs from 'fs';
import path from 'path';

const AUDIOLIBROS_FILE_PATH = path.join(process.cwd(), 'lib', 'data', 'audiolibrosPersonalizados.json');

/**
 * Obtiene la lista completa de audiolibros (base curada + personalizados agregados por el admin)
 */
export function obtenerTodosLosAudiolibros(): Audiolibro[] {
  let personalizados: Audiolibro[] = [];

  try {
    if (fs.existsSync(AUDIOLIBROS_FILE_PATH)) {
      const contenido = fs.readFileSync(AUDIOLIBROS_FILE_PATH, 'utf-8');
      personalizados = JSON.parse(contenido);
    }
  } catch (error) {
    console.warn('No se pudo leer audiolibrosPersonalizados.json:', error);
  }

  const mapa = new Map<string, Audiolibro>();

  // Cargar base
  (AUDIOLIBROS_BASE as unknown as Audiolibro[]).forEach((audio) => {
    mapa.set(audio.id, audio);
  });

  // Sobrescribir o añadir personalizados
  personalizados.forEach((audio) => {
    mapa.set(audio.id, audio);
  });

  return Array.from(mapa.values());
}

/**
 * Guarda o actualiza un audiolibro (para uso en API de Administración)
 */
export function guardarAudiolibroEnDisco(audiolibro: Audiolibro): boolean {
  try {
    let personalizados: Audiolibro[] = [];
    if (fs.existsSync(AUDIOLIBROS_FILE_PATH)) {
      const contenido = fs.readFileSync(AUDIOLIBROS_FILE_PATH, 'utf-8');
      personalizados = JSON.parse(contenido);
    }

    const index = personalizados.findIndex((a) => a.id === audiolibro.id);
    if (index >= 0) {
      personalizados[index] = audiolibro;
    } else {
      personalizados.unshift(audiolibro);
    }

    fs.writeFileSync(AUDIOLIBROS_FILE_PATH, JSON.stringify(personalizados, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error guardando audiolibro en disco:', error);
    return false;
  }
}

/**
 * Elimina un audiolibro de personalizados o lo desactiva
 */
export function eliminarAudiolibroEnDisco(id: string): boolean {
  try {
    if (!fs.existsSync(AUDIOLIBROS_FILE_PATH)) return false;
    const contenido = fs.readFileSync(AUDIOLIBROS_FILE_PATH, 'utf-8');
    let personalizados: Audiolibro[] = JSON.parse(contenido);
    personalizados = personalizados.filter((a) => a.id !== id);
    fs.writeFileSync(AUDIOLIBROS_FILE_PATH, JSON.stringify(personalizados, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error eliminando audiolibro:', error);
    return false;
  }
}

/**
 * Normaliza cadenas para búsquedas insensibles a mayúsculas y tildes
 */
function normalizarTexto(texto: string): string {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export interface FiltrosAudiolibros {
  query?: string;
  genero?: string;
  soloArgentinosLatinos?: boolean;
  fuente?: string;
  duracion?: 'todas' | 'corta' | 'media' | 'larga'; // corta: < 45 min, media: 45 min - 2h, larga: > 2h
  pagina?: number;
  limite?: number;
  orden?: 'relevancia' | 'populares' | 'recientes' | 'alfabetico';
}

/**
 * Búsqueda inteligente y filtrado facetado
 */
export function buscarAudiolibros(filtros: FiltrosAudiolibros) {
  const {
    query = '',
    genero = 'todos',
    soloArgentinosLatinos = false,
    fuente = 'todas',
    duracion = 'todas',
    pagina = 1,
    limite = 18,
    orden = 'populares',
  } = filtros;

  const todos = obtenerTodosLosAudiolibros();
  const qNorm = normalizarTexto(query);

  let filtrados = todos.filter((audio) => {
    if (!audio.activo) return false;

    // Filtro por texto
    if (qNorm) {
      const tituloNorm = normalizarTexto(audio.titulo);
      const autorNorm = normalizarTexto(audio.autor);
      const sinopsisNorm = normalizarTexto(audio.sinopsis);
      const tagsNorm = normalizarTexto((audio.tags || []).join(' '));
      const narradorNorm = normalizarTexto(audio.narrador || '');

      const matches =
        tituloNorm.includes(qNorm) ||
        autorNorm.includes(qNorm) ||
        sinopsisNorm.includes(qNorm) ||
        tagsNorm.includes(qNorm) ||
        narradorNorm.includes(qNorm);

      if (!matches) return false;
    }

    // Filtro por género
    if (genero && genero !== 'todos') {
      if (normalizarTexto(audio.genero) !== normalizarTexto(genero)) {
        return false;
      }
    }

    // Filtro literatura argentina / latinoamericana
    if (soloArgentinosLatinos && !audio.es_argentino_o_latino) {
      return false;
    }

    // Filtro por fuente
    if (fuente && fuente !== 'todas') {
      if (audio.fuente !== fuente) return false;
    }

    // Filtro por duración
    if (duracion && duracion !== 'todas') {
      const seg = audio.duracion_total_segundos || 0;
      if (duracion === 'corta' && seg > 2700) return false; // > 45m
      if (duracion === 'media' && (seg <= 2700 || seg > 7200)) return false; // entre 45m y 2h
      if (duracion === 'larga' && seg <= 7200) return false; // > 2h
    }

    return true;
  });

  // Ordenamiento
  if (orden === 'populares') {
    filtrados.sort((a, b) => (b.reproducciones || 0) - (a.reproducciones || 0));
  } else if (orden === 'recientes') {
    filtrados.sort((a, b) => (b.fecha_incorporacion || '').localeCompare(a.fecha_incorporacion || ''));
  } else if (orden === 'alfabetico') {
    filtrados.sort((a, b) => a.titulo.localeCompare(b.titulo));
  }

  const total = filtrados.length;
  const totalPaginas = Math.ceil(total / limite) || 1;
  const inicio = (pagina - 1) * limite;
  const audiolibrosPaginados = filtrados.slice(inicio, inicio + limite);

  return {
    audiolibros: audiolibrosPaginados,
    total,
    pagina,
    totalPaginas,
    limite,
  };
}

/**
 * Obtiene métricas generales para el panel administrativo y los resúmenes
 */
export function obtenerMetricasAudiolibros() {
  const todos = obtenerTodosLosAudiolibros();
  const activos = todos.filter((a) => a.activo);
  const totalReproducciones = todos.reduce((acc, a) => acc + (a.reproducciones || 0), 0);
  const totalSegundos = todos.reduce((acc, a) => acc + (a.duracion_total_segundos || 0), 0);
  const totalHoras = Math.round(totalSegundos / 3600);

  const porGenero: Record<string, number> = {};
  const porFuente: Record<string, number> = {};

  todos.forEach((a) => {
    porGenero[a.genero] = (porGenero[a.genero] || 0) + 1;
    porFuente[a.fuente_nombre || a.fuente] = (porFuente[a.fuente_nombre || a.fuente] || 0) + 1;
  });

  return {
    totalObras: todos.length,
    obrasActivas: activos.length,
    totalReproducciones,
    totalHorasEscucha: totalHoras,
    totalCapitulos: todos.reduce((acc, a) => acc + (a.capitulos ? a.capitulos.length : 0), 0),
    argentinosLatinos: todos.filter((a) => a.es_argentino_o_latino).length,
    porGenero,
    porFuente,
  };
}

/**
/**
 * Sincronización masiva desde LibriVox / Internet Archive
 * Permite incorporar las 560+ obras en español disponibles en dominio público
 */
export async function sincronizarLibrivoxMasivo(limite = 150): Promise<{ incorporados: number; total: number }> {
  try {
    const searchUrl = `https://archive.org/advancedsearch.php?q=collection:librivoxaudio+AND+language:(spanish+OR+spa)&fl[]=identifier,title,creator,description,year,downloads,publicdate&sort[]=downloads+desc&rows=${limite}&output=json`;
    const res = await fetch(searchUrl, { headers: { 'User-Agent': 'BibliotecaRoncedoPWA/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const docs = data?.response?.docs || [];

    const existentes = obtenerTodosLosAudiolibros();
    const existentesIds = new Set(existentes.map((a) => a.id));

    let personalizados: Audiolibro[] = [];
    if (fs.existsSync(AUDIOLIBROS_FILE_PATH)) {
      try {
        personalizados = JSON.parse(fs.readFileSync(AUDIOLIBROS_FILE_PATH, 'utf-8'));
      } catch {}
    }

    let incorporados = 0;

    for (const doc of docs) {
      if (!doc.identifier || !doc.title) continue;
      const id = `librivox-${doc.identifier}`;
      if (existentesIds.has(id)) continue;

      try {
        const metaRes = await fetch(`https://archive.org/metadata/${doc.identifier}`, {
          headers: { 'User-Agent': 'BibliotecaRoncedoPWA/1.0' },
        });
        if (!metaRes.ok) continue;
        const meta = await metaRes.json();
        const files: any[] = meta?.files || [];

        let mp3s = files.filter((f) => f.format === '64Kbps MP3');
        if (mp3s.length === 0) mp3s = files.filter((f) => f.format === 'VBR MP3' && f.name.endsWith('.mp3'));
        if (mp3s.length === 0) mp3s = files.filter((f) => f.name.endsWith('.mp3') && !f.name.includes('_vbr'));
        if (mp3s.length === 0) continue;

        mp3s.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        let duracionTotal = 0;
        const capitulos = mp3s.map((f, idx) => {
          const seg = typeof f.length === 'number' ? Math.round(f.length) : parseInt(f.length, 10) || 600;
          duracionTotal += seg;
          const num = idx + 1;
          const title = (f.title || f.name.replace(/\.mp3$/i, '').replace(/_/g, ' ')).replace(/^\d+[\s_-]*/, '') || `Capítulo ${num}`;
          return {
            id: `${doc.identifier}-c${num}`,
            numero: num,
            titulo: title,
            audio_url: `https://archive.org/download/${doc.identifier}/${encodeURIComponent(f.name)}`,
            duracion_segundos: seg,
            duracion_texto: `${Math.floor(seg / 60)} min`,
            narrador: f.artist || f.creator || undefined,
          };
        });

        const rawDesc = (doc.description || '')
          .replace(/<[^>]+>/g, '')
          .replace(/For further information.*?recording\./gi, '')
          .trim();

        const horas = Math.floor(duracionTotal / 3600);
        const mins = Math.floor((duracionTotal % 3600) / 60);
        const durTexto = horas > 0 ? `${horas}h ${mins}m` : `${mins} min`;

        const nuevo: Audiolibro = {
          id,
          titulo: doc.title,
          subtitulo: capitulos.length > 1 ? `Audiolibro en ${capitulos.length} capítulos` : 'Audiolibro completo',
          autor: doc.creator || 'Dominio Público',
          narrador: capitulos[0]?.narrador || 'Comunidad LibriVox',
          genero: 'Clásicos Universales',
          sinopsis: rawDesc.slice(0, 500) || 'Obra clásica en idioma español en dominio público.',
          duracion_total_segundos: duracionTotal,
          duracion_texto: durTexto,
          idioma: 'Español',
          portada_url: `https://archive.org/services/img/${doc.identifier}`,
          fuente: 'librivox',
          fuente_nombre: 'LibriVox / Internet Archive',
          enlace_fuente: `https://archive.org/details/${doc.identifier}`,
          licencia: 'Dominio Público',
          es_argentino_o_latino: false,
          anio_publicacion: doc.year ? String(doc.year) : 'Clásico',
          capitulos,
          fecha_incorporacion: doc.publicdate ? doc.publicdate.split('T')[0] : new Date().toISOString().split('T')[0],
          activo: true,
          reproducciones: doc.downloads ? Math.max(100, Math.round(doc.downloads / 100)) : 150,
          tags: ['librivox', 'audiolibro', 'español'],
        };

        personalizados.unshift(nuevo);
        existentesIds.add(id);
        incorporados++;
      } catch (err) {
        console.warn(`Error procesando metadata de ${doc.identifier}:`, err);
      }
    }

    if (incorporados > 0) {
      fs.writeFileSync(AUDIOLIBROS_FILE_PATH, JSON.stringify(personalizados, null, 2), 'utf-8');
    }

    const totalActual = obtenerTodosLosAudiolibros().length;
    return { incorporados, total: totalActual };
  } catch (error) {
    console.error('Error en sincronizarLibrivoxMasivo:', error);
    return { incorporados: 0, total: obtenerTodosLosAudiolibros().length };
  }
}

/**
 * Consulta en tiempo real a Internet Archive / LibriVox API para importar audiolibros en español
 */
export async function buscarEnInternetArchive(termino: string, limite = 10): Promise<Audiolibro[]> {
  try {
    const q = encodeURIComponent(`mediatype:audio AND language:spa AND (${termino || 'literatura'})`);
    const url = `https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier,title,creator,description,year,downloads&sort[]=downloads+desc&rows=${limite}&output=json`;

    const res = await fetch(url, { headers: { 'User-Agent': 'BibliotecaRoncedo/1.0' } });
    if (!res.ok) return [];

    const data = await res.json();
    const docs = data?.response?.docs || [];

    const importados: Audiolibro[] = [];

    for (const doc of docs) {
      if (!doc.identifier || !doc.title) continue;

      const id = `ia-${doc.identifier}`;
      const portada = `https://archive.org/services/img/${doc.identifier}`;
      const streamUrl = `https://archive.org/download/${doc.identifier}/${doc.identifier}_64kb.mp3`;

      importados.push({
        id,
        titulo: doc.title,
        autor: doc.creator || 'Autor Clásico',
        genero: 'Clásicos Universales',
        sinopsis: (doc.description || 'Audiolibro disponible en el catálogo de Internet Archive / LibriVox.').replace(/<[^>]+>/g, '').slice(0, 450),
        duracion_total_segundos: 3600,
        duracion_texto: '1h aprox.',
        idioma: 'Español',
        portada_url: portada,
        fuente: 'internet_archive',
        fuente_nombre: 'Internet Archive / LibriVox',
        enlace_fuente: `https://archive.org/details/${doc.identifier}`,
        licencia: 'Dominio Público',
        es_argentino_o_latino: false,
        anio_publicacion: doc.year || 'Clásico',
        capitulos: [
          {
            id: `${id}-cap-1`,
            numero: 1,
            titulo: `${doc.title} (Obra Completa)`,
            audio_url: streamUrl,
            duracion_segundos: 3600,
            duracion_texto: '1h 00m',
          },
        ],
        fecha_incorporacion: new Date().toISOString().split('T')[0],
        activo: true,
        reproducciones: doc.downloads || 150,
      });
    }

    return importados;
  } catch (error) {
    console.error('Error buscando en Internet Archive:', error);
    return [];
  }
}


