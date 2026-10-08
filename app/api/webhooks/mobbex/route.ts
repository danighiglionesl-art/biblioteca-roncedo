import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/payments';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const provider = getPaymentProvider('mobbex');

    const isValid = await provider.verifyWebhook(req, rawBody);
    if (!isValid) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const event = await provider.parseWebhookEvent(rawBody, searchParams);

    if (!event) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    console.log('[Webhook Mobbex] Evento recibido:', event);

    if (isSupabaseServerConfigured && supabaseServer && event.userEmail) {
      const { data: users } = await supabaseServer
        .from('profiles')
        .select('id')
        .eq('email', event.userEmail)
        .limit(1);

      if (users && users.length > 0) {
        const targetUser = users[0];
        await supabaseServer
          .from('profiles')
          .update({
            es_socio_protector: event.subscriptionStatus === 'activo',
            estado_socio_protector: event.subscriptionStatus || 'activo',
            tipo_socio_protector: event.tier || 'Bronce',
            importe_mensual: event.amount || 2000,
            proveedor_pago: 'mobbex',
            id_suscripcion_externa: event.externalSubscriptionId,
            fecha_ultimo_pago: event.paymentDate,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetUser.id);
      }
    }

    return NextResponse.json({ status: 'success', provider: 'mobbex' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    endpoint: 'Mobbex Webhooks - Biblioteca Roncedo',
  });
}
