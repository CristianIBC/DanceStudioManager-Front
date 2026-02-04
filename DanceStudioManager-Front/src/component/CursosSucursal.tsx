import type { Curso } from "../Interfaces/Curso";
import { GenericTable } from "./GenericTable";
type Props = {
  cursos?: Curso[];
};

const CursosSucursal: React.FC<Props> = ({ cursos }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">Cursos de la sucursal</h5>
      </div>

      <div className="card-body">
        <GenericTable<Curso>
          data={cursos}
          columns={[
            { key: "id", header: "ID" },
            { key: "nombre", header: "Nombre" },
            { key: "horario", header: "Horario (12h)" },
            {
              key: "pm",
              header: "AM/PM",
              render: (curso) => (curso.pm ? "PM" : "AM"),
            },
            { key: "profesorNombre", header: "Profesor" },
          ]}
          striped
          bordered
          hover
          small
          showActions={false}
          getId={(curso) => curso.id}
          pageSize={5}
        />
      </div>
    </div>
  );
};

export default CursosSucursal;
