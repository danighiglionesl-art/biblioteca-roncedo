'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { UserProfile } from '@/types';
import { formatFechaArgentina } from '@/lib/utils';
import { obtenerMedallaProtector } from '@/lib/payments/plans';
import { CheckCircle2, AlertCircle, Share2, Maximize2, Shield, Calendar, QrCode } from 'lucide-react';

interface CarnetDigitalProps {
  user: UserProfile;
  className?: string;
}

export function CarnetDigital({ user, className = '' }: CarnetDigitalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isCuotaAlDia = (user.estado_cuota || 'al_dia') === 'al_dia';
  const isSocioProtectorActivo = user.estado_socio_protector === 'activo';
  const medallaInfo = isSocioProtectorActivo
    ? obtenerMedallaProtector(user.tipo_socio_protector)
    : undefined;

  // Payload seguro para el QR institucional
  const qrData = JSON.stringify({
    org: 'CSyB-RONCEDO',
    socio: isSocioProtectorActivo
      ? `PROTECTOR-${user.tipo_socio_protector || 'BRONCE'}`
      : `APP-USER-${user.id.slice(-4).toUpperCase()}`,
    nombre: `${user.nombre} ${user.apellido}`,
    dni: user.dni || 'S/D',
    condicion: isSocioProtectorActivo
      ? `Socio Protector ${user.tipo_socio_protector || 'Bronce'}`
      : 'Usuario de la App (Servicios restringidos)',
    protector: isSocioProtectorActivo ? `Socio Protector ${user.tipo_socio_protector || ''}`.trim() : 'no',
    alta: user.fecha_alta_socio || user.fecha_adhesion || '2026-04-01',
    val: 'OFICIAL-VERIFICADO',
  });

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Contenedor del Carnet */}
      <div
        className={`w-full max-w-sm rounded-2xl overflow-hidden shadow-carnet border border-blue-900/30 transition-all duration-300 relative ${
          isFullscreen ? 'scale-105 z-50 ring-4 ring-roncedo-blue' : ''
        }`}
        style={{
          background: 'linear-gradient(145deg, #102A4E 0%, #1A3E72 50%, #0F2544 100%)',
        }}
      >
        {/* Marca de agua de fondo */}
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <div className="relative w-72 h-72">
            <Image
              src="/images/escudo-roncedo.png"
              alt="Marca de agua"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Cabecera del Carnet */}
        <div className="px-5 pt-5 pb-3 border-b border-white/10 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex-shrink-0 drop-shadow-md">
              <Image
                src="/images/logo-biblioteca.png"
                alt="Emblema Biblioteca Roncedo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase font-bold text-roncedo-celesteLight">
                {isSocioProtectorActivo ? 'CARNET DE SOCIO PROTECTOR' : 'CREDENCIAL DIGITAL DE APP'}
              </p>
              <h2 className="text-sm font-extrabold text-white leading-tight">
                Biblioteca Roncedo
              </h2>
              <p className="text-[11px] text-blue-200">
                Club Sp. y B. Dr. Lautaro Roncedo
              </p>
            </div>
          </div>
          <div className="text-right flex items-center gap-2.5">
            {isSocioProtectorActivo && medallaInfo && (
              <div
                className="relative w-11 h-11 flex-shrink-0 drop-shadow-md hover:scale-105 transition-transform"
                title={`Socio Protector ${medallaInfo.label}`}
              >
                <Image
                  src={medallaInfo.medalla}
                  alt={`Medalla ${medallaInfo.label}`}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                {isSocioProtectorActivo ? 'N° PROTECTOR' : 'ID USUARIO'}
              </span>
              <span className="text-lg font-black text-amber-300 tracking-wider">
                {isSocioProtectorActivo ? `#PROT-${user.tipo_socio_protector ? user.tipo_socio_protector.slice(0, 3).toUpperCase() : 'ORO'}` : `#USR-${user.id.slice(-4).toUpperCase()}`}
              </span>
            </div>
          </div>
        </div>

        {/* Cuerpo del Carnet */}
        <div className="p-5 relative z-10">
          <div className="flex gap-4 items-start">
            {/* Foto de perfil */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-28 rounded-xl overflow-hidden border-2 border-white/30 bg-white/10 shadow-md">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={`${user.nombre} ${user.apellido}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-2 text-center">
                    <span className="text-2xl font-bold uppercase">
                      {user.nombre.charAt(0)}{user.apellido.charAt(0) || 'R'}
                    </span>
                    <span className="text-[9px] text-blue-200 mt-1 uppercase font-semibold">
                      {isSocioProtectorActivo ? 'Protector' : 'Usuario'}
                    </span>
                  </div>
                )}
              </div>
              <span className={`mt-1.5 text-[9px] uppercase font-black px-2 py-0.5 rounded-full tracking-wide border text-center ${
                isSocioProtectorActivo
                  ? 'bg-amber-400/20 text-amber-300 border-amber-300/40'
                  : 'bg-white/15 text-white border-white/10'
              }`}>
                {isSocioProtectorActivo ? `Protector ${user.tipo_socio_protector || 'Bronce'}` : 'Usuario App'}
              </span>
            </div>

            {/* Datos Personales */}
            <div className="flex-1 space-y-2 text-left">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Nombre y Apellido
                </p>
                <p className="text-base font-bold text-white capitalize leading-snug">
                  {user.nombre} {user.apellido}
                </p>
                {/* Insignia oficial de Socio Protector */}
                {isSocioProtectorActivo && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-bold shadow-sm backdrop-blur-sm">
                    {medallaInfo && (
                      <div className="relative w-4 h-4 flex-shrink-0 drop-shadow-sm">
                        <Image
                          src={medallaInfo.insignia}
                          alt={`Insignia ${medallaInfo.label}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <span>Socio Protector {medallaInfo?.label ? `${medallaInfo.label}` : ''}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  DNI
                </p>
                <p className="text-xs font-semibold text-slate-100">
                  {user.dni || 'Sin registrar'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                    Alta
                  </p>
                  <p className="text-[11px] font-medium text-slate-200">
                    {formatFechaArgentina(user.fecha_alta_socio || '2021-04-10')}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                    Localidad
                  </p>
                  <p className="text-[11px] font-medium text-slate-200 truncate">
                    {user.localidad || 'Alcira Gigena'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Condición Institucional y Código QR */}
          <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
            {/* Condición de acceso */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                {isSocioProtectorActivo ? 'Condición Social' : 'Condición de Cuenta'}
              </span>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isSocioProtectorActivo
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40'
                    : 'bg-slate-500/25 text-blue-200 border border-blue-400/30'
                }`}
              >
                {isSocioProtectorActivo ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PROTECTOR ACTIVO</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-3.5 h-3.5 text-roncedo-celeste" />
                    <span>USUARIO DE LA APP</span>
                  </>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                {isSocioProtectorActivo
                  ? 'Aporte al día • Membresía plena'
                  : 'Servicios restringidos'}
              </p>
            </div>

            {/* Código QR Interactivo */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-2 rounded-xl shadow-lg border-2 border-roncedo-blueLight">
                <QRCodeSVG
                  value={qrData}
                  size={74}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <span className="text-[9px] font-mono text-slate-300 mt-1 uppercase tracking-tight flex items-center gap-1">
                <QrCode className="w-2.5 h-2.5 text-roncedo-gold" />
                Validar
              </span>
            </div>
          </div>
        </div>

        {/* Pie institucional */}
        <div className="bg-roncedo-navyDark px-5 py-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
          <span className="font-semibold text-roncedo-goldLight">
            — CULTURA Y DEPORTE —
          </span>
          <span className="text-[10px] text-slate-400">
            bibliotecaroncedo.ar
          </span>
        </div>
      </div>

      {/* Acciones del Carnet */}
      <div className="mt-4 flex items-center gap-3 w-full max-w-sm justify-center">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-roncedo-navy shadow-sm hover:bg-slate-50 transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5 text-roncedo-blue" />
          <span>{isFullscreen ? 'Reducir' : 'Ampliar'}</span>
        </button>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Carnet de Socio - Biblioteca Roncedo',
                text: `Carnet Digital de ${user.nombre} ${user.apellido} (Socio #${user.numero_socio || '1042'})`,
                url: window.location.href,
              }).catch(() => {});
            } else {
              alert('Usa una captura de pantalla para guardar tu carnet o preséntalo directamente desde aquí.');
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-roncedo-blue text-white text-xs font-semibold shadow-sm hover:bg-blue-600 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartir / Guardar</span>
        </button>
      </div>
    </div>
  );
}
