import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import { usePost } from "../hooks/usePost";
import { Modal } from "../component/Modal";
import type { Profesor } from "../Interfaces/Profesor";
import { DeleteAlert } from "../hooks/alerts/DeleteAlert";
import { showSuccess } from "../hooks/alerts/SuccesAlert";
import { showError } from "../hooks/alerts/ErrorAlert";
import { useDelete } from "../hooks/useDelete";
import { useUpdate } from "../hooks/useUpdate";
import { GenericTable } from "../component/GenericTable";
import type { Curso } from "../Interfaces/Curso";
import type { AlumnoCursos } from "../Interfaces/AlumnoCursos";
import SearchBar from "../component/SearchBar";
import type { AlumnoCurso } from "../Interfaces/AlumnoCurso";
import type { Alumno } from "../Interfaces/Alumno";
import { Dropdown } from "../component/Dropdown";
import CursoDetalle from "../component/CursoDetalle";
import AlumnosCurso from "../component/AlumnosCurso";
import type { Sucursal } from "../Interfaces/Sucursal";
import { URL } from "../constants/url";
import api from "../hooks/api";
import { closeLoading, showLoading } from "../hooks/alerts/LoadingAlert";
import { getSucursalId } from "../helpers/sucursalHelper";
import { showInfo } from "../hooks/alerts/InfoAlert";

export default function Cursos() {
  const url = URL.HOST + "/cursos";
  //Variables para mostrar los modales *******************************************************
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);

  //Variables de la interfaz *****************************************************************
  const [id, setId] = useState<number | undefined>(undefined);
  const [nombre, setNombre] = useState<string | undefined>("");
  const [horario, setHorario] = useState<string>("");
  const [duracion, setDuracion] = useState<string>("");
  const [costo, setCosto] = useState<string>("");
  const [pm, setPm] = useState<boolean | undefined>(true);
  //   const [fechaDeCreacion, setFechaDeCreacion] = useState<string | undefined>(
  //     ""
  //   );
  const [profesorId, setProfesorId] = useState<number | undefined>();
  const [profesorNombre, setProfesorNombre] = useState<string>("");
  const [profesor, setProfesor] = useState<Profesor>();
  const [sucursalId, setSucursalId] = useState<number | undefined>();
  const [sucursalNombre, setSucursalNombre] = useState<string>("");
  const [sucursal, setSucursal] = useState<Sucursal>();
  const [dias, setDias] = useState<string | undefined>("");
  const [alumnoCursos, setAlumnoCursos] = useState<AlumnoCurso[]>([]);
  //Varibales para visualizar los detalles del curso ****************************************
  const [cursoView, setCursoView] = useState<Curso>();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);

  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<number>(getSucursalId());
  if (sucursalSeleccionada == 0) {
    showInfo({
      title: "IMPORTANTE",
      message:
        "No hay ninguna sucursal, un administrador debe crear al menos una",
    });
    return;
  }
  //Handlers para los modales ***************************************************************
  const handleOpenAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => {
    setShowAddModal(false);
    cleanData();
  };
  const handleOpenView = () => setShowViewModal(true);
  const handleCloseView = () => {
    setAlumnos([]);
    setShowViewModal(false);
  };
  const handleOpenEdit = () => setShowEditModal(true);
  const handleCloseEdit = () => {
    setShowEditModal(false);
    cleanData();
  };

  //Variable para la searchBar *****************************************************************
  const [search, setSearch] = useState("");
  //Limpiar data, todos los atributos de la interfaz **************************************************
  const cleanData = () => {
    setNombre("");
    setHorario("");
    setDuracion("");
    setDias("");
    setPm(true);
    setCosto("");
    setAlumnoCursos([]);
    setId(undefined);
    setProfesorId(undefined);
    setProfesorNombre("");
    setProfesorId(undefined);
    setProfesorNombre("");
    setProfesor({});
    setSucursalId(undefined);
    setSucursalNombre("");
    setSucursal({});
  };

  // Hook para obtener todos los cursos (GET) ***************************************************
  const {
    data,
    loading: loadingGet,
    error: errorGet,
  } = useFetch<Curso[]>(url + `/by-sucursal/${sucursalSeleccionada}`);
  const [cursos, setCursos] = useState<Curso[]>([]);
  useEffect(() => {
    if (data) {
      setCursos(data);
    }
  }, [data]);
  useEffect(() => {
    setCursos([]); // limpia la tabla
  }, [sucursalSeleccionada]);
  //Variable para actualizar la data con base en la busqueda ***************************************
  const dataFiltrada = filtrarDatos(cursos, search);
  //Hook para Obtener profesores ******************************************************************
  const { data: dataProfesores } = useFetch<Profesor[]>(
    URL.HOST + "/profesores",
  );
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  useEffect(() => {
    if (dataProfesores) setProfesores(dataProfesores);
  }, [dataProfesores]);
  //Hook para Obtener sucursales ******************************************************************
  const { data: dataSucursales } = useFetch<Sucursal[]>(
    URL.HOST + "/sucursales",
  );
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  useEffect(() => {
    if (dataSucursales) setSucursales(dataSucursales);
  }, [dataSucursales]);
  // Hook para crear alumno (POST) ****************************************************************
  const { post, loading: loadingPost, error: errorPost } = usePost<Curso>(url);

  // Hook para elimminar alumno DELETE ************************************************************
  const { deleteRecord } = useDelete({
    endpoint: url,
  });
  const { confirmDelete } = DeleteAlert();
  // Hook para actualizar alumno PUT **************************************************************

  const { update, loading } = useUpdate<Curso, Curso>(url, {
    onSuccess: () =>
      showSuccess({
        message: "Curso Actualizado correctamente",
        title: "Exito",
      }),
  });
  // Handler para agregar curso ************************************************************
  const handleSubmitAdd = async () => {
    if (
      nombre == "" ||
      horario == "" ||
      duracion == "" ||
      costo == "" ||
      sucursalSeleccionada == undefined
    ) {
      showError({
        title: "Datos incorrectos",
        message: "El nombre, el horario, la duracion, y el costo  obligatorios",
      });
    } else {
      console.log(horario);
      console.log(duracion);
      if (
        isNaN(Number(horario)) ||
        isNaN(Number(duracion)) ||
        isNaN(Number(costo))
      ) {
        showError({
          title: "Datos incorrectos",
          message: "El horario, el costo y la duracion deben ser números",
        });
      } else {
        if (Number(horario) < 0 || Number(horario) > 12) {
          showError({
            title: "Datos incorrectos",
            message: "El horario debe ser formato de 12h",
          });
        } else {
          let curso: Curso = {};
          if (profesor?.id == undefined) {
            curso = {
              nombre: nombre,
              costo: Number(costo),
              dias: dias,
              horario: horario,
              pm: pm,
              sucursal: { id: sucursalSeleccionada },
              duracion: Number(duracion),
            };
          } else {
            curso = {
              nombre: nombre,
              costo: Number(costo),
              dias: dias,
              horario: horario,
              pm: pm,
              profesor: { id: profesor.id },
              sucursal: { id: sucursalSeleccionada },
              duracion: Number(duracion),
            };
          }

          try {
            const nuevoCurso = await post(curso);
            if (nuevoCurso.id != undefined && nuevoCurso.id > 0) {
              showSuccess({
                title: "Exito",
                message: "Curso agregado correctamente",
              });

              if (profesor?.id != undefined) {
                nuevoCurso.profesorNombre =
                  profesor.nombre + " " + profesor.apellido;
              }
              nuevoCurso.sucursalNombre = sucursales.find(
                (s) => s.id === sucursalSeleccionada,
              )?.nombre;
              setCursos([...cursos, nuevoCurso]);
            } else {
              showError({
                title: "Error",
                message: "Algo salio mal",
              });
            }
          } catch (err) {
            console.error("Error al crear el curso:", err);
            alert("Error al crear el curso");
          }
          handleCloseAdd();
          cleanData();
        }
      }
    }
  };
  const handleSubmitEdit = async () => {
    if (
      nombre == "" ||
      horario == "" ||
      duracion == "" ||
      costo == "" ||
      sucursalSeleccionada == undefined
    ) {
      showError({
        title: "Datos incorrectos",
        message: "El nombre, el horario, la duracion, y el costo  obligatorios",
      });
    } else {
      if (
        isNaN(Number(horario)) ||
        isNaN(Number(duracion)) ||
        isNaN(Number(costo))
      ) {
        showError({
          title: "Datos incorrectos",
          message: "El horario, el costo y la duracion deben ser números",
        });
      } else {
        if (Number(horario) < 0 || Number(horario) > 12) {
          showError({
            title: "Datos incorrectos",
            message: "El horario debe ser formato de 12h",
          });
        } else {
          let cursoUpdate: Curso = {
            nombre: nombre,
            costo: Number(costo),
            dias: dias,
            horario: horario,
            pm: pm,
            profesor: { id: profesor?.id ? profesor.id : undefined },
            sucursal: { id: sucursalSeleccionada },
            duracion: Number(duracion),
            id: id,
          };

          try {
            const cursoEditado = await update(cursoUpdate.id, cursoUpdate);

            const curso: Curso = {
              nombre: cursoEditado.nombre,
              costo: cursoEditado.costo,
              dias: cursoEditado.dias,
              horario: cursoEditado.horario,
              pm: cursoEditado.pm,
              profesorNombre: cursoEditado.profesorNombre,
              sucursalNombre: cursoEditado.sucursalNombre,
              sucursalId: cursoEditado.sucursalId,
              profesorId: cursoEditado.profesorId,
              duracion: cursoEditado.duracion,
              id: cursoEditado.id,
            };

            setCursos((prev) =>
              prev.map((a) => (a.id === curso.id ? curso : a)),
            );
          } catch (err) {
            console.error("Error al crear el curso:", err);
            alert("Error al crear el curso");
          }
          handleCloseEdit();
          cleanData();
        }
      }
    }
  };
  // Handlear para abrir los modales *****************************************************************
  const handleEditButton = (cursoEditado: Curso) => {
    handleOpenEdit();
    setNombre(cursoEditado.nombre);

    setId(cursoEditado.id);
    setHorario(String(cursoEditado.horario));
    setDuracion(String(cursoEditado.duracion));
    setDias(cursoEditado.dias);
    setPm(cursoEditado.pm);
    setCosto(String(cursoEditado.costo));

    setProfesor({
      id: cursoEditado.profesorId,
      nombre: cursoEditado.profesorNombre,
    });
    setSucursal({
      id: cursoEditado.sucursalId,
      nombre: cursoEditado.sucursalNombre,
    });
  };
  const handleViewButton = async (cursoView: Curso) => {
    showLoading("Recuperando información del curso");
    setCursoView(cursoView);
    handleOpenView();
    try {
      const response = await api.get(url + "/alumnos/" + cursoView.id);
      const data: AlumnoCursos = await response.data;

      data.alumnos?.map((alumno) => {
        const alumnoTemp: Alumno = {
          id: alumno.id,
          nombre: alumno.nombre,
          apellido: alumno.apellido,
          descuento: alumno.descuento,
          fechaDeInscripcion: alumno?.fechaDeInscripcion,
        };

        setAlumnos((prev) => [...prev, alumnoTemp]);
      });
      closeLoading();
    } catch (error: any) {
      closeLoading();
      showError({
        title: "Error",
        message: "Algo salió mal: " + error.response?.data,
      });
    }
  };
  const hanldeDeleteButton = async (cursoBorrado: Curso) => {
    const confirmed = await confirmDelete({
      title: "¿Eliminar curso?",
      text: `¿Estás seguro de eliminar a ${cursoBorrado.nombre}?`,
    });
    if (confirmed) {
      try {
        // Aquí va tu llamada a la API
        // await deleteUser(id);
        const result = await deleteRecord(cursoBorrado.id);

        if (result.success) {
          setCursos(cursos.filter((curso) => curso.id !== cursoBorrado.id));
          showSuccess({
            message: `Curso "${cursoBorrado.nombre}" eliminado correctamente`,
          });
        } else {
          showError({
            message:
              "No se pudo eliminar el curso, posiblemente este ligado a profesores, alunmos, etc.",
          });
        }
      } catch (error) {
        showError({
          message:
            "No se pudo eliminar el curso, posiblemente este ligado a profesores, alunmos, etc.",
        });
      }
    }
  };
  return (
    <div className="">
      <h2>Cursos</h2>
      <div className="text-end">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenAdd}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Agregar Curso
        </button>
      </div>
      <br />
      {/* MODAL PARA CREATE */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAdd}
        title={"Agregar curso"}
      >
        <div className="modal-body">
          <label className="form-label fw-bold">
            Nombre <span className="text-danger">*</span>
          </label>
          <input
            className="form-control mb-2"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <label className="form-label fw-bold">
            {" "}
            Horario (formato 12h) <span className="text-danger">*</span>
          </label>
          <input
            className="form-control mb-2"
            placeholder="Horario (formato 12h)"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
          />
          <label className="form-label fw-bold">Turno (am/pm)</label>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="activoSwitch"
              checked={pm}
              onChange={(e) => setPm(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="activoSwitch">
              PM?
            </label>
          </div>
          <label className="form-label fw-bold">
            Duracion en horas <span className="text-danger">*</span>
          </label>
          <input
            className="form-control mb-2"
            placeholder="Ej: 1.5 ó 2"
            value={duracion}
            onChange={(e) => setDuracion(e.target.value)}
          />
          <label className="form-label fw-bold">Dias de la semana</label>
          <input
            className="form-control mb-2"
            placeholder="Dias (lunes,martes,miercoles..)"
            value={dias}
            onChange={(e) => setDias(e.target.value)}
          />
          <label className="form-label fw-bold">
            Costo <span className="text-danger">*</span>
          </label>

          <input
            className="form-control mb-2"
            placeholder="Costo $"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
          />
          <div className="row">
            <div className="col">
              <label className="form-label fw-bold">Profesor</label>
              <Dropdown
                items={[{ id: 0, nombre: "No asignado" }, ...profesores]}
                getKey={(s) => s.id}
                getLabel={(s) =>
                  s.apellido ? s.nombre + " " + s.apellido : s.nombre
                }
                placeholder="Selecciona un profesor"
                onSelect={(profesor) => setProfesor(profesor)}
              />
            </div>
            <div className="col">
              <label className="form-label fw-bold">Sucursal</label>
              <input
                className="form-control mb-2 text-muted"
                placeholder="Sucursal"
                value={
                  sucursales.find((s) => s.id === sucursalSeleccionada)?.nombre
                }
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCloseAdd}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmitAdd}>
            Guardar
          </button>
        </div>
      </Modal>
      {/* MODAL PARA EDITAR */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEdit}
        title={"Editar curso"}
      >
        <div className="modal-body">
          <label className="form-label fw-bold">
            Nombre <span className="text-danger">*</span>
          </label>
          <input
            className="form-control mb-2"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <label className="form-label fw-bold">
            {" "}
            Horario (formato 12h) <span className="text-danger">*</span>
          </label>
          <input
            className="form-control mb-2"
            placeholder="Horario (formato 12h)"
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
          />
          <label className="form-label fw-bold">Turno (am/pm)</label>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="activoSwitch"
              checked={pm}
              onChange={(e) => setPm(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="activoSwitch">
              PM?
            </label>
          </div>
          <label className="form-label fw-bold">
            Duracion en horas <span className="text-danger">*</span>
          </label>
          <input
            className="form-control mb-2"
            placeholder="Ej: 1.5 ó 2"
            value={duracion}
            onChange={(e) => setDuracion(e.target.value)}
          />
          <label className="form-label fw-bold">Dias de la semana</label>
          <input
            className="form-control mb-2"
            placeholder="Dias (lunes,martes,miercoles..)"
            value={dias}
            onChange={(e) => setDias(e.target.value)}
          />
          <label className="form-label fw-bold">
            Costo <span className="text-danger">*</span>
          </label>

          <input
            className="form-control mb-2"
            placeholder="Costo $"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
          />
          <div className="row">
            <div className="col">
              <label className="form-label fw-bold">Profesor</label>
              <Dropdown
                items={[
                  { id: undefined, nombre: "No asignado" },
                  ...profesores,
                ]}
                getKey={(s) => s.id}
                getLabel={(s) =>
                  s.apellido ? s.nombre + " " + s.apellido : s.nombre
                }
                placeholder="Selecciona un profesor"
                onSelect={(profesor) => setProfesor(profesor)}
                value={profesor}
              />
            </div>
            <div className="col">
              <label className="form-label fw-bold">Sucursal</label>
              <input
                className="form-control mb-2 text-muted"
                placeholder="Sucursal"
                value={
                  sucursales.find((s) => s.id === sucursalSeleccionada)?.nombre
                }
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCloseEdit}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmitEdit}>
            Editar
          </button>
        </div>
      </Modal>
      {/* MODAL PARA VER DATOS */}
      <Modal
        isOpen={showViewModal}
        onClose={handleCloseView}
        title={"Detalles del alumno"}
        size="lg"
      >
        <div className="modal-body"></div>
        <CursoDetalle curso={cursoView}></CursoDetalle>
        <AlumnosCurso alumnos={alumnos}></AlumnosCurso>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleCloseView}>
            Cerrar
          </button>
        </div>
      </Modal>

      <div className="row">
        <div className="col">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar cursos..."
          />
        </div>

        <div className="col-md-2 text-end">
          <label className="form-label fw-bold">Filtrar por sucursal</label>
        </div>
        <div className="col-md-2">
          <select
            className="form-select mb-3"
            value={sucursalSeleccionada}
            onChange={(e) => {
              setSucursalSeleccionada(Number(e.target.value));
            }}
          >
            <option value={0} disabled>
              Selecciona
            </option>
            {sucursales.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <GenericTable<Curso>
        data={dataFiltrada}
        columns={[
          { key: "id", header: "ID" },
          { key: "nombre", header: "Nombre" },
          { key: "horario", header: "Horario (12h)" },
          {
            key: "pm",
            header: "PM/AM",
            render: (curso) => (curso.pm ? "PM" : "AM"),
          },
          { key: "duracion", header: "Duracion (hr)" },
          { key: "costo", header: "Costo $" },
          {
            key: "dias",
            header: "Dias",
            render: (curso) => (curso.dias ? curso.dias : "N/A"),
          },
          {
            key: "profesorNombre",
            header: "Profesor",
          },
          {
            key: "sucursalNombre",
            header: "Sucursal",
          },
        ]}
        striped
        bordered
        hover
        small
        onEdit={handleEditButton}
        onDelete={hanldeDeleteButton}
        onView={handleViewButton}
        getId={(curso) => curso.id}
      />
    </div>
  );
  function filtrarDatos<T>(data: T[], search: string): T[] {
    if (!search) return data;

    return data.filter((item) =>
      Object.values(item as Record<string, unknown>).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }
}
