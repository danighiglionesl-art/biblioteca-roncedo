import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFechaArgentina(fechaStr?: string): string {
  if (!fechaStr) return "-";
  try {
    const fecha = new Date(fechaStr);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(fecha);
  } catch {
    return fechaStr;
  }
}

import { UserProfile } from "@/types";

export function generarHashQR(user: { id: string; numero_socio?: string; dni?: string }): string {
  const payload = JSON.stringify({
    org: "CSyB-RONCEDO",
    sub: user.id,
    socio: user.numero_socio || "PENDIENTE",
    dni: user.dni || "S/D",
    v: "1.0",
  });
  return btoa(payload);
}

/**
 * Valida si un usuario ha completado todos sus datos personales obligatorios.
 * Todos los campos son obligatorios, excepto:
 * - Correo electrónico (no modificable, asociado a su cuenta)
 * - Observaciones (opcional)
 */
export function isPerfilCompleto(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;

  const valid = (v?: string) => Boolean(v && v.trim().length > 0);

  return (
    valid(user.nombre) &&
    valid(user.apellido) &&
    valid(user.dni) &&
    valid(user.fecha_nacimiento) &&
    valid(user.whatsapp) &&
    valid(user.pais) &&
    valid(user.provincia) &&
    valid(user.localidad) &&
    valid(user.codigo_postal) &&
    valid(user.barrio) &&
    valid(user.calle) &&
    valid(user.numero)
  );
}
