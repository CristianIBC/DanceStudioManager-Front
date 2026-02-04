import type { Alumno } from "../Interfaces/Alumno";
import { GenericTable } from "./GenericTable";
type Props = {
  alumnos?: Alumno[];
};

const AlumnosPaquete: React.FC<Props> = ({ alumnos }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">Alumnos del paquete</h5>
      </div>

      <div className="card-body">
        <GenericTable<Alumno>
          data={alumnos}
          columns={[
            { key: "id", header: "ID" },
            { key: "nombre", header: "Nombre" },
            { key: "apellido", header: "Apellido" },
            { key: "diaDePago", header: "Día límite de pago" },
            { key: "descuento", header: "Descuento $" },
          ]}
          striped
          bordered
          hover
          small
          showActions={false}
          getId={(alumno) => alumno.id}
          pageSize={5}
        />
      </div>
    </div>
  );
};

export default AlumnosPaquete;
