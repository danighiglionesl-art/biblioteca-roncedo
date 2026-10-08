import { ProveedorPago } from '@/types';
import { PaymentProviderAdapter } from './types';
import { MercadoPagoProvider } from './providers/mercadopago';
import { MobbexProvider } from './providers/mobbex';

export * from './types';
export * from './plans';
export * from './providers/mercadopago';
export * from './providers/mobbex';

const providersRegistry: Record<string, PaymentProviderAdapter> = {
  mercadopago: new MercadoPagoProvider(),
  mobbex: new MobbexProvider(),
};

export function getPaymentProvider(providerName: ProveedorPago | string = 'mercadopago'): PaymentProviderAdapter {
  const normalized = providerName.toLowerCase();
  const provider = providersRegistry[normalized];
  if (!provider) {
    // Fallback por defecto a Mercado Pago
    return providersRegistry.mercadopago;
  }
  return provider;
}
