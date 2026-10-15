/**
 * Tipos oficiales para el módulo de Audiolibros
 * Biblioteca Dr. Lautaro Roncedo (Alcira Gigena)
 */

export type FuenteAudiolibro =
  | 'librivox'
  | 'albalearning'
  | 'internet_archive'
  | 'horacio_lanci'
  | 'biblioteca_roncedo'
  | 'otra';

export type GeneroAudiolibro =
  | 'Literatura Argentina'
  | 'Novelas'
  | 'Cuentos'
  | 'Poesía'
  | 'Clásicos Universales'
  | 'Infantil y Juvenil'
  | 'Historia y Biografías'
  | 'Teatro'
  | 'Filosofía y Ensayo'
  | 'Otro';

export interface CapituloAudiolibro {
  id: string;
  numero: number;
  titulo: string;
  audio_url: string;
  duracion_segundos: number;
  duracion_texto: string;
  narrador?: string;
  archivo_tamanio?: string;
}

export interface Audiolibro {
  id: string;
  titulo: string;
  subtitulo?: string;
  autor: string;
  narrador?: string;
  genero: GeneroAudiolibro | string;
  sinopsis: string;
  duracion_total_segundos: number;
  duracion_texto: string;
  idioma: string;
  portada_url: string;
  fuente: FuenteAudiolibro;
  fuente_nombre: string;
  enlace_fuente?: string;
  licencia: string; // Ej: 'Dominio Público', 'Creative Commons BY-NC-SA', 'Autorizada por Biblioteca Roncedo'
  es_argentino_o_latino?: boolean;
  anio_publicacion?: string | number;
  capitulos: CapituloAudiolibro[];
  fecha_incorporacion: string;
  activo: boolean;
  reproducciones: number;
  favoritos_count?: number;
  tags?: string[];
}

export interface ProgresoAudiolibro {
  audiolibro_id: string;
  audiolibro_titulo: string;
  audiolibro_autor: string;
  portada_url: string;
  capitulo_id: string;
  capitulo_numero: number;
  capitulo_titulo: string;
  segundo_actual: number;
  segundo_total: number;
  porcentaje: number;
  completado: boolean;
  ultima_reproduccion: string;
}

export type VelocidadReproduccion = 0.75 | 1 | 1.25 | 1.5 | 2;

export type SleepTimerOption = 15 | 30 | 45 | 60 | 'fin_capitulo' | null;
