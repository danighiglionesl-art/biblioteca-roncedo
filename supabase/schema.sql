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

-- =====================================================================
-- 9. TABLA DE ACTAS HISTÓRICAS (ARCHIVO DIGITAL DE ACTAS)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.actas_historicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_acta TEXT NOT NULL,
  libro TEXT DEFAULT 'Libro N° 1 de Actas' NOT NULL,
  folio_inicio INTEGER DEFAULT 1 NOT NULL,
  folio_fin INTEGER DEFAULT 1 NOT NULL,
  pagina_archivo_inicio INTEGER DEFAULT 1 NOT NULL,
  pagina_archivo_fin INTEGER DEFAULT 1 NOT NULL,
  fecha DATE NOT NULL,
  anio INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  tipo_reunion TEXT DEFAULT 'Reunión de Comisión Directiva' NOT NULL,
  lugar TEXT DEFAULT 'Alcira Gigena, Córdoba',
  asistentes_count INTEGER DEFAULT 10,
  resumen TEXT,
  transcripcion_completa TEXT,
  firmantes JSONB DEFAULT '[]'::jsonb,
  temas_tratados TEXT[] DEFAULT '{}',
  archivos TEXT[] DEFAULT '{}',
  imagenes_urls TEXT[] DEFAULT '{}',
  estado_conservacion TEXT DEFAULT 'Excelente',
  es_destacada BOOLEAN DEFAULT FALSE,
  notas_archivista TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices de aceleración para Actas
CREATE INDEX IF NOT EXISTS idx_actas_anio ON public.actas_historicas(anio);
CREATE INDEX IF NOT EXISTS idx_actas_numero ON public.actas_historicas(numero_acta);
CREATE INDEX IF NOT EXISTS idx_actas_fecha ON public.actas_historicas(fecha);
CREATE INDEX IF NOT EXISTS idx_actas_trgm_titulo ON public.actas_historicas USING gin (titulo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_actas_trgm_resumen ON public.actas_historicas USING gin (resumen gin_trgm_ops);

-- Políticas RLS para Actas:
-- "el usuario o socio protector puede ver las actas solamente, Administrador gestiona"
ALTER TABLE public.actas_historicas ENABLE ROW LEVEL SECURITY;

-- Lectura: Pública y disponible para todos los usuarios, socios y socios protectores
CREATE POLICY "Lectura pública de actas"
  ON public.actas_historicas FOR SELECT
  USING (true);

-- Inserción / Creación: Únicamente Administradores
CREATE POLICY "Solo Administrador puede registrar actas"
  ON public.actas_historicas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Actualización / Edición: Únicamente Administradores
CREATE POLICY "Solo Administrador puede modificar actas"
  ON public.actas_historicas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Eliminación: Únicamente Administradores
CREATE POLICY "Solo Administrador puede eliminar actas"
  ON public.actas_historicas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =====================================================================
-- TABLA DE NOVEDADES INSTITUCIONALES (COMUNICADOS, ACTIVIDADES Y NOTICIAS)
-- Soporta hasta 5 fotografías en array de URLs o Storage paths
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.novedades (
  id TEXT PRIMARY KEY DEFAULT ('nov-' || floor(extract(epoch from now()) * 1000)::text),
  titulo TEXT NOT NULL,
  bajada TEXT NOT NULL,
  contenido TEXT NOT NULL,
  categoria TEXT DEFAULT 'Institucional' NOT NULL, -- 'Institucional', 'Cultura', 'Libros', 'Archivo'
  fecha DATE DEFAULT CURRENT_DATE NOT NULL,
  destacado BOOLEAN DEFAULT FALSE NOT NULL,
  imagen_url TEXT, -- Portada principal
  imagenes TEXT[] DEFAULT '{}', -- Hasta 5 fotografías asociadas
  autor TEXT DEFAULT 'Biblioteca Roncedo',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices de aceleración para Novedades
CREATE INDEX IF NOT EXISTS idx_novedades_fecha ON public.novedades(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_novedades_destacado ON public.novedades(destacado);
CREATE INDEX IF NOT EXISTS idx_novedades_categoria ON public.novedades(categoria);

-- Políticas RLS para Novedades:
ALTER TABLE public.novedades ENABLE ROW LEVEL SECURITY;

-- Lectura: Pública para toda la comunidad
CREATE POLICY "Lectura pública de novedades"
  ON public.novedades FOR SELECT
  USING (true);

-- Creación / Inserción: Solo administradores
CREATE POLICY "Solo Administrador puede registrar novedades"
  ON public.novedades FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Actualización: Solo administradores
CREATE POLICY "Solo Administrador puede modificar novedades"
  ON public.novedades FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Eliminación: Solo administradores
CREATE POLICY "Solo Administrador puede eliminar novedades"
  ON public.novedades FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =====================================================================
-- TABLAS DE EVENTOS, CURSOS, TALLERES CULTURALES E INSCRIPCIONES
-- Soporta tramos escalonados por fecha y beneficios para Socios Protectores
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.eventos_talleres (
  id TEXT PRIMARY KEY DEFAULT ('evt-' || floor(extract(epoch from now()) * 1000)::text),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  organizador TEXT NOT NULL,
  tipo TEXT DEFAULT 'taller_recurrente' NOT NULL, -- 'taller_recurrente', 'evento_unico'
  categoria TEXT DEFAULT 'Cultura' NOT NULL,
  
  -- Fechas y horarios
  fecha_realizacion DATE,
  horario TEXT,
  es_recurrente BOOLEAN DEFAULT TRUE NOT NULL,
  dias_dictado TEXT[] DEFAULT '{}',
  horario_recurrente TEXT,
  fecha_inicio_ciclo DATE,
  fecha_fin_ciclo DATE,

  -- Lugar y capacidad
  lugar TEXT DEFAULT 'Biblioteca Roncedo' NOT NULL,
  cupo_maximo INTEGER,
  cupo_disponible INTEGER,
  imagen_url TEXT,

  -- Precios y Tramos
  es_gratuito BOOLEAN DEFAULT FALSE NOT NULL,
  precio_base NUMERIC DEFAULT 0 NOT NULL,
  tramos_precio JSONB DEFAULT '[]'::jsonb, -- Array de { id, fecha_limite, precio, etiqueta }
  
  -- Descuentos por nivel de Socio Protector
  descuento_bronce_porcentaje NUMERIC DEFAULT 2 NOT NULL,
  descuento_plata_porcentaje NUMERIC DEFAULT 5 NOT NULL,
  descuento_oro_porcentaje NUMERIC DEFAULT 10 NOT NULL,

  -- Enlaces de pago y cobro
  link_pago TEXT,
  datos_transferencia TEXT,

  -- Estado
  estado TEXT DEFAULT 'activo' NOT NULL, -- 'activo', 'finalizado', 'cancelado'
  destacado BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.evento_inscripciones (
  id TEXT PRIMARY KEY DEFAULT ('ins-' || floor(extract(epoch from now()) * 1000)::text),
  evento_id TEXT NOT NULL REFERENCES public.eventos_talleres(id) ON DELETE CASCADE,
  evento_titulo TEXT,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_nombre TEXT NOT NULL,
  user_apellido TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_dni TEXT,
  user_telefono TEXT,
  user_tipo_protector TEXT DEFAULT 'no_socio' NOT NULL, -- 'Bronce', 'Plata', 'Oro', 'no_socio'

  -- Liquidación
  monto_base NUMERIC NOT NULL,
  descuento_porcentaje NUMERIC DEFAULT 0 NOT NULL,
  monto_descuento NUMERIC DEFAULT 0 NOT NULL,
  monto_final NUMERIC NOT NULL,
  tramo_aplicado TEXT,

  -- Pago
  estado_pago TEXT DEFAULT 'pendiente' NOT NULL, -- 'pendiente', 'aprobado', 'bonificado'
  comprobante_url TEXT,
  id_transaccion_pago TEXT,

  -- Asistencia y Certificado
  asistencia TEXT DEFAULT 'inscripto' NOT NULL, -- 'inscripto', 'presente', 'ausente'
  certificado_emitido BOOLEAN DEFAULT FALSE NOT NULL,
  codigo_certificado TEXT UNIQUE,

  fecha_inscripcion TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices de aceleración
CREATE INDEX IF NOT EXISTS idx_eventos_estado ON public.eventos_talleres(estado);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON public.eventos_talleres(tipo);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON public.eventos_talleres(fecha_realizacion);
CREATE INDEX IF NOT EXISTS idx_inscripciones_evento ON public.evento_inscripciones(evento_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_user ON public.evento_inscripciones(user_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_certificado ON public.evento_inscripciones(codigo_certificado);

-- Políticas RLS
ALTER TABLE public.eventos_talleres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento_inscripciones ENABLE ROW LEVEL SECURITY;

-- Eventos: Lectura pública
CREATE POLICY "Lectura pública de eventos"
  ON public.eventos_talleres FOR SELECT
  USING (true);

-- Eventos: Gestión exclusiva de administradores
CREATE POLICY "Solo Administrador puede registrar eventos"
  ON public.eventos_talleres FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Solo Administrador puede modificar eventos"
  ON public.eventos_talleres FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Solo Administrador puede eliminar eventos"
  ON public.eventos_talleres FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Inscripciones: El usuario ve sus propias inscripciones, el admin ve todas
CREATE POLICY "Usuarios ven sus inscripciones a eventos"
  ON public.evento_inscripciones FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Usuarios se inscriben en eventos"
  ON public.evento_inscripciones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin o usuario actualiza inscripciones"
  ON public.evento_inscripciones FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =====================================================================
-- 13. TIENDA INSTITUCIONAL Y MARKETPLACE (ETAPA 7)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.tienda_productos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  descripcion TEXT NOT NULL,
  categoria TEXT NOT NULL, -- 'centenario', 'indumentaria', 'libros', 'souvenirs', 'accesorios'
  precio NUMERIC NOT NULL,
  precio_socio_bronce NUMERIC,
  precio_socio_plata NUMERIC,
  precio_socio_oro NUMERIC,
  imagen_url TEXT NOT NULL,
  imagenes_galeria TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0 NOT NULL,
  destacado BOOLEAN DEFAULT FALSE,
  talles TEXT[] DEFAULT '{}',
  colores TEXT[] DEFAULT '{}',
  activo BOOLEAN DEFAULT TRUE,
  etiqueta_especial TEXT,
  detalles_tecnicos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tienda_pedidos (
  id TEXT PRIMARY KEY,
  codigo_pedido TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nombre_cliente TEXT NOT NULL,
  telefono_whatsapp TEXT NOT NULL,
  email_cliente TEXT,
  dni_cliente TEXT,
  metodo_entrega TEXT NOT NULL, -- 'retiro_biblioteca', 'envio_domicilio'
  direccion_envio TEXT,
  localidad TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_bruto NUMERIC NOT NULL,
  descuento_protector NUMERIC DEFAULT 0,
  total_final NUMERIC NOT NULL,
  tipo_protector_aplicado TEXT DEFAULT 'ninguno',
  metodo_pago TEXT NOT NULL, -- 'whatsapp_acordar', 'transferencia', 'mercadopago'
  estado TEXT DEFAULT 'pendiente' NOT NULL, -- 'pendiente', 'confirmado', 'preparado', 'entregado', 'cancelado'
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS: Tienda Productos
ALTER TABLE public.tienda_productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de productos activos"
  ON public.tienda_productos FOR SELECT
  USING (true);

CREATE POLICY "Admin gestiona productos de tienda"
  ON public.tienda_productos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS: Tienda Pedidos
ALTER TABLE public.tienda_pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede registrar un pedido"
  ON public.tienda_pedidos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuario ve sus pedidos o Admin ve todos"
  ON public.tienda_pedidos FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin gestiona pedidos"
  ON public.tienda_pedidos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


