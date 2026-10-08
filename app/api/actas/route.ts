import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ACTAS_HISTORICAS_INICIALES, FOLIOS_INICIALES } from '@/lib/data/actasIniciales';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase() || '';
    const anio = searchParams.get('anio');
    const tipo = searchParams.get('tipo');

    // Comprobar archivos físicos en material/Libros de Actas
    const folderPath = path.join(process.cwd(), 'material', 'Libros de Actas');
    let totalArchivosFisicos = 0;
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      totalArchivosFisicos = files.filter((f) => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png')).length;
    }

    let actas = ACTAS_HISTORICAS_INICIALES;

    if (q) {
      actas = actas.filter(
        (a) =>
          a.titulo.toLowerCase().includes(q) ||
          a.resumen.toLowerCase().includes(q) ||
          (a.transcripcion_completa && a.transcripcion_completa.toLowerCase().includes(q)) ||
          a.firmantes?.some((f) => f.nombre.toLowerCase().includes(q)) ||
          a.temas_tratados?.some((t) => t.toLowerCase().includes(q)) ||
          String(a.numero_acta).includes(q)
      );
    }

    if (anio && anio !== 'Todos') {
      actas = actas.filter((a) => String(a.anio) === anio);
    }

    if (tipo && tipo !== 'Todos') {
      actas = actas.filter((a) => a.tipo_reunion === tipo);
    }

    return NextResponse.json({
      success: true,
      totalArchivosFisicos,
      totalFoliosDigitalizados: FOLIOS_INICIALES.length,
      totalActas: actas.length,
      actas,
      folios: FOLIOS_INICIALES,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, acta } = body;

    // Regla estricta: Solo el Administrador puede gestionar las actas
    if (role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Acceso Denegado: Solo el Administrador tiene permisos para crear o modificar actas del archivo.',
        },
        { status: 403 }
      );
    }

    if (!acta || !acta.titulo || !acta.numero_acta) {
      return NextResponse.json(
        { success: false, error: 'Título y Número de Acta son obligatorios.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Acta procesada correctamente.',
      acta,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, id } = body;

    // Regla estricta: Solo el Administrador puede eliminar actas
    if (role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Acceso Denegado: Solo el Administrador tiene permisos para eliminar registros del archivo.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Acta ${id} eliminada correctamente.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
