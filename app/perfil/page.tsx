'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { SexoOption } from '@/types';
import confetti from 'canvas-confetti';
import LOCALIDADES_DATA_RAW from '@/lib/data/localidadesArgentina.json';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  Save,
  AlertCircle,
  Camera,
  ArrowLeft,
  Trash2,
  Upload,
  Globe,
  Home,
  FileText,
  LogOut,
  Award,
  ShieldCheck,
  Sparkles,
  Check,
  ChevronRight,
  Info,
  X,
} from 'lucide-react';
import { formatFechaArgentina, isPerfilCompleto } from '@/lib/utils';
import { obtenerMedallaProtector } from '@/lib/payments/plans';
import { ClubBadge } from '@/components/perfil/ClubBadges';

const LOCALIDADES_POR_PROVINCIA: Record<string, string[]> = LOCALIDADES_DATA_RAW;

const PAISES = [
  { nombre: 'Argentina', codigo: '+54' },
  { nombre: 'Uruguay', codigo: '+598' },
  { nombre: 'Chile', codigo: '+56' },
  { nombre: 'Paraguay', codigo: '+595' },
  { nombre: 'Brasil', codigo: '+55' },
  { nombre: 'Bolivia', codigo: '+591' },
  { nombre: 'España', codigo: '+34' },
  { nombre: 'Estados Unidos', codigo: '+1' },
  { nombre: 'Italia', codigo: '+39' },
  { nombre: 'México', codigo: '+52' },
  { nombre: 'Colombia', codigo: '+57' },
  { nombre: 'Perú', codigo: '+51' },
  { nombre: 'Otro país', codigo: '+1' },
];

const PROVINCIAS_ARGENTINA = [
  'Córdoba',
  'Buenos Aires',
  'Ciudad Autónoma de Buenos Aires (CABA)',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

const CLUBES_LOCALES = [
  { id: 'Lautaro Roncedo', label: 'Lautaro Roncedo', sublabel: 'El orgullo albiceleste' },
  { id: 'Lutgardis Riveros', label: 'Lutgardis Riveros', sublabel: 'El clásico rival de Alcira Gigena' },
  { id: 'Me da lo mismo', label: 'Me da lo mismo', sublabel: 'Sin preferencia en el clásico local' },
];

const CLUBES_ARGENTINA = [
  'Boca Juniors',
  'River Plate',
  'Independiente',
  'Racing Club',
  'San Lorenzo',
  'Rosario Central',
  "Newell's Old Boys",
  'Huracán',
  'Vélez Sarsfield',
  'Estudiantes de La Plata',
  'Gimnasia de la Plata',
  'Talleres de Córdoba',
  'Belgrano de Córdoba',
  'Instituto de Córdoba',
  'Banfield',
];

function getLocalidadesParaProvincia(provincia: string): string[] {
  let key = provincia;
  if (provincia.includes('CABA') || provincia.includes('Ciudad Autónoma')) {
    key = 'Ciudad Autónoma de Buenos Aires';
  }
  const lista = LOCALIDADES_POR_PROVINCIA[key] || LOCALIDADES_POR_PROVINCIA['Córdoba'] || [];
  if (key === 'Córdoba') {
    const sinGigena = lista.filter((l) => l !== 'Alcira Gigena');
    return ['Alcira Gigena', ...sinGigena];
  }
  return lista;
}

export default function PerfilPage() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [perfilRecienCompletado, setPerfilRecienCompletado] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  // Formulario de datos personales
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [apellido, setApellido] = useState(user?.apellido || '');
  const [dni, setDni] = useState(user?.dni || '');
  const [fechaNacimiento, setFechaNacimiento] = useState(user?.fecha_nacimiento || '');
  const [sexo, setSexo] = useState<string>(user?.sexo || 'Prefiero no decirlo');
  const [whatsappCodigo, setWhatsappCodigo] = useState(user?.whatsapp_codigo || '+54');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [email, setEmail] = useState(user?.email || '');
  const [pais, setPais] = useState(user?.pais || 'Argentina');
  const [provincia, setProvincia] = useState(user?.provincia || 'Córdoba');
  const [provinciaManual, setProvinciaManual] = useState(user?.provincia || '');
  const [localidad, setLocalidad] = useState(user?.localidad || 'Alcira Gigena');
  const [esOtraLocalidad, setEsOtraLocalidad] = useState(false);
  const [localidadManual, setLocalidadManual] = useState('');
  const [codigoPostal, setCodigoPostal] = useState(user?.codigo_postal || '5811');
  const [barrio, setBarrio] = useState(user?.barrio || '');
  const [calle, setCalle] = useState(user?.calle || '');
  const [numero, setNumero] = useState(user?.numero || '');
  const [edificio, setEdificio] = useState(user?.edificio || '');
  const [torre, setTorre] = useState(user?.torre || '');
  const [piso, setPiso] = useState(user?.piso || '');
  const [dpto, setDpto] = useState(user?.dpto || '');

  // Nuevos campos: Preferencias deportivas
  const [hinchaClub, setHinchaClub] = useState<string>(user?.hincha_club || 'Lautaro Roncedo');
  const [hinchaNacional, setHinchaNacional] = useState<string[]>(user?.hincha_nacional || []);
  const [hinchaNacionalOtro, setHinchaNacionalOtro] = useState<string>(user?.hincha_nacional_otro || '');
  const [esOtroHinchaNacional, setEsOtroHinchaNacional] = useState<boolean>(
    Boolean(user?.hincha_nacional_otro || user?.hincha_nacional?.includes('Otro'))
  );

  const [observaciones, setObservaciones] = useState(user?.observaciones || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  const [guardadoExito, setGuardadoExito] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Referencia al formulario para scroll automático
  const formRef = useRef<HTMLDivElement>(null);
  const [modalAvisoIncompleto, setModalAvisoIncompleto] = useState<{
    abierto: boolean;
    destino: 'carnet' | 'socio-protector';
    planNombre?: string;
  }>({ abierto: false, destino: 'carnet' });

  // Lista en tiempo real de campos obligatorios que faltan completar
  const camposObligatoriosFaltantes = useMemo(() => {
    const faltantes: string[] = [];
    if (!nombre.trim()) faltantes.push('Nombre');
    if (!apellido.trim()) faltantes.push('Apellido');
    if (!dni.trim()) faltantes.push('DNI / Documento');
    if (!fechaNacimiento.trim()) faltantes.push('Fecha de Nacimiento');
    if (!whatsapp.trim()) faltantes.push('WhatsApp / Teléfono');
    if (!pais.trim()) faltantes.push('País');
    if (pais === 'Argentina' && !provincia.trim()) faltantes.push('Provincia');
    const locFinal = esOtraLocalidad ? localidadManual.trim() : localidad.trim();
    if (!locFinal) faltantes.push('Localidad');
    if (!codigoPostal.trim()) faltantes.push('Código postal');
    if (!barrio.trim()) faltantes.push('Barrio');
    if (!calle.trim()) faltantes.push('Calle');
    if (!numero.trim()) faltantes.push('Número');
    return faltantes;
  }, [
    nombre,
    apellido,
    dni,
    fechaNacimiento,
    whatsapp,
    pais,
    provincia,
    localidad,
    esOtraLocalidad,
    localidadManual,
    codigoPostal,
    barrio,
    calle,
    numero,
  ]);

  const perfilEstaCompleto =
    camposObligatoriosFaltantes.length === 0 && isPerfilCompleto(user);

  const handleVerCarnetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!perfilEstaCompleto) {
      setModalAvisoIncompleto({
        abierto: true,
        destino: 'carnet',
      });
      return;
    }
    router.push('/carnet');
  };

  const handleAdherirmeClick = (e: React.MouseEvent, plan: string) => {
    e.preventDefault();
    if (!perfilEstaCompleto) {
      setModalAvisoIncompleto({
        abierto: true,
        destino: 'socio-protector',
        planNombre: plan,
      });
      return;
    }
    router.push('/socio-protector');
  };

  const irACompletarDatos = () => {
    setModalAvisoIncompleto({ abierto: false, destino: 'carnet' });
    const primer = camposObligatoriosFaltantes[0];
    const elemId =
      primer === 'Nombre'
        ? 'input-nombre'
        : primer === 'Apellido'
        ? 'input-apellido'
        : primer === 'DNI / Documento'
        ? 'input-dni'
        : primer === 'Fecha de Nacimiento'
        ? 'input-fecha-nacimiento'
        : primer === 'WhatsApp / Teléfono'
        ? 'input-whatsapp'
        : primer === 'Barrio'
        ? 'input-barrio'
        : primer === 'Calle'
        ? 'input-calle'
        : primer === 'Número'
        ? 'input-numero'
        : 'formulario-datos-personales';

    setTimeout(() => {
      const elem = document.getElementById(elemId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        elem.focus();
      } else if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Localidades disponibles para la provincia seleccionada
  const localidadesDisponibles = useMemo(() => {
    return getLocalidadesParaProvincia(provincia);
  }, [provincia]);

  // Sincronizar estado cuando el usuario cambia
  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setApellido(user.apellido || '');
      setDni(user.dni || '');
      setFechaNacimiento(user.fecha_nacimiento || '');
      setSexo(user.sexo || 'Prefiero no decirlo');
      setWhatsappCodigo(user.whatsapp_codigo || '+54');
      setWhatsapp(user.whatsapp || '');
      setEmail(user.email || '');
      setPais(user.pais || 'Argentina');
      const provInicial = user.provincia || 'Córdoba';
      setProvincia(provInicial);
      const locInicial = user.localidad || 'Alcira Gigena';
      setLocalidad(locInicial);
      const lista = getLocalidadesParaProvincia(provInicial);
      if (locInicial && !lista.includes(locInicial)) {
        setEsOtraLocalidad(true);
        setLocalidadManual(locInicial);
      } else {
        setEsOtraLocalidad(false);
        setLocalidadManual('');
      }
      setCodigoPostal(
        user.codigo_postal ||
          (provInicial === 'Córdoba' && locInicial === 'Alcira Gigena' ? '5811' : '')
      );
      setBarrio(user.barrio || '');
      setCalle(user.calle || '');
      setNumero(user.numero || '');
      setEdificio(user.edificio || '');
      setTorre(user.torre || '');
      setPiso(user.piso || '');
      setDpto(user.dpto || '');

      setHinchaClub(user.hincha_club || 'Lautaro Roncedo');
      setHinchaNacional(user.hincha_nacional || []);
      setHinchaNacionalOtro(user.hincha_nacional_otro || '');
      setEsOtroHinchaNacional(
        Boolean(user.hincha_nacional_otro || user.hincha_nacional?.includes('Otro'))
      );

      setObservaciones(user.observaciones || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const esProtectorActivo =
    user?.es_socio_protector && user?.estado_socio_protector === 'activo';

  // Manejador para subir foto de perfil
  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe pesar menos de 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatarUrl(base64);
      await updateProfile({ avatar_url: base64 });
      setGuardadoExito(true);
      setTimeout(() => setGuardadoExito(false), 2500);
    };
    reader.readAsDataURL(file);
  };

  const handleEliminarFoto = async () => {
    setAvatarUrl('');
    await updateProfile({ avatar_url: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleToggleClubNacional = (club: string) => {
    if (hinchaNacional.includes(club)) {
      setHinchaNacional(hinchaNacional.filter((c) => c !== club));
    } else {
      setHinchaNacional([...hinchaNacional, club]);
    }
  };

  const handleGuardarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setGuardadoExito(false);

    try {
      if (!nombre.trim() || !apellido.trim()) {
        setError('Por favor indica tu Nombre y Apellido completo.');
        setGuardando(false);
        return;
      }
      if (!dni.trim()) {
        setError('Por favor indica tu DNI / Documento.');
        setGuardando(false);
        return;
      }
      if (!fechaNacimiento) {
        setError('Por favor selecciona tu Fecha de Nacimiento.');
        setGuardando(false);
        return;
      }
      if (!whatsapp.trim()) {
        setError('Por favor indica tu número de WhatsApp para contacto.');
        setGuardando(false);
        return;
      }
      if (pais === 'Argentina' && !provincia.trim()) {
        setError('Por favor selecciona tu Provincia.');
        setGuardando(false);
        return;
      }
      if (pais !== 'Argentina' && !provinciaManual.trim()) {
        setError('Por favor indica tu Provincia / Estado / Región.');
        setGuardando(false);
        return;
      }
      if (pais === 'Argentina' && esOtraLocalidad && !localidadManual.trim()) {
        setError('Por favor escribe el nombre de tu Localidad.');
        setGuardando(false);
        return;
      }
      if (!codigoPostal.trim()) {
        setError('Por favor indica tu Código Postal.');
        setGuardando(false);
        return;
      }
      if (!barrio.trim()) {
        setError('Por favor indica el Barrio de tu domicilio.');
        setGuardando(false);
        return;
      }
      if (!calle.trim() || !numero.trim()) {
        setError('Por favor indica la Calle y Número / Altura de tu domicilio.');
        setGuardando(false);
        return;
      }

      const provinciaFinal = pais === 'Argentina' ? provincia : provinciaManual;
      const localidadFinal =
        (pais === 'Argentina'
          ? esOtraLocalidad
            ? localidadManual.trim()
            : localidad.trim()
          : localidad.trim()) || 'Alcira Gigena';
      const domicilioCompleto = [
        calle.trim(),
        numero.trim(),
        edificio.trim() ? `Edif. ${edificio.trim()}` : '',
        torre.trim() ? `Torre ${torre.trim()}` : '',
        piso.trim() ? `Piso ${piso.trim()}` : '',
        dpto.trim() ? `Dpto ${dpto.trim()}` : '',
        barrio.trim() ? `B° ${barrio.trim()}` : '',
      ]
        .filter(Boolean)
        .join(', ');

      const yaEstabaCompleto = isPerfilCompleto(user);

      const res = await updateProfile({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni: dni.trim(),
        fecha_nacimiento: fechaNacimiento,
        sexo: sexo as SexoOption,
        whatsapp_codigo: whatsappCodigo,
        whatsapp: whatsapp.trim(),
        pais,
        provincia: provinciaFinal,
        localidad: localidadFinal,
        codigo_postal: codigoPostal.trim(),
        barrio: barrio.trim(),
        calle: calle.trim(),
        numero: numero.trim(),
        edificio: edificio.trim(),
        torre: torre.trim(),
        piso: piso.trim(),
        dpto: dpto.trim(),
        domicilio: domicilioCompleto,
        hincha_club: hinchaClub,
        hincha_nacional: hinchaNacional,
        hincha_nacional_otro: esOtroHinchaNacional ? hinchaNacionalOtro.trim() : undefined,
        observaciones: observaciones.trim(),
        avatar_url: avatarUrl,
        datos_completados: true,
      });

      if (!res.success) {
        setError(res.error || 'Error al actualizar datos');
        return;
      }

      setGuardadoExito(true);

      if (!yaEstabaCompleto) {
        setPerfilRecienCompletado(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          router.push('/home');
        }, 1800);
      } else {
        setTimeout(() => setGuardadoExito(false), 3500);
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-28 pt-6 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navegación Superior */}
        <div className="flex items-center justify-between">
          {isPerfilCompleto(user) ? (
            <Link
              href="/home"
              className="inline-flex items-center gap-2 text-xs font-bold text-roncedo-navy hover:text-roncedo-celesteDark transition-colors bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-blue-200/80 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-roncedo-celeste" />
              <span>Volver al Inicio</span>
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-100/80 px-3.5 py-2 rounded-xl border border-amber-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Primer Ingreso • Ficha Obligatoria</span>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
              Biblioteca Roncedo • Datos Personales
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-red-700 bg-white/90 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 transition-colors shadow-sm"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Banner de Primer Ingreso cuando faltan datos obligatorios */}
        {!isPerfilCompleto(user) && (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-3xl p-5 text-amber-950 shadow-md flex items-start gap-3.5 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-black text-amber-950">
                Primer ingreso: Completa tus Datos Personales Obligatorios
              </h3>
              <p className="text-xs text-amber-900 leading-relaxed">
                Para habilitar tu acceso al catálogo de libros, préstamos, actas y emitir tu Carnet Digital con código QR, por favor completa todos los campos marcados con asterisco (*).
              </p>
            </div>
          </div>
        )}

        {/* Cabecera de Perfil con Subida de Foto */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-blue-200/90 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar interactivo */}
          <div className="relative group">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-[#EAF3FD] border-3 border-roncedo-celeste shadow-md flex-shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={user.nombre}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#102A4E] to-[#5B9BE5] text-white text-3xl font-bold uppercase">
                  {user.nombre.charAt(0)}{user.apellido.charAt(0) || 'R'}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-roncedo-celeste hover:bg-roncedo-celesteDark text-white p-2.5 rounded-full shadow-md transition-all hover:scale-110 border-2 border-white"
              title="Subir o cambiar foto"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFotoUpload}
              className="hidden"
            />
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-black text-slate-900">
                {user.nombre} {user.apellido}
              </h1>

              {/* Distinción Institucional Actualizada */}
              {user.role === 'admin' ? (
                <span className="bg-purple-100 text-purple-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-300">
                  Administrador
                </span>
              ) : esProtectorActivo ? (
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 shadow-xs">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Socio Protector {user.tipo_socio_protector || 'Bronce'}</span>
                </span>
              ) : (
                <span className="bg-blue-50 text-[#1E40AF] text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                  Usuario de la App (Servicios restringidos)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{user.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              Miembro desde: {new Date(user.created_at).toLocaleDateString('es-AR')}
            </p>

            {/* Acciones de Foto */}
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-roncedo-celeste hover:bg-roncedo-celesteDark px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{avatarUrl ? 'Cambiar Foto' : 'Subir Foto'}</span>
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleEliminarFoto}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Quitar</span>
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleVerCarnetClick}
            className="bg-roncedo-navy hover:bg-[#1A457D] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            title="Ver Carnet Digital"
          >
            <CreditCard className="w-4 h-4 text-roncedo-gold" />
            <span>Ver Carnet</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* FORMULARIO DE DATOS PERSONALES                                      */}
        {/* =================================================================== */}
        <div
          ref={formRef}
          id="formulario-datos-personales"
          className="bg-[#EAF3FD] rounded-3xl p-6 sm:p-8 shadow-card border border-[#BFDBFE]"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-200/70">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Mis Datos Personales
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Mantén tus datos actualizados para contacto, carnet y gestión de préstamos de la Biblioteca Roncedo
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {guardadoExito && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span className="font-bold">
                {perfilRecienCompletado
                  ? '¡Excelente! Tus datos personales se han guardado exitosamente.'
                  : 'Datos personales actualizados correctamente.'}
              </span>
            </div>
          )}

          <form onSubmit={handleGuardarDatos} className="space-y-5">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nombre *
                </label>
                <input
                  id="input-nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Apellido *
                </label>
                <input
                  id="input-apellido"
                  type="text"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Tu apellido"
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>
            </div>

            {/* DNI, Fecha de Nacimiento y Sexo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  DNI / Documento *
                </label>
                <input
                  id="input-dni"
                  type="text"
                  required
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Sin puntos ni espacios"
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Fecha de Nacimiento *
                </label>
                <input
                  id="input-fecha-nacimiento"
                  type="date"
                  required
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sexo / Género *
                </label>
                <select
                  required
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                >
                  <option value="Mujer">Mujer</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                </select>
              </div>
            </div>

            {/* Teléfono / WhatsApp y Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  WhatsApp / Celular de Contacto *
                </label>
                <div className="flex gap-2">
                  <select
                    value={whatsappCodigo}
                    onChange={(e) => setWhatsappCodigo(e.target.value)}
                    className="w-28 bg-white px-2.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste text-xs font-semibold text-slate-800 shadow-sm"
                  >
                    {PAISES.map((p) => (
                      <option key={p.nombre} value={p.codigo}>
                        {p.codigo} ({p.nombre})
                      </option>
                    ))}
                  </select>
                  <input
                    id="input-whatsapp"
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ej: 3585123456"
                    className="flex-1 bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Número activo para notificaciones y avisos de la biblioteca.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Correo Electrónico
                  </label>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                    No modificable
                  </span>
                </div>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-slate-100 text-slate-600 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm cursor-not-allowed shadow-inner"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Asociado a tu cuenta de acceso institucional.
                </p>
              </div>
            </div>

            {/* Domicilio: País y Provincia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  País *
                </label>
                <select
                  required
                  value={pais}
                  onChange={(e) => {
                    const nuevoPais = e.target.value;
                    setPais(nuevoPais);
                    const match = PAISES.find((p) => p.nombre === nuevoPais);
                    if (match) setWhatsappCodigo(match.codigo);
                  }}
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                >
                  {PAISES.map((p) => (
                    <option key={p.nombre} value={p.nombre}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Provincia *
                </label>
                {pais === 'Argentina' ? (
                  <select
                    required
                    value={provincia}
                    onChange={(e) => {
                      const nuevaProv = e.target.value;
                      setProvincia(nuevaProv);
                      const nuevasLocs = getLocalidadesParaProvincia(nuevaProv);
                      if (nuevaProv === 'Córdoba') {
                        setLocalidad('Alcira Gigena');
                        setCodigoPostal('5811');
                      } else if (nuevasLocs.length > 0) {
                        setLocalidad(nuevasLocs[0]);
                      }
                      setEsOtraLocalidad(false);
                      setLocalidadManual('');
                    }}
                    className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                  >
                    {PROVINCIAS_ARGENTINA.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={provinciaManual}
                    onChange={(e) => setProvinciaManual(e.target.value)}
                    placeholder="Estado / Región / Provincia"
                    className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                  />
                )}
              </div>
            </div>

            {/* Localidad y Código Postal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Localidad *
                </label>
                {pais === 'Argentina' ? (
                  <div className="space-y-2">
                    <select
                      value={esOtraLocalidad ? '__otra__' : localidad}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__otra__') {
                          setEsOtraLocalidad(true);
                        } else {
                          setEsOtraLocalidad(false);
                          setLocalidad(val);
                          if (val === 'Alcira Gigena' && provincia === 'Córdoba') {
                            setCodigoPostal('5811');
                          }
                        }
                      }}
                      className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                    >
                      {localidadesDisponibles.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                      <option value="__otra__">
                        ➕ Otra localidad (escribir manualmente)...
                      </option>
                    </select>

                    {esOtraLocalidad && (
                      <input
                        type="text"
                        required
                        value={localidadManual}
                        onChange={(e) => setLocalidadManual(e.target.value)}
                        placeholder="Escribe tu localidad aquí"
                        className="w-full bg-white px-3.5 py-2 rounded-xl border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-roncedo-celeste shadow-sm"
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    value={localidad}
                    onChange={(e) => setLocalidad(e.target.value)}
                    placeholder="Ciudad o Municipio"
                    className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                  />
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  {pais === 'Argentina'
                    ? `Localidades desplegadas de ${provincia} (${localidadesDisponibles.length} en padrón oficial).`
                    : 'Ingresa la localidad correspondiente a tu país.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Código Postal *
                </label>
                <input
                  type="text"
                  required
                  value={codigoPostal}
                  onChange={(e) => setCodigoPostal(e.target.value)}
                  placeholder="Ej: 5811"
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Código postal de tu localidad (ej: 5811 para Alcira Gigena).
                </p>
              </div>
            </div>

            {/* Barrio, Calle y Número / Altura */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Barrio *
                </label>
                <input
                  id="input-barrio"
                  type="text"
                  required
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  placeholder="Ej: Centro, San Vicente..."
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Calle *
                </label>
                <input
                  id="input-calle"
                  type="text"
                  required
                  value={calle}
                  onChange={(e) => setCalle(e.target.value)}
                  placeholder="Ej: San Martín, Córdoba..."
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Número / Altura *
                </label>
                <input
                  id="input-numero"
                  type="text"
                  required
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Ej: 128 o S/N"
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Edificio, Torre, Piso y Dpto */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Edificio
                </label>
                <input
                  type="text"
                  value={edificio}
                  onChange={(e) => setEdificio(e.target.value)}
                  placeholder="Ej: Alborada..."
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Torre
                </label>
                <input
                  type="text"
                  value={torre}
                  onChange={(e) => setTorre(e.target.value)}
                  placeholder="Ej: 1, A..."
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Piso
                </label>
                <input
                  type="text"
                  value={piso}
                  onChange={(e) => setPiso(e.target.value)}
                  placeholder="Ej: 3, PB..."
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Dpto
                </label>
                <input
                  type="text"
                  value={dpto}
                  onChange={(e) => setDpto(e.target.value)}
                  placeholder="Ej: B, 4..."
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>
            </div>

            {/* ================================================================= */}
            {/* NUEVA SECCIÓN: PREFERENCIAS DEPORTIVAS E IDENTIDAD (ANTES DE OBS) */}
            {/* ================================================================= */}
            <div className="pt-3 border-t border-blue-200/80 space-y-5">
              {/* Pregunta 1: Soy hincha del Club (solo una opción) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-roncedo-celeste" />
                    <span>Soy hincha del Club:</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CLUBES_LOCALES.map((cl) => {
                    const seleccionado = hinchaClub === cl.id;
                    return (
                      <button
                        key={cl.id}
                        type="button"
                        onClick={() => setHinchaClub(cl.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                          seleccionado
                            ? cl.id === 'Lautaro Roncedo'
                              ? 'bg-blue-50 border-[#1B5699] ring-2 ring-[#1B5699] shadow-sm'
                              : cl.id === 'Lutgardis Riveros'
                              ? 'bg-slate-50 border-slate-900 ring-2 ring-slate-900 shadow-sm'
                              : 'bg-slate-100 border-slate-500 ring-2 ring-slate-500 shadow-sm'
                            : 'bg-white border-blue-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
                          {cl.id === 'Me da lo mismo' ? (
                            <span className="text-2xl">🤝</span>
                          ) : (
                            <ClubBadge nombre={cl.id} className="w-8 h-8" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-black text-slate-900 block truncate">
                            {cl.label}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {cl.sublabel}
                          </span>
                        </div>
                        {seleccionado && (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pregunta 2: En el país soy hincha del Club (más de una opción) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>En el país soy hincha del Club:</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {CLUBES_ARGENTINA.map((club) => {
                    const seleccionado = hinchaNacional.includes(club);
                    return (
                      <button
                        key={club}
                        type="button"
                        onClick={() => handleToggleClubNacional(club)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          seleccionado
                            ? 'bg-blue-50 border-roncedo-celeste ring-2 ring-roncedo-celeste font-bold text-roncedo-navy shadow-xs'
                            : 'bg-white border-blue-200/80 hover:bg-slate-50 text-slate-700 text-xs font-semibold'
                        }`}
                      >
                        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                          <ClubBadge nombre={club} className="w-5 h-5" />
                        </div>
                        <span className="text-xs truncate flex-1">{club}</span>
                        {seleccionado && (
                          <span className="w-4 h-4 rounded-full bg-roncedo-celeste text-white flex items-center justify-center flex-shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Opción personalizada: Otro. ¿Cuál? */}
                  <button
                    type="button"
                    onClick={() => setEsOtroHinchaNacional(!esOtroHinchaNacional)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      esOtroHinchaNacional
                        ? 'bg-blue-50 border-roncedo-celeste ring-2 ring-roncedo-celeste font-bold text-roncedo-navy shadow-xs'
                        : 'bg-white border-blue-200/80 hover:bg-slate-50 text-slate-700 text-xs font-semibold'
                    }`}
                  >
                    <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                      <ClubBadge nombre="Otro" className="w-5 h-5" />
                    </div>
                    <span className="text-xs truncate flex-1">Otro. ¿Cuál?</span>
                    {esOtroHinchaNacional && (
                      <span className="w-4 h-4 rounded-full bg-roncedo-celeste text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                </div>

                {/* Input de texto para Otro */}
                {esOtroHinchaNacional && (
                  <div className="pt-1 animate-fade-in">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      ¿Cuál otro club del país?
                    </label>
                    <input
                      type="text"
                      value={hinchaNacionalOtro}
                      onChange={(e) => setHinchaNacionalOtro(e.target.value)}
                      placeholder="Escribe el nombre de tu club..."
                      className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste text-sm text-slate-900 shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Observaciones */}
            <div className="pt-2 border-t border-blue-200/80">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Observaciones
              </label>
              <textarea
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Aclaraciones de domicilio, referencias, horarios de preferencia para retiro de libros, etc."
                className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
              />
            </div>

            {/* =================================================================== */}
            {/* CONDICIÓN INSTITUCIONAL Y CATEGORÍAS DE SOCIO PROTECTOR            */}
            {/* (Debajo de Observaciones y antes de Guardar Cambios)               */}
            {/* =================================================================== */}
            <div className="pt-6 border-t border-blue-200/80 space-y-4">
              {esProtectorActivo ? (
                /* USUARIO YA ADHERIDO COMO SOCIO PROTECTOR */
                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-blue-200 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-20 flex-shrink-0 drop-shadow-md">
                        <Image
                          src={
                            user.tipo_socio_protector
                              ? `/images/socio-protector/medalla-${user.tipo_socio_protector.toLowerCase()}.png`
                              : '/images/socio-protector/medalla-oro.png'
                          }
                          alt="Medalla Socio Protector"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900">
                            Socio Protector {user.tipo_socio_protector}
                          </h3>
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                            Activo • Membresía Plena
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Tu colaboración mensual sostiene activamente la Biblioteca y el Club Roncedo. Tenés acceso total a todos los servicios, préstamos de libros, actas históricas y descuentos exclusivos.
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/socio-protector"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0F284B] to-[#1E6091] hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex-shrink-0"
                    >
                      <span>Ver o Cambiar Plan</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-4">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Categoría Activa
                      </span>
                      <span className="font-extrabold text-slate-900 mt-0.5 block text-sm">
                        {user.tipo_socio_protector}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Aporte Mensual
                      </span>
                      <span className="font-extrabold text-emerald-700 mt-0.5 block text-sm">
                        ${user.importe_mensual?.toLocaleString('es-AR') || '2.000'} / mes
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Beneficio en Tienda
                      </span>
                      <span className="font-extrabold text-amber-700 mt-0.5 block text-sm">
                        {user.tipo_socio_protector === 'Bronce' && '2% Descuento'}
                        {user.tipo_socio_protector === 'Plata' && '5% Descuento'}
                        {user.tipo_socio_protector === 'Oro' && '10% Descuento'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Acceso a la App
                      </span>
                      <span className="font-semibold text-slate-800 mt-0.5 block text-sm">
                        {user.tipo_socio_protector === 'Oro'
                          ? 'Todas las secciones'
                          : user.tipo_socio_protector === 'Plata'
                          ? 'Acceso ampliado'
                          : 'Acceso parcial'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* CONDICIÓN ACTUAL: USUARIO DE LA APP (NO PROTECTOR) */
                <div className="space-y-6">
                  {/* Rectángulo grande que ocupa el tamaño de ancho de los otros tres que están debajo */}
                  <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-blue-200/90 space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-roncedo-navy flex items-center justify-center border border-blue-200 flex-shrink-0">
                        <User className="w-5 h-5 text-roncedo-celeste" />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Registrado como usuario
                      </h3>
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Servicios restringidos
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Tu cuenta puede acceder a determinados sectores de la App de manera restringida. El sostenimiento de la Biblioteca Roncedo y el acceso a todos los servicios se canaliza a través del programa voluntario de <strong>Socios Protectores</strong>.
                    </p>
                  </div>

                  {/* Título de categorías en dos líneas con destaque institucional */}
                  <div className="text-center py-2 space-y-1">
                    <div className="text-sm sm:text-base font-extrabold text-slate-800 tracking-normal flex items-center justify-center gap-2">
                      <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <span>
                        Conocé las 3 categorías de{' '}
                        <strong className="text-roncedo-navy font-black underline decoration-amber-400 decoration-2 underline-offset-4">
                          Socio Protector
                        </strong>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-600">
                      para acceder a todos los beneficios
                    </p>
                  </div>

                  {/* Las 3 tarjetas de categorías: Bronce, Plata, Oro (los 3 rectángulos en el mismo estilo) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* SOCIO PROTECTOR BRONCE */}
                    <div className="rounded-3xl border border-blue-200/90 bg-white p-5 flex flex-col justify-between shadow-card hover:shadow-lg transition-all relative">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                            Socio Protector Bronce
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                            Aporte Base
                          </span>
                        </div>

                        {/* Insignia grande conservando la cinta oficial */}
                        <div className="flex justify-center my-3">
                          <div className="relative w-24 h-32 drop-shadow-md transition-transform hover:scale-105">
                            <Image
                              src="/images/socio-protector/medalla-bronce.png"
                              alt="Medalla Socio Protector Bronce oficial"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>

                        <div className="text-center pb-3 border-b border-slate-100">
                          <div className="text-2xl font-black text-slate-900">
                            $2.000 <span className="text-xs font-normal text-slate-500">/ mes</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                            Aporte base para apoyar las compras regulares de nuevos libros y material infantil.
                          </p>
                        </div>

                        {/* Píldoras destacadas de resumen */}
                        <div className="mt-3 flex flex-col gap-1.5 text-left">
                          <div className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 flex items-center gap-1.5">
                            <span className="text-xs">📱</span>
                            <span><strong>Acceso parcial a las secciones de la App</strong></span>
                          </div>
                          <div className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                            <span className="text-xs">🏷️</span>
                            <span><strong>2% OFF</strong> en compras y eventos</span>
                          </div>
                          <div className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-roncedo-navy border border-blue-200 flex items-center gap-1.5">
                            <span className="text-xs">📚</span>
                            <span><strong>Hasta 4 libros al año</strong></span>
                          </div>
                        </div>

                        {/* Lista completa de beneficios */}
                        <div className="pt-3 space-y-1.5">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Detalles incluidos:
                          </p>
                          <ul className="text-xs text-slate-700 space-y-2">
                            <li className="font-bold text-slate-900 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Acceso parcial a las secciones de la App</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>2% de descuento en compras y eventos publicados</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Préstamos de hasta 4 libros al año</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Carnet Digital con insignia Bronce</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Acceso al boletín digital y rendiciones semestrales</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Débito automático mensual simple y seguro vía Mercado Pago</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Botón rectangular en el mismo color institucional para las tres */}
                      <button
                        type="button"
                        onClick={(e) => handleAdherirmeClick(e, 'Bronce')}
                        className="mt-5 w-full py-3 px-3.5 rounded-2xl text-xs font-black text-center flex items-center justify-center gap-2 bg-gradient-to-r from-[#0F284B] to-[#1E5699] hover:from-[#153f75] hover:to-[#2563EB] text-white shadow-md transition-all active:scale-98 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Adherirme como Socio Protector Bronce</span>
                      </button>
                    </div>

                    {/* SOCIO PROTECTOR PLATA */}
                    <div className="rounded-3xl border border-blue-200/90 bg-white p-5 flex flex-col justify-between shadow-card hover:shadow-lg transition-all relative">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                            Socio Protector Plata
                          </span>
                          <span className="text-[10px] font-bold text-blue-900 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-300">
                            Más Elegido
                          </span>
                        </div>

                        {/* Insignia grande conservando la cinta oficial */}
                        <div className="flex justify-center my-3">
                          <div className="relative w-24 h-32 drop-shadow-md transition-transform hover:scale-105">
                            <Image
                              src="/images/socio-protector/medalla-plata.png"
                              alt="Medalla Socio Protector Plata oficial"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>

                        <div className="text-center pb-3 border-b border-slate-100">
                          <div className="text-2xl font-black text-slate-900">
                            $5.000 <span className="text-xs font-normal text-slate-500">/ mes</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                            Aporte intermedio que impulsa talleres, eventos culturales y conservación histórica.
                          </p>
                        </div>

                        {/* Píldoras destacadas de resumen */}
                        <div className="mt-3 flex flex-col gap-1.5 text-left">
                          <div className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 flex items-center gap-1.5">
                            <span className="text-xs">📱</span>
                            <span><strong>Acceso ampliado a las secciones de la App</strong></span>
                          </div>
                          <div className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                            <span className="text-xs">🏷️</span>
                            <span><strong>5% OFF</strong> en compras y eventos</span>
                          </div>
                          <div className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-roncedo-navy border border-blue-200 flex items-center gap-1.5">
                            <span className="text-xs">📚</span>
                            <span><strong>Hasta 10 libros al año</strong></span>
                          </div>
                        </div>

                        {/* Lista completa de beneficios */}
                        <div className="pt-3 space-y-1.5">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Detalles incluidos:
                          </p>
                          <ul className="text-xs text-slate-700 space-y-2">
                            <li className="font-bold text-slate-900 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Acceso ampliado a las secciones de la App</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>5% de descuento en compras y eventos publicados</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Préstamos de hasta 10 libros al año</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Carnet Digital con insignia Plata</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Prioridad de reserva en talleres literarios y actividades del club</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Aporte al fondo de digitalización de actas y fotos antiguas</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Débito automático mensual simple y seguro vía Mercado Pago</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Botón rectangular en el mismo color institucional para las tres */}
                      <button
                        type="button"
                        onClick={(e) => handleAdherirmeClick(e, 'Plata')}
                        className="mt-5 w-full py-3 px-3.5 rounded-2xl text-xs font-black text-center flex items-center justify-center gap-2 bg-gradient-to-r from-[#0F284B] to-[#1E5699] hover:from-[#153f75] hover:to-[#2563EB] text-white shadow-md transition-all active:scale-98 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Adherirme como Socio Protector Plata</span>
                      </button>
                    </div>

                    {/* SOCIO PROTECTOR ORO */}
                    <div className="rounded-3xl border border-blue-200/90 bg-white p-5 flex flex-col justify-between shadow-card hover:shadow-lg transition-all relative">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                            Socio Protector Oro
                          </span>
                          <span className="text-[10px] font-black uppercase text-amber-950 bg-amber-400 px-2.5 py-0.5 rounded-full shadow-xs">
                            Máxima Distinción
                          </span>
                        </div>

                        {/* Insignia grande conservando la cinta oficial */}
                        <div className="flex justify-center my-3">
                          <div className="relative w-24 h-32 drop-shadow-md transition-transform hover:scale-105">
                            <Image
                              src="/images/socio-protector/medalla-oro.png"
                              alt="Medalla Socio Protector Oro oficial"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>

                        <div className="text-center pb-3 border-b border-slate-100">
                          <div className="text-2xl font-black text-slate-900">
                            $10.000 <span className="text-xs font-normal text-slate-500">/ mes</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                            Máximo aporte solidario para obras de infraestructura, equipamiento y patrimonio de Alcira Gigena.
                          </p>
                        </div>

                        {/* Píldoras destacadas de resumen */}
                        <div className="mt-3 flex flex-col gap-1.5 text-left">
                          <div className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 flex items-center gap-1.5">
                            <span className="text-xs">📱</span>
                            <span><strong>Acceso a todas las secciones de la App</strong></span>
                          </div>
                          <div className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                            <span className="text-xs">🏷️</span>
                            <span><strong>10% OFF</strong> en compras y eventos</span>
                          </div>
                          <div className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-roncedo-navy border border-blue-200 flex items-center gap-1.5">
                            <span className="text-xs">📚</span>
                            <span><strong>Préstamos de libros sin límites</strong></span>
                          </div>
                        </div>

                        {/* Lista completa de beneficios */}
                        <div className="pt-3 space-y-1.5">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Detalles incluidos:
                          </p>
                          <ul className="text-xs text-slate-700 space-y-2">
                            <li className="font-bold text-slate-900 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Acceso a todas las secciones de la App</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>10% de descuento en compras y eventos publicados</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Préstamo ilimitado de libros</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Carnet Digital con insignia Oro</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Mención de honor en la memoria institucional anual</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Acceso preferencial a presentaciones de libros y galas culturales</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>Débito automático mensual simple y seguro vía Mercado Pago</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Botón rectangular en el mismo color institucional para las tres */}
                      <button
                        type="button"
                        onClick={(e) => handleAdherirmeClick(e, 'Oro')}
                        className="mt-5 w-full py-3 px-3.5 rounded-2xl text-xs font-black text-center flex items-center justify-center gap-2 bg-gradient-to-r from-[#0F284B] to-[#1E5699] hover:from-[#153f75] hover:to-[#2563EB] text-white shadow-md transition-all active:scale-98 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Adherirme como Socio Protector Oro</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botón Guardar Cambios */}
            <div className="pt-4 border-t border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Los datos quedan protegidos y bajo custodia de la Biblioteca Roncedo
              </span>
              <button
                type="submit"
                disabled={guardando}
                className="w-full sm:w-auto bg-roncedo-navy hover:bg-[#1A457D] text-white font-bold text-xs sm:text-sm py-3 px-7 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>{guardando ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* =================================================================== */}
        {/* MODAL DE AVISO: CAMPOS OBLIGATORIOS PENDIENTES                      */}
        {/* =================================================================== */}
        {modalAvisoIncompleto.abierto && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-blue-200 relative overflow-hidden animate-scale-in">
              {/* Botón cerrar */}
              <button
                type="button"
                onClick={() => setModalAvisoIncompleto({ abierto: false, destino: 'carnet' })}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                title="Cerrar aviso"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                {/* Icono de advertencia institucional */}
                <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-sm">
                  <AlertCircle className="w-8 h-8" />
                </div>

                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300">
                  Ficha Obligatoria Incompleta
                </span>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2.5">
                  {modalAvisoIncompleto.destino === 'carnet'
                    ? 'Completá tus datos para ver tu Carnet'
                    : `Completá tus datos para ser Socio Protector ${
                        modalAvisoIncompleto.planNombre || ''
                      }`}
                </h3>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Para emitir tu credencial digital con código QR oficial y acceder a todos los beneficios institucionales, la Biblioteca Roncedo requiere que completes y guardes los campos marcados con asterisco (*).
                </p>

                {camposObligatoriosFaltantes.length > 0 && (
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                      Campos requeridos pendientes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {camposObligatoriosFaltantes.slice(0, 6).map((c, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-100/90 text-amber-900 border border-amber-200"
                        >
                          {c}
                        </span>
                      ))}
                      {camposObligatoriosFaltantes.length > 6 && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-200 text-slate-700">
                          +{camposObligatoriosFaltantes.length - 6} más
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={irACompletarDatos}
                    className="w-full py-3 px-4 bg-roncedo-navy hover:bg-[#1A457D] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-roncedo-gold" />
                    <span>Completar mis datos ahora</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalAvisoIncompleto({ abierto: false, destino: 'carnet' })}
                    className="w-full sm:w-auto py-2.5 px-4 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
