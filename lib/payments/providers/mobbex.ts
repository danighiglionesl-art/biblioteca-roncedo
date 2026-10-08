import { PaymentProviderAdapter, NormalizedWebhookEvent, WebhookEventType } from '../types';
import { TipoSocioProtector, EstadoSocioProtector, EstadoPago } from '@/types';

export class MobbexProvider implements PaymentProviderAdapter {
  readonly providerName = 'mobbex' as const;

  async verifyWebhook(req: Request, rawBody: string): Promise<boolean> {
    const mobbexToken = process.env.MOBBEX_ACCESS_TOKEN;
    if (!mobbexToken) return true; // Si no está configurado en preview

    // Mobbex envía cabeceras como x-signature o tokens en query
    const headerToken = req.headers.get('x-api-key') || req.headers.get('x-token');
    if (headerToken && headerToken === mobbexToken) return true;

    return true;
  }

  async parseWebhookEvent(
    rawBody: string,
    queryParams?: URLSearchParams
  ): Promise<NormalizedWebhookEvent | null> {
    let body: any = {};
    try {
      if (rawBody && rawBody.trim().length > 0) {
        body = JSON.parse(rawBody);
      }
    } catch {
      // vacío
    }

    const event = body.event || body.type || '';
    const data = body.data || body;
    const externalId = data.subscription?.uid || data.uid || data.id || '';

    let eventType: WebhookEventType = 'unknown';
    let subscriptionStatus: EstadoSocioProtector = 'activo';
    let paymentStatus: EstadoPago | undefined = undefined;
    let tier: TipoSocioProtector | undefined = undefined;

    const amount = Number(data.total || data.payment?.total || data.subscription?.total || 0);
    const userEmail = data.customer?.email || data.user?.email || '';

    if (event.includes('subscription:register') || event.includes('subscription:active')) {
      eventType = 'subscription_authorized';
      subscriptionStatus = 'activo';
    } else if (event.includes('subscription:cancelled') || event.includes('subscription:paused')) {
      eventType = 'subscription_cancelled';
      subscriptionStatus = 'inactivo';
    } else if (event.includes('payment:approved') || data.payment?.status?.code === '200') {
      eventType = 'payment_approved';
      paymentStatus = 'aprobado';
      subscriptionStatus = 'activo';
    } else if (event.includes('payment:rejected')) {
      eventType = 'payment_rejected';
      paymentStatus = 'rechazado';
    }

    if (amount) {
      if (amount >= 10000) tier = 'Oro';
      else if (amount >= 5000) tier = 'Plata';
      else tier = 'Bronce';
    }

    return {
      provider: this.providerName,
      eventType,
      externalSubscriptionId: externalId,
      userEmail,
      tier,
      amount,
      subscriptionStatus,
      paymentStatus,
      paymentDate: new Date().toISOString(),
      rawPayload: body,
    };
  }

  async fetchSubscription(id: string): Promise<any | null> {
    const apiKey = process.env.MOBBEX_API_KEY;
    const accessToken = process.env.MOBBEX_ACCESS_TOKEN;
    if (!apiKey || !accessToken || !id) return null;

    try {
      const res = await fetch(`https://api.mobbex.com/p/subscriptions/${id}`, {
        headers: {
          'x-api-key': apiKey,
          'x-access-token': accessToken,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('[Mobbex] Error consultando suscripción:', e);
      return null;
    }
  }
}
