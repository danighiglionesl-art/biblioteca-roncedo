import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export async function GET() {
  try {
    const materialPath = findFotografiasDir();
    if (!materialPath) {
      return NextResponse.json({
        success: false,
        message: 'No se encontró la carpeta material/Fotografías en el proyecto.',
      });
    }

    const folders = fs.readdirSync(materialPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => {
        const folderPath = path.join(materialPath, d.name);
        const files = fs.readdirSync(folderPath).filter(isImageFile);
        return {
          nombre: d.name,
          cantidadFotos: files.length,
        };
      });

    const totalFotos = folders.reduce((acc, f) => acc + f.cantidadFotos, 0);

    return NextResponse.json({
      success: true,
      carpetaBase: materialPath,
      totalCarpetas: folders.length,
      totalFotos,
      carpetas: folders,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const limitPerFolder = body.limitPerFolder || 4; // Por defecto 4 fotos por carpeta para ingesta ágil y equilibrada

    const materialPath = findFotografiasDir();
    if (!materialPath) {
      return NextResponse.json({
        success: false,
        message: 'No se encontró la carpeta material/Fotografías.',
      }, { status: 404 });
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        message: 'Variables de Supabase no configuradas en .env.local',
      }, { status: 500 });
    }

    class SSRWebSocketDummy {}
    const client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      realtime: {
        transport: typeof WebSocket !== 'undefined' ? WebSocket : (SSRWebSocketDummy as any),
      },
    });

    const folderItems = fs.readdirSync(materialPath, { withFileTypes: true })
      .filter((d) => d.isDirectory());

    const importadas: any[] = [];
    const errores: any[] = [];

    for (const folder of folderItems) {
      const folderName = folder.name;
      const folderPath = path.join(materialPath, folderName);
      const files = fs.readdirSync(folderPath).filter(isImageFile).slice(0, limitPerFolder);

      // Clasificación inteligente según el nombre de la carpeta
      const { anio, decada, coleccion, acontecimiento, tituloBase } = inferirMetadatos(folderName);

      let index = 1;
      for (const fileName of files) {
        try {
          const filePath = path.join(folderPath, fileName);
          const fileBuffer = fs.readFileSync(filePath);
          const ext = path.extname(fileName).toLowerCase().replace('.', '') || 'jpg';
          const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

          const cleanFolderSlug = folderName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
          const cleanFileSlug = `${Date.now()}_${index}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          const storagePath = `material/${cleanFolderSlug}/${cleanFileSlug}`;

          // 1. Subir al Storage de Supabase
          const { error: uploadError } = await client.storage
            .from('fototeca')
            .upload(storagePath, fileBuffer, {
              contentType: mimeType,
              upsert: true,
            });

          let imagenUrl = '';
          if (!uploadError) {
            const { data: pubData } = client.storage
              .from('fototeca')
              .getPublicUrl(storagePath);
            imagenUrl = pubData.publicUrl;
          } else {
            console.warn(`Error storage en ${fileName}, continuando:`, uploadError.message);
          }

          if (!imagenUrl) {
            errores.push({ archivo: fileName, error: uploadError?.message || 'Error de URL pública' });
            continue;
          }

          const titulo = `${tituloBase} #${index}`;
          const descripcion = `Fotografía histórica preservada del archivo de Biblioteca Roncedo. Registro perteneciente a la colección "${folderName}".`;

          // 2. Insertar en tabla fototeca_fotos
          const { data: inserted, error: dbError } = await client
            .from('fototeca_fotos')
            .insert({
              titulo,
              descripcion,
              anio_estimado: anio,
              decada,
              lugar: 'Alcira Gigena',
              institucion: folderName.toLowerCase().includes('roncedo') ? 'Club Roncedo' : 'Biblioteca Roncedo y Comunidad',
              acontecimiento,
              coleccion,
              imagen_url: imagenUrl,
              storage_path: storagePath,
              donante_fuente: 'Archivo Fotográfico de la Biblioteca',
              subido_por_nombre: 'Biblioteca Roncedo (Archivo)',
              estado_moderacion: 'publicada',
              destacada: index === 1,
            })
            .select()
            .single();

          if (dbError) {
            errores.push({ archivo: fileName, error: dbError.message });
          } else {
            importadas.push(inserted);
          }

          index++;
        } catch (fileErr: any) {
          errores.push({ archivo: fileName, error: fileErr.message });
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalImportadas: importadas.length,
      totalErrores: errores.length,
      importadas,
      errores,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

function findFotografiasDir(): string | null {
  const possiblePaths = [
    path.join(process.cwd(), 'material', 'Fotografías'),
    path.join(process.cwd(), 'material', 'Fotografias'),
    path.join(process.cwd(), 'material', 'fotografias'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function isImageFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
}

function inferirMetadatos(folderName: string) {
  const lower = folderName.toLowerCase();

  // Detectar año por regex de 4 dígitos (19xx o 20xx)
  const matchAnio = folderName.match(/\b(19\d{2}|20\d{2})\b/);
  const anio = matchAnio ? parseInt(matchAnio[1], 10) : 2006;
  const decada = anio >= 2000 ? '2000s+' : `${Math.floor(anio / 10) * 10}s`;

  let coleccion = 'Alcira Gigena e Historia Urbana';
  let acontecimiento = folderName;
  let tituloBase = folderName;

  if (lower.includes('maiz') || lower.includes('maíz') || lower.includes('fiesta')) {
    coleccion = 'Fiestas y Tradición';
    acontecimiento = 'Fiesta Nacional del Maíz y Tradición';
    tituloBase = 'Fiesta Nacional del Maíz';
  } else if (lower.includes('peña') || lower.includes('mujeres')) {
    coleccion = 'Familias y Vecinos Ilustres';
    acontecimiento = 'Peña Tradicional de Mujeres';
    tituloBase = 'Peña Cultural y Social de Mujeres';
  } else if (lower.includes('busqueda') || lower.includes('búsqueda')) {
    coleccion = 'Alcira Gigena e Historia Urbana';
    acontecimiento = 'Jornada Comunitaria de Búsqueda y Encuentro';
    tituloBase = 'Encuentro Comunitario';
  } else if (lower.includes('roncedo') || lower.includes('futbol') || lower.includes('club')) {
    coleccion = 'Club Roncedo y Deportes';
    acontecimiento = 'Actividad Deportiva e Institucional';
    tituloBase = 'Club Sportivo Dr. Lautaro Roncedo';
  }

  return { anio, decada, coleccion, acontecimiento, tituloBase };
}
