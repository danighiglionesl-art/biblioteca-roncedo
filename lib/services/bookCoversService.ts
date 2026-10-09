/**
 * Servicio Inteligente de Búsqueda y Asociación de Portadas
 * Biblioteca Dr. Lautaro Roncedo (Alcira Gigena)
 *
 * Utiliza prioritariamente:
 * 1. Google Books API
 * 2. Open Library API
 *
 * Prioridad de identificación bibliográfica:
 * 1. ISBN
 * 2. Título y Autor
 * 3. Editorial y Año de publicación
 */

export interface PortadaAlternative {
  portada_url: string;
  fuente: 'google_books' | 'open_library';
  titulo: string;
  autor?: string;
  editorial?: string;
  anio?: string | number;
  confianza: 'alta' | 'media' | 'baja';
}

export interface PortadaSearchResult {
  portada_url: string | null;
  fuente: 'google_books' | 'open_library' | 'manual' | 'ninguna';
  confianza: 'alta' | 'media' | 'baja' | 'ninguna';
  detalles: string;
  titulo_encontrado?: string;
  autor_encontrado?: string;
  editorial_encontrada?: string;
  anio_encontrado?: string | number;
  isbn_encontrado?: string;
  alternativas?: PortadaAlternative[];
}

export interface BookSearchInput {
  id?: string;
  numero_inventario?: number;
  titulo: string;
  autor: string;
  editorial?: string;
  edicion_anio?: string | number;
  isbn?: string;
}

// ----------------------------------------------------
// Utilidades de Normalización y Similitud
// ----------------------------------------------------

export function normalizarTexto(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function limpiarTitulo(titulo: string): string {
  if (!titulo) return '';
  let t = titulo.trim();
  // Quitar elipsis o puntos seguidos con subtítulo si es muy largo
  t = t.replace(/[…\.].*$/, '');
  t = t.replace(/\(Tomo\s+\d+\)/gi, '');
  t = t.replace(/\s+/g, ' ').trim();
  return t || titulo.replace(/[…]/g, '').trim();
}

export function limpiarAutor(autor: string): { nombreCompleto: string; apellido: string } {
  if (!autor) return { nombreCompleto: '', apellido: '' };
  let a = autor.trim();

  // Descartar si es "Autor Desconocido" o "Varios"
  if (
    a.toLowerCase().includes('desconocido') ||
    a.toLowerCase().includes('varios') ||
    a.toLowerCase().includes('anónimo') ||
    a.toLowerCase().includes('anonimo')
  ) {
    return { nombreCompleto: '', apellido: '' };
  }

  // Quitar notas editoriales como "selec.", "comp.", etc.
  a = a.replace(/,\s*(selec|comp|coord|dir|ed)\.?.*$/i, '');
  a = a.replace(/[…\.].*$/, '');

  let apellido = '';
  let nombreCompleto = a;

  if (a.includes('/')) {
    // Tomar el primer autor si hay varios separados por barra
    a = a.split('/')[0].trim();
  }

  if (a.includes(',')) {
    const parts = a.split(',');
    apellido = parts[0].trim();
    const nombre = parts[1]?.trim() || '';
    nombreCompleto = `${nombre} ${apellido}`.trim();
  } else {
    const tokens = a.split(' ').filter(Boolean);
    apellido = tokens[tokens.length - 1] || '';
  }

  return { nombreCompleto, apellido };
}

export function tokenSimilarity(s1: string, s2: string): number {
  const norm1 = normalizarTexto(s1);
  const norm2 = normalizarTexto(s2);

  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;

  const t1 = new Set(norm1.split(' ').filter((w) => w.length > 2));
  const t2 = new Set(norm2.split(' ').filter((w) => w.length > 2));

  if (t1.size === 0 || t2.size === 0) {
    return norm1.includes(norm2) || norm2.includes(norm1) ? 0.8 : 0.0;
  }

  let inter = 0;
  t1.forEach((w) => {
    if (t2.has(w)) inter++;
  });

  return inter / Math.max(t1.size, t2.size);
}

// ----------------------------------------------------
// Verificación de Imagen (evita imágenes vacías 1x1 o rotas)
// ----------------------------------------------------

export async function verificarImagenValida(url: string): Promise<boolean> {
  if (!url || !url.startsWith('http')) return false;

  // Si es Google Books, suele ser válida directamente
  if (url.includes('books.google.com') || url.includes('googleusercontent.com')) {
    return true;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'BibliotecaRoncedo/1.0 (bibliotecaroncedo.ar; contacto@bibliotecaroncedo.ar)',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return false;

    const ct = res.headers.get('content-type') || '';
    const cl = parseInt(res.headers.get('content-length') || '0', 10);

    // Open Library devuelve un GIF de 43 o 800 bytes cuando no hay portada
    if (cl > 0 && cl < 1200) return false;

    return ct.startsWith('image/');
  } catch {
    // Si falla el HEAD por CORS en navegador, asumimos verdadero si no es 404
    return typeof window !== 'undefined';
  }
}

// ----------------------------------------------------
// Función Principal de Búsqueda
// ----------------------------------------------------

export async function buscarPortadaLibro(book: BookSearchInput): Promise<PortadaSearchResult> {
  const isbn = (book.isbn || '').replace(/[^0-9X]/gi, '');
  const cTitle = limpiarTitulo(book.titulo);
  const { nombreCompleto: cAuthor, apellido: cApellido } = limpiarAutor(book.autor);
  const editorial = normalizarTexto(book.editorial || '');
  const anio = String(book.edicion_anio || '').replace(/[^0-9]/g, '');

  const alternativas: PortadaAlternative[] = [];

  // =========================================================================
  // 1. PRIORIDAD 1: BÚSQUEDA POR ISBN
  // =========================================================================
  if (isbn && (isbn.length === 10 || isbn.length === 13)) {
    // A) Google Books por ISBN
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || '';
      const keyParam = apiKey ? `&key=${apiKey}` : '';
      const gRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}${keyParam}&maxResults=2`,
        { headers: { 'User-Agent': 'BibliotecaRoncedo/1.0' } }
      );

      if (gRes.ok) {
        const gData = await gRes.json();
        const item = gData.items?.[0];
        const img = item?.volumeInfo?.imageLinks?.thumbnail || item?.volumeInfo?.imageLinks?.smallThumbnail;
        if (img) {
          const httpsImg = img.replace(/^http:/, 'https:').replace('&edge=curl', '');
          return {
            portada_url: httpsImg,
            fuente: 'google_books',
            confianza: 'alta',
            detalles: `Coincidencia exacta por ISBN (${isbn}) en Google Books.`,
            titulo_encontrado: item.volumeInfo.title,
            autor_encontrado: item.volumeInfo.authors?.join(', '),
            editorial_encontrada: item.volumeInfo.publisher,
            anio_encontrado: item.volumeInfo.publishedDate,
            isbn_encontrado: isbn,
            alternativas,
          };
        }
      }
    } catch {}

    // B) Open Library por ISBN
    try {
      const olIsbnUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
      const isOk = await verificarImagenValida(olIsbnUrl);
      if (isOk) {
        return {
          portada_url: olIsbnUrl,
          fuente: 'open_library',
          confianza: 'alta',
          detalles: `Coincidencia exacta por ISBN (${isbn}) en Open Library.`,
          isbn_encontrado: isbn,
          alternativas,
        };
      }
    } catch {}
  }

  // =========================================================================
  // 2. PRIORIDAD 2: TÍTULO Y AUTOR EN GOOGLE BOOKS
  // =========================================================================
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || '';
    const keyParam = apiKey ? `&key=${apiKey}` : '';
    let gQuery = `intitle:${encodeURIComponent(cTitle)}`;
    if (cApellido) {
      gQuery += `+inauthor:${encodeURIComponent(cApellido)}`;
    }

    const gRes = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${gQuery}${keyParam}&maxResults=3&langRestrict=es`,
      { headers: { 'User-Agent': 'BibliotecaRoncedo/1.0' } }
    );

    if (gRes.ok) {
      const gData = await gRes.json();
      if (gData.items && gData.items.length > 0) {
        for (const item of gData.items) {
          const v = item.volumeInfo;
          const img = v?.imageLinks?.thumbnail || v?.imageLinks?.smallThumbnail;
          if (!img) continue;

          const httpsImg = img.replace(/^http:/, 'https:').replace('&edge=curl', '');
          const simTitle = tokenSimilarity(book.titulo, v.title);
          const simAuthor = cAuthor
            ? v.authors
              ? Math.max(...v.authors.map((a: string) => tokenSimilarity(cAuthor, a)))
              : 0
            : 0.6;

          // Guardar como alternativa
          alternativas.push({
            portada_url: httpsImg,
            fuente: 'google_books',
            titulo: v.title,
            autor: v.authors?.join(', '),
            editorial: v.publisher,
            anio: v.publishedDate,
            confianza: simTitle >= 0.75 && simAuthor >= 0.5 ? 'alta' : 'media',
          });

          // Prioridad 3: Desambiguación con Editorial y Año
          const matchEdit = editorial && v.publisher && normalizarTexto(v.publisher).includes(editorial);
          const matchYear = anio && v.publishedDate && v.publishedDate.startsWith(anio);

          if (simTitle >= 0.8 && (simAuthor >= 0.6 || !cAuthor)) {
            return {
              portada_url: httpsImg,
              fuente: 'google_books',
              confianza: 'alta',
              detalles: `Coincidencia bibliográfica alta en Google Books ("${v.title}").`,
              titulo_encontrado: v.title,
              autor_encontrado: v.authors?.join(', '),
              editorial_encontrada: v.publisher,
              anio_encontrado: v.publishedDate,
              alternativas,
            };
          } else if (simTitle >= 0.65 && (matchEdit || matchYear)) {
            return {
              portada_url: httpsImg,
              fuente: 'google_books',
              confianza: 'alta',
              detalles: `Coincidencia por título y editorial/año en Google Books.`,
              titulo_encontrado: v.title,
              autor_encontrado: v.authors?.join(', '),
              editorial_encontrada: v.publisher,
              anio_encontrado: v.publishedDate,
              alternativas,
            };
          }
        }
      }
    }
  } catch {}

  // =========================================================================
  // 3. PRIORIDAD 2 & 3: OPEN LIBRARY (Título + Autor + Editorial/Año)
  // =========================================================================
  try {
    // Primer intento: búsqueda estructurada title & author
    let olQueries = [
      `title=${encodeURIComponent(cTitle)}${cApellido ? `&author=${encodeURIComponent(cApellido)}` : ''}`,
      `q=${encodeURIComponent(`${cTitle} ${cApellido}`.trim())}`,
      `title=${encodeURIComponent(cTitle)}`,
    ];

    for (const qStr of olQueries) {
      const olRes = await fetch(`https://openlibrary.org/search.json?${qStr}&limit=5`, {
        headers: { 'User-Agent': 'BibliotecaRoncedo/1.0 (bibliotecaroncedo.ar)' },
      });

      if (!olRes.ok) continue;

      const olData = await olRes.json();
      if (!olData.docs || olData.docs.length === 0) continue;

      for (const doc of olData.docs) {
        const simTitle = tokenSimilarity(book.titulo, doc.title);
        const simAuthor = cAuthor
          ? doc.author_name
            ? Math.max(...doc.author_name.map((a: string) => tokenSimilarity(cAuthor, a)))
            : 0
          : 0.5;

        // Extraer portada candidata
        let coverCandidate: string | null = null;
        if (doc.cover_i) {
          coverCandidate = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg?default=false`;
        } else if (doc.cover_edition_key) {
          coverCandidate = `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-L.jpg?default=false`;
        } else if (doc.isbn && doc.isbn[0]) {
          coverCandidate = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg?default=false`;
        }

        if (!coverCandidate) continue;

        const isOk = await verificarImagenValida(coverCandidate);
        if (!isOk) continue;

        // Guardar como alternativa si no está ya
        if (!alternativas.some((a) => a.portada_url === coverCandidate)) {
          alternativas.push({
            portada_url: coverCandidate,
            fuente: 'open_library',
            titulo: doc.title,
            autor: doc.author_name?.join(', '),
            editorial: doc.publisher?.[0],
            anio: doc.first_publish_year,
            confianza: simTitle >= 0.75 && simAuthor >= 0.5 ? 'alta' : 'media',
          });
        }

        // Desambiguación con Editorial y Año
        const matchEdit = editorial && doc.publisher?.some((p: string) => normalizarTexto(p).includes(editorial));
        const matchYear =
          anio &&
          (doc.publish_year?.includes(parseInt(anio, 10)) || doc.first_publish_year === parseInt(anio, 10));

        if (simTitle >= 0.75 && (simAuthor >= 0.5 || !cAuthor)) {
          return {
            portada_url: coverCandidate,
            fuente: 'open_library',
            confianza: 'alta',
            detalles: `Coincidencia exacta de obra en Open Library ("${doc.title}").`,
            titulo_encontrado: doc.title,
            autor_encontrado: doc.author_name?.join(', '),
            editorial_encontrada: doc.publisher?.[0],
            anio_encontrado: doc.first_publish_year,
            alternativas,
          };
        } else if (simTitle >= 0.6 && (matchEdit || matchYear)) {
          return {
            portada_url: coverCandidate,
            fuente: 'open_library',
            confianza: 'alta',
            detalles: `Coincidencia por título y confirmación de editorial/año ("${doc.title}").`,
            titulo_encontrado: doc.title,
            autor_encontrado: doc.author_name?.join(', '),
            editorial_encontrada: doc.publisher?.[0],
            anio_encontrado: doc.first_publish_year,
            alternativas,
          };
        } else if (simTitle >= 0.55 && (simAuthor >= 0.4 || !cAuthor)) {
          // Coincidencia con posibles dudas sobre edición: Pendiente de revisión
          return {
            portada_url: coverCandidate,
            fuente: 'open_library',
            confianza: 'media',
            detalles: `Coincidencia aproximada en Open Library ("${doc.title}"). Pendiente de revisión para confirmar edición.`,
            titulo_encontrado: doc.title,
            autor_encontrado: doc.author_name?.join(', '),
            editorial_encontrada: doc.publisher?.[0],
            anio_encontrado: doc.first_publish_year,
            alternativas,
          };
        }
      }
    }
  } catch {}

  // Si quedaron alternativas de menor confianza pero válidas:
  if (alternativas.length > 0) {
    const mejor = alternativas[0];
    return {
      portada_url: mejor.portada_url,
      fuente: mejor.fuente,
      confianza: 'media',
      detalles: `Posible coincidencia encontrada ("${mejor.titulo}"). Pendiente de revisión del administrador.`,
      titulo_encontrado: mejor.titulo,
      autor_encontrado: mejor.autor,
      editorial_encontrada: mejor.editorial,
      anio_encontrado: mejor.anio,
      alternativas,
    };
  }

  // Sin resultados
  return {
    portada_url: null,
    fuente: 'ninguna',
    confianza: 'ninguna',
    detalles: 'No se encontró una coincidencia bibliográfica confiable con imagen de portada.',
    alternativas: [],
  };
}

// ----------------------------------------------------
// Búsqueda de Múltiples Alternativas para Selección Manual
// ----------------------------------------------------

export async function buscarAlternativasPortadas(book: BookSearchInput): Promise<PortadaAlternative[]> {
  const cTitle = limpiarTitulo(book.titulo);
  const { apellido: cApellido } = limpiarAutor(book.autor);
  const alternativas: PortadaAlternative[] = [];

  // 1. Google Books
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || '';
    const keyParam = apiKey ? `&key=${apiKey}` : '';
    const q = encodeURIComponent(`${cTitle} ${cApellido}`.trim());
    const gRes = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${q}${keyParam}&maxResults=5&langRestrict=es`
    );
    if (gRes.ok) {
      const gData = await gRes.json();
      if (gData.items) {
        for (const item of gData.items) {
          const v = item.volumeInfo;
          const img = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail;
          if (img) {
            alternativas.push({
              portada_url: img.replace(/^http:/, 'https:').replace('&edge=curl', ''),
              fuente: 'google_books',
              titulo: v.title,
              autor: v.authors?.join(', '),
              editorial: v.publisher,
              anio: v.publishedDate,
              confianza: tokenSimilarity(book.titulo, v.title) >= 0.7 ? 'alta' : 'media',
            });
          }
        }
      }
    }
  } catch {}

  // 2. Open Library
  try {
    const qOL = encodeURIComponent(`${cTitle} ${cApellido}`.trim());
    const olRes = await fetch(`https://openlibrary.org/search.json?q=${qOL}&limit=5`);
    if (olRes.ok) {
      const olData = await olRes.json();
      if (olData.docs) {
        for (const doc of olData.docs) {
          let coverUrl: string | null = null;
          if (doc.cover_i) {
            coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg?default=false`;
          } else if (doc.cover_edition_key) {
            coverUrl = `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-L.jpg?default=false`;
          }

          if (coverUrl && !alternativas.some((a) => a.portada_url === coverUrl)) {
            alternativas.push({
              portada_url: coverUrl,
              fuente: 'open_library',
              titulo: doc.title,
              autor: doc.author_name?.join(', '),
              editorial: doc.publisher?.[0],
              anio: doc.first_publish_year,
              confianza: tokenSimilarity(book.titulo, doc.title) >= 0.7 ? 'alta' : 'media',
            });
          }
        }
      }
    }
  } catch {}

  return alternativas;
}

// ----------------------------------------------------
// Procesador por Lotes con Control de Tasa (Rate Limiting)
// ----------------------------------------------------

export async function procesarLoteLibros(
  libros: BookSearchInput[],
  onProgreso?: (progreso: {
    actual: number;
    total: number;
    libro: BookSearchInput;
    resultado: PortadaSearchResult;
    encontradas: number;
  }) => void,
  options: { delayMs?: number; signal?: AbortSignal } = {}
): Promise<Array<{ libro: BookSearchInput; resultado: PortadaSearchResult }>> {
  const delayMs = options.delayMs ?? 400; // 400ms por defecto para respetar límites de API gratuita
  const resultadosTotales: Array<{ libro: BookSearchInput; resultado: PortadaSearchResult }> = [];
  let encontradasCount = 0;

  for (let i = 0; i < libros.length; i++) {
    if (options.signal?.aborted) {
      break;
    }

    const libro = libros[i];
    const resultado = await buscarPortadaLibro(libro);

    if (resultado.portada_url) {
      encontradasCount++;
    }

    resultadosTotales.push({ libro, resultado });

    if (onProgreso) {
      onProgreso({
        actual: i + 1,
        total: libros.length,
        libro,
        resultado,
        encontradas: encontradasCount,
      });
    }

    // Esperar delay entre llamadas para evitar sobrecargas y errores 429
    if (i < libros.length - 1 && !options.signal?.aborted) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return resultadosTotales;
}
