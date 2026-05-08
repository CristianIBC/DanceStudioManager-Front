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
import SearchBar from "../component/SearchBar";
import ProfesorDetalle from "../component/ProfesorDetalle";
import CursosProfesor from "../component/CursosProfesor";
import { URL } from "../constants/url";

export default function Profesores() {
  const url = URL.HOST + "/profesores";
  //Variables para mostrar los modales *******************************************************
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);

  //Variables de la interfaz *****************************************************************
  const [id, setId] = useState<number | undefined>(undefined);
  const [nombre, setNombre] = useState<string | undefined>("");
  const [apellido, setApellido] = useState<string | undefined>("");
  //Varibales para visualizar los detalles del profesor ****************************************
  const [profesorView, setProfesorView] = useState<Profesor>();
  const [cursos, setCursos] = useState<Curso[]>([]);
  //Handlers para los modales ***************************************************************
  const handleOpenAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => {
    setShowAddModal(false);
    cleanData();
  };
  const handleOpenView = () => setShowViewModal(true);
  const handleCloseView = () => {
    setCursos([]);
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
    setApellido("");
    setId(undefined);
  };
  // Hook para obtener todos los profesores (GET) ***************************************************
  const {
    data
  } = useFetch<Profesor[]>(url);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  useEffect(() => {
    if (data) {
      setProfesores(data);
    }
  }, [data]);

  //Variable para actualizar la data con base en la busqueda ***************************************
  const dataFiltrada = filtrarDatos(profesores, search);
  // Hook para crear profesor (POST) ****************************************************************
  const {
    post
  } = usePost<Profesor>(url);

  // Hook para elimminar profesor DELETE ************************************************************
  const { deleteRecord } = useDelete({
    endpoint: url,
  });
  const { confirmDelete } = DeleteAlert();

  // Hook para actualizar prfesor PUT **************************************************************

  const { update } = useUpdate<Profesor, Profesor>(url, {
    onSuccess: () =>
      showSuccess({
        message: "Profesor actualizado correctamente",
        title: "Exito",
      }),
  });
  // Handler para agregar profesor ************************************************************
  const handleSubmitAdd = async () => {
    if (nombre == "" || apellido == "") {
      showError({
        title: "Datos incorrectos",
        message: "El nombre y el apellido son obligatorios",
      });
    } else {
      const profesor: Profesor = {
        nombre: nombre,
        apellido: apellido,
      };
      try {
        const nuevoProfesor = await post(profesor);
        if (nuevoProfesor.id != undefined && nuevoProfesor.id > 0) {
          showSuccess({
            title: "Exito",
            message: "Profesor agregado correctamente",
          });
          setProfesores([...profesores, nuevoProfesor]);
        } else {
          showError({
            title: "Error",
            message: "Algo salio mal",
          });
        }
      } catch (err) {
        console.error("Error al crear profesor:", err);
        alert("Error al crear el profesor");
      }
      handleCloseAdd();
      cleanData();
    }
  };
  // Handler para actualizar profesor **********************************************************
  const handleSubmitEdit = async () => {
    if (nombre == "" || apellido == "" || id == undefined) {
      showError({
        title: "Datos incorrectos",
        message: "El nombre y el apellido son obligatorios",
      });
    } else {
      const profesorUpdate: Profesor = {
        nombre: nombre,
        apellido: apellido,
        id: id,
      };
      try {
        const profesorEditado = await update(profesorUpdate.id, profesorUpdate);
        const profesor: Profesor = {
          nombre: profesorEditado.nombre,
          apellido: profesorEditado.apellido,
          id: profesorEditado.id,
          cursos: profesorEditado.cursos,
        };

        setProfesores((prev) =>
          prev.map((a) => (a.id === profesor.id ? profesor : a)),
        );
      } catch (err) {
        showError({ message: "Error al actualizar el profesor" });
      }
      handleCloseEdit();
      cleanData();
    }
  };
  // Handlear para abrir los modales *****************************************************************
  const handleEditButton = (profesorEditado: Profesor) => {
    handleOpenEdit();
    setNombre(profesorEditado.nombre);
    setApellido(profesorEditado.apellido);
    setId(profesorEditado.id);
  };
  const handleViewButton = async (profesorVew: Profesor) => {
    setProfesorView(profesorVew);
    handleOpenView();
    try {
      profesorVew.cursos?.map((curso) => {
        const cursoTemp: Curso = {
          id: curso.id,
          nombre: curso.nombre,
          horario: curso.horario,
          pm: curso.pm,
          sucursalNombre: curso.sucursalNombre,
        };
        setCursos((prev) => [...prev, cursoTemp]);
      });
    } catch (error) {
      console.error(error);
    }
  };
  const hanldeDeleteButton = async (profesorBorrado: Profesor) => {
    const confirmed = await confirmDelete({
      title: "¿Eliminar profesor?",
      text: `¿Estás seguro de eliminar a ${profesorBorrado.nombre}? IMPORTANTE: Los cursos asociados a este profesor quedarán sin asignar`,
    });
    if (confirmed) {
      try {
        // Aquí va tu llamada a la API
        // await deleteUser(id);
        const result = await deleteRecord(profesorBorrado.id);

        if (result.success) {
          setProfesores(
            profesores.filter((profesor) => profesor.id !== profesorBorrado.id),
          );
          showSuccess({
            message: `Profesor ${profesorBorrado.nombre} eliminado correctamente`,
          });
        } else {
          showError({
            message:
              "No se pudo eliminar el profesor, posiblemente este ligado a cursos",
          });
        }
      } catch (error) {
        showError({
          message:
            "No se pudo eliminar el profesor, posiblemente este ligado a cursos",
        });
      }
    }
  };

  // HTML *******************************************************************************************
  return (
    <div className="">
      <h2>Profesores</h2>
      <div className="text-end">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenAdd}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Agregar Profesor
        </button>
      </div>
      <br />
      {/* MODAL PARA CREATE */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAdd}
        title={"Agregar profesor"}
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
            Apellido <span className="text-danger">*</span>
          </label>
          <input
            className="form-control mb-2"
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
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
        title={"Editar profesor"}
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
            Apellido <span className="text-danger">*</span>
          </label>
          <input
            className="form-control mb-2"
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
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
        title={"Detalles del profesor"}
        size="lg"
      >
        <div className="modal-body"></div>
        <ProfesorDetalle profesor={profesorView}></ProfesorDetalle>
        <CursosProfesor cursos={cursos}></CursosProfesor>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleCloseView}>
            Cerrar
          </button>
        </div>
      </Modal>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar profesor..."
      />
      <GenericTable<Profesor>
        data={dataFiltrada}
        columns={[
          { key: "id", header: "ID" },
          { key: "nombre", header: "Nombre" },
          { key: "apellido", header: "Apellido" },
        ]}
        striped
        bordered
        hover
        small
        onEdit={handleEditButton}
        onDelete={hanldeDeleteButton}
        onView={handleViewButton}
        getId={(profesor) => profesor.id}
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
