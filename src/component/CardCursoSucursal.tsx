import { useState } from "react";
import type { Alumno } from "../Interfaces/Alumno";
import type { Curso } from "../Interfaces/Curso";
import type { AlumnoCursos } from "../Interfaces/AlumnoCursos";
import { URL } from "../constants/url";
import useFetch from "../hooks/useFetch";
import type Alumnos from "../pages/Alumnos";
import { GenericTablePDF } from "./GenericTablePDF";

type CursonDetalleProps = {
  curso: Curso;
  index: number;
};
const CardCursoSucursal: React.FC<CursonDetalleProps> = ({ curso, index }) => {
  const url = URL.HOST + `/cursos/alumnos/${curso.id}`;
  if (!curso) {
    return (
      <div className="alert alert-warning">No hay información del curso</div>
    );
  }
  const {
    data,
    loading: loadingGet,
    error: errorGet,
  } = useFetch<AlumnoCursos>(url);

  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <div className="row">
          <div className="col">
            <h5 className="mb-0">
              {index + 1}. {curso.nombre ?? "—"}
            </h5>
          </div>
          <div className="col-md-2">
            {" "}
            <p>
              <strong>Horario:</strong> {curso.horario ?? "—"}{" "}
              {curso.pm === undefined ? "—" : curso.pm ? "PM" : "AM"}
            </p>
          </div>
          <div className="col-md-3">
            <strong>Profesor: </strong>
            {curso.profesorNombre ?? "No asignado"}
          </div>
        </div>
      </div>

      <div className="card-body">
        <GenericTablePDF<Alumno>
          data={data?.alumnos}
          columns={[
            {
              key: "nombre",
              header: "Alumno ",
              render: (a) => a.nombre + " " + a.apellido,
            },
            { key: "telefono", header: "Telefono" },
            { key: "fechaDeInscripcion", header: "Fecha de inscripción" },
            {
              key: "estatus",
              header: "Estatus",
              render: (alumno) =>
                alumno.estatus == true ? "Activo" : "Inactivo",
            },
            {
              key: "mensualidad",
              header: "Mensualidad",
              render: (a) => (a.mensualidad ?? 0) - (a.descuento ?? 0),
            },
            { key: "paqueteNombre", header: "Paquete" },
          ]}
          striped
          bordered
          hover
          small
          showActions={false}
          getId={(alumno) => alumno.id}
        />
      </div>
    </div>
  );
};

export default CardCursoSucursal;
