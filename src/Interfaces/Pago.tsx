import type { Alumno } from "./Alumno";

export interface Pago {
  id?: number;
  alumno: Alumno;
  alumnoId?: number;
  alumnoNombre?: string;
  alumno2?: Alumno;
  alumno2Id?: number;
  alumno2Nombre?: string;
  cantidad: number;
  mes?: number;
  pagaEnPaquete: boolean;
  fechaDePago: string;
  sucursalId?: number;
  sucursalNombre?: string;
  anio?: number;
}
