/**
 * Script de Importación Masiva y Permanente de Audiolibros desde LibriVox / Internet Archive
 * Biblioteca Dr. Lautaro Roncedo (Alcira Gigena)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_PATH = path.join(__dirname, '..', 'lib', 'data', 'audiolibrosBase.json');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'BibliotecaRoncedoPWA/1.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.warn('HTTP error for ' + url, err.message);
      resolve(null);
    });
  });
}

function cleanHtml(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&Ntilde;/g, 'Ñ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseSeconds(lengthStr) {
  if (!lengthStr) return 600;
  if (typeof lengthStr === 'number') return Math.round(lengthStr);
  if (lengthStr.includes(':')) {
    const parts = lengthStr.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
  }
  const floatVal = parseFloat(lengthStr);
  return isNaN(floatVal) ? 600 : Math.round(floatVal);
}

function formatDuration(segundos) {
  if (!segundos || segundos <= 0) return '10m';
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  if (horas > 0) {
    return `${horas}h ${minutos.toString().padStart(2, '0')}m`;
  }
  return `${minutos} min`;
}

function categorizarGenero(titulo, autor, desc) {
  const t = (titulo + ' ' + autor + ' ' + desc).toLowerCase();
  
  // Autores o temáticas argentinas / hispanoamericanas
  const autoresArgentinos = [
    'hernandez', 'hernández', 'quiroga', 'borges', 'sarmiento', 'echeverria',
    'echeverría', 'lugones', 'guiraldes', 'güiraldes', 'mansilla', 'cambaceres',
    'almafuerte', 'storni', 'carriego', 'payro', 'payró', 'falucho', 'alcira gigena', 'roncedo'
  ];
  if (autoresArgentinos.some(a => t.includes(a))) {
    return 'Literatura Argentina';
  }

  if (t.includes('fabula') || t.includes('fábula') || t.includes('esopo') || t.includes('grimm') || t.includes('hadas') || t.includes('infantil') || t.includes('nino') || t.includes('niño')) {
    return 'Infantil y Juvenil';
  }

  if (t.includes('poema') || t.includes('poesia') || t.includes('poesía') || t.includes('verso') || t.includes('rima') || t.includes('becquer') || t.includes('bécquer') || t.includes('dario') || t.includes('darío')) {
    return 'Poesía';
  }

  if (t.includes('cuento') || t.includes('relato') || t.includes('leyenda') || t.includes('cortas')) {
    return 'Cuentos';
  }

  if (t.includes('historia') || t.includes('biografia') || t.includes('biografía') || t.includes('memorias') || t.includes('guerra') || t.includes('reina') || t.includes('evangelio') || t.includes('cronica')) {
    return 'Historia y Biografías';
  }

  if (t.includes('novela') || t.includes('quijote') || t.includes('galdos') || t.includes('galdós') || t.includes('alarcon') || t.includes('alarcón') || t.includes('dumas') || t.includes('verne')) {
    return 'Novelas';
  }

  return 'Clásicos Universales';
}

function esArgentino(titulo, autor, desc) {
  const t = (titulo + ' ' + autor + ' ' + desc).toLowerCase();
  const marcas = [
    'argentina', 'argentino', 'cordoba', 'córdoba', 'buenos aires', 'pampa', 'gaucho',
    'hernandez', 'hernández', 'quiroga', 'sarmiento', 'echeverria', 'echeverría', 'lugones',
    'guiraldes', 'güiraldes', 'storni', 'alcira gigena'
  ];
  return marcas.some(m => t.includes(m));
}

async function procesarDoc(doc) {
  const identifier = doc.identifier;
  const metaUrl = `https://archive.org/metadata/${identifier}`;
  const metadata = await fetchJson(metaUrl);
  if (!metadata || !metadata.files) return null;

  // Filtrar archivos MP3: preferir 64kbps, o VBR
  let mp3Files = metadata.files.filter(f => f.format === '64Kbps MP3');
  if (mp3Files.length === 0) {
    mp3Files = metadata.files.filter(f => f.format === 'VBR MP3' && f.name.endsWith('.mp3'));
  }
  if (mp3Files.length === 0) {
    mp3Files = metadata.files.filter(f => f.name.endsWith('.mp3') && !f.name.includes('_vbr'));
  }

  if (mp3Files.length === 0) return null;

  // Ordenar archivos por nombre o track
  mp3Files.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  let duracionTotal = 0;
  const capitulos = [];

  mp3Files.forEach((f, idx) => {
    const seg = parseSeconds(f.length);
    duracionTotal += seg;
    const num = idx + 1;
    let capTitle = cleanHtml(f.title) || cleanHtml(f.name.replace(/\.mp3$/i, '').replace(/_/g, ' '));
    // Limpiar prefijo numérico redundante si existe
    capTitle = capTitle.replace(/^\d+[\s_-]*/, '');
    if (!capTitle) capTitle = `Capítulo ${num}`;

    capitulos.push({
      id: `${identifier}-c${num}`,
      numero: num,
      titulo: capTitle,
      audio_url: `https://archive.org/download/${identifier}/${encodeURIComponent(f.name)}`,
      duracion_segundos: seg,
      duracion_texto: formatDuration(seg),
      narrador: cleanHtml(f.artist || f.creator || '') || undefined,
    });
  });

  const rawTitle = cleanHtml(doc.title || identifier);
  const rawCreator = cleanHtml(doc.creator || 'Dominio Público');
  const rawDesc = cleanHtml(doc.description || '');

  // Limpiar nota técnica de LibriVox en la sinopsis
  const sinopsisLimpia = rawDesc
    .replace(/For further information.*?recording\./gi, '')
    .replace(/M4B format available/gi, '')
    .trim();

  const genero = categorizarGenero(rawTitle, rawCreator, rawDesc);
  const esArg = esArgentino(rawTitle, rawCreator, rawDesc);
  const portada = `https://archive.org/services/img/${identifier}`;

  return {
    id: `librivox-${identifier}`,
    titulo: rawTitle,
    subtitulo: capitulos.length > 1 ? `Audiolibro en ${capitulos.length} capítulos` : 'Audiolibro completo',
    autor: rawCreator,
    narrador: capitulos[0]?.narrador || 'Comunidad LibriVox',
    genero,
    sinopsis: sinopsisLimpia.slice(0, 500) || `Obra clásica en idioma español narrada en audio por la comunidad LibriVox.`,
    duracion_total_segundos: duracionTotal,
    duracion_texto: formatDuration(duracionTotal),
    idioma: 'Español',
    portada_url: portada,
    fuente: 'librivox',
    fuente_nombre: 'LibriVox / Internet Archive',
    enlace_fuente: `https://archive.org/details/${identifier}`,
    licencia: 'Dominio Público',
    es_argentino_o_latino: esArg,
    anio_publicacion: doc.year ? String(doc.year) : 'Clásico',
    capitulos,
    fecha_incorporacion: doc.publicdate ? doc.publicdate.split('T')[0] : '2026-04-15',
    activo: true,
    reproducciones: doc.downloads ? Math.max(100, Math.round(doc.downloads / 100)) : 250,
    tags: [genero.toLowerCase(), 'librivox', 'audiolibro', 'español', rawCreator.toLowerCase()].filter(Boolean)
  };
}

async function main() {
  console.log('=== Iniciando sincronización masiva LibriVox en español ===');

  // Leer base actual si existe para preservar obras propias de Biblioteca Roncedo
  let existentes = [];
  if (fs.existsSync(BASE_PATH)) {
    try {
      existentes = JSON.parse(fs.readFileSync(BASE_PATH, 'utf-8'));
    } catch (e) {}
  }

  // Filtrar obras institucionales de Roncedo para mantenerlas siempre al tope
  const obrasRoncedo = existentes.filter(a => a.fuente === 'biblioteca_roncedo' || a.id.includes('roncedo'));

  // Obtener la lista completa de obras en español de LibriVox desde Internet Archive
  const searchUrl = 'https://archive.org/advancedsearch.php?q=collection:librivoxaudio+AND+language:(spanish+OR+spa)&fl[]=identifier,title,creator,description,year,downloads,publicdate&sort[]=downloads+desc&rows=150&output=json';
  
  console.log('Consultando API de Internet Archive / LibriVox...');
  const searchData = await fetchJson(searchUrl);
  if (!searchData || !searchData.response || !searchData.response.docs) {
    console.error('Error al obtener lista de audiolibros');
    return;
  }

  const docs = searchData.response.docs;
  console.log(`Encontradas ${docs.length} obras principales en español. Procesando en lotes concurrentes...`);

  const procesados = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    console.log(`Procesando lote ${Math.floor(i / BATCH_SIZE) + 1} de ${Math.ceil(docs.length / BATCH_SIZE)} (obras ${i + 1} a ${Math.min(i + BATCH_SIZE, docs.length)})...`);
    
    const results = await Promise.all(batch.map(d => procesarDoc(d)));
    results.forEach(res => {
      if (res && res.capitulos && res.capitulos.length > 0) {
        procesados.push(res);
      }
    });
  }

  console.log(`\nProcesamiento finalizado con éxito.`);
  console.log(`Total de obras de LibriVox procesadas con capítulos y audio MP3: ${procesados.length}`);

  // Mezclar: Primero obras institucionales de Roncedo, luego las obras maestras ordenadas
  const catalogoFinal = [...obrasRoncedo];
  const idsYaAgregados = new Set(catalogoFinal.map(a => a.id));

  // Priorizar obras argentinas primero
  const argentinos = procesados.filter(p => p.es_argentino_o_latino);
  const resto = procesados.filter(p => !p.es_argentino_o_latino);

  argentinos.forEach(a => {
    if (!idsYaAgregados.has(a.id)) {
      catalogoFinal.push(a);
      idsYaAgregados.add(a.id);
    }
  });

  resto.forEach(a => {
    if (!idsYaAgregados.has(a.id)) {
      catalogoFinal.push(a);
      idsYaAgregados.add(a.id);
    }
  });

  console.log(`Guardando ${catalogoFinal.length} obras en ${BASE_PATH}...`);
  fs.writeFileSync(BASE_PATH, JSON.stringify(catalogoFinal, null, 2), 'utf-8');
  console.log('¡Catálogo base de audiolibros expandido y guardado exitosamente!');
}

main().catch(console.error);
