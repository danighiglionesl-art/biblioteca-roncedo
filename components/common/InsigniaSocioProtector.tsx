'use client';

import React from 'react';
import Image from 'next/image';
import { TipoSocioProtector } from '@/types';
import { obtenerMedallaProtector } from '@/lib/payments/plans';

interface InsigniaSocioProtectorProps {
  tipo?: TipoSocioProtector | string | null;
  size?: number; // Tamaño en píxeles (ancho y alto)
  className?: string;
  priority?: boolean;
}

export function InsigniaSocioProtector({
  tipo,
  size = 20,
  className = '',
  priority = false,
}: InsigniaSocioProtectorProps) {
  const medallaInfo = tipo ? obtenerMedallaProtector(tipo) : undefined;
  const src = medallaInfo?.medalla || '/images/socio-protector/medalla-oro.png';
  const label = medallaInfo?.label
    ? `Medalla Oficial con Cinta Socio Protector ${medallaInfo.label}`
    : 'Medalla Oficial con Cinta Socio Protector';

  const hasCustomSize = className.includes('w-') || className.includes('h-');
  const ancho = Math.round(size * 0.8);
  const alto = size;

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 drop-shadow-sm ${className}`}
      style={hasCustomSize ? undefined : { width: `${ancho}px`, height: `${alto}px` }}
      title={label}
    >
      <Image
        src={src}
        alt={label}
        fill
        sizes={`${alto}px`}
        className="object-contain"
        priority={priority}
      />
    </div>
  );
}
