import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/payments';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const provider = getPaymentProvider('mercadopago');

    // 1. Validar autenticidad del webhook de forma segura en servidor
    const isValid = await provider.verifyWebhook(req, rawBody);
    if (!isValid) {
      console.warn('[Webhook MercadoPago] Firma no válida o no autorizada');
      return NextResponse.json({ error: 'Firma no válida' }, { status: 401 });
    }

    // 2. Extraer parámetros de búsqueda y payload
    const { searchParams } = new URL(req.url);
    const event = await provider.parseWebhookEvent(rawBody, searchParams);

    if (!event) {
      return NextResponse.json({ status: 'ignored', message: 'Evento no procesable' }, { status: 200 });
    }

    console.log('[Webhook MercadoPago] Evento recibido:', {
      type: event.eventType,
      subscriptionId: event.externalSubscriptionId,
      email: event.userEmail,
      amount: event.amount,
      tier: event.tier,
      status: event.subscriptionStatus,
    });

    // 3. Si Supabase está conectado con service role en producción, persistir en base de datos
    if (isSupabaseServerConfigured && supabaseServer) {
      // Buscar perfil por email o por ID de suscripción existente
      let profileQuery = supabaseServer.from('profiles').select('id, email, es_socio_protector, fecha_adhesion');
      if (event.userEmail) {
        profileQuery = profileQuery.eq('email', event.userEmail);
      } else if (event.externalSubscriptionId) {
        profileQuery = profileQuery.eq('id_suscripcion_externa', event.externalSubscriptionId);
      }

      const { data: users, error: userError } = await profileQuery.limit(1);

      if (!userError && users && users.length > 0) {
        const targetUser = users[0];

        // Actualizar datos del perfil
        const updateData: Record<string, any> = {
          es_socio_protector: event.subscriptionStatus === 'activo',
          estado_socio_protector: event.subscriptionStatus || 'activo',
          proveedor_pago: 'mercadopago',
          updated_at: new Date().toISOString(),
        };

        if (event.tier) updateData.tipo_socio_protector = event.tier;
        if (event.amount) updateData.importe_mensual = event.amount;
        if (event.externalSubscriptionId) updateData.id_suscripcion_externa = event.externalSubscriptionId;
        if (event.paymentDate) updateData.fecha_ultimo_pago = event.paymentDate;
        if (event.nextPaymentDate) updateData.proximo_vencimiento = event.nextPaymentDate;
        if (!targetUser.fecha_adhesion) updateData.fecha_adhesion = new Date().toISOString().split('T')[0];

        await supabaseServer.from('profiles').update(updateData).eq('id', targetUser.id);

        // Registrar o actualizar la suscripción desacoplada
        if (event.externalSubscriptionId) {
          await supabaseServer.from('suscripciones_protectores').upsert(
            {
              user_id: targetUser.id,
              proveedor: 'mercadopago',
              id_externo_suscripcion: event.externalSubscriptionId,
              estado: event.subscriptionStatus === 'activo' ? 'activa' : 'inactiva',
              importe: event.amount || 2000,
              moneda: 'ARS',
              frecuencia: 'mensual',
              fecha_inicio: new Date().toISOString(),
              metadata: event.rawPayload,
            },
            { onConflict: 'id_externo_suscripcion' }
          );
        }

        // Si fue un pago aprobado, registrar en la tabla desacoplada de pagos
        if (event.eventType === 'payment_approved' && event.externalPaymentId) {
          await supabaseServer.from('pagos_protectores').upsert(
            {
              user_id: targetUser.id,
              proveedor: 'mercadopago',
              id_transaccion_externa: event.externalPaymentId,
              monto: event.amount || 0,
              moneda: 'ARS',
              estado: 'aprobado',
              fecha_pago: event.paymentDate || new Date().toISOString(),
              detalle: `Aporte mensual Socio Protector ${event.tier || ''}`,
              raw_data: event.rawPayload,
            },
            { onConflict: 'id_transaccion_externa' }
          );
        }
      }
    }

    // Mercado Pago requiere status 200/201 para dar por recibido el webhook
    return NextResponse.json(
      {
        status: 'success',
        received: true,
        provider: 'mercadopago',
        eventType: event.eventType,
        tier: event.tier,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[Webhook MercadoPago] Error procesando webhook:', err);
    return NextResponse.json(
      { error: 'Error interno en el servidor', details: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    endpoint: 'Mercado Pago Webhooks - Biblioteca Roncedo',
    version: '1.0.0',
    description: 'Receptor seguro de webhooks para el módulo Socio Protector.',
  });
}
