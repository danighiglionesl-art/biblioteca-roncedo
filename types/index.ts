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
  datos_completados?: boolean;
  created_at: string;
  // Campos cuando es socio
  numero_socio?: string;
  categoria_socio?: CategoriaSocio;
  fecha_alta_socio?: string;
  estado_cuota?: EstadoCuota;
  qr_hash?: string;
  // Campos de Socio Protector (Independiente de la condición de socio)
  es_socio_protector?: boolean;
  tipo_socio_protector?: TipoSocioProtector;
  estado_socio_protector?: EstadoSocioProtector;
  importe_mensual?: number;
  proveedor_pago?: ProveedorPago | string;
  id_suscripcion_externa?: string;
  fecha_adhesion?: string;
  fecha_ultimo_pago?: string;
  proximo_vencimiento?: string;
}

// =====================================================================
// TIPOS DEL MÓDULO SOCIO PROTECTOR Y ARQUITECTURA DESACOPLADA DE PAGOS
// =====================================================================

export type TipoSocioProtector = 'Bronce' | 'Plata' | 'Oro';

export type EstadoSocioProtector = 'activo' | 'pendiente' | 'inactivo';

export type ProveedorPago = 'mercadopago' | 'mobbex' | 'transferencia' | 'efectivo';

export type EstadoSuscripcion = 'activa' | 'pendiente' | 'pausada' | 'cancelada' | 'rechazada';

export type EstadoPago = 'aprobado' | 'pendiente' | 'rechazado' | 'reembolsado';

export interface SocioProtectorRecord {
  id: string;
  user_id: string;
  tipo: TipoSocioProtector;
  estado: EstadoSocioProtector;
  importe_mensual: number;
  proveedor_pago: ProveedorPago | string;
  id_suscripcion_externa?: string;
  fecha_adhesion: string;
  fecha_ultimo_pago?: string;
  proximo_vencimiento?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SuscripcionRecord {
  id: string;
  user_id: string;
  socio_protector_id?: string;
  proveedor: ProveedorPago | string;
  id_externo_suscripcion: string;
  plan_id_externo?: string;
  estado: EstadoSuscripcion;
  importe: number;
  moneda: string;
  frecuencia: string;
  fecha_inicio: string;
  fecha_cancelacion?: string;
  metadata?: Record<string, any>;
}

export interface PagoRecord {
  id: string;
  user_id: string;
  suscripcion_id?: string;
  proveedor: ProveedorPago | string;
  id_transaccion_externa: string;
  monto: number;
  moneda: string;
  estado: EstadoPago;
  fecha_pago: string;
  detalle?: string;
  raw_data?: Record<string, any>;
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
  imagenes?: string[]; // Hasta 5 fotografías por novedad
  categoria: 'Institucional' | 'Cultura' | 'Libros' | 'Archivo';
  destacado?: boolean;
  autor?: string;
  created_at?: string;
  updated_at?: string;
}

// =====================================================================
// TIPOS DE BIBLIOTECA FÍSICA (INVENTARIO OFICIAL Y GESTIÓN DE EJEMPLARES)
// =====================================================================

export interface PrestadoDetalle {
  user_id: string;
  nombre_socio: string;
  numero_socio: string;
  fecha_prestamo: string;
  fecha_devolucion_prevista: string;
}

export interface EsperaDetalle {
  user_id: string;
  nombre_socio: string;
  numero_socio: string;
  fecha_solicitud: string;
}

export interface LibroFisico {
  id: string;
  numero_inventario: number;
  anio_incorporacion: number | string;
  autor: string;
  titulo: string;
  edicion_anio?: string | number;
  lugar?: string;
  editorial?: string;
  procedencia?: string;
  donante_o_detalle?: string;
  topografia_ubicacion?: string;
  isbn?: string;
  portada_url?: string;
  estado_portada?: 'aprobada' | 'pendiente_revision' | 'sin_portada';
  portada_fuente?: 'google_books' | 'open_library' | 'manual' | 'ninguna';
  portada_confianza?: 'alta' | 'media' | 'baja' | 'ninguna';
  portada_detalles?: string;
  estado: 'disponible' | 'prestado';
  prestado_a?: PrestadoDetalle;
  lista_espera?: EsperaDetalle[];
}

export interface PrestamoActivo {
  id: string;
  libro_id: string;
  numero_inventario: number;
  titulo: string;
  autor: string;
  editorial?: string;
  topografia_ubicacion?: string;
  portada_url?: string;
  user_id: string;
  nombre_socio: string;
  numero_socio: string;
  fecha_prestamo: string;
  fecha_devolucion_prevista: string;
  estado: 'en_termino' | 'vencido' | 'devuelto';
  renovaciones: number;
}

export interface ReservaActiva {
  id: string;
  libro_id: string;
  numero_inventario: number;
  titulo: string;
  autor: string;
  topografia_ubicacion?: string;
  portada_url?: string;
  user_id: string;
  nombre_socio: string;
  numero_socio: string;
  fecha_reserva: string;
  posicion_espera: number;
  estado: 'en_espera' | 'disponible_para_retirar' | 'cancelada';
}

export interface TallerInscripcion {
  id: string;
  titulo: string;
  disciplina: string;
  profesor?: string;
  dia_horario: string;
  lugar: string;
  fecha_proxima: string;
  estado: 'confirmado' | 'en_espera';
}

export interface FotoAportada {
  id: string;
  user_id: string;
  titulo: string;
  anio_aproximado?: string;
  descripcion: string;
  imagen_url: string;
  fecha_aporte: string;
  estado: 'aprobada' | 'en_revision';
}

// =====================================================================
// TIPOS DE BIBLIOTECA DIGITAL (INTEGRACIÓN DE LAS 4 PLATAFORMAS)
// =====================================================================

export type FuenteDigital = 'gutenberg' | 'wikisource' | 'cervantes' | 'openlibrary';

export type DisponibilidadDigital = 'descarga_libre' | 'lectura_directa' | 'prestamo_externo';

export interface FormatoDescarga {
  tipo: 'epub' | 'pdf' | 'html' | 'txt' | 'externo';
  label: string;
  url: string;
}

export interface LibroDigital {
  id: string;
  titulo: string;
  autor: string;
  editorial?: string;
  anio?: string | number;
  idioma: string;
  descripcion?: string;
  portada_url?: string;
  fuente: FuenteDigital;
  fuentes_adicionales?: FuenteDigital[];
  enlace_oficial: string;
  disponibilidad: DisponibilidadDigital;
  formatos: FormatoDescarga[];
  es_argentino_o_latino?: boolean;
  genero_o_materia?: string;
  texto_directo_pwa?: string;
  wikisource_page?: string;
  gutenberg_id?: number;
  ia_id?: string;
}

export interface DigitalSearchParams {
  q?: string;
  tipo_busqueda?: 'todos' | 'titulo' | 'autor' | 'editorial' | 'genero';
  fuente?: 'todas' | FuenteDigital;
  disponibilidad?: 'todas' | DisponibilidadDigital;
  solo_argentinos_latinos?: boolean;
}

// =====================================================================
// TIPOS DE FOTOTECA HISTÓRICA INTELIGENTE
// =====================================================================

export type EstadoModeracionFoto = 'publicada' | 'reportada' | 'oculta';

export type ColeccionFoto = 
  | 'Todas'
  | 'Club Roncedo y Deportes'
  | 'Alcira Gigena e Historia Urbana'
  | 'Familias y Vecinos Ilustres'
  | 'Escuelas e Instituciones'
  | 'Fiestas y Tradición'
  | 'Dr. Lautaro Roncedo';

export interface EtiquetaPersona {
  id: string;
  foto_id: string;
  nombre_persona: string;
  rol_o_detalle?: string;
  pos_x_porcentaje?: number;
  pos_y_porcentaje?: number;
  identificado_por_user_id?: string;
  identificado_por_nombre?: string;
  created_at?: string;
}

export interface ComentarioFoto {
  id: string;
  foto_id: string;
  user_id?: string;
  nombre_usuario: string;
  comentario: string;
  created_at: string;
}

export interface FotoHistorica {
  id: string;
  titulo: string;
  descripcion?: string;
  anio_estimado?: number;
  decada?: string; // '1920s', '1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s'
  fecha_exacta?: string;
  lugar?: string;
  institucion?: string;
  acontecimiento?: string;
  coleccion?: ColeccionFoto | string;
  imagen_url: string;
  storage_path?: string;
  autor_fotografo?: string;
  donante_fuente?: string;
  subido_por_user_id?: string;
  subido_por_nombre?: string;
  estado_moderacion: EstadoModeracionFoto;
  reportes_count?: number;
  motivo_ultimo_reporte?: string;
  destacada?: boolean;
  etiquetas_personas?: EtiquetaPersona[];
  comentarios?: ComentarioFoto[];
  created_at: string;
  updated_at?: string;
}

// =====================================================================
// TIPOS DEL ARCHIVO DIGITAL DE ACTAS HISTÓRICAS
// =====================================================================

export type TipoReunionActa =
  | 'Asamblea General Constitutiva'
  | 'Asamblea General Ordinaria'
  | 'Asamblea General Extraordinaria'
  | 'Reunión de Comisión Directiva'
  | 'Reunión de Subcomisión'
  | 'Acta Notarial / Especial';

export interface FirmanteActa {
  nombre: string;
  cargo?: string;
}

export interface FolioArchivo {
  id: string;
  numero_pagina: number; // 1 a 102
  folio: number; // Folio 1 a 51
  lado: 'Debe' | 'Haber' | 'Único';
  libro: string;
  archivo: string; // Nombre del archivo físico, ej: Libro Nb0 1-1.jpg
  imagen_url: string;
  anio_estimado?: number;
  acta_id_asociada?: string;
  numero_acta_asociada?: number | string;
  resumen_breve?: string;
  estado_conservacion?: 'Excelente' | 'Bueno' | 'Regular' | 'Restaurado';
}

export interface ActaHistorica {
  id: string;
  numero_acta: number | string;
  libro: string;
  folio_inicio?: number | string;
  folio_fin?: number | string;
  pagina_archivo_inicio: number; // 1 a 102
  pagina_archivo_fin: number; // 1 a 102
  fecha: string; // YYYY-MM-DD
  anio: number;
  titulo: string;
  tipo_reunion: TipoReunionActa;
  lugar?: string;
  asistentes_count?: number;
  resumen: string;
  transcripcion_completa?: string;
  firmantes?: FirmanteActa[];
  temas_tratados?: string[];
  archivos: string[];
  imagenes_urls?: string[];
  estado_conservacion?: 'Excelente' | 'Bueno' | 'Regular' | 'Restaurado';
  es_destacada?: boolean;
  notas_archivista?: string;
  created_at?: string;
  updated_at?: string;
}

// =====================================================================
// TIPOS DEL MÓDULO EVENTOS, CURSOS Y TALLERES CULTURALES
// =====================================================================

export interface TramoPrecioFecha {
  id: string;
  fecha_limite: string; // YYYY-MM-DD
  precio: number;
  etiqueta?: string; // Ej: "Preventa 1", "Inscripción Temprana", "General"
}

export type TipoActividadEvento = 'taller_recurrente' | 'evento_unico';

export type CategoriaEvento =
  | 'Cultura'
  | 'Deportes'
  | 'Educación'
  | 'Infantil'
  | 'Salud y Bienestar'
  | 'General';

export interface EventoTaller {
  id: string;
  titulo: string;
  descripcion: string;
  organizador: string; // Quién lo organiza o dicta (ej: Prof. de Yoga)
  tipo: TipoActividadEvento;
  categoria: CategoriaEvento;
  
  // Para eventos únicos / jornadas puntuales
  fecha_realizacion?: string; // YYYY-MM-DD
  horario?: string; // Ej: '19:00 a 21:00 hs'
  
  // Para talleres regulares / clases recurrentes
  es_recurrente: boolean;
  dias_dictado: string[]; // Ej: ['Martes', 'Jueves']
  horario_recurrente?: string; // Ej: '18:00 a 19:30 hs'
  fecha_inicio_ciclo?: string; // YYYY-MM-DD
  fecha_fin_ciclo?: string; // YYYY-MM-DD

  // Ubicación y capacidad
  lugar: string; // Ej: 'Sede Social', 'Sala de Lectura', 'Salón de Actos'
  cupo_maximo?: number;
  cupo_disponible?: number;
  imagen_url?: string;

  // Esquema económico
  es_gratuito: boolean;
  precio_base: number; // Precio estándar / último tramo
  tramos_precio: TramoPrecioFecha[]; // Tramos escalonados por fecha límite
  
  // Descuentos para Socios Protectores (Default: 2%, 5%, 10%)
  descuento_bronce_porcentaje: number;
  descuento_plata_porcentaje: number;
  descuento_oro_porcentaje: number;

  // Vías de pago
  link_pago?: string; // Enlace de Mercado Pago u otro
  datos_transferencia?: string; // Alias / CBU

  // Estado y visibilidad
  estado: 'activo' | 'finalizado' | 'cancelado';
  destacado?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface EventoInscripcion {
  id: string;
  evento_id: string;
  evento_titulo?: string;
  user_id: string;
  user_nombre: string;
  user_apellido: string;
  user_email: string;
  user_dni?: string;
  user_telefono?: string;
  user_tipo_protector: TipoSocioProtector | 'no_socio';
  
  // Liquidación del precio
  monto_base: number;
  descuento_porcentaje: number;
  monto_descuento: number;
  monto_final: number;
  tramo_aplicado?: string;

  // Estado del pago
  estado_pago: 'pendiente' | 'aprobado' | 'bonificado';
  comprobante_url?: string;
  id_transaccion_pago?: string;

  // Asistencia y Certificación
  asistencia: 'inscripto' | 'presente' | 'ausente';
  certificado_emitido: boolean;
  codigo_certificado?: string;

  fecha_inscripcion: string;
}

// =====================================================================
// TIPOS DE LA TIENDA INSTITUCIONAL Y MARKETPLACE (ETAPA 7)
// =====================================================================

export type CategoriaProductoTienda =
  | 'libros'
  | 'indumentaria'
  | 'souvenirs'
  | 'centenario'
  | 'accesorios';

export interface ProductoTienda {
  id: string;
  titulo: string;
  subtitulo?: string;
  descripcion: string;
  categoria: CategoriaProductoTienda;
  precio: number;
  precio_socio_bronce?: number; // 2% off
  precio_socio_plata?: number;  // 5% off
  precio_socio_oro?: number;    // 10% off
  imagen_url: string;
  imagenes_galeria?: string[];
  stock: number;
  destacado?: boolean;
  talles?: string[]; // Ej: ['S', 'M', 'L', 'XL', 'XXL']
  colores?: string[];
  activo: boolean;
  etiqueta_especial?: string; // Ej: 'Edición Centenario', 'Más vendido', 'Novedad'
  detalles_tecnicos?: string[];
  created_at: string;
  updated_at?: string;
}

export interface ItemCarritoTienda {
  producto: ProductoTienda;
  cantidad: number;
  talleSeleccionado?: string;
  colorSeleccionado?: string;
  precioUnitario: number;
  descuentoUnitario: number;
  precioFinalUnitario: number;
  subtotal: number;
}

export type MetodoEntregaTienda = 'retiro_biblioteca' | 'envio_domicilio';
export type EstadoPedidoTienda = 'pendiente' | 'confirmado' | 'preparado' | 'entregado' | 'cancelado';
export type MetodoPagoTienda = 'whatsapp_acordar' | 'transferencia' | 'mercadopago';

export interface PedidoTienda {
  id: string;
  codigo_pedido: string;
  user_id?: string;
  nombre_cliente: string;
  telefono_whatsapp: string;
  email_cliente?: string;
  dni_cliente?: string;
  metodo_entrega: MetodoEntregaTienda;
  direccion_envio?: string;
  localidad?: string;
  items: ItemCarritoTienda[];
  total_bruto: number;
  descuento_protector: number;
  total_final: number;
  tipo_protector_aplicado: TipoSocioProtector | 'ninguno';
  metodo_pago: MetodoPagoTienda;
  estado: EstadoPedidoTienda;
  notas?: string;
  created_at: string;
  updated_at?: string;
}
