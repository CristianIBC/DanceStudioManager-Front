import type { AlumnoCurso } from "./AlumnoCurso";
import type { Profesor } from "./Profesor";
import type { Sucursal } from "./Sucursal";

export interface Curso {
  id?: number;
  nombre?: string;
  horario?: string;
  duracion?: number;
  dias?: string;
  costo?: number;
  pm?: boolean;
  alumnoCursos?: AlumnoCurso[];
  fechaDeInscripcion?: string;
  profesorId?: number;
  profesorNombre?: string;
  profesor?: Profesor;
  sucursalId?: number;
  sucursalNombre?: string;
  sucursal?: Sucursal;
}
