import { NextRequest, NextResponse } from 'next/server';
import { buscarAudiolibros, obtenerMetricasAudiolibros } from '@/lib/services/audiolibrosService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || '';
    const genero = searchParams.get('genero') || 'todos';
    const soloArgentinosLatinos = searchParams.get('solo_argentinos') === 'true';
    const fuente = searchParams.get('fuente') || 'todas';
    const duracion = (searchParams.get('duracion') as any) || 'todas';
    const pagina = parseInt(searchParams.get('pagina') || '1', 10);
    const limite = parseInt(searchParams.get('limite') || '18', 10);
    const orden = (searchParams.get('orden') as any) || 'populares';

    const resultado = buscarAudiolibros({
      query,
      genero,
      soloArgentinosLatinos,
      fuente,
      duracion,
      pagina,
      limite,
      orden,
    });

    const metricas = obtenerMetricasAudiolibros();

    return NextResponse.json({
      success: true,
      ...resultado,
      metricas,
    });
  } catch (error: any) {
    console.error('Error en API audiolibros search:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al buscar audiolibros' },
      { status: 500 }
    );
  }
}
