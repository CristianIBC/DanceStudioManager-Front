import type { AlumnoCurso } from "./AlumnoCurso";

export interface Alumno {
  id?: number;
  nombre?: string;
  apellido?: string;
  telefono?: number;
  descuento?: number;
  fechaDeCreacion?: string;
  sucursalId?: number;
  sucursalNombre?: string;
  fechaDeInscripcion?: string;
  diaDePago?: number;
  mensualidad?: number;
  estatus?: boolean;
  paqueteId?: number;
  paqueteNombre?: string;
  correo?: string;
}
