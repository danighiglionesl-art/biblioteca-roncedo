import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wikiPage = searchParams.get('page');
    const gutenbergId = searchParams.get('gutenberg_id');

    if (wikiPage) {
      const url = `https://es.wikisource.org/w/api.php?action=parse&page=${encodeURIComponent(wikiPage)}&format=json&prop=text|sections&origin=*`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) {
        return NextResponse.json({ success: false, error: 'No se pudo obtener el texto de Wikisource' }, { status: 502 });
      }
      const data = await res.json();
      if (!data.parse) {
        return NextResponse.json({ success: false, error: 'Página no encontrada en Wikisource' }, { status: 404 });
      }

      // Limpiar texto para una lectura cómoda y tipografía Gotham
      let html = data.parse.text?.['*'] || '';
      // Quitar scripts y estilos embebidos agresivos
      html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

      return NextResponse.json({
        success: true,
        fuente: 'wikisource',
        titulo: data.parse.title,
        html,
      });
    }

    if (gutenbergId) {
      // Intentar obtener versión HTML o texto plano de Gutenberg
      const htmlUrl = `https://www.gutenberg.org/ebooks/${gutenbergId}.html.images`;
      const res = await fetch(htmlUrl);
      if (res.ok) {
        let text = await res.text();
        return NextResponse.json({
          success: true,
          fuente: 'gutenberg',
          html: text,
        });
      }
    }

    return NextResponse.json({ success: false, error: 'Parámetros insuficientes' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
