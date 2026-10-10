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
  const src = medallaInfo?.insignia || '/images/socio-protector/insignia-oficial.png';
  const label = medallaInfo?.label
    ? `Insignia Socio Protector ${medallaInfo.label}`
    : 'Insignia Oficial Socio Protector';

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 drop-shadow-sm ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      title={label}
    >
      <Image
        src={src}
        alt={label}
        fill
        sizes={`${size}px`}
        className="object-contain"
        priority={priority}
      />
    </div>
  );
}
