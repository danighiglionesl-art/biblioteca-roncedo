import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { compressImage } from '@/lib/utils/imageCompressor';

export interface ResultadoSubidaPortada {
  success: boolean;
  url: string;
  error?: string;
}

/**
 * Optimiza y sube la portada de un libro físico a Supabase Storage (Bucket fototeca / portadas_libros).
 * Si la subida a la nube no está disponible, utiliza la versión comprimida en WebP optimizada.
 */
export async function subirPortadaLibroFisico(
  file: File,
  numeroInventario?: number
): Promise<ResultadoSubidaPortada> {
  if (!file) {
    return { success: false, url: '', error: 'No se seleccionó ningún archivo de imagen.' };
  }

  // 1. Validar que sea imagen
  if (!file.type.startsWith('image/')) {
    return { success: false, url: '', error: 'El archivo seleccionado debe ser una imagen (JPG, PNG, WEBP).' };
  }

  try {
    // 2. Comprimir imagen en el navegador a WebP optimizado (máx. 1200px, 85% calidad)
    const comp = await compressImage(file, 1200, 0.85);
    const compressedFile = comp.file;

    // 3. Subir a Supabase Storage si está configurado
    if (isSupabaseConfigured && supabase) {
      const invLabel = numeroInventario ? `inv_${numeroInventario}` : 'nuevo';
      const cleanFileName = `portada_${invLabel}_${Date.now()}.webp`;
      const filePath = `portadas_libros/${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from('fototeca')
        .upload(filePath, compressedFile, {
          upsert: true,
          contentType: 'image/webp',
          cacheControl: '31536000', // 1 año de caché
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from('fototeca')
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          return {
            success: true,
            url: publicData.publicUrl,
          };
        }
      } else if (error) {
        console.warn('[StoragePortadas] Error subiendo a fototeca:', error.message);
      }
    }

    // 4. Fallback: imagen comprimida en WebP Data URL (< 100 KB)
    return {
      success: true,
      url: comp.previewUrl,
    };
  } catch (err: any) {
    console.error('[StoragePortadas] Error procesando imagen:', err);
    return {
      success: false,
      url: '',
      error: err.message || 'Error al procesar la imagen.',
    };
  }
}
