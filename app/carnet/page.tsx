'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { CarnetDigital } from '@/components/carnet/CarnetDigital';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  HelpCircle,
} from 'lucide-react';

export default function CarnetPage() {
  const { user } = useAuth();

  if (!user) return null;

  const isSocio = user.role === 'socio' || user.role === 'admin';
  const isSocioProtector = user.estado_socio_protector === 'activo';
  const hasCarnet = isSocio || isSocioProtector;

  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-24 pt-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Cabecera de Página */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-roncedo-navy text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5 text-roncedo-gold" />
            <span>Credencial Institucional</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Carnet Digital Oficial
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tu identificación personal para retiro de libros, acceso a eventos y beneficios de socio
          </p>
        </div>

        {hasCarnet ? (
          <div>
            {/* Componente del Carnet */}
            <CarnetDigital user={user} className="mb-6" />

            {/* Ficha Informativa de Socio Protector si está activo */}
            {isSocioProtector && (
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4 mb-4 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❤️</span>
                  <div>
                    <h3 className="text-xs font-black text-rose-950 uppercase tracking-wide">
                      Socio Protector {user.tipo_socio_protector || 'Activo'}
                    </h3>
                    <p className="text-[11px] text-rose-800">
                      Aporte mensual activo de ${user.importe_mensual?.toLocaleString('es-AR') || '2.000'}/mes vía {user.proveedor_pago === 'mercadopago' ? 'Mercado Pago' : user.proveedor_pago || 'Mercado Pago'}. ¡Gracias por apoyar a la Biblioteca!
                    </p>
                  </div>
                </div>
                <Link
                  href="/socio-protector"
                  className="px-3 py-1.5 rounded-xl bg-white text-rose-700 hover:bg-rose-100 text-xs font-bold border border-rose-200 transition-colors flex-shrink-0"
                >
                  Gestionar
                </Link>
              </div>
            )}

            {/* Invitación a ser Socio Protector si es socio pero aún no es protector */}
            {isSocio && !isSocioProtector && (
              <div className="bg-white border border-blue-200/80 rounded-2xl p-4 mb-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Sumá tu distinción de Socio Protector</span>
                    <span>❤️</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Colaborá con un aporte mensual voluntario para apoyar las actividades culturales y educativas.
                  </p>
                </div>
                <Link
                  href="/socio-protector"
                  className="px-3.5 py-1.5 rounded-xl bg-roncedo-navy text-white text-xs font-bold hover:bg-blue-900 transition-colors flex-shrink-0"
                >
                  Conocer más
                </Link>
              </div>
            )}

            {/* Si es Socio Protector pero aún no socio general */}
            {!isSocio && isSocioProtector && (
              <div className="bg-white border border-blue-200/80 rounded-2xl p-4 mb-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    ¿Deseas también retirar libros y tener número de socio oficial?
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Podés solicitar tu alta de socio general en cualquier momento. Ambas categorías son complementarias.
                  </p>
                </div>
                <Link
                  href="/perfil"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex-shrink-0"
                >
                  Solicitar Socio
                </Link>
              </div>
            )}

            {/* Información y Preguntas Frecuentes de Uso */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200 mt-6 text-slate-700">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-roncedo-blue" />
                <span>¿Cómo utilizo mi Carnet Digital?</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Retiro y devolución de libros:</strong> Muestra el código QR desde tu pantalla en la recepción de la Biblioteca para registrar tus préstamos al instante.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Actividades y Talleres:</strong> Te habilita el acceso con descuento o cupo prioritario a los cursos culturales del club.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Sin necesidad de carnet plástico:</strong> Funciona siempre en tu celular, incluso cuando no tengas conexión a internet si instalaste la PWA.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* Estado cuando es solo Usuario Registrado */
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200 text-center">
            <div className="w-20 h-20 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-4 text-amber-600">
              <CreditCard className="w-10 h-10" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              Habilitación Requerida
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-3">
              Aún no tienes un Carnet Digital emitido
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Estás registrado como usuario general. Puedes obtener tu carnet como <strong>Socio Oficial</strong> completando tu solicitud, o convertirte en <strong>Socio Protector ❤️</strong> colaborando con el sostenimiento de la institución.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/socio-protector"
                className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-3 rounded-2xl shadow-md text-xs sm:text-sm transition-all"
              >
                <span>Ser Socio Protector ❤️</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/perfil"
                className="inline-flex items-center justify-center gap-2 bg-roncedo-navy hover:bg-blue-900 text-white font-bold px-5 py-3 rounded-2xl shadow-md text-xs sm:text-sm transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>Solicitud de Socio</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
