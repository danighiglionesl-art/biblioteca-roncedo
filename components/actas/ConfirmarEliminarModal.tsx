'use client';

import React from 'react';
import { ActaHistorica } from '@/types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmarEliminarModalProps {
  isOpen: boolean;
  onClose: () => void;
  acta: ActaHistorica | null;
  onConfirmar: () => Promise<void>;
  isDeleting: boolean;
}

export function ConfirmarEliminarModal({
  isOpen,
  onClose,
  acta,
  onConfirmar,
  isDeleting,
}: ConfirmarEliminarModalProps) {
  if (!isOpen || !acta) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl border border-red-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900">¿Eliminar Acta Histórica?</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Estás a punto de desvincular el registro de <strong>Acta N° {acta.numero_acta}: &quot;{acta.titulo}&quot;</strong>. Los archivos escaneados originales en el disco se mantendrán intactos.
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
          <div><strong>Fecha:</strong> {acta.fecha}</div>
          <div><strong>Libro:</strong> {acta.libro}</div>
          <div><strong>Folio:</strong> Folio {acta.folio_inicio} (Págs {acta.pagina_archivo_inicio}-{acta.pagina_archivo_fin})</div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-xs text-white shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
