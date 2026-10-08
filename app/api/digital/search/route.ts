import { NextRequest, NextResponse } from 'next/server';
import { LibroDigital, FuenteDigital, DisponibilidadDigital, FormatoDescarga } from '@/types';
import { LIBROS_DIGITALES_CURADOS } from '@/lib/data/librosDigitalesCurados';

// Lista de autores y términos de Argentina y Latinoamérica para priorización obligatoria
const AUTORES_LATINOS_REGEX = /(josé hernández|jose hernandez|sarmiento|horacio quiroga|borges|cortázar|cortazar|alfonsina storni|leopoldo lugones|echeverría|echeverria|ascasubi|miguel cané|ricardo güiraldes|guiraldes|rubén darío|ruben dario|gabriela mistral|josé martí|jose marti|sor juana|garcía márquez|marquez|juan rulfo|mario benedetti|pablo neruda|cesar vallejo|césar vallejo|argentina|argentino|rioplatense|córdoba|cordoba|buenos aires|tucumán)/i;

function normalizarCadena(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const tipoBusqueda = searchParams.get('tipo_busqueda') || 'todos';
    const filtroFuente = (searchParams.get('fuente') || 'todas') as 'todas' | FuenteDigital;
    const filtroDisp = (searchParams.get('disponibilidad') || 'todas') as 'todas' | DisponibilidadDigital;
    const soloLatinos = searchParams.get('solo_argentinos_latinos') === 'true';

    // 1. Filtrar primero sobre el catálogo curado pre-indexado
    let resultadosCurados: LibroDigital[] = [...LIBROS_DIGITALES_CURADOS];

    if (q) {
      const qNorm = normalizarCadena(q);
      resultadosCurados = resultadosCurados.filter((libro) => {
        const tit = normalizarCadena(libro.titulo);
        const aut = normalizarCadena(libro.autor);
        const edit = normalizarCadena(libro.editorial || '');
        const gen = normalizarCadena(libro.genero_o_materia || '');
        const desc = normalizarCadena(libro.descripcion || '');

        if (tipoBusqueda === 'titulo') return tit.includes(qNorm);
        if (tipoBusqueda === 'autor') return aut.includes(qNorm);
        if (tipoBusqueda === 'editorial') return edit.includes(qNorm);
        if (tipoBusqueda === 'genero') return gen.includes(qNorm);
        return tit.includes(qNorm) || aut.includes(qNorm) || edit.includes(qNorm) || gen.includes(qNorm) || desc.includes(qNorm);
      });
    }

    const mapaTitulos = new Set<string>();
    resultadosCurados.forEach((l) => mapaTitulos.add(normalizarCadena(l.titulo)));

    const resultadosExternos: LibroDigital[] = [];

    // 2. Si hay término de búsqueda, consultar APIs en paralelo con control de timeout
    if (q) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const promises: Promise<any>[] = [];

      // A) Project Gutenberg (Gutendex con filtro obligatorio languages=es)
      if (filtroFuente === 'todas' || filtroFuente === 'gutenberg') {
        const urlGuten = `https://gutendex.com/books/?languages=es&search=${encodeURIComponent(q)}`;
        promises.push(
          fetch(urlGuten, { signal: controller.signal })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data?.results && Array.isArray(data.results)) {
                for (const item of data.results) {
                  // Verificación estricta de idioma español
                  if (!item.languages?.includes('es')) continue;

                  const titulo = item.title || 'Sin título';
                  const normTit = normalizarCadena(titulo);
                  if (mapaTitulos.has(normTit)) continue; // evitar duplicados con los ya cargados

                  const autorNombre = item.authors?.map((a: any) => a.name).join(', ') || 'Autor Clásico';
                  const formatos: FormatoDescarga[] = [];

                  if (item.formats['application/epub+zip']) {
                    formatos.push({
                      tipo: 'epub',
                      label: 'Descargar EPUB',
                      url: item.formats['application/epub+zip'],
                    });
                  }
                  if (item.formats['text/html']) {
                    formatos.push({
                      tipo: 'html',
                      label: 'Lectura Directa en PWA',
                      url: item.formats['text/html'],
                    });
                  }
                  if (item.formats['application/pdf']) {
                    formatos.push({
                      tipo: 'pdf',
                      label: 'Descargar PDF',
                      url: item.formats['application/pdf'],
                    });
                  }

                  const esLatino = AUTORES_LATINOS_REGEX.test(autorNombre) || AUTORES_LATINOS_REGEX.test(titulo);

                  resultadosExternos.push({
                    id: `guten-${item.id}`,
                    titulo,
                    autor: autorNombre,
                    anio: item.authors?.[0]?.birth_year ? `s. XIX/XX` : undefined,
                    idioma: 'es',
                    descripcion: item.subjects?.slice(0, 3).join(' • ') || 'Obra clásica de dominio público en español.',
                    portada_url: item.formats['image/jpeg'] || undefined,
                    fuente: 'gutenberg',
                    enlace_oficial: `https://www.gutenberg.org/ebooks/${item.id}`,
                    disponibilidad: 'descarga_libre',
                    formatos,
                    es_argentino_o_latino: esLatino,
                    genero_o_materia: item.subjects?.[0] || 'Literatura Clásica',
                    gutenberg_id: item.id,
                  });
                  mapaTitulos.add(normTit);
                }
              }
            })
            .catch(() => null)
        );
      }

      // B) Wikisource en español (API oficial)
      if (filtroFuente === 'todas' || filtroFuente === 'wikisource') {
        const urlWiki = `https://es.wikisource.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&srlimit=8&origin=*`;
        promises.push(
          fetch(urlWiki, { signal: controller.signal })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data?.query?.search && Array.isArray(data.query.search)) {
                for (const item of data.query.search) {
                  const titulo = item.title.replace(/\([^)]*\)/g, '').trim();
                  const normTit = normalizarCadena(titulo);
                  if (mapaTitulos.has(normTit)) continue;

                  const snippet = (item.snippet || '').replace(/<[^>]+>/g, '');
                  const esLatino = AUTORES_LATINOS_REGEX.test(titulo) || AUTORES_LATINOS_REGEX.test(snippet);

                  resultadosExternos.push({
                    id: `wiki-${item.pageid}`,
                    titulo,
                    autor: esLatino ? 'Literatura Hispanoamericana' : 'Dominio Público',
                    idioma: 'es',
                    descripcion: snippet || 'Texto completo en biblioteca libre Wikisource en español.',
                    fuente: 'wikisource',
                    enlace_oficial: `https://es.wikisource.org/wiki/${encodeURIComponent(item.title)}`,
                    disponibilidad: 'lectura_directa',
                    formatos: [
                      {
                        tipo: 'html',
                        label: 'Lectura Directa en PWA',
                        url: `https://es.wikisource.org/wiki/${encodeURIComponent(item.title)}`,
                      },
                    ],
                    es_argentino_o_latino: esLatino,
                    genero_o_materia: 'Dominio Público / Wikisource',
                    wikisource_page: item.title,
                  });
                  mapaTitulos.add(normTit);
                }
              }
            })
            .catch(() => null)
        );
      }

      // C) Open Library (con filtro obligatorio por idioma español)
      if (filtroFuente === 'todas' || filtroFuente === 'openlibrary') {
        const urlOL = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&language=spa&limit=8`;
        promises.push(
          fetch(urlOL, { signal: controller.signal })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data?.docs && Array.isArray(data.docs)) {
                for (const doc of data.docs) {
                  // Verificar idioma español
                  const langs = doc.language || [];
                  const esEspanol = langs.includes('spa') || langs.includes('es') || langs.length === 0;
                  if (!esEspanol) continue;

                  const titulo = doc.title || 'Sin título';
                  const normTit = normalizarCadena(titulo);
                  if (mapaTitulos.has(normTit)) continue;

                  const autorNombre = doc.author_name?.join(', ') || 'Varios autores';
                  const portada = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined;
                  const esLatino = AUTORES_LATINOS_REGEX.test(autorNombre) || AUTORES_LATINOS_REGEX.test(titulo);
                  const isPublic = doc.ebook_access === 'public';
                  const formatos: FormatoDescarga[] = [];

                  if (isPublic && doc.ia?.[0]) {
                    formatos.push({
                      tipo: 'pdf',
                      label: 'Descargar PDF (Internet Archive)',
                      url: `https://archive.org/download/${doc.ia[0]}/${doc.ia[0]}.pdf`,
                    });
                    formatos.push({
                      tipo: 'epub',
                      label: 'Descargar EPUB',
                      url: `https://archive.org/download/${doc.ia[0]}/${doc.ia[0]}.epub`,
                    });
                  } else {
                    formatos.push({
                      tipo: 'externo',
                      label: 'Préstamo Digital en Open Library',
                      url: `https://openlibrary.org${doc.key}`,
                    });
                  }

                  resultadosExternos.push({
                    id: `ol-${doc.key.replace(/\//g, '-')}`,
                    titulo,
                    autor: autorNombre,
                    editorial: doc.publisher?.[0],
                    anio: doc.first_publish_year,
                    idioma: 'es',
                    descripcion: `Edición en español registrada en el catálogo internacional Open Library.`,
                    portada_url: portada,
                    fuente: 'openlibrary',
                    enlace_oficial: `https://openlibrary.org${doc.key}`,
                    disponibilidad: isPublic ? 'descarga_libre' : 'prestamo_externo',
                    formatos,
                    es_argentino_o_latino: esLatino,
                    genero_o_materia: doc.subject?.[0] || 'Catálogo Bibliográfico',
                    ia_id: doc.ia?.[0],
                  });
                  mapaTitulos.add(normTit);
                }
              }
            })
            .catch(() => null)
        );
      }

      await Promise.allSettled(promises);
      clearTimeout(timeoutId);
    }

    // 3. Unificar todos los resultados
    let totalResultados = [...resultadosCurados, ...resultadosExternos];

    // 4. Aplicar filtros de Fuente y Disponibilidad
    if (filtroFuente !== 'todas') {
      totalResultados = totalResultados.filter(
        (l) => l.fuente === filtroFuente || l.fuentes_adicionales?.includes(filtroFuente)
      );
    }

    if (filtroDisp !== 'todas') {
      totalResultados = totalResultados.filter((l) => l.disponibilidad === filtroDisp);
    }

    if (soloLatinos) {
      totalResultados = totalResultados.filter((l) => l.es_argentino_o_latino);
    }

    // 5. Priorización obligatoria de Literatura Argentina y Latinoamericana
    totalResultados.sort((a, b) => {
      // Priorizar obras argentinas/latinas
      const pA = a.es_argentino_o_latino ? 2 : 0;
      const pB = b.es_argentino_o_latino ? 2 : 0;

      // Priorizar obras con descarga directa o lectura PWA
      const dA = a.disponibilidad === 'descarga_libre' ? 1 : 0;
      const dB = b.disponibilidad === 'descarga_libre' ? 1 : 0;

      return pB + dB - (pA + dA);
    });

    return NextResponse.json({
      success: true,
      query: q,
      total: totalResultados.length,
      libros: totalResultados,
    });
  } catch (error: any) {
    console.error('Error en búsqueda de biblioteca digital:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al procesar la búsqueda',
        libros: LIBROS_DIGITALES_CURADOS,
      },
      { status: 500 }
    );
  }
}
