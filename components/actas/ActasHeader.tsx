'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Heart,
  RefreshCw,
} from 'lucide-react';
import { UserRole } from '@/types';

interface ActasHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedAnio: string;
  onAnioChange: (value: string) => void;
  selectedTipo: string;
  onTipoChange: (value: string) => void;
  isAdmin: boolean;
  isSocioProtector: boolean;
  currentUserRole?: UserRole;
  onNuevaActa: () => void;
  totalFolios: number;
  totalActas: number;
}

const ANIOS_DISPONIBLES = ['Todos', '1926', '1927', '1928', '1929', '1930', '1931', '1932'];

const TIPOS_DISPONIBLES = [
  'Todos',
  'Asamblea General Constitutiva',
  'Asamblea General Ordinaria',
  'Asamblea General Extraordinaria',
  'Reunión de Comisión Directiva',
];

export function ActasHeader({
  searchTerm,
  onSearchChange,
  selectedAnio,
  onAnioChange,
  selectedTipo,
  onTipoChange,
  isAdmin,
  isSocioProtector,
  currentUserRole,
  onNuevaActa,
  totalFolios,
  totalActas,
}: ActasHeaderProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Navegación superior */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-roncedo-navy hover:text-roncedo-celesteDark transition-colors bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-blue-200/60 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-roncedo-celeste" />
          <span>Volver al Inicio</span>
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold bg-amber-500/20 text-amber-900 border border-amber-300 px-3 py-1 rounded-xl">
              Modo Administrador Activo
            </span>
          </div>
        )}
      </div>

      {/* Banner de Presentación y Estadísticas */}
      <div className="bg-gradient-to-br from-[#0F284B] via-[#163866] to-[#1E4D8C] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-400/20 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-roncedo-celeste/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-roncedo-celeste to-blue-400 text-white flex items-center justify-center shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-roncedo-celesteLight bg-blue-900/60 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                  Patrimonio Histórico Oficial • Digitalizado
                </span>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white mt-1">
                  Archivo Digital de Actas Históricas
                </h1>
              </div>
            </div>

            {/* Botón de Gestión: Solo Administrador */}
            {isAdmin ? (
              <button
                onClick={onNuevaActa}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Nueva Acta</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/20 text-slate-200">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-300" />
                <span>Solo Lectura y Consulta</span>
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-blue-100 max-w-3xl leading-relaxed">
            Preservación, rescate y digitalización en alta resolución de los libros de actas de asambleas y reuniones de comisión directiva desde la fundación institucional el <strong>15 de marzo de 1926</strong>. Explora los <strong>102 folios originales manuscritos</strong> con transcripciones paleográficas fidedignas y visor con zoom.
          </p>

          {/* Estado de Permisos y Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            {isAdmin ? (
              <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-200 px-3 py-1 rounded-full border border-amber-300/30 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Permisos de Administrador: Gestión total (Crear, Editar, Eliminar)</span>
              </div>
            ) : isSocioProtector ? (
              <div className="inline-flex items-center gap-1.5 bg-rose-400/20 text-rose-200 px-3 py-1 rounded-full border border-rose-300/30 font-bold">
                <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
                <span>Socio Protector: Consulta y Visualización de Actas en Alta Definición</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 bg-blue-400/20 text-blue-200 px-3 py-1 rounded-full border border-blue-300/30 font-bold">
                <BookOpen className="w-3.5 h-3.5 text-blue-300" />
                <span>Modo Usuario / Consulta: Solo lectura de documentos históricos</span>
              </div>
            )}
          </div>

          {/* Tarjetas de Métricas Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/15">
              <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">
                Folios Escaneados
              </span>
              <span className="text-xl font-black text-white">{totalFolios} Páginas</span>
              <span className="text-[10px] text-emerald-300 block">100% Digitalizadas</span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/15">
              <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">
                Libro Principal
              </span>
              <span className="text-xl font-black text-white">Libro N° 1</span>
              <span className="text-[10px] text-blue-200 block">Folios 1 al 51</span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/15">
              <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">
                Período Histórico
              </span>
              <span className="text-xl font-black text-white">1926 – 1932</span>
              <span className="text-[10px] text-roncedo-goldLight block">Época Fundacional</span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/15">
              <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">
                Actas Indexadas
              </span>
              <span className="text-xl font-black text-white">{totalActas} Documentos</span>
              <span className="text-[10px] text-blue-200 block">Con Transcripción</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Campo de búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por acta, título, año, firmantes (ej. Fagiano, Baggini) o palabra clave..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-roncedo-celeste focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Filtro por Año */}
          <div className="flex items-center gap-2 sm:w-48">
            <Calendar className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <select
              value={selectedAnio}
              onChange={(e) => onAnioChange(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-roncedo-celeste"
            >
              <option value="Todos">Todos los años</option>
              {ANIOS_DISPONIBLES.filter((a) => a !== 'Todos').map((a) => (
                <option key={a} value={a}>
                  Año {a}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Tipo */}
          <div className="flex items-center gap-2 sm:w-60">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <select
              value={selectedTipo}
              onChange={(e) => onTipoChange(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-roncedo-celeste"
            >
              {TIPOS_DISPONIBLES.map((t) => (
                <option key={t} value={t}>
                  {t === 'Todos' ? 'Todos los tipos de reunión' : t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
