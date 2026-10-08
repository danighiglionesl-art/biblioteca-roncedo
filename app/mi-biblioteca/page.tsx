'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Library,
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
} from 'lucide-react';

export default function MiBibliotecaPage() {
  const { user, solicitudes } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'prestamos' | 'reservas' | 'actividades' | 'aportes'>('general');

  if (!user) return null;

  const isSocio = user.role === 'socio' || user.role === 'admin';
  const miSolicitud = solicitudes.find((s) => s.user_id === user.id);

  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-24 pt-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cabecera */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-blue-200/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#5B9BE5] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <Library className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-roncedo-celesteDark">
                  Espacio Personal del Lector
                </span>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">
                  Mi Biblioteca
                </h1>
                <p className="text-xs text-slate-500">
                  Historial personal, préstamos, credencial y actividades en el club
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

        {/* Pestañas de Navegación del Panel Personal */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'general'
                ? 'bg-roncedo-navy text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Resumen General
          </button>
          <button
            onClick={() => setActiveTab('prestamos')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'prestamos'
                ? 'bg-roncedo-navy text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Mis Préstamos (1)
          </button>
          <button
            onClick={() => setActiveTab('reservas')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'reservas'
                ? 'bg-roncedo-navy text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Mis Reservas (0)
          </button>
          <button
            onClick={() => setActiveTab('actividades')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'actividades'
                ? 'bg-roncedo-navy text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Mis Talleres (1)
          </button>
          <button
            onClick={() => setActiveTab('aportes')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              activeTab === 'aportes'
                ? 'bg-roncedo-navy text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Fotos Aportadas
          </button>
        </div>

        {/* Contenido según pestaña */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tarjeta Préstamo Actual */}
            <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold text-roncedo-blue tracking-wider">
                  Préstamo Activo
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  En término
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Historia de Alcira Gigena y la Región
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Autor: Autores Varios de la Comunidad
              </p>
              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600 border border-slate-100">
                <div className="flex justify-between">
                  <span>Fecha de retiro:</span>
                  <span className="font-semibold text-slate-800">28/03/2026</span>
                </div>
                <div className="flex justify-between">
                  <span>Devolución prevista:</span>
                  <span className="font-semibold text-roncedo-navy">12/04/2026</span>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button className="text-xs font-bold text-roncedo-blue hover:underline">
                  Solicitar renovación de préstamo →
                </button>
              </div>
            </div>

            {/* Tarjeta Actividad Inscripta */}
            <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">
                  Taller Cultural Inscripto
                </span>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Confirmado
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Taller de Narración e Historia Oral
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lugar: Salón de Lectura Biblioteca Roncedo
              </p>
              <div className="mt-3 p-3 bg-purple-50/50 rounded-xl text-xs space-y-1 text-slate-600 border border-purple-100">
                <div className="flex justify-between">
                  <span>Próximo encuentro:</span>
                  <span className="font-semibold text-purple-950">Sábado 18 de Abril • 16:30 hs</span>
                </div>
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <span className="font-semibold text-emerald-700">Cupo reservado</span>
                </div>
              </div>
            </div>

            {/* Accesos rápidos personales */}
            <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200 md:col-span-2">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Accesos de Mi Perfil
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <Link
                  href="/perfil"
                  className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors flex flex-col items-center text-center border border-slate-200"
                >
                  <User className="w-5 h-5 text-roncedo-blue mb-1" />
                  <span className="font-bold text-slate-800">Mis Datos</span>
                  <span className="text-[10px] text-slate-400">Actualizar</span>
                </Link>

                <Link
                  href="/carnet"
                  className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors flex flex-col items-center text-center border border-slate-200"
                >
                  <CreditCard className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="font-bold text-slate-800">Mi Carnet QR</span>
                  <span className="text-[10px] text-slate-400">Credencial</span>
                </Link>

                <Link
                  href="/libros"
                  className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors flex flex-col items-center text-center border border-slate-200"
                >
                  <BookOpen className="w-5 h-5 text-amber-600 mb-1" />
                  <span className="font-bold text-slate-800">Catálogo</span>
                  <span className="text-[10px] text-slate-400">Buscar libro</span>
                </Link>

                <Link
                  href="/fotos"
                  className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors flex flex-col items-center text-center border border-slate-200"
                >
                  <Camera className="w-5 h-5 text-teal-600 mb-1" />
                  <span className="font-bold text-slate-800">Aportar Foto</span>
                  <span className="text-[10px] text-slate-400">Archivo</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prestamos' && (
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Historial de Préstamos
            </h3>
            <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Actualmente prestado
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  Historia de Alcira Gigena y la Región
                </h4>
                <p className="text-xs text-slate-500">
                  Retirado el 28/03/2026 • Vence el 12/04/2026
                </p>
              </div>
              <button className="text-xs font-bold bg-roncedo-navy text-white px-3 py-1.5 rounded-xl">
                Renovar
              </button>
            </div>
          </div>
        )}

        {activeTab === 'reservas' && (
          <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-200 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">
              No tienes libros reservados actualmente
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Cuando un ejemplar esté prestado podrás reservarlo para ser el primero en retirarlo cuando sea devuelto.
            </p>
          </div>
        )}

        {activeTab === 'actividades' && (
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Mis Inscripciones a Eventos y Talleres
            </h3>
            <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  Confirmado
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  Taller de Narración e Historia Oral
                </h4>
                <p className="text-xs text-slate-500">
                  Sábado 18 de Abril • 16:30 hs • Sala Biblioteca
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'aportes' && (
          <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-200 text-center">
            <Camera className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">
              Aún no has aportado fotografías históricas
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              ¿Tienes fotografías antiguas de tu familia, del club o de Alcira Gigena? En la Etapa 3 podrás subirlas desde tu celular para enriquecer el archivo digital.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
