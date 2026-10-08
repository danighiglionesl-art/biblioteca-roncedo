import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, tier = 'Plata', status = 'activo', provider = 'mercadopago' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email requerido para la simulación' }, { status: 400 });
    }

    const montos: Record<string, number> = {
      Bronce: 2000,
      Plata: 5000,
      Oro: 10000,
    };

    const monto = montos[tier] || 5000;
    const subId = `SIM-${provider.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (isSupabaseServerConfigured && supabaseServer) {
      const { data: users, error } = await supabaseServer
        .from('profiles')
        .select('id, fecha_adhesion')
        .eq('email', email)
        .limit(1);

      if (error || !users || users.length === 0) {
        return NextResponse.json(
          { error: `No se encontró usuario con email ${email} en la base de datos` },
          { status: 404 }
        );
      }

      const target = users[0];
      await supabaseServer
        .from('profiles')
        .update({
          es_socio_protector: status === 'activo',
          estado_socio_protector: status,
          tipo_socio_protector: tier,
          importe_mensual: monto,
          proveedor_pago: provider,
          id_suscripcion_externa: subId,
          fecha_adhesion: target.fecha_adhesion || now.split('T')[0],
          fecha_ultimo_pago: now,
          proximo_vencimiento: nextMonth,
          updated_at: now,
        })
        .eq('id', target.id);
    }

    return NextResponse.json({
      success: true,
      message: `Simulación de webhook ${provider} ejecutada con éxito para ${email}`,
      data: {
        email,
        tier,
        status,
        monto,
        subscriptionId: subId,
        provider,
        nextPayment: nextMonth,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
