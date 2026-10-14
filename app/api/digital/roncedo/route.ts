import { NextRequest, NextResponse } from 'next/server';
import { guardarLibroBibliotecaRoncedo, eliminarLibroBibliotecaRoncedo, getTodosLosLibrosDigitales } from '@/lib/digital/digitalCatalogService';
import { LibroDigital } from '@/types';

export async function GET() {
  try {
    const todos = await getTodosLosLibrosDigitales();
    const librosRoncedo = todos.filter((l) => l.fuente === 'roncedo_digital');
    return NextResponse.json({ success: true, libros: librosRoncedo });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titulo, autor, editorial, anio, descripcion, genero_o_materia, archivo_pdf_url, portada_url, tipo_licencia, id } = body;

    if (!titulo || !titulo.trim()) {
      return NextResponse.json({ success: false, error: 'El título del libro es obligatorio' }, { status: 400 });
    }

    const libroData: Partial<LibroDigital> = {
      id: id || undefined,
      titulo: titulo.trim(),
      autor: autor?.trim() || 'Biblioteca Roncedo',
      editorial: editorial?.trim() || 'Ediciones Biblioteca Dr. Lautaro Roncedo',
      anio: anio ? Number(anio) : new Date().getFullYear(),
      descripcion: descripcion?.trim() || 'Publicación digitalizada de la colección oficial de la Biblioteca Dr. Lautaro Roncedo.',
      genero_o_materia: genero_o_materia?.trim() || 'Colección Digital Biblioteca Roncedo',
      archivo_pdf_url: archivo_pdf_url?.trim(),
      portada_url: portada_url?.trim() || '/images/escudo-roncedo.png',
      tipo_licencia: tipo_licencia?.trim() || 'Biblioteca Roncedo (Acceso Abierto)',
      fuente: 'roncedo_digital',
      disponibilidad: 'descarga_libre',
      es_argentino_o_latino: true,
      formatos: archivo_pdf_url
        ? [
            {
              tipo: 'pdf',
              label: 'Descargar PDF (Biblioteca Roncedo)',
              url: archivo_pdf_url.trim(),
            },
          ]
        : [],
    };

    const res = await guardarLibroBibliotecaRoncedo(libroData);
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, libro: res.libro });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID no especificado' }, { status: 400 });
    }

    const res = await eliminarLibroBibliotecaRoncedo(id);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
