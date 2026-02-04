import type { Curso } from "../Interfaces/Curso";
import { GenericTable } from "./GenericTable";
type Props = {
  cursos?: Curso[];
  handlerOnDelete?: (curso: Curso) => {};
};

const CursosAlumno: React.FC<Props> = ({ cursos, handlerOnDelete }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">Cursos del alumno</h5>
      </div>

      <div className="card-body">
        <GenericTable<Curso>
          data={cursos}
          columns={[
            { key: "id", header: "ID" },
            { key: "nombre", header: "Nombre" },
            { key: "fechaDeInscripcion", header: "Fecha de Inscripcion" },
          ]}
          striped
          bordered
          hover
          small
          showActions={true}
          getId={(curso) => curso.id}
          pageSize={5}
          onDelete={handlerOnDelete ? handlerOnDelete : undefined}
        />
      </div>
    </div>
  );
};

export default CursosAlumno;
