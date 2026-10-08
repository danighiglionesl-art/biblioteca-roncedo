'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { CategoriaSocio, EstadoCuota } from '@/types';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  CreditCard,
  BookOpen,
  Filter,
  Check,
  AlertTriangle,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export default function AdminPage() {
  const {
    user,
    allUsers,
    solicitudes,
    aprobarSolicitud,
    rechazarSolicitud,
    actualizarEstadoCuota,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'solicitudes' | 'padron' | 'usuarios'>('solicitudes');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal de aprobación de solicitud
  const [modalSolId, setModalSolId] = useState<string | null>(null);
  const [numeroSocioAsignar, setNumeroSocioAsignar] = useState('');
  const [categoriaAsignar, setCategoriaAsignar] = useState<CategoriaSocio>('Activo');

  // Si no es admin, mostrar aviso
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-card text-center border border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900">
            Acceso Exclusivo de Administración
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Esta sección está reservada para los miembros de la Comisión Directiva y administradores autorizados.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/home"
              className="bg-roncedo-navy text-white text-xs font-bold py-3 rounded-xl hover:bg-blue-900 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Métricas
  const solicitudesPendientes = solicitudes.filter((s) => s.estado === 'pendiente');
  const totalSocios = allUsers.filter((u) => u.role === 'socio' || u.role === 'admin');
  const sociosAlDia = totalSocios.filter((u) => u.estado_cuota === 'al_dia');

  const handleOpenAprobar = (solId: string, catSugerida: CategoriaSocio) => {
    // Sugerir el siguiente número correlativo
    const nextNum = (totalSocios.length + 1040).toString();
    setNumeroSocioAsignar(nextNum);
    setCategoriaAsignar(catSugerida);
    setModalSolId(solId);
  };

  const handleConfirmAprobar = async () => {
    if (!modalSolId || !numeroSocioAsignar.trim()) return;
    await aprobarSolicitud(modalSolId, numeroSocioAsignar.trim(), categoriaAsignar);
    setModalSolId(null);
  };

  const filteredSocios = totalSocios.filter(
    (s) =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.dni && s.dni.includes(searchTerm)) ||
      (s.numero_socio && s.numero_socio.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-28 pt-6 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Cabecera del Panel Admin */}
        <div className="bg-roncedo-navy text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full">
                Panel Institucional
              </span>
              <span className="text-xs text-blue-200">
                Dr. Lautaro Roncedo
              </span>
            </div>
            <h1 className="text-2xl font-black text-white leading-tight">
              Gestión de Socios y Administración
            </h1>
            <p className="text-xs text-blue-100">
              Control de solicitudes de ingreso, padrón de socios activos y estado de cuotas
            </p>
          </div>

          <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/20 text-right">
            <span className="text-[10px] text-slate-300 block uppercase font-bold">
              Sesión activa
            </span>
            <span className="text-xs font-bold text-amber-300">
              {user.nombre} ({user.role})
            </span>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Solicitudes Pendientes
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-amber-600">
                {solicitudesPendientes.length}
              </span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Socios Activos
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-roncedo-navy">
                {totalSocios.length}
              </span>
              <Users className="w-5 h-5 text-roncedo-blue" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Cuotas al Día
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-emerald-600">
                {sociosAlDia.length}
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Total Registrados
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-black text-slate-800">
                {allUsers.length}
              </span>
              <CreditCard className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Pestañas de Gestión */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('solicitudes')}
            className={`flex-1 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'solicitudes'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Solicitudes Pendientes ({solicitudesPendientes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('padron')}
            className={`flex-1 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'padron'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Padrón de Socios ({totalSocios.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex-1 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'usuarios'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Todos los Usuarios ({allUsers.length})</span>
          </button>
        </div>

        {/* Pestaña: Solicitudes de Socios */}
        {activeTab === 'solicitudes' && (
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200">
            <h2 className="text-base font-extrabold text-slate-900 mb-4">
              Solicitudes de Ingreso de Socios
            </h2>

            {solicitudesPendientes.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">
                  ¡No hay solicitudes pendientes de revisión!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Todas las solicitudes de nuevos socios han sido procesadas.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitudesPendientes.map((sol) => (
                  <div
                    key={sol.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">
                          {sol.nombre} {sol.apellido}
                        </h4>
                        <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {sol.categoria_solicitada}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>DNI:</strong> {sol.dni} • <strong>Tel:</strong> {sol.telefono}
                      </p>
                      <p className="text-xs text-slate-500">
                        <strong>Domicilio:</strong> {sol.domicilio}, {sol.localidad} • <strong>Email:</strong> {sol.email}
                      </p>
                      <span className="text-[10px] text-slate-400 block">
                        Fecha de solicitud: {new Date(sol.fecha_solicitud).toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={() => rechazarSolicitud(sol.id, 'Rechazada por administración')}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={() => handleOpenAprobar(sol.id, sol.categoria_solicitada)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Aprobar y Emitir Carnet</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pestaña: Padrón de Socios */}
        {activeTab === 'padron' && (
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <h2 className="text-base font-extrabold text-slate-900">
                Padrón de Socios Oficiales
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, DNI o N°..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-roncedo-blue"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[10px] tracking-wider rounded-xl">
                  <tr>
                    <th className="p-3">N° Socio</th>
                    <th className="p-3">Socio</th>
                    <th className="p-3">DNI</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Alta</th>
                    <th className="p-3">Estado Cuota</th>
                    <th className="p-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSocios.map((socio) => (
                    <tr key={socio.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-roncedo-navy">
                        #{socio.numero_socio || '1042'}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        {socio.nombre} {socio.apellido}
                      </td>
                      <td className="p-3">{socio.dni || '-'}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium text-[11px]">
                          {socio.categoria_socio || 'Activo'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">
                        {socio.fecha_alta_socio || '2021-04-10'}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() =>
                            actualizarEstadoCuota(
                              socio.id,
                              socio.estado_cuota === 'al_dia' ? 'pendiente' : 'al_dia'
                            )
                          }
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                            socio.estado_cuota === 'al_dia'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                          }`}
                          title="Haga clic para alternar el estado de la cuota"
                        >
                          {socio.estado_cuota === 'al_dia' ? 'AL DÍA' : 'PENDIENTE'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <Link
                          href="/carnet"
                          className="text-roncedo-blue hover:underline font-bold"
                        >
                          Ver Carnet
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pestaña: Todos los Usuarios */}
        {activeTab === 'usuarios' && (
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200">
            <h2 className="text-base font-extrabold text-slate-900 mb-4">
              Usuarios Registrados en la Plataforma
            </h2>
            <div className="space-y-3">
              {allUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {u.nombre} {u.apellido}
                    </h4>
                    <p className="text-slate-500 text-[11px]">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="uppercase text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      Rol: {u.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de Aprobación de Socio */}
        {modalSolId && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <h3 className="text-lg font-black text-slate-900">
                Aprobar Solicitud y Emitir Carnet
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Asigna el número de socio correlativo y la categoría institucional para activar su credencial con QR.
              </p>

              <div className="space-y-4 my-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número de Socio
                  </label>
                  <input
                    type="text"
                    required
                    value={numeroSocioAsignar}
                    onChange={(e) => setNumeroSocioAsignar(e.target.value)}
                    placeholder="Ej: 1043"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoría de Socio
                  </label>
                  <select
                    value={categoriaAsignar}
                    onChange={(e) => setCategoriaAsignar(e.target.value as CategoriaSocio)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm font-semibold"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Cadete">Cadete</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Vitalicio">Vitalicio</option>
                    <option value="Honorario">Honorario</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalSolId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAprobar}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
                >
                  Confirmar y Activar Socio
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
