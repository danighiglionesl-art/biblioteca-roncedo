'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Ticket,
  ArrowLeft,
  Sparkles,
  Clock,
  Gift,
  ShieldCheck,
  CreditCard,
  QrCode,
  CheckCircle2,
  Trophy,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';

export default function RifasPage() {
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
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-xs">
              Próximamente
            </span>
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
              Club Roncedo • Bonos y Sorteos
            </span>
          </div>
        </div>

        {/* Banner Principal Institucional */}
        <div className="bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#0284C7] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/20">
          <div className="absolute -right-6 -bottom-6 opacity-15 pointer-events-none w-48 h-48 sm:w-64 sm:h-64">
            <Image
              src="/images/escudo-roncedo.png"
              alt="Escudo"
              fill
              className="object-contain"
            />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>Plataforma Digital de Sorteos en Desarrollo</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20 shadow-md">
                <Ticket className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Rifas y Sorteos Digitales
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl leading-relaxed">
                  Rifas oficiales, bonos contribución y sorteos digitales transparentes del Club Sp. y Bibl. Dr. Lautaro Roncedo con elección de números, pago online y comprobante al instante.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estado: Próximamente y Adelanto de Contenidos */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-blue-200/80 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Colaborá con el Club de forma moderna, rápida y segura</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              ¿Cómo funcionarán las Rifas Digitales?
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Una herramienta digital para que socios, simpatizantes y vecinos de cualquier lugar del país puedan participar de los sorteos institucionales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-emerald-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                <Ticket className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Elección de Números Favoritos
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visualizá la grilla interactiva en tiempo real con los números libres y reservados. Elegí tus fechas especiales o números de la suerte con un solo toque.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-emerald-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Pago Integrado e Instantáneo
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aboná tus números mediante Mercado Pago, transferencia bancaria (Alias/CBU) o tarjetas de débito y crédito. Comprobante digital verificado en tu perfil.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-emerald-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Transparencia y Sorteos Oficiales
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sorteos realizados en base a Lotería de Córdoba o transmisiones en directo por redes oficiales con escribano público y publicación de ganadores.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-emerald-100 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                <Gift className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Grandes Premios y Destino de los Fondos
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Premios en efectivo, electrodomésticos, órdenes de compra e indumentaria. El 100% de lo recaudado se destina a obras de infraestructura y material deportivo.
              </p>
            </div>
          </div>

          {/* Tarjeta de Acompañamiento Institucional */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-full">
                Colaboración Directa
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                ¿Querés sumarte a la red de colaboradores de rifas y bonos?
              </h4>
              <p className="text-xs text-slate-600 max-w-lg">
                Si querés ser distribuidor voluntario, comprar bonos en cuotas o proponer una campaña solidaria para alguna disciplina del Club, contactate con Tesorería.
              </p>
            </div>

            <a
              href={`https://wa.me/${CONTACTO_BIBLIOTECA.telefonoRaw}?text=${encodeURIComponent(
                '¡Hola! Me comunico para consultar sobre las rifas y bonos contribución del Club Roncedo.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Consultar en Secretaría</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
