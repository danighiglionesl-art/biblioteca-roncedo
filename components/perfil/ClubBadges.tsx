'use client';

import React from 'react';

interface ClubBadgeProps {
  nombre: string;
  className?: string;
}

export function ClubBadge({ nombre, className = 'w-6 h-6' }: ClubBadgeProps) {
  switch (nombre) {
    case 'Lautaro Roncedo':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#0F2D54" stroke="#5B9BE5" strokeWidth="1.5" />
          <path d="M10 6 H22 V18 C22 23 16 26 16 26 C16 26 10 23 10 18 Z" fill="#FFFFFF" />
          <path d="M13 6 H19 V18 C19 21 16 24 16 24 C16 24 13 21 13 18 Z" fill="#5B9BE5" />
          <text x="16" y="16" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#0F2D54">R</text>
        </svg>
      );

    case 'Lutgardis Riveros':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#FFFFFF" stroke="#003366" strokeWidth="1.5" />
          <path d="M7 10 L25 10 L23 16 L9 16 Z" fill="#003366" />
          <path d="M8 16 L24 16 L21 21 L11 21 Z" fill="#FFCC00" />
          <text x="16" y="14" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#FFFFFF">LR</text>
        </svg>
      );

    case 'Boca Juniors':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#002B7F" stroke="#FFD100" strokeWidth="1.5" />
          <path d="M5 12 H27 V20 H5 Z" fill="#FFD100" />
          <text x="16" y="17.5" fontSize="5.5" fontWeight="900" textAnchor="middle" fill="#002B7F">CABJ</text>
        </svg>
      );

    case 'River Plate':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#FFFFFF" stroke="#D11218" strokeWidth="1.5" />
          <path d="M6 7 L26 23 L23 27 L3 11 Z" fill="#D11218" />
          <circle cx="16" cy="16" r="6" fill="#FFFFFF" stroke="#000000" strokeWidth="0.8" />
          <text x="16" y="18" fontSize="4.5" fontWeight="900" textAnchor="middle" fill="#000000">CARP</text>
        </svg>
      );

    case 'Independiente':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#E2001A" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="9" fill="#002B7F" stroke="#FFFFFF" strokeWidth="1" />
          <text x="16" y="18.5" fontSize="5" fontWeight="900" textAnchor="middle" fill="#FFFFFF">CAI</text>
        </svg>
      );

    case 'Racing Club':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#FFFFFF" stroke="#75AADB" strokeWidth="1.5" />
          <path d="M7 6 H12 V22 C12 24 9 26 7 24 Z" fill="#75AADB" />
          <path d="M14 6 H18 V26 C16 27 16 27 14 26 Z" fill="#75AADB" />
          <path d="M20 6 H25 V24 C23 26 20 24 20 22 Z" fill="#75AADB" />
          <text x="16" y="16" fontSize="5" fontWeight="900" textAnchor="middle" fill="#000000">RC</text>
        </svg>
      );

    case 'San Lorenzo':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <circle cx="16" cy="16" r="14" fill="#FFFFFF" stroke="#002F6C" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="12" fill="#002F6C" />
          <path d="M10 4 H13 V28 H10 Z" fill="#D22630" />
          <path d="M19 4 H22 V28 H19 Z" fill="#D22630" />
          <circle cx="16" cy="16" r="7" fill="#FFFFFF" />
          <text x="16" y="18" fontSize="4" fontWeight="900" textAnchor="middle" fill="#002F6C">CASLA</text>
        </svg>
      );

    case 'Rosario Central':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#0B2341" stroke="#FFCC00" strokeWidth="1.5" />
          <path d="M10 6 H14 V24 C12 25 10 24 10 22 Z" fill="#FFCC00" />
          <path d="M18 6 H22 V22 C22 24 20 25 18 24 Z" fill="#FFCC00" />
          <text x="16" y="16.5" fontSize="4.5" fontWeight="900" textAnchor="middle" fill="#FFFFFF">CARC</text>
        </svg>
      );

    case "Newell's Old Boys":
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#000000" stroke="#FFFFFF" strokeWidth="1.2" />
          <path d="M16 2 L4 6 V18 C4 25 16 30 16 30 Z" fill="#E20613" />
          <text x="16" y="18" fontSize="5" fontWeight="900" textAnchor="middle" fill="#FFFFFF">NOB</text>
        </svg>
      );

    case 'Huracán':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#FFFFFF" stroke="#E20613" strokeWidth="1.5" />
          <circle cx="16" cy="14" r="6" fill="#E20613" />
          <path d="M14 20 L16 23 L18 20 Z" fill="#E20613" />
          <text x="16" y="27" fontSize="4.5" fontWeight="900" textAnchor="middle" fill="#E20613">CAH</text>
        </svg>
      );

    case 'Vélez Sarsfield':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#FFFFFF" stroke="#003580" strokeWidth="1.5" />
          <path d="M5 6 L16 19 L27 6 L23 6 L16 14 L9 6 Z" fill="#003580" />
          <text x="16" y="24" fontSize="4.5" fontWeight="900" textAnchor="middle" fill="#003580">CAVS</text>
        </svg>
      );

    case 'Estudiantes de La Plata':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#FFFFFF" stroke="#E20613" strokeWidth="1.5" />
          <path d="M9 6 H13 V23 H9 Z" fill="#E20613" />
          <path d="M19 6 H23 V23 H19 Z" fill="#E20613" />
          <text x="16" y="17" fontSize="4.5" fontWeight="900" textAnchor="middle" fill="#000000">EDLP</text>
        </svg>
      );

    case 'Gimnasia de la Plata':
    case 'Gimnasia de La Plata':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#FFFFFF" stroke="#0F2D54" strokeWidth="1.5" />
          <path d="M5 12 H27 V18 H5 Z" fill="#0F2D54" />
          <text x="16" y="16.5" fontSize="4.5" fontWeight="900" textAnchor="middle" fill="#FFFFFF">GELP</text>
        </svg>
      );

    case 'Talleres de Córdoba':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#0A1E3F" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M9 6 H13 V24 H9 Z" fill="#FFFFFF" />
          <path d="M19 6 H23 V24 H19 Z" fill="#FFFFFF" />
          <text x="16" y="16.5" fontSize="5" fontWeight="900" textAnchor="middle" fill="#0A1E3F">CAT</text>
        </svg>
      );

    case 'Belgrano de Córdoba':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <circle cx="16" cy="16" r="14" fill="#5B9BE5" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="11" fill="#FFFFFF" />
          <text x="16" y="18" fontSize="5" fontWeight="900" textAnchor="middle" fill="#0F2D54">CAB</text>
        </svg>
      );

    case 'Instituto de Córdoba':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#FFFFFF" stroke="#E20613" strokeWidth="1.5" />
          <path d="M8 6 H12 V23 H8 Z" fill="#E20613" />
          <path d="M14 6 H18 V26 H14 Z" fill="#E20613" />
          <path d="M20 6 H24 V23 H20 Z" fill="#E20613" />
          <text x="16" y="15" fontSize="4.5" fontWeight="900" textAnchor="middle" fill="#000000">IACC</text>
        </svg>
      );

    case 'Banfield':
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#006837" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M6 7 L26 23 L23 27 L3 11 Z" fill="#FFFFFF" />
          <text x="16" y="18" fontSize="4.5" fontWeight="900" textAnchor="middle" fill="#006837">CAB</text>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 32 32" className={className} fill="none">
          <path d="M16 2 L28 6 V18 C28 25 16 30 16 30 C16 30 4 25 4 18 V6 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="6" fill="#94A3B8" />
          <text x="16" y="18" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#FFFFFF">⚽</text>
        </svg>
      );
  }
}
