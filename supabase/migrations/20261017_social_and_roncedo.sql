-- ====================================================================
-- Migración: Sistema de Museo Dr. Lautaro Roncedo (ABM) e Interacciones Sociales
-- Fecha: 17 de Octubre de 2026
-- ====================================================================

-- 1. TABLA: roncedo_items (ABM de Fotos, Videos y Documentos PDF con Comentario Admin)
CREATE TABLE IF NOT EXISTS public.roncedo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL CHECK (tipo IN ('foto', 'video', 'pdf')),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    comentario_admin TEXT, -- Comentario exclusivo del administrador / biblioroncedo
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    fecha_o_anio TEXT DEFAULT '1926',
    categoria TEXT NOT NULL DEFAULT 'General',
    duracion_o_paginas TEXT,
    creado_por TEXT DEFAULT 'biblioroncedo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_roncedo_tipo ON public.roncedo_items(tipo);
CREATE INDEX IF NOT EXISTS idx_roncedo_categoria ON public.roncedo_items(categoria);

-- 2. TABLA: social_reacciones (Reacciones estilo red social: corazón, pulgar, aplauso, bombilla, patrimonio)
CREATE TABLE IF NOT EXISTS public.social_reacciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seccion TEXT NOT NULL, -- 'roncedo', 'libros_fisicos', 'libros_digitales', 'audiolibros', 'fototeca', 'videoteca', 'actas'
    item_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    tipo_reaccion TEXT NOT NULL CHECK (tipo_reaccion IN ('corazon', 'pulgar', 'aplauso', 'bombilla', 'patrimonio')),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_social_reaccion_unica UNIQUE (seccion, item_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_reacciones_item ON public.social_reacciones(seccion, item_id);

-- 3. TABLA: social_comentarios (Comentarios y memorias comunitarias con hilos y likes)
CREATE TABLE IF NOT EXISTS public.social_comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seccion TEXT NOT NULL,
    item_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_nombre TEXT NOT NULL,
    user_role TEXT DEFAULT 'socio',
    user_avatar TEXT,
    texto TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    likes_users JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_comentarios_item ON public.social_comentarios(seccion, item_id, created_at DESC);

-- ====================================================================
-- Políticas de Seguridad RLS (Row Level Security)
-- ====================================================================

-- Habilitar RLS en las tablas
ALTER TABLE public.roncedo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comentarios ENABLE ROW LEVEL SECURITY;

-- Políticas de Lectura Pública (Todos los usuarios de la App pueden ver)
CREATE POLICY "Lectura pública de items de Roncedo"
    ON public.roncedo_items FOR SELECT
    USING (true);

CREATE POLICY "Lectura pública de reacciones sociales"
    ON public.social_reacciones FOR SELECT
    USING (true);

CREATE POLICY "Lectura pública de comentarios sociales"
    ON public.social_comentarios FOR SELECT
    USING (true);

-- Políticas de Escritura para Reacciones Sociales (Cualquier usuario puede reaccionar o cambiar reacción)
CREATE POLICY "Usuarios pueden insertar o actualizar su reacción"
    ON public.social_reacciones FOR ALL
    USING (true)
    WITH CHECK (true);

-- Políticas de Escritura para Comentarios Sociales (Cualquier usuario puede comentar)
CREATE POLICY "Usuarios pueden publicar comentarios"
    ON public.social_comentarios FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Usuarios o administradores pueden moderar comentarios"
    ON public.social_comentarios FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Usuarios o administradores pueden eliminar comentarios"
    ON public.social_comentarios FOR DELETE
    USING (true);

-- Políticas de Escritura para Roncedo Items (Permitir inserción y actualización)
CREATE POLICY "Administradores pueden gestionar items de Roncedo"
    ON public.roncedo_items FOR ALL
    USING (true)
    WITH CHECK (true);
