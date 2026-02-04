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
import { URL } from "../constants/url";
import type { Alumno } from "../Interfaces/Alumno";
import type { Sucursal } from "../Interfaces/Sucursal";
import SucursalDetalle from "../component/SucursalDetalle";
import CursosSucursal from "../component/CursosSucursal";
import AlumnosSucursal from "../component/AlumnosSucursal";

export default function Sucursales() {
  const url = URL.HOST + "/sucursales";
  //Variables para mostrar los modales *******************************************************
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);

  //Variables de la interfaz *****************************************************************
  const [id, setId] = useState<number | undefined>(undefined);
  const [nombre, setNombre] = useState<string | undefined>("");
  const [ubicacion, setUbicacion] = useState<string | undefined>("");
  const [telefono, setTelefono] = useState<string | undefined>("");

  //Varibales para visualizar los detalles del profesor ****************************************
  const [sucursalView, setSucursalView] = useState<Profesor>();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);

  //Handlers para los modales ***************************************************************
  const handleOpenAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => {
    setShowAddModal(false);
    cleanData();
  };
  const handleOpenView = () => setShowViewModal(true);
  const handleCloseView = () => {
    setCursos([]);
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
    setUbicacion("");
    setTelefono("");
    setId(undefined);
  };

  // Hook para obtener todos los profesores (GET) ***************************************************
  const {
    data,
    loading: loadingGet,
    error: errorGet,
  } = useFetch<Sucursal[]>(url);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  useEffect(() => {
    if (data) {
      setSucursales(data);
    }
  }, [data]);
  //Variable para actualizar la data con base en la busqueda ***************************************
  const dataFiltrada = filtrarDatos(sucursales, search);
  // Hook para crear profesor (POST) ****************************************************************
  const {
    post,
    loading: loadingPost,
    error: errorPost,
  } = usePost<Sucursal>(url);
  // Hook para elimminar profesor DELETE ************************************************************
  const { deleteRecord } = useDelete({
    endpoint: url,
  });
  const { confirmDelete } = DeleteAlert();
  // Hook para actualizar prfesor PUT **************************************************************

  const { update, loading } = useUpdate<Sucursal, Sucursal>(url, {
    onSuccess: () =>
      showSuccess({
        message: "Sucursal actualizada correctamente",
        title: "Exito",
      }),
  });
  // Handler para agregar profesor ************************************************************
  const handleSubmitAdd = async () => {
    if (nombre == "" || ubicacion == "") {
      showError({
        title: "Datos incorrectos",
        message: "El nombre y la ubicacion son obligatorios",
      });
    } else {
      const sucursal: Sucursal = {
        nombre: nombre,
        ubicacion: ubicacion,
        telefono: telefono != "" ? Number(telefono) : undefined,
      };
      try {
        const nuevaSucursal = await post(sucursal);
        if (nuevaSucursal.id != undefined && nuevaSucursal.id > 0) {
          showSuccess({
            title: "Exito",
            message: "Sucursal agregada correctamente",
          });
          setSucursales([...sucursales, nuevaSucursal]);
        } else {
          showError({
            title: "Error",
            message: "Algo salio mal",
          });
        }
      } catch (err) {
        console.error("Error al crear sucursal:", err);
        alert("Error al crear la sucursal");
      }
      handleCloseAdd();
      cleanData();
    }
  };
  // Handler para actualizar profesor **********************************************************
  const handleSubmitEdit = async () => {
    if (nombre == "" || ubicacion == "") {
      showError({
        title: "Datos incorrectos",
        message: "El nombre y la ubicacion son obligatorios",
      });
    } else {
      const sucursalUpdate: Sucursal = {
        nombre: nombre,
        ubicacion: ubicacion,
        telefono: telefono != "" ? Number(telefono) : undefined,
        id: id,
      };
      try {
        const sucursalEditada = await update(sucursalUpdate.id, sucursalUpdate);
        const sucursal: Sucursal = {
          nombre: sucursalEditada.nombre,
          ubicacion: sucursalEditada.ubicacion,
          id: sucursalEditada.id,
          telefono: sucursalEditada.telefono,
          cursos: sucursalEditada.cursos,
          alumnos: sucursalEditada.alumnos,
        };

        setSucursales((prev) =>
          prev.map((a) => (a.id === sucursal.id ? sucursal : a)),
        );
      } catch (err) {
        showError({ message: "Error al actualizar la sucursal" });
      }
      handleCloseEdit();
      cleanData();
    }
  };

  // Handlear para abrir los modales *****************************************************************
  const handleEditButton = (sucursalEditada: Sucursal) => {
    handleOpenEdit();
    setNombre(sucursalEditada.nombre);
    setUbicacion(sucursalEditada.ubicacion);
    setId(sucursalEditada.id);
    setTelefono(String(sucursalEditada.telefono));
  };
  const handleViewButton = async (sucursalView: Sucursal) => {
    setSucursalView(sucursalView);
    handleOpenView();
    try {
      sucursalView.cursos?.map((curso) => {
        const cursoTemp: Curso = {
          id: curso.id,
          nombre: curso.nombre,
          horario: curso.horario,
          pm: curso.pm,
          profesorNombre: curso.profesorNombre,
        };
        setCursos((prev) => [...prev, cursoTemp]);
      });
      sucursalView.alumnos?.map((alumno) => {
        const alumnoTemp: Alumno = {
          id: alumno.id,
          nombre: alumno.nombre,
          apellido: alumno.apellido,
          descuento: alumno.descuento,
          fechaDeCreacion: alumno.fechaDeCreacion,
        };
        setAlumnos((prev) => [...prev, alumnoTemp]);
      });
    } catch (error) {
      console.error(error);
    }
  };
  const hanldeDeleteButton = async (sucursalBorrada: Sucursal) => {
    if (sucursales.length == 5) {
      showError({
        title: "Error",
        message: "No te puedes quedar sin sucursales",
      });
      return;
    }
    const confirmed = await confirmDelete({
      title: "¿Eliminar sucursal?",
      text: `¿Estás seguro de eliminar a ${sucursalBorrada.nombre}?`,
    });
    if (confirmed) {
      try {
        // Aquí va tu llamada a la API
        // await deleteUser(id);
        const result = await deleteRecord(sucursalBorrada.id);

        if (result.success) {
          setSucursales(
            sucursales.filter((sucursal) => sucursal.id !== sucursalBorrada.id),
          );
          showSuccess({
            message: `Sucursal "${sucursalBorrada.nombre}" eliminada correctamente`,
          });
        } else {
          showError({
            message:
              "No se pudo eliminar la sucursal, posiblemente este ligado a profesores, alunmos, etc.",
          });
        }
      } catch (error) {
        showError({
          message:
            "No se pudo eliminar la sucursal, posiblemente este ligado a profesores, alunmos, etc.",
        });
      }
    }
  };
  // HTML *******************************************************************************************
  return (
    <div className="">
      <h2>Sucursales</h2>
      <div className="text-end">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenAdd}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Agregar Sucursal
        </button>
      </div>
      <br />
      {/* MODAL PARA CREATE */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAdd}
        title={"Agregar sucursal"}
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
            Ubicación <span className="text-danger">*</span>
          </label>

          <input
            className="form-control mb-2"
            placeholder="Ubicacion"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
          />
          <label className="form-label fw-bold">Teléfono</label>
          <input
            className="form-control mb-2"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
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
            {" "}
            Ubicación <span className="text-danger">*</span>
          </label>

          <input
            className="form-control mb-2"
            placeholder="Ubicacion"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
          />
          <label className="form-label fw-bold">Teléfono</label>
          <input
            className="form-control mb-2"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
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
        title={"Detalles de la sucursal"}
        size="lg"
      >
        <div className="modal-body"></div>
        <SucursalDetalle sucursal={sucursalView}></SucursalDetalle>
        <CursosSucursal cursos={cursos}></CursosSucursal>
        <AlumnosSucursal alumnos={alumnos}></AlumnosSucursal>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleCloseView}>
            Cerrar
          </button>
        </div>
      </Modal>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar sucursal..."
      />
      <GenericTable<Sucursal>
        data={dataFiltrada}
        columns={[
          { key: "id", header: "ID" },
          { key: "nombre", header: "Nombre" },
          { key: "ubicacion", header: "Ubicacion" },
          { key: "telefono", header: "Telefono" },
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
