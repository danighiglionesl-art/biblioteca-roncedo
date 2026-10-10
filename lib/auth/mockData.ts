import { UserProfile, SocioSolicitud, NovedadInstitucional } from '@/types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-admin-roncedo',
    username: 'biblioroncedo',
    email: 'biblioroncedo@bibliotecaroncedo.ar',
    role: 'admin',
    nombre: 'Biblioteca',
    apellido: 'Roncedo',
    dni: '1926-RONCEDO',
    fecha_nacimiento: '1926-05-01',
    sexo: 'Prefiero no decirlo',
    telefono: '+54 9 3585 62-1547',
    whatsapp_codigo: '+54',
    whatsapp: '93585621547',
    pais: 'Argentina',
    provincia: 'Córdoba',
    localidad: 'Alcira Gigena',
    codigo_postal: '5811',
    barrio: 'Centro',
    calle: 'Belgrano',
    numero: '450',
    domicilio: 'Belgrano 450',
    observaciones: 'Cuenta Oficial de Administración de Biblioteca Roncedo.',
    avatar_url: '/images/escudo-roncedo.png',
    numero_socio: 'ADMIN-01',
    categoria_socio: 'Honorario',
    fecha_alta_socio: '1926-05-01',
    estado_cuota: 'al_dia',
    created_at: '1926-05-01T00:00:00Z',
  },
];

export const INITIAL_SOLICITUDES: SocioSolicitud[] = [];

export const NOVEDADES_INICIALES: NovedadInstitucional[] = [
  {
    id: 'nov-01',
    titulo: 'Lanzamiento de la Plataforma Digital y Carnet Digital',
    bajada: 'La Biblioteca del Club Sportivo y Biblioteca Dr. Lautaro Roncedo da un paso histórico hacia el futuro con su nueva plataforma web progresiva.',
    contenido: 'Con inmensa alegría ponemos a disposición de todos nuestros socios y la comunidad de Alcira Gigena esta nueva herramienta digital que permitirá consultar libros, acceder a actas históricas, participar de actividades culturales y llevar el carnet social en el teléfono.',
    fecha: '2026-04-07',
    categoria: 'Institucional',
    destacado: true,
  },
  {
    id: 'nov-02',
    titulo: 'Digitalización del Archivo Histórico de Actas y Fotografías',
    bajada: 'Iniciamos el rescate y preservación de documentos fundacionales de nuestra querida institución y del pueblo.',
    contenido: 'Un equipo de colaboradores se encuentra trabajando en la digitalización sistemática de libros de actas y fotografías históricas aportadas por familias de Alcira Gigena. Muy pronto podrás buscar acontecimientos y antepasados desde tu celular.',
    fecha: '2026-04-05',
    categoria: 'Archivo',
    destacado: false,
  },
  {
    id: 'nov-03',
    titulo: 'Nuevas incorporaciones al catálogo literario',
    bajada: 'Más de 40 títulos de literatura argentina, historia y narrativa infantil ya están disponibles.',
    contenido: 'Los socios con cuota al día ya pueden consultar la disponibilidad en biblioteca y reservar sus ejemplares favoritos para el fin de semana.',
    fecha: '2026-04-01',
    categoria: 'Libros',
    destacado: false,
  },
];
