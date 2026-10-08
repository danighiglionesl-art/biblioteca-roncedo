'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { CategoriaSocio } from '@/types';
import confetti from 'canvas-confetti';
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
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function PerfilPage() {
  const { user, updateProfile, submitSolicitudSocio, solicitudes } = useAuth();

  if (!user) return null;

  // Formulario de datos personales
  const [nombre, setNombre] = useState(user.nombre || '');
  const [apellido, setApellido] = useState(user.apellido || '');
  const [dni, setDni] = useState(user.dni || '');
  const [telefono, setTelefono] = useState(user.telefono || '');
  const [whatsapp, setWhatsapp] = useState(user.whatsapp || '');
  const [domicilio, setDomicilio] = useState(user.domicilio || '');
  const [localidad, setLocalidad] = useState(user.localidad || 'Alcira Gigena');
  const [fechaNacimiento, setFechaNacimiento] = useState(user.fecha_nacimiento || '');
  const [categoriaDeseada, setCategoriaDeseada] = useState<CategoriaSocio>('Activo');

  const [guardadoExito, setGuardadoExito] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Buscar si tiene solicitud pendiente
  const miSolicitudPendiente = solicitudes.find(
    (s) => s.user_id === user.id && s.estado === 'pendiente'
  );

  const isSocio = user.role === 'socio' || user.role === 'admin';

  const handleGuardarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setGuardadoExito(false);

    try {
      const res = await updateProfile({
        nombre,
        apellido,
        dni,
        telefono,
        whatsapp,
        domicilio,
        localidad,
        fecha_nacimiento: fechaNacimiento,
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

    if (!dni.trim() || !telefono.trim() || !domicilio.trim()) {
      setError('Por favor completa DNI, teléfono y domicilio antes de solicitar ser socio.');
      return;
    }

    setGuardando(true);
    try {
      const res = await submitSolicitudSocio({
        dni,
        telefono,
        domicilio,
        localidad,
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

  return (
    <div className="min-h-screen bg-slate-50 pb-28 pt-6 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Cabecera de Perfil */}
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-roncedo-sky border-2 border-roncedo-blueLight shadow-md flex-shrink-0">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.nombre}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-roncedo-navy to-blue-800 text-white text-3xl font-bold uppercase">
                {user.nombre.charAt(0)}{user.apellido.charAt(0) || 'R'}
              </div>
            )}
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
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-300">
                  Usuario Registrado
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{user.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              Miembro desde: {new Date(user.created_at).toLocaleDateString('es-AR')}
            </p>
          </div>

          {isSocio && (
            <Link
              href="/carnet"
              className="bg-roncedo-navy hover:bg-blue-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4 text-roncedo-gold" />
              <span>Ver Carnet</span>
            </Link>
          )}
        </div>

        {/* Sección de Estado de Solicitud a Socio */}
        {!isSocio && (
          <div className="bg-gradient-to-br from-blue-900 to-roncedo-navy text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-blue-800 relative overflow-hidden">
            <div className="max-w-xl">
              <span className="text-[10px] uppercase font-bold tracking-wider text-roncedo-goldLight bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 inline-block mb-2">
                Asociate a la Biblioteca
              </span>
              <h2 className="text-xl font-black text-white">
                ¿Querés ser socio de la Biblioteca Dr. Lautaro Roncedo?
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
                              ? 'bg-roncedo-blue text-white border-blue-400 shadow-sm'
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

        {/* Formulario de Datos Personales */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Mis Datos Personales
              </h2>
              <p className="text-xs text-slate-500">
                Mantén tus datos actualizados para contacto y gestión de préstamos
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {guardadoExito && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¡Datos personales actualizados correctamente!</span>
            </div>
          )}

          <form onSubmit={handleGuardarDatos} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  DNI / Documento
                </label>
                <input
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Ej: 34.892.110"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: +54 9 358 4123456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp (para avisos de libros y reservas)
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ej: +54 9 358 4123456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Domicilio (Calle y N°)
                </label>
                <input
                  type="text"
                  value={domicilio}
                  onChange={(e) => setDomicilio(e.target.value)}
                  placeholder="Ej: San Martín 672"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Localidad
                </label>
                <input
                  type="text"
                  value={localidad}
                  onChange={(e) => setLocalidad(e.target.value)}
                  placeholder="Alcira Gigena"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-roncedo-blue text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={guardando}
                className="bg-roncedo-navy hover:bg-blue-900 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl shadow-sm transition-colors flex items-center gap-2"
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
