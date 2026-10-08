'use client';

import React, { useState, useEffect } from 'react';
import { LibroDigital } from '@/types';
import {
  X,
  BookOpen,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Coffee,
  Loader2,
  Maximize2,
  Minimize2,
  CheckCircle,
} from 'lucide-react';

interface LectorDigitalModalProps {
  libro: LibroDigital;
  onClose: () => void;
}

export function LectorDigitalModal({ libro, onClose }: LectorDigitalModalProps) {
  const [contenidoHtml, setContenidoHtml] = useState<string | null>(libro.texto_directo_pwa || null);
  const [cargando, setCargando] = useState<boolean>(!libro.texto_directo_pwa);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(18);
  const [tema, setTema] = useState<'claro' | 'sepia' | 'oscuro'>('claro');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  useEffect(() => {
    // Si ya tenemos HTML o si es embed de Internet Archive, no necesitamos cargar
    if (libro.texto_directo_pwa || libro.ia_id) {
      setCargando(false);
      return;
    }

    let isMounted = true;
    async function cargarTexto() {
      try {
        setCargando(true);
        setError(null);

        let url = '';
        if (libro.wikisource_page) {
          url = `/api/digital/read?page=${encodeURIComponent(libro.wikisource_page)}`;
        } else if (libro.gutenberg_id) {
          url = `/api/digital/read?gutenberg_id=${libro.gutenberg_id}`;
        } else {
          // Intentar abrir el formato html si existe
          const formatoHtml = libro.formatos.find((f) => f.tipo === 'html');
          if (formatoHtml) {
            setContenidoHtml(null); // Usará iframe seguro
            setCargando(false);
            return;
          }
        }

        if (url) {
          const res = await fetch(url);
          const data = await res.json();
          if (isMounted) {
            if (data.success && data.html) {
              setContenidoHtml(data.html);
            } else {
              setError(data.error || 'No se pudo cargar el texto para lectura directa.');
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError('Error de conexión al cargar la obra.');
        }
      } finally {
        if (isMounted) setCargando(false);
      }
    }

    cargarTexto();

    return () => {
      isMounted = false;
    };
  }, [libro]);

  // Manejar tema de fondo y texto
  const getThemeStyles = () => {
    switch (tema) {
      case 'sepia':
        return {
          bg: 'bg-[#FBF0D9]',
          text: 'text-[#433422]',
          panel: 'bg-[#F4E4C1] border-[#E2CE9F]',
        };
      case 'oscuro':
        return {
          bg: 'bg-[#12161A]',
          text: 'text-[#DCE4EC]',
          panel: 'bg-[#1A222B] border-slate-700',
        };
      case 'claro':
      default:
        return {
          bg: 'bg-white',
          text: 'text-slate-900',
          panel: 'bg-slate-50 border-slate-200',
        };
    }
  };

  const themeStyles = getThemeStyles();
  const formatoEpub = libro.formatos.find((f) => f.tipo === 'epub');
  const formatoPdf = libro.formatos.find((f) => f.tipo === 'pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 animate-fade-in">
      <div
        className={`flex flex-col w-full ${
          isFullScreen ? 'h-full max-w-full rounded-none' : 'max-w-4xl h-[92vh] rounded-3xl'
        } ${themeStyles.bg} shadow-2xl overflow-hidden border border-white/20 transition-all duration-200`}
      >
        {/* Barra Superior de Control del Lector */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${themeStyles.panel}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-roncedo-navy text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <BookOpen className="w-5 h-5 text-roncedo-gold" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-roncedo-celesteDark truncate block">
                Lector Digital PWA • {libro.fuente.toUpperCase()}
              </span>
              <h2 className="text-sm sm:text-base font-black truncate max-w-md" title={libro.titulo}>
                {libro.titulo}
              </h2>
              <p className="text-xs opacity-75 truncate">{libro.autor}</p>
            </div>
          </div>

          {/* Herramientas de visualización (tipografía Gotham, tamaño, tema) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Ajuste de Fuente */}
            <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-xl p-1 gap-1">
              <button
                onClick={() => setFontSize((prev) => Math.max(14, prev - 2))}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                title="Reducir tamaño de letra"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold px-1.5">{fontSize}px</span>
              <button
                onClick={() => setFontSize((prev) => Math.min(30, prev + 2))}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                title="Aumentar tamaño de letra"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Selector de Tema */}
            <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-xl p-1 gap-1">
              <button
                onClick={() => setTema('claro')}
                className={`p-1.5 rounded-lg transition-colors ${
                  tema === 'claro' ? 'bg-white shadow text-slate-900' : 'opacity-60 hover:opacity-100'
                }`}
                title="Modo Día"
              >
                <Sun className="w-3.5 h-3.5 text-amber-600" />
              </button>
              <button
                onClick={() => setTema('sepia')}
                className={`p-1.5 rounded-lg transition-colors ${
                  tema === 'sepia' ? 'bg-[#F4E4C1] shadow text-[#433422]' : 'opacity-60 hover:opacity-100'
                }`}
                title="Modo Sepia (Lectura Cálida)"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-800" />
              </button>
              <button
                onClick={() => setTema('oscuro')}
                className={`p-1.5 rounded-lg transition-colors ${
                  tema === 'oscuro' ? 'bg-slate-800 shadow text-white' : 'opacity-60 hover:opacity-100'
                }`}
                title="Modo Noche"
              >
                <Moon className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>

            {/* Descargas autorizadas */}
            {formatoEpub && (
              <a
                href={formatoEpub.url}
                download
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl shadow-sm transition-colors"
                title="Descargar libro en formato EPUB libre"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EPUB</span>
              </a>
            )}

            {formatoPdf && (
              <a
                href={formatoPdf.url}
                download
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl shadow-sm transition-colors"
                title="Descargar libro en formato PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </a>
            )}

            {/* Pantalla completa */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title={isFullScreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Cerrar */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors ml-1"
              title="Cerrar lector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Lector */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-10 relative">
          {cargando ? (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="w-10 h-10 text-roncedo-blue animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-600">Cargando texto íntegro en español...</p>
              <p className="text-xs text-slate-400 mt-1">Conectando con {libro.fuente.toUpperCase()}</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-amber-500 mb-3" />
              <h3 className="text-base font-bold mb-2">Lectura Directa Externa</h3>
              <p className="text-xs opacity-80 mb-6 leading-relaxed">{error}</p>
              <a
                href={libro.enlace_oficial}
                target="_blank"
                rel="noreferrer"
                className="bg-roncedo-navy hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-roncedo-gold" />
                <span>Leer en sitio oficial de {libro.fuente}</span>
              </a>
            </div>
          ) : libro.ia_id ? (
            // Visor embebido de Internet Archive / Open Library
            <div className="w-full h-full min-h-[500px]">
              <iframe
                src={`https://archive.org/embed/${libro.ia_id}`}
                className="w-full h-full min-h-[550px] rounded-2xl border border-slate-300"
                allowFullScreen
              />
            </div>
          ) : contenidoHtml ? (
            // Texto íntegro formateado con tipografía Gotham
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 pb-6 border-b border-black/10 dark:border-white/10 text-center">
                <span className="text-xs uppercase font-bold tracking-widest text-roncedo-celesteDark">
                  Obra en Dominio Público • Idioma Español
                </span>
                <h1 className="text-2xl sm:text-3xl font-black mt-2 leading-tight">{libro.titulo}</h1>
                <p className="text-sm font-semibold opacity-75 mt-1">{libro.autor}</p>
                {libro.anio && <p className="text-xs opacity-50 mt-0.5">Año: {libro.anio}</p>}
              </div>

              <div
                className="prose max-w-none leading-relaxed transition-all"
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                dangerouslySetInnerHTML={{ __html: contenidoHtml }}
              />

              <div className="mt-12 pt-6 border-t border-black/10 dark:border-white/10 text-center text-xs opacity-60 space-y-2">
                <p>Digitalizado por {libro.fuente.toUpperCase()} para difusión cultural libre y gratuita.</p>
                <p>Biblioteca Club Sportivo y Biblioteca Dr. Lautaro Roncedo • Alcira Gigena</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-roncedo-blue mb-3" />
              <h3 className="text-base font-bold mb-2">Obra con Enlace de Lectura Oficial</h3>
              <p className="text-xs opacity-80 mb-6 leading-relaxed">
                Esta obra puede leerse gratuitamente desde el portal oficial de la institución digital.
              </p>
              <a
                href={libro.enlace_oficial}
                target="_blank"
                rel="noreferrer"
                className="bg-roncedo-navy hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-roncedo-gold" />
                <span>Abrir Visor Oficial en {libro.fuente}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
