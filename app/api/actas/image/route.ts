import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');

    if (!fileName) {
      return new NextResponse('Parámetro de archivo requerido', { status: 400 });
    }

    // Seguridad: sanitizar el nombre para prevenir Directory Traversal
    const safeBaseName = path.basename(fileName);
    if (safeBaseName !== fileName && !fileName.startsWith('material')) {
      // Tomamos solo el basename seguro
    }

    const cleanName = path.basename(fileName);

    const basePath = path.join(process.cwd(), 'material', 'Libros de Actas');
    let targetFilePath = path.join(basePath, cleanName);

    // Si no existe directamente, probar variantes de codificación común (N° vs Nb0)
    if (!fs.existsSync(targetFilePath)) {
      const variant1 = cleanName.replace(/N°/g, 'Nb0').replace(/Nº/g, 'Nb0');
      const variant2 = cleanName.replace(/Nb0/g, 'N°');
      const variant3 = cleanName.replace(/Nb0/g, 'Nº');

      if (fs.existsSync(path.join(basePath, variant1))) {
        targetFilePath = path.join(basePath, variant1);
      } else if (fs.existsSync(path.join(basePath, variant2))) {
        targetFilePath = path.join(basePath, variant2);
      } else if (fs.existsSync(path.join(basePath, variant3))) {
        targetFilePath = path.join(basePath, variant3);
      } else {
        return new NextResponse(`Archivo no encontrado: ${cleanName}`, { status: 404 });
      }
    }

    const fileBuffer = fs.readFileSync(targetFilePath);
    const ext = path.extname(targetFilePath).toLowerCase();

    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.pdf') contentType = 'application/pdf';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.error('Error sirviendo imagen de acta:', error);
    return new NextResponse('Error interno al cargar la imagen', { status: 500 });
  }
}
