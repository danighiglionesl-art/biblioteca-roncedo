'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LibroFisico, UserProfile } from '@/types';
import { useLibros } from '@/lib/context/LibrosContext';
import {
  X,
  BookOpen,
  MapPin,
  Calendar,
  Building,
  User,
  Heart,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit,
  Camera,
  Layers,
  Sparkles,
  Users,
} from 'lucide-react';

interface ModalDetalleLibroFisicoProps {
  libro: LibroFisico;
  user: UserProfile | null;
  onClose: () => void;
  onSolicitarPrestamo: (libroId: string) => Promise<void>;
  onSolicitarReserva: (libroId: string) => Promise<void>;
  onCancelarReserva: (reservaId: string) => Promise<void>;
  onRegistrarDevolucion: (libroId: string) => Promise<void>;
  onAbrirEdicion: (libro: LibroFisico) => void;
  reservaUsuario?: { id: string; posicion: number } | null;
}

export function ModalDetalleLibroFisico({
  libro,
  user,
  onClose,
  onSolicitarPrestamo,
  onSolicitarReserva,
  onCancelarReserva,
  onRegistrarDevolucion,
  onAbrirEdicion,
  reservaUsuario,
}: ModalDetalleLibroFisicoProps) {
  const { confirmarEntregaPrestamo, cancelarGestionPrestamo } = useLibros();
  const [modalConfirmacionPrestamo, setModalConfirmacionPrestamo] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const isSocio = user && (user.role === 'socio' || user.role === 'admin');
  const isAdmin = user && user.role === 'admin';
  const estaPrestado = libro.estado === 'prestado';
  const estaEnGestion = libro.estado === 'en_gestion';
  const esMiSolicitudGestion = estaEnGestion && libro.prestado_a?.user_id === user?.id;

  const handlePrestamo = async () => {
    try {
      setProcesando(true);
      await onSolicitarPrestamo(libro.id);
      setModalConfirmacionPrestamo(true);
    } finally {
      setProcesando(false);
    }
  };

  const handleConfirmarEntrega = async () => {
    try {
      setProcesando(true);
      await confirmarEntregaPrestamo(libro.id);
      setMensajeExito('¡Entrega confirmada! El ejemplar ahora figura como prestado al socio.');
    } finally {
      setProcesando(false);
    }
  };

  const handleCancelarGestion = async () => {
    if (!confirm('¿Deseas cancelar la solicitud en gestión y liberar el ejemplar a disponible?')) return;
    try {
      setProcesando(true);
      await cancelarGestionPrestamo(libro.id);
      setMensajeExito('Solicitud cancelada. El ejemplar ahora se encuentra disponible.');
    } finally {
      setProcesando(false);
    }
  };

  const handleReserva = async () => {
    try {
      setProcesando(true);
      await onSolicitarReserva(libro.id);
      setMensajeExito('¡Te has anotado en la lista de espera con éxito!');
    } finally {
      setProcesando(false);
    }
  };

  const handleDevolucion = async () => {
    try {
      setProcesando(true);
      await onRegistrarDevolucion(libro.id);
      setMensajeExito('Devolución registrada. El ejemplar ahora se encuentra disponible.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] shadow-2xl flex flex-col border border-slate-200 overflow-hidden my-auto">
        {/* Cabecera */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-roncedo-navy via-[#1A457D] to-[#2B6CB5] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-roncedo-gold/20 border border-roncedo-gold/40 flex items-center justify-center text-roncedo-gold flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-roncedo-celesteLight">
                Ficha Técnica del Ejemplar Físico
              </span>
              <h2 className="text-base sm:text-lg font-black leading-tight line-clamp-1">
                {libro.titulo}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {mensajeExito && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{mensajeExito}</span>
            </div>
          )}

          {/* Ficha Principal con Portada y Datos Clave */}
          <div className="flex flex-col sm:flex-row gap-5 items-start bg-slate-50 p-5 rounded-2xl border border-slate-200">
            {/* Foto de Portada con Proporción Original Preservada */}
            <div className="relative w-32 h-44 sm:w-40 sm:h-56 rounded-2xl border border-slate-300 bg-white shadow-md overflow-hidden flex flex-col items-center justify-center text-slate-400 flex-shrink-0 mx-auto sm:mx-0 p-1">
              {libro.portada_url ? (
                <Image
                  src={libro.portada_url}
                  alt={libro.titulo}
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="text-center p-3">
                  <BookOpen className="w-10 h-10 mx-auto text-roncedo-celeste mb-1.5" />
                  <span className="text-[11px] font-bold text-slate-700 block">Inv. #{libro.numero_inventario}</span>
                  <span className="text-[9px] text-slate-400">Sin foto de portada</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2.5 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="bg-roncedo-navy text-white text-[11px] font-black px-2.5 py-1 rounded-lg">
                  Nº Inventario: {libro.numero_inventario}
                </span>

                {estaPrestado ? (
                  <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Actualmente Prestado
                  </span>
                ) : estaEnGestion ? (
                  <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-600" />
                    En Gestión de Entrega
                  </span>
                ) : libro.estado === 'baja_transitoria' ? (
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    Baja Transitoria (Fuera de circulación)
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Disponible en Sala
                  </span>
                )}
              </div>

              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {libro.titulo}
              </h1>

              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <User className="w-4 h-4 text-roncedo-blue flex-shrink-0" />
                <span>Autor: {libro.autor}</span>
              </div>

              {/* Ubicación Física / Topografía Destacada */}
              <div className="p-3 bg-roncedo-celesteSoft rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 text-roncedo-navy font-bold text-xs">
                  <MapPin className="w-4 h-4 text-roncedo-blue flex-shrink-0" />
                  <span>Topografía / Ubicación en Biblioteca:</span>
                </div>
                <p className="text-xs font-black text-slate-900 mt-1 pl-6">
                  {libro.topografia_ubicacion || 'Ubicación General • Sala de Lectura'}
                </p>
              </div>
            </div>
          </div>

          {/* Grilla con los demás campos obligatorios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Año de Incorporación
              </span>
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {libro.anio_incorporacion || 'No especificado'}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Edición - Año
              </span>
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {libro.edicion_anio || 'No especificada'}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Lugar de Edición
              </span>
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {libro.lugar || 'No especificado'}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Editorial
              </span>
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                {libro.editorial || 'No especificada'}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Procedencia
              </span>
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                {libro.procedencia || 'Donación institucional'}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Donante / Por / En
              </span>
              <span className="font-bold text-slate-800">
                {libro.donante_o_detalle || 'Archivo patrimonial'}
              </span>
            </div>
          </div>

          {/* Información de Préstamo Actual y Lista de Espera si está prestado */}
          {estaPrestado && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Estado de Préstamo del Ejemplar:</span>
              </div>
              <p className="text-xs text-amber-800">
                {libro.prestado_a
                  ? `Prestado a ${libro.prestado_a.nombre_socio} (Socio #${libro.prestado_a.numero_socio}). Devolución prevista para el ${libro.prestado_a.fecha_devolucion_prevista}.`
                  : 'El libro se encuentra en préstamo activo.'}
              </p>

              {libro.lista_espera && libro.lista_espera.length > 0 && (
                <div className="pt-2 border-t border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    Socios en lista de espera: <strong>{libro.lista_espera.length}</strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Acciones del pie según rol y estado */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Si es Admin: Botón Editar libro */}
          {isAdmin ? (
            <button
              onClick={() => {
                onClose();
                onAbrirEdicion(libro);
              }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5 text-roncedo-navy" />
              <span>Editar Ejemplar (ABM)</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {/* Si está disponible y es socio: Solicitar préstamo */}
            {!estaPrestado && !estaEnGestion && libro.estado !== 'baja_transitoria' && isSocio && (
              <button
                disabled={procesando}
                onClick={handlePrestamo}
                className="bg-roncedo-navy hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-roncedo-gold" />
                <span>{procesando ? 'Procesando...' : 'Solicitar Préstamo'}</span>
              </button>
            )}

            {/* Si está en gestión de entrega */}
            {estaEnGestion && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-blue-50 text-blue-900 border border-blue-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    {esMiSolicitudGestion
                      ? 'Tenés este libro reservado en gestión para entrega'
                      : libro.prestado_a?.nombre_socio
                      ? `En gestión para ${libro.prestado_a.nombre_socio}`
                      : 'Ejemplar en gestión de entrega'}
                  </span>
                </span>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={procesando}
                      onClick={handleConfirmarEntrega}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                      title="Entregar ejemplar al socio y cambiar a Prestado"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar Entrega (Marcar Prestado)</span>
                    </button>
                    <button
                      disabled={procesando}
                      onClick={handleCancelarGestion}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs px-3 py-2 rounded-xl transition-colors"
                      title="Cancelar solicitud y liberar el ejemplar"
                    >
                      <span>Cancelar Solicitud</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Si está en baja transitoria */}
            {libro.estado === 'baja_transitoria' && (
              <span className="bg-amber-100 text-amber-900 font-bold text-xs px-3 py-2 rounded-xl border border-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>Ejemplar no disponible para retiro temporalmente</span>
              </span>
            )}

            {/* Si está prestado y es socio: Ingresar a lista de espera */}
            {estaPrestado && isSocio && !reservaUsuario && (
              <button
                disabled={procesando}
                onClick={handleReserva}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                <Clock className="w-4 h-4" />
                <span>{procesando ? 'Anotando...' : 'Ingresar a Lista de Espera'}</span>
              </button>
            )}

            {/* Si ya está en la lista de espera: Mostrar estado */}
            {estaPrestado && reservaUsuario && (
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-300">
                  En espera (Posición #{reservaUsuario.posicion})
                </span>
                <button
                  onClick={() => onCancelarReserva(reservaUsuario.id)}
                  className="text-xs text-red-600 hover:underline font-bold"
                >
                  Cancelar reserva
                </button>
              </div>
            )}

            {/* Si es Admin y está prestado: Registrar Devolución */}
            {estaPrestado && isAdmin && (
              <button
                disabled={procesando}
                onClick={handleDevolucion}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Registrar Devolución en Sala</span>
              </button>
            )}

            {/* Si es usuario registrado no socio */}
            {!isSocio && (
              <Link
                href="/perfil"
                className="bg-roncedo-blue hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-roncedo-gold" />
                <span>Hacerme Socio para Préstamo</span>
              </Link>
            )}

            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Ventana Emergente al Solicitar Préstamo */}
      {modalConfirmacionPrestamo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-blue-200 p-6 sm:p-7 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 text-roncedo-navy flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-roncedo-celesteDark">
                Club Sportivo y Biblioteca Dr. Lautaro Roncedo
              </span>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                ¡Solicitud Registrada con Éxito!
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-200/80 text-left space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed text-center">
                Tu libro se encuentra reservado, en los días y horarios de atención se contactará contigo un miembro de la Biblioteca para acordar la entrega. ¡Muchas gracias!
              </p>
              <div className="pt-2 border-t border-blue-200/60 flex items-center gap-3 text-xs">
                <div className="w-9 h-12 bg-white rounded border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400 font-bold text-[10px]">
                  #{libro.numero_inventario}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 truncate">{libro.titulo}</p>
                  <p className="text-[11px] text-slate-500 truncate">{libro.autor}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setModalConfirmacionPrestamo(false);
                onClose();
              }}
              className="w-full bg-roncedo-navy hover:bg-blue-900 text-white font-bold py-3 px-5 rounded-2xl text-xs sm:text-sm transition-all shadow-md active:scale-95"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
