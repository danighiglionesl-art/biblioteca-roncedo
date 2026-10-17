export type TipoSeccionSocial =
  | 'roncedo'
  | 'libros_fisicos'
  | 'libros_digitales'
  | 'audiolibros'
  | 'fototeca'
  | 'videoteca'
  | 'actas';

export type TipoReaccionSocial =
  | 'corazon'      // ❤️ Me encanta
  | 'pulgar'       // 👍 Me gusta / Útil
  | 'aplauso'      // 👏 Aplausos / Felicitaciones
  | 'bombilla'     // 💡 Inspirador / Interesante
  | 'patrimonio';  // 🏛️ Orgullo Roncedo

export interface ReaccionConfig {
  tipo: TipoReaccionSocial;
  emoji: string;
  label: string;
  descripcion: string;
  color: string;
  badgeBg: string;
}

export const REACCIONES_CONFIG: Record<TipoReaccionSocial, ReaccionConfig> = {
  corazon: {
    tipo: 'corazon',
    emoji: '❤️',
    label: 'Me encanta',
    descripcion: 'Apreciado por la comunidad',
    color: 'text-red-500',
    badgeBg: 'bg-red-50 text-red-700 border-red-200',
  },
  pulgar: {
    tipo: 'pulgar',
    emoji: '👍',
    label: 'Me gusta',
    descripcion: 'Interesante y valioso',
    color: 'text-blue-500',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  aplauso: {
    tipo: 'aplauso',
    emoji: '👏',
    label: 'Aplausos',
    descripcion: 'Gran aporte o acontecimiento',
    color: 'text-amber-500',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  bombilla: {
    tipo: 'bombilla',
    emoji: '💡',
    label: 'Inspirador',
    descripcion: 'Aporte de conocimiento o idea',
    color: 'text-yellow-500',
    badgeBg: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  patrimonio: {
    tipo: 'patrimonio',
    emoji: '🏛️',
    label: 'Patrimonio',
    descripcion: 'Orgullo e identidad Roncedo',
    color: 'text-roncedo-gold',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-300',
  },
};

export interface ReaccionSocial {
  id: string;
  seccion: TipoSeccionSocial;
  item_id: string;
  user_id: string;
  user_nombre: string;
  tipo: TipoReaccionSocial;
  created_at: string;
}

export interface ComentarioSocial {
  id: string;
  seccion: TipoSeccionSocial;
  item_id: string;
  user_id: string;
  user_nombre: string;
  user_apellido?: string;
  user_avatar?: string;
  user_rol?: string;         // 'admin' | 'socio' | 'usuario'
  user_categoria?: string;   // 'Activo' | 'Cadete' | 'Vitalicio' etc.
  user_hincha?: string;
  comentario: string;
  created_at: string;
  updated_at?: string;
  likes_count?: number;
  liked_by?: string[];
}

export interface ResumenReaccionesSociales {
  total: number;
  porTipo: Record<TipoReaccionSocial, number>;
  miReaccion?: TipoReaccionSocial;
}
