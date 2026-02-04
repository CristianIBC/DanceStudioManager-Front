import type { Sucursal } from "../Interfaces/Sucursal";

type SucursalDetalleProps = {
  sucursal?: Sucursal;
};

const SucursalDetalle: React.FC<SucursalDetalleProps> = ({ sucursal }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">Información de la Sucursal</h5>
      </div>

      <div className="card-body">
        <p>
          <strong>ID:</strong> {sucursal?.id}
        </p>
        <p>
          <strong>Nombre:</strong> {sucursal?.nombre}
        </p>
        <p>
          <strong>Ubicacion:</strong> {sucursal?.ubicacion}
        </p>
        <p>
          <strong>Telefono:</strong> {sucursal?.telefono ?? "No registrado"}
        </p>
      </div>
    </div>
  );
};

export default SucursalDetalle;
