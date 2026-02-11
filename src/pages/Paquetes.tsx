import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import { usePost } from "../hooks/usePost";
import { Modal } from "../component/Modal";
import { DeleteAlert } from "../hooks/alerts/DeleteAlert";
import { showSuccess } from "../hooks/alerts/SuccesAlert";
import { showError } from "../hooks/alerts/ErrorAlert";
import { useDelete } from "../hooks/useDelete";
import { useUpdate } from "../hooks/useUpdate";
import { GenericTable } from "../component/GenericTable";
import SearchBar from "../component/SearchBar";
import { URL } from "../constants/url";
import type { Alumno } from "../Interfaces/Alumno";
import type { Paquete } from "../Interfaces/Paquete";
import PaqueteDetalle from "../component/PaqueteDetalle";
import AlumnosPaquete from "../component/AlumnosPaquete";

export default function Paquetes() {
  const url = URL.HOST + "/paquetes";
  //Variables para mostrar los modales *******************************************************
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);

  //Variables de la interfaz *****************************************************************
  const [id, setId] = useState<number | undefined>(undefined);
  const [nombre, setNombre] = useState<string | undefined>("");
  const [costo, setCosto] = useState<string | undefined>("");

  const [paqueteView, setPaqueteView] = useState<Paquete>();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);

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
    setCosto("");
    setId(undefined);
  };
  // Hook para obtener todos los profesores (GET) ***************************************************
  const {
    data,
    loading: loadingGet,
    error: errorGet,
  } = useFetch<Paquete[]>(url);
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  useEffect(() => {
    if (data) {
      setPaquetes(data);
    }
  }, [data]);
  //Variable para actualizar la data con base en la busqueda ***************************************
  const dataFiltrada = filtrarDatos(paquetes, search);

  const {
    post,
    loading: loadingPost,
    error: errorPost,
  } = usePost<Paquete>(url);

  const { deleteRecord } = useDelete({
    endpoint: url,
  });
  const { confirmDelete } = DeleteAlert();

  const { update, loading } = useUpdate<Paquete, Paquete>(url, {
    onSuccess: () =>
      showSuccess({
        message: "Paquete actualizado correctamente",
        title: "Exito",
      }),
  });

  // Handler para agregar profesor ************************************************************
  const handleSubmitAdd = async () => {
    if (nombre == "" || costo == "") {
      showError({
        title: "Datos incorrectos",
        message: "El nombre y el costo son obligatorios",
      });
    } else {
      const paquete: Paquete = {
        nombre: nombre,
        costo: Number(costo),
      };
      try {
        paquete;
        const nuevoPaquete = await post(paquete);
        if (nuevoPaquete.id != undefined && nuevoPaquete.id > 0) {
          showSuccess({
            title: "Exito",
            message: "Paquete agregado correctamente",
          });
          setPaquetes([...paquetes, nuevoPaquete]);
        } else {
          showError({
            title: "Error",
            message: "Algo salio mal",
          });
        }
      } catch (err) {
        console.error("Error al crear paquete:", err);
        alert("Error al crear el paquete");
      }
      handleCloseAdd();
      cleanData();
    }
  };
  // Handler para actualizar paquete **********************************************************
  const handleSubmitEdit = async () => {
    if (nombre == "" || costo == "") {
      showError({
        title: "Datos incorrectos",
        message: "El nombre y el costo son obligatorios",
      });
    } else {
      const paqueteUpdate: Paquete = {
        nombre: nombre,
        costo: Number(costo),
        id: id,
      };
      try {
        const paqueteEditada = await update(paqueteUpdate.id, paqueteUpdate);
        const paquete: Paquete = {
          nombre: paqueteEditada.nombre,
          costo: paqueteEditada.costo,
          id: paqueteEditada.id,
          alumnos: paqueteEditada.alumnos,
        };

        setPaquetes((prev) =>
          prev.map((a) => (a.id === paquete.id ? paquete : a)),
        );
      } catch (err) {
        showError({ message: "Error al actualizar el paquete" });
      }
      handleCloseEdit();
      cleanData();
    }
  };
  // Handlear para abrir los modales *****************************************************************
  const handleEditButton = (paqueteEditada: Paquete) => {
    handleOpenEdit();
    setNombre(paqueteEditada.nombre);
    setCosto(String(paqueteEditada.costo));
    setId(paqueteEditada.id);
  };
  const handleViewButton = async (paqueteView: Paquete) => {
    setPaqueteView(paqueteView);
    handleOpenView();
    try {
      paqueteView.alumnos?.map((alumno) => {
        const alumnoTemp: Alumno = {
          id: alumno.id,
          nombre: alumno.nombre,
          apellido: alumno.apellido,
          descuento: alumno.descuento,
          diaDePago: alumno.diaDePago,
        };
        setAlumnos((prev) => [...prev, alumnoTemp]);
      });
    } catch (error) {
      console.error(error);
    }
  };
  const hanldeDeleteButton = async (paqueteBorrada: Paquete) => {
    const confirmed = await confirmDelete({
      title: "¿Eliminar paquete?",
      text: `NOTA: Para que se pueda eliminar un paquete, ningún alumno debe estar relacionado a este`,
    });
    if (confirmed) {
      try {
        // Aquí va tu llamada a la API
        // await deleteUser(id);
        const result = await deleteRecord(paqueteBorrada.id);

        if (result.success) {
          setPaquetes(
            paquetes.filter((paquete) => paquete.id !== paqueteBorrada.id),
          );
          showSuccess({
            message: `Paquete "${paqueteBorrada.nombre}" eliminado correctamente`,
          });
        } else {
          showError({
            message:
              "No se pudo eliminar el paquete, posiblemente este ligado a alumnos, etc.",
          });
        }
      } catch (error) {
        showError({
          message:
            "No se pudo eliminar el paquete, posiblemente este ligado a alumnos, etc.",
        });
      }
    }
  };

  // HTML *******************************************************************************************
  return (
    <div className="">
      <h2>Paquetes</h2>
      <div className="text-end">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenAdd}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Agregar Paquete
        </button>
      </div>
      <br />
      {/* MODAL PARA CREATE */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAdd}
        title={"Agregar paquete"}
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
            Costo <span className="text-danger">*</span>
          </label>

          <input
            className="form-control mb-2"
            placeholder="Costo"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
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
            Costo <span className="text-danger">*</span>
          </label>

          <input
            className="form-control mb-2"
            placeholder="Costo"
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
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
        title={"Detalles del paquete"}
        size="lg"
      >
        <div className="modal-body"></div>
        <PaqueteDetalle paquete={paqueteView}></PaqueteDetalle>
        <AlumnosPaquete alumnos={alumnos}></AlumnosPaquete>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleCloseView}>
            Cerrar
          </button>
        </div>
      </Modal>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar paquete..."
      />
      <GenericTable<Paquete>
        data={dataFiltrada}
        columns={[
          { key: "id", header: "ID" },
          { key: "nombre", header: "Nombre" },
          { key: "costo", header: "Costo $" },
        ]}
        striped
        bordered
        hover
        small
        onEdit={handleEditButton}
        onDelete={hanldeDeleteButton}
        onView={handleViewButton}
        getId={(paquete) => paquete.id}
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
