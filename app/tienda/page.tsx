'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Sparkles, CheckCircle2, MessageCircle } from 'lucide-react';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';

export default function TiendaPage() {
  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-24 pt-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-roncedo-celesteDark hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-blue-200/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#5B9BE5] text-white flex items-center justify-center shadow-md">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-300">
                Módulo Programado • Etapa 7
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                Tienda y Marketplace Institucional
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Tienda oficial para la adquisición de merchandising institucional, libros editados por la institución, indumentaria conmemorativa de Roncedo, souvenirs del Centenario y obras literarias, con integración inicial de pedidos vía WhatsApp y soporte futuro de pagos online.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>Funcionalidades listas para activarse en la Etapa 7:</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Catálogo de productos con fotos, talles, stock y precios</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Pedidos directos y consultas rápidas por WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Preparado para pagos con Mercado Pago y cobro de cuotas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Retiro en sede de la Biblioteca y envíos a domicilio</span>
              </div>
            </div>
          </div>

          {/* Contacto directo por WhatsApp */}
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800">¿Buscás souvenirs, indumentaria o libros de la institución?</p>
                <p className="text-slate-600">Consultas y reservas por WhatsApp oficial: <strong>{CONTACTO_BIBLIOTECA.whatsappFormato}</strong></p>
              </div>
            </div>
            <a
              href={CONTACTO_BIBLIOTECA.getWhatsAppTiendaUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl font-bold flex items-center gap-2 flex-shrink-0 transition-colors shadow-sm"
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
