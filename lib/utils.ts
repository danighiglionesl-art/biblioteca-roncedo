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
