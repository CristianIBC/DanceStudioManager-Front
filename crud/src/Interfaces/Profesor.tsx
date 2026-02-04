import type { Curso } from "./Curso";

export interface Profesor {
  id?: number;
  nombre?: string;
  apellido?: string;
  cursos?: Curso[];
}
