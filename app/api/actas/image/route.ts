import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const fileParam = request.nextUrl.searchParams.get('file');

    if (!fileParam) {
      return new Response('Parámetro de archivo requerido', { status: 400 });
    }

    const cleanName = path.basename(decodeURIComponent(fileParam));
    const basePath = path.join(process.cwd(), 'material', 'Libros de Actas');

    let targetFilePath = path.join(basePath, cleanName);

    if (!fs.existsSync(targetFilePath)) {
      if (fs.existsSync(basePath)) {
        const allFiles = fs.readdirSync(basePath);
        const match = allFiles.find(
          (f) =>
            f.toLowerCase() === cleanName.toLowerCase() ||
            f.replace(/Nb0/g, 'N°').toLowerCase() === cleanName.toLowerCase() ||
            f.toLowerCase() === cleanName.replace(/N°/g, 'Nb0').toLowerCase()
        );

        if (match) {
          targetFilePath = path.join(basePath, match);
        } else {
          return new Response(`Archivo no encontrado: ${cleanName}`, { status: 404 });
        }
      } else {
        return new Response(`Directorio de actas no encontrado: ${basePath}`, { status: 404 });
      }
    }

    const fileBuffer = fs.readFileSync(targetFilePath);
    const ext = path.extname(targetFilePath).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.error('Error sirviendo imagen:', error);
    return new Response(String(error?.stack || error?.message || error), { status: 500 });
  }
}
