'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { CarnetDigital } from '@/components/carnet/CarnetDigital';
import { obtenerMedallaProtector } from '@/lib/payments/plans';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  HelpCircle,
} from 'lucide-react';

export default function CarnetPage() {
  const { user } = useAuth();

  if (!user) return null;

  const isSocioProtector = user.estado_socio_protector === 'activo';
  const medallaInfo = isSocioProtector
    ? obtenerMedallaProtector(user.tipo_socio_protector)
    : undefined;

  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-24 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Navegación Superior: Volver al Inicio */}
        <div className="flex items-center justify-between">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-xs font-bold text-roncedo-navy hover:text-roncedo-celesteDark transition-colors bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-blue-200/80 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-roncedo-celeste" />
            <span>Volver al Inicio</span>
          </Link>

          <span className="text-[11px] font-semibold text-slate-500">
            Biblioteca Roncedo • Credencial
          </span>
        </div>

        {/* Cabecera de Página */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-roncedo-navy text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5 text-roncedo-gold" />
            <span>{isSocioProtector ? 'Credencial Oficial' : 'Identificación de Usuario'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {isSocioProtector ? 'Carnet de Socio Protector' : 'Credencial de la App'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isSocioProtector
              ? 'Tu identificación oficial con membresía plena, beneficios en tienda y acceso a préstamos'
              : 'Tu registro oficial en la aplicación institucional de la Biblioteca Roncedo'}
          </p>
        </div>

        <div>
          {/* Componente del Carnet */}
          <CarnetDigital user={user} className="mb-6" />

          {/* Ficha Informativa de Socio Protector si está activo */}
          {isSocioProtector ? (
            <div className="bg-gradient-to-r from-amber-50/70 via-white to-blue-50/50 border border-amber-200/80 rounded-2xl p-4 mb-4 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {medallaInfo ? (
                  <div className="relative w-12 h-12 flex-shrink-0 drop-shadow-md">
                    <Image
                      src={medallaInfo.medalla}
                      alt={`Medalla ${medallaInfo.label}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="relative w-12 h-12 flex-shrink-0 drop-shadow-md">
                    <Image
                      src="/images/socio-protector/insignia-oro.png"
                      alt="Insignia Socio Protector"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <span>Socio Protector {user.tipo_socio_protector || 'Activo'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-700 mt-0.5">
                    Aporte mensual activo de ${user.importe_mensual?.toLocaleString('es-AR') || '2.000'}/mes vía {user.proveedor_pago === 'mercadopago' ? 'Mercado Pago' : user.proveedor_pago || 'Mercado Pago'}.
                  </p>
                  {medallaInfo && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] font-bold">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                        🏷️ {medallaInfo.descuento} en compras y eventos
                      </span>
                      <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md border border-blue-200">
                        📚 Préstamos: {medallaInfo.prestamos}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Link
                href="/socio-protector"
                className="px-3.5 py-2 rounded-xl bg-white text-roncedo-navy hover:bg-slate-50 text-xs font-bold border border-slate-200 shadow-sm transition-colors flex-shrink-0"
              >
                Gestionar Plan
              </Link>
            </div>
          ) : (
            /* Banner para Usuario de la App (Servicios restringidos) */
            <div className="bg-white border border-blue-200/90 rounded-2xl p-5 mb-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      Condición actual: Usuario de la App
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      Servicios restringidos
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Para acceder a préstamos de libros físicos, descuentos de hasta el 10% en la tienda oficial y eventos, sumá tu aporte solidario mensual como <strong>Socio Protector</strong>.
                  </p>
                </div>

                <Link
                  href="/socio-protector"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-roncedo-navy to-[#1E6091] hover:brightness-110 text-white font-bold px-4 py-2.5 rounded-xl shadow-md text-xs transition-all flex-shrink-0"
                >
                  <div className="relative w-4 h-4 flex-shrink-0">
                    <Image
                      src="/images/socio-protector/insignia-oro.png"
                      alt="Insignia"
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                  </div>
                  <span>Ser Socio Protector</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Categorías de Socio Protector */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/50">
                  <span className="text-[10px] font-bold uppercase text-amber-900 block">Bronce</span>
                  <span className="text-xs font-black text-slate-900 block mt-0.5">$2.000<span className="text-[9px] font-normal text-slate-500">/m</span></span>
                  <span className="text-[9px] text-slate-500 block">2% desc. • 4 libros/año</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-700 block">Plata</span>
                  <span className="text-xs font-black text-slate-900 block mt-0.5">$5.000<span className="text-[9px] font-normal text-slate-500">/m</span></span>
                  <span className="text-[9px] text-slate-500 block">5% desc. • 10 libros/año</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-100/50 border border-yellow-300">
                  <span className="text-[10px] font-bold uppercase text-amber-900 block">Oro</span>
                  <span className="text-xs font-black text-slate-900 block mt-0.5">$10.000<span className="text-[9px] font-normal text-slate-500">/m</span></span>
                  <span className="text-[9px] text-slate-500 block">10% desc. • Préstamo ilimitado</span>
                </div>
              </div>
            </div>
          )}

          {/* Información y Preguntas Frecuentes de Uso */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200 text-slate-700">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-roncedo-blue" />
              <span>¿Cómo utilizo mi Credencial Digital?</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Identificación en sala:</strong> Presentá tu código QR desde tu pantalla en la recepción del club y biblioteca para identificarte rápidamente.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Beneficios de Socio Protector:</strong> Si colaborás con alguna de las 3 categorías (Bronce, Plata u Oro), accedés al retiro de libros físicos y descuentos en la tienda oficial y eventos.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Sin carnet plástico:</strong> Funciona siempre en tu celular, incluso sin internet si tenés la aplicación instalada.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
