import crypto from 'crypto';
import { PaymentProviderAdapter, NormalizedWebhookEvent, WebhookEventType } from '../types';
import { TipoSocioProtector, EstadoSocioProtector, EstadoPago } from '@/types';

export class MercadoPagoProvider implements PaymentProviderAdapter {
  readonly providerName = 'mercadopago' as const;

  /**
   * Verifica la firma del Webhook si se proveyó MERCADO_PAGO_WEBHOOK_SECRET
   */
  async verifyWebhook(req: Request, rawBody: string): Promise<boolean> {
    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    // Si no está configurado el secreto en entorno de desarrollo/preview, permitimos procesar
    if (!secret) return true;

    const signatureHeader = req.headers.get('x-signature');
    const requestId = req.headers.get('x-request-id');

    if (!signatureHeader) return false;

    try {
      // Formato típico de Mercado Pago: ts=1700000000,v1=hash...
      const parts = signatureHeader.split(',');
      let ts = '';
      let hashV1 = '';

      for (const part of parts) {
        const [k, v] = part.trim().split('=');
        if (k === 'ts') ts = v;
        if (k === 'v1') hashV1 = v;
      }

      if (!ts || !hashV1) return false;

      // Manifest: "id:[data.id_url];request-id:[x-request-id];ts:[ts];"
      const url = new URL(req.url);
      const dataId = url.searchParams.get('data.id') || url.searchParams.get('id') || '';

      const manifest = `id:${dataId};request-id:${requestId || ''};ts:${ts};`;
      const computedHash = crypto
        .createHmac('sha256', secret)
        .update(manifest)
        .digest('hex');

      return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hashV1));
    } catch (err) {
      console.error('[MercadoPago] Error verificando firma HMAC:', err);
      return false;
    }
  }

  /**
   * Procesa el evento del webhook
   */
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
      // puede venir solo en query params
    }

    const type = body.type || body.topic || queryParams?.get('type') || queryParams?.get('topic') || '';
    const action = body.action || '';
    const externalId =
      body.data?.id ||
      body.id?.toString() ||
      queryParams?.get('data.id') ||
      queryParams?.get('id') ||
      '';

    let eventType: WebhookEventType = 'unknown';
    let subscriptionStatus: EstadoSocioProtector | undefined = undefined;
    let paymentStatus: EstadoPago | undefined = undefined;
    let tier: TipoSocioProtector | undefined = undefined;
    let amount: number | undefined = undefined;
    let userEmail: string | undefined = undefined;
    let nextPaymentDate: string | undefined = undefined;
    let paymentDate: string | undefined = new Date().toISOString();

    // 1. Si es evento de suscripción / preapproval
    if (
      type.includes('preapproval') ||
      type.includes('subscription') ||
      action.includes('created') ||
      action.includes('updated')
    ) {
      eventType = 'subscription_authorized';
      subscriptionStatus = 'activo';

      // Si tenemos Access Token del backend, consultamos la suscripción a Mercado Pago
      const liveData = await this.fetchSubscription(externalId);
      if (liveData) {
        userEmail = liveData.payer_email;
        amount = liveData.auto_recurring?.transaction_amount;
        nextPaymentDate = liveData.next_payment_date;

        if (liveData.status === 'authorized') {
          subscriptionStatus = 'activo';
          eventType = 'subscription_authorized';
        } else if (liveData.status === 'pending') {
          subscriptionStatus = 'pendiente';
          eventType = 'subscription_created';
        } else if (liveData.status === 'paused') {
          subscriptionStatus = 'inactivo';
          eventType = 'subscription_paused';
        } else if (liveData.status === 'cancelled') {
          subscriptionStatus = 'inactivo';
          eventType = 'subscription_cancelled';
        }
      } else {
        // Fallback desde el body si venía payload expandido
        userEmail = body.payer_email || body.email;
        amount = body.transaction_amount || body.amount;
        if (body.status === 'paused' || body.status === 'cancelled') {
          subscriptionStatus = 'inactivo';
          eventType = 'subscription_cancelled';
        } else if (body.status === 'pending') {
          subscriptionStatus = 'pendiente';
          eventType = 'subscription_created';
        }
      }

      // Mapear el monto al tipo de Socio Protector
      if (amount) {
        if (amount >= 10000) tier = 'Oro';
        else if (amount >= 5000) tier = 'Plata';
        else tier = 'Bronce';
      }
    } else if (type === 'payment' || type === 'subscription_authorized_payment') {
      // 2. Si es evento de pago recurrente ejecutado
      const livePayment = await this.fetchPayment(externalId);
      if (livePayment) {
        userEmail = livePayment.payer?.email;
        amount = livePayment.transaction_amount;
        paymentDate = livePayment.date_approved || new Date().toISOString();
        if (livePayment.status === 'approved') {
          paymentStatus = 'aprobado';
          eventType = 'payment_approved';
          subscriptionStatus = 'activo';
        } else {
          paymentStatus = 'rechazado';
          eventType = 'payment_rejected';
        }
      } else {
        if (body.status === 'approved') {
          paymentStatus = 'aprobado';
          eventType = 'payment_approved';
          subscriptionStatus = 'activo';
        } else {
          paymentStatus = 'rechazado';
          eventType = 'payment_rejected';
        }
      }

      if (amount) {
        if (amount >= 10000) tier = 'Oro';
        else if (amount >= 5000) tier = 'Plata';
        else tier = 'Bronce';
      }
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
      paymentDate,
      nextPaymentDate,
      rawPayload: body,
    };
  }

  /**
   * Consulta a la API oficial de Mercado Pago para suscripciones
   */
  async fetchSubscription(id: string): Promise<any | null> {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token || !id) return null;

    try {
      const res = await fetch(`https://api.mercadopago.com/preapproval/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('[MercadoPago] Error fetching preapproval:', e);
      return null;
    }
  }

  /**
   * Consulta a la API oficial de Mercado Pago para pagos
   */
  async fetchPayment(id: string): Promise<any | null> {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token || !id) return null;

    try {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.warn('[MercadoPago] Error fetching payment:', e);
      return null;
    }
  }
}
