import type { Alumno } from "./Alumno";
import type { Curso } from "./Curso";

export interface Sucursal {
  id?: number;
  nombre?: string;
  ubicacion?: string;
  telefono?: number;
  alumnos?: Alumno[];
  cursos?: Curso[];
}
