import { NextRequest, NextResponse } from 'next/server';
import { sincronizarLibrivoxMasivo } from '@/lib/services/audiolibrosService';

export async function POST(request: NextRequest) {
  try {
    let limite = 150;
    try {
      const body = await request.json();
      if (body && typeof body.limite === 'number') {
        limite = Math.min(600, Math.max(10, body.limite));
      }
    } catch {}

    const resultado = await sincronizarLibrivoxMasivo(limite);

    return NextResponse.json({
      success: true,
      ...resultado,
      mensaje: `Sincronización completada. Se incorporaron ${resultado.incorporados} obras de LibriVox al catálogo institucional.`,
    });
  } catch (error: any) {
    console.error('Error en API audiolibros sincronizar:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error durante la sincronización' },
      { status: 500 }
    );
  }
}
