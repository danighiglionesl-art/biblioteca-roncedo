'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  EventoTaller,
  EventoInscripcion,
  TipoSocioProtector,
} from '@/types';
import {
  getEventos,
  getInscripcionesUsuario,
  crearInscripcion,
} from '@/lib/supabase/eventos';
import {
  calcularTarifaVigente,
  getFechaHoyISO,
} from '@/lib/utils/eventos';
import { formatFechaArgentina } from '@/lib/utils';
import { obtenerMedallaProtector } from '@/lib/payments/plans';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  CalendarDays,
  ExternalLink,
  ShieldCheck,
  Award,
  AlertTriangle,
  Search,
  Filter,
  DollarSign,
  ChevronRight,
  Printer,
  X,
  CreditCard,
  QrCode,
  BookOpen,
  Share2,
} from 'lucide-react';

export default function EventosPage() {
  const { user } = useAuth();

  const [eventos, setEventos] = useState<EventoTaller[]>([]);
  const [misInscripciones, setMisInscripciones] = useState<EventoInscripcion[]>([]);
  const [loading, setLoading] = useState(true);

  // Pestaña principal: Cartelera vs Mis Talleres
  const [tabActiva, setTabActiva] = useState<'cartelera' | 'mis_talleres'>('cartelera');

  // Filtros de Cartelera
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'taller_recurrente' | 'evento_unico'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Inscripción
  const [eventoParaInscribir, setEventoParaInscribir] = useState<EventoTaller | null>(null);
  const [inscribiendo, setInscribiendo] = useState(false);
  const [inscripcionExitosa, setInscripcionExitosa] = useState<EventoInscripcion | null>(null);
  const [idPagoInput, setIdPagoInput] = useState('');

  // Modal de Certificado
  const [inscripcionCertificado, setInscripcionCertificado] = useState<EventoInscripcion | null>(null);

  // Cargar datos
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const dataEventos = await getEventos();
      setEventos(dataEventos);

      if (user?.id) {
        const dataInscripciones = await getInscripcionesUsuario(user.id);
        setMisInscripciones(dataInscripciones);
      } else {
        setMisInscripciones([]);
      }
    } catch (err) {
      console.error('Error cargando eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [user?.id]);

  // Determinar condición del usuario para cálculo de beneficios
  const tipoProtector: TipoSocioProtector | 'no_socio' =
    user?.es_socio_protector && user?.estado_socio_protector === 'activo' && user?.tipo_socio_protector
      ? user.tipo_socio_protector
      : 'no_socio';

  const medallaInfo =
    tipoProtector !== 'no_socio' ? obtenerMedallaProtector(tipoProtector as TipoSocioProtector) : null;

  // Filtrado de eventos
  const eventosFiltrados = useMemo(() => {
    return eventos.filter((ev) => {
      if (ev.estado !== 'activo') return false;
      const matchTipo = filtroTipo === 'todos' || ev.tipo === filtroTipo;
      const matchSearch =
        ev.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.organizador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTipo && matchSearch;
    });
  }, [eventos, filtroTipo, searchTerm]);

  // Verificar si el usuario ya está inscripto en un evento
  const estaInscripto = (eventoId: string) => {
    return misInscripciones.some((i) => i.evento_id === eventoId);
  };

  // Abrir modal de inscripción
  const handleIniciarInscripcion = (ev: EventoTaller) => {
    setEventoParaInscribir(ev);
    setInscripcionExitosa(null);
    setIdPagoInput('');
  };

  // Confirmar inscripción
  const handleConfirmarInscripcion = async () => {
    if (!eventoParaInscribir) return;

    setInscribiendo(true);
    try {
      const tarifa = calcularTarifaVigente(eventoParaInscribir, tipoProtector);

      const nueva = await crearInscripcion({
        evento_id: eventoParaInscribir.id,
        evento_titulo: eventoParaInscribir.titulo,
        user_id: user?.id || `anon-${Date.now()}`,
        user_nombre: user?.nombre || 'Participante',
        user_apellido: user?.apellido || 'Registrado',
        user_email: user?.email || 'contacto@bibliotecaroncedo.ar',
        user_dni: user?.dni || '',
        user_telefono: user?.telefono || user?.whatsapp || '',
        user_tipo_protector: tipoProtector,
        monto_base: tarifa.montoBase,
        descuento_porcentaje: tarifa.descuentoPorcentaje,
        monto_descuento: tarifa.montoDescuento,
        monto_final: tarifa.montoFinal,
        tramo_aplicado: tarifa.etiquetaTramo,
        estado_pago: tarifa.esGratuito ? 'bonificado' : 'pendiente',
        asistencia: 'inscripto',
        certificado_emitido: false,
      });

      setInscripcionExitosa(nueva);
      // Recargar inscripciones
      if (user?.id) {
        const actualizadas = await getInscripcionesUsuario(user.id);
        setMisInscripciones(actualizadas);
      }
    } catch (err) {
      console.error('Error registrando inscripción:', err);
      alert('Ocurrió un error al procesar tu inscripción. Por favor intentá nuevamente.');
    } finally {
      setInscribiendo(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F6FD] pb-24 pt-6 px-4 print:p-0 print:bg-white">
      <div className="max-w-5xl mx-auto space-y-6 print:hidden">
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
            Biblioteca Roncedo • Agenda Cultural y Talleres
          </span>
        </div>

        {/* Cabecera Principal */}
        <div className="bg-gradient-to-r from-[#0F2D54] via-[#1A4579] to-[#2563EB] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/20 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                Ciclo Cultural 2026
              </span>
              <span className="text-xs text-blue-100 font-medium">
                Biblioteca Popular Dr. Lautaro Roncedo
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Cursos, Talleres y Eventos Culturales
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
              Inscribite en talleres regulares de bienestar y cultura, participá de presentaciones y jornadas abiertas, y obtené tu certificado oficial con respaldo institucional.
            </p>
          </div>

          <div className="absolute right-4 bottom-2 opacity-10 pointer-events-none hidden md:block">
            <Calendar className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* BANNER DE CONDICIÓN DEL USUARIO Y BENEFICIOS PROTECTOR */}
        {tipoProtector !== 'no_socio' && medallaInfo ? (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-100/70 border border-amber-300/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src={medallaInfo.insignia}
                  alt={medallaInfo.label}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">
                    Hola, {user?.nombre || 'Socio'}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${medallaInfo.bgBadge}`}>
                    Socio Protector {medallaInfo.label}
                  </span>
                </div>
                <p className="text-xs text-amber-900 font-semibold mt-0.5">
                  Tenés activo un <span className="font-black underline">{medallaInfo.descuento}</span> en todos los talleres y cursos de la Biblioteca.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-amber-950/80 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-300 flex-shrink-0">
              Descuento aplicado automáticamente
            </span>
          </div>
        ) : (
          <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-roncedo-navy flex items-center justify-center flex-shrink-0 font-bold text-xs">
                <ShieldCheck className="w-5 h-5 text-roncedo-blue" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {user ? `Sesión iniciada como Usuario (${user.nombre})` : 'Condición: Público General (No socio)'}
                </span>
                <p className="text-xs text-slate-500">
                  ¿Querés pagar menos? Los <strong>Socios Protectores</strong> disfrutan de un 2% (Bronce), 5% (Plata) o 10% (Oro) de descuento.
                </p>
              </div>
            </div>

            <Link
              href="/socio-protector"
              className="text-xs font-bold text-roncedo-navy hover:text-roncedo-celesteDark bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl transition-colors border border-blue-200 flex-shrink-0 flex items-center gap-1"
            >
              <span>Conocé los Planes de Socio Protector</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Pestañas de Navegación: Cartelera vs Mis Talleres */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setTabActiva('cartelera')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              tabActiva === 'cartelera'
                ? 'bg-roncedo-navy text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Cartelera de Talleres ({eventosFiltrados.length})</span>
          </button>

          <button
            onClick={() => setTabActiva('mis_talleres')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              tabActiva === 'mis_talleres'
                ? 'bg-roncedo-navy text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-roncedo-gold" />
            <span>Mis Talleres & Certificados ({misInscripciones.length})</span>
          </button>
        </div>

        {/* PESTAÑA: CARTELERA DE TALLERES */}
        {tabActiva === 'cartelera' && (
          <div className="space-y-6">
            {/* Barra de Filtros */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar taller, yoga, ajedrez..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-roncedo-blue"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setFiltroTipo('todos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    filtroTipo === 'todos' ? 'bg-roncedo-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroTipo('taller_recurrente')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    filtroTipo === 'taller_recurrente' ? 'bg-roncedo-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Clases Semanales
                </button>
                <button
                  onClick={() => setFiltroTipo('evento_unico')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    filtroTipo === 'evento_unico' ? 'bg-roncedo-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Eventos Únicos
                </button>
              </div>
            </div>

            {/* Listado de Tarjetas de Talleres */}
            {loading ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Clock className="w-6 h-6 text-roncedo-blue animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">Cargando actividades...</p>
              </div>
            ) : eventosFiltrados.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No hay talleres disponibles</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No se encontraron cursos que coincidan con los filtros seleccionados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {eventosFiltrados.map((ev) => {
                  const tarifa = calcularTarifaVigente(ev, tipoProtector);
                  const inscripto = estaInscripto(ev.id);

                  return (
                    <div
                      key={ev.id}
                      className="bg-white rounded-3xl border border-blue-200/80 shadow-card hover:shadow-lg transition-all p-5 flex flex-col justify-between space-y-4 relative overflow-hidden"
                    >
                      <div>
                        {/* Cabecera de la Tarjeta */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {ev.categoria}
                            </span>
                            {ev.tipo === 'taller_recurrente' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                <span>Clases Semanales</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Jornada Especial</span>
                              </span>
                            )}
                          </div>

                          {inscripto && (
                            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Inscripto</span>
                            </span>
                          )}
                        </div>

                        {/* Título y Organizador */}
                        <h3 className="text-lg font-black text-slate-900 mt-2 leading-snug">
                          {ev.titulo}
                        </h3>
                        <p className="text-xs font-semibold text-slate-600 mt-0.5">
                          Organiza: <span className="text-roncedo-navy font-bold">{ev.organizador}</span>
                        </p>

                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {ev.descripcion}
                        </p>

                        {/* Datos de Días y Horarios */}
                        <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
                          {ev.tipo === 'taller_recurrente' ? (
                            <>
                              <div className="flex items-center gap-2">
                                <CalendarDays className="w-3.5 h-3.5 text-roncedo-celeste flex-shrink-0" />
                                <span className="font-bold text-slate-800">
                                  Días: {ev.dias_dictado?.join(', ')}
                                </span>
                              </div>
                              {ev.horario_recurrente && (
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                  <span>Horario: {ev.horario_recurrente}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-roncedo-celeste flex-shrink-0" />
                                <span className="font-bold text-slate-800">
                                  Fecha: {ev.fecha_realizacion ? formatFechaArgentina(ev.fecha_realizacion) : 'A confirmar'}
                                </span>
                              </div>
                              {ev.horario && (
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                  <span>Horario: {ev.horario}</span>
                                </div>
                              )}
                            </>
                          )}

                          <div className="flex items-center gap-2 text-slate-500 pt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{ev.lugar}</span>
                            {typeof ev.cupo_disponible === 'number' && (
                              <span>• Quedan {ev.cupo_disponible} lugares</span>
                            )}
                          </div>
                        </div>

                        {/* Precios y Descuento Dinámico */}
                        <div className="mt-3 p-3.5 rounded-2xl bg-[#EBF4FE] border border-blue-200 text-xs space-y-1.5">
                          {tarifa.esGratuito ? (
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-emerald-700 text-sm">
                                Actividad 100% Gratuita
                              </span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                Entrada Libre
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                                <span>{tarifa.etiquetaTramo}</span>
                                {tipoProtector !== 'no_socio' && (
                                  <span className="line-through text-slate-400">
                                    ${tarifa.montoBase.toLocaleString('es-AR')}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-baseline justify-between">
                                <div>
                                  <span className="text-xl font-black text-slate-900">
                                    ${tarifa.montoFinal.toLocaleString('es-AR')}
                                  </span>
                                  {tipoProtector !== 'no_socio' ? (
                                    <span className="text-[10px] font-bold text-emerald-700 block">
                                      ✓ Ahorrás ${tarifa.montoDescuento.toLocaleString('es-AR')} ({tarifa.descuentoPorcentaje}% off {tipoProtector})
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 block">
                                      Tarifa General de Inscripción
                                    </span>
                                  )}
                                </div>

                                {tarifa.hayAumentoProximo && (
                                  <div className="text-right">
                                    <span className="text-[10px] text-amber-700 font-bold block">
                                      Aumenta el {formatFechaArgentina(tarifa.fechaLimiteTramo)}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                      a ${tarifa.proximoPrecio?.toLocaleString('es-AR')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Botón de Inscripción */}
                      <div className="pt-2 border-t border-slate-100">
                        {inscripto ? (
                          <button
                            onClick={() => setTabActiva('mis_talleres')}
                            className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Ver mi inscripción y certificado</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleIniciarInscripcion(ev)}
                            className="w-full py-2.5 rounded-xl bg-roncedo-navy hover:bg-[#1A4579] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            <span>Inscribirme al Taller</span>
                            <ChevronRight className="w-4 h-4 text-roncedo-gold" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: MIS TALLERES Y CERTIFICADOS */}
        {tabActiva === 'mis_talleres' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Historial de Talleres y Certificados de Participación
                </h3>
                <p className="text-xs text-slate-500">
                  Accedé a tus acreditaciones y descargá tus diplomas con respaldo oficial de la Biblioteca Roncedo.
                </p>
              </div>

              <span className="text-xs font-black px-3 py-1 bg-blue-50 text-roncedo-navy rounded-xl border border-blue-200">
                {misInscripciones.length} Actividades
              </span>
            </div>

            {misInscripciones.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <Award className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No tenés inscripciones activas</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Recorré la cartelera e inscribite a los talleres culturales o clases de la Biblioteca para sumar tus certificados.
                </p>
                <button
                  onClick={() => setTabActiva('cartelera')}
                  className="px-4 py-2 rounded-xl bg-roncedo-navy text-white text-xs font-bold shadow-sm"
                >
                  Explorar la Cartelera
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {misInscripciones.map((ins) => (
                  <div
                    key={ins.id}
                    className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">
                          Inscripto el {formatFechaArgentina(ins.fecha_inscripcion)}
                        </span>
                        {ins.estado_pago === 'aprobado' ? (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Pago Aprobado
                          </span>
                        ) : ins.estado_pago === 'bonificado' ? (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            Actividad Gratuita
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            Pago Pendiente
                          </span>
                        )}

                        {ins.asistencia === 'presente' ? (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            Asistencia Acreditada
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            En Cursado
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-black text-slate-900">
                        {ins.evento_titulo || 'Taller de la Biblioteca'}
                      </h4>

                      <p className="text-xs text-slate-600">
                        Monto abonado: <span className="font-bold text-slate-900">${ins.monto_final.toLocaleString('es-AR')}</span>{' '}
                        {ins.descuento_porcentaje > 0 && (
                          <span className="text-emerald-700 font-bold">
                            (Descuento {ins.descuento_porcentaje}% {ins.user_tipo_protector})
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {ins.asistencia === 'presente' || ins.certificado_emitido ? (
                        <button
                          onClick={() => setInscripcionCertificado(ins)}
                          className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-roncedo-navy to-[#1D4A80] hover:from-[#0B1E38] hover:to-roncedo-navy text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all"
                        >
                          <Award className="w-4 h-4 text-roncedo-gold" />
                          <span>Descargar Certificado Oficial</span>
                        </button>
                      ) : (
                        <div className="text-xs text-slate-500 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center w-full md:w-auto">
                          Certificado habilitado con la asistencia
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE INSCRIPCIÓN Y LINK DE PAGO */}
      {eventoParaInscribir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:hidden">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Inscripción Online
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {eventoParaInscribir.titulo}
                </h3>
              </div>
              <button
                onClick={() => setEventoParaInscribir(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cálculo de la tarifa */}
            {(() => {
              const tarifa = calcularTarifaVigente(eventoParaInscribir, tipoProtector);

              return (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Tramo de Inscripción:</span>
                      <span className="font-bold text-slate-800">{tarifa.etiquetaTramo}</span>
                    </div>

                    {!tarifa.esGratuito && (
                      <>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Precio Base No Socio:</span>
                          <span>${tarifa.montoBase.toLocaleString('es-AR')}</span>
                        </div>

                        {tarifa.descuentoPorcentaje > 0 && (
                          <div className="flex items-center justify-between text-emerald-700 font-bold">
                            <span>Descuento Socio Protector {tipoProtector} ({tarifa.descuentoPorcentaje}%):</span>
                            <span>-${tarifa.montoDescuento.toLocaleString('es-AR')}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-blue-200 flex items-center justify-between text-sm font-black text-slate-900">
                          <span>Total Neto a Pagar:</span>
                          <span className="text-xl text-roncedo-navy">
                            ${tarifa.montoFinal.toLocaleString('es-AR')}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Datos del Participante */}
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-slate-700 block">Tus Datos para la Inscripción:</span>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
                      <p><strong>Nombre:</strong> {user?.nombre || 'Invitado'} {user?.apellido || ''}</p>
                      <p><strong>Email:</strong> {user?.email || 'contacto@bibliotecaroncedo.ar'}</p>
                      {user?.dni && <p><strong>DNI:</strong> {user.dni}</p>}
                    </div>
                  </div>

                  {/* Si ya se confirmó la inscripción, mostrar opciones de pago */}
                  {inscripcionExitosa ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs space-y-3">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>¡Inscripción registrada con éxito!</span>
                      </div>

                      <p className="text-emerald-950">
                        Completá el pago del monto neto (<strong>${tarifa.montoFinal.toLocaleString('es-AR')}</strong>) para asegurar tu cupo:
                      </p>

                      {/* Botón directo al Link de Pago */}
                      {eventoParaInscribir.link_pago && (
                        <a
                          href={eventoParaInscribir.link_pago}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Pagar con Mercado Pago (${tarifa.montoFinal.toLocaleString('es-AR')})</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Datos de Transferencia */}
                      {eventoParaInscribir.datos_transferencia && (
                        <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-[11px] text-slate-700">
                          <span className="font-bold block text-slate-800 mb-0.5">O por Transferencia Bancaria:</span>
                          <span className="font-mono text-emerald-900 select-all font-bold">
                            {eventoParaInscribir.datos_transferencia}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setEventoParaInscribir(null);
                          setTabActiva('mis_talleres');
                        }}
                        className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        Ir a Mis Talleres
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEventoParaInscribir(null)}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmarInscripcion}
                        disabled={inscribiendo}
                        className="px-5 py-2.5 rounded-xl bg-roncedo-navy hover:bg-[#1A4579] text-white text-xs font-bold shadow-md disabled:opacity-50 flex items-center gap-2"
                      >
                        {inscribiendo ? (
                          <Clock className="w-4 h-4 animate-spin text-roncedo-gold" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                        <span>{inscribiendo ? 'Procesando...' : 'Confirmar e Ir a Pagar'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL DE CERTIFICADO OFICIAL DE PARTICIPACIÓN (PRINT-READY) */}
      {inscripcionCertificado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6 print:shadow-none print:border-none print:m-0 print:p-0">
            {/* Barra de control superior (oculta al imprimir) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">
                  Certificado Oficial de Asistencia y Aprobación
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-roncedo-navy text-white text-xs font-bold shadow-sm hover:bg-[#153A65]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  onClick={() => setInscripcionCertificado(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DIPLOMA INSTITUCIONAL */}
            <div
              id="diploma-institucional"
              className="relative p-8 sm:p-12 rounded-2xl border-8 border-double border-[#0F2D54] bg-[#FDFCF7] text-slate-900 text-center space-y-6 shadow-inner overflow-hidden"
            >
              {/* Marca de agua de fondo */}
              <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                <div className="relative w-96 h-96">
                  <Image
                    src="/images/escudo-roncedo.png"
                    alt="Marca de agua"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Cabecera del Certificado */}
              <div className="space-y-1 relative z-10">
                <div className="flex justify-center items-center gap-3 mb-2">
                  <div className="relative w-12 h-12">
                    <Image
                      src="/images/escudo-roncedo.png"
                      alt="Escudo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-black tracking-widest uppercase text-slate-800 block">
                      Club Sportivo y Biblioteca Popular
                    </span>
                    <span className="text-sm font-black text-roncedo-navy tracking-wider block">
                      DR. LAUTARO RONCEDO
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold block">
                      Fundado el 4 de Abril de 1926 • Alcira Gigena, Córdoba
                    </span>
                  </div>
                </div>

                <div className="w-24 h-0.5 bg-roncedo-gold mx-auto my-3" />

                <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                  La Comisión Directiva otorga el presente
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-wide text-[#0F2D54] pt-1">
                  CERTIFICADO DE PARTICIPACIÓN
                </h2>
              </div>

              {/* Cuerpo del Certificado */}
              <div className="space-y-3 relative z-10 max-w-xl mx-auto text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p className="italic">Se hace constar que</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 inline-block px-4">
                  {inscripcionCertificado.user_nombre} {inscripcionCertificado.user_apellido}
                </p>
                {inscripcionCertificado.user_dni && (
                  <p className="text-xs text-slate-500 font-semibold">
                    DNI: {inscripcionCertificado.user_dni}
                  </p>
                )}

                <p className="pt-2">
                  Ha participado y completado satisfactoriamente el taller cultural:
                </p>

                <p className="text-lg sm:text-xl font-bold text-roncedo-navy">
                  «{inscripcionCertificado.evento_titulo}»
                </p>

                <p className="text-xs text-slate-600 pt-1">
                  Dictado en las instalaciones de la Biblioteca Popular Dr. Lautaro Roncedo en Alcira Gigena.
                </p>
              </div>

              {/* Pie con Firmas y Código QR de Validación */}
              <div className="pt-6 border-t border-slate-300/80 grid grid-cols-3 gap-4 items-end relative z-10 text-[11px]">
                {/* Firma 1 */}
                <div className="text-center">
                  <div className="w-28 border-b border-slate-400 mx-auto mb-1" />
                  <span className="font-bold text-slate-800 block">Docente a Cargo</span>
                  <span className="text-[10px] text-slate-500">Capacitador/a</span>
                </div>

                {/* Código QR y Hash Institucional */}
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-white p-1.5 rounded-lg border border-slate-300 shadow-sm">
                    <QRCodeSVG
                      value={JSON.stringify({
                        org: 'CSyB-RONCEDO',
                        cert: inscripcionCertificado.codigo_certificado,
                        alumno: `${inscripcionCertificado.user_nombre} ${inscripcionCertificado.user_apellido}`,
                        taller: inscripcionCertificado.evento_titulo,
                        val: 'AUTÉNTICO-VERIFICADO',
                      })}
                      size={64}
                      level="M"
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-1 font-bold">
                    {inscripcionCertificado.codigo_certificado}
                  </span>
                </div>

                {/* Firma 2 */}
                <div className="text-center">
                  <div className="w-28 border-b border-slate-400 mx-auto mb-1" />
                  <span className="font-bold text-slate-800 block">Comisión Directiva</span>
                  <span className="text-[10px] text-slate-500">Biblioteca Roncedo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
