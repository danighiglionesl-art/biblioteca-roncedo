const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const SUPABASE_URL = 'https://kthtfbkvgvucqhosrpqx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1RAT43nypTrideyGcjfUcw_AbLZvl1W';

class DummyWS {}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  realtime: { transport: DummyWS }
});

const BASE_DIR = path.join(__dirname, '..', 'material', 'Fotografías');
const PHOTOS_PER_FOLDER = 3; // 3 fotos por carpeta = ~48 fotos curadas

function inferirMetadatos(folderName) {
  const lower = folderName.toLowerCase();
  const matchAnio = folderName.match(/\b(19\d{2}|20\d{2})\b/);
  const anio = matchAnio ? parseInt(matchAnio[1], 10) : 2006;
  const decada = anio >= 2000 ? '2000s+' : `${Math.floor(anio / 10) * 10}s`;

  let coleccion = 'Alcira Gigena e Historia Urbana';
  let acontecimiento = folderName;
  let tituloBase = folderName;
  let lugar = 'Alcira Gigena';

  if (lower.includes('maiz') || lower.includes('maíz')) {
    coleccion = 'Fiestas y Tradición';
    acontecimiento = `Fiesta Nacional del Maíz (${anio})`;
    tituloBase = `Fiesta del Maíz ${anio}`;
    lugar = 'Plaza San Martín y Av. Córdoba';
  } else if (lower.includes('peña') || lower.includes('mujeres')) {
    coleccion = 'Familias y Vecinos Ilustres';
    acontecimiento = `Peña Cultural de Mujeres (${folderName.replace(/peña\s*(de)?\s*mujeres/i, '').trim() || anio})`;
    tituloBase = 'Peña Social de Mujeres de la Biblioteca';
    lugar = 'Salón de Actos de la Biblioteca Roncedo';
  } else if (lower.includes('clasico') || lower.includes('clásico')) {
    coleccion = 'Club Roncedo y Deportes';
    acontecimiento = `El Clásico de Alcira Gigena (${folderName.replace(/clásico/i, '').trim() || anio})`;
    tituloBase = 'Clásico Futbolístico de Alcira Gigena';
    lugar = 'Cancha de Roncedo';
  } else if (lower.includes('fiesta 80')) {
    coleccion = 'Club Roncedo y Deportes';
    acontecimiento = '80° Aniversario de Fundación Club Roncedo (1926-2006)';
    tituloBase = 'Gala 80° Aniversario de Roncedo';
    lugar = 'Sede Social Dr. Lautaro Roncedo';
  } else if (lower.includes('busqueda') || lower.includes('búsqueda')) {
    coleccion = 'Alcira Gigena e Historia Urbana';
    acontecimiento = `Jornada Comunitaria de Encuentro (${anio})`;
    tituloBase = 'Encuentro Comunitario de Vecinos';
    lugar = 'Alcira Gigena';
  } else {
    coleccion = 'Escuelas e Instituciones';
    acontecimiento = 'Registro Institucional y Memoria Comunitaria';
    tituloBase = 'Registro Histórico y Cultural';
    lugar = 'Alcira Gigena';
  }

  return { anio, decada, coleccion, acontecimiento, tituloBase, lugar };
}

async function main() {
  console.log('Iniciando ingesta de Fotografías Históricas hacia Supabase...');
  console.log('Carpeta origen:', BASE_DIR);

  if (!fs.existsSync(BASE_DIR)) {
    console.error('No se encontró la carpeta:', BASE_DIR);
    process.exit(1);
  }

  const carpetas = fs.readdirSync(BASE_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  console.log(`Carpetas detectadas (${carpetas.length}):`, carpetas);

  let totalSubidas = 0;
  let totalBytes = 0;
  const errores = [];

  for (const carpeta of carpetas) {
    const dirPath = path.join(BASE_DIR, carpeta);
    const archivos = fs.readdirSync(dirPath)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f) && !f.toLowerCase().includes('picasa'))
      .slice(0, PHOTOS_PER_FOLDER);

    console.log(`\nProcesando carpeta: "${carpeta}" (${archivos.length} fotos)...`);
    const meta = inferirMetadatos(carpeta);

    let idx = 1;
    for (const archivo of archivos) {
      try {
        const filePath = path.join(dirPath, archivo);
        
        // Optimizar con sharp a WebP HD max 1600px
        const webpBuffer = await sharp(filePath)
          .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();

        const cleanFolder = carpeta.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        const cleanName = archivo.toLowerCase().replace(/[^a-z0-9_-]/g, '_').replace(/_jpe?g$/i, '');
        const storagePath = `historicas/${cleanFolder}/${Date.now()}_${idx}_${cleanName}.webp`;

        // Subir a Storage
        const { error: uploadError } = await supabase.storage
          .from('fototeca')
          .upload(storagePath, webpBuffer, {
            contentType: 'image/webp',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Upload error: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('fototeca')
          .getPublicUrl(storagePath);

        const publicUrl = urlData.publicUrl;

        // Título descriptivo individual
        const titulo = `${meta.tituloBase} - Foto N° ${idx}`;
        const descripcion = `Fotografía histórica preservada en el Archivo Comunitario de la Biblioteca Roncedo. Colección: ${meta.coleccion}. Acontecimiento: ${meta.acontecimiento}.`;

        // Insertar en Base de Datos
        const { error: dbError } = await supabase
          .from('fototeca_fotos')
          .insert({
            titulo,
            descripcion,
            anio_estimado: meta.anio,
            decada: meta.decada,
            lugar: meta.lugar,
            institucion: 'Biblioteca Popular y Club Dr. Lautaro Roncedo',
            acontecimiento: meta.acontecimiento,
            coleccion: meta.coleccion,
            imagen_url: publicUrl,
            storage_path: storagePath,
            donante_fuente: 'Archivo Fotográfico de la Biblioteca Roncedo',
            subido_por_nombre: 'Comisión Histórica Roncedo',
            estado_moderacion: 'publicada',
            destacada: idx === 1, // La primera de cada lote queda destacada
            metadata: {
              archivo_original: archivo,
              carpeta_origen: carpeta,
              peso_kb: Math.round(webpBuffer.length / 1024),
            }
          });

        if (dbError) {
          throw new Error(`DB error: ${dbError.message}`);
        }

        totalSubidas++;
        totalBytes += webpBuffer.length;
        console.log(`  [OK] ${archivo} -> ${publicUrl} (${Math.round(webpBuffer.length / 1024)} KB)`);
        idx++;
      } catch (err) {
        console.error(`  [ERROR] en ${archivo}:`, err.message);
        errores.push({ carpeta, archivo, error: err.message });
      }
    }
  }

  console.log('\n======================================================');
  console.log(`Ingesta Finalizada con Éxito!`);
  console.log(`Total Fotos Subidas a Supabase: ${totalSubidas}`);
  console.log(`Espacio total ocupado en Supabase: ${Math.round(totalBytes / 1024)} KB (${(totalBytes / (1024 * 1024)).toFixed(2)} MB de 1.000 MB gratuitos)`);
  console.log(`Errores: ${errores.length}`);
  console.log('======================================================');
}

main().catch(console.error);
