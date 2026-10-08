/**
 * Datos oficiales de contacto institucional de la Biblioteca Roncedo.
 * Celular oficial para consultas por WhatsApp: +54 9 3585 62-1547
 */

export const CONTACTO_BIBLIOTECA = {
  // Número internacional limpio para enlaces de WhatsApp (wa.me)
  whatsappNumero: '5493585621547',
  
  // Número formateado visualmente para mostrar en la interfaz
  whatsappFormato: '+54 9 3585 62-1547',
  
  // Número telefónico institucional
  telefono: '+54 9 3585 62-1547',
  telefonoVisual: '+54 9 3585 62-1547',
  
  codigoPais: '+54',
  caracteristica: '3585',
  numeroLocal: '621547',

  // Datos institucionales
  nombreInstitucion: 'Biblioteca C.S. y B. Dr. Lautaro Roncedo',
  localidad: 'Alcira Gigena',
  provincia: 'Córdoba',
  direccion: 'Belgrano 450, Alcira Gigena, Córdoba',
  email: 'admin@bibliotecaroncedo.ar',

  // Generador de enlace WhatsApp con mensaje personalizado
  getWhatsAppUrl: (mensaje: string = 'Hola, quisiera hacer una consulta a la Biblioteca Roncedo') => {
    return `https://wa.me/5493585621547?text=${encodeURIComponent(mensaje)}`;
  },

  // Enlace para consultas sobre el programa de Socio Protector
  getWhatsAppSocioProtectorUrl: (plan?: string) => {
    const texto = plan
      ? `Hola, quisiera hacer una consulta sobre la adhesión como Socio Protector (${plan}) de la Biblioteca Roncedo.`
      : `Hola, quisiera hacer una consulta sobre el programa de Socio Protector de la Biblioteca Roncedo.`;
    return `https://wa.me/5493585621547?text=${encodeURIComponent(texto)}`;
  },

  // Enlace para consultas de la Tienda Institucional
  getWhatsAppTiendaUrl: (producto?: string) => {
    const texto = producto
      ? `Hola, quisiera consultar sobre "${producto}" en la Tienda de Biblioteca Roncedo.`
      : `Hola, quisiera consultar por productos de la Tienda de Biblioteca Roncedo.`;
    return `https://wa.me/5493585621547?text=${encodeURIComponent(texto)}`;
  },

  // Enlace para asociarse o consultas generales
  getWhatsAppAsociarseUrl: () => {
    return `https://wa.me/5493585621547?text=${encodeURIComponent('Hola, quisiera consultar cómo asociarme o participar en las actividades de la Biblioteca Roncedo.')}`;
  },
};
