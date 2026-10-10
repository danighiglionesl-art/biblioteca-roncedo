'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  LibroFisico,
  PrestamoActivo,
  ReservaActiva,
  TallerInscripcion,
  FotoAportada,
  UserProfile,
} from '@/types';
import LIBROS_RAW from '@/lib/data/librosFisicos.json';
import { buscarPortadaLibro, PortadaSearchResult } from '@/lib/services/bookCoversService';

interface LibrosContextType {
  librosFisicos: LibroFisico[];
  prestamos: PrestamoActivo[];
  reservas: ReservaActiva[];
  talleres: TallerInscripcion[];
  fotosAportadas: FotoAportada[];
  isLoading: boolean;
  solicitarPrestamo: (libroId: string, user: UserProfile) => Promise<{ success: boolean; error?: string }>;
  solicitarReserva: (libroId: string, user: UserProfile) => Promise<{ success: boolean; error?: string }>;
  cancelarReserva: (reservaId: string) => Promise<void>;
  renovarPrestamo: (prestamoId: string) => Promise<{ success: boolean; error?: string }>;
  registrarDevolucion: (libroId: string) => Promise<{ success: boolean }>;
  agregarLibro: (nuevoLibro: Omit<LibroFisico, 'id'>) => Promise<{ success: boolean; id: string }>;
  actualizarLibro: (id: string, datos: Partial<LibroFisico>) => Promise<{ success: boolean }>;
  eliminarLibro: (id: string) => Promise<{ success: boolean }>;
  actualizarPortada: (
    id: string,
    portadaUrl: string,
    metadata?: {
      estado_portada?: 'aprobada' | 'pendiente_revision' | 'sin_portada';
      fuente?: 'google_books' | 'open_library' | 'manual' | 'ninguna';
      confianza?: 'alta' | 'media' | 'baja' | 'ninguna';
      detalles?: string;
    }
  ) => Promise<{ success: boolean }>;
  aprobarPortada: (id: string) => Promise<{ success: boolean }>;
  descartarPortada: (id: string) => Promise<{ success: boolean }>;
  buscarYAsociarPortada: (id: string) => Promise<{ success: boolean; resultado: PortadaSearchResult }>;
  actualizarLoteLibros: (nuevosLibros: LibroFisico[]) => void;
  guardarEnServidor: (librosParaGuardar?: LibroFisico[]) => Promise<{ success: boolean; message?: string }>;
  aportarFoto: (datos: { titulo: string; descripcion: string; anio_aproximado?: string; imagen_url: string; user_id: string }) => Promise<{ success: boolean }>;
  restablecerInventarioOriginal: () => void;
}

const LibrosContext = createContext<LibrosContextType | undefined>(undefined);

const STORAGE_KEY_LIBROS = 'roncedo_libros_fisicos_v4';
const STORAGE_KEY_PRESTAMOS = 'roncedo_prestamos_v4';
const STORAGE_KEY_RESERVAS = 'roncedo_reservas_v4';
const STORAGE_KEY_FOTOS = 'roncedo_fotos_aportadas_v4';

const PRESTAMOS_INICIALES: PrestamoActivo[] = [];

const TALLERES_INICIALES: TallerInscripcion[] = [
  {
    id: 'taller-01',
    titulo: 'Taller de Narración e Historia Oral',
    disciplina: 'Literatura e Historia Regional',
    profesor: 'Prof. Marcelo Argüello',
    dia_horario: 'Sábados 16:30 hs',
    lugar: 'Salón de Lectura Biblioteca Roncedo',
    fecha_proxima: 'Sábado 18 de Abril de 2026',
    estado: 'confirmado',
  },
  {
    id: 'taller-02',
    titulo: 'Club de Lectura Juvenil e Infantil',
    disciplina: 'Fomento a la Lectura',
    profesor: 'Lic. Claudia Benítez',
    dia_horario: 'Jueves 18:00 hs',
    lugar: 'Rincón de las Letras',
    fecha_proxima: 'Jueves 16 de Abril de 2026',
    estado: 'confirmado',
  },
];

const FOTOS_INICIALES: FotoAportada[] = [
  {
    id: 'foto-01',
    user_id: 'user-admin-roncedo',
    titulo: 'Comisión Directiva fundacional en la sede de calle Belgrano',
    anio_aproximado: '1948',
    descripcion: 'Fotografía en sepia preservada en el archivo institucional. Socios fundadores y colaboradores de la biblioteca popular.',
    imagen_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    fecha_aporte: '2026-03-10',
    estado: 'aprobada',
  },
  {
    id: 'foto-02',
    user_id: 'user-admin-roncedo',
    titulo: 'Inauguración de la sala de lectura y vitrinas bibliográficas',
    anio_aproximado: '1962',
    descripcion: 'Acto formal con presencia de autoridades locales y primeros estantes de madera de roble.',
    imagen_url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    fecha_aporte: '2026-02-15',
    estado: 'aprobada',
  },
];

export function LibrosProvider({ children }: { children: React.ReactNode }) {
  const [librosFisicos, setLibrosFisicos] = useState<LibroFisico[]>(LIBROS_RAW as any);
  const [prestamos, setPrestamos] = useState<PrestamoActivo[]>(PRESTAMOS_INICIALES);
  const [reservas, setReservas] = useState<ReservaActiva[]>([]);
  const [talleres] = useState<TallerInscripcion[]>(TALLERES_INICIALES);
  const [fotosAportadas, setFotosAportadas] = useState<FotoAportada[]>(FOTOS_INICIALES);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar estado desde LocalStorage
  useEffect(() => {
    try {
      const storedLibros = localStorage.getItem(STORAGE_KEY_LIBROS);
      if (storedLibros) {
        const parsed = JSON.parse(storedLibros);
        if (!Array.isArray(parsed) || parsed.length < (LIBROS_RAW as any).length) {
          setLibrosFisicos(LIBROS_RAW as any);
          localStorage.setItem(STORAGE_KEY_LIBROS, JSON.stringify(LIBROS_RAW));
        } else {
          // Sincronizar portadas e ISBNs nuevos que vengan del archivo base preservando préstamos locales
          const rawMap = new Map((LIBROS_RAW as any[]).map((r) => [r.id, r]));
          const merged = parsed.map((item: LibroFisico) => {
            const raw = rawMap.get(item.id);
            if (!raw) return item;
            return {
              ...item,
              portada_url: item.portada_url || raw.portada_url || '',
              isbn: item.isbn || raw.isbn || undefined,
              estado_portada:
                item.estado_portada ||
                raw.estado_portada ||
                (item.portada_url ? 'aprobada' : raw.portada_url ? 'aprobada' : 'sin_portada'),
              portada_fuente: item.portada_fuente || raw.portada_fuente || undefined,
              portada_confianza: item.portada_confianza || raw.portada_confianza || undefined,
              portada_detalles: item.portada_detalles || raw.portada_detalles || undefined,
            };
          });
          setLibrosFisicos(merged);
        }
      } else {
        setLibrosFisicos(LIBROS_RAW as any);
        localStorage.setItem(STORAGE_KEY_LIBROS, JSON.stringify(LIBROS_RAW));
      }

      const storedPrestamos = localStorage.getItem(STORAGE_KEY_PRESTAMOS);
      if (storedPrestamos) {
        setPrestamos(JSON.parse(storedPrestamos));
      } else {
        localStorage.setItem(STORAGE_KEY_PRESTAMOS, JSON.stringify(PRESTAMOS_INICIALES));
      }

      const storedReservas = localStorage.getItem(STORAGE_KEY_RESERVAS);
      if (storedReservas) {
        setReservas(JSON.parse(storedReservas));
      }

      const storedFotos = localStorage.getItem(STORAGE_KEY_FOTOS);
      if (storedFotos) {
        setFotosAportadas(JSON.parse(storedFotos));
      } else {
        localStorage.setItem(STORAGE_KEY_FOTOS, JSON.stringify(FOTOS_INICIALES));
      }
    } catch (e) {
      console.error('Error al cargar inventario local', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistLibros = (items: LibroFisico[]) => {
    setLibrosFisicos(items);
    localStorage.setItem(STORAGE_KEY_LIBROS, JSON.stringify(items));
  };

  const persistPrestamos = (items: PrestamoActivo[]) => {
    setPrestamos(items);
    localStorage.setItem(STORAGE_KEY_PRESTAMOS, JSON.stringify(items));
  };

  const persistReservas = (items: ReservaActiva[]) => {
    setReservas(items);
    localStorage.setItem(STORAGE_KEY_RESERVAS, JSON.stringify(items));
  };

  const persistFotos = (items: FotoAportada[]) => {
    setFotosAportadas(items);
    localStorage.setItem(STORAGE_KEY_FOTOS, JSON.stringify(items));
  };

  // Solicitar Préstamo de libro físico
  const solicitarPrestamo = async (libroId: string, user: UserProfile): Promise<{ success: boolean; error?: string }> => {
    const libro = librosFisicos.find((l) => l.id === libroId);
    if (!libro) return { success: false, error: 'Libro no encontrado en el inventario.' };
    if (libro.estado === 'prestado') {
      return { success: false, error: 'El libro ya se encuentra prestado. Puedes ingresar a la lista de espera.' };
    }

    const hoy = new Date();
    const fechaDevolucion = new Date(hoy.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 días
    const fechaDevolucionStr = fechaDevolucion.toISOString().split('T')[0];
    const fechaPrestamoStr = hoy.toISOString().split('T')[0];

    const nuevoPrestamo: PrestamoActivo = {
      id: `pres-${Date.now()}`,
      libro_id: libro.id,
      numero_inventario: libro.numero_inventario,
      titulo: libro.titulo,
      autor: libro.autor,
      editorial: libro.editorial,
      topografia_ubicacion: libro.topografia_ubicacion,
      portada_url: libro.portada_url,
      user_id: user.id,
      nombre_socio: `${user.nombre} ${user.apellido}`,
      numero_socio: user.numero_socio || '1042',
      fecha_prestamo: fechaPrestamoStr,
      fecha_devolucion_prevista: fechaDevolucionStr,
      estado: 'en_termino',
      renovaciones: 0,
    };

    // Actualizar libro a prestado
    const updatedLibros = librosFisicos.map((l) => {
      if (l.id === libroId) {
        return {
          ...l,
          estado: 'prestado' as const,
          prestado_a: {
            user_id: user.id,
            nombre_socio: `${user.nombre} ${user.apellido}`,
            numero_socio: user.numero_socio || '1042',
            fecha_prestamo: fechaPrestamoStr,
            fecha_devolucion_prevista: fechaDevolucionStr,
          },
        };
      }
      return l;
    });

    persistLibros(updatedLibros);
    persistPrestamos([nuevoPrestamo, ...prestamos]);

    return { success: true };
  };

  // Solicitar Reserva / Ingresar a la lista de espera
  const solicitarReserva = async (libroId: string, user: UserProfile): Promise<{ success: boolean; error?: string }> => {
    const libro = librosFisicos.find((l) => l.id === libroId);
    if (!libro) return { success: false, error: 'Libro no encontrado.' };

    const yaTieneReserva = reservas.some((r) => r.libro_id === libroId && r.user_id === user.id && r.estado !== 'cancelada');
    if (yaTieneReserva) {
      return { success: false, error: 'Ya estás registrado en la lista de espera para este ejemplar.' };
    }

    const listaActual = libro.lista_espera || [];
    const posicion = listaActual.length + 1;

    const nuevaReserva: ReservaActiva = {
      id: `res-${Date.now()}`,
      libro_id: libro.id,
      numero_inventario: libro.numero_inventario,
      titulo: libro.titulo,
      autor: libro.autor,
      topografia_ubicacion: libro.topografia_ubicacion,
      portada_url: libro.portada_url,
      user_id: user.id,
      nombre_socio: `${user.nombre} ${user.apellido}`,
      numero_socio: user.numero_socio || '1042',
      fecha_reserva: new Date().toISOString(),
      posicion_espera: posicion,
      estado: 'en_espera',
    };

    const updatedLibros = librosFisicos.map((l) => {
      if (l.id === libroId) {
        return {
          ...l,
          lista_espera: [
            ...(l.lista_espera || []),
            {
              user_id: user.id,
              nombre_socio: `${user.nombre} ${user.apellido}`,
              numero_socio: user.numero_socio || '1042',
              fecha_solicitud: new Date().toISOString(),
            },
          ],
        };
      }
      return l;
    });

    persistLibros(updatedLibros);
    persistReservas([nuevaReserva, ...reservas]);

    return { success: true };
  };

  const cancelarReserva = async (reservaId: string) => {
    const reserva = reservas.find((r) => r.id === reservaId);
    if (!reserva) return;

    const updatedReservas = reservas.filter((r) => r.id !== reservaId);
    persistReservas(updatedReservas);

    const updatedLibros = librosFisicos.map((l) => {
      if (l.id === reserva.libro_id && l.lista_espera) {
        return {
          ...l,
          lista_espera: l.lista_espera.filter((e) => e.user_id !== reserva.user_id),
        };
      }
      return l;
    });
    persistLibros(updatedLibros);
  };

  const renovarPrestamo = async (prestamoId: string): Promise<{ success: boolean; error?: string }> => {
    const pres = prestamos.find((p) => p.id === prestamoId);
    if (!pres) return { success: false, error: 'Préstamo no encontrado' };

    const fechaDev = new Date(pres.fecha_devolucion_prevista);
    const nuevaFecha = new Date(fechaDev.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días extra
    const nuevaFechaStr = nuevaFecha.toISOString().split('T')[0];

    const updatedPrestamos = prestamos.map((p) =>
      p.id === prestamoId
        ? {
            ...p,
            fecha_devolucion_prevista: nuevaFechaStr,
            renovaciones: p.renovaciones + 1,
          }
        : p
    );
    persistPrestamos(updatedPrestamos);

    // Actualizar también en el libro
    const updatedLibros = librosFisicos.map((l) => {
      if (l.id === pres.libro_id && l.prestado_a) {
        return {
          ...l,
          prestado_a: {
            ...l.prestado_a,
            fecha_devolucion_prevista: nuevaFechaStr,
          },
        };
      }
      return l;
    });
    persistLibros(updatedLibros);

    return { success: true };
  };

  const registrarDevolucion = async (libroId: string): Promise<{ success: boolean }> => {
    const libro = librosFisicos.find((l) => l.id === libroId);
    if (!libro) return { success: false };

    // Si había lista de espera, avisar al primero
    let nuevoEstado: 'disponible' | 'prestado' = 'disponible';
    let nuevaListaEspera = [...(libro.lista_espera || [])];

    if (nuevaListaEspera.length > 0) {
      const siguienteEnFila = nuevaListaEspera.shift();
      // Actualizar reserva del siguiente en fila
      if (siguienteEnFila) {
        const updatedReservas = reservas.map((r) =>
          r.libro_id === libroId && r.user_id === siguienteEnFila.user_id
            ? { ...r, estado: 'disponible_para_retirar' as const, posicion_espera: 1 }
            : r
        );
        persistReservas(updatedReservas);
      }
    }

    const updatedLibros = librosFisicos.map((l) => {
      if (l.id === libroId) {
        return {
          ...l,
          estado: nuevoEstado,
          prestado_a: undefined,
          lista_espera: nuevaListaEspera,
        };
      }
      return l;
    });
    persistLibros(updatedLibros);

    // Marcar préstamo como devuelto
    const updatedPrestamos = prestamos.map((p) =>
      p.libro_id === libroId && p.estado !== 'devuelto'
        ? { ...p, estado: 'devuelto' as const }
        : p
    );
    persistPrestamos(updatedPrestamos);

    return { success: true };
  };

  // ABM de libros por Administrador con Automatización Permanente de Portadas
  const agregarLibro = async (nuevo: Omit<LibroFisico, 'id'>): Promise<{ success: boolean; id: string }> => {
    const newId = `libro-${nuevo.numero_inventario || Date.now()}`;
    let libroCompleto: LibroFisico = {
      ...nuevo,
      id: newId,
      estado: nuevo.estado || 'disponible',
    };

    // Automatización Permanente: Si no tiene portada manual, buscar automáticamente
    if (!libroCompleto.portada_url || libroCompleto.portada_url.trim() === '') {
      try {
        const resPortada = await buscarPortadaLibro({
          titulo: libroCompleto.titulo,
          autor: libroCompleto.autor,
          editorial: libroCompleto.editorial,
          edicion_anio: libroCompleto.edicion_anio,
          isbn: libroCompleto.isbn,
        });

        if (resPortada.portada_url) {
          libroCompleto.portada_url = resPortada.portada_url;
          libroCompleto.estado_portada = resPortada.confianza === 'alta' ? 'aprobada' : 'pendiente_revision';
          libroCompleto.portada_fuente = resPortada.fuente;
          libroCompleto.portada_confianza = resPortada.confianza;
          libroCompleto.portada_detalles = resPortada.detalles;
        } else {
          libroCompleto.estado_portada = 'sin_portada';
          libroCompleto.portada_confianza = 'ninguna';
        }
      } catch (e) {
        console.warn('Búsqueda automática de portada falló:', e);
        libroCompleto.estado_portada = 'sin_portada';
      }
    } else {
      libroCompleto.estado_portada = 'aprobada';
      libroCompleto.portada_fuente = 'manual';
      libroCompleto.portada_confianza = 'alta';
    }

    const updated = [libroCompleto, ...librosFisicos];
    persistLibros(updated);
    return { success: true, id: newId };
  };

  const actualizarLibro = async (id: string, datos: Partial<LibroFisico>): Promise<{ success: boolean }> => {
    const updated = librosFisicos.map((l) => (l.id === id ? { ...l, ...datos } : l));
    persistLibros(updated);
    return { success: true };
  };

  const eliminarLibro = async (id: string): Promise<{ success: boolean }> => {
    const updated = librosFisicos.filter((l) => l.id !== id);
    persistLibros(updated);
    return { success: true };
  };

  const actualizarPortada = async (
    id: string,
    portadaUrl: string,
    metadata?: {
      estado_portada?: 'aprobada' | 'pendiente_revision' | 'sin_portada';
      fuente?: 'google_books' | 'open_library' | 'manual' | 'ninguna';
      confianza?: 'alta' | 'media' | 'baja' | 'ninguna';
      detalles?: string;
    }
  ): Promise<{ success: boolean }> => {
    return actualizarLibro(id, {
      portada_url: portadaUrl,
      estado_portada: metadata?.estado_portada || (portadaUrl ? 'aprobada' : 'sin_portada'),
      portada_fuente: metadata?.fuente || 'manual',
      portada_confianza: metadata?.confianza || (portadaUrl ? 'alta' : 'ninguna'),
      portada_detalles: metadata?.detalles || (portadaUrl ? 'Portada configurada por el administrador' : ''),
    });
  };

  const aprobarPortada = async (id: string): Promise<{ success: boolean }> => {
    return actualizarLibro(id, { estado_portada: 'aprobada' });
  };

  const descartarPortada = async (id: string): Promise<{ success: boolean }> => {
    return actualizarLibro(id, {
      portada_url: '',
      estado_portada: 'sin_portada',
      portada_confianza: 'ninguna',
      portada_detalles: 'Portada descartada por el administrador',
    });
  };

  const buscarYAsociarPortada = async (id: string): Promise<{ success: boolean; resultado: PortadaSearchResult }> => {
    const libro = librosFisicos.find((l) => l.id === id);
    if (!libro) throw new Error('Libro no encontrado');

    const resultado = await buscarPortadaLibro({
      titulo: libro.titulo,
      autor: libro.autor,
      editorial: libro.editorial,
      edicion_anio: libro.edicion_anio,
      isbn: libro.isbn,
    });

    if (resultado.portada_url) {
      await actualizarLibro(id, {
        portada_url: resultado.portada_url,
        estado_portada: resultado.confianza === 'alta' ? 'aprobada' : 'pendiente_revision',
        portada_fuente: resultado.fuente,
        portada_confianza: resultado.confianza,
        portada_detalles: resultado.detalles,
      });
    } else {
      await actualizarLibro(id, {
        estado_portada: 'sin_portada',
        portada_confianza: 'ninguna',
        portada_detalles: resultado.detalles,
      });
    }

    return { success: !!resultado.portada_url, resultado };
  };

  const actualizarLoteLibros = (nuevosLibros: LibroFisico[]) => {
    persistLibros(nuevosLibros);
  };

  const guardarEnServidor = async (
    librosParaGuardar?: LibroFisico[]
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const librosASincronizar = librosParaGuardar || librosFisicos;
      const res = await fetch('/api/admin/portadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sincronizar_archivo',
          librosActualizados: librosASincronizar,
        }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error al guardar en servidor' };
    }
  };

  const aportarFoto = async (datos: {
    titulo: string;
    descripcion: string;
    anio_aproximado?: string;
    imagen_url: string;
    user_id: string;
  }): Promise<{ success: boolean }> => {
    const nuevaFoto: FotoAportada = {
      id: `foto-${Date.now()}`,
      user_id: datos.user_id,
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      anio_aproximado: datos.anio_aproximado,
      imagen_url: datos.imagen_url,
      fecha_aporte: new Date().toISOString().split('T')[0],
      estado: 'en_revision',
    };

    const updated = [nuevaFoto, ...fotosAportadas];
    persistFotos(updated);
    return { success: true };
  };

  const restablecerInventarioOriginal = () => {
    persistLibros(LIBROS_RAW as any);
  };

  return (
    <LibrosContext.Provider
      value={{
        librosFisicos,
        prestamos,
        reservas,
        talleres,
        fotosAportadas,
        isLoading,
        solicitarPrestamo,
        solicitarReserva,
        cancelarReserva,
        renovarPrestamo,
        registrarDevolucion,
        agregarLibro,
        actualizarLibro,
        eliminarLibro,
        actualizarPortada,
        aprobarPortada,
        descartarPortada,
        buscarYAsociarPortada,
        actualizarLoteLibros,
        guardarEnServidor,
        aportarFoto,
        restablecerInventarioOriginal,
      }}
    >
      {children}
    </LibrosContext.Provider>
  );
}

export function useLibros() {
  const context = useContext(LibrosContext);
  if (!context) {
    throw new Error('useLibros debe ser utilizado dentro de un LibrosProvider');
  }
  return context;
}
