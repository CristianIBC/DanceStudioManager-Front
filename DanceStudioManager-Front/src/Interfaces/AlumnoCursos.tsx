import type { Alumno } from "./Alumno";
import type { Curso } from "./Curso";

export interface AlumnoCursos {
  alumnoId?: number;
  cursoId?: number;
  cursos?: Curso[];
  alumnos?: Alumno[];
}
