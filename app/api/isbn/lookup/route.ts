import { NextRequest, NextResponse } from 'next/server';
import { validarIsbn, buscarMetadataIsbn, buscarIsbnPorTituloYAutor } from '@/lib/isbn/isbnService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isbnParam = searchParams.get('isbn')?.trim();
    const tituloParam = searchParams.get('titulo')?.trim();
    const autorParam = searchParams.get('autor')?.trim();

    // 1. Búsqueda por ISBN
    if (isbnParam) {
      const validacion = validarIsbn(isbnParam);

      if (!validacion.valido) {
        return NextResponse.json({
          success: false,
          validacion,
          error: validacion.error || 'El ISBN ingresado no es válido.',
        });
      }

      const metadata = await buscarMetadataIsbn(validacion.clean);

      return NextResponse.json({
        success: true,
        validacion,
        metadata: metadata || null,
        encontrado: Boolean(metadata),
      });
    }

    // 2. Búsqueda por Título y Autor (para libros sin ISBN o fondo histórico)
    if (tituloParam) {
      const metadata = await buscarIsbnPorTituloYAutor(tituloParam, autorParam);
      return NextResponse.json({
        success: true,
        metadata: metadata || null,
        encontrado: Boolean(metadata),
      });
    }

    return NextResponse.json(
      { success: false, error: 'Debe ingresar un parámetro "isbn" o "titulo".' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error en API lookup ISBN:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error procesando consulta ISBN' },
      { status: 500 }
    );
  }
}
