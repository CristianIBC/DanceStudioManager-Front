import type { Alumno } from "./Alumno";

export interface PagoRealizado {
  id?: number;
  alumnoId?: number;
  alumno2Id?: number;
  nombre1?: string;
  apellido1?: string;
  nombre2?: string;
  apellido2?: string;
  cantidad?: number;
  descuento1?: number;
  diaDePago1?: boolean;
  mensualidad1?: string;
  descuento2?: number;
  diaDePago2?: boolean;
  mensualidad2?: string;
}
