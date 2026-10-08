'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Laptop,
  Check,
} from 'lucide-react';

export default function InstalarPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [instalado, setInstalado] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalada / standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    // Detectar si es iOS (iPhone / iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Escuchar el evento estándar de PWA en navegadores compatibles (Android / Chrome / Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('Para instalar en tu dispositivo, abre el menú de opciones de tu navegador (los 3 puntos o el botón de compartir) y elige "Agregar a la pantalla de inicio".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalado(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-28 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Cabecera */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/40 bg-white/10 p-1">
            <Image
              src="/images/emblema-biblioteca.jpg"
              alt="Ícono PWA Biblioteca Roncedo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xs uppercase font-bold tracking-wider text-roncedo-blue bg-roncedo-sky px-3 py-1 rounded-full border border-blue-200 inline-block mb-2">
            Aplicación Web Progresiva (PWA)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            Instalar Biblioteca Roncedo
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
            Lleva la Biblioteca en tu celular como una aplicación nativa, rápida y sin descargar nada de Google Play o App Store.
          </p>
        </div>

        {/* Si ya está instalada */}
        {isStandalone ? (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-emerald-950">
              ¡La aplicación ya está instalada en tu dispositivo!
            </h3>
            <p className="text-xs text-emerald-800 mt-1">
              Estás accediendo a la versión completa de la Biblioteca Roncedo.
            </p>
            <Link
              href="/home"
              className="inline-block mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              Ir a la pantalla de inicio
            </Link>
          </div>
        ) : (
          <>
            {/* Botón directo de instalación (Android / Chrome / Edge) */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200 text-center">
              <h2 className="text-base font-extrabold text-slate-900 mb-1">
                Instalación en 1 Toque
              </h2>
              <p className="text-xs text-slate-500 mb-5">
                Presiona el botón a continuación para agregar el icono de la Biblioteca a la pantalla de inicio de tu teléfono o computadora.
              </p>

              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto min-w-[280px] bg-roncedo-navy hover:bg-blue-900 text-white font-black text-sm py-4 px-8 rounded-2xl shadow-xl transition-all transform active:scale-95 inline-flex items-center justify-center gap-3"
              >
                <Download className="w-5 h-5 text-roncedo-goldLight" />
                <span>Instalar Aplicación Ahora</span>
              </button>

              {instalado && (
                <p className="text-xs font-bold text-emerald-600 mt-3 flex items-center justify-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>¡Aplicación instalada exitosamente!</span>
                </p>
              )}
            </div>

            {/* Guía Paso a Paso para iPhone (Safari iOS) */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Instrucciones para iPhone y iPad (Apple Safari)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    En dispositivos Apple sigue estos 3 simples pasos:
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-roncedo-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Toca el botón &ldquo;Compartir&rdquo; de Safari
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      Es el ícono con un cuadrado y una flecha hacia arriba (<Share className="w-3.5 h-3.5 text-blue-600 inline" />) ubicado en la barra inferior de Safari.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-roncedo-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Selecciona &ldquo;Agregar a la pantalla de inicio&rdquo;
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      Desliza hacia abajo en las opciones hasta encontrar el ícono con el signo más (<PlusSquare className="w-3.5 h-3.5 text-slate-700 inline" />).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-roncedo-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Toca &ldquo;Agregar&rdquo; arriba a la derecha
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ¡Listo! Ya tendrás el escudo de la Biblioteca en tu pantalla de inicio junto a tus otras aplicaciones.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ventajas de la PWA */}
            <div className="bg-gradient-to-br from-roncedo-navy to-blue-900 text-white rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-wider text-roncedo-goldLight mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-roncedo-gold" />
                <span>Beneficios de la Aplicación Instalada</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Acceso instantáneo:</strong> Abre en pantalla completa sin barras de navegador.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Tu Carnet siempre a mano:</strong> Presenta tu QR en la biblioteca en cualquier momento.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>No gasta espacio:</strong> Pesa menos de 2 MB y no satura la memoria de tu celular.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Siempre actualizada:</strong> Cada mejora publicada en Vercel se actualiza sola sin instalar parches.</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
