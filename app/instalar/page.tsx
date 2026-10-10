'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  MoreVertical,
  Check,
  Smartphone,
  Laptop,
  Apple,
} from 'lucide-react';

type OSType = 'ios' | 'android' | 'desktop';
type BrowserType = 'safari' | 'chrome' | 'edge' | 'samsung' | 'firefox' | 'other';

interface DeviceState {
  os: OSType;
  browser: BrowserType;
  label: string;
  isTablet: boolean;
}

export default function InstalarPage() {
  const [mounted, setMounted] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [device, setDevice] = useState<DeviceState>({
    os: 'android',
    browser: 'chrome',
    label: 'Dispositivo móvil',
    isTablet: false,
  });
  const [instalando, setInstalando] = useState(false);
  const [instaladoExito, setInstaladoExito] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Detección de instalación existente (Standalone / PWA activa)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // 2. Detección automática del dispositivo, sistema operativo y navegador
    const ua = (navigator.userAgent || '').toLowerCase();
    const platform = (navigator.platform || '').toLowerCase();

    // Detección iOS / iPadOS (incluye iPads modernos que reportan MacIntel con touch)
    const isIPad =
      /ipad/.test(ua) || (platform === 'macintel' && navigator.maxTouchPoints > 1);
    const isIPhone = /iphone|ipod/.test(ua);
    const isIOS = isIPhone || isIPad;

    // Detección Android
    const isAndroid = /android/.test(ua);

    // Detección Desktop
    const isDesktop = !isIOS && !isAndroid;

    // Detección de navegador
    let browser: BrowserType = 'other';
    let browserName = 'Navegador';

    if (isIOS) {
      if (/crios/.test(ua)) {
        browser = 'chrome';
        browserName = 'Google Chrome';
      } else if (/fxios/.test(ua)) {
        browser = 'firefox';
        browserName = 'Firefox';
      } else if (/edgios/.test(ua)) {
        browser = 'edge';
        browserName = 'Microsoft Edge';
      } else if (/safari/.test(ua)) {
        browser = 'safari';
        browserName = 'Safari';
      } else {
        browser = 'safari';
        browserName = 'Safari';
      }
    } else if (isAndroid) {
      if (/samsungbrowser/.test(ua)) {
        browser = 'samsung';
        browserName = 'Samsung Internet';
      } else if (/edg/.test(ua)) {
        browser = 'edge';
        browserName = 'Microsoft Edge';
      } else if (/firefox/.test(ua)) {
        browser = 'firefox';
        browserName = 'Firefox';
      } else if (/chrome/.test(ua)) {
        browser = 'chrome';
        browserName = 'Google Chrome';
      }
    } else {
      // Desktop
      if (/edg/.test(ua)) {
        browser = 'edge';
        browserName = 'Microsoft Edge';
      } else if (/chrome/.test(ua)) {
        browser = 'chrome';
        browserName = 'Google Chrome';
      } else if (/firefox/.test(ua)) {
        browser = 'firefox';
        browserName = 'Firefox';
      } else if (/safari/.test(ua)) {
        browser = 'safari';
        browserName = 'Safari';
      }
    }

    const osName = isIOS
      ? isIPad
        ? 'iPad'
        : 'iPhone'
      : isAndroid
      ? 'Android'
      : /mac/.test(platform)
      ? 'Mac'
      : /win/.test(platform)
      ? 'Windows'
      : 'Computadora';

    setDevice({
      os: isIOS ? 'ios' : isAndroid ? 'android' : 'desktop',
      browser,
      label: `${osName} • ${browserName}`,
      isTablet: isIPad,
    });

    // 3. Captura del evento nativo beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 4. Detección cuando la app termina de instalarse
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setInstaladoExito(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Manejo del botón de instalación nativo
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    setInstalando(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setInstaladoExito(true);
        setIsStandalone(true);
      }
    } catch (err) {
      console.error('Error al solicitar instalación', err);
    } finally {
      setInstalando(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F6FD] text-slate-800 pb-24 pt-4 px-4 font-sans flex flex-col justify-between">
      <div className="max-w-md w-full mx-auto space-y-5">
        {/* Barra superior de navegación */}
        <div className="flex items-center justify-between pt-1">
          <Link
            href="/home"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-roncedo-navy hover:text-roncedo-celesteDark transition-colors bg-white px-3 py-1.5 rounded-full border border-blue-100 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-roncedo-celesteDark" />
            <span>Volver</span>
          </Link>

          {mounted && (
            <span className="text-[11px] font-medium text-slate-500 bg-white/60 px-2.5 py-1 rounded-full border border-slate-200/50">
              {device.label}
            </span>
          )}
        </div>

        {/* Cabecera Institucional Minimalista */}
        <div className="text-center pt-2">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 drop-shadow-md">
            <Image
              src="/images/logo-biblioteca.png"
              alt="Biblioteca Dr. Lautaro Roncedo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-roncedo-navy tracking-tight leading-tight">
            Instalar Biblioteca Roncedo
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
            Accede a tu carnet, libros y novedades directamente desde tu pantalla de inicio.
          </p>
        </div>

        {/* CONTENIDO AUTOMÁTICO SEGÚN DISPOSITIVO */}
        {mounted && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-blue-100/80 transition-all">
            {/* CASO A: YA ESTÁ INSTALADA */}
            {isStandalone || instaladoExito ? (
              <div className="text-center py-3 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    ¡Aplicación Instalada!
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                    Biblioteca Roncedo ya se encuentra instalada y lista para usar en este dispositivo.
                  </p>
                </div>
                <Link
                  href="/home"
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-roncedo-navy to-[#1A457D] hover:from-[#1A457D] hover:to-[#2B6CB5] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all text-sm active:scale-[0.99]"
                >
                  <span>Abrir Biblioteca Roncedo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : device.os === 'android' ? (
              /* CASO B: ANDROID */
              <div className="space-y-5">
                {/* Botón Principal Destacado */}
                <button
                  onClick={handleInstallClick}
                  disabled={instalando}
                  className="w-full bg-gradient-to-r from-roncedo-navy via-[#1A457D] to-roncedo-navy hover:opacity-95 text-white font-black py-4 px-6 rounded-2xl shadow-md shadow-blue-950/15 transition-all flex items-center justify-center gap-3 text-sm active:scale-[0.99]"
                >
                  <Download className="w-5 h-5 text-roncedo-celesteLight flex-shrink-0" />
                  <span>
                    {instalando ? 'Iniciando instalación...' : 'Instalar Biblioteca Roncedo'}
                  </span>
                </button>

                {/* Si no se activó el prompt automático, mostrar los 2 pasos ultra simples */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">
                    O instala manualmente en 2 pasos:
                  </p>

                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-roncedo-navy text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        1
                      </span>
                      <p className="flex-1 font-medium">
                        Toca el menú <span className="font-bold text-slate-900 inline-flex items-center">los 3 puntos <MoreVertical className="w-3.5 h-3.5 inline mx-0.5 text-slate-700" /></span> arriba a la derecha.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-roncedo-navy text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        2
                      </span>
                      <p className="flex-1 font-medium">
                        Elige <strong className="text-slate-900">&ldquo;Instalar aplicación&rdquo;</strong> o &ldquo;Agregar a la pantalla principal&rdquo;.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : device.os === 'ios' ? (
              /* CASO C: IPHONE / IPAD */
              <div className="space-y-4">
                <div className="text-center mb-1">
                  <span className="text-[11px] font-bold text-roncedo-celesteDark uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    {device.isTablet ? 'Instalación en iPad' : 'Instalación en iPhone'}
                  </span>
                </div>

                {device.browser === 'chrome' ? (
                  /* Chrome en iOS */
                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-roncedo-navy text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        1
                      </span>
                      <p className="flex-1 font-medium">
                        Toca el botón <strong className="text-slate-900">Compartir</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-blue-600" /> en la barra superior.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-roncedo-navy text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        2
                      </span>
                      <p className="flex-1 font-medium">
                        Selecciona <strong className="text-slate-900">&ldquo;Agregar a pantalla de inicio&rdquo;</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-700" /> y toca &ldquo;Agregar&rdquo;.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Safari en iOS (Estándar Apple) */
                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-roncedo-navy text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        1
                      </span>
                      <p className="flex-1 font-medium">
                        Toca el botón <strong className="text-slate-900">Compartir</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-blue-600" /> en la barra {device.isTablet ? 'superior' : 'inferior'} de Safari.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-roncedo-navy text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        2
                      </span>
                      <p className="flex-1 font-medium">
                        Desliza y elige <strong className="text-slate-900">&ldquo;Agregar al inicio&rdquo;</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-700" />.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-roncedo-navy text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        3
                      </span>
                      <p className="flex-1 font-medium">
                        Toca <strong className="text-slate-900">&ldquo;Agregar&rdquo;</strong> arriba a la derecha.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* CASO D: COMPUTADORA (DESKTOP) */
              <div className="space-y-5">
                {deferredPrompt ? (
                  <button
                    onClick={handleInstallClick}
                    disabled={instalando}
                    className="w-full bg-gradient-to-r from-roncedo-navy via-[#1A457D] to-roncedo-navy hover:opacity-95 text-white font-black py-4 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 text-sm active:scale-[0.99]"
                  >
                    <Download className="w-5 h-5 text-roncedo-celesteLight flex-shrink-0" />
                    <span>
                      {instalando ? 'Instalando...' : 'Instalar en tu Computadora'}
                    </span>
                  </button>
                ) : (
                  <div className="space-y-2.5 text-xs text-slate-700">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-1">
                      Instalación en navegador de escritorio:
                    </p>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-roncedo-navy text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        1
                      </span>
                      <p className="flex-1 font-medium">
                        Haz clic en el ícono de <strong className="text-slate-900">Instalar</strong> <Download className="w-3.5 h-3.5 inline mx-1 text-roncedo-celesteDark" /> ubicado a la derecha en la barra de direcciones.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-roncedo-navy text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        2
                      </span>
                      <p className="flex-1 font-medium">
                        Confirma haciendo clic en <strong className="text-slate-900">&ldquo;Instalar&rdquo;</strong> en la ventana emergente.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Resumen de características sutil */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium pt-1">
          <span className="inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Sin descargas pesadas
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            Carnet siempre disponible
          </span>
        </div>
      </div>

      {/* Pie institucional */}
      <footer className="text-center text-[11px] text-slate-400 pt-6">
        Club Sportivo y Biblioteca Dr. Lautaro Roncedo • Alcira Gigena
      </footer>
    </div>
  );
}
