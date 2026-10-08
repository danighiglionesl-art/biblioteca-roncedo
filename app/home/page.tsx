'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth/AuthContext';
import { NOVEDADES_INICIALES } from '@/lib/auth/mockData';
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
  Heart,
  Clock,
  MapPin,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

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
      descripcion: 'Mis préstamos, reservas y actividades',
      href: '/mi-biblioteca',
      icon: Library,
      color: 'from-sky-600 to-blue-700',
    },
    {
      titulo: 'Libros y Catálogo',
      descripcion: 'Buscador, disponibilidad física y reservas',
      href: '/libros',
      icon: BookOpen,
      color: 'from-amber-600 to-amber-800',
      etapa: 'Etapa 2',
    },
    {
      titulo: 'Archivo Fotográfico',
      descripcion: 'Fotos históricas de Roncedo y Alcira Gigena',
      href: '/fotos',
      icon: Camera,
      color: 'from-emerald-600 to-teal-800',
      etapa: 'Etapa 3',
    },
    {
      titulo: 'Archivo de Actas',
      descripcion: 'Actas fundacionales, firmas y OCR',
      href: '/actas',
      icon: FileText,
      color: 'from-slate-700 to-slate-900',
      etapa: 'Etapa 4',
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
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Banner de Bienvenida Institucional */}
      <section className="bg-gradient-to-r from-roncedo-navy via-blue-900 to-roncedo-navyDark text-white pt-6 pb-12 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-roncedo-blueLight bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
                  Alcira Gigena • Córdoba
                </span>
                <span className="text-xs text-slate-300">
                  Fundado el 1 de Mayo de 1926
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                ¡Hola, {user.nombre}!
              </h1>
              <p className="text-sm text-blue-100 max-w-xl mt-1">
                Bienvenido a la plataforma digital del Club Sportivo y Biblioteca Dr. Lautaro Roncedo. Historia, cultura y comunidad en un solo lugar.
              </p>
            </div>

            {/* Tarjeta Rápida de Socio */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 flex-shrink-0">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white/20 border border-white/30 flex-shrink-0">
                <Image
                  src="/images/escudo-roncedo.jpg"
                  alt="Escudo Roncedo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
                  Condición Institucional
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-white">
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
                    className="inline-flex items-center gap-1 text-xs text-emerald-300 font-bold hover:underline mt-0.5"
                  >
                    <span>Ver mi Carnet Digital con QR</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <Link
                    href="/perfil"
                    className="inline-flex items-center gap-1 text-xs text-amber-300 font-bold hover:underline mt-0.5"
                  >
                    <span>Solicitar ser Socio Oficial</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accesos Principales (Los 8 Módulos de la Biblioteca) */}
      <main className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-card border border-slate-200/80">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-roncedo-gold" />
                <span>Accesos Principales</span>
              </h2>
              <p className="text-xs text-slate-500">
                Selecciona la sección a la que deseas acceder
              </p>
            </div>
            <Link
              href="/mi-biblioteca"
              className="text-xs font-bold text-roncedo-blue hover:underline hidden sm:inline-block"
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
                  className="group relative bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-200 hover:border-roncedo-blue/40 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      {item.etapa ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 border border-slate-300">
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

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-roncedo-navy transition-colors">
                      {item.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.descripcion}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-roncedo-blue group-hover:translate-x-0.5 transition-transform">
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Novedades de la Biblioteca
              </h2>
              <p className="text-xs text-slate-500">
                Últimas noticias, anuncios de actividades y vida social del club
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {NOVEDADES_INICIALES.map((nov) => (
              <article
                key={nov.id}
                className="bg-white rounded-2xl p-5 shadow-card border border-slate-200/80 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="bg-roncedo-sky text-roncedo-navy font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                      {nov.categoria}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      {nov.fecha}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {nov.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {nov.bajada}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Biblioteca Roncedo
                  </span>
                  <span className="text-xs font-bold text-roncedo-blue flex items-center gap-1">
                    Leer más <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Sección de Identidad y Pertenencia (Alcira Gigena) */}
        <section className="mt-8 bg-gradient-to-br from-slate-900 via-roncedo-navyDark to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none w-80 h-80 -mr-10 -mb-10">
            <Image
              src="/images/emblema-biblioteca.jpg"
              alt="Fondo"
              fill
              className="object-contain"
            />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-2 text-roncedo-goldLight text-xs uppercase font-bold tracking-wider">
              <Heart className="w-4 h-4 text-roncedo-gold" />
              <span>Patrimonio y Memoria Colectiva</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              C.S. y B. Dr. Lautaro Roncedo • Alcira Gigena
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              La Biblioteca no es sólo un repositorio de libros: es el custodio de la memoria popular de Alcira Gigena, de las hazañas de nuestro club y del legado humanista del Dr. Lautaro Roncedo. Juntos construimos el archivo histórico digital más importante de nuestra comunidad.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/fotos"
                className="bg-roncedo-blue hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Explorar Archivo Histórico
              </Link>
              <Link
                href="/perfil"
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors border border-white/20"
              >
                Asociarme a la Biblioteca
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
