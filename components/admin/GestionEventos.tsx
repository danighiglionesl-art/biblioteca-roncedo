'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import {
  EventoTaller,
  EventoInscripcion,
  TramoPrecioFecha,
  TipoActividadEvento,
  CategoriaEvento,
} from '@/types';
import {
  getEventos,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  getInscripciones,
  actualizarInscripcion,
  subirImagenEvento,
} from '@/lib/supabase/eventos';
import {
  calcularTarifaVigente,
  getFechaHoyISO,
} from '@/lib/utils/eventos';
import { formatFechaArgentina } from '@/lib/utils';
import * as XLSX from 'xlsx';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Users,
  Clock,
  DollarSign,
  Link as LinkIcon,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Sparkles,
  Download,
  CalendarDays,
  MapPin,
  UserCheck,
  RefreshCw,
  X,
  Upload,
  Info,
} from 'lucide-react';

const CATEGORIAS_EVENTOS: CategoriaEvento[] = [
  'Cultura',
  'Deportes',
  'Educación',
  'Infantil',
  'Salud y Bienestar',
  'General',
];

const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export function GestionEventos() {
  const [eventos, setEventos] = useState<EventoTaller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'taller_recurrente' | 'evento_unico'>('todos');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'finalizado'>('todos');

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<EventoTaller | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Modal Eliminar
  const [eventoAEliminar, setEventoAEliminar] = useState<EventoTaller | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Modal Gestión de Inscriptos / Asistencia
  const [modalInscriptos, setModalInscriptos] = useState(false);
  const [eventoSeleccionadoInscriptos, setEventoSeleccionadoInscriptos] = useState<EventoTaller | null>(null);
  const [inscriptos, setInscriptos] = useState<EventoInscripcion[]>([]);
  const [cargandoInscriptos, setCargandoInscriptos] = useState(false);

  // Campos del Formulario de Creación / Edición
  const [formTitulo, setFormTitulo] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formOrganizador, setFormOrganizador] = useState('');
  const [formTipo, setFormTipo] = useState<TipoActividadEvento>('taller_recurrente');
  const [formCategoria, setFormCategoria] = useState<CategoriaEvento>('Cultura');
  const [formLugar, setFormLugar] = useState('Biblioteca Roncedo');
  const [formCupoMaximo, setFormCupoMaximo] = useState<number | ''>(25);
  const [formDestacado, setFormDestacado] = useState(false);
  const [formImagenUrl, setFormImagenUrl] = useState('');

  // Fechas y Recurrencia
  const [formFechaRealizacion, setFormFechaRealizacion] = useState('');
  const [formHorario, setFormHorario] = useState('');
  const [formDiasDictado, setFormDiasDictado] = useState<string[]>([]);
  const [formHorarioRecurrente, setFormHorarioRecurrente] = useState('');
  const [formFechaInicioCiclo, setFormFechaInicioCiclo] = useState('');
  const [formFechaFinCiclo, setFormFechaFinCiclo] = useState('');

  // Economía y Tramos
  const [formEsGratuito, setFormEsGratuito] = useState(false);
  const [formPrecioBase, setFormPrecioBase] = useState<number | ''>(30000);
  const [formTramos, setFormTramos] = useState<TramoPrecioFecha[]>([]);

  // Descuentos Protectores (Definidos por defecto: Bronce 2%, Plata 5%, Oro 10%)
  const [formDescBronce, setFormDescBronce] = useState<number>(2);
  const [formDescPlata, setFormDescPlata] = useState<number>(5);
  const [formDescOro, setFormDescOro] = useState<number>(10);

  // Links de pago y datos bancarios
  const [formLinkPago, setFormLinkPago] = useState('');
  const [formDatosTransferencia, setFormDatosTransferencia] = useState('Alias: BIBLIOTECA.RONCEDO.MP');

  // Subida de imagen
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const data = await getEventos();
      setEventos(data);
    } catch (err) {
      console.error('Error cargando eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Abrir modal de creación
  const handleNuevoEvento = () => {
    setEventoEditando(null);
    setFormTitulo('');
    setFormDescripcion('');
    setFormOrganizador('');
    setFormTipo('taller_recurrente');
    setFormCategoria('Cultura');
    setFormLugar('Biblioteca Roncedo');
    setFormCupoMaximo(25);
    setFormDestacado(false);
    setFormImagenUrl('');

    setFormFechaRealizacion('');
    setFormHorario('');
    setFormDiasDictado(['Martes', 'Jueves']);
    setFormHorarioRecurrente('18:30 a 20:00 hs');
    setFormFechaInicioCiclo('');
    setFormFechaFinCiclo('');

    setFormEsGratuito(false);
    setFormPrecioBase(30000);
    // Tramos sugeridos iniciales
    setFormTramos([
      { id: 'tr-1', fecha_limite: '2026-10-31', precio: 20000, etiqueta: 'Preventa 1' },
      { id: 'tr-2', fecha_limite: '2026-11-30', precio: 25000, etiqueta: 'Preventa 2' },
      { id: 'tr-3', fecha_limite: '2026-12-31', precio: 30000, etiqueta: 'Precio General' },
    ]);

    setFormDescBronce(2);
    setFormDescPlata(5);
    setFormDescOro(10);

    setFormLinkPago('');
    setFormDatosTransferencia('Alias: BIBLIOTECA.RONCEDO.MP');
    setErrorForm(null);
    setModalAbierto(true);
  };

  // Abrir modal de edición
  const handleEditarEvento = (ev: EventoTaller) => {
    setEventoEditando(ev);
    setFormTitulo(ev.titulo);
    setFormDescripcion(ev.descripcion);
    setFormOrganizador(ev.organizador);
    setFormTipo(ev.tipo);
    setFormCategoria(ev.categoria);
    setFormLugar(ev.lugar);
    setFormCupoMaximo(ev.cupo_maximo ?? '');
    setFormDestacado(ev.destacado ?? false);
    setFormImagenUrl(ev.imagen_url ?? '');

    setFormFechaRealizacion(ev.fecha_realizacion ?? '');
    setFormHorario(ev.horario ?? '');
    setFormDiasDictado(ev.dias_dictado || []);
    setFormHorarioRecurrente(ev.horario_recurrente ?? '');
    setFormFechaInicioCiclo(ev.fecha_inicio_ciclo ?? '');
    setFormFechaFinCiclo(ev.fecha_fin_ciclo ?? '');

    setFormEsGratuito(ev.es_gratuito);
    setFormPrecioBase(ev.precio_base);
    setFormTramos(ev.tramos_precio || []);

    setFormDescBronce(ev.descuento_bronce_porcentaje ?? 2);
    setFormDescPlata(ev.descuento_plata_porcentaje ?? 5);
    setFormDescOro(ev.descuento_oro_porcentaje ?? 10);

    setFormLinkPago(ev.link_pago ?? '');
    setFormDatosTransferencia(ev.datos_transferencia ?? '');
    setErrorForm(null);
    setModalAbierto(true);
  };

  // Agregar un nuevo tramo de precio
  const handleAgregarTramo = () => {
    const nuevoId = `tr-${Date.now()}`;
    const nuevoTramo: TramoPrecioFecha = {
      id: nuevoId,
      fecha_limite: getFechaHoyISO(),
      precio: typeof formPrecioBase === 'number' ? formPrecioBase : 20000,
      etiqueta: `Tramo ${formTramos.length + 1}`,
    };
    setFormTramos([...formTramos, nuevoTramo]);
  };

  // Actualizar un tramo
  const handleActualizarTramo = (id: string, campo: keyof TramoPrecioFecha, valor: any) => {
    setFormTramos(
      formTramos.map((t) => (t.id === id ? { ...t, [campo]: valor } : t))
    );
  };

  // Eliminar un tramo
  const handleEliminarTramo = (id: string) => {
    setFormTramos(formTramos.filter((t) => t.id !== id));
  };

  // Alternar día de dictado
  const toggleDiaDictado = (dia: string) => {
    if (formDiasDictado.includes(dia)) {
      setFormDiasDictado(formDiasDictado.filter((d) => d !== dia));
    } else {
      setFormDiasDictado([...formDiasDictado, dia]);
    }
  };

  // Subir imagen
  const handleSubirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoImagen(true);
    try {
      const url = await subirImagenEvento(file);
      setFormImagenUrl(url);
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      alert('No se pudo procesar la imagen seleccionada.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  // Guardar formulario
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim()) {
      setErrorForm('El título del taller o evento es obligatorio.');
      return;
    }
    if (!formOrganizador.trim()) {
      setErrorForm('Especificá quién lo organiza o dicta (ej: Prof. de Yoga).');
      return;
    }

    setGuardando(true);
    setErrorForm(null);

    try {
      const payload: Omit<EventoTaller, 'id' | 'created_at'> = {
        titulo: formTitulo.trim(),
        descripcion: formDescripcion.trim(),
        organizador: formOrganizador.trim(),
        tipo: formTipo,
        categoria: formCategoria,
        lugar: formLugar.trim() || 'Biblioteca Roncedo',
        cupo_maximo: formCupoMaximo === '' ? undefined : Number(formCupoMaximo),
        cupo_disponible: formCupoMaximo === '' ? undefined : Number(formCupoMaximo),
        destacado: formDestacado,
        imagen_url: formImagenUrl || undefined,

        // Recurrencia o fecha puntual
        es_recurrente: formTipo === 'taller_recurrente',
        fecha_realizacion: formTipo === 'evento_unico' ? formFechaRealizacion || undefined : undefined,
        horario: formTipo === 'evento_unico' ? formHorario || undefined : undefined,
        dias_dictado: formTipo === 'taller_recurrente' ? formDiasDictado : [],
        horario_recurrente: formTipo === 'taller_recurrente' ? formHorarioRecurrente || undefined : undefined,
        fecha_inicio_ciclo: formTipo === 'taller_recurrente' ? formFechaInicioCiclo || undefined : undefined,
        fecha_fin_ciclo: formTipo === 'taller_recurrente' ? formFechaFinCiclo || undefined : undefined,

        // Esquema económico
        es_gratuito: formEsGratuito,
        precio_base: formEsGratuito ? 0 : Number(formPrecioBase) || 0,
        tramos_precio: formEsGratuito ? [] : formTramos,

        // Descuentos Protectores (Bronce 2%, Plata 5%, Oro 10%)
        descuento_bronce_porcentaje: Number(formDescBronce),
        descuento_plata_porcentaje: Number(formDescPlata),
        descuento_oro_porcentaje: Number(formDescOro),

        link_pago: formLinkPago.trim() || undefined,
        datos_transferencia: formDatosTransferencia.trim() || undefined,
        estado: 'activo',
      };

      if (eventoEditando) {
        await actualizarEvento(eventoEditando.id, payload);
      } else {
        await crearEvento(payload);
      }

      await cargarDatos();
      setModalAbierto(false);
    } catch (err: any) {
      console.error('Error guardando evento:', err);
      setErrorForm(err.message || 'Error al guardar los datos.');
    } finally {
      setGuardando(false);
    }
  };

  // Confirmar eliminación
  const handleConfirmarEliminar = async () => {
    if (!eventoAEliminar) return;
    setEliminando(true);
    try {
      await eliminarEvento(eventoAEliminar.id);
      await cargarDatos();
      setEventoAEliminar(null);
    } catch (err) {
      console.error('Error al eliminar evento:', err);
      alert('Ocurrió un error al intentar eliminar el taller.');
    } finally {
      setEliminando(false);
    }
  };

  // Abrir modal de inscriptos
  const handleAbrirInscriptos = async (ev: EventoTaller) => {
    setEventoSeleccionadoInscriptos(ev);
    setModalInscriptos(true);
    setCargandoInscriptos(true);
    try {
      const data = await getInscripciones(ev.id);
      setInscriptos(data);
    } catch (err) {
      console.error('Error cargando inscriptos:', err);
    } finally {
      setCargandoInscriptos(false);
    }
  };

  // Alternar estado de pago
  const handleTogglePago = async (ins: EventoInscripcion) => {
    const nuevoEstado = ins.estado_pago === 'aprobado' ? 'pendiente' : 'aprobado';
    try {
      await actualizarInscripcion(ins.id, { estado_pago: nuevoEstado });
      setInscriptos(inscriptos.map((i) => (i.id === ins.id ? { ...i, estado_pago: nuevoEstado } : i)));
    } catch (err) {
      console.error('Error actualizando pago:', err);
    }
  };

  // Cambiar asistencia (inscripto -> presente -> ausente)
  const handleCambiarAsistencia = async (ins: EventoInscripcion, asistencia: 'inscripto' | 'presente' | 'ausente') => {
    try {
      const certificado_emitido = asistencia === 'presente';
      await actualizarInscripcion(ins.id, { asistencia, certificado_emitido });
      setInscriptos(
        inscriptos.map((i) => (i.id === ins.id ? { ...i, asistencia, certificado_emitido } : i))
      );
    } catch (err) {
      console.error('Error actualizando asistencia:', err);
    }
  };

  // Exportar inscriptos a Excel
  const exportarInscriptosExcel = () => {
    if (!eventoSeleccionadoInscriptos || inscriptos.length === 0) return;

    const data = inscriptos.map((i) => ({
      'Taller / Evento': eventoSeleccionadoInscriptos.titulo,
      'Alumno': `${i.user_nombre} ${i.user_apellido}`,
      'Email': i.user_email,
      'DNI': i.user_dni || '-',
      'Teléfono': i.user_telefono || '-',
      'Condición': i.user_tipo_protector === 'no_socio' ? 'Usuario (No socio)' : `Socio Protector ${i.user_tipo_protector}`,
      'Tramo / Preventa': i.tramo_aplicado || 'General',
      'Monto Base ($)': i.monto_base,
      'Descuento ($)': i.monto_descuento,
      'Monto Final Pagado ($)': i.monto_final,
      'Estado Pago': i.estado_pago === 'aprobado' ? 'Aprobado' : 'Pendiente',
      'Asistencia': i.asistencia === 'presente' ? 'Presente' : i.asistencia === 'ausente' ? 'Ausente' : 'Inscripto',
      'Código Certificado': i.codigo_certificado || '-',
      'Fecha Inscripción': formatFechaArgentina(i.fecha_inscripcion),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alumnos');
    const slug = eventoSeleccionadoInscriptos.titulo.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    XLSX.writeFile(workbook, `inscriptos_${slug}_${getFechaHoyISO()}.xlsx`);
  };

  // Filtrado de eventos en la lista
  const eventosFiltrados = useMemo(() => {
    return eventos.filter((ev) => {
      const matchSearch =
        ev.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.organizador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.categoria.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTipo = filtroTipo === 'todos' || ev.tipo === filtroTipo;
      const matchEstado = filtroEstado === 'todos' || ev.estado === filtroEstado;

      return matchSearch && matchTipo && matchEstado;
    });
  }, [eventos, searchTerm, filtroTipo, filtroEstado]);

  return (
    <div className="space-y-6">
      {/* Barra de cabecera con métricas y botón de creación */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-purple-200">
              Agenda Cultural & Talleres
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Biblioteca Popular Dr. Lautaro Roncedo
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Gestión de Eventos y Talleres
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Cargá clases recurrentes o eventos puntuales, definí tramos de precios escalonados por fecha y aplicá descuentos automáticos para Socios Protectores (Bronce 2%, Plata 5%, Oro 10%).
          </p>
        </div>

        <button
          onClick={handleNuevoEvento}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-roncedo-navy to-[#1D4A80] hover:from-[#0B1E38] hover:to-roncedo-navy text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4 text-roncedo-gold" />
          <span>Crear Nuevo Taller / Evento</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por taller, docente o tema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-roncedo-blue focus:ring-1 focus:ring-roncedo-blue"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <button
              onClick={() => setFiltroTipo('todos')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filtroTipo === 'todos' ? 'bg-white shadow-sm text-roncedo-navy' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroTipo('taller_recurrente')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filtroTipo === 'taller_recurrente' ? 'bg-white shadow-sm text-roncedo-navy' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Talleres Semanales
            </button>
            <button
              onClick={() => setFiltroTipo('evento_unico')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filtroTipo === 'evento_unico' ? 'bg-white shadow-sm text-roncedo-navy' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Eventos Únicos
            </button>
          </div>

          <button
            onClick={cargarDatos}
            title="Recargar datos"
            className="p-2 text-slate-500 hover:text-roncedo-navy hover:bg-slate-100 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Lista de Talleres / Eventos */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <RefreshCw className="w-6 h-6 text-roncedo-blue animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-semibold">Cargando talleres y eventos...</p>
        </div>
      ) : eventosFiltrados.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron talleres o eventos</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm ? 'No hay resultados que coincidan con la búsqueda.' : 'Todavía no hay actividades registradas en la agenda.'}
          </p>
          <button
            onClick={handleNuevoEvento}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-roncedo-navy text-white text-xs font-bold"
          >
            <Plus className="w-4 h-4 text-roncedo-gold" />
            <span>Crear el primer taller</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {eventosFiltrados.map((ev) => {
            // Calcular tarifa vigente de hoy para No Socio, Bronce, Plata y Oro
            const tarifaHoy = calcularTarifaVigente(ev, null);
            const tarifaBronce = calcularTarifaVigente(ev, 'Bronce');
            const tarifaPlata = calcularTarifaVigente(ev, 'Plata');
            const tarifaOro = calcularTarifaVigente(ev, 'Oro');

            return (
              <div
                key={ev.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Encabezado y Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {ev.categoria}
                      </span>
                      {ev.tipo === 'taller_recurrente' ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          <span>Clases Semanales</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Jornada Única</span>
                        </span>
                      )}
                      {ev.destacado && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                          <span>Destacado</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditarEvento(ev)}
                        title="Editar taller"
                        className="p-1.5 text-slate-400 hover:text-roncedo-navy hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEventoAEliminar(ev)}
                        title="Eliminar taller"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Título y Organizador */}
                  <div className="mt-3">
                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {ev.titulo}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5 flex items-center gap-1.5">
                      <span className="text-slate-400">Dictado por:</span>
                      <span className="text-roncedo-navy font-bold">{ev.organizador}</span>
                    </p>
                  </div>

                  {/* Días y Horarios */}
                  <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
                    {ev.tipo === 'taller_recurrente' ? (
                      <>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-3.5 h-3.5 text-roncedo-celeste flex-shrink-0" />
                          <span className="font-semibold text-slate-800">
                            Días: {ev.dias_dictado && ev.dias_dictado.length > 0 ? ev.dias_dictado.join(', ') : 'A definir'}
                          </span>
                        </div>
                        {ev.horario_recurrente && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-roncedo-celeste flex-shrink-0" />
                            <span>Horario: {ev.horario_recurrente}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-roncedo-celeste flex-shrink-0" />
                          <span className="font-semibold text-slate-800">
                            Fecha: {ev.fecha_realizacion ? formatFechaArgentina(ev.fecha_realizacion) : 'A definir'}
                          </span>
                        </div>
                        {ev.horario && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-roncedo-celeste flex-shrink-0" />
                            <span>Horario: {ev.horario}</span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex items-center gap-2 text-slate-600 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{ev.lugar}</span>
                      {typeof ev.cupo_maximo === 'number' && (
                        <span className="text-slate-400">
                          • Cupo: {ev.cupo_maximo} personas
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Esquema de Precios y Tramos Vigentes */}
                  <div className="mt-3 p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-roncedo-navy tracking-wider">
                        Esquema de Precios & Beneficios
                      </span>
                      {ev.es_gratuito ? (
                        <span className="font-extrabold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                          Gratuito
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                          {tarifaHoy.etiquetaTramo}
                        </span>
                      )}
                    </div>

                    {!ev.es_gratuito && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center justify-between text-slate-800">
                          <span className="font-semibold">Precio No Socio (Base):</span>
                          <span className="font-black text-slate-900">${tarifaHoy.montoBase.toLocaleString('es-AR')}</span>
                        </div>

                        {/* Tiras de Descuento Socios Protectores */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          <div className="bg-white/90 p-1.5 rounded-xl border border-amber-200/90 text-center">
                            <span className="text-[9px] font-bold text-amber-800 block">Bronce ({ev.descuento_bronce_porcentaje ?? 2}%)</span>
                            <span className="text-xs font-black text-slate-900">${tarifaBronce.montoFinal.toLocaleString('es-AR')}</span>
                          </div>

                          <div className="bg-white/90 p-1.5 rounded-xl border border-slate-300 text-center">
                            <span className="text-[9px] font-bold text-slate-700 block">Plata ({ev.descuento_plata_porcentaje ?? 5}%)</span>
                            <span className="text-xs font-black text-slate-900">${tarifaPlata.montoFinal.toLocaleString('es-AR')}</span>
                          </div>

                          <div className="bg-white/90 p-1.5 rounded-xl border border-yellow-300 text-center bg-yellow-50/40">
                            <span className="text-[9px] font-bold text-yellow-800 block">Oro ({ev.descuento_oro_porcentaje ?? 10}%)</span>
                            <span className="text-xs font-black text-slate-900">${tarifaOro.montoFinal.toLocaleString('es-AR')}</span>
                          </div>
                        </div>

                        {tarifaHoy.hayAumentoProximo && (
                          <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span>
                              Próximo tramo: ${tarifaHoy.proximoPrecio?.toLocaleString('es-AR')} a partir del {formatFechaArgentina(tarifaHoy.fechaLimiteTramo)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Link de pago */}
                    {ev.link_pago && (
                      <div className="mt-2 pt-2 border-t border-blue-200/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                          <LinkIcon className="w-3 h-3 text-slate-400" />
                          <span>Link de Pago Vinculado</span>
                        </span>
                        <a
                          href={ev.link_pago}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-roncedo-blue hover:text-roncedo-navy flex items-center gap-1"
                        >
                          <span>Probar Enlace</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón de Inscriptos y Certificados */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleAbrirInscriptos(ev)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-roncedo-navy font-bold text-xs transition-colors"
                  >
                    <Users className="w-4 h-4 text-roncedo-blue" />
                    <span>Ver Inscriptos, Pagos y Asistencia</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CREAR / EDITAR TALLER */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {eventoEditando ? 'Editar Actividad' : 'Nueva Actividad'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {eventoEditando ? 'Modificar Taller o Evento' : 'Publicar Taller o Evento'}
                </h3>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorForm && (
              <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{errorForm}</span>
              </div>
            )}

            <form onSubmit={handleGuardar} className="space-y-6">
              {/* Sección 1: Datos Generales */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  1. Información Principal
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre del Taller o Evento *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Taller Integral de Yoga y Bienestar"
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-roncedo-blue"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Quién lo organiza o dicta *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Prof. Valeria Mansilla"
                      value={formOrganizador}
                      onChange={(e) => setFormOrganizador(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-roncedo-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={formCategoria}
                      onChange={(e) => setFormCategoria(e.target.value as CategoriaEvento)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-roncedo-blue"
                    >
                      {CATEGORIAS_EVENTOS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Descripción / Temario del Curso
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detalles de la propuesta, materiales necesarios, dinámicas..."
                    value={formDescripcion}
                    onChange={(e) => setFormDescripcion(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-roncedo-blue"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lugar / Espacio
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Sede Social Roncedo / Sala de Lectura"
                      value={formLugar}
                      onChange={(e) => setFormLugar(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-roncedo-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cupo Máximo (opcional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ej: 25"
                      value={formCupoMaximo}
                      onChange={(e) => setFormCupoMaximo(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-roncedo-blue"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Modalidad y Horarios */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  2. Modalidad y Horarios
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormTipo('taller_recurrente')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      formTipo === 'taller_recurrente'
                        ? 'border-roncedo-blue bg-blue-50/50 text-roncedo-navy shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-xs font-bold block">Taller Semanal (Recurrente)</span>
                    <span className="text-[11px] text-slate-500">
                      Clases periódicas fijas (ej. Yoga, Ajedrez, Idiomas)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTipo('evento_unico')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      formTipo === 'evento_unico'
                        ? 'border-roncedo-blue bg-blue-50/50 text-roncedo-navy shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-xs font-bold block">Evento Único / Jornada</span>
                    <span className="text-[11px] text-slate-500">
                      Fecha puntual (ej. Charla debate, presentación de libro)
                    </span>
                  </button>
                </div>

                {formTipo === 'taller_recurrente' ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Días de Dictado de Clases:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {DIAS_SEMANA.map((dia) => {
                          const activo = formDiasDictado.includes(dia);
                          return (
                            <button
                              key={dia}
                              type="button"
                              onClick={() => toggleDiaDictado(dia)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                activo
                                  ? 'bg-roncedo-navy text-white shadow-sm'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {dia}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Horario de Cursado
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: 18:30 a 20:00 hs"
                        value={formHorarioRecurrente}
                        onChange={(e) => setFormHorarioRecurrente(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-roncedo-blue bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Fecha Inicio Ciclo (opcional)
                        </label>
                        <input
                          type="date"
                          value={formFechaInicioCiclo}
                          onChange={(e) => setFormFechaInicioCiclo(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Fecha Fin Ciclo (opcional)
                        </label>
                        <input
                          type="date"
                          value={formFechaFinCiclo}
                          onChange={(e) => setFormFechaFinCiclo(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Fecha de Realización *
                        </label>
                        <input
                          type="date"
                          value={formFechaRealizacion}
                          onChange={(e) => setFormFechaRealizacion(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Horario
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: 19:30 a 22:00 hs"
                          value={formHorario}
                          onChange={(e) => setFormHorario(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 3: Precios, Tramos y Beneficios */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      3. Precios y Escalonamiento por Fecha
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Podés fijar valores escalonados según la fecha en que el alumno se inscriba.
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
                    <input
                      type="checkbox"
                      checked={formEsGratuito}
                      onChange={(e) => setFormEsGratuito(e.target.checked)}
                      className="rounded text-roncedo-navy"
                    />
                    <span>Actividad Gratuita</span>
                  </label>
                </div>

                {!formEsGratuito && (
                  <div className="space-y-4">
                    {/* Lista dinámica de Tramos */}
                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-roncedo-navy">
                          Tramos de Precios por Fecha de Inscripción
                        </span>
                        <button
                          type="button"
                          onClick={handleAgregarTramo}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-roncedo-navy text-white text-[11px] font-bold shadow-sm hover:bg-[#153A65]"
                        >
                          <Plus className="w-3 h-3 text-roncedo-gold" />
                          <span>Agregar Tramo</span>
                        </button>
                      </div>

                      {formTramos.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">
                          No hay tramos configurados. Se cobrará el precio general.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {formTramos.map((tramo, idx) => (
                            <div
                              key={tramo.id}
                              className="bg-white p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                            >
                              <div className="sm:col-span-4">
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                  Etiqueta
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ej: Preventa 1"
                                  value={tramo.etiqueta || ''}
                                  onChange={(e) => handleActualizarTramo(tramo.id, 'etiqueta', e.target.value)}
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                                />
                              </div>

                              <div className="sm:col-span-4">
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                  Válido hasta
                                </label>
                                <input
                                  type="date"
                                  value={tramo.fecha_limite}
                                  onChange={(e) => handleActualizarTramo(tramo.id, 'fecha_limite', e.target.value)}
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                  Precio Base ($)
                                </label>
                                <input
                                  type="number"
                                  value={tramo.precio}
                                  onChange={(e) => handleActualizarTramo(tramo.id, 'precio', Number(e.target.value))}
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 font-bold"
                                />
                              </div>

                              <div className="sm:col-span-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleEliminarTramo(tramo.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tabla previa de liquidación para cada figura */}
                      {formTramos.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-200/80">
                          <span className="text-[10px] font-black uppercase text-slate-500 block mb-1.5">
                            Previsualización con descuentos para Socios Protectores:
                          </span>
                          <div className="overflow-x-auto">
                            <table className="w-full text-[11px] text-slate-700">
                              <thead>
                                <tr className="border-b border-blue-200 text-left text-[10px] text-slate-500 uppercase font-black">
                                  <th className="pb-1">Tramo</th>
                                  <th className="pb-1">Hasta</th>
                                  <th className="pb-1">No Socio</th>
                                  <th className="pb-1 text-amber-800">Bronce (-{formDescBronce}%)</th>
                                  <th className="pb-1 text-slate-800">Plata (-{formDescPlata}%)</th>
                                  <th className="pb-1 text-yellow-800">Oro (-{formDescOro}%)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {formTramos.map((t) => {
                                  const pBronce = Math.round(t.precio * (1 - formDescBronce / 100));
                                  const pPlata = Math.round(t.precio * (1 - formDescPlata / 100));
                                  const pOro = Math.round(t.precio * (1 - formDescOro / 100));
                                  return (
                                    <tr key={t.id} className="border-b border-blue-100/60">
                                      <td className="py-1 font-bold">{t.etiqueta || 'Tramo'}</td>
                                      <td className="py-1">{formatFechaArgentina(t.fecha_limite)}</td>
                                      <td className="py-1 font-black text-slate-900">${t.precio.toLocaleString('es-AR')}</td>
                                      <td className="py-1 font-bold text-amber-800">${pBronce.toLocaleString('es-AR')}</td>
                                      <td className="py-1 font-bold text-slate-800">${pPlata.toLocaleString('es-AR')}</td>
                                      <td className="py-1 font-bold text-yellow-800">${pOro.toLocaleString('es-AR')}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Precio Base General */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Precio Regular / Posterior a los tramos ($)
                        </label>
                        <input
                          type="number"
                          placeholder="Ej: 30000"
                          value={formPrecioBase}
                          onChange={(e) => setFormPrecioBase(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200"
                        />
                      </div>

                      {/* Descuentos Protectores */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Porcentajes de Descuento Socios Protectores
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] text-amber-800 font-bold block">Bronce %</span>
                            <input
                              type="number"
                              value={formDescBronce}
                              onChange={(e) => setFormDescBronce(Number(e.target.value))}
                              className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 text-center font-bold"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-700 font-bold block">Plata %</span>
                            <input
                              type="number"
                              value={formDescPlata}
                              onChange={(e) => setFormDescPlata(Number(e.target.value))}
                              className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 text-center font-bold"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-yellow-800 font-bold block">Oro %</span>
                            <input
                              type="number"
                              value={formDescOro}
                              onChange={(e) => setFormDescOro(Number(e.target.value))}
                              className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 text-center font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 4: Vías de Pago */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  4. Enlaces de Pago y Cobro
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Link de Pago (Mercado Pago u otro)
                    </label>
                    <input
                      type="url"
                      placeholder="https://mpago.la/..."
                      value={formLinkPago}
                      onChange={(e) => setFormLinkPago(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-roncedo-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alias o CBU para Transferencia Bancaria
                    </label>
                    <input
                      type="text"
                      placeholder="Alias: BIBLIOTECA.RONCEDO.MP"
                      value={formDatosTransferencia}
                      onChange={(e) => setFormDatosTransferencia(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-roncedo-blue"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 5: Fotografía e Imagen de Portada */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  5. Imagen de Portada (Opcional)
                </h4>

                <div className="flex items-center gap-4">
                  {formImagenUrl ? (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                      <Image
                        src={formImagenUrl}
                        alt="Portada"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <Calendar className="w-8 h-8" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={inputFileRef}
                      onChange={handleSubirFoto}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => inputFileRef.current?.click()}
                      disabled={subiendoImagen}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{subiendoImagen ? 'Comprimiendo...' : 'Subir Imagen de Portada'}</span>
                    </button>
                    {formImagenUrl && (
                      <button
                        type="button"
                        onClick={() => setFormImagenUrl('')}
                        className="block text-[11px] text-rose-600 font-bold hover:underline"
                      >
                        Quitar fotografía
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción del Modal */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-roncedo-navy hover:bg-[#153A65] text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {guardando ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-roncedo-gold" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>{guardando ? 'Guardando...' : eventoEditando ? 'Guardar Cambios' : 'Publicar Taller'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GESTIÓN DE INSCRIPTOS, PAGOS Y CERTIFICADOS */}
      {modalInscriptos && eventoSeleccionadoInscriptos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Control de Asistencia & Certificados
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {eventoSeleccionadoInscriptos.titulo}
                </h3>
                <p className="text-xs text-slate-600">
                  Organiza: {eventoSeleccionadoInscriptos.organizador}
                </p>
              </div>
              <button
                onClick={() => setModalInscriptos(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de métricas y exportación */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-4 text-xs font-bold">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Inscriptos</span>
                  <span className="text-base font-black text-roncedo-navy">{inscriptos.length}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Pagos Aprobados</span>
                  <span className="text-base font-black text-emerald-600">
                    {inscriptos.filter((i) => i.estado_pago === 'aprobado').length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Presentes</span>
                  <span className="text-base font-black text-blue-600">
                    {inscriptos.filter((i) => i.asistencia === 'presente').length}
                  </span>
                </div>
              </div>

              <button
                onClick={exportarInscriptosExcel}
                disabled={inscriptos.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Planilla a Excel</span>
              </button>
            </div>

            {/* Tabla de Alumnos */}
            {cargandoInscriptos ? (
              <div className="py-12 text-center">
                <RefreshCw className="w-6 h-6 text-roncedo-blue animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">Cargando inscriptos...</p>
              </div>
            ) : inscriptos.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Todavía no hay alumnos inscriptos en este taller.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500">
                    <tr>
                      <th className="p-3">Alumno</th>
                      <th className="p-3">Condición</th>
                      <th className="p-3">Monto / Tramo</th>
                      <th className="p-3">Pago</th>
                      <th className="p-3">Asistencia</th>
                      <th className="p-3">Certificado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inscriptos.map((ins) => (
                      <tr key={ins.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">
                            {ins.user_nombre} {ins.user_apellido}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {ins.user_email} {ins.user_dni ? `• DNI ${ins.user_dni}` : ''}
                          </span>
                        </td>

                        <td className="p-3">
                          {ins.user_tipo_protector === 'Oro' && (
                            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-extrabold border border-yellow-200">
                              Protector Oro (-10%)
                            </span>
                          )}
                          {ins.user_tipo_protector === 'Plata' && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold">
                              Protector Plata (-5%)
                            </span>
                          )}
                          {ins.user_tipo_protector === 'Bronce' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-200">
                              Protector Bronce (-2%)
                            </span>
                          )}
                          {(!ins.user_tipo_protector || ins.user_tipo_protector === 'no_socio') && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                              No socio
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <span className="font-black text-slate-900 block">
                            ${ins.monto_final.toLocaleString('es-AR')}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {ins.tramo_aplicado || 'Precio General'}
                          </span>
                        </td>

                        <td className="p-3">
                          <button
                            onClick={() => handleTogglePago(ins)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-colors flex items-center gap-1 ${
                              ins.estado_pago === 'aprobado'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {ins.estado_pago === 'aprobado' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-600" />
                            )}
                            <span>{ins.estado_pago === 'aprobado' ? 'Aprobado' : 'Pendiente'}</span>
                          </button>
                        </td>

                        <td className="p-3">
                          <select
                            value={ins.asistencia}
                            onChange={(e) => handleCambiarAsistencia(ins, e.target.value as any)}
                            className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-bold"
                          >
                            <option value="inscripto">Inscripto</option>
                            <option value="presente">Presente</option>
                            <option value="ausente">Ausente</option>
                          </select>
                        </td>

                        <td className="p-3">
                          {ins.asistencia === 'presente' ? (
                            <div className="flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
                              <Award className="w-3.5 h-3.5" />
                              <span>Habilitado ({ins.codigo_certificado?.slice(-6)})</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Requiere Presente</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setModalInscriptos(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR EVENTO */}
      {eventoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">
                ¿Eliminar {eventoAEliminar.titulo}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Esta acción dará de baja la actividad y eliminará la información asociada de la cartelera pública.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setEventoAEliminar(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarEliminar}
                disabled={eliminando}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
              >
                {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
