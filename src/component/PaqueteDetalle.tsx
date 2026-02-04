import type { Paquete } from "../Interfaces/Paquete";

type PaqueteDetalleProps = {
  paquete?: Paquete;
};

const PaqueteDetalle: React.FC<PaqueteDetalleProps> = ({ paquete }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">Información de la Paquete</h5>
      </div>

      <div className="card-body">
        <p>
          <strong>ID:</strong> {paquete?.id}
        </p>
        <p>
          <strong>Nombre:</strong> {paquete?.nombre}
        </p>
        <p>
          <strong>Ubicacion:</strong> ${paquete?.costo}
        </p>
      </div>
    </div>
  );
};

export default PaqueteDetalle;
