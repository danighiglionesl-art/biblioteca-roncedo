'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  X,
  Flashlight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Barcode,
  Keyboard,
  ArrowRight,
} from 'lucide-react';
import { validarIsbn, formatearIsbn } from '@/lib/isbn/isbnService';

interface ScannerCodigoBarrasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIsbnDetectado: (isbn: string) => void;
}

export function ScannerCodigoBarrasModal({
  isOpen,
  onClose,
  onIsbnDetectado,
}: ScannerCodigoBarrasModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [iniciandoCamara, setIniciandoCamara] = useState(true);
  const [errorCamara, setErrorCamara] = useState<string | null>(null);
  const [linternaActiva, setLinternaActiva] = useState(false);
  const [soportaLinterna, setSoportaLinterna] = useState(false);
  const [codigoDetectado, setCodigoDetectado] = useState<string | null>(null);
  const [modoManual, setModoManual] = useState(false);
  const [isbnManual, setIsbnManual] = useState('');

  const animFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Detener la cámara y apagar luces
  const detenerCamara = useCallback(() => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Notificar éxito con vibración y sonido sutil
  const procesarDeteccion = useCallback((codigo: string) => {
    const validacion = validarIsbn(codigo);
    if (validacion.valido) {
      setCodigoDetectado(validacion.clean);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([60, 40, 80]);
        } catch {}
      }
      setTimeout(() => {
        detenerCamara();
        onIsbnDetectado(validacion.clean);
        onClose();
      }, 700);
    }
  }, [detenerCamara, onIsbnDetectado, onClose]);

  // Bucle de escaneo continuo
  const iniciarBucleEscaneo = useCallback(() => {
    const scanLoop = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animFrameId.current = requestAnimationFrame(scanLoop);
        return;
      }

      const video = videoRef.current;

      // 1. Usar BarcodeDetector nativo si está disponible en el navegador
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'code_128', 'code_39'],
          });
          const barcodes = await barcodeDetector.detect(video);
          if (barcodes && barcodes.length > 0) {
            const rawVal = barcodes[0].rawValue;
            if (rawVal) {
              procesarDeteccion(rawVal);
              return;
            }
          }
        } catch {
          // Ignorar y continuar con fallback
        }
      }

      // Continuar siguiente frame si no se detectó
      animFrameId.current = requestAnimationFrame(scanLoop);
    };

    animFrameId.current = requestAnimationFrame(scanLoop);
  }, [procesarDeteccion]);

  // Iniciar la cámara
  const arrancarCamara = useCallback(async () => {
    setIniciandoCamara(true);
    setErrorCamara(null);
    setCodigoDetectado(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no permite acceso directo a la cámara.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Verificar si soporta linterna (torch)
        const track = stream.getVideoTracks()[0];
        const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          setSoportaLinterna(true);
        }

        setIniciandoCamara(false);
        iniciarBucleEscaneo();
      }
    } catch (err: any) {
      console.warn('Error iniciando cámara:', err);
      setErrorCamara(
        err.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado. Podés habilitarlo en los ajustes del navegador o ingresar el ISBN manualmente.'
          : 'No se pudo iniciar la cámara en este dispositivo. Podés ingresar el ISBN de forma manual.'
      );
      setIniciandoCamara(false);
      setModoManual(true);
    }
  }, [iniciarBucleEscaneo]);

  useEffect(() => {
    if (isOpen) {
      arrancarCamara();
    } else {
      detenerCamara();
    }

    return () => {
      detenerCamara();
    };
  }, [isOpen, arrancarCamara, detenerCamara]);

  // Alternar linterna
  const alternarLinterna = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      const nuevoEstado = !linternaActiva;
      await (track as any).applyConstraints({
        advanced: [{ torch: nuevoEstado }],
      });
      setLinternaActiva(nuevoEstado);
    } catch (e) {
      console.warn('Error cambiando linterna:', e);
    }
  };

  // Enviar ISBN manual
  const handleEnviarManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isbnManual.trim()) return;
    const validacion = validarIsbn(isbnManual);
    if (!validacion.valido) {
      alert(`ISBN no válido: ${validacion.error}`);
      return;
    }
    detenerCamara();
    onIsbnDetectado(validacion.clean);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-white relative">
        {/* Cabecera */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-roncedo-gold/20 text-roncedo-gold flex items-center justify-center">
              <Barcode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Escáner de Código de Barras</h3>
              <p className="text-[10px] text-slate-400">ISBN-10 e ISBN-13 (EAN-13)</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {soportaLinterna && !modoManual && (
              <button
                type="button"
                onClick={alternarLinterna}
                className={`p-2 rounded-xl border transition-colors ${
                  linternaActiva
                    ? 'bg-amber-400 text-slate-900 border-amber-300'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="Encender Linterna"
              >
                <Flashlight className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                detenerCamara();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Área Visual de la Cámara o Modo Manual */}
        <div className="relative aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
          {!modoManual ? (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Marco visor de escaneo */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="relative w-64 h-36 border-2 border-dashed border-roncedo-gold/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
                  {/* Línea láser de escaneo animada */}
                  <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444] animate-pulse" />

                  {codigoDetectado ? (
                    <div className="bg-emerald-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl font-mono text-xs font-black flex items-center gap-1.5 shadow-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{formatearIsbn(codigoDetectado)}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-white/80 font-bold bg-black/60 px-2 py-0.5 rounded-full">
                      Enfocá el código de barras
                    </span>
                  )}
                </div>
              </div>

              {iniciandoCamara && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-roncedo-blue animate-spin" />
                  <span className="text-xs font-semibold text-slate-300">Iniciando cámara trasera...</span>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 text-center space-y-4 w-full">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-roncedo-gold flex items-center justify-center mx-auto">
                <Keyboard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Ingreso Manual de ISBN</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Escribí los 10 o 13 dígitos impresos debajo del código de barras.
                </p>
              </div>

              <form onSubmit={handleEnviarManual} className="space-y-3">
                <input
                  type="text"
                  autoFocus
                  value={isbnManual}
                  onChange={(e) => setIsbnManual(e.target.value)}
                  placeholder="Ej: 9789504908906 o 0306406152"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-center font-mono text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                />
                <button
                  type="submit"
                  disabled={!isbnManual.trim()}
                  className="w-full bg-roncedo-blue hover:bg-blue-600 text-white font-black py-2.5 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                >
                  <span>Validar e Ingresar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer con Ayuda y Selector de Modo */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-400">
            {modoManual ? 'Escribí sin guiones o con guiones' : 'Mantené el libro iluminado'}
          </div>

          <button
            type="button"
            onClick={() => {
              if (modoManual) {
                setModoManual(false);
                arrancarCamara();
              } else {
                setModoManual(true);
                detenerCamara();
              }
            }}
            className="text-roncedo-gold hover:text-amber-300 font-bold text-xs underline"
          >
            {modoManual ? 'Volver a Cámara' : 'Escribir Manualmente'}
          </button>
        </div>
      </div>
    </div>
  );
}
