export type TipoItemRoncedo = 'foto' | 'video' | 'pdf';

export type CategoriaItemRoncedo =
  | 'Medicina y Humanismo'
  | 'Cartas y Documentos'
  | 'Vida Personal y Familia'
  | 'Club e Historia Fundacional'
  | 'Homenajes y Reconocimientos'
  | 'General';

export interface ItemRoncedo {
  id: string;
  tipo: TipoItemRoncedo;
  titulo: string;
  descripcion: string;
  comentario_admin?: string; // Comentario editorial y exclusivo del usuario administrador
  url: string;              // Enlace de la foto, video (YouTube/MP4) o documento PDF
  thumbnail_url?: string;   // Portada o miniatura opcional
  fecha_o_anio: string;     // Ej: "1924", "15 de Marzo de 1926"
  categoria: CategoriaItemRoncedo;
  duracion_o_paginas?: string; // Ej: "12 min", "4 páginas", "3.2 MB"
  creado_por: string;       // Ej: "biblioroncedo"
  created_at: string;
  updated_at: string;
}
