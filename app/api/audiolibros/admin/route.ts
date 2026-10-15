import { NextRequest, NextResponse } from 'next/server';
import {
  obtenerTodosLosAudiolibros,
  guardarAudiolibroEnDisco,
  eliminarAudiolibroEnDisco,
  obtenerMetricasAudiolibros,
  buscarEnInternetArchive,
} from '@/lib/services/audiolibrosService';
import { Audiolibro } from '@/types/audiolibros';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // 1. Búsqueda externa para importación asistida desde Internet Archive / LibriVox
    if (action === 'buscar_externo') {
      const q = searchParams.get('q') || 'español';
      const resultados = await buscarEnInternetArchive(q, 12);
      return NextResponse.json({ success: true, resultados });
    }

    // 2. Comprobación de salud de enlaces de audio (Link Health Check)
    if (action === 'verificar_enlaces') {
      const todos = obtenerTodosLosAudiolibros();
      const verificaciones = await Promise.all(
        todos.slice(0, 10).map(async (audio) => {
          const cap1 = audio.capitulos[0];
          if (!cap1 || !cap1.audio_url) {
            return { id: audio.id, titulo: audio.titulo, estado: 'sin_url', url: '' };
          }
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(cap1.audio_url, {
              method: 'HEAD',
              signal: controller.signal,
            });
            clearTimeout(timeout);
            return {
              id: audio.id,
              titulo: audio.titulo,
              estado: res.ok ? 'activo' : 'error_http',
              status: res.status,
              url: cap1.audio_url,
            };
          } catch (e: any) {
            return {
              id: audio.id,
              titulo: audio.titulo,
              estado: 'error_red',
              error: e.message,
              url: cap1.audio_url,
            };
          }
        })
      );
      return NextResponse.json({ success: true, verificaciones });
    }

    // 3. Catálogo completo para admin (incluyendo inactivos) y métricas
    const audiolibros = obtenerTodosLosAudiolibros();
    const metricas = obtenerMetricasAudiolibros();

    return NextResponse.json({
      success: true,
      audiolibros,
      metricas,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error en admin audiolibros' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, audiolibro, id, activo } = body;

    // 1. Guardar o actualizar audiolibro
    if (action === 'guardar' && audiolibro) {
      if (!audiolibro.titulo || !audiolibro.autor) {
        return NextResponse.json(
          { success: false, error: 'Título y autor son obligatorios.' },
          { status: 400 }
        );
      }

      const guardadoOk = guardarAudiolibroEnDisco(audiolibro as Audiolibro);
      return NextResponse.json({
        success: guardadoOk,
        message: guardadoOk ? 'Audiolibro guardado correctamente.' : 'Error al guardar.',
      });
    }

    // 2. Alternar estado activo / inactivo
    if (action === 'toggle_activo' && id) {
      const todos = obtenerTodosLosAudiolibros();
      const encontrado = todos.find((a) => a.id === id);
      if (!encontrado) {
        return NextResponse.json({ success: false, error: 'Audiolibro no encontrado' }, { status: 404 });
      }

      encontrado.activo = typeof activo === 'boolean' ? activo : !encontrado.activo;
      guardarAudiolibroEnDisco(encontrado);

      return NextResponse.json({
        success: true,
        audiolibro: encontrado,
        message: `Audiolibro ${encontrado.activo ? 'activado' : 'desactivado'} con éxito.`,
      });
    }

    // 3. Importar masivamente desde Internet Archive
    if (action === 'importar_lote' && Array.isArray(body.audiolibros)) {
      let importados = 0;
      for (const audio of body.audiolibros) {
        if (audio.titulo && audio.autor) {
          guardarAudiolibroEnDisco(audio);
          importados++;
        }
      }
      return NextResponse.json({
        success: true,
        importados,
        message: `Se importaron ${importados} audiolibros al catálogo oficial.`,
      });
    }

    return NextResponse.json({ success: false, error: 'Acción no reconocida' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error procesando solicitud admin' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
    }

    const eliminado = eliminarAudiolibroEnDisco(id);
    return NextResponse.json({
      success: eliminado,
      message: eliminado ? 'Audiolibro eliminado correctamente.' : 'No se pudo eliminar.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error eliminando audiolibro' },
      { status: 500 }
    );
  }
}
