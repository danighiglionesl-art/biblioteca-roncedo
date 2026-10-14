import { NextRequest, NextResponse } from 'next/server';
import { guardarLibroBibliotecaRoncedo, eliminarLibroBibliotecaRoncedo, getTodosLosLibrosDigitales } from '@/lib/digital/digitalCatalogService';
import { LibroDigital } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const todos = await getTodosLosLibrosDigitales();

    if (id) {
      const libro = todos.find((l) => l.id === id);
      if (!libro) {
        return NextResponse.json({ success: false, error: 'Libro digital no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, libro });
    }

    const soloRoncedo = searchParams.get('solo_roncedo');
    const libros = soloRoncedo === 'false'
      ? todos
      : todos.filter((l) => l.fuente === 'roncedo_digital' || l.id.startsWith('roncedo-'));

    return NextResponse.json({ success: true, libros, total: libros.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      titulo,
      autor,
      editorial,
      anio,
      idioma,
      descripcion,
      genero_o_materia,
      archivo_pdf_url,
      epub_url,
      portada_url,
      tipo_licencia,
      fuente,
      disponibilidad,
      es_argentino_o_latino,
      enlace_oficial,
      enlace_lectura,
      enlace_descarga,
      formatos: formatosInput,
      subido_por,
    } = body;

    if (!titulo || !titulo.trim()) {
      return NextResponse.json({ success: false, error: 'El título del libro es obligatorio' }, { status: 400 });
    }

    // Armar formatos disponibles
    const formatos = Array.isArray(formatosInput) ? [...formatosInput] : [];
    const pdfUrl = archivo_pdf_url?.trim();
    const epubUrl = epub_url?.trim();

    if (pdfUrl) {
      const indexPdf = formatos.findIndex((f) => f.tipo === 'pdf');
      if (indexPdf >= 0) {
        formatos[indexPdf].url = pdfUrl;
      } else {
        formatos.unshift({
          tipo: 'pdf',
          label: 'Descargar PDF (Biblioteca Roncedo)',
          url: pdfUrl,
        });
      }
    }

    if (epubUrl) {
      const indexEpub = formatos.findIndex((f) => f.tipo === 'epub');
      if (indexEpub >= 0) {
        formatos[indexEpub].url = epubUrl;
      } else {
        formatos.push({
          tipo: 'epub',
          label: 'Descargar EPUB',
          url: epubUrl,
        });
      }
    }

    const fuenteFinal = fuente?.trim() || 'roncedo_digital';
    const disponibilidadFinal = disponibilidad?.trim() || 'descarga_libre';
    const esLatino = typeof es_argentino_o_latino === 'boolean'
      ? es_argentino_o_latino
      : fuenteFinal === 'roncedo_digital' || fuenteFinal === 'bnmm';

    const libroData: Partial<LibroDigital> = {
      id: id || undefined,
      titulo: titulo.trim(),
      autor: autor?.trim() || 'Biblioteca Roncedo',
      editorial: editorial?.trim() || 'Ediciones Biblioteca Dr. Lautaro Roncedo',
      anio: anio ? Number(anio) : new Date().getFullYear(),
      idioma: idioma?.trim() || 'es',
      descripcion: descripcion?.trim() || '',
      genero_o_materia: genero_o_materia?.trim() || 'Colección Digital Biblioteca Roncedo',
      archivo_pdf_url: pdfUrl || undefined,
      portada_url: portada_url?.trim() || undefined,
      tipo_licencia: tipo_licencia?.trim() || 'Dominio Público',
      fuente: fuenteFinal,
      disponibilidad: disponibilidadFinal,
      es_argentino_o_latino: esLatino,
      enlace_oficial: enlace_oficial?.trim() || pdfUrl || undefined,
      enlace_lectura: enlace_lectura?.trim() || pdfUrl || undefined,
      enlace_descarga: enlace_descarga?.trim() || pdfUrl || undefined,
      formatos,
      subido_por: subido_por || undefined,
    };

    const res = await guardarLibroBibliotecaRoncedo(libroData, subido_por);
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
