'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { CategoriaSocio, EstadoCuota, TipoSocioProtector, EstadoSocioProtector, UserProfile } from '@/types';
import { formatFechaArgentina } from '@/lib/utils';
import { obtenerMedallaProtector } from '@/lib/payments/plans';
import * as XLSX from 'xlsx';
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
  Heart,
  Download,
  Edit3,
  PlusCircle,
  FileSpreadsheet,
  Phone,
  Mail,
  ExternalLink,
  DollarSign,
  Calendar,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { GestionPortadas } from '@/components/admin/GestionPortadas';

export default function AdminPage() {
  const {
    user,
    allUsers,
    solicitudes,
    aprobarSolicitud,
    rechazarSolicitud,
    actualizarEstadoCuota,
    actualizarSocioProtector,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'portadas' | 'solicitudes' | 'padron' | 'protectores' | 'usuarios'>('portadas');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal de aprobación de solicitud de socio
  const [modalSolId, setModalSolId] = useState<string | null>(null);
  const [numeroSocioAsignar, setNumeroSocioAsignar] = useState('');
  const [categoriaAsignar, setCategoriaAsignar] = useState<CategoriaSocio>('Activo');

  // Filtros y estados de Socios Protectores
  const [searchProtector, setSearchProtector] = useState('');
  const [filtroEstadoProtector, setFiltroEstadoProtector] = useState<'todos' | 'activo' | 'pendiente' | 'inactivo'>('todos');
  const [filtroMontoProtector, setFiltroMontoProtector] = useState<'todos' | '2000' | '5000' | '10000'>('todos');

  // Modal para edición manual de Socio Protector
  const [editingProtector, setEditingProtector] = useState<UserProfile | null>(null);
  const [editEstado, setEditEstado] = useState<EstadoSocioProtector>('activo');
  const [editTipo, setEditTipo] = useState<TipoSocioProtector>('Bronce');
  const [editMonto, setEditMonto] = useState<number>(2000);
  const [editProveedor, setEditProveedor] = useState<string>('mercadopago');
  const [editSubId, setEditSubId] = useState<string>('');
  const [editFechaAdhesion, setEditFechaAdhesion] = useState<string>('');
  const [editFechaUltimoPago, setEditFechaUltimoPago] = useState<string>('');
  const [editProximoVencimiento, setEditProximoVencimiento] = useState<string>('');

  // Modal para registrar nuevo Socio Protector manualmente
  const [modalNuevoProtector, setModalNuevoProtector] = useState(false);
  const [nuevoUserId, setNuevoUserId] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState<TipoSocioProtector>('Bronce');
  const [nuevoMonto, setNuevoMonto] = useState<number>(2000);
  const [nuevoProveedor, setNuevoProveedor] = useState<string>('mercadopago');

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

  // Métricas específicas de Socios Protectores
  const protectoresTodos = allUsers.filter((u) => u.es_socio_protector);
  const protectoresActivos = protectoresTodos.filter((u) => u.estado_socio_protector === 'activo');
  const protectoresPendientes = protectoresTodos.filter((u) => u.estado_socio_protector === 'pendiente');
  const protectoresInactivos = protectoresTodos.filter((u) => u.estado_socio_protector === 'inactivo');
  const aporteMensualEstimado = protectoresActivos.reduce((sum, p) => sum + (p.importe_mensual || 0), 0);
  const pagosPendientesORechazados = protectoresPendientes.length + protectoresInactivos.length;

  const filteredProtectores = protectoresTodos.filter((p) => {
    const term = searchProtector.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.nombre.toLowerCase().includes(term) ||
      p.apellido.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      (p.dni && p.dni.includes(term)) ||
      (p.id_suscripcion_externa && p.id_suscripcion_externa.toLowerCase().includes(term));

    const matchesEstado =
      filtroEstadoProtector === 'todos' || p.estado_socio_protector === filtroEstadoProtector;

    const matchesMonto =
      filtroMontoProtector === 'todos' || p.importe_mensual === Number(filtroMontoProtector);

    return matchesSearch && matchesEstado && matchesMonto;
  });

  const handleOpenEditProtector = (p: UserProfile) => {
    setEditingProtector(p);
    setEditEstado(p.estado_socio_protector || 'activo');
    setEditTipo(p.tipo_socio_protector || 'Bronce');
    setEditMonto(p.importe_mensual || 2000);
    setEditProveedor(p.proveedor_pago || 'mercadopago');
    setEditSubId(p.id_suscripcion_externa || '');
    setEditFechaAdhesion(p.fecha_adhesion || new Date().toISOString().split('T')[0]);
    setEditFechaUltimoPago(p.fecha_ultimo_pago ? p.fecha_ultimo_pago.split('T')[0] : '');
    setEditProximoVencimiento(p.proximo_vencimiento ? p.proximo_vencimiento.split('T')[0] : '');
  };

  const handleSaveEditProtector = async () => {
    if (!editingProtector) return;
    await actualizarSocioProtector(editingProtector.id, {
      es_socio_protector: editEstado === 'activo' || editEstado === 'pendiente',
      estado_socio_protector: editEstado,
      tipo_socio_protector: editTipo,
      importe_mensual: Number(editMonto),
      proveedor_pago: editProveedor,
      id_suscripcion_externa: editSubId.trim() || undefined,
      fecha_adhesion: editFechaAdhesion || undefined,
      fecha_ultimo_pago: editFechaUltimoPago || undefined,
      proximo_vencimiento: editProximoVencimiento || undefined,
    });
    setEditingProtector(null);
  };

  const handleCrearNuevoProtector = async () => {
    if (!nuevoUserId) return;
    const targetUser = allUsers.find((u) => u.id === nuevoUserId);
    if (!targetUser) return;

    const hoy = new Date().toISOString().split('T')[0];
    const proximoMes = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await actualizarSocioProtector(targetUser.id, {
      es_socio_protector: true,
      estado_socio_protector: 'activo',
      tipo_socio_protector: nuevoTipo,
      importe_mensual: Number(nuevoMonto),
      proveedor_pago: nuevoProveedor,
      id_suscripcion_externa: `ADM-${Date.now().toString().slice(-6)}`,
      fecha_adhesion: hoy,
      fecha_ultimo_pago: hoy,
      proximo_vencimiento: proximoMes,
    });

    setModalNuevoProtector(false);
    setNuevoUserId('');
  };

  const exportarProtectoresExcel = () => {
    const data = filteredProtectores.map((p) => ({
      'Nombre': p.nombre,
      'Apellido': p.apellido,
      'Email': p.email,
      'Teléfono / WhatsApp': p.telefono || p.whatsapp || '-',
      'DNI': p.dni || '-',
      'Categoría de Socio': p.categoria_socio || (p.role === 'socio' ? 'Socio' : 'Usuario General'),
      'Tipo Socio Protector': p.tipo_socio_protector || 'Bronce',
      'Estado': p.estado_socio_protector === 'activo' ? 'Activo' : p.estado_socio_protector === 'pendiente' ? 'Pendiente' : 'Inactivo',
      'Importe Mensual ($)': p.importe_mensual || 0,
      'Proveedor de Pago': p.proveedor_pago === 'mercadopago' ? 'Mercado Pago' : p.proveedor_pago || 'Mercado Pago',
      'ID Suscripción Externa': p.id_suscripcion_externa || '-',
      'Fecha Adhesión': formatFechaArgentina(p.fecha_adhesion),
      'Fecha Último Pago': formatFechaArgentina(p.fecha_ultimo_pago),
      'Próximo Vencimiento': formatFechaArgentina(p.proximo_vencimiento),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Socios Protectores');
    XLSX.writeFile(workbook, `socios_protectores_roncedo_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportarProtectoresCSV = () => {
    const data = filteredProtectores.map((p) => ({
      'Nombre': p.nombre,
      'Apellido': p.apellido,
      'Email': p.email,
      'Telefono': p.telefono || p.whatsapp || '-',
      'DNI': p.dni || '-',
      'Tipo': p.tipo_socio_protector || 'Bronce',
      'Estado': p.estado_socio_protector || 'activo',
      'Importe_Mensual': p.importe_mensual || 0,
      'Proveedor': p.proveedor_pago || 'mercadopago',
      'ID_Suscripcion': p.id_suscripcion_externa || '-',
      'Fecha_Adhesion': p.fecha_adhesion || '-',
      'Ultimo_Pago': p.fecha_ultimo_pago || '-',
      'Proximo_Vencimiento': p.proximo_vencimiento || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `socios_protectores_roncedo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-28 pt-6 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Cabecera del Panel Admin */}
        <div className="bg-gradient-to-r from-[#0F2D54] via-[#1B5296] to-[#5B9BE5] text-white rounded-3xl p-6 shadow-xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full">
                Panel Institucional
              </span>
              <span className="text-xs text-blue-100">
                Biblioteca Roncedo
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
        <div className="grid grid-cols-2 sm:grid-cols-5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('portadas')}
            className={`py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'portadas'
                ? 'bg-gradient-to-r from-roncedo-navy to-[#1D4A80] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'portadas' ? 'text-roncedo-gold' : 'text-amber-500'}`} />
            <span>Gestión de Portadas</span>
          </button>

          <button
            onClick={() => setActiveTab('protectores')}
            className={`py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'protectores'
                ? 'bg-gradient-to-r from-rose-700 to-rose-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className={`w-4 h-4 ${activeTab === 'protectores' ? 'text-rose-300 fill-rose-300' : 'text-rose-500'}`} />
            <span>Socios Protectores ({protectoresTodos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('solicitudes')}
            className={`py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'solicitudes'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Solicitudes ({solicitudesPendientes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('padron')}
            className={`py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'padron'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Padrón Socios ({totalSocios.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('usuarios')}
            className={`py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'usuarios'
                ? 'bg-roncedo-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Usuarios ({allUsers.length})</span>
          </button>
        </div>

        {/* Pestaña: Gestión de Portadas */}
        {activeTab === 'portadas' && <GestionPortadas />}

        {/* Pestaña: Socios Protectores */}
        {activeTab === 'protectores' && (
          <div className="space-y-6">
            {/* Indicadores Generales de Socios Protectores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-card border border-rose-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Protectores Activos
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-2xl font-black text-rose-700">
                    {protectoresActivos.length}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Colaboradores mensuales
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Aporte Mensual Estimado
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-2xl font-black text-emerald-700">
                    ${aporteMensualEstimado.toLocaleString('es-AR')}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Ingreso recurrente proyectado
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Pagos Pendientes / Inactivos
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-2xl font-black text-amber-600">
                    {pagosPendientesORechazados}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {protectoresPendientes.length} pendientes • {protectoresInactivos.length} inactivos
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Total Registrados
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-2xl font-black text-slate-800">
                    {protectoresTodos.length}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-roncedo-blue flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Historial de suscriptores
                </span>
              </div>
            </div>

            {/* Contenedor Principal de Gestión */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200 space-y-5">
              {/* Cabecera, Acciones y Exportaciones */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                    <span>Nómina de Socios Protectores</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gestión manual y automatizada de aportes recurrentes por Mercado Pago y pasarelas externas
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <button
                    onClick={() => setModalNuevoProtector(true)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Asignar Protector</span>
                  </button>

                  <button
                    onClick={exportarProtectoresExcel}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    title="Exportar listado a archivo Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel (.xlsx)</span>
                  </button>

                  <button
                    onClick={exportarProtectoresCSV}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
                    title="Exportar listado a archivo CSV (.csv)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Filtros: Búsqueda, Estado e Importe */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchProtector}
                    onChange={(e) => setSearchProtector(e.target.value)}
                    placeholder="Buscar por nombre, email, DNI o ID..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  />
                </div>

                {/* Filtro por Estado */}
                <div>
                  <select
                    value={filtroEstadoProtector}
                    onChange={(e) => setFiltroEstadoProtector(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="todos">Todos los Estados ({protectoresTodos.length})</option>
                    <option value="activo">Solo Activos ({protectoresActivos.length})</option>
                    <option value="pendiente">Solo Pendientes ({protectoresPendientes.length})</option>
                    <option value="inactivo">Solo Inactivos ({protectoresInactivos.length})</option>
                  </select>
                </div>

                {/* Filtro por Importe Mensual */}
                <div>
                  <select
                    value={filtroMontoProtector}
                    onChange={(e) => setFiltroMontoProtector(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="todos">Todos los Importes</option>
                    <option value="2000">$2.000 / mes (Bronce)</option>
                    <option value="5000">$5.000 / mes (Plata)</option>
                    <option value="10000">$10.000 / mes (Oro)</option>
                  </select>
                </div>
              </div>

              {/* Tabla de Socios Protectores */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-800 uppercase font-bold text-[10px] tracking-wider rounded-xl">
                    <tr>
                      <th className="p-3">Socio Protector</th>
                      <th className="p-3">Contacto</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3">Importe Mensual</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Proveedor / ID</th>
                      <th className="p-3">Fechas Clave</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProtectores.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          No se encontraron Socios Protectores con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      filteredProtectores.map((p) => {
                        const telLimpio = (p.whatsapp || p.telefono || '').replace(/\D/g, '');
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Nombre y Apellido */}
                            <td className="p-3">
                              <div className="font-bold text-slate-900 text-sm">
                                {p.nombre} {p.apellido}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-500">
                                  DNI: {p.dni || 'S/D'}
                                </span>
                                {p.numero_socio && (
                                  <span className="text-[9px] bg-blue-50 text-blue-800 px-1.5 py-0.2 rounded border border-blue-200">
                                    Socio #{p.numero_socio}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Contacto */}
                            <td className="p-3 space-y-1">
                              <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{p.email}</span>
                              </div>
                              {telLimpio && (
                                <a
                                  href={`https://wa.me/${telLimpio}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </td>

                            {/* Tipo */}
                            <td className="p-3">
                              {(() => {
                                const medalla = obtenerMedallaProtector(p.tipo_socio_protector);
                                return (
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                      p.tipo_socio_protector === 'Oro'
                                        ? 'bg-yellow-50 text-yellow-800 border-yellow-300'
                                        : p.tipo_socio_protector === 'Plata'
                                        ? 'bg-slate-100 text-slate-800 border-slate-300'
                                        : 'bg-amber-50 text-amber-800 border-amber-300'
                                    }`}
                                  >
                                    {medalla && (
                                      <div className="relative w-4 h-4 flex-shrink-0 drop-shadow-sm">
                                        <Image
                                          src={medalla.insignia}
                                          alt={medalla.label}
                                          fill
                                          className="object-contain"
                                        />
                                      </div>
                                    )}
                                    <span>{p.tipo_socio_protector || 'Bronce'}</span>
                                  </span>
                                );
                              })()}
                            </td>

                            {/* Importe Mensual */}
                            <td className="p-3">
                              <span className="font-extrabold text-slate-900 text-sm">
                                ${p.importe_mensual?.toLocaleString('es-AR') || '2.000'}
                              </span>
                              <span className="text-[10px] text-slate-400 block">/ mes</span>
                            </td>

                            {/* Estado */}
                            <td className="p-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                  p.estado_socio_protector === 'activo'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : p.estado_socio_protector === 'pendiente'
                                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                                    : 'bg-slate-100 text-slate-600 border-slate-300'
                                }`}
                              >
                                {p.estado_socio_protector === 'activo'
                                  ? 'Activo'
                                  : p.estado_socio_protector === 'pendiente'
                                  ? 'Pendiente'
                                  : 'Inactivo'}
                              </span>
                            </td>

                            {/* Proveedor e ID */}
                            <td className="p-3">
                              <span className="font-semibold text-slate-800 capitalize text-xs block">
                                {p.proveedor_pago === 'mercadopago' ? 'Mercado Pago' : p.proveedor_pago || 'Mercado Pago'}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400 block truncate max-w-[120px]" title={p.id_suscripcion_externa || '-'}>
                                {p.id_suscripcion_externa || 'Pendiente'}
                              </span>
                            </td>

                            {/* Fechas Clave */}
                            <td className="p-3 text-[11px] text-slate-600 space-y-0.5">
                              <div>
                                <span className="text-[10px] text-slate-400">Adhesión: </span>
                                {formatFechaArgentina(p.fecha_adhesion)}
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400">Últ. pago: </span>
                                {formatFechaArgentina(p.fecha_ultimo_pago)}
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400">Próx. venc: </span>
                                {p.proximo_vencimiento ? formatFechaArgentina(p.proximo_vencimiento) : 'Auto'}
                              </div>
                            </td>

                            {/* Acciones */}
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditProtector(p)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                                  title="Editar estado y parámetros manualmente"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Editar</span>
                                </button>
                                <Link
                                  href="/carnet"
                                  className="px-2 py-1.5 rounded-lg text-roncedo-blue hover:bg-blue-50 text-xs font-bold transition-colors"
                                  title="Ver carnet con insignia"
                                >
                                  Carnet
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

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
                        <strong>Domicilio:</strong> {sol.domicilio}, {sol.localidad}{sol.codigo_postal ? ` (CP ${sol.codigo_postal})` : ''} • <strong>Email:</strong> {sol.email}
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

        {/* Modal de Edición Manual de Socio Protector */}
        {editingProtector && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                  <h3 className="text-base font-black text-slate-900">
                    Editar Socio Protector
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  {editingProtector.nombre} {editingProtector.apellido}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                Actualiza manualmente el estado, importe y parámetros de suscripción del colaborador.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5 text-xs">
                {/* Estado */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Estado del Aporte
                  </label>
                  <select
                    value={editEstado}
                    onChange={(e) => setEditEstado(e.target.value as EstadoSocioProtector)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="activo">Activo (Al día con carnet ❤️)</option>
                    <option value="pendiente">Pendiente de confirmación</option>
                    <option value="inactivo">Inactivo / Pausado</option>
                  </select>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tipo de Socio Protector
                  </label>
                  <select
                    value={editTipo}
                    onChange={(e) => {
                      const nuevoT = e.target.value as TipoSocioProtector;
                      setEditTipo(nuevoT);
                      if (nuevoT === 'Bronce') setEditMonto(2000);
                      else if (nuevoT === 'Plata') setEditMonto(5000);
                      else if (nuevoT === 'Oro') setEditMonto(10000);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Bronce">Bronce ($2.000)</option>
                    <option value="Plata">Plata ($5.000)</option>
                    <option value="Oro">Oro ($10.000)</option>
                  </select>
                </div>

                {/* Importe Mensual */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Importe Mensual ($ ARS)
                  </label>
                  <input
                    type="number"
                    value={editMonto}
                    onChange={(e) => setEditMonto(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Proveedor de Pago */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Proveedor de Pago
                  </label>
                  <select
                    value={editProveedor}
                    onChange={(e) => setEditProveedor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="mercadopago">Mercado Pago (Oficial)</option>
                    <option value="mobbex">Mobbex (Integración)</option>
                    <option value="transferencia">Transferencia bancaria</option>
                    <option value="efectivo">Efectivo / Secretaría</option>
                  </select>
                </div>

                {/* ID Suscripción */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Identificador Externo de Suscripción
                  </label>
                  <input
                    type="text"
                    value={editSubId}
                    onChange={(e) => setEditSubId(e.target.value)}
                    placeholder="Ej: 2c9380848f10... o MP-SUB-..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Fecha Adhesión */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fecha de Adhesión
                  </label>
                  <input
                    type="date"
                    value={editFechaAdhesion}
                    onChange={(e) => setEditFechaAdhesion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Fecha Último Pago */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fecha del Último Pago
                  </label>
                  <input
                    type="date"
                    value={editFechaUltimoPago}
                    onChange={(e) => setEditFechaUltimoPago(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Próximo Vencimiento */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Próximo Vencimiento
                  </label>
                  <input
                    type="date"
                    value={editProximoVencimiento}
                    onChange={(e) => setEditProximoVencimiento(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProtector(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditProtector}
                  className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para Asignar / Registrar Nuevo Socio Protector */}
        {modalNuevoProtector && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <PlusCircle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-black text-slate-900">
                  Asignar Socio Protector
                </h3>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                Selecciona un usuario de la plataforma para asignarle la condición de Socio Protector de forma manual.
              </p>

              <div className="space-y-4 my-5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Seleccionar Usuario
                  </label>
                  <select
                    value={nuevoUserId}
                    onChange={(e) => setNuevoUserId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">-- Selecciona un usuario --</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} {u.apellido} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tipo de Socio Protector
                  </label>
                  <select
                    value={nuevoTipo}
                    onChange={(e) => {
                      const t = e.target.value as TipoSocioProtector;
                      setNuevoTipo(t);
                      if (t === 'Bronce') setNuevoMonto(2000);
                      else if (t === 'Plata') setNuevoMonto(5000);
                      else if (t === 'Oro') setNuevoMonto(10000);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Bronce">Bronce ($2.000 / mes)</option>
                    <option value="Plata">Plata ($5.000 / mes)</option>
                    <option value="Oro">Oro ($10.000 / mes)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Proveedor de Pago
                  </label>
                  <select
                    value={nuevoProveedor}
                    onChange={(e) => setNuevoProveedor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="mercadopago">Mercado Pago</option>
                    <option value="mobbex">Mobbex</option>
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="efectivo">Efectivo / Cobro Manual</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNuevoProtector(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!nuevoUserId}
                  onClick={handleCrearNuevoProtector}
                  className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  Asignar y Activar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
