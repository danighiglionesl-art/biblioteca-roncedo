'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

export async function forzarActualizacionCompleta() {
  try {
    if (typeof window !== 'undefined') {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.unregister();
        }
      }
      window.location.href = window.location.pathname + '?ts=' + Date.now();
    }
  } catch (e) {
    console.error('Error forzando actualización:', e);
    window.location.reload();
  }
}

export function ServiceWorkerRegister() {
  const [hayActualizacion, setHayActualizacion] = useState(false);
  const [workerEnEspera, setWorkerEnEspera] = useState<ServiceWorker | null>(null);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Exponer la función global para uso desde cualquier vista o soporte
    (window as any).__limpiarCacheRoncedo = forzarActualizacionCompleta;

    if (!('serviceWorker' in navigator)) return;

    let registrationRef: ServiceWorkerRegistration | null = null;
    let recargando = false;

    // Detectar cuando el nuevo worker toma el control y recargar automáticamente
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!recargando) {
        recargando = true;
        window.location.reload();
      }
    });

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        registrationRef = reg;

        // Forzar chequeo de nueva versión en cada arranque
        reg.update().catch(() => {});

        // Si ya hay un worker nuevo esperando, activarlo
        if (reg.waiting) {
          setWorkerEnEspera(reg.waiting);
          setHayActualizacion(true);
          // Intentar activación inmediata
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        reg.addEventListener('updatefound', () => {
          const nuevoWorker = reg.installing;
          if (nuevoWorker) {
            nuevoWorker.addEventListener('statechange', () => {
              if (nuevoWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWorkerEnEspera(nuevoWorker);
                setHayActualizacion(true);
                // Forzar activación inmediata
                nuevoWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((err) => {
        console.log('[SW] Registro:', err);
      });

    // Rechequear cada vez que el usuario vuelve a la app en Android
    const handleVisibilidad = () => {
      if (document.visibilityState === 'visible' && registrationRef) {
        registrationRef.update().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibilidad);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilidad);
    };
  }, []);

  const aplicarActualizacion = () => {
    setActualizando(true);
    if (workerEnEspera) {
      workerEnEspera.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(() => {
        forzarActualizacionCompleta();
      }, 500);
    } else {
      forzarActualizacionCompleta();
    }
  };

  if (!hayActualizacion) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto animate-fade-in">
      <div className="bg-roncedo-navy text-white p-3.5 rounded-2xl shadow-2xl border-2 border-roncedo-gold flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-roncedo-gold/20 flex items-center justify-center text-roncedo-gold flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">¡Nueva versión disponible!</p>
            <p className="text-[10px] text-blue-200">Actualizada con las últimas mejoras</p>
          </div>
        </div>
        <button
          onClick={aplicarActualizacion}
          disabled={actualizando}
          className="bg-roncedo-gold hover:bg-yellow-500 text-roncedo-navyDark font-black text-xs px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 shadow-sm flex-shrink-0 disabled:opacity-70"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${actualizando ? 'animate-spin' : ''}`} />
          <span>{actualizando ? 'Actualizando...' : 'Actualizar'}</span>
        </button>
      </div>
    </div>
  );
}
