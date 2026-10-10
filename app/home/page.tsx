'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  CreditCard,
  Library,
  BookOpen,
  FileText,
  Camera,
  Calendar,
  ShoppingBag,
  Award,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  Globe2,
  MessageCircle,
  Settings,
  Image as ImageIcon,
  Star,
} from 'lucide-react';
import { InsigniaSocioProtector } from '@/components/common/InsigniaSocioProtector';
import { CONTACTO_BIBLIOTECA } from '@/lib/constants/contacto';
import { NovedadInstitucional } from '@/types';
import { getNovedades } from '@/lib/supabase/novedades';
import { ModalDetalleNovedad } from '@/components/novedades/ModalDetalleNovedad';

export default function HomePage() {
  const { user } = useAuth();
  const [novedades, setNovedades] = React.useState<NovedadInstitucional[]>([]);
  const [novedadSeleccionada, setNovedadSeleccionada] = React.useState<NovedadInstitucional | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    const fetchNovedades = async () => {
      try {
        const data = await getNovedades();
        if (isMounted) setNovedades(data);
      } catch (err) {
        console.error('Error cargando novedades:', err);
      }
    };
    fetchNovedades();

    const handleUpdate = () => fetchNovedades();
    window.addEventListener('roncedo_novedades_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('roncedo_novedades_updated', handleUpdate);
    };
  }, []);

  if (!user) return null;

  const isSocio = user.role === 'socio' || user.role === 'admin';

  // Los 8 accesos clave definidos por la Biblioteca
  const accesosPrincipales = [
    {
      titulo: 'Mi Carnet',
      descripcion: isSocio ? `Socio #${user.numero_socio || '1042'} • Cuota al Día` : 'Carnet Oficial con QR',
      href: '/carnet',
      icon: CreditCard,
      color: 'from-blue-600 to-indigo-700',
      badge: isSocio ? 'Activo' : 'Solicitar',
      badgeColor: isSocio ? 'bg-emerald-500/20 text-emerald-800' : 'bg-blue-500/20 text-blue-800',
    },
    {
      titulo: 'Mi Biblioteca',
      descripcion: '1.283 libros en sala, estanterías, préstamos y fichas',
      href: '/mi-biblioteca',
      icon: Library,
      color: 'from-sky-600 to-blue-700',
      badge: '1.283 Libros',
      badgeColor: 'bg-emerald-500/20 text-emerald-800',
    },
    {
      titulo: 'Biblioteca Digital',
      descripcion: 'Obras clásicas, lectura online y descargas libres',
      href: '/biblioteca-digital',
      icon: Globe2,
      color: 'from-blue-700 to-indigo-900',
      badge: 'Colección Digital',
      badgeColor: 'bg-blue-500/20 text-blue-800',
    },
    {
      titulo: 'Archivo Fotográfico',
      descripcion: 'Fotos históricas de Roncedo y de la comunidad',
      href: '/fotos',
      icon: Camera,
      color: 'from-emerald-600 to-teal-800',
      badge: 'Fototeca Activa',
      badgeColor: 'bg-emerald-500/20 text-emerald-800 border-emerald-300',
    },
    {
      titulo: 'Archivo de Actas',
      descripcion: '102 folios (1926-1932), fundación, firmas y visor HD',
      href: '/actas',
      icon: FileText,
      color: 'from-slate-700 to-slate-900',
      badge: '102 Folios HD',
      badgeColor: 'bg-emerald-500/20 text-emerald-800 border-emerald-300',
    },
    {
      titulo: 'Eventos y Talleres',
      descripcion: 'Cursos, charlas, cultura e inscripciones',
      href: '/eventos',
      icon: Calendar,
      color: 'from-violet-600 to-purple-800',
      etapa: 'Etapa 5',
    },
    {
      titulo: 'Dr. Lautaro Roncedo',
      descripcion: 'Biografía, cartas y museo digital',
      href: '/roncedo',
      icon: Award,
      color: 'from-yellow-700 to-amber-900',
      etapa: 'Etapa 6',
    },
    {
      titulo: 'Tienda Institucional',
      descripcion: 'Merchandising, publicaciones y recuerdos',
      href: '/tienda',
      icon: ShoppingBag,
      color: 'from-rose-600 to-pink-800',
      etapa: 'Etapa 7',
    },
  ];

  return (
    <div className="min-h-screen bg-[#E5F2FE] pb-24">
      {/* Banner de Bienvenida Institucional con Celestes Protagonistas */}
      <section className="bg-gradient-to-r from-[#0F2D54] via-[#1B5699] to-[#5B9BE5] text-white pt-6 pb-12 px-4 shadow-lg border-b border-white/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 backdrop-blur-sm">
                  Club Sp. y B. Dr. Lautaro Roncedo
                </span>
                <span className="text-xs text-blue-100 font-medium">
                  Fundado el 13 de marzo de 1926
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                ¡Hola, {user.nombre}!
              </h1>
              <p className="text-sm text-blue-100 max-w-xl mt-1">
                Bienvenido a la plataforma digital de la Biblioteca Roncedo. Historia, cultura y comunidad en un solo lugar.
              </p>
            </div>

            {/* Tarjeta de Condición Institucional con Escudo Protagonista */}
            <div className="bg-[#B2D5FD] border-2 border-white/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 flex-shrink-0 shadow-lg">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 drop-shadow-md">
                <Image
                  src="/images/escudo-roncedo.png"
                  alt="Escudo Oficial Biblioteca Roncedo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <p className="text-[11px] uppercase font-black text-[#102A4E]/80 tracking-wider">
                  Condición Institucional
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black text-[#0F284B]">
                    {user.role === 'admin'
                      ? 'Administrador General'
                      : isSocio
                      ? `Socio #${user.numero_socio || '1042'}`
                      : 'Usuario Registrado'}
                  </span>
                </div>
                {isSocio ? (
                  <Link
                    href="/carnet"
                    className="inline-flex items-center gap-1 text-xs sm:text-sm text-emerald-800 font-black hover:text-emerald-950 hover:underline mt-1"
                  >
                    <span>Ver mi Carnet Digital con QR</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    href="/perfil"
                    className="inline-flex items-center gap-1 text-xs sm:text-sm text-[#92400E] font-black hover:text-[#78350F] hover:underline mt-1"
                  >
                    <span>Solicitar ser Socio Oficial</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accesos Principales (Los 8 Módulos de la Biblioteca con Íconos Celestes Uniformes) */}
      <main className="max-w-6xl mx-auto px-4 -mt-6 space-y-6">
        {/* Banner Destacado: Socio Protector (Armonía Azul Marino y Celeste Institucional) */}
        <div className="bg-gradient-to-r from-[#0F284B] via-[#1A457D] to-[#1E6091] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 drop-shadow-md">
              <InsigniaSocioProtector
                tipo={user.tipo_socio_protector}
                size={64}
                className="w-full h-full"
                priority
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-blue-100 px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-sm">
                  Campaña Permanente
                </span>
                {user.es_socio_protector && (
                  <span className="text-[10px] font-extrabold bg-amber-400 text-slate-900 px-2.5 py-0.5 rounded-full shadow-sm inline-flex items-center gap-1.5">
                    <InsigniaSocioProtector tipo={user.tipo_socio_protector} size={14} />
                    <span>¡Sos Socio Protector {user.tipo_socio_protector}!</span>
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black mt-1 text-white">
                Socio Protector: Tu aporte mensual transforma la biblioteca
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
                Sumate con un aporte solidario recurrente desde $2.000/mes por Mercado Pago para sostener nuevos libros, talleres y actividades comunitarias.
              </p>
            </div>
          </div>
          <Link
            href="/socio-protector"
            className="px-5 py-3 rounded-xl bg-white text-[#0F284B] hover:bg-[#E5F2FE] text-xs sm:text-sm font-black shadow-md transition-all flex items-center gap-2 flex-shrink-0 active:scale-95"
          >
            <InsigniaSocioProtector tipo={user.tipo_socio_protector} size={18} />
            <span>{user.es_socio_protector ? 'Ver mi Aporte' : 'Quiero Colaborar'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-card border border-blue-200/80">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-roncedo-celeste" />
                <span>Accesos Principales</span>
              </h2>
              <p className="text-xs text-slate-500">
                Selecciona la sección a la que deseas acceder
              </p>
            </div>
            <Link
              href="/mi-biblioteca"
              className="text-xs font-bold text-roncedo-celeste hover:text-roncedo-celesteDark hover:underline hidden sm:inline-block"
            >
              Ir a Mi Biblioteca →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accesosPrincipales.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.titulo}
                  href={item.href}
                  className="group relative bg-[#F4F9FE] hover:bg-white rounded-2xl p-4 border border-blue-100 hover:border-roncedo-celeste/70 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      {/* Ícono Uniforme Celeste de las barras del escudo */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5B9BE5] to-[#3E83D4] text-white flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow transition-all border border-blue-200/60">
                        <Icon className="w-6 h-6 stroke-[2]" />
                      </div>
                      {item.etapa ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#2563EB] border border-blue-200">
                          {item.etapa}
                        </span>
                      ) : item.badge ? (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#102A4E] transition-colors">
                      {item.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.descripcion}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-blue-100/80 flex items-center justify-between text-xs font-semibold text-roncedo-celesteDark group-hover:translate-x-0.5 transition-transform">
                    <span>Ingresar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Novedades y Noticias Institucionales */}
        <section className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Novedades de la Biblioteca
              </h2>
              <p className="text-xs text-slate-500">
                Últimas noticias, anuncios de actividades y vida social del club
              </p>
            </div>

            {user.role === 'admin' && (
              <Link
                href="/admin?tab=novedades"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-roncedo-navy text-white text-xs font-bold hover:bg-blue-900 transition-colors shadow-sm self-start sm:self-auto"
              >
                <Settings className="w-3.5 h-3.5 text-roncedo-celeste" />
                <span>Gestionar Novedades (ABM)</span>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {novedades.map((nov) => {
              const fotos = nov.imagenes && nov.imagenes.length > 0
                ? nov.imagenes
                : nov.imagen_url
                ? [nov.imagen_url]
                : [];

              return (
                <article
                  key={nov.id}
                  onClick={() => setNovedadSeleccionada(nov)}
                  className="bg-white rounded-2xl shadow-card border border-slate-200/80 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden cursor-pointer group"
                >
                  <div>
                    {fotos.length > 0 && (
                      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                        <Image
                          src={fotos[0]}
                          alt={nov.titulo}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

                        {fotos.length > 1 && (
                          <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-white/20">
                            <ImageIcon className="w-3 h-3 text-roncedo-celeste" />
                            <span>{fotos.length} fotos</span>
                          </div>
                        )}

                        {nov.destacado && (
                          <div className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 shadow-md">
                            <Star className="w-3 h-3 fill-current" />
                            <span>Destacada</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3 text-xs">
                        <span className="bg-roncedo-sky text-roncedo-navy font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                          {nov.categoria}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3" />
                          {nov.fecha}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-roncedo-blue transition-colors">
                        {nov.titulo}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                        {nov.bajada}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Biblioteca Roncedo
                      </span>
                      <span className="text-xs font-bold text-roncedo-blue flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Leer más <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Sección de Identidad y Pertenencia Institucional */}
        <section className="mt-8 bg-gradient-to-br from-[#0F2D54] via-[#1A4E8C] to-[#4585D4] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-white/20">
          <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none w-80 h-80 -mr-10 -mb-10">
            <Image
              src="/images/logo-biblioteca.png"
              alt="Fondo"
              fill
              className="object-contain"
            />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-2 text-white/90 text-xs uppercase font-bold tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Patrimonio y Memoria Colectiva</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Club Sp. y B. Dr. Lautaro Roncedo - Alcira Gigena
            </h2>
            <div className="text-xs sm:text-sm text-blue-100 mt-3 leading-relaxed space-y-2">
              <p>
                La Biblioteca Roncedo es mucho más que un espacio de libros: es la guardiana de nuestra historia, de las hazañas deportivas, de los momentos que nos hicieron grandes y de las generaciones que construyeron la identidad de nuestro Club.
              </p>
              <p className="font-bold text-white">
                Cada fotografía, cada recuerdo y cada historia forman parte de un legado que nos pertenece a todos.
              </p>
              <p>
                Juntos construimos un archivo digital para preservar nuestra historia, mantener viva nuestra identidad y transmitir a las futuras generaciones el orgullo de pertenecer a nuestro Club.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/fotos"
                className="bg-white text-roncedo-navy hover:bg-blue-50 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-md"
              >
                Explorar Archivo Histórico
              </Link>
              <Link
                href="/perfil"
                className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors border border-white/30 backdrop-blur-sm"
              >
                Asociarme a la Biblioteca
              </Link>
            </div>
          </div>
        </section>

        {/* Canal de Atención y Consultas por WhatsApp */}
        <section className="mt-8 bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-blue-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Canal Oficial de Consultas
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  ¿Tenés consultas sobre la Biblioteca?
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Escribinos directamente a nuestro celular oficial de WhatsApp: <strong className="text-slate-900">{CONTACTO_BIBLIOTECA.whatsappFormato}</strong>
                </p>
              </div>
            </div>
            <a
              href={CONTACTO_BIBLIOTECA.getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs sm:text-sm rounded-2xl transition-transform active:scale-95 shadow-md flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Escribir por WhatsApp</span>
            </a>
          </div>
        </section>
      </main>

      {/* Modal de Lectura y Galería de Fotografías de la Novedad */}
      {novedadSeleccionada && (
        <ModalDetalleNovedad
          novedad={novedadSeleccionada}
          onClose={() => setNovedadSeleccionada(null)}
        />
      )}
    </div>
  );
}
