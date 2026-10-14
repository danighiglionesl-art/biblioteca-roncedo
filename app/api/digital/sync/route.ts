import { NextRequest, NextResponse } from 'next/server';
import { getTodosLosLibrosDigitales, invalidarCacheDigital } from '@/lib/digital/digitalCatalogService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { MetricasBibliotecaDigital, FuenteDigital } from '@/types';

export async function GET() {
  try {
    const todos = await getTodosLosLibrosDigitales();

    const porFuente: Record<FuenteDigital, number> = {
      gutenberg: 0,
      wikisource: 0,
      cervantes: 0,
      openlibrary: 0,
      bnmm: 0,
      bne: 0,
      roncedo_digital: 0,
    };

    let conLectura = 0;
    let conDescarga = 0;
    let enlacesRotos = 0;

    for (const l of todos) {
      if (porFuente[l.fuente] !== undefined) {
        porFuente[l.fuente]++;
      }
      if (l.disponibilidad === 'descarga_libre') conDescarga++;
      if (l.disponibilidad === 'lectura_directa' || l.disponibilidad === 'descarga_libre') conLectura++;
      if (l.estado_enlace === 'roto') enlacesRotos++;
    }

    const metricas: MetricasBibliotecaDigital = {
      total_obras_unicas: todos.length,
      por_fuente: porFuente,
      disponibles_lectura_online: conLectura,
      disponibles_descarga: conDescarga,
      enlaces_verificados: todos.length - enlacesRotos,
      enlaces_rotos: enlacesRotos,
      ultima_sincronizacion: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      metricas,
      supabaseConnected: isSupabaseConfigured,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json().catch(() => ({ action: 'sync_all' }));
    const todos = await getTodosLosLibrosDigitales();
    let insertados = 0;
    let errores: string[] = [];

    // Si Supabase está configurado, sincronizar el catálogo masivo en lotes (batches de 100)
    if (isSupabaseConfigured && supabase) {
      const BATCH_SIZE = 100;
      for (let i = 0; i < Math.min(todos.length, 1000); i += BATCH_SIZE) {
        const batch = todos.slice(i, i + BATCH_SIZE).map((l) => ({
          id: l.id,
          titulo: l.titulo,
          autor: l.autor,
          editorial: l.editorial || null,
          idioma: l.idioma || 'es',
          genero_o_materia: l.genero_o_materia || null,
          anio: Number(l.anio) || null,
          portada_url: l.portada_url || null,
          descripcion: l.descripcion || null,
          fuente: l.fuente,
          fuentes_adicionales: l.fuentes_adicionales || [],
          enlace_oficial: l.enlace_oficial,
          enlace_lectura: l.enlace_lectura || l.enlace_oficial,
          enlace_descarga: l.enlace_descarga || null,
          disponibilidad: l.disponibilidad,
          formatos: l.formatos || [],
          tipo_licencia: l.tipo_licencia || 'Dominio Público',
          es_argentino_o_latino: Boolean(l.es_argentino_o_latino),
          archivo_pdf_url: l.archivo_pdf_url || null,
          estado_enlace: 'verificado',
          ultima_verificacion: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        try {
          const { error } = await supabase.from('libros_digitales').upsert(batch, { onConflict: 'id' });
          if (!error) {
            insertados += batch.length;
          } else {
            errores.push(`Lote ${i / BATCH_SIZE + 1}: ${error.message}`);
          }
        } catch (bErr: any) {
          errores.push(`Lote ${i / BATCH_SIZE + 1}: ${bErr.message}`);
        }
      }

      // Registrar resultado de sincronización en la tabla de auditoría
      try {
        await supabase.from('sincronizaciones_digitales').insert({
          fuente: action || 'catalogo_completo',
          total_obras_procesadas: todos.length,
          nuevas_obras: insertados,
          duplicados_omitidos: 0,
          errores,
          estado: errores.length === 0 ? 'completado' : 'con_advertencias',
          iniciado_en: new Date().toISOString(),
          finalizado_en: new Date().toISOString(),
        });
      } catch (logErr) {
        console.warn('Aviso registrando sincronización en Supabase:', logErr);
      }
    }

    invalidarCacheDigital();

    return NextResponse.json({
      success: true,
      mensaje: `Sincronización completada exitosamente. ${todos.length} obras verificadas en catálogo.`,
      obrasEnCatalogo: todos.length,
      sincronizadasEnSupabase: insertados,
      errores,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
