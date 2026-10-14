import { NextRequest, NextResponse } from 'next/server';
import { FuenteDigital, DisponibilidadDigital } from '@/types';
import { buscarLibrosDigitales } from '@/lib/digital/digitalCatalogService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const tipoBusqueda = (searchParams.get('tipo_busqueda') || 'todos') as any;
    const fuente = (searchParams.get('fuente') || 'todas') as 'todas' | FuenteDigital;
    const disponibilidad = (searchParams.get('disponibilidad') || 'todas') as 'todas' | DisponibilidadDigital;
    const solo_argentinos_latinos = searchParams.get('solo_argentinos_latinos') === 'true';
    const pagina = parseInt(searchParams.get('pagina') || searchParams.get('page') || '1', 10);
    const limite = parseInt(searchParams.get('limite') || searchParams.get('limit') || '24', 10);

    const resultado = await buscarLibrosDigitales({
      q,
      tipo_busqueda: tipoBusqueda,
      fuente,
      disponibilidad,
      solo_argentinos_latinos,
      pagina,
      limite,
    });

    return NextResponse.json({
      success: true,
      query: q,
      total: resultado.total,
      pagina: resultado.pagina,
      totalPaginas: resultado.totalPaginas,
      libros: resultado.libros,
      metricas: resultado.metricas,
    });
  } catch (error: any) {
    console.error('Error en búsqueda de biblioteca digital:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al procesar la búsqueda',
        libros: [],
      },
      { status: 500 }
    );
  }
}
