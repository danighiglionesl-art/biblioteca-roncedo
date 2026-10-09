'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { PLANES_SOCIO_PROTECTOR } from '@/lib/payments/plans';
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Lock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  CreditCard,
  Building,
  MessageCircle,
} from 'lucide-react';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';

export default function SocioProtectorPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E5F2FE] flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-roncedo-celeste border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Módulo disponible únicamente para usuarios que ya hayan iniciado sesión
  if (!user) {
    return (
      <div className="min-h-screen bg-[#E5F2FE] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-card border border-slate-200 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <Heart className="w-8 h-8 fill-rose-500" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
            Acceso para Usuarios Registrados
          </span>
          <h1 className="text-xl font-black text-slate-900 mt-3">
            Inicia sesión para ser Socio Protector
          </h1>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Para vincular tu colaboración mensual a tu perfil y obtener tu insignia en el carnet digital, por favor inicia sesión o crea una cuenta comunitaria.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/login?redirect=/socio-protector"
              className="w-full py-3 bg-roncedo-navy hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/home"
              className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-semibold"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isProtectorActivo = user.estado_socio_protector === 'activo';

  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-24 pt-6 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Cabecera Principal Institucional */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0F2D54] to-[#1B5699] text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-3 shadow-sm">
            <Heart className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Módulo Institucional</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Socio Protector
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mt-3 font-medium leading-relaxed">
            Tu aporte mensual ayuda a sostener y desarrollar las actividades culturales, sociales y educativas de Biblioteca Roncedo.
          </p>
        </div>

        {/* Estado actual del usuario si ya es Socio Protector */}
        {isProtectorActivo && (
          <div className="bg-gradient-to-br from-[#0F284B] via-[#1A457D] to-[#2563EB] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-white/20">
            <div className="absolute right-4 top-4 opacity-15 pointer-events-none">
              <Heart className="w-36 h-36 fill-white" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/20">
                  ¡Aporte Activo! 🤝
                </span>
                <h2 className="text-xl font-black">
                  ¡Gracias, {user.nombre}! Eres Socio Protector {user.tipo_socio_protector || ''}
                </h2>
                <p className="text-xs text-blue-100 max-w-lg leading-relaxed">
                  Tu colaboración mensual de ${user.importe_mensual?.toLocaleString('es-AR') || '2.000'} ayuda directamente al funcionamiento de la biblioteca y a los proyectos comunitarios.
                </p>
              </div>

              <Link
                href="/carnet"
                className="inline-flex items-center gap-2 bg-white text-[#0F284B] hover:bg-blue-50 px-4 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all flex-shrink-0"
              >
                <CreditCard className="w-4 h-4" />
                <span>Ver Insignia en mi Carnet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Las Tres Opciones de Aporte Mensual */}
        <div>
          <div className="text-center mb-6">
            <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">
              Opciones de Aporte Mensual
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Planes con suscripción mensual recurrente y cancelación flexible en cualquier momento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANES_SOCIO_PROTECTOR.map((plan) => {
              const isCurrentTier =
                isProtectorActivo &&
                user.tipo_socio_protector?.toLowerCase() === plan.tipo.toLowerCase();

              // Colores temáticos por plan
              const cardStyles =
                plan.tipo === 'Bronce'
                  ? {
                      badge: 'bg-amber-100 text-amber-900 border-amber-300',
                      border: 'border-amber-200/80 hover:border-amber-400',
                      button: 'bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950 text-white',
                      iconBg: 'bg-amber-50 text-amber-700',
                    }
                  : plan.tipo === 'Plata'
                  ? {
                      badge: 'bg-slate-200 text-slate-900 border-slate-300 ring-2 ring-blue-400/50',
                      border: 'border-blue-300 hover:border-blue-500 shadow-md',
                      button: 'bg-gradient-to-r from-[#1B5296] to-[#0F2D54] hover:from-[#153f75] hover:to-[#0b213e] text-white shadow-md',
                      iconBg: 'bg-blue-50 text-blue-700',
                    }
                  : {
                      badge: 'bg-yellow-100 text-yellow-900 border-yellow-300',
                      border: 'border-yellow-300 hover:border-yellow-500',
                      button: 'bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 hover:from-yellow-700 hover:to-amber-800 text-white shadow-md',
                      iconBg: 'bg-yellow-50 text-yellow-700',
                    };

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between relative shadow-card ${
                    cardStyles.border
                  } ${plan.destacado ? 'md:-translate-y-2' : ''}`}
                >
                  {plan.destacado && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-roncedo-blue to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Más Elegido</span>
                    </div>
                  )}

                  <div>
                    {/* Medalla Oficial de la Categoría */}
                    <div className="flex justify-center mb-3">
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 transition-transform duration-300 hover:scale-105 drop-shadow-md">
                        <Image
                          src={plan.imagenMedalla || `/images/socio-protector/medalla-${plan.tipo.toLowerCase()}.png`}
                          alt={`Medalla ${plan.tipo}`}
                          fill
                          className="object-contain"
                          priority
                        />
                      </div>
                    </div>

                    {/* Título y Monto del Plan */}
                    <div className="text-center pb-5 border-b border-slate-100">
                      <span
                        className={`inline-block text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border mb-3 ${
                          cardStyles.badge
                        }`}
                      >
                        {plan.nombre}
                      </span>

                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-slate-900">
                          ${plan.monto.toLocaleString('es-AR')}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {plan.periodo}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-2 leading-snug">
                        {plan.descripcion}
                      </p>

                      {/* Píldoras destacadas de Descuento y Préstamos */}
                      <div className="mt-3 flex flex-col gap-1.5 text-left">
                        {plan.descuentoComprasEventos && (
                          <div className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                            <span className="text-xs">🏷️</span>
                            <span><strong>{plan.descuentoComprasEventos} OFF</strong> en compras y eventos</span>
                          </div>
                        )}
                        {plan.limitePrestamos && (
                          <div className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-roncedo-navy border border-blue-200 flex items-center gap-1.5">
                            <span className="text-xs">📚</span>
                            <span><strong>{plan.limitePrestamos}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Beneficios */}
                    <div className="py-5 space-y-2.5">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Beneficios incluidos:
                      </p>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {plan.beneficios.map((b, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Botón de Colaboración con Enlace Oficial de Mercado Pago */}
                  <div className="pt-4 border-t border-slate-100">
                    <a
                      href={plan.mercadoPagoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                        cardStyles.button
                      }`}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                      <span>Quiero colaborar</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>

                    <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
                      <Lock className="w-3 h-3 text-emerald-500" />
                      <span>Checkout seguro de Mercado Pago</span>
                    </div>

                    {isCurrentTier && (
                      <span className="mt-2 block text-center text-[10px] font-bold text-rose-600 bg-rose-50 py-1 rounded-lg border border-rose-200">
                        Tu plan actual
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sección de Compromiso y Transparencia Institucional */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-roncedo-navy flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Compromiso Institucional y Seguridad Financiera
              </h3>
              <p className="text-xs text-slate-500">
                Transparencia, seguridad y autonomía para cada colaborador
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Privacidad y Seguridad</span>
              </h4>
              <p className="leading-relaxed">
                Biblioteca Roncedo <strong>no almacena en ningún caso</strong> números de tarjetas de crédito o débito, datos bancarios ni información financiera sensible. Todas las operaciones se procesan bajo los estándares de seguridad de Mercado Pago.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <BookOpen className="w-3.5 h-3.5 text-roncedo-blue" />
                <span>Destino de los Fondos</span>
              </h4>
              <p className="leading-relaxed">
                Cada aporte sostiene la compra sistemática de nuevos títulos, el sostenimiento de talleres de lectura para niños y adultos, el mantenimiento del espacio físico y la digitalización de nuestro archivo histórico comunal.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Independencia de Categorías</span>
              </h4>
              <p className="leading-relaxed">
                La condición de Socio Protector es totalmente independiente de la de socio normal. Puedes ser usuario registrado, socio de la biblioteca o ambas cosas simultáneamente sin que una reemplace a la otra.
              </p>
            </div>
          </div>

          {/* Banner de Ayuda o Consultas */}
          <div className="bg-[#F3F8FE] border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-roncedo-celeste flex-shrink-0" />
              <p className="text-slate-600">
                ¿Tenés dudas sobre tu adhesión o necesitás cancelar tu suscripción? Escribinos a nuestro WhatsApp oficial (<strong>{CONTACTO_BIBLIOTECA.whatsappFormato}</strong>).
              </p>
            </div>
            <a
              href={CONTACTO_BIBLIOTECA.getWhatsAppSocioProtectorUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 flex-shrink-0 transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Consultar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
