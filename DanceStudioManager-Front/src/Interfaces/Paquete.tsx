import type { Alumno } from "./Alumno";

export interface Paquete {
  id?: number;
  nombre?: string;
  costo?: number;
  alumnos?: Alumno[];
}
