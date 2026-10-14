/**
 * Servicio Inteligente de Validación, Conversión y Búsqueda de ISBN (10 y 13)
 * Biblioteca Dr. Lautaro Roncedo (Alcira Gigena)
 *
 * Implementa las normas internacionales ISO 2108:
 * - ISBN-10: Módulo 11 (dígitos 0-9 y 'X' para 10)
 * - ISBN-13: Módulo 10 ponderado (1, 3, 1, 3...)
 * - Conversión automática de ISBN-10 a ISBN-13 (prefijo 978)
 * - Búsqueda automática en Google Books API y Open Library API
 * - Caché en memoria para optimizar rendimiento y cuotas de API
 */

export type TipoIsbn = 'isbn-10' | 'isbn-13' | 'invalido';

export interface IsbnValidation {
  raw: string;
  clean: string;
  tipo: TipoIsbn;
  valido: boolean;
  error?: string;
  isbn10?: string;
  isbn13?: string;
  formateado: string;
  digitoCalculado?: string;
  digitoActual?: string;
}

export interface IsbnMetadata {
  isbn: string;
  isbn10?: string;
  isbn13?: string;
  titulo: string;
  subtitulo?: string;
  autores: string[];
  autorTexto: string;
  editorial?: string;
  anio_publicacion?: string | number;
  edicion?: string;
  categoria?: string;
  sinopsis?: string;
  portada_url?: string;
  paginas?: number;
  idioma?: string;
  fuente: 'google_books' | 'open_library' | 'combinado';
  confianza: 'alta' | 'media' | 'baja';
  enlace_externo?: string;
}

// Caché en memoria de búsquedas recientes para evitar llamadas repetidas
const memoryIsbnCache = new Map<string, { data: IsbnMetadata | null; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 horas

/**
 * Limpia cualquier separador (guiones, espacios, puntos) y normaliza a mayúsculas
 */
export function limpiarIsbn(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^0-9X]/g, '');
}

/**
 * Calcula matemáticamente el dígito verificador para los primeros 9 dígitos de un ISBN-10
 * Regla: Módulo 11 ponderado con pesos decrecientes (10, 9, 8... 2)
 */
export function calcularDigitoVerificadorIsbn10(primeros9: string): string {
  if (primeros9.length !== 9 || !/^\d{9}$/.test(primeros9)) {
    throw new Error('Se requieren exactamente 9 dígitos numéricos.');
  }

  let suma = 0;
  for (let i = 0; i < 9; i++) {
    suma += parseInt(primeros9[i], 10) * (10 - i);
  }

  const residuo = (11 - (suma % 11)) % 11;
  if (residuo === 10) return 'X';
  return residuo.toString();
}

/**
 * Calcula matemáticamente el dígito verificador para los primeros 12 dígitos de un ISBN-13
 * Regla: Módulo 10 con pesos alternados 1 y 3
 */
export function calcularDigitoVerificadorIsbn13(primeros12: string): string {
  if (primeros12.length !== 12 || !/^\d{12}$/.test(primeros12)) {
    throw new Error('Se requieren exactamente 12 dígitos numéricos.');
  }

  let suma = 0;
  for (let i = 0; i < 12; i++) {
    const digito = parseInt(primeros12[i], 10);
    suma += i % 2 === 0 ? digito * 1 : digito * 3;
  }

  const residuo = (10 - (suma % 10)) % 10;
  return residuo.toString();
}

/**
 * Convierte un ISBN-10 válido a su equivalente internacional ISBN-13 (EAN-13)
 * Antepone '978', toma los primeros 9 dígitos y recalcula el dígito verificador.
 */
export function convertirIsbn10AIsbn13(isbn10: string): string | null {
  const clean = limpiarIsbn(isbn10);
  if (clean.length !== 10) return null;
  if (!/^\d{9}[0-9X]$/.test(clean)) return null;

  const primeros9 = clean.substring(0, 9);
  const base12 = `978${primeros9}`;
  const digito13 = calcularDigitoVerificadorIsbn13(base12);
  return `${base12}${digito13}`;
}

/**
 * Aplica formato estándar visual con guiones para facilitar la lectura
 */
export function formatearIsbn(clean: string): string {
  if (!clean) return '';
  if (clean.length === 10) {
    // Formato común: X-XXX-XXXXX-X
    return `${clean.slice(0, 1)}-${clean.slice(1, 4)}-${clean.slice(4, 9)}-${clean.slice(9)}`;
  }
  if (clean.length === 13) {
    // Formato común: 978-X-XXX-XXXXX-X
    return `${clean.slice(0, 3)}-${clean.slice(3, 4)}-${clean.slice(4, 7)}-${clean.slice(7, 12)}-${clean.slice(12)}`;
  }
  return clean;
}

/**
 * Valida automáticamente si una cadena corresponde a un ISBN-10 o ISBN-13 matemáticamente correcto
 */
export function validarIsbn(raw: string): IsbnValidation {
  const clean = limpiarIsbn(raw);

  if (!clean) {
    return {
      raw,
      clean: '',
      tipo: 'invalido',
      valido: false,
      error: 'El campo ISBN está vacío.',
      formateado: '',
    };
  }

  // ----------------------------------------------------
  // Validación ISBN-10
  // ----------------------------------------------------
  if (clean.length === 10) {
    // Debe tener 9 dígitos y el último 0-9 o X
    if (!/^\d{9}[0-9X]$/.test(clean)) {
      return {
        raw,
        clean,
        tipo: 'isbn-10',
        valido: false,
        error: 'El ISBN-10 debe contener 9 dígitos iniciales y terminar en un dígito o X.',
        formateado: clean,
      };
    }

    const primeros9 = clean.substring(0, 9);
    const digitoActual = clean[9];
    const digitoCalculado = calcularDigitoVerificadorIsbn10(primeros9);

    if (digitoActual === digitoCalculado) {
      const isbn13 = convertirIsbn10AIsbn13(clean) || undefined;
      return {
        raw,
        clean,
        tipo: 'isbn-10',
        valido: true,
        isbn10: clean,
        isbn13,
        formateado: formatearIsbn(clean),
        digitoCalculado,
        digitoActual,
      };
    } else {
      return {
        raw,
        clean,
        tipo: 'isbn-10',
        valido: false,
        error: `Dígito verificador incorrecto: se ingresó '${digitoActual}' pero corresponde '${digitoCalculado}'.`,
        formateado: clean,
        digitoCalculado,
        digitoActual,
      };
    }
  }

  // ----------------------------------------------------
  // Validación ISBN-13
  // ----------------------------------------------------
  if (clean.length === 13) {
    if (!/^\d{13}$/.test(clean)) {
      return {
        raw,
        clean,
        tipo: 'isbn-13',
        valido: false,
        error: 'El ISBN-13 debe estar compuesto exclusivamente por dígitos numéricos.',
        formateado: clean,
      };
    }

    const prefijo = clean.substring(0, 3);
    if (prefijo !== '978' && prefijo !== '979') {
      return {
        raw,
        clean,
        tipo: 'isbn-13',
        valido: false,
        error: `Prefijo inválido (${prefijo}). Los ISBN-13 oficiales comienzan con 978 o 979.`,
        formateado: clean,
      };
    }

    const primeros12 = clean.substring(0, 12);
    const digitoActual = clean[12];
    const digitoCalculado = calcularDigitoVerificadorIsbn13(primeros12);

    if (digitoActual === digitoCalculado) {
      return {
        raw,
        clean,
        tipo: 'isbn-13',
        valido: true,
        isbn13: clean,
        formateado: formatearIsbn(clean),
        digitoCalculado,
        digitoActual,
      };
    } else {
      return {
        raw,
        clean,
        tipo: 'isbn-13',
        valido: false,
        error: `Dígito verificador incorrecto: se ingresó '${digitoActual}' pero matemáticamente corresponde '${digitoCalculado}'.`,
        formateado: clean,
        digitoCalculado,
        digitoActual,
      };
    }
  }

  // Longitud no estándar
  return {
    raw,
    clean,
    tipo: 'invalido',
    valido: false,
    error: `Longitud incorrecta (${clean.length} caracteres). Un ISBN debe tener exactamente 10 o 13 caracteres.`,
    formateado: clean,
  };
}

/**
 * Consulta Google Books API por ISBN
 */
async function consultarGoogleBooksPorIsbn(cleanIsbn: string): Promise<Partial<IsbnMetadata> | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || '';
    const keyParam = apiKey ? `&key=${apiKey}` : '';
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}${keyParam}&maxResults=1`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'BibliotecaRoncedo/1.0 (bibliotecaroncedo.ar; contacto@bibliotecaroncedo.ar)',
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;

    const vol = data.items[0].volumeInfo;
    if (!vol || !vol.title) return null;

    let portada =
      vol.imageLinks?.extraLarge ||
      vol.imageLinks?.large ||
      vol.imageLinks?.medium ||
      vol.imageLinks?.thumbnail ||
      vol.imageLinks?.smallThumbnail ||
      '';

    if (portada) {
      portada = portada.replace(/^http:/, 'https:').replace('&edge=curl', '');
    }

    let anio: string | number | undefined = undefined;
    if (vol.publishedDate) {
      const match = vol.publishedDate.match(/\b(19\d\d|20\d\d)\b/);
      if (match) anio = match[1];
    }

    let isbn10: string | undefined;
    let isbn13: string | undefined;

    if (Array.isArray(vol.industryIdentifiers)) {
      for (const id of vol.industryIdentifiers) {
        if (id.type === 'ISBN_10') isbn10 = id.identifier;
        if (id.type === 'ISBN_13') isbn13 = id.identifier;
      }
    }

    return {
      titulo: vol.title,
      subtitulo: vol.subtitle || undefined,
      autores: Array.isArray(vol.authors) ? vol.authors : [],
      autorTexto: Array.isArray(vol.authors) ? vol.authors.join(', ') : '',
      editorial: vol.publisher || undefined,
      anio_publicacion: anio,
      categoria: Array.isArray(vol.categories) && vol.categories.length > 0 ? vol.categories[0] : undefined,
      sinopsis: vol.description || undefined,
      portada_url: portada || undefined,
      paginas: vol.pageCount || undefined,
      idioma: vol.language || undefined,
      isbn10,
      isbn13,
      enlace_externo: vol.infoLink || undefined,
      fuente: 'google_books',
    };
  } catch (err) {
    console.warn('Error consultando Google Books por ISBN:', err);
    return null;
  }
}

/**
 * Consulta Open Library API por ISBN
 */
async function consultarOpenLibraryPorIsbn(cleanIsbn: string): Promise<Partial<IsbnMetadata> | null> {
  try {
    const bibKey = `ISBN:${cleanIsbn}`;
    const url = `https://openlibrary.org/api/books?bibkeys=${bibKey}&format=json&jscmd=data`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'BibliotecaRoncedo/1.0 (bibliotecaroncedo.ar; contacto@bibliotecaroncedo.ar)',
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    const book = data[bibKey];
    if (!book || !book.title) return null;

    const autores: string[] = Array.isArray(book.authors)
      ? book.authors.map((a: any) => a.name).filter(Boolean)
      : [];

    let editorial: string | undefined;
    if (Array.isArray(book.publishers) && book.publishers.length > 0) {
      editorial = book.publishers[0].name;
    }

    let anio: string | number | undefined;
    if (book.publish_date) {
      const match = String(book.publish_date).match(/\b(19\d\d|20\d\d)\b/);
      if (match) anio = match[1];
    }

    let categoria: string | undefined;
    if (Array.isArray(book.subjects) && book.subjects.length > 0) {
      categoria = book.subjects[0].name || book.subjects[0];
    }

    let portada = book.cover?.large || book.cover?.medium || book.cover?.small || '';
    if (!portada) {
      // Intentar endpoint directo de covers de Open Library
      portada = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg?default=false`;
    }

    return {
      titulo: book.title,
      subtitulo: book.subtitle || undefined,
      autores,
      autorTexto: autores.join(', '),
      editorial,
      anio_publicacion: anio,
      categoria,
      portada_url: portada,
      paginas: book.number_of_pages || undefined,
      enlace_externo: book.url || undefined,
      fuente: 'open_library',
    };
  } catch (err) {
    console.warn('Error consultando Open Library por ISBN:', err);
    return null;
  }
}

/**
 * Función Principal de Búsqueda Bibliográfica por ISBN
 * Consulta Google Books y Open Library, combinando lo mejor de ambas fuentes oficiales
 */
export async function buscarMetadataIsbn(isbnRaw: string): Promise<IsbnMetadata | null> {
  const validacion = validarIsbn(isbnRaw);
  if (!validacion.valido) {
    throw new Error(validacion.error || 'El ISBN provisto no es válido.');
  }

  const clean = validacion.clean;

  // 1. Revisar caché en memoria
  const cached = memoryIsbnCache.get(clean);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Si es ISBN-10, preparar también la búsqueda por su equivalente ISBN-13
  const isbnsParaBuscar = [clean];
  if (validacion.tipo === 'isbn-10' && validacion.isbn13) {
    isbnsParaBuscar.push(validacion.isbn13);
  }

  let gbData: Partial<IsbnMetadata> | null = null;
  let olData: Partial<IsbnMetadata> | null = null;

  for (const candidate of isbnsParaBuscar) {
    if (!gbData) {
      gbData = await consultarGoogleBooksPorIsbn(candidate);
    }
    if (!olData) {
      olData = await consultarOpenLibraryPorIsbn(candidate);
    }
    if (gbData && olData) break;
  }

  // 3. Si ninguna fuente respondió
  if (!gbData && !olData) {
    memoryIsbnCache.set(clean, { data: null, timestamp: Date.now() });
    return null;
  }

  // 4. Consolidar metadatos (Google Books suele tener mejores sinopsis y categorías; Open Library buenos datos de edición)
  const titulo = gbData?.titulo || olData?.titulo || '';
  const subtitulo = gbData?.subtitulo || olData?.subtitulo;
  const autores = (gbData?.autores && gbData.autores.length > 0) ? gbData.autores : (olData?.autores || []);
  const autorTexto = gbData?.autorTexto || olData?.autorTexto || '';
  const editorial = gbData?.editorial || olData?.editorial;
  const anio = gbData?.anio_publicacion || olData?.anio_publicacion;
  const categoria = gbData?.categoria || olData?.categoria;
  const sinopsis = gbData?.sinopsis || olData?.sinopsis;
  const portada_url = gbData?.portada_url || olData?.portada_url;
  const paginas = gbData?.paginas || olData?.paginas;
  const idioma = gbData?.idioma || olData?.idioma;
  const enlace_externo = gbData?.enlace_externo || olData?.enlace_externo;

  const resultado: IsbnMetadata = {
    isbn: clean,
    isbn10: validacion.isbn10 || gbData?.isbn10,
    isbn13: validacion.isbn13 || gbData?.isbn13,
    titulo,
    subtitulo,
    autores,
    autorTexto,
    editorial,
    anio_publicacion: anio,
    categoria,
    sinopsis,
    portada_url,
    paginas,
    idioma,
    enlace_externo,
    fuente: gbData && olData ? 'combinado' : gbData ? 'google_books' : 'open_library',
    confianza: 'alta',
  };

  memoryIsbnCache.set(clean, { data: resultado, timestamp: Date.now() });
  return resultado;
}

/**
 * Búsqueda alternativa por Título y Autor para libros sin ISBN o del fondo histórico
 * Permite encontrar el ISBN oficial correspondiente a la obra
 */
export async function buscarIsbnPorTituloYAutor(
  titulo: string,
  autor?: string
): Promise<IsbnMetadata | null> {
  const t = titulo.trim();
  if (!t) return null;

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || '';
    const keyParam = apiKey ? `&key=${apiKey}` : '';
    let q = `intitle:${encodeURIComponent(t)}`;
    if (autor && autor.trim()) {
      q += `+inauthor:${encodeURIComponent(autor.trim().split(',')[0].trim())}`;
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=${q}${keyParam}&maxResults=3&langRestrict=es`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.items || data.items.length === 0) return null;

    for (const item of data.items) {
      const vol = item.volumeInfo;
      let isbnEncontrado: string | undefined;

      if (Array.isArray(vol.industryIdentifiers)) {
        for (const id of vol.industryIdentifiers) {
          if (id.type === 'ISBN_13' || id.type === 'ISBN_10') {
            const v = validarIsbn(id.identifier);
            if (v.valido) {
              isbnEncontrado = v.clean;
              break;
            }
          }
        }
      }

      if (isbnEncontrado) {
        return await buscarMetadataIsbn(isbnEncontrado);
      }
    }
  } catch (err) {
    console.warn('Error buscando ISBN por título y autor:', err);
  }

  return null;
}
