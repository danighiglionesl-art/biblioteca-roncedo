'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ActaHistorica, FolioArchivo, UserRole } from '@/types';
import {
  getActasHistoricas,
  getFoliosArchivo,
  saveActaHistorica,
  deleteActaHistorica,
} from '@/lib/supabase/actas';
import { ActasHeader } from '@/components/actas/ActasHeader';
import { ActasExplorador } from '@/components/actas/ActasExplorador';
import { ActaVisorModal } from '@/components/actas/ActaVisorModal';
import { GestionActaModal } from '@/components/actas/GestionActaModal';
import { ConfirmarEliminarModal } from '@/components/actas/ConfirmarEliminarModal';
import { Loader2 } from 'lucide-react';

export default function ActasPage() {
  const { user, switchUserRoleDemo } = useAuth();

  // Permisos según el rol y condición del usuario
  const isAdmin = user?.role === 'admin';
  const isSocioProtector = Boolean(user?.es_socio_protector && user?.estado_socio_protector === 'activo');

  // Datos
  const [actas, setActas] = useState<ActaHistorica[]>([]);
  const [folios, setFolios] = useState<FolioArchivo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnio, setSelectedAnio] = useState('Todos');
  const [selectedTipo, setSelectedTipo] = useState('Todos');

  // Modales
  const [isVisorOpen, setIsVisorOpen] = useState(false);
  const [actaParaVisor, setActaParaVisor] = useState<ActaHistorica | null>(null);
  const [folioParaVisor, setFolioParaVisor] = useState<FolioArchivo | null>(null);

  const [isGestionModalOpen, setIsGestionModalOpen] = useState(false);
  const [actaParaEditar, setActaParaEditar] = useState<ActaHistorica | null>(null);

  const [isEliminarModalOpen, setIsEliminarModalOpen] = useState(false);
  const [actaParaEliminar, setActaParaEliminar] = useState<ActaHistorica | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carga inicial de datos
  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [listaActas, listaFolios] = await Promise.all([
        getActasHistoricas(),
        getFoliosArchivo(),
      ]);
      setActas(listaActas);
      setFolios(listaFolios);
    } catch (e) {
      console.error('Error cargando actas y folios:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrado de Actas
  const actasFiltradas = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return actas.filter((acta) => {
      // Filtro de búsqueda
      if (q) {
        const matchesTitulo = acta.titulo.toLowerCase().includes(q);
        const matchesResumen = acta.resumen.toLowerCase().includes(q);
        const matchesTranscripcion =
          acta.transcripcion_completa && acta.transcripcion_completa.toLowerCase().includes(q);
        const matchesNum = String(acta.numero_acta).includes(q);
        const matchesFirmantes = acta.firmantes?.some((f) => f.nombre.toLowerCase().includes(q));
        const matchesTemas = acta.temas_tratados?.some((t) => t.toLowerCase().includes(q));

        if (
          !matchesTitulo &&
          !matchesResumen &&
          !matchesTranscripcion &&
          !matchesNum &&
          !matchesFirmantes &&
          !matchesTemas
        ) {
          return false;
        }
      }

      // Filtro por año
      if (selectedAnio !== 'Todos' && String(acta.anio) !== selectedAnio) {
        return false;
      }

      // Filtro por tipo de reunión
      if (selectedTipo !== 'Todos' && acta.tipo_reunion !== selectedTipo) {
        return false;
      }

      return true;
    });
  }, [actas, searchTerm, selectedAnio, selectedTipo]);

  // Manejo de apertura de Visor
  const handleVerActa = (acta: ActaHistorica) => {
    setActaParaVisor(acta);
    const folioAsoc = folios.find((f) => f.numero_pagina === acta.pagina_archivo_inicio) || null;
    setFolioParaVisor(folioAsoc);
    setIsVisorOpen(true);
  };

  const handleVerFolio = (folio: FolioArchivo) => {
    setFolioParaVisor(folio);
    const actaAsoc = actas.find(
      (a) => folio.numero_pagina >= a.pagina_archivo_inicio && folio.numero_pagina <= a.pagina_archivo_fin
    ) || null;
    setActaParaVisor(actaAsoc);
    setIsVisorOpen(true);
  };

  const handleCambiarPaginaVisor = (numPagina: number) => {
    const fol = folios.find((f) => f.numero_pagina === numPagina) || null;
    setFolioParaVisor(fol);
    const act = actas.find(
      (a) => numPagina >= a.pagina_archivo_inicio && numPagina <= a.pagina_archivo_fin
    ) || null;
    setActaParaVisor(act);
  };

  // Manejo de Creación y Edición (Admin)
  const handleAbrirNuevaActa = () => {
    if (!isAdmin) return;
    setActaParaEditar(null);
    setIsGestionModalOpen(true);
  };

  const handleAbrirEditarActa = (acta: ActaHistorica) => {
    if (!isAdmin) return;
    setActaParaEditar(acta);
    setIsGestionModalOpen(true);
  };

  const handleGuardarActa = async (datosActa: Partial<ActaHistorica>) => {
    if (!isAdmin) {
      alert('Solo el Administrador tiene permisos para gestionar actas.');
      return;
    }

    const resultado = await saveActaHistorica(
      datosActa as Partial<ActaHistorica> & { id?: string; titulo: string; numero_acta: number | string },
      user?.role
    );

    if (resultado.success) {
      await cargarDatos();
      if (isVisorOpen && actaParaVisor?.id === datosActa.id) {
        setActaParaVisor(resultado.data || null);
      }
    } else {
      throw new Error(resultado.error || 'Error al guardar el acta.');
    }
  };

  // Manejo de Eliminación (Admin)
  const handleAbrirEliminarActa = (acta: ActaHistorica) => {
    if (!isAdmin) return;
    setActaParaEliminar(acta);
    setIsEliminarModalOpen(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!isAdmin || !actaParaEliminar) return;

    setIsDeleting(true);
    try {
      const res = await deleteActaHistorica(actaParaEliminar.id, user?.role);
      if (res.success) {
        setIsEliminarModalOpen(false);
        setActaParaEliminar(null);
        if (actaParaVisor?.id === actaParaEliminar.id) {
          setIsVisorOpen(false);
        }
        await cargarDatos();
      } else {
        alert(res.error || 'Error eliminando el acta.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Conmutador de rol para pruebas demo
  const handleSwitchRole = (role: UserRole) => {
    switchUserRoleDemo(role);
  };

  return (
    <div className="min-h-screen bg-[#EDF5FD] pb-24 pt-4 sm:pt-6 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cabecera con buscador, estadísticas y roles */}
        <ActasHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedAnio={selectedAnio}
          onAnioChange={setSelectedAnio}
          selectedTipo={selectedTipo}
          onTipoChange={setSelectedTipo}
          isAdmin={isAdmin}
          isSocioProtector={isSocioProtector}
          currentUserRole={user?.role}
          onSwitchRole={handleSwitchRole}
          onNuevaActa={handleAbrirNuevaActa}
          totalFolios={folios.length}
          totalActas={actas.length}
        />

        {/* Contenido principal o indicador de carga */}
        {isLoading ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-blue-200/80 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-roncedo-celeste animate-spin" />
            <p className="text-xs font-bold text-slate-600">
              Cargando folios y actas digitalizadas...
            </p>
          </div>
        ) : (
          <ActasExplorador
            actas={actasFiltradas}
            folios={folios}
            onVerActa={handleVerActa}
            onVerFolio={handleVerFolio}
            isAdmin={isAdmin}
            onEditarActa={handleAbrirEditarActa}
            onEliminarActa={handleAbrirEliminarActa}
          />
        )}

        {/* Modal de Visor de Alta Resolución */}
        <ActaVisorModal
          isOpen={isVisorOpen}
          onClose={() => setIsVisorOpen(false)}
          actaSeleccionada={actaParaVisor}
          folioSeleccionado={folioParaVisor}
          todosLosFolios={folios}
          todasLasActas={actas}
          onCambiarPagina={handleCambiarPaginaVisor}
          isAdmin={isAdmin}
          isSocioProtector={isSocioProtector}
          onEditarActa={handleAbrirEditarActa}
        />

        {/* Modal de Gestión / Creación / Edición (Solo Admin) */}
        <GestionActaModal
          isOpen={isGestionModalOpen}
          onClose={() => setIsGestionModalOpen(false)}
          actaParaEditar={actaParaEditar}
          onGuardar={handleGuardarActa}
          isAdmin={isAdmin}
        />

        {/* Modal de Confirmar Eliminación (Solo Admin) */}
        <ConfirmarEliminarModal
          isOpen={isEliminarModalOpen}
          onClose={() => setIsEliminarModalOpen(false)}
          acta={actaParaEliminar}
          onConfirmar={handleConfirmarEliminar}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
