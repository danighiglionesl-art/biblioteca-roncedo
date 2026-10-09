'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLibros } from '@/lib/context/LibrosContext';
import {
  Library,
  CreditCard,
  ChevronRight,
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BibliotecaFisicaView } from '@/components/libros/BibliotecaFisicaView';
import { forzarActualizacionCompleta } from '@/components/pwa/ServiceWorkerRegister';

export default function MiBibliotecaPage() {
  const { user, solicitudes } = useAuth();
  const {
    prestamos,
    reservas,
    renovarPrestamo,
    cancelarReserva,
    registrarDevolucion,
  } = useLibros();

  const [panelPrestamosAbierto, setPanelPrestamosAbierto] = useState(true);
  const [mensajeAccion, setMensajeAccion] = useState<string | null>(null);

  if (!user) return null;

  const isSocio = user.role === 'socio' || user.role === 'admin';
  const miSolicitud = solicitudes.find((s) => s.user_id === user.id);

  // Filtrar préstamos y reservas del usuario actual
  const misPrestamos = prestamos.filter((p) => p.user_id === user.id);
  const misReservas = reservas.filter((r) => r.user_id === user.id && r.estado !== 'cancelada');
  const tieneActividadPersonal = misPrestamos.length > 0 || misReservas.length > 0;

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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navegación Superior: Volver al Inicio */}
        <div className="flex items-center justify-between">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-xs font-bold text-roncedo-navy hover:text-roncedo-celesteDark transition-colors bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-blue-200/80 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-roncedo-celeste" />
            <span>Volver al Inicio</span>
          </Link>

          <span className="text-[11px] font-semibold text-slate-500">
            Biblioteca Roncedo • Catálogo de Libros Físicos
          </span>
        </div>

        {/* Cabecera Institucional */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-blue-200/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#102A4E] text-white flex items-center justify-center flex-shrink-0 shadow-md border border-white/20">
                <Library className="w-7 h-7 text-roncedo-gold" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-roncedo-celesteDark">
                    Inventario de Sala y Gestión de Préstamos
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    1.283 Ejemplares en Sala
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">
                  Mi Biblioteca
                </h1>
                <p className="text-xs text-slate-500">
                  Catálogo institucional de libros en sala, estanterías, fichas bibliográficas y estado de préstamos
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => forzarActualizacionCompleta()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200 shadow-sm"
                title="Limpiar caché y recargar la versión más reciente"
              >
                <RefreshCw className="w-3.5 h-3.5 text-roncedo-blue" />
                <span>Actualizar Vista</span>
              </button>

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

        {/* Módulo de Préstamos y Reservas del Lector */}
        {tieneActividadPersonal && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-blue-200/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-roncedo-blue" />
                <h2 className="text-base font-bold text-slate-900">
                  Mis Préstamos y Reservas Activas
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-roncedo-navy">
                  {misPrestamos.length} en préstamo • {misReservas.length} en espera
                </span>
              </div>
              <button
                onClick={() => setPanelPrestamosAbierto(!panelPrestamosAbierto)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <span>{panelPrestamosAbierto ? 'Ocultar' : 'Ver detalle'}</span>
                {panelPrestamosAbierto ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {panelPrestamosAbierto && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                {/* Mis Préstamos */}
                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-500 mb-3 flex items-center justify-between">
                    <span>Libros que tenés retirados</span>
                    <span className="font-normal text-[11px] text-slate-400">
                      {misPrestamos.length} ejemplar(es)
                    </span>
                  </h3>
                  {misPrestamos.length > 0 ? (
                    <div className="space-y-3">
                      {misPrestamos.map((p) => (
                        <div
                          key={p.id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="font-bold text-slate-900 leading-snug">
                                {p.titulo}
                              </h4>
                              <p className="text-slate-500 text-[11px]">
                                {p.autor} • Inv. #{p.numero_inventario}
                              </p>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                              En término
                            </span>
                          </div>

                          <div className="p-2.5 bg-white rounded-xl text-[11px] space-y-1 text-slate-600 border border-slate-100">
                            <div className="flex justify-between">
                              <span>Retirado:</span>
                              <span className="font-semibold text-slate-800">{p.fecha_prestamo}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Devolución prevista:</span>
                              <span className="font-bold text-roncedo-navy">
                                {p.fecha_devolucion_prevista}
                              </span>
                            </div>
                            {p.topografia_ubicacion && (
                              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                                <span>Ubicación:</span>
                                <span>{p.topografia_ubicacion}</span>
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
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Renovar (+7 días)</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-4">
                      No tenés libros retirados en este momento.
                    </p>
                  )}
                </div>

                {/* Mis Reservas */}
                <div>
                  <h3 className="text-xs uppercase font-bold text-amber-700 mb-3 flex items-center justify-between">
                    <span>Libros en lista de espera</span>
                    <span className="font-normal text-[11px] text-amber-600">
                      {misReservas.length} reserva(s)
                    </span>
                  </h3>
                  {misReservas.length > 0 ? (
                    <div className="space-y-3">
                      {misReservas.map((r) => (
                        <div
                          key={r.id}
                          className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2 text-xs"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="font-bold text-slate-900 leading-snug">
                                {r.titulo}
                              </h4>
                              <p className="text-slate-600 text-[11px]">
                                {r.autor} • Inv. #{r.numero_inventario}
                              </p>
                            </div>
                            <span className="bg-amber-200 text-amber-900 font-black text-[10px] px-2 py-0.5 rounded-full shrink-0">
                              Lugar #{r.posicion_espera}
                            </span>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-amber-100 text-[11px]">
                            <span className="text-amber-800 font-semibold">
                              {r.estado === 'disponible_para_retirar'
                                ? '¡Listo para retirar en mostrador!'
                                : 'Anotado en lista de espera'}
                            </span>
                            <button
                              onClick={() => cancelarReserva(r.id)}
                              className="text-red-600 hover:underline font-bold"
                            >
                              Cancelar reserva
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-4">
                      No tenés reservas en lista de espera.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Catálogo Oficial de Libros Físicos (1.283 ejemplares en sala) */}
        <BibliotecaFisicaView />
      </div>
    </div>
  );
}
