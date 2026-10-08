'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLibros } from '@/lib/context/LibrosContext';
import {
  Library,
  Globe2,
  CreditCard,
  User,
  BookOpen,
  Calendar,
  Camera,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Layers,
  MapPin,
  Building,
  RotateCcw,
  PlusCircle,
  Download,
} from 'lucide-react';
import { BibliotecaFisicaView } from '@/components/libros/BibliotecaFisicaView';
import { BibliotecaDigitalView } from '@/components/digital/BibliotecaDigitalView';
import { ModalAportarFoto } from '@/components/mi-biblioteca/ModalAportarFoto';

export default function MiBibliotecaPage() {
  const { user, solicitudes } = useAuth();
  const {
    librosFisicos,
    prestamos,
    reservas,
    talleres,
    fotosAportadas,
    renovarPrestamo,
    cancelarReserva,
    registrarDevolucion,
  } = useLibros();

  const [activeTab, setActiveTab] = useState<
    'general' | 'fisica' | 'digital' | 'prestamos' | 'reservas' | 'actividades' | 'aportes'
  >('general');
  const [modalFotoAbierto, setModalFotoAbierto] = useState(false);
  const [mensajeAccion, setMensajeAccion] = useState<string | null>(null);

  if (!user) return null;

  const isSocio = user.role === 'socio' || user.role === 'admin';
  const miSolicitud = solicitudes.find((s) => s.user_id === user.id);

  // Filtrar préstamos y reservas del usuario actual
  const misPrestamos = prestamos.filter((p) => p.user_id === user.id);
  const misReservas = reservas.filter((r) => r.user_id === user.id && r.estado !== 'cancelada');
  const misFotos = fotosAportadas.filter((f) => f.user_id === user.id);

  const handleRenovacion = async (prestamoId: string) => {
    const res = await renovarPrestamo(prestamoId);
    if (res.success) {
      setMensajeAccion('¡Plazo extendido exitosamente por 7 días más!');
      setTimeout(() => setMensajeAccion(null), 4000);
    }
  };

  const handleDevolucion = async (libroId: string) => {
    await registrarDevolucion(libroId);
    setMensajeAccion('Devolución registrada. El ejemplar vuelve a estar disponible.');
    setTimeout(() => setMensajeAccion(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-24 pt-6 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Cabecera Institucional */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-blue-200/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#102A4E] text-white flex items-center justify-center flex-shrink-0 shadow-md border border-white/20">
                <Library className="w-7 h-7 text-roncedo-gold" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-roncedo-celesteDark">
                  Espacio Institucional y Personal del Lector
                </span>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">
                  Mi Biblioteca
                </h1>
                <p className="text-xs text-slate-500">
                  Acceso directo a la Biblioteca Física y Digital, préstamos, reservas y actividades
                </p>
              </div>
            </div>

            {isSocio ? (
              <Link
                href="/carnet"
                className="bg-roncedo-navy hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-roncedo-gold" />
                <span>Ver Mi Carnet</span>
              </Link>
            ) : (
              <Link
                href="/perfil"
                className="bg-roncedo-blue hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>Hacerme Socio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Estado de Socio Banner */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Estado Social:</span>
              {isSocio ? (
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Socio #{user.numero_socio || '1042'} ({user.categoria_socio || 'Activo'})
                </span>
              ) : miSolicitud ? (
                <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Solicitud en Revisión ({miSolicitud.categoria_solicitada})
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full border border-slate-300">
                  Usuario Registrado (No socio)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <span>Cuota Social:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-md ${
                  user.estado_cuota === 'al_dia'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-amber-700 bg-amber-50'
                }`}
              >
                {user.estado_cuota === 'al_dia' ? 'Al Día' : 'Pendiente'}
              </span>
            </div>
          </div>
        </div>

        {/* Notificación de acción rápida */}
        {mensajeAccion && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{mensajeAccion}</span>
          </div>
        )}

        {/* =========================================================================
            LOS DOS GRANDES ACCESOS PRINCIPALES REQUERIDOS
            1. LA BIBLIOTECA FÍSICA
            2. LA BIBLIOTECA DIGITAL
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ACCESO 1: LA BIBLIOTECA FÍSICA */}
          <div className="bg-gradient-to-br from-white to-blue-50/70 rounded-3xl p-6 shadow-card border-2 border-roncedo-navy/20 hover:border-roncedo-navy transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-roncedo-navy/5 rounded-bl-full pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-roncedo-navy text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-sm">
                  Acceso 1
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  1.283 Ejemplares en Sala
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-roncedo-navy text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <Library className="w-6 h-6 text-roncedo-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    La Biblioteca Física
                  </h2>
                  <p className="text-xs text-roncedo-celesteDark font-bold">
                    Inventario Oficial de Sala de Lectura
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Consultá los libros existentes en la institución con su ficha técnica completa:
              </p>

              {/* Lista de campos obligatorios visibles */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/80 p-3.5 rounded-2xl border border-blue-100 mb-5">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-roncedo-navy"></span>
                  <span><strong>N° Inventario</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-roncedo-navy"></span>
                  <span><strong>Año Incorporación</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-roncedo-navy"></span>
                  <span><strong>Autor/es y Título</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-roncedo-navy"></span>
                  <span><strong>Edición y Lugar</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-roncedo-navy"></span>
                  <span><strong>Editorial y Procedencia</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-roncedo-navy"></span>
                  <span><strong>Topografía / Ubicación</strong></span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-500 mb-4">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span><strong>Socios:</strong> Gestión de préstamo o ingreso a lista de espera.</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span><strong>Administrador:</strong> ABM de libros y agregado de foto de portada.</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-blue-100 flex items-center gap-2">
              <button
                onClick={() => setActiveTab('fisica')}
                className="flex-1 bg-roncedo-navy hover:bg-blue-900 text-white font-black text-xs py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-roncedo-gold" />
                <span>Ver Catálogo Físico Completo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ACCESO 2: LA BIBLIOTECA DIGITAL */}
          <div className="bg-gradient-to-br from-[#102A4E] via-[#1A457D] to-[#2B6CB5] rounded-3xl p-6 shadow-card border-2 border-roncedo-celeste/40 text-white flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-roncedo-celeste/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-roncedo-gold text-roncedo-navyDark text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-sm">
                  Acceso 2
                </span>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                  4 Plataformas Conectadas
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center flex-shrink-0 shadow-md border border-white/20">
                  <Globe2 className="w-6 h-6 text-roncedo-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white leading-tight">
                    Biblioteca Digital
                  </h2>
                  <p className="text-xs text-roncedo-celesteLight font-bold">
                    Red Gratuita de Obras en Español
                  </p>
                </div>
              </div>

              <p className="text-xs text-blue-100/90 leading-relaxed mb-4">
                Buscador unificado con acceso legal y libre conectado a las 4 plataformas de dominio público y patrimonio cultural:
              </p>

              {/* Las 4 plataformas conectadas */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 mb-5">
                <div className="flex items-center gap-1.5 text-blue-100 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>1. Wikisource</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-100 font-bold">
                  <span className="w-2 h-2 rounded-full bg-blue-300"></span>
                  <span>2. Cervantes Virtual</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-100 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>3. Project Gutenberg</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-100 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <span>4. Open Library</span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-blue-100/80 mb-4">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-roncedo-gold flex-shrink-0" />
                  <span>Exclusivamente en español • Prioridad argentina y latinoamericana.</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-roncedo-gold flex-shrink-0" />
                  <span>Lectura directa en PWA y descargas en EPUB / PDF libres.</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/15 flex items-center gap-2">
              <button
                onClick={() => setActiveTab('digital')}
                className="flex-1 bg-white hover:bg-slate-100 text-roncedo-navy font-black text-xs py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Globe2 className="w-4 h-4 text-roncedo-blue" />
                <span>Abrir Buscador Digital Unificado</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación del Panel del Socio */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'general'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Resumen General
          </button>
          <button
            onClick={() => setActiveTab('fisica')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'fisica'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Library className="w-3.5 h-3.5 text-roncedo-gold" />
            <span>1. Biblioteca Física (1.283)</span>
          </button>
          <button
            onClick={() => setActiveTab('digital')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'digital'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-roncedo-blue" />
            <span>2. Biblioteca Digital</span>
          </button>
          <button
            onClick={() => setActiveTab('prestamos')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'prestamos'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Mis Préstamos ({misPrestamos.length})
          </button>
          <button
            onClick={() => setActiveTab('reservas')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'reservas'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Mis Reservas ({misReservas.length})
          </button>
          <button
            onClick={() => setActiveTab('actividades')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'actividades'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Mis Talleres ({talleres.length})
          </button>
          <button
            onClick={() => setActiveTab('aportes')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'aportes'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Fotos Aportadas ({fotosAportadas.length})
          </button>
        </div>

        {/* =========================================================================
            CONTENIDO SEGÚN LA PESTAÑA ACTIVA
            ========================================================================= */}

        {/* 1. Vista Embebida de Biblioteca Física */}
        {activeTab === 'fisica' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">
                Estás visualizando el Catálogo Físico dentro de Mi Biblioteca
              </span>
              <Link
                href="/libros"
                className="text-xs font-bold text-roncedo-navy hover:underline flex items-center gap-1"
              >
                <span>Abrir en pantalla completa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <BibliotecaFisicaView />
          </div>
        )}

        {/* 2. Vista Embebida de Biblioteca Digital */}
        {activeTab === 'digital' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">
                Estás visualizando la Biblioteca Digital dentro de Mi Biblioteca
              </span>
              <Link
                href="/biblioteca-digital"
                className="text-xs font-bold text-roncedo-navy hover:underline flex items-center gap-1"
              >
                <span>Abrir en pantalla completa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <BibliotecaDigitalView />
          </div>
        )}

        {/* 3. Resumen General */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tarjeta Préstamo Activo */}
            <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold text-roncedo-blue tracking-wider">
                    Mis Préstamos Activos
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {misPrestamos.length > 0 ? `${misPrestamos.length} activo` : 'Sin préstamos'}
                  </span>
                </div>

                {misPrestamos.length > 0 ? (
                  misPrestamos.map((p) => (
                    <div key={p.id} className="space-y-2">
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {p.titulo}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Autor: {p.autor} • Inv. #{p.numero_inventario}
                      </p>
                      <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-100">
                        <div className="flex justify-between">
                          <span>Fecha de retiro:</span>
                          <span className="font-semibold text-slate-800">{p.fecha_prestamo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Devolución prevista:</span>
                          <span className="font-bold text-roncedo-navy">{p.fecha_devolucion_prevista}</span>
                        </div>
                        {p.topografia_ubicacion && (
                          <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                            <span>Ubicación:</span>
                            <span className="font-medium">{p.topografia_ubicacion}</span>
                          </div>
                        )}
                      </div>
                      <div className="pt-2 flex justify-between items-center text-xs">
                        <button
                          onClick={() => handleDevolucion(p.libro_id)}
                          className="text-slate-500 hover:text-slate-800 font-bold"
                        >
                          Devolver libro
                        </button>
                        <button
                          onClick={() => handleRenovacion(p.id)}
                          className="font-bold text-roncedo-blue hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Solicitar renovación (+7 días)</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No tienes préstamos activos en este momento.</p>
                    <button
                      onClick={() => setActiveTab('fisica')}
                      className="mt-2 text-xs font-bold text-roncedo-navy hover:underline"
                    >
                      Explorar catálogo físico para pedir un libro →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tarjeta Mis Reservas / Lista de Espera */}
            <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                    Mis Reservas en Lista de Espera
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {misReservas.length} en espera
                  </span>
                </div>

                {misReservas.length > 0 ? (
                  misReservas.map((r) => (
                    <div key={r.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 space-y-1.5 mb-2 text-xs">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-900">{r.titulo}</h4>
                        <span className="bg-amber-200 text-amber-900 font-black text-[10px] px-2 py-0.5 rounded-full">
                          Lugar #{r.posicion_espera}
                        </span>
                      </div>
                      <p className="text-slate-600">{r.autor} • Inv. #{r.numero_inventario}</p>
                      <div className="flex justify-between items-center pt-1 border-t border-amber-100 text-[11px]">
                        <span className="text-amber-800 font-semibold">
                          {r.estado === 'disponible_para_retirar' ? '¡Listo para retirar en mostrador!' : 'En lista de espera'}
                        </span>
                        <button
                          onClick={() => cancelarReserva(r.id)}
                          className="text-red-600 hover:underline font-bold"
                        >
                          Cancelar reserva
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No tienes reservas activas.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Cuando un libro figure prestado podrás ingresar en la lista de espera con un clic.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tarjeta Actividad / Talleres Inscriptos */}
            <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">
                  Mis Talleres Culturales
                </span>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Confirmados
                </span>
              </div>
              <div className="space-y-3">
                {talleres.slice(0, 1).map((t) => (
                  <div key={t.id} className="space-y-1 text-xs">
                    <h3 className="text-base font-bold text-slate-900">{t.titulo}</h3>
                    <p className="text-slate-500">{t.profesor} • {t.lugar}</p>
                    <div className="mt-2 p-3 bg-purple-50/50 rounded-xl space-y-1 text-slate-600 border border-purple-100">
                      <div className="flex justify-between">
                        <span>Horario habitual:</span>
                        <span className="font-semibold text-purple-950">{t.dia_horario}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Próximo encuentro:</span>
                        <span className="font-semibold text-roncedo-navy">{t.fecha_proxima}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tarjeta Fotos Aportadas por la Comunidad */}
            <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">
                    Archivo Histórico Comunitario
                  </span>
                  <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {fotosAportadas.length} fotos
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Fotografías Aportadas
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Sumate a la preservación del patrimonio fotográfico de Alcira Gigena y la Biblioteca Roncedo.
                </p>
                <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {fotosAportadas.slice(0, 3).map((f) => (
                    <div key={f.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                      <Image src={f.imagen_url} alt={f.titulo} fill className="object-cover" unoptimized />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setModalFotoAbierto(true)}
                  className="bg-roncedo-navy hover:bg-blue-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-roncedo-gold" />
                  <span>Aportar Foto Histórica</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Pestaña Mis Préstamos */}
        {activeTab === 'prestamos' && (
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Historial de Préstamos Activos
              </h3>
              <button
                onClick={() => setActiveTab('fisica')}
                className="text-xs font-bold text-roncedo-navy hover:underline"
              >
                + Solicitar nuevo préstamo en catálogo físico
              </button>
            </div>

            {misPrestamos.length > 0 ? (
              <div className="space-y-3">
                {misPrestamos.map((p) => (
                  <div key={p.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          En término
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          Inv. #{p.numero_inventario}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {p.titulo}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Autor: {p.autor} • Editorial: {p.editorial || 'No informada'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Retirado: {p.fecha_prestamo} • Vence: <strong className="text-roncedo-navy">{p.fecha_devolucion_prevista}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDevolucion(p.libro_id)}
                        className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl transition-colors"
                      >
                        Registrar Devolución
                      </button>
                      <button
                        onClick={() => handleRenovacion(p.id)}
                        className="text-xs font-bold bg-roncedo-navy hover:bg-blue-900 text-white px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-roncedo-gold" />
                        <span>Renovar (+7 días)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-slate-700">No tienes préstamos registrados actualmente</p>
                <p className="text-xs text-slate-400 mt-1">
                  Explorá el catálogo de libros físicos para solicitar un ejemplar.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 5. Pestaña Mis Reservas */}
        {activeTab === 'reservas' && (
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Mis Reservas y Lista de Espera de Ejemplares
            </h3>

            {misReservas.length > 0 ? (
              <div className="space-y-3">
                {misReservas.map((r) => (
                  <div key={r.id} className="border border-amber-200 bg-amber-50/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-200 px-2.5 py-0.5 rounded-full">
                          Lugar en fila: #{r.posicion_espera}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          Inv. #{r.numero_inventario}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        {r.titulo}
                      </h4>
                      <p className="text-xs text-slate-500">Autor: {r.autor}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Anotado el {new Date(r.fecha_reserva).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => cancelarReserva(r.id)}
                      className="text-xs font-bold bg-white hover:bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-xl transition-colors"
                    >
                      Cancelar Reserva
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">
                  No tienes libros en lista de espera actualmente
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Cuando un ejemplar físico esté prestado a otro lector podrás ingresar en la lista de espera para ser el primero en retirarlo al ser devuelto.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 6. Pestaña Mis Talleres */}
        {activeTab === 'actividades' && (
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Mis Inscripciones a Eventos y Talleres Culturales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {talleres.map((t) => (
                <div key={t.id} className="border border-purple-200 bg-purple-50/30 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                    {t.estado === 'confirmado' ? 'Cupo Confirmado' : 'En lista'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{t.titulo}</h4>
                  <p className="text-xs text-slate-500">{t.profesor} • {t.disciplina}</p>
                  <div className="pt-2 border-t border-purple-100 text-xs space-y-1 text-slate-600">
                    <p><strong>Encuentros:</strong> {t.dia_horario}</p>
                    <p><strong>Lugar:</strong> {t.lugar}</p>
                    <p><strong>Próxima fecha:</strong> {t.fecha_proxima}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Pestaña Fotos Aportadas */}
        {activeTab === 'aportes' && (
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Archivo Fotográfico Comunitario
                </h3>
                <p className="text-xs text-slate-500">
                  Fotografías históricas de familias, del club y de la comunidad de Alcira Gigena
                </p>
              </div>
              <button
                onClick={() => setModalFotoAbierto(true)}
                className="bg-roncedo-navy hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                <Camera className="w-4 h-4 text-roncedo-gold" />
                <span>+ Aportar Fotografía Histórica</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fotosAportadas.map((f) => (
                <div key={f.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                  <div className="relative w-full h-44 bg-slate-200">
                    <Image src={f.imagen_url} alt={f.titulo} fill className="object-cover" unoptimized />
                    {f.anio_aproximado && (
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white font-bold text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                        Año aprox. {f.anio_aproximado}
                      </span>
                    )}
                  </div>
                  <div className="p-3.5 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{f.titulo}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{f.descripcion}</p>
                    <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-200">
                      <span>Aportada el {f.fecha_aporte}</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded">
                        Archivo institucional
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal para Aportar Foto */}
      {modalFotoAbierto && (
        <ModalAportarFoto onClose={() => setModalFotoAbierto(false)} />
      )}
    </div>
  );
}
