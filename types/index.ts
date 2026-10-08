export type UserRole = 'usuario' | 'socio' | 'admin';

export type CategoriaSocio = 'Activo' | 'Cadete' | 'Vitalicio' | 'Familiar' | 'Honorario';

export type EstadoCuota = 'al_dia' | 'pendiente' | 'exento';

export type SexoOption = 'Mujer' | 'Hombre' | 'Prefiero no decirlo';

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  nombre: string;
  apellido: string;
  dni?: string;
  fecha_nacimiento?: string;
  sexo?: SexoOption | string;
  whatsapp_codigo?: string;
  whatsapp?: string;
  telefono?: string;
  pais?: string;
  provincia?: string;
  localidad?: string;
  codigo_postal?: string;
  barrio?: string;
  calle?: string;
  numero?: string;
  domicilio?: string;
  observaciones?: string;
  avatar_url?: string;
  created_at: string;
  // Campos cuando es socio
  numero_socio?: string;
  categoria_socio?: CategoriaSocio;
  fecha_alta_socio?: string;
  estado_cuota?: EstadoCuota;
  qr_hash?: string;
}

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export interface SocioSolicitud {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  telefono: string;
  domicilio: string;
  localidad: string;
  codigo_postal?: string;
  fecha_nacimiento?: string;
  categoria_solicitada: CategoriaSocio;
  estado: EstadoSolicitud;
  fecha_solicitud: string;
  fecha_resolucion?: string;
  notas_admin?: string;
}

export interface NovedadInstitucional {
  id: string;
  titulo: string;
  bajada: string;
  contenido: string;
  fecha: string;
  imagen_url?: string;
  categoria: 'Institucional' | 'Cultura' | 'Libros' | 'Archivo';
  destacado?: boolean;
}
