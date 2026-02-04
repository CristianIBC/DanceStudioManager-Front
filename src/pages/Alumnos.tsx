import { useEffect, useState } from "react";
import { GenericTable } from "../component/GenericTable";
import useFetch from "../hooks/useFetch";
import type { Alumno } from "../Interfaces/Alumno";
import { Modal } from "../component/Modal";
import { usePost } from "../hooks/usePost";
import { DeleteAlert } from "../hooks/alerts/DeleteAlert";
import { showSuccess } from "../hooks/alerts/SuccesAlert";
import { showError } from "../hooks/alerts/ErrorAlert";
import { useDelete } from "../hooks/useDelete";
import { useUpdate } from "../hooks/useUpdate";
import type { Sucursal } from "../Interfaces/Sucursal";
import { Dropdown } from "../component/Dropdown";
import AlumnoDetalle from "../component/AlumnoDetalle";
import type { Curso } from "../Interfaces/Curso";
import type { AlumnoCursos } from "../Interfaces/AlumnoCursos";
import CursosAlumno from "../component/CursosAlumno";
import SearchBar from "../component/SearchBar";
import { URL } from "../constants/url";
import Select from "react-select";
import type { MultiValue } from "react-select";
import type { Dia } from "../Interfaces/Dia";
import type { Paquete } from "../Interfaces/Paquete";
import "../styles/Alumno.css";
import api from "../hooks/api";
import { showLoading, closeLoading } from "../hooks/alerts/LoadingAlert";
import { getSucursalId } from "../helpers/sucursalHelper";
import { showInfo } from "../hooks/alerts/InfoAlert";

export default function Alumnos() {
  const url = URL.HOST + "/alumnos";
  //Variables para mostrar los modales *******************************************************
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showInscribirModal, setShowInscribirModal] = useState<boolean>(false);
  const [showAlumnosBorrados, setShowAlumnosBorrados] =
    useState<boolean>(false);
  //Variables de la interfaz *****************************************************************
  const [nombre, setNombre] = useState<string | undefined>("");
  const [apellido, setApellido] = useState<string | undefined>("");
  const [telefono, setTelefono] = useState<string | undefined>("");
  const [correo, setCorreo] = useState<string | undefined>("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [correoError, setCorreoError] = useState("");
  const [correoValid, setCorreoValid] = useState(true);
  const [sucursalNombre, setSucursalNombre] = useState<string | undefined>("");
  const [sucursal, setSucursal] = useState<Sucursal | undefined>(undefined);
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<number>(getSucursalId()); // Esta variable maneja el select principal de las sucursales
  if (sucursalSeleccionada == 0) {
    showInfo({
      title: "IMPORTANTE",
      message:
        "No hay ninguna sucursal, un administrador debe crear al menos una",
    });
    return;
  }
  const [sucursalSeleccionadaEnBorrados, setSucursalSeleccionadaEnBorrados] =
    useState<number>(1);
  const [descuento, setDescuento] = useState<string>("0");
  const [id, setId] = useState<number | undefined>(undefined);
  const [fechaDeCreacion, setFechaDeCreacion] = useState<string | undefined>(
    undefined,
  );
  const [sucursalId, setSucursalId] = useState<number>();
  const [paqueteId, setPaqueteId] = useState<number>();
  const [paquete, setPaquete] = useState<Paquete | undefined>(undefined);
  const [mensualidad, setMensualidad] = useState<string | undefined>();
  const diasDelMes: Dia[] = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    nombre: (i + 1).toString(),
  }));
  const [diaDePago, setDiaDePago] = useState<Dia>({ id: 1, nombre: "1" });
  //Varibales para visualizar los detalles del alumno ****************************************
  const [alumnoView, setAlumnoView] = useState<Alumno>();
  const [cursos, setCursos] = useState<Curso[]>([]);
  //Variable para activar alumno
  //Variables para inscribir cursos
  type CursoOption = {
    value: number;
    label: string;
  };
  let { data: cursosList } = useFetch<Curso[]>(
    URL.HOST + `/cursos/by-sucursal/${sucursalSeleccionada}`,
  );
  const [cursosOptions, setCursosOptions] = useState<CursoOption[]>([]);
  const [cursosSeleccionados, setCursosSeleccionados] = useState<
    MultiValue<CursoOption>
  >([]);
  const [alumnoInscribir, setAlumnoInscribir] = useState<Alumno>();
  //Hook para Obtener sucursales ******************************************************************
  const { data: dataSucursales } = useFetch<Sucursal[]>(
    URL.HOST + "/sucursales",
  );
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  useEffect(() => {
    if (dataSucursales) setSucursales(dataSucursales);
  }, [dataSucursales]);

  //Handlers para los modales ***************************************************************
  const handleOpenAdd = () => {
    setShowAddModal(true);
    const sucursalTemp = sucursales.find((s) => s.id === sucursalSeleccionada);
    setSucursal(sucursalTemp);
    setSucursalId(sucursalSeleccionada);
  };
  const handleCloseAdd = () => {
    setShowAddModal(false);
    cleanData();
  };
  const handleOpenView = () => setShowViewModal(true);
  const handleCloseView = () => {
    setCursos([]);
    setAlumnoView({});
    setShowViewModal(false);
  };
  const handleOpenEdit = () => setShowEditModal(true);
  const handleCloseEdit = () => {
    setShowEditModal(false);
    cleanData();
  };
  const handleOpenInscribir = async () => {
    setShowInscribirModal(true);
  };
  const handleCloseInscribir = () => {
    setShowInscribirModal(false);
    setAlumnoInscribir(undefined);
    setCursos([]);
    setCursosSeleccionados([]);
  };
  //Variable para la searchBar *****************************************************************
  const [search, setSearch] = useState("");
  // Hook para obtener todos los alumnos (GET) ***************************************************
  const {
    data,
    loading: loadingGet,
    error: errorGet,
  } = useFetch<Alumno[]>(url + `/by-sucursal/${sucursalSeleccionada}`);

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  useEffect(() => {
    if (data) {
      setAlumnos(data);
    }
  }, [data]);
  useEffect(() => {
    setAlumnos([]); // limpia la tabla
  }, [sucursalSeleccionada]);
  useEffect(() => {
    setAlumnosBorrados([]); // limpia la tabla
  }, [sucursalSeleccionadaEnBorrados]);
  //Variable para actualizar la data con base en la busqueda ***************************************
  const dataFiltrada = filtrarDatos(alumnos, search);

  // Hook para obtener todos los alumnos BORRADOS (GET) ***************************************************
  const { data: dataBorrados } = useFetch<Alumno[]>(
    url + `/inactivos/by-sucursal/${sucursalSeleccionadaEnBorrados}`,
  );

  const [alumnosBorrados, setAlumnosBorrados] = useState<Alumno[]>([]);
  useEffect(() => {
    if (dataBorrados) {
      setAlumnosBorrados(dataBorrados);
    }
  }, [dataBorrados]);
  //Variable para actualizar la data con base en la busqueda ***************************************
  const dataFiltradaBorrados = filtrarDatos(alumnosBorrados, search);

  //Hook para Obtener paquetes ******************************************************************
  const { data: dataPaquetes } = useFetch<Paquete[]>(URL.HOST + "/paquetes");
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  useEffect(() => {
    if (dataPaquetes) setPaquetes(dataPaquetes);
  }, [dataPaquetes]);

  // Hook para crear alumno (POST) ****************************************************************
  const { post, loading: loadingPost, error: errorPost } = usePost<Alumno>(url);

  // Hook para inscribir cursos (POST) ****************************************************************
  const { post: postInscribir } = usePost<string>(url + "/inscribir-cursos");
  // Hook para elimminar alumno DELETE ************************************************************
  const { deleteRecord } = useDelete({
    endpoint: url,
  });
  const { deleteRecord: deleteAumnoCurso } = useDelete({
    endpoint: url + "/eliminar-curso",
  });
  const { confirmDelete } = DeleteAlert();

  // Hook para actualizar alumno PUT **************************************************************

  const { update, loading } = useUpdate<Alumno, Alumno>(url, {
    onSuccess: () =>
      showSuccess({
        message: "Alumno Actualizado correctamente",
        title: "Exito",
      }),
  });

  //Limpiar data, todos los atributos de la interfaz **************************************************
  const cleanData = () => {
    setNombre("");
    setApellido("");
    setTelefono(undefined);
    setSucursalNombre("");
    setDescuento("0");
    setId(undefined);
    setFechaDeCreacion(undefined);
    setSucursalId(undefined);
    setSucursal({});
    setDiaDePago({ id: 1, nombre: "1" });
    setPaqueteId(undefined);
    setPaquete({});
    setMensualidad("");
    setCorreo("");
    setCorreoError("");
    setCorreoValid(true);
  };
  const handleCorreoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCorreo(value);
    if (value === "") {
      setCorreoError("");
      setCorreoValid(true);
    } else if (!emailRegex.test(value)) {
      setCorreoError("Formato de correo inválido");
      setCorreoValid(false);
    } else {
      setCorreoValid(true);
      setCorreoError("");
    }
  };
  const setPaqueteHandler = async (paqueteIdSelect: number | undefined) => {
    showLoading("Recuperando información del paquete...");
    setPaqueteId(paqueteIdSelect);
    const resp = await api.get(URL.HOST + `/paquetes/${paqueteIdSelect}`);

    if (resp.status != 200) {
      closeLoading();
      showError({
        message: "Error al obtener precio del paquete",
      });
    } else {
      if (
        resp.data.nombre.includes("Pareja") ||
        resp.data.nombre.includes("pareja")
      ) {
        setMensualidad(String(Number(resp.data.costo) / 2));
      } else {
        setMensualidad(resp.data.costo);
      }
    }
    closeLoading();
  };
  // Handler para agregar alumno ************************************************************
  const handleSubmitAdd = async () => {
    if (
      nombre == "" ||
      apellido == "" ||
      sucursalId == undefined ||
      descuento == "" ||
      diaDePago == undefined ||
      paqueteId == undefined ||
      mensualidad == ""
    ) {
      showError({
        title: "Datos incorrectos",
        message:
          "El nombre, el apellido, el descuento, el paquete, la mensualidad, el dia de pago y la sucursal son obligatorios",
      });
    } else {
      if (Number(descuento) >= 0) {
        if (correoValid) {
          let confirmed: Boolean = true;
          if (sucursalId != sucursalSeleccionada) {
            confirmed = await confirmDelete({
              title: "¿Seguro?",
              text: `Estas agregando un alumno a otra sucursal diferente a la seccionada`,
              confirmButtonText: "Si, estoy seguro",
              confirmButtonColor: "#198754",
            });
          }
          if (confirmed) {
            const alumno: Alumno = {
              nombre: nombre,
              apellido: apellido,
              telefono: Number(telefono),
              sucursalId: sucursalId,
              descuento: Number(descuento),
              diaDePago: diaDePago.id,
              mensualidad: Number(mensualidad),
              paqueteId: paqueteId,
              correo: correo,
            };
            try {
              const nuevoAlumno = await post(alumno);
              if (nuevoAlumno.id != undefined && nuevoAlumno.id > 0) {
                showSuccess({
                  title: "Exito",
                  message:
                    "Alumno agregado a la sucursal " +
                    nuevoAlumno.sucursalNombre,
                });
                if (nuevoAlumno.sucursalId == sucursalSeleccionada)
                  setAlumnos([...alumnos, nuevoAlumno]);
              } else {
                showError({
                  title: "Error",
                  message: "Algo salio mal",
                });
              }
            } catch (err) {
              console.error("Error al crear alumno:", err);
              alert("Error al crear el alumno");
            }
            handleCloseAdd();
            cleanData();
          }
        } else {
          showError({
            title: "Datos incorrectos",
            message: "El correo no es valido",
          });
        }
      } else {
        showError({
          title: "Datos incorrectos",
          message: "El descuento no es valido",
        });
      }
    }
  };

  // Handler para actualizar alumno **********************************************************
  const handleSubmitEdit = async () => {
    if (
      nombre == "" ||
      apellido == "" ||
      sucursalId == undefined ||
      descuento == "" ||
      diaDePago.id == undefined ||
      paqueteId == undefined ||
      mensualidad == ""
    ) {
      showError({
        title: "Datos incorrectos",
        message:
          "El nombre, el apellido, el descuento, la mensualidad, el paquete, el dia de pago y la sucursal son obligatorios",
      });
    } else {
      if (Number(descuento) >= 0) {
        if (correoValid) {
          let confirmed: Boolean = true;
          if (sucursalId != sucursalSeleccionada) {
            confirmed = await confirmDelete({
              title: "¿Seguro?",
              text: `Estas cambiando un alumno a otra sucursal diferente a la seccionada`,
              confirmButtonText: "Si, estoy seguro",
              confirmButtonColor: "#198754",
            });
          }
          if (confirmed) {
            const alumnoUpdate: Alumno = {
              nombre: nombre,
              apellido: apellido,
              telefono: Number(telefono),
              sucursalId: sucursalId,
              descuento: Number(descuento),
              diaDePago: diaDePago.id,
              mensualidad: Number(mensualidad),
              paqueteId: paqueteId,
              correo: correo,
              id: id,
            };
            try {
              const alumnoEditado = await update(alumnoUpdate.id, alumnoUpdate);
              const alumno: Alumno = {
                nombre: alumnoEditado.nombre,
                apellido: alumnoEditado.apellido,
                telefono: alumnoEditado.telefono,
                sucursalId: alumnoEditado.sucursalId,
                descuento: alumnoEditado.descuento,
                id: alumnoEditado.id,
                sucursalNombre: alumnoEditado.sucursalNombre,
                fechaDeCreacion: alumnoEditado.fechaDeCreacion,
                diaDePago: alumnoEditado.diaDePago,
                mensualidad: alumnoEditado.mensualidad,
                paqueteId: alumnoEditado.paqueteId,
                paqueteNombre: alumnoEditado.paqueteNombre,
                estatus: alumnoEditado.estatus,
                correo: alumnoEditado.correo,
              };
              if (alumno.sucursalId == sucursalSeleccionada) {
                setAlumnos((prev) =>
                  prev.map((a) => (a.id === alumno.id ? alumno : a)),
                );
              } else {
                setAlumnos((prev) => prev.filter((a) => a.id !== alumno.id));
              }

              showSuccess({
                title: "Exito",
                message: "Alumno actualizado con exito",
              });
            } catch (err) {
              showError({ message: "Error al actualizar el alumno" });
            }
            handleCloseEdit();
            cleanData();
          }
        } else {
          showError({
            title: "Datos incorrectos",
            message: "El correo no es valido",
          });
        }
      } else {
        showError({
          title: "Datos incorrectos",
          message: "El descuento no es valido",
        });
      }
    }
  };

  const handleSubmitInscribir = async () => {
    //MANDAR A LLAMAR FUNCION PARA GUARDAR CURSOS DEL ALUMNOS
    if (cursosSeleccionados.length == 0) {
      showError({ title: "Error", message: "Selecciona al menos un curso" });
      return;
    }
    const cursosIds = cursosSeleccionados.map((a) => a.value);

    try {
      showLoading("Inscribiendo...");
      const id: number | undefined = alumnoInscribir?.id;

      const response = await postInscribir(cursosIds.join(","), id);
      if (response.cursos.length > 0) {
        closeLoading();
        showSuccess({
          title: "Exito",
          message: "Cursos agregados correctamente",
        });

        handleCloseInscribir();
      }
    } catch (error) {
      closeLoading();
      showError({
        title: "Error",
        message: "Algo salio mal: " + error,
      });
    }
  };

  //Handler para eliminar alumno-curso

  const handlerEliminarAlumnoCurso = async (curso: Curso) => {
    const confirmed = await confirmDelete({
      title: "¿Eliminar curso del alumno?",
      text: `¿Estás seguro de eliminar a ${curso.nombre}?`,
    });
    if (confirmed) {
      try {
        // Aquí va tu llamada a la API
        // await deleteUser(id);
        showLoading("Eliminando curso");
        const result = await deleteAumnoCurso(alumnoView?.id, curso.id);

        if (result.success) {
          setCursos(cursos.filter((c) => c.id !== curso.id));
          closeLoading();
          showSuccess({
            message: `Curso eliminado correctamente`,
          });
        } else {
          closeLoading();
          showError({
            message: "No se pudo eliminar el curso",
          });
        }
      } catch (error) {
        closeLoading();
        showError({
          message: "No se pudo eliminar el curso",
        });
      }
    }
  };
  // Handlear para abrir los modales *****************************************************************
  const handleEditButton = (alumnoEditado: Alumno) => {
    handleOpenEdit();
    setNombre(alumnoEditado.nombre);
    setApellido(alumnoEditado.apellido);
    setTelefono(String(alumnoEditado.telefono ?? ""));
    setSucursalNombre(alumnoEditado.sucursalNombre);
    setDescuento(String(alumnoEditado.descuento));
    setId(alumnoEditado.id);
    setFechaDeCreacion(alumnoEditado.fechaDeCreacion);
    setSucursalId(alumnoEditado.sucursalId);
    setMensualidad(String(alumnoEditado.mensualidad));
    setCorreo(alumnoEditado.correo ?? "");
    const sucursalActual: Sucursal = {
      id: alumnoEditado.sucursalId,
      nombre: alumnoEditado.sucursalNombre,
    };
    setSucursal(sucursalActual);
    let dia: Dia = {
      id: alumnoEditado.diaDePago ? alumnoEditado.diaDePago : 1,
      nombre: alumnoEditado.diaDePago ? String(alumnoEditado.diaDePago) : "1",
    };
    setDiaDePago(dia);
    setMensualidad(String(alumnoEditado.mensualidad));
    const paqueteActual: Paquete = {
      id: alumnoEditado.paqueteId,
      nombre: alumnoEditado.paqueteNombre,
    };
    setPaquete(paqueteActual);
    setPaqueteId(alumnoEditado.paqueteId);
  };
  const handleViewButton = async (alumnoView: Alumno) => {
    setAlumnoView(alumnoView);
    handleOpenView();
    try {
      showLoading("Recuperando información del alumno...");
      const response = await api.get(url + "/get-cursos/" + alumnoView.id);
      const data: AlumnoCursos = response.data;
      data.cursos?.map((curso) => {
        const cursoTemp: Curso = {
          id: curso.id,
          nombre: curso.nombre,
          horario: curso.horario,
          fechaDeInscripcion: curso?.fechaDeInscripcion,
        };
        setCursos((prev) => [...prev, cursoTemp]);
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
  const hanldeDeleteButton = async (alumnoBorrado: Alumno) => {
    const confirmed = await confirmDelete({
      title: "¿Eliminar alumno?",
      text: `¿Estás seguro de eliminar a ${alumnoBorrado.nombre}?`,
    });
    if (confirmed) {
      try {
        // Aquí va tu llamada a la API
        // await deleteUser(id);
        const result = await deleteRecord(alumnoBorrado.id);

        if (result.success) {
          alumnoBorrado.estatus = false;

          setAlumnosBorrados([...alumnosBorrados, alumnoBorrado]);
          setAlumnos((prev) => prev.filter((a) => a.id !== alumnoBorrado.id));
          showSuccess({
            message: `Alumno ${alumnoBorrado.nombre} eliminado correctamente`,
          });
        } else {
          showError({
            message:
              "No se pudo eliminar el alumno, posiblemente este ligado a pagos, cursos,etc.",
          });
        }
      } catch (error) {
        showError({
          message:
            "No se pudo eliminar el alumno, posiblemente este ligado a pagos, cursos,etc.",
        });
      }
    }
  };
  const handleInscribirButton = async (alumno: Alumno) => {
    showLoading("Recuperando información...");
    const response = await api.get(url + "/get-cursos/" + alumno.id);
    const data2: AlumnoCursos = response.data;

    const cursosAlumno: Curso[] =
      data2.cursos?.map((curso) => ({
        id: curso.id,
        nombre: curso.nombre,
        horario: curso.horario,
        fechaDeInscripcion: curso.fechaDeInscripcion,
      })) ?? [];

    setCursos(cursosAlumno);
    const cursosListCopy = cursosList
      ? cursosList.filter(
          (itemA) => !cursosAlumno.some((c) => c.id === itemA.id),
        )
      : null;
    setCursosOptions(
      (cursosListCopy ?? [])
        .filter(
          (
            c,
          ): c is {
            id: number;
            nombre: string;
            horario: string;
            pm: boolean;
          } => c.id !== undefined && c.nombre !== undefined,
        )
        .map((curso) => ({
          value: curso.id,
          label:
            "- " +
            curso.nombre +
            "  (" +
            curso.horario +
            (curso.pm == true ? "PM" : "AM") +
            ")",
        })),
    );
    setAlumnoInscribir(alumno);
    closeLoading();
    handleOpenInscribir();
  };

  const handleActivateButton = async (alumnoActivate: Alumno) => {
    const confirmed = await confirmDelete({
      title: "¿Activar alumno?",
      text: `¿Estás seguro desea activar a ${alumnoActivate.nombre}?`,
      confirmButtonText: "Si, activar",
      confirmButtonColor: "#198754",
    });
    if (confirmed) {
      try {
        showLoading("Activando...");
        const result = await api.put(
          url + `/activate-alumno/${alumnoActivate.id}`,
        );

        if (result.status == 200 && result.data) {
          alumnoActivate.estatus = true;
          setAlumnos([...alumnos, alumnoActivate]);
          setAlumnosBorrados((prev) =>
            prev.filter((a) => a.id !== alumnoActivate.id),
          );
          closeLoading();
          showSuccess({
            message: `Alumno ${alumnoActivate.nombre} activado correctamente`,
          });
        } else {
          closeLoading();
          showError({
            message: "No se pudo activar el alumno",
          });
        }
      } catch (error) {
        closeLoading();
        showError({
          message: "No se pudo activar el alumno",
        });
      }
    }
  };

  // HTML *******************************************************************************************
  return (
    <div className="">
      <h2>Alumnos</h2>
      <div className="text-end">
        {!showAlumnosBorrados ? (
          <div className="row">
            <div className="col-md-8 text-end">
              <p>
                <strong>Alumnos activos: </strong> {alumnos.length}
              </p>
            </div>
            <div className="col">
              <button
                type="button"
                className="btn btn-primary me-2"
                onClick={handleOpenAdd}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Agregar Alumno
              </button>
            </div>
            <div className="col">
              <button
                type="button"
                className="btn btn-secondary m3-2"
                onClick={() => setShowAlumnosBorrados(true)}
              >
                <i className="bi bi-trash me-2"></i>
                Alumnos borrados
              </button>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-10 text-end">
              <p>
                <strong>Alumnos borrados: </strong> {alumnosBorrados.length}
              </p>
            </div>
            <div className="col">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAlumnosBorrados(false)}
              >
                Mostrar activos
              </button>
            </div>
          </div>
        )}
      </div>
      <br />
      {/* MODAL PARA CREATE */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAdd}
        title={"Agregar alumno"}
      >
        <div className="modal-body">
          <div className="row">
            <div className="col">
              <label className="form-label fw-bold">
                Nombre <span className="text-danger">*</span>
              </label>

              <input
                className="form-control mb-2"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="col">
              <label className="form-label fw-bold">
                Apellido <span className="text-danger">*</span>
              </label>

              <input
                className="form-control mb-2"
                placeholder="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <label className="form-label fw-bold">Teléfono</label>
              <input
                className="form-control mb-2"
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
            <div className="col">
              <label className="form-label fw-bold">
                Descuento <span className="text-danger">*</span>
              </label>
              <input
                className="form-control mb-2"
                placeholder="Descuento"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <label className="form-label fw-bold">Correo</label>

              <input
                className="form-control mb-2"
                placeholder="correo@ejemplo.com"
                value={correo}
                type="email"
                onChange={handleCorreoChange}
              />
              {correoError && (
                <div className="invalid-feedback d-block">{correoError}</div>
              )}
            </div>
          </div>
          <label className="form-label fw-bold">
            Selecciona la sucursal <span className="text-danger">*</span>
          </label>
          <Dropdown
            items={sucursales}
            getKey={(s) => s.id}
            getLabel={(s) => s.nombre}
            placeholder="Sucursales"
            onSelect={(sucursal) => setSucursalId(sucursal.id)}
            value={sucursal}
          />
          <br />
          <label className="form-label fw-bold">
            Selecciona el día límite de pago{" "}
            <span className="text-danger">*</span>
          </label>
          <Dropdown
            items={diasDelMes}
            getKey={(s) => s.id}
            getLabel={(s) => s.nombre}
            placeholder="Selecciona el dia de pago"
            onSelect={(dia) => setDiaDePago(dia)}
            value={diaDePago}
          />
          <br />
          <div className="row">
            <div className="col-md-8">
              <label className="form-label fw-bold">
                Selecciona el paquete <span className="text-danger">*</span>
              </label>

              <Dropdown
                items={paquetes}
                getKey={(s) => s.id}
                getLabel={(s) => s.nombre}
                placeholder="Selecciona el paquete"
                onSelect={(paquete) => setPaqueteHandler(paquete.id)}
              />
            </div>
            <div className="col">
              <label className="form-label fw-bold">Mensualidad</label>
              <input
                className="form-control mb-2 text-muted"
                placeholder="Mensualidad"
                value={mensualidad}
                onChange={(e) => setMensualidad(e.target.value)}
              />
            </div>
          </div>
          <p className="fst-italic text-muted small">
            * Si elegiste un paquete en pareja, la mensualidad es igual al costo
            total del paquete entre 2. (No olvides registrar a la pareja
            tambien).
          </p>
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
        title={"Editar alumno"}
      >
        <div className="modal-body">
          <div className="row">
            <div className="col">
              <label className="form-label fw-bold">
                Nombre <span className="text-danger">*</span>
              </label>
              <input
                className="form-control mb-2"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="col">
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
          </div>
          <div className="row">
            <div className="col">
              <label className="form-label fw-bold">Teléfono</label>
              <input
                className="form-control mb-2"
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>
            <div className="col">
              <label className="form-label fw-bold">
                Descuento <span className="text-danger">*</span>
              </label>
              <input
                className="form-control mb-2"
                placeholder="Descuento"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <label className="form-label fw-bold">Correo</label>
              <input
                className="form-control mb-2"
                placeholder="ejemplo@correo.com"
                value={correo}
                type="email"
                onChange={handleCorreoChange}
              />
              {correoError && (
                <div className="invalid-feedback d-block">{correoError}</div>
              )}
            </div>
          </div>
          <label className="form-label fw-bold">
            Selecciona la sucursal <span className="text-danger">*</span>
          </label>
          <Dropdown
            items={sucursales}
            getKey={(s) => s.id}
            getLabel={(s) => s.nombre}
            placeholder="Sucursales"
            onSelect={(sucursal) => setSucursalId(sucursal.id)}
            value={sucursal}
          />
          <br />
          <label className="form-label fw-bold">
            Selecciona el día límite de pago{" "}
            <span className="text-danger">*</span>
          </label>
          <Dropdown
            items={diasDelMes}
            getKey={(s) => s.id}
            getLabel={(s) => s.nombre}
            placeholder="Selecciona el dia de pago"
            onSelect={(dia) => setDiaDePago(dia)}
            value={diaDePago}
          />
          <br />
          <div className="row">
            <div className="col-md-8">
              <label className="form-label fw-bold">
                Selecciona el paquete <span className="text-danger">*</span>
              </label>
              <Dropdown
                items={paquetes}
                getKey={(s) => s.id}
                getLabel={(s) => s.nombre}
                placeholder="Selecciona el paquete"
                onSelect={(paquete) => setPaqueteHandler(paquete.id)}
                value={paquete}
              />
            </div>
            <div className="col">
              <label className="form-label fw-bold">Mensualidad</label>
              <input
                className="form-control mb-2 text-muted"
                placeholder="Mensualidad"
                value={mensualidad}
                onChange={(e) => setMensualidad(e.target.value)}
              />
            </div>
          </div>
          <p className="fst-italic text-muted small">
            * Si elegiste un paquete en pareja, la mensualidad es igual al costo
            total del paquete entre 2. (No olvides registrar a la pareja
            tambien).
          </p>
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
        <AlumnoDetalle alumno={alumnoView}></AlumnoDetalle>
        <CursosAlumno
          cursos={cursos}
          handlerOnDelete={handlerEliminarAlumnoCurso}
        ></CursosAlumno>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleCloseView}>
            Cerrar
          </button>
        </div>
      </Modal>
      {/* MODAL PARA INSCRIBIR CURSOS */}
      <Modal
        isOpen={showInscribirModal}
        onClose={handleCloseInscribir}
        title={"Inscribir cursos"}
        size="lg"
      >
        <div className="modal-body">
          <p>
            <strong>Alumno seleccionado: </strong>{" "}
            {alumnoInscribir?.nombre + " " + alumnoInscribir?.apellido}
          </p>
          <p>
            <strong>Sucursal del alumno: </strong>{" "}
            {alumnoInscribir?.sucursalNombre}
          </p>
          <br />
          <Select
            options={cursosOptions}
            value={cursosSeleccionados}
            onChange={(opciones) => setCursosSeleccionados(opciones)}
            placeholder="Buscar cursos..."
            isMulti
          />

          <p className="fst-italic text-muted small">
            * Se muestran los cursos a los que no está inscrito y que
            pertenezcan a la sucursal del alumno
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCloseInscribir}>
            Cerrar
          </button>
          <button className="btn btn-primary" onClick={handleSubmitInscribir}>
            Guardar
          </button>
        </div>
      </Modal>

      {/* CONTENIDO */}
      {!showAlumnosBorrados ? (
        <>
          <div className="row">
            <div className="col">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Buscar alumno..."
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

          <GenericTable<Alumno>
            data={dataFiltrada}
            columns={[
              { key: "id", header: "ID" },
              { key: "nombre", header: "Nombre" },
              { key: "apellido", header: "Apellido" },
              { key: "diaDePago", header: "Día de pago" },
              { key: "mensualidad", header: "Mensualidad" },
              { key: "descuento", header: "Descuento $" },
              { key: "paqueteNombre", header: "Paquete" },
              { key: "sucursalNombre", header: "Sucursal" },
              {
                key: "estatus",
                header: "Estatus",
                render: (alumno) => (alumno.estatus ? "Activo" : "Inactivo"),
              },
            ]}
            striped
            bordered
            hover
            small
            onEdit={handleEditButton}
            onDelete={hanldeDeleteButton}
            onView={handleViewButton}
            onInscribir={handleInscribirButton}
            showInscribir={true}
            getId={(alumno) => alumno.id}
          />
        </>
      ) : (
        <>
          <div className="row">
            <div className="col ">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Buscar alumno borrado..."
              />
            </div>
            <div className="col-md-2 text-end">
              <label className="form-label fw-bold">Filtrar por sucursal</label>
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={sucursalSeleccionadaEnBorrados}
                onChange={(e) => {
                  setSucursalSeleccionadaEnBorrados(Number(e.target.value));
                }}
              >
                {sucursales.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <GenericTable<Alumno>
            data={dataFiltradaBorrados}
            columns={[
              { key: "id", header: "ID" },
              { key: "nombre", header: "Nombre" },
              { key: "apellido", header: "Apellido" },
              { key: "diaDePago", header: "Día de pago" },
              { key: "mensualidad", header: "Mensualidad" },
              { key: "descuento", header: "Descuento $" },
              { key: "paqueteNombre", header: "Paquete" },
              { key: "sucursalNombre", header: "Sucursal" },
              {
                key: "estatus",
                header: "Estatus",
                render: (alumno) => (alumno.estatus ? "Activo" : "Inactivo"),
              },
            ]}
            striped
            bordered
            hover
            small
            onActivate={handleActivateButton}
            onView={handleViewButton}
            getId={(alumno) => alumno.id}
          />
        </>
      )}
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
