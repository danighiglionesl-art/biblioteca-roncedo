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
  -- Módulo Socio Protector (Arquitectura desacoplada de la condición de socio)
  es_socio_protector BOOLEAN DEFAULT FALSE NOT NULL,
  tipo_socio_protector TEXT, -- 'Bronce', 'Plata', 'Oro'
  estado_socio_protector TEXT DEFAULT 'inactivo', -- 'activo', 'pendiente', 'inactivo'
  importe_mensual NUMERIC DEFAULT 0,
  proveedor_pago TEXT DEFAULT 'mercadopago', -- 'mercadopago', 'mobbex', 'transferencia', 'efectivo'
  id_suscripcion_externa TEXT,
  fecha_adhesion DATE,
  fecha_ultimo_pago TIMESTAMPTZ,
  proximo_vencimiento DATE,
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

-- 5. Tabla de Socios Protectores (Desacoplada)
CREATE TABLE IF NOT EXISTS public.socios_protectores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'Bronce', 'Plata', 'Oro'
  estado TEXT DEFAULT 'activo' NOT NULL, -- 'activo', 'pendiente', 'inactivo'
  importe_mensual NUMERIC NOT NULL,
  proveedor_pago TEXT DEFAULT 'mercadopago' NOT NULL,
  id_suscripcion_externa TEXT,
  fecha_adhesion DATE DEFAULT CURRENT_DATE NOT NULL,
  fecha_ultimo_pago TIMESTAMPTZ,
  proximo_vencimiento DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Tabla de Suscripciones (Desacoplada del proveedor de pago)
CREATE TABLE IF NOT EXISTS public.suscripciones_protectores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  socio_protector_id UUID REFERENCES public.socios_protectores(id) ON DELETE SET NULL,
  proveedor TEXT DEFAULT 'mercadopago' NOT NULL,
  id_externo_suscripcion TEXT NOT NULL UNIQUE,
  plan_id_externo TEXT,
  estado TEXT DEFAULT 'activa' NOT NULL,
  importe NUMERIC NOT NULL,
  moneda TEXT DEFAULT 'ARS' NOT NULL,
  frecuencia TEXT DEFAULT 'mensual' NOT NULL,
  fecha_inicio TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  fecha_cancelacion TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Tabla de Pagos de Suscripción (Historial de transacciones)
CREATE TABLE IF NOT EXISTS public.pagos_protectores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  suscripcion_id UUID REFERENCES public.suscripciones_protectores(id) ON DELETE SET NULL,
  proveedor TEXT DEFAULT 'mercadopago' NOT NULL,
  id_transaccion_externa TEXT NOT NULL UNIQUE,
  monto NUMERIC NOT NULL,
  moneda TEXT DEFAULT 'ARS' NOT NULL,
  estado TEXT DEFAULT 'aprobado' NOT NULL,
  fecha_pago TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  detalle TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Tabla de Solicitudes de Alta de Socio General
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

-- 9. Seguridad y Políticas para Módulo Socio Protector
ALTER TABLE public.socios_protectores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscripciones_protectores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_protectores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven su condicion de socio protector" 
  ON public.socios_protectores FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios ven sus suscripciones" 
  ON public.suscripciones_protectores FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios ven sus pagos" 
  ON public.pagos_protectores FOR SELECT 
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_protectores_user ON public.socios_protectores(user_id);
CREATE INDEX IF NOT EXISTS idx_protectores_estado ON public.socios_protectores(estado);
CREATE INDEX IF NOT EXISTS idx_suscripciones_ext ON public.suscripciones_protectores(id_externo_suscripcion);
CREATE INDEX IF NOT EXISTS idx_pagos_ext ON public.pagos_protectores(id_transaccion_externa);

-- =====================================================================
-- 10. MÓDULO FOTOTECA HISTÓRICA INTELIGENTE
-- =====================================================================

-- Extensión de Vectores para Inteligencia Artificial (Búsqueda semántica)
CREATE EXTENSION IF NOT EXISTS "vector";

-- Tabla Principal de Fotografías Históricas
CREATE TABLE IF NOT EXISTS public.fototeca_fotos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  anio_estimado INTEGER,
  decada TEXT, -- Ej: '1940s', '1950s', '1960s'
  fecha_exacta DATE,
  lugar TEXT, -- Ej: 'Sede Social', 'Cancha de Fútbol', 'Plaza San Martín'
  institucion TEXT DEFAULT 'Club Roncedo',
  acontecimiento TEXT, -- Ej: 'Inauguración de la Pileta', 'Campeonato 1968'
  coleccion TEXT DEFAULT 'Historia General', -- 'Deportes', 'Comunidad y Familias', 'Arquitectura', 'Cultura'
  imagen_url TEXT NOT NULL,
  storage_path TEXT,
  autor_fotografo TEXT,
  donante_fuente TEXT,
  subido_por_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subido_por_nombre TEXT,
  -- Moderación ágil (Publicación directa con moderación a posteriori)
  estado_moderacion TEXT DEFAULT 'publicada' NOT NULL, -- 'publicada', 'reportada', 'oculta'
  reportes_count INTEGER DEFAULT 0 NOT NULL,
  motivo_ultimo_reporte TEXT,
  destacada BOOLEAN DEFAULT FALSE NOT NULL,
  -- Campo para IA (Embeddings vectoriales de 768 dimensiones para Gemini)
  embedding_ia vector(768),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Etiquetas de Personas Identificadas en la Foto (Mapeo Facial / Reconocimiento)
CREATE TABLE IF NOT EXISTS public.fototeca_etiquetas_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  foto_id UUID NOT NULL REFERENCES public.fototeca_fotos(id) ON DELETE CASCADE,
  nombre_persona TEXT NOT NULL,
  rol_o_detalle TEXT, -- Ej: 'Capitán', 'Presidente', 'Docente'
  pos_x_porcentaje NUMERIC(5,2), -- Posición relativa en la foto (0 a 100%)
  pos_y_porcentaje NUMERIC(5,2),
  identificado_por_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  identificado_por_nombre TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Comentarios y Aportes Comunitarios
CREATE TABLE IF NOT EXISTS public.fototeca_comentarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  foto_id UUID NOT NULL REFERENCES public.fototeca_fotos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nombre_usuario TEXT NOT NULL,
  comentario TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices de aceleración
CREATE INDEX IF NOT EXISTS idx_fototeca_decada ON public.fototeca_fotos(decada);
CREATE INDEX IF NOT EXISTS idx_fototeca_anio ON public.fototeca_fotos(anio_estimado);
CREATE INDEX IF NOT EXISTS idx_fototeca_coleccion ON public.fototeca_fotos(coleccion);
CREATE INDEX IF NOT EXISTS idx_fototeca_estado ON public.fototeca_fotos(estado_moderacion);
CREATE INDEX IF NOT EXISTS idx_fototeca_personas_foto ON public.fototeca_etiquetas_personas(foto_id);
CREATE INDEX IF NOT EXISTS idx_fototeca_comentarios_foto ON public.fototeca_comentarios(foto_id);

CREATE INDEX IF NOT EXISTS idx_fototeca_trgm_titulo ON public.fototeca_fotos USING gin (titulo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_fototeca_trgm_desc ON public.fototeca_fotos USING gin (descripcion gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_fototeca_trgm_lugar ON public.fototeca_fotos USING gin (lugar gin_trgm_ops);

-- Función SQL para Búsqueda Semántica con IA
CREATE OR REPLACE FUNCTION match_fototeca_fotos (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  descripcion TEXT,
  anio_estimado INTEGER,
  decada TEXT,
  lugar TEXT,
  imagen_url TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fototeca_fotos.id,
    fototeca_fotos.titulo,
    fototeca_fotos.descripcion,
    fototeca_fotos.anio_estimado,
    fototeca_fotos.decada,
    fototeca_fotos.lugar,
    fototeca_fotos.imagen_url,
    1 - (fototeca_fotos.embedding_ia <=> query_embedding) AS similarity
  FROM fototeca_fotos
  WHERE fototeca_fotos.estado_moderacion = 'publicada'
    AND 1 - (fototeca_fotos.embedding_ia <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Seguridad RLS para Fototeca
ALTER TABLE public.fototeca_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fototeca_etiquetas_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fototeca_comentarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de fotos publicadas"
  ON public.fototeca_fotos FOR SELECT
  USING (estado_moderacion != 'oculta' OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Usuarios pueden publicar fotos"
  ON public.fototeca_fotos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Moderación y actualización de fotos"
  ON public.fototeca_fotos FOR UPDATE
  USING (true);

CREATE POLICY "Lectura pública de etiquetas" ON public.fototeca_etiquetas_personas FOR SELECT USING (true);
CREATE POLICY "Creación comunitaria de etiquetas" ON public.fototeca_etiquetas_personas FOR INSERT WITH CHECK (true);

CREATE POLICY "Lectura pública de comentarios" ON public.fototeca_comentarios FOR SELECT USING (true);
CREATE POLICY "Creación comunitaria de comentarios" ON public.fototeca_comentarios FOR INSERT WITH CHECK (true);

-- Configuración de Storage Bucket fototeca público
INSERT INTO storage.buckets (id, name, public)
VALUES ('fototeca', 'fototeca', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Lectura pública de fotos en storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'fototeca');

CREATE POLICY "Subida de fotos en storage"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'fototeca');

CREATE POLICY "Eliminación de fotos en storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'fototeca');

