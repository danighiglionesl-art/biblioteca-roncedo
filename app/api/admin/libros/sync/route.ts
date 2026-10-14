import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import LIBROS_RAW from '@/lib/data/librosFisicos.json';
import { normalizarLibro } from '@/lib/supabase/librosFisicos';

/**
 * GET: Devuelve el estado de sincronización entre el catálogo local y la nube Supabase
 */
export async function GET() {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        success: false,
        configured: false,
        message: 'Supabase no está configurado en las variables de entorno.',
        totalLocalRaw: (LIBROS_RAW as any[]).length,
        totalNube: 0,
      });
    }

    const { count, error } = await supabase
      .from('libros_fisicos')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({
        success: false,
        configured: true,
        error: error.message,
        code: error.code,
        message: 'Error al consultar la tabla libros_fisicos en Supabase. Asegúrese de haber ejecutado la migración SQL.',
        totalLocalRaw: (LIBROS_RAW as any[]).length,
        totalNube: 0,
      });
    }

    return NextResponse.json({
      success: true,
      configured: true,
      totalNube: count || 0,
      totalLocalRaw: (LIBROS_RAW as any[]).length,
      necesitaSembrado: (count || 0) === 0,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST: Siembra o sincroniza el inventario completo a Supabase en lotes
 */
export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase no está configurado en el servidor.',
      }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const librosAProcesar: any[] = Array.isArray(body.libros) && body.libros.length > 0
      ? body.libros
      : (LIBROS_RAW as any[]);

    const BATCH_SIZE = 50;
    let totalInsertados = 0;
    const errores: string[] = [];

    for (let i = 0; i < librosAProcesar.length; i += BATCH_SIZE) {
      const lote = librosAProcesar.slice(i, i + BATCH_SIZE).map((item) => {
        const l = normalizarLibro(item);
        return {
          id: l.id,
          numero_inventario: l.numero_inventario,
          anio_incorporacion: String(l.anio_incorporacion || ''),
          autor: l.autor,
          titulo: l.titulo,
          edicion_anio: l.edicion_anio ? String(l.edicion_anio) : null,
          lugar: l.lugar || null,
          editorial: l.editorial || null,
          procedencia: l.procedencia || 'Donación',
          donante_o_detalle: l.donante_o_detalle || null,
          topografia_ubicacion: l.topografia_ubicacion || null,
          isbn: l.isbn || null,
          portada_url: l.portada_url || null,
          estado_portada: l.estado_portada || 'sin_portada',
          portada_fuente: l.portada_fuente || 'ninguna',
          portada_confianza: l.portada_confianza || 'ninguna',
          portada_detalles: l.portada_detalles || null,
          estado: l.estado || 'disponible',
          prestado_a: l.prestado_a || null,
          lista_espera: l.lista_espera || [],
          categoria: l.categoria || null,
          sinopsis: l.sinopsis || null,
        };
      });

      const { error } = await supabase.from('libros_fisicos').upsert(lote, { onConflict: 'id' });
      if (error) {
        errores.push(`Lote ${i}-${i + lote.length}: ${error.message}`);
      } else {
        totalInsertados += lote.length;
      }
    }

    return NextResponse.json({
      success: errores.length === 0,
      totalInsertados,
      errores,
      message: `Sincronizados ${totalInsertados} libros en Supabase.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
