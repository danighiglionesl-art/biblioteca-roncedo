-- =====================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS POSTGRESQL (SUPABASE)
-- CLUB SPORTIVO Y BIBLIOTECA DR. LAUTARO RONCEDO (ALCIRA GIGENA)
-- =====================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Búsqueda difusa y rápida

-- 2. Enumerados para roles, estados de cuota y categorías
CREATE TYPE user_role AS ENUM ('usuario', 'socio', 'admin');
CREATE TYPE categoria_socio AS ENUM ('Activo', 'Cadete', 'Vitalicio', 'Familiar', 'Honorario');
CREATE TYPE estado_cuota AS ENUM ('al_dia', 'pendiente', 'exento');
CREATE TYPE estado_solicitud AS ENUM ('pendiente', 'aprobada', 'rechazada');
CREATE TYPE estado_libro AS ENUM ('disponible', 'prestado', 'reservado', 'no_disponible');

-- 3. Tabla de Perfiles de Usuario (vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'usuario'::user_role NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT,
  fecha_nacimiento DATE,
  sexo TEXT,
  telefono TEXT,
  whatsapp_codigo TEXT DEFAULT '+54',
  whatsapp TEXT,
  pais TEXT DEFAULT 'Argentina',
  provincia TEXT DEFAULT 'Córdoba',
  localidad TEXT DEFAULT 'Alcira Gigena',
  codigo_postal TEXT DEFAULT '5811',
  barrio TEXT,
  calle TEXT,
  numero TEXT,
  domicilio TEXT,
  observaciones TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Tabla de Socios Oficiales y Carnets
CREATE TABLE IF NOT EXISTS public.socios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  numero_socio TEXT NOT NULL UNIQUE,
  categoria categoria_socio DEFAULT 'Activo'::categoria_socio NOT NULL,
  fecha_alta DATE DEFAULT CURRENT_DATE NOT NULL,
  estado_cuota estado_cuota DEFAULT 'al_dia'::estado_cuota NOT NULL,
  qr_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Tabla de Solicitudes de Alta de Socio
CREATE TABLE IF NOT EXISTS public.socio_solicitudes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT NOT NULL,
  dni TEXT NOT NULL,
  telefono TEXT NOT NULL,
  domicilio TEXT NOT NULL,
  localidad TEXT DEFAULT 'Alcira Gigena',
  codigo_postal TEXT,
  fecha_nacimiento DATE,
  categoria_solicitada categoria_socio DEFAULT 'Activo'::categoria_socio NOT NULL,
  estado estado_solicitud DEFAULT 'pendiente'::estado_solicitud NOT NULL,
  fecha_solicitud TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  fecha_resolucion TIMESTAMPTZ,
  notas_admin TEXT
);

-- 6. Índices para acelerar búsquedas
CREATE INDEX IF NOT EXISTS idx_profiles_dni ON public.profiles(dni);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_socios_numero ON public.socios(numero_socio);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON public.socio_solicitudes(estado);

-- 7. Configuración de Seguridad por Filas (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socio_solicitudes ENABLE ROW LEVEL SECURITY;

-- Políticas de perfiles: el usuario puede ver su perfil y admins pueden ver todos
CREATE POLICY "Usuarios ven su propio perfil" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuarios editan su propio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Políticas de socios: los socios pueden ver su carnet
CREATE POLICY "Socios leen su carnet" 
  ON public.socios FOR SELECT 
  USING (auth.uid() = user_id);

-- Políticas de solicitudes: los usuarios ven sus solicitudes
CREATE POLICY "Usuarios ven sus solicitudes" 
  ON public.socio_solicitudes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean su solicitud" 
  ON public.socio_solicitudes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
