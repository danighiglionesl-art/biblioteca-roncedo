-- =====================================================================
-- MIGRACIÓN SUPABASE: TABLA DE LIBROS FÍSICOS (INVENTARIO OFICIAL)
-- CLUB SPORTIVO Y BIBLIOTECA DR. LAUTARO RONCEDO (ALCIRA GIGENA)
-- Fecha: 14 de Octubre de 2026
-- =====================================================================

-- 1. Crear tabla central de libros físicos
CREATE TABLE IF NOT EXISTS public.libros_fisicos (
  id TEXT PRIMARY KEY, -- Ej: 'libro-1384'
  numero_inventario INTEGER NOT NULL UNIQUE,
  anio_incorporacion TEXT,
  autor TEXT NOT NULL,
  titulo TEXT NOT NULL,
  edicion_anio TEXT,
  lugar TEXT,
  editorial TEXT,
  procedencia TEXT,
  donante_o_detalle TEXT,
  topografia_ubicacion TEXT,
  isbn TEXT,
  portada_url TEXT,
  estado_portada TEXT DEFAULT 'sin_portada',
  portada_fuente TEXT DEFAULT 'ninguna',
  portada_confianza TEXT DEFAULT 'ninguna',
  portada_detalles TEXT,
  estado TEXT DEFAULT 'disponible' NOT NULL, -- 'disponible', 'prestado'
  prestado_a JSONB,
  lista_espera JSONB DEFAULT '[]'::jsonb,
  categoria TEXT,
  sinopsis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_libros_fisicos_inv ON public.libros_fisicos(numero_inventario);
CREATE INDEX IF NOT EXISTS idx_libros_fisicos_estado ON public.libros_fisicos(estado);
CREATE INDEX IF NOT EXISTS idx_libros_fisicos_isbn ON public.libros_fisicos(isbn);
CREATE INDEX IF NOT EXISTS idx_libros_fisicos_trgm_titulo ON public.libros_fisicos USING gin (titulo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_libros_fisicos_trgm_autor ON public.libros_fisicos USING gin (autor gin_trgm_ops);

-- 3. Habilitar Seguridad por Filas (Row Level Security - RLS)
ALTER TABLE public.libros_fisicos ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de RLS
-- Lectura pública: socios, usuarios y visitantes pueden consultar todo el inventario
DROP POLICY IF EXISTS "Lectura pública de libros físicos" ON public.libros_fisicos;
CREATE POLICY "Lectura pública de libros físicos"
  ON public.libros_fisicos FOR SELECT
  USING (true);

-- Inserción y actualización:
DROP POLICY IF EXISTS "Permitir gestión de libros físicos" ON public.libros_fisicos;
CREATE POLICY "Permitir gestión de libros físicos"
  ON public.libros_fisicos FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Trigger automático para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_libros_fisicos_updated ON public.libros_fisicos;
CREATE TRIGGER on_libros_fisicos_updated
  BEFORE UPDATE ON public.libros_fisicos
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
