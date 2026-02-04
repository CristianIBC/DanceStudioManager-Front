import type { Alumno } from "../Interfaces/Alumno";

type AlumnoDetalleProps = {
  alumno?: Alumno;
};

const AlumnoDetalle: React.FC<AlumnoDetalleProps> = ({ alumno }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">Información del Alumno</h5>
      </div>

      <div className="card-body">
        <div className="row">
          <div className="col">
            {" "}
            <p>
              <strong>ID:</strong> {alumno?.id}
            </p>
            <p>
              <strong>Nombre:</strong> {alumno?.nombre}
            </p>
            <p>
              <strong>Apellido:</strong> {alumno?.apellido}
            </p>
            <p>
              <strong>Teléfono:</strong> {alumno?.telefono ?? "No registrado"}
            </p>
            <p>
              <strong>Descuento:</strong> {alumno?.descuento}
            </p>
            <p>
              <strong>Día límite de pago: </strong> {alumno?.diaDePago}
            </p>
          </div>
          <div className="col">
            <p>
              <strong>Fecha de creación:</strong> {alumno?.fechaDeCreacion}
            </p>
            <p>
              <strong>Sucursal:</strong> {alumno?.sucursalNombre}
            </p>
            <p>
              <strong>Paquete:</strong> {alumno?.paqueteNombre}
            </p>
            <p>
              <strong>Mensualidad:</strong> ${alumno?.mensualidad}
            </p>
            <p>
              <strong>Correo:</strong> {alumno?.correo ?? "No registrado"}
            </p>
            <p>
              <strong>Estatus:</strong>{" "}
              {alumno?.estatus ? "Activo" : "Inactivo"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumnoDetalle;
