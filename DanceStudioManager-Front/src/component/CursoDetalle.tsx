import type { Curso } from "../Interfaces/Curso";

type CursonDetalleProps = {
  curso?: Curso;
};

const CursoDetalle: React.FC<CursonDetalleProps> = ({ curso }) => {
  if (!curso) {
    return (
      <div className="alert alert-warning">No hay información del curso</div>
    );
  }
  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">Información del curso</h5>
      </div>

      <div className="card-body">
        <div className="row">
          <div className="col">
            {" "}
            <p>
              <strong>ID:</strong> {curso.id ?? "—"}
            </p>
            <p>
              <strong>Nombre:</strong> {curso.nombre ?? "—"}
            </p>
            <p>
              <strong>Horario:</strong> {curso.horario ?? "—"}
            </p>
            <p>
              <strong>Duración:</strong>{" "}
              {curso.duracion ? `${curso.duracion} hrs` : "—"}
            </p>
          </div>
          <div className="col">
            <p>
              <strong>Días:</strong> {curso.dias ?? "—"}
            </p>
            <p>
              <strong>Costo:</strong> {curso.costo ? `$${curso.costo}` : "—"}
            </p>
            <p>
              <strong>Turno :</strong>{" "}
              {curso.pm === undefined ? "—" : curso.pm ? "PM" : "AM"}
            </p>
          </div>
        </div>

        <hr />
        <p className="fw-bold mb-1">Profesor</p>
        {curso.profesorNombre ?? "No asignado"}
        <hr />
      </div>
    </div>
  );
};

export default CursoDetalle;
