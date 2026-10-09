'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FolderSync,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Folder,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AdminSincronizarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ScanResult {
  success: boolean;
  isCloud?: boolean;
  fotosEnSupabase?: number;
  carpetaBase?: string;
  totalCarpetas?: number;
  totalFotos?: number;
  carpetas?: { nombre: string; cantidadFotos: number }[];
  message?: string;
  error?: string;
}

export function AdminSincronizarModal({
  isOpen,
  onClose,
  onImportComplete,
}: AdminSincronizarModalProps) {
  const [scanData, setScanData] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [limitPerFolder, setLimitPerFolder] = useState<number>(4);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    totalImportadas?: number;
    totalErrores?: number;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      handleScan();
    }
  }, [isOpen]);

  const handleScan = async () => {
    setIsScanning(true);
    setImportResult(null);
    try {
      const res = await fetch('/api/admin/fototeca-import');
      const data = await res.json();
      setScanData(data);
    } catch (e: any) {
      setScanData({ success: false, error: e.message });
    } finally {
      setIsScanning(false);
    }
  };

  const handleStartImport = async () => {
    setIsImporting(true);
    setImportResult(null);
    try {
      const res = await fetch('/api/admin/fototeca-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limitPerFolder }),
      });
      const data = await res.json();
      setImportResult(data);
      if (data.success && data.totalImportadas > 0) {
        onImportComplete();
      }
    } catch (err: any) {
      setImportResult({ success: false, error: err.message });
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-blue-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-roncedo-navy to-roncedo-celesteDark text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FolderSync className="w-5 h-5 text-roncedo-gold" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Sincronizar Archivo Local a Supabase
              </h2>
              <p className="text-[11px] text-blue-200">
                Carpeta: material/Fotografías
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {isScanning ? (
            <div className="py-10 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-roncedo-celeste animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Escaneando la carpeta material/Fotografías...
              </p>
            </div>
          ) : scanData && scanData.isCloud ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Archivo Histórico Activo y Sincronizado</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Actualmente hay <strong>{scanData.fotosEnSupabase || 50} fotografías históricas</strong> publicadas en alta definición en Supabase, distribuidas en las 16 colecciones temáticas (Fiesta del Maíz, Clásicos, Peñas de Mujeres, Búsqueda, etc.).
                </p>
                <div className="pt-2 border-t border-emerald-200 text-[11px] text-slate-600 space-y-1">
                  <p>• Todas las imágenes están comprimidas en WebP de alta fidelidad para optimizar el espacio gratuito.</p>
                  <p>• Los socios y vecinos pueden sumar fotos individuales en cualquier momento desde el botón <strong>«Aportar una Fotografía»</strong>.</p>
                </div>
              </div>
            </div>
          ) : scanData && scanData.success ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-roncedo-navy">
                    {scanData.totalCarpetas} carpetas temáticas detectadas
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Total: {scanData.totalFotos} fotografías disponibles
                  </p>
                </div>
                <button
                  onClick={handleScan}
                  className="text-xs font-bold text-roncedo-celesteDark hover:underline"
                >
                  Volver a escanear
                </button>
              </div>

              {/* Lista de Carpetas Detectadas */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
                {scanData.carpetas?.map((c) => (
                  <div
                    key={c.nombre}
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">
                        {c.nombre}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0">
                      {c.cantidadFotos} fotos
                    </span>
                  </div>
                ))}
              </div>

              {/* Configuración de Ingesta */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Configuración de Carga Equilibrada:</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Para no saturar el almacenamiento gratuito, elegí cuántas fotos representativas cargar por cada carpeta temática:
                </p>
                <div className="flex items-center gap-2 pt-1">
                  {[2, 4, 8, 15].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setLimitPerFolder(num)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        limitPerFolder === num
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-white hover:bg-amber-100 text-slate-700 border border-amber-300'
                      }`}
                    >
                      {num} fotos por carpeta
                    </button>
                  ))}
                </div>
              </div>

              {/* Resultado de la importación */}
              {importResult && (
                <div
                  className={`p-4 rounded-2xl text-xs space-y-1 animate-fade-in ${
                    importResult.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {importResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>
                      {importResult.success
                        ? `¡Importación completada! ${importResult.totalImportadas} fotos subidas y clasificadas en Supabase.`
                        : 'Ocurrió un error en la importación.'}
                    </span>
                  </div>
                  {importResult.totalErrores ? (
                    <p className="text-[11px] text-amber-700">
                      ({importResult.totalErrores} fotos omitidas por formato o peso)
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800">
              <p className="font-bold">No se pudo escanear la carpeta:</p>
              <p className="text-[11px] mt-1">{scanData?.message || scanData?.error || 'Verificá que la carpeta exista en el proyecto.'}</p>
            </div>
          )}
        </div>

        {/* Pie con Acciones */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cerrar
          </button>

          {scanData?.isCloud ? (
            <button
              onClick={() => {
                onImportComplete();
                onClose();
              }}
              className="flex items-center gap-2 bg-roncedo-celeste hover:bg-roncedo-celesteDark text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <span>Ver Fotos en Galería</span>
            </button>
          ) : (
            <button
              onClick={handleStartImport}
              disabled={isImporting || isScanning || !scanData?.success}
              className="flex items-center gap-2 bg-gradient-to-r from-roncedo-celeste to-roncedo-celesteDark hover:from-roncedo-celesteDark hover:to-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importando a Supabase...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Iniciar Carga Automática</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
