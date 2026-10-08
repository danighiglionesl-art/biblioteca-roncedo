'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';

export function BotonWhatsappFlotante() {
  const pathname = usePathname();

  // No mostrar en pantallas de login o recuperación para no estorbar
  if (pathname === '/login' || pathname === '/recuperar') {
    return null;
  }

  return (
    <aside aria-label="Contacto por WhatsApp" className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex items-center group">
      <a
        href={CONTACTO_BIBLIOTECA.getWhatsAppUrl('Hola, me comunico desde la app de la Biblioteca Roncedo con una consulta')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Consultas por WhatsApp al ${CONTACTO_BIBLIOTECA.whatsappFormato}`}
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white p-3.5 md:px-4 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 group-hover:scale-105 border border-white/30"
        title={`Consultas por WhatsApp: ${CONTACTO_BIBLIOTECA.whatsappFormato}`}
      >
        <MessageCircle className="w-6 h-6 fill-white text-transparent flex-shrink-0" />
        <span className="hidden md:inline text-xs font-black tracking-wide pr-1">
          Consultas WhatsApp
        </span>
      </a>
    </aside>
  );
}
