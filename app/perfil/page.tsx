'use client';

import React, { useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { CategoriaSocio, SexoOption } from '@/types';
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
  Send,
  AlertCircle,
  Camera,
  Trash2,
  Upload,
  Globe,
  Home,
  FileText,
  Heart,
} from 'lucide-react';
import { formatFechaArgentina } from '@/lib/utils';
import { obtenerMedallaProtector } from '@/lib/payments/plans';

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

function getLocalidadesParaProvincia(provincia: string): string[] {
  let key = provincia;
  if (provincia.includes('CABA') || provincia.includes('Ciudad Autónoma')) {
    key = 'Ciudad Autónoma de Buenos Aires';
  }
  const lista = LOCALIDADES_POR_PROVINCIA[key] || LOCALIDADES_POR_PROVINCIA['Córdoba'] || [];
  // Asegurarnos de que si es Córdoba, Alcira Gigena esté en el tope
  if (key === 'Córdoba') {
    const sinGigena = lista.filter(l => l !== 'Alcira Gigena');
    return ['Alcira Gigena', ...sinGigena];
  }
  return lista;
}

export default function PerfilPage() {
  const { user, updateProfile, submitSolicitudSocio, solicitudes } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [observaciones, setObservaciones] = useState(user?.observaciones || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  // Localidades disponibles para la provincia seleccionada
  const localidadesDisponibles = useMemo(() => {
    return getLocalidadesParaProvincia(provincia);
  }, [provincia]);

  // Sincronizar estado cuando el usuario cambia (ej: cambio de sesión o inicio con Gmail)
  React.useEffect(() => {
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
      setCodigoPostal(user.codigo_postal || (provInicial === 'Córdoba' && locInicial === 'Alcira Gigena' ? '5811' : ''));
      setBarrio(user.barrio || '');
      setCalle(user.calle || '');
      setNumero(user.numero || '');
      setObservaciones(user.observaciones || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const [categoriaDeseada, setCategoriaDeseada] = useState<CategoriaSocio>('Activo');
  const [guardadoExito, setGuardadoExito] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Buscar si tiene solicitud pendiente
  const miSolicitudPendiente = solicitudes.find(
    (s) => s.user_id === user?.id && s.estado === 'pendiente'
  );

  const isSocio = user?.role === 'socio' || user?.role === 'admin';

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
      // Guardar inmediatamente en el perfil
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

  const handleGuardarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setGuardadoExito(false);

    try {
      const provinciaFinal = pais === 'Argentina' ? provincia : provinciaManual;
      const localidadFinal = (
        pais === 'Argentina'
          ? (esOtraLocalidad ? localidadManual.trim() : localidad.trim())
          : localidad.trim()
      ) || 'Alcira Gigena';
      const domicilioCompleto = `${calle} ${numero}${barrio ? `, B° ${barrio}` : ''}`.trim();

      const res = await updateProfile({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni: dni.trim(),
        fecha_nacimiento: fechaNacimiento,
        sexo: sexo as SexoOption,
        whatsapp_codigo: whatsappCodigo,
        whatsapp: whatsapp.trim(),
        email: email.trim(),
        pais,
        provincia: provinciaFinal,
        localidad: localidadFinal,
        codigo_postal: codigoPostal.trim(),
        barrio: barrio.trim(),
        calle: calle.trim(),
        numero: numero.trim(),
        domicilio: domicilioCompleto,
        observaciones: observaciones.trim(),
        avatar_url: avatarUrl,
      });

      if (!res.success) {
        setError(res.error || 'Error al actualizar datos');
        return;
      }

      setGuardadoExito(true);
      setTimeout(() => setGuardadoExito(false), 3500);
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const handleSolicitarSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!dni.trim() || !whatsapp.trim() || (!calle.trim() && !numero.trim())) {
      setError('Por favor completa DNI, WhatsApp, calle y número antes de solicitar ser socio.');
      return;
    }

    setGuardando(true);
    try {
      const localidadFinal = (
        pais === 'Argentina'
          ? (esOtraLocalidad ? localidadManual.trim() : localidad.trim())
          : localidad.trim()
      ) || 'Alcira Gigena';
      const domicilioCompleto = `${calle} ${numero}${barrio ? `, B° ${barrio}` : ''}`.trim();
      const res = await submitSolicitudSocio({
        dni,
        telefono: `${whatsappCodigo} ${whatsapp}`,
        domicilio: domicilioCompleto,
        localidad: localidadFinal,
        codigo_postal: codigoPostal.trim(),
        fecha_nacimiento: fechaNacimiento,
        categoria: categoriaDeseada,
      });

      if (!res.success) {
        setError(res.error || 'No se pudo enviar la solicitud');
        return;
      }

      setSolicitudEnviada(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setError(err.message || 'Error enviando solicitud');
    } finally {
      setGuardando(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-28 pt-6 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
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

            {/* Botón flotante para subir foto */}
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
              {isSocio ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Socio #{user.numero_socio || '1042'}
                </span>
              ) : (
                <span className="bg-blue-100 text-[#1E40AF] text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                  Usuario Registrado
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

          {isSocio && (
            <Link
              href="/carnet"
              className="bg-roncedo-navy hover:bg-[#1A457D] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <CreditCard className="w-4 h-4 text-roncedo-gold" />
              <span>Ver Carnet</span>
            </Link>
          )}
        </div>

        {/* Ficha Institucional: Condición de Socio Protector */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-rose-100 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm flex-shrink-0">
                <Heart className="w-6 h-6 fill-rose-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Socio Protector
                  </h3>
                  {user.es_socio_protector ? (
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        user.estado_socio_protector === 'activo'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : user.estado_socio_protector === 'pendiente'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      {user.estado_socio_protector === 'activo'
                        ? 'Activo'
                        : user.estado_socio_protector === 'pendiente'
                        ? 'Pendiente'
                        : 'Inactivo'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      No adherido
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aporte voluntario mensual para el sostenimiento de las actividades culturales y sociales.
                </p>
              </div>
            </div>

            <Link
              href="/socio-protector"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex-shrink-0"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>{user.es_socio_protector ? 'Ver o Cambiar Plan' : 'Quiero Colaborar'}</span>
            </Link>
          </div>

          {/* Grilla de Datos del Socio Protector */}
          {user.es_socio_protector ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2.5">
                {(() => {
                  const medalla = obtenerMedallaProtector(user.tipo_socio_protector);
                  return medalla ? (
                    <div className="relative w-8 h-8 flex-shrink-0 drop-shadow-sm">
                      <Image
                        src={medalla.insignia}
                        alt={`Medalla ${medalla.label}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : null;
                })()}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Categoría
                  </span>
                  <span className="font-extrabold text-slate-900 mt-0.5 block text-sm">
                    {user.tipo_socio_protector || 'Bronce'}
                  </span>
                </div>
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
                  Proveedor de Pago
                </span>
                <span className="font-extrabold text-slate-900 mt-0.5 block capitalize">
                  {user.proveedor_pago === 'mercadopago' ? 'Mercado Pago' : user.proveedor_pago || 'Mercado Pago'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  ID Suscripción
                </span>
                <span className="font-mono font-bold text-slate-700 mt-0.5 block truncate text-[11px]">
                  {user.id_suscripcion_externa || 'Pendiente'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Fecha de Adhesión
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {formatFechaArgentina(user.fecha_adhesion)}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Último Pago
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {formatFechaArgentina(user.fecha_ultimo_pago)}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Próximo Vencimiento
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {user.proximo_vencimiento ? formatFechaArgentina(user.proximo_vencimiento) : 'Renovación mensual automática'}
                </span>
              </div>
            </div>
          ) : (
            <div className="pt-4 text-xs text-slate-500 flex items-center justify-between">
              <p>
                Aún no estás adherido como Socio Protector. Con un aporte desde $2.000 mensuales ayudas a sostener la biblioteca.
              </p>
            </div>
          )}
        </div>

        {/* Sección de Solicitud de Socio para Usuarios */}
        {!isSocio && (
          <div className="bg-gradient-to-br from-[#0F2D54] via-[#1B5699] to-[#5B9BE5] text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-white/20 relative overflow-hidden">
            <div className="max-w-xl">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 inline-block mb-2 backdrop-blur-sm">
                Asociate a la Biblioteca
              </span>
              <h2 className="text-xl font-black text-white">
                ¿Querés ser socio de la Biblioteca Roncedo?
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-relaxed">
                Como socio accedes a préstamo de libros en sala y a domicilio, descuentos en talleres culturales y tu Carnet Digital con código QR.
              </p>

              {miSolicitudPendiente || solicitudEnviada ? (
                <div className="mt-4 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-4 flex items-start gap-3 text-emerald-200">
                  <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-300" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      ¡Tu solicitud está en revisión!
                    </h4>
                    <p className="text-xs text-emerald-100 mt-0.5">
                      La Comisión Directiva revisará tus datos a la brevedad. Te asignarán un número de socio y tu Carnet Digital se activará automáticamente.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                    Selecciona tu categoría de socio:
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {(['Activo', 'Cadete', 'Familiar', 'Vitalicio'] as CategoriaSocio[]).map(
                      (cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategoriaDeseada(cat)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                            categoriaDeseada === cat
                              ? 'bg-roncedo-celeste text-white border-white shadow-sm'
                              : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
                          }`}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={handleSolicitarSocio}
                    disabled={guardando}
                    className="w-full sm:w-auto bg-roncedo-gold hover:bg-amber-500 text-slate-900 font-extrabold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Solicitud de Socio Ahora</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cuadro de Datos Personales con Leve Celeste y Campos en Blanco Sobresalientes */}
        <div className="bg-[#EAF3FD] rounded-3xl p-6 sm:p-8 shadow-card border border-[#BFDBFE]">
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
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>¡Datos personales actualizados correctamente!</span>
            </div>
          )}

          <form onSubmit={handleGuardarDatos} className="space-y-5">
            {/* Nombre/s y Apellido/s */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nombre/s *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Apellido/s *
                </label>
                <input
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
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Ej: 34.892.110"
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Sexo
                </label>
                <select
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

            {/* WhatsApp y Correo Electrónico Registrado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  WhatsApp (para avisos y reservas)
                </label>
                <div className="flex gap-2">
                  <select
                    value={whatsappCodigo}
                    onChange={(e) => setWhatsappCodigo(e.target.value)}
                    className="w-28 sm:w-32 bg-white px-2 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste text-xs font-semibold text-slate-900 shadow-sm"
                  >
                    {PAISES.map((p) => (
                      <option key={`${p.nombre}-${p.codigo}`} value={p.codigo}>
                        {p.codigo} ({p.nombre})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Ej: 3585 621547"
                    className="flex-1 bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>
            </div>

            {/* País y Provincia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  País
                </label>
                <select
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
                  Provincia
                </label>
                {pais === 'Argentina' ? (
                  <select
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
                    value={provinciaManual}
                    onChange={(e) => setProvinciaManual(e.target.value)}
                    placeholder="Estado / Región / Provincia"
                    className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                  />
                )}
              </div>
            </div>

            {/* Localidad y Código Postal (debajo de Localidad) */}
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
                  Código Postal
                </label>
                <input
                  type="text"
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
                  Barrio
                </label>
                <input
                  type="text"
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  placeholder="Ej: Centro, San Vicente..."
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Calle
                </label>
                <input
                  type="text"
                  value={calle}
                  onChange={(e) => setCalle(e.target.value)}
                  placeholder="Ej: San Martín, Córdoba..."
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Número / Altura
                </label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Ej: 128 o S/N"
                  className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-roncedo-celeste focus:border-roncedo-celeste text-sm text-slate-900 shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Observaciones */}
            <div>
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

            <div className="pt-4 border-t border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Los datos quedan protegidos y bajo custodia de la Biblioteca Roncedo
              </span>
              <button
                type="submit"
                disabled={guardando}
                className="w-full sm:w-auto bg-roncedo-navy hover:bg-[#1A457D] text-white font-bold text-xs sm:text-sm py-3 px-7 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
