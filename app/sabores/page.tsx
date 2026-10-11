'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  UtensilsCrossed,
  ArrowLeft,
  Sparkles,
  Clock,
  Flame,
  CheckCircle2,
  Calendar,
  CreditCard,
  ShoppingBag,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';

export default function SaboresPage() {
  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-24 pt-4 sm:pt-6 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navegación Superior: Volver al Inicio */}
        <div className="flex items-center justify-between">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-xs font-bold text-roncedo-navy hover:text-roncedo-celesteDark transition-colors bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-blue-200/80 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-roncedo-celeste" />
            <span>Volver al Inicio</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-300 px-2.5 py-0.5 rounded-full shadow-xs">
              Próximamente
            </span>
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
              Club Roncedo • Gastronomía y Tradición
            </span>
          </div>
        </div>

        {/* Banner Principal Institucional */}
        <div className="bg-gradient-to-br from-[#7C2D12] via-[#9A3412] to-[#EA580C] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/20">
          <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none w-48 h-48 sm:w-64 sm:h-64">
            <Image
              src="/images/logo-biblioteca.png"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-orange-400/20 text-orange-200 border border-orange-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-orange-300" />
              <span>Módulo de Reservas en Implementación</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md">
                <UtensilsCrossed className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Sabores del Club
                </h1>
                <p className="text-xs sm:text-sm text-orange-100 mt-1 max-w-xl leading-relaxed">
                  Reserva online de porciones para locros patrios, empanadas caseras, polladas benéficas y eventos gastronómicos tradicionales organizados por las subcomisiones del Club Roncedo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estado: Próximamente y Adelanto del Sistema */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-blue-200/80 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-800">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Comodidad y reserva garantizada</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              ¿Cómo funcionará la reserva de porciones?
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Vas a poder asegurar tus platos tradicionales con pocos clics directamente desde la App.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FFF8F3] border border-orange-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-900 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5 text-orange-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Locros Patrios y Platos Típicos
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reservá tus porciones para el 25 de Mayo, 9 de Julio, empanadas criollas de vigilia y las clásicas polladas organizadas por el fútbol formativo.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF8F3] border border-orange-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-900 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5 text-orange-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Horarios y Punto de Retiro
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Información clara del horario exacto de entrega, recordatorio en tu teléfono y lugar de retiro en el quincho, cantina o sede del Club.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF8F3] border border-orange-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-900 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5 text-orange-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Pago Digital o en Efectivo
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Abona tu reserva cómodamente con Mercado Pago o señalá pago en efectivo al momento de retirar tu porción.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF8F3] border border-orange-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-900 flex items-center justify-center font-bold">
                <Heart className="w-5 h-5 text-orange-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Apoyo a las Disciplinas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cada evento gastronómico tiene como objetivo recaudar fondos para viajes de juveniles, indumentaria, insumos o mejoras edilicias del Club.
              </p>
            </div>
          </div>

          {/* Tarjeta Informativa de Próxima Venta */}
          <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-900 bg-orange-200/80 px-2.5 py-0.5 rounded-full">
                Próximos Eventos Gastronómicos
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                ¿Querés anunciar una venta de comida de tu subcomisión?
              </h4>
              <p className="text-xs text-slate-600 max-w-lg">
                Coordiná la publicación de tu menú con la administración del club para que aparezca habilitada la reserva en la App para todos los socios.
              </p>
            </div>

            <a
              href={`https://wa.me/${CONTACTO_BIBLIOTECA.telefonoRaw}?text=${encodeURIComponent(
                '¡Hola! Me gustaría consultar por la reserva de porciones / comidas del Club Roncedo.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-orange-700 hover:bg-orange-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Consultar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
