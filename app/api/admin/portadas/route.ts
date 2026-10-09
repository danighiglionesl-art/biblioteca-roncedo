import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { buscarPortadaLibro, procesarLoteLibros, BookSearchInput } from '@/lib/services/bookCoversService';
import LIBROS_RAW from '@/lib/data/librosFisicos.json';

const LIBROS_FILE_PATH = path.join(process.cwd(), 'lib', 'data', 'librosFisicos.json');

// GET: Estadísticas y estado actual de portadas
export async function GET() {
  try {
    let libros: any[] = [];
    if (fs.existsSync(LIBROS_FILE_PATH)) {
      libros = JSON.parse(fs.readFileSync(LIBROS_FILE_PATH, 'utf8'));
    } else {
      libros = LIBROS_RAW as any[];
    }

    const totalLibros = libros.length;
    const conPortada = libros.filter((l) => l.portada_url && l.portada_url.trim() !== '').length;
    const pendientes = libros.filter((l) => l.estado_portada === 'pendiente_revision').length;
    const sinPortada = totalLibros - conPortada;
    const conIsbn = libros.filter((l) => l.isbn && l.isbn.trim() !== '').length;

    return NextResponse.json({
      success: true,
      stats: {
        totalLibros,
        conPortada,
        pendientes,
        sinPortada,
        conIsbn,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Acciones de gestión de portadas (Búsqueda individual, sincronización a disco, prueba de lote)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // 1. Búsqueda individual de un libro
    if (action === 'buscar_individual') {
      const { libro } = body as { libro: BookSearchInput };
      if (!libro || !libro.titulo) {
        return NextResponse.json({ success: false, error: 'Datos de libro insuficientes' }, { status: 400 });
      }

      const resultado = await buscarPortadaLibro(libro);
      return NextResponse.json({ success: true, resultado });
    }

    // 2. Sincronización persistente a archivo librosFisicos.json
    if (action === 'sincronizar_archivo') {
      const { librosActualizados } = body as { librosActualizados: any[] };
      if (!Array.isArray(librosActualizados) || librosActualizados.length === 0) {
        return NextResponse.json({ success: false, error: 'Lista de libros no provista' }, { status: 400 });
      }

      // Guardar de forma persistente en lib/data/librosFisicos.json
      fs.writeFileSync(LIBROS_FILE_PATH, JSON.stringify(librosActualizados, null, 2), 'utf8');

      return NextResponse.json({
        success: true,
        message: `Guardados ${librosActualizados.length} libros en el archivo físico del catálogo.`,
        totalActualizados: librosActualizados.length,
      });
    }

    // 3. Procesar lote de libros
    if (action === 'procesar_lote') {
      const { libros, delayMs = 350 } = body as { libros: BookSearchInput[]; delayMs?: number };
      if (!Array.isArray(libros)) {
        return NextResponse.json({ success: false, error: 'Lista de libros requerida' }, { status: 400 });
      }

      const resultados = await procesarLoteLibros(libros, undefined, { delayMs });

      return NextResponse.json({
        success: true,
        total: resultados.length,
        encontradas: resultados.filter((r) => r.resultado.portada_url).length,
        resultados,
      });
    }

    return NextResponse.json({ success: false, error: 'Acción no reconocida' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
