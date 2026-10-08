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

  return (
    <div className="min-h-screen bg-slate-100/70 pb-24 pt-6 px-4">
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

        {isSocio ? (
          <div>
            {/* Componente del Carnet */}
            <CarnetDigital user={user} className="mb-6" />

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
              Solicitud de Socio Requerida
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-3">
              Aún no tienes un Carnet de Socio activo
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Estás registrado como usuario general. Para obtener tu <strong>Carnet Digital con QR único</strong>, solicitar libros a domicilio y disfrutar de los beneficios institucionales, completa tu solicitud de socio.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/perfil"
                className="inline-flex items-center justify-center gap-2 bg-roncedo-navy hover:bg-blue-900 text-white font-bold px-6 py-3.5 rounded-2xl shadow-md text-sm transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>Completar mi Solicitud de Socio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
