import {
  TipoSocioProtector,
  EstadoSocioProtector,
  ProveedorPago,
  EstadoSuscripcion,
  EstadoPago,
} from '@/types';

export interface PlanSocioProtector {
  id: string;
  tipo: TipoSocioProtector;
  nombre: string;
  monto: number;
  periodo: string; // 'por mes'
  descripcion: string;
  mercadoPagoUrl: string;
  destacado?: boolean;
  beneficios: string[];
}

export type WebhookEventType =
  | 'subscription_created'
  | 'subscription_authorized'
  | 'subscription_updated'
  | 'subscription_paused'
  | 'subscription_cancelled'
  | 'payment_approved'
  | 'payment_rejected'
  | 'unknown';

export interface NormalizedWebhookEvent {
  provider: ProveedorPago;
  eventType: WebhookEventType;
  externalSubscriptionId?: string;
  externalPaymentId?: string;
  userEmail?: string;
  payerId?: string;
  tier?: TipoSocioProtector;
  amount?: number;
  currency?: string;
  subscriptionStatus?: EstadoSocioProtector;
  paymentStatus?: EstadoPago;
  paymentDate?: string;
  nextPaymentDate?: string;
  rawPayload: any;
}

export interface PaymentProviderAdapter {
  readonly providerName: ProveedorPago;

  /**
   * Verifica la autenticidad del webhook (firma HMAC, secreto, cabeceras)
   */
  verifyWebhook(req: Request, rawBody: string): Promise<boolean>;

  /**
   * Transforma el payload crudo del proveedor a un evento estandarizado
   */
  parseWebhookEvent(rawBody: string, queryParams?: URLSearchParams): Promise<NormalizedWebhookEvent | null>;

  /**
   * Consulta el estado de una suscripción externa si las credenciales de backend están configuradas
   */
  fetchSubscription?(externalId: string): Promise<any>;
}
