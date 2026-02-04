import type { Profesor } from "../Interfaces/Profesor";

type ProfesorDetalleProps = {
  profesor?: Profesor;
};

const ProfesorDetalle: React.FC<ProfesorDetalleProps> = ({ profesor }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">Información del Profesor</h5>
      </div>

      <div className="card-body">
        <p>
          <strong>ID:</strong> {profesor?.id}
        </p>
        <p>
          <strong>Nombre:</strong> {profesor?.nombre}
        </p>
        <p>
          <strong>Apellido:</strong> {profesor?.apellido}
        </p>
      </div>
    </div>
  );
};

export default ProfesorDetalle;
