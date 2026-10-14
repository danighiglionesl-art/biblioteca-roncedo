'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
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
  QrCode,
  Copy,
  MessageCircle,
  Sparkles,
  Camera,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

type OSType = 'ios' | 'android' | 'desktop';
type BrowserType = 'safari' | 'chrome' | 'edge' | 'samsung' | 'firefox' | 'other';
type PlatformTab = 'android' | 'ios' | 'desktop';

interface DeviceState {
  os: OSType;
  browser: BrowserType;
  label: string;
  isTablet: boolean;
}

export default function InstalarPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [device, setDevice] = useState<DeviceState>({
    os: 'android',
    browser: 'chrome',
    label: 'Dispositivo móvil',
    isTablet: false,
  });
  const [activeTab, setActiveTab] = useState<PlatformTab>('desktop');
  const [instalando, setInstalando] = useState(false);
  const [instaladoExito, setInstaladoExito] = useState(false);
  const [mostrarQrMovil, setMostrarQrMovil] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const appUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/instalar`
      : 'https://www.bibliotecaroncedo.ar/instalar';

  const mensajeWhatsApp = encodeURIComponent(
    '¡Hola! Te invito a instalar la App oficial de la Biblioteca Roncedo 📚\n\n' +
      'Accedé a tu carnet digital, catálogo de libros, actas históricas y novedades en:\n' +
      `${appUrl}`
  );
  const urlWhatsApp = `https://wa.me/?text=${mensajeWhatsApp}`;

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

    // Detección iOS / iPadOS
    const isIPad =
      /ipad/.test(ua) || (platform === 'macintel' && navigator.maxTouchPoints > 1);
    const isIPhone = /iphone|ipod/.test(ua);
    const isIOS = isIPhone || isIPad;

    // Detección Android
    const isAndroid = /android/.test(ua);

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
      } else {
        browser = 'chrome';
        browserName = 'Google Chrome';
      }
    } else {
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

    const detectedOS: OSType = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';

    setDevice({
      os: detectedOS,
      browser,
      label: `${osName} • ${browserName}`,
      isTablet: isIPad,
    });

    // Pestaña predeterminada según dispositivo detectado
    setActiveTab(detectedOS);

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
    if (!deferredPrompt) return;

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

  // Descarga en alta definición del código QR para imprimir cartelería o promocionar
  const handleDescargarQR = () => {
    const svgElement = document.getElementById('qr-code-svg');
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URLObj = window.URL || window.webkitURL || window;
    const blobURL = URLObj.createObjectURL(svgBlob);

    const image = new window.Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, 1000, 1000);
        context.drawImage(image, 100, 100, 800, 800);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'QR-Biblioteca-Roncedo.png';
        downloadLink.href = pngUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URLObj.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  // Copiar enlace al portapapeles
  const handleCopiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Ignorar fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#EBF4FC] text-slate-800 pb-20 pt-4 px-4 font-sans flex flex-col justify-between">
      <div className="max-w-md w-full mx-auto space-y-5">
        {/* Barra superior de navegación */}
        <div className="flex items-center justify-between pt-1">
          <Link
            href={user ? '/home' : '/login'}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-roncedo-navy hover:text-roncedo-celesteDark transition-colors bg-white px-3.5 py-1.5 rounded-full border border-blue-200/80 shadow-xs active:scale-98"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-roncedo-celeste" />
            <span>{user ? 'Volver al Inicio' : 'Volver al Login'}</span>
          </Link>

          {mounted && (
            <span className="text-[11px] font-semibold text-slate-700 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-blue-200/70 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {device.label}
            </span>
          )}
        </div>

        {/* Badge superior indicando dispositivo detectado (estilo Casa Nueva) */}
        {mounted && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-[#0F284B] text-white px-4 py-1.5 rounded-full text-xs font-black shadow-md border border-blue-400/30">
              {device.os === 'desktop' ? (
                <>
                  <Laptop className="w-3.5 h-3.5 text-amber-300" />
                  <span>Estás en Computadora</span>
                </>
              ) : device.os === 'ios' ? (
                <>
                  <Apple className="w-3.5 h-3.5 text-rose-300" />
                  <span>Estás en {device.isTablet ? 'iPad' : 'iPhone'}</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Estás en Android</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Cabecera Principal con Escudo */}
        <div className="text-center pt-1">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2.5 drop-shadow-md transition-transform hover:scale-105">
            <Image
              src="/images/logo-biblioteca.png"
              alt="Biblioteca Roncedo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Instalá Biblioteca Roncedo
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xs mx-auto leading-snug">
            Te guiamos paso a paso para tener la app oficial en la pantalla de tu celular o computadora.
          </p>
        </div>

        {/* Selector de Plataformas (Segmented Control estilo Casa Nueva) */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl border border-blue-200/90 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveTab('android');
              setMostrarQrMovil(false);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'android'
                ? 'bg-[#0F284B] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>🤖</span>
            <span>Android</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ios');
              setMostrarQrMovil(false);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'ios'
                ? 'bg-[#0F284B] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>🍎</span>
            <span>iPhone / iOS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'desktop'
                ? 'bg-[#0F284B] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>💻</span>
            <span>PC / Mac</span>
          </button>
        </div>

        {/* Tarjeta Central de Instrucciones o Código QR */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-blue-200/90 relative overflow-hidden transition-all">
          {/* CASO: YA INSTALADA */}
          {isStandalone || instaladoExito ? (
            <div className="text-center py-2 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  ¡Aplicación Instalada!
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                  Biblioteca Roncedo ya se encuentra instalada y lista para usar en este dispositivo.
                </p>
              </div>
              <Link
                href={user ? '/home' : '/login'}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-roncedo-navy via-[#1A457D] to-roncedo-navy text-white font-black py-3.5 px-6 rounded-2xl shadow-md transition-all text-sm active:scale-98"
              >
                <span>{user ? 'Abrir Biblioteca Roncedo' : 'Ingresar a la Plataforma'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : activeTab === 'desktop' ? (
            /* TAB 1: PC / MAC -> CÓDIGO QR DESTACADO PARA ESCANEAR DESDE EL CELULAR */
            <div className="text-center space-y-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-roncedo-navy bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80 mb-2">
                  <Camera className="w-3.5 h-3.5 text-roncedo-celeste" />
                  <span>Escaneá desde tu Celular</span>
                </div>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-snug">
                  Apuntá la cámara de tu celular hacia este código QR para abrir e instalar la aplicación al instante:
                </p>
              </div>

              {/* Contenedor del Código QR en alta definición con Escudo de Roncedo */}
              <div className="flex justify-center my-3">
                <div className="bg-white p-3.5 rounded-3xl shadow-lg border-2 border-blue-200/90 inline-block transition-transform hover:scale-102">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={appUrl}
                    size={210}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: '/images/clubes/lautaro-roncedo.png',
                      height: 46,
                      width: 46,
                      excavate: true,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-extrabold text-[#0F284B] flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Compatible con Android y iPhone</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Sin pasar por Play Store ni App Store • Directo a tu celular
                </p>
              </div>

              {/* Botón para descargar el QR en alta definición para imprimir cartelería / folletos */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleDescargarQR}
                  className="w-full text-xs font-bold text-roncedo-navy hover:text-[#1A457D] bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Download className="w-3.5 h-3.5 text-roncedo-celeste" />
                  <span>Descargar QR para Promoción o Cartelería</span>
                </button>
              </div>

              {/* Instalación alternativa directa en Computadora */}
              <div className="pt-3 border-t border-slate-100 text-left">
                {deferredPrompt ? (
                  <button
                    onClick={handleInstallClick}
                    disabled={instalando}
                    className="w-full bg-[#0F284B] hover:bg-[#1A457D] text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <Laptop className="w-4 h-4 text-roncedo-celeste" />
                    <span>{instalando ? 'Instalando...' : 'O instalar directamente en esta Computadora'}</span>
                  </button>
                ) : (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-roncedo-celeste" />
                      <span>Instalar en esta Computadora:</span>
                    </p>
                    <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside leading-snug">
                      <li>
                        Hacé clic en el ícono de <strong className="text-slate-900">Instalar</strong> en la barra de direcciones de tu navegador.
                      </li>
                      <li>
                        Confirmá haciendo clic en <strong className="text-slate-900">&ldquo;Instalar&rdquo;</strong>.
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'android' ? (
            /* TAB 2: ANDROID */
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-1.5">
                  <span>🤖</span>
                  <span>Instalación en Android</span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  Tené el acceso directo oficial en la pantalla de tu celular en segundos:
                </p>
              </div>

              {/* Botón directo de instalación nativa de Chrome si el navegador lo soporta */}
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  disabled={instalando}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black py-3.5 px-5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-98"
                >
                  <Download className="w-4 h-4 text-emerald-200" />
                  <span>{instalando ? 'Iniciando instalación...' : 'Instalar en este Celular Ahora'}</span>
                </button>
              )}

              {/* Guía paso a paso ilustrada */}
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-[#0F284B] text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <p className="flex-1 font-medium leading-snug">
                    Tocá el menú de <strong className="text-slate-900">los 3 puntos</strong>{' '}
                    <MoreVertical className="w-3.5 h-3.5 inline mx-0.5 text-slate-700" /> arriba a la derecha en Chrome.
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-[#0F284B] text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  <p className="flex-1 font-medium leading-snug">
                    Elegí <strong className="text-slate-900">&ldquo;Instalar aplicación&rdquo;</strong> o &ldquo;Agregar a la pantalla principal&rdquo;.
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-[#0F284B] text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    3
                  </span>
                  <p className="flex-1 font-medium leading-snug">
                    Confirmá y ¡listo! El ícono de Biblioteca Roncedo aparecerá junto a tus aplicaciones.
                  </p>
                </div>
              </div>

              {/* Opción para alternar visualización de QR para compartir */}
              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setMostrarQrMovil(!mostrarQrMovil)}
                  className="text-xs font-bold text-roncedo-navy hover:text-[#1A457D] inline-flex items-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-roncedo-celeste" />
                  <span>{mostrarQrMovil ? 'Ocultar Código QR' : '¿Compartir con otro celular? Mostrar QR'}</span>
                </button>

                {mostrarQrMovil && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center animate-fade-in">
                    <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200">
                      <QRCodeSVG
                        value={appUrl}
                        size={170}
                        level="H"
                        imageSettings={{
                          src: '/images/clubes/lautaro-roncedo.png',
                          height: 38,
                          width: 38,
                          excavate: true,
                        }}
                      />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 mt-2">
                      Apuntá la cámara para abrir la App
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 3: IPHONE / IOS */
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 mb-1.5">
                  <Apple className="w-3.5 h-3.5 text-slate-700" />
                  <span>Instalación en iPhone / iPad</span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  Instalá la app oficial desde Safari en 3 toques:
                </p>
              </div>

              {/* Guía paso a paso Safari */}
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-[#0F284B] text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <p className="flex-1 font-medium leading-snug">
                    Abrí esta página en <strong className="text-slate-900">Safari</strong> y tocá el botón{' '}
                    <strong className="text-slate-900">Compartir</strong>{' '}
                    <Share className="w-3.5 h-3.5 inline mx-1 text-blue-600" /> en la barra inferior.
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-[#0F284B] text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  <p className="flex-1 font-medium leading-snug">
                    Deslizá el menú hacia abajo y seleccioná{' '}
                    <strong className="text-slate-900">&ldquo;Agregar a inicio&rdquo;</strong>{' '}
                    <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-700" />.
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-[#0F284B] text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    3
                  </span>
                  <p className="flex-1 font-medium leading-snug">
                    Tocá <strong className="text-slate-900">&ldquo;Agregar&rdquo;</strong> en la esquina superior derecha para confirmar.
                  </p>
                </div>
              </div>

              {/* Opción para alternar visualización de QR para compartir */}
              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setMostrarQrMovil(!mostrarQrMovil)}
                  className="text-xs font-bold text-roncedo-navy hover:text-[#1A457D] inline-flex items-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-roncedo-celeste" />
                  <span>{mostrarQrMovil ? 'Ocultar Código QR' : '¿Compartir con otro celular? Mostrar QR'}</span>
                </button>

                {mostrarQrMovil && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center animate-fade-in">
                    <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200">
                      <QRCodeSVG
                        value={appUrl}
                        size={170}
                        level="H"
                        imageSettings={{
                          src: '/images/clubes/lautaro-roncedo.png',
                          height: 38,
                          width: 38,
                          excavate: true,
                        }}
                      />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 mt-2">
                      Apuntá la cámara para abrir la App
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botones de Acción (estilo Casa Nueva: Abrir Aplicación + Compartir por WhatsApp) */}
        <div className="space-y-2.5">
          {/* Botón 1: Abrir Aplicación (estilo institucional Roncedo) */}
          <Link
            href={user ? '/home' : '/login'}
            className="w-full bg-gradient-to-r from-roncedo-navy via-[#1A457D] to-roncedo-navy hover:opacity-95 text-white font-black py-4 px-6 rounded-2xl shadow-md shadow-blue-950/15 transition-all flex items-center justify-center gap-2.5 text-sm active:scale-98"
          >
            <span>🚀</span>
            <span>{user ? 'Abrir Aplicación' : 'Ingresar a la Plataforma'}</span>
          </Link>

          {/* Botón 2: Compartir App por WhatsApp (estilo Casa Nueva verde WhatsApp) */}
          <a
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-black py-4 px-6 rounded-2xl shadow-md shadow-emerald-950/15 transition-all flex items-center justify-center gap-2.5 text-sm active:scale-98"
          >
            <MessageCircle className="w-5 h-5 fill-white stroke-none" />
            <span>Compartir App por WhatsApp</span>
          </a>

          {/* Botón auxiliar: Copiar enlace */}
          <button
            type="button"
            onClick={handleCopiarEnlace}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl border border-blue-200/80 shadow-xs transition-all flex items-center justify-center gap-2 text-xs active:scale-98"
          >
            {copiado ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span className="text-emerald-700 font-extrabold">¡Enlace copiado al portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar Enlace Directo</span>
              </>
            )}
          </button>
        </div>

        {/* Resumen de características destacadas */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500 font-medium pt-1 text-center">
          <span className="inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            Sin descargas de tiendas
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            Carnet siempre disponible
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
            Acceso instantáneo
          </span>
        </div>
      </div>

      {/* Pie institucional */}
      <footer className="text-center text-[11px] text-slate-400 pt-6">
        Biblioteca Dr. Lautaro Roncedo • Alcira Gigena
      </footer>
    </div>
  );
}
