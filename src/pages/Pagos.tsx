import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import { usePost } from "../hooks/usePost";
import { Modal } from "../component/Modal";
import Select from "react-select";

import { DeleteAlert } from "../hooks/alerts/DeleteAlert";
import { showSuccess } from "../hooks/alerts/SuccesAlert";
import { showError } from "../hooks/alerts/ErrorAlert";
import { useDelete } from "../hooks/useDelete";
import { GenericTable } from "../component/GenericTable";
import SearchBar from "../component/SearchBar";
import type { Alumno } from "../Interfaces/Alumno";
import { Dropdown } from "../component/Dropdown";
import type { Sucursal } from "../Interfaces/Sucursal";
import type { Pago } from "../Interfaces/Pago";
import { URL } from "../constants/url";
import type { Mes } from "../Interfaces/Mes";
import { getSucursalId } from "../helpers/sucursalHelper";
import { showInfo } from "../hooks/alerts/InfoAlert";
import { title } from "framer-motion/client";
export default function Pagos() {
  const url = URL.HOST + "/pagos";
  //Variables para mostrar los modales *******************************************************
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  //Variables de la interfaz *****************************************************************
  const [id, setId] = useState<number | undefined>(undefined);
  const [fechaDePago, setFechaDePago] = useState<string>("");
  const [alumno1, setAlumno1] = useState<Alumno>();
  const [alumno2, setAlumno2] = useState<Alumno>();
  const [cantidad, setCantidad] = useState<string>("");
  const [mes, setMes] = useState<Mes>();
  const [paqueteNombre, setPaqueteNombre] = useState<string | undefined>("N/A");
  const [mensualidad, setMensualidad] = useState<string>("N/A");
  const [pagaEnPaquete, setPagaEnPaquete] = useState<boolean>(false);
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<number>(getSucursalId());
  const [mesSeleccionado, setMesSeleccionado] = useState(0);
  if (sucursalSeleccionada == 0) {
    showInfo({
      title: "IMPORTANTE",
      message:
        "No hay ninguna sucursal, un administrador debe crear al menos una",
    });
    return;
  }
  const meses: Mes[] = [
    { id: 1, nombre: "Enero" },
    { id: 2, nombre: "Febrero" },
    { id: 3, nombre: "Marzo" },
    { id: 4, nombre: "Abril" },
    { id: 5, nombre: "Mayo" },
    { id: 6, nombre: "Junio" },
    { id: 7, nombre: "Julio" },
    { id: 8, nombre: "Agosto" },
    { id: 9, nombre: "Septiembre" },
    { id: 10, nombre: "Octubre" },
    { id: 11, nombre: "Noviembre" },
    { id: 12, nombre: "Diciembre" },
  ];
  const mesesDicc: Record<number, string> = {
    1: "Enero",
    2: "Febrero",
    3: "Marzo",
    4: "Abril",
    5: "Mayo",
    6: "Junio",
    7: "Julio",
    8: "Agosto",
    9: "Septiembre",
    10: "Octubre",
    11: "Noviembre",
    12: "Diciembre",
  };
  //Handlers para los modales ***************************************************************
  const handleOpenAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => {
    setShowAddModal(false);
    cleanData();
  };

  //Variable para la searchBar *****************************************************************
  const [search, setSearch] = useState<string | undefined>("");

  //Limpiar data, todos los atributos de la interfaz **************************************************
  const cleanData = () => {
    setAlumno1(undefined);
    setAlumno2(undefined);
    setAlumnoSeleccionado1(undefined);
    setAlumnoSeleccionado2(undefined);
    setCantidad("");
    setMes(undefined);
    setFechaDePago("");
    setPagaEnPaquete(false);
    setId(undefined);
    setPaqueteNombre("");
    setMensualidad("");
  };
  // Hook para obtener todos los pagos (GET) ***************************************************
  const {
    data,
    loading: loadingGet,
    error: errorGet,
  } = useFetch<Pago[]>(url + `/by-sucursal/${sucursalSeleccionada}`);
  const [pagos, setPagos] = useState<Pago[]>([]);
  useEffect(() => {
    if (data) {
      setPagos(data);
    }
  }, [data]);
  useEffect(() => {
    setPagos([]); // limpia la tabla
  }, [sucursalSeleccionada]);
  //HOOK Para traer a todos los alumnos y buscar entre ellos
  const { data: alumnos } = useFetch<Alumno[]>(
    URL.HOST + `/alumnos/by-sucursal/${sucursalSeleccionada}`,
  );
  const alumnoOptions = alumnos?.map((a) => ({
    value: a.id,
    correo: a.correo,
    label: `${a.nombre} ${a.apellido}`,
  }));
  const [alumnoSeleccionado1, setAlumnoSeleccionado1] = useState<any>(null);
  const [alumnoSeleccionado2, setAlumnoSeleccionado2] = useState<any>(null);
  //Variable para actualizar la data con base en la busqueda ***************************************
  const dataFiltrada = filtrarDatos(pagos, search);
  // Hook para crear pago (POST) ****************************************************************
  const { post, loading: loadingPost, error: errorPost } = usePost<Pago>(url);
  // Hook para elimminar pago DELETE ************************************************************
  const { deleteRecord } = useDelete({
    endpoint: url,
  });
  const { confirmDelete } = DeleteAlert();
  //Hook para Obtener sucursales ******************************************************************
  const { data: dataSucursales } = useFetch<Sucursal[]>(
    URL.HOST + "/sucursales",
  );
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  useEffect(() => {
    if (dataSucursales) setSucursales(dataSucursales);
  }, [dataSucursales]);
  // Handler para agregar profesor ************************************************************
  const handleSubmitAdd = async () => {
    if (
      cantidad == "" ||
      mes == undefined ||
      alumno1 == undefined ||
      fechaDePago == ""
    ) {
      showError({
        title: "Datos incorrectos",
        message:
          "La cantidad, el mes, el alumno y la fecha de pago son obligatorios",
      });
    } else {
      let confirmed: Boolean = true;
      if (Number(cantidad) < Number(mensualidad)) {
        confirmed = await confirmDelete({
          title: "¿Seguro?",
          text: `La cantidad del pago es menor a la mensualidad esperada`,
          confirmButtonText: "Si, estoy seguro",
          confirmButtonColor: "#198754",
        });
      }
      if (confirmed) {
        let withEmail = true;
        let continuar = true;
        if (alumno1.correo == undefined) {
          withEmail = false;
        }
        if (!withEmail) {
          continuar = await confirmDelete({
            title: "¿Seguro?",
            text: `Este alumno no tiene correo y no le llegará el comprobante digital`,
            confirmButtonText: "Si, estoy seguro",
            confirmButtonColor: "#198754",
          });
        }
        //ENVIAR PAGO
        if (continuar) {
          const pago: Pago = {
            cantidad: Number(cantidad),
            mes: Number(mes.id),
            alumno: alumno1,
            fechaDePago: fechaDePago,
            alumno2: alumno2 == undefined ? undefined : alumno2,
            pagaEnPaquete: pagaEnPaquete,
          };
          try {
            const nuevoPago = await post(pago);

            if (nuevoPago.id != undefined && nuevoPago.id > 0) {
              showSuccess({
                title: "Exito",
                message: "Pago agregado correctamente",
              });
              setPagos([nuevoPago, ...pagos]);
            } else {
              showError({
                title: "Error",
                message: "Algo salio mal",
              });
            }
          } catch (err) {
            console.error("Error al crear el pago:", err);
            alert("Error al crear el pago");
          }
          handleCloseAdd();
          cleanData();
        }
      }
    }
  };
  const hanldeDeleteButton = async (pagoBorrado: Pago) => {
    const confirmed = await confirmDelete({
      title: "¿Eliminar pago?",
      text: `¿Estás seguro de eliminar el pago del mes "${pagoBorrado.mes}"?`,
    });
    if (confirmed) {
      try {
        // Aquí va tu llamada a la API
        // await deleteUser(id);
        const result = await deleteRecord(pagoBorrado.id);

        if (result.success) {
          setPagos(pagos.filter((pago) => pago.id !== pagoBorrado.id));
          showSuccess({
            message: `Pago del mes "${pagoBorrado.mes}" eliminado correctamente`,
          });
        } else {
          showError({
            message:
              "No se pudo eliminar el pago, posiblemente este ligado a alunmos, etc.",
          });
        }
      } catch (error) {
        showError({
          message:
            "No se pudo eliminar el pago, posiblemente este ligado a alunmos, etc.",
        });
      }
    }
  };
  const verifyPaquete = (alumnoid: number) => {
    if (!alumnoid) {
      setPagaEnPaquete(false);
      setMensualidad("N/A");
      setPaqueteNombre("N/A");
    } else {
      const alumno: Alumno | undefined = alumnos?.find(
        (value) => value.id === alumnoid,
      );

      if (!alumno) {
        console.error("Alumno no encontrado");
      }
      if (
        alumno?.paqueteNombre?.includes("pareja") ||
        alumno?.paqueteNombre?.includes("Pareja")
      ) {
        setPagaEnPaquete(true);
        setMensualidad(
          String((alumno.mensualidad ?? 0) - (alumno.descuento ?? 0)),
        );
        setPaqueteNombre(alumno.paqueteNombre);
      } else {
        setMensualidad(
          alumno
            ? String((alumno.mensualidad ?? 0) - (alumno.descuento ?? 0))
            : "No se pudo recuperar el dato",
        );
        setPaqueteNombre(
          alumno ? alumno.paqueteNombre : "No se pudo recuperar el dato",
        );
        setPagaEnPaquete(false);
      }
    }
  };

  const handleChangeFecha = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFechaDePago(value);
  };
  // HTML *******************************************************************************************
  return (
    <div className="">
      <h2>Pagos</h2>
      <div className="text-end">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenAdd}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Agregar pago
        </button>
      </div>
      <br />
      {/* MODAL PARA CREATE */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAdd}
        title={"Agregar pago"}
      >
        <div className="modal-body">
          <div className="mb-2">
            <label className="form-label fw-bold">Alumno </label>{" "}
            <span className="text-danger">*</span>
            <Select
              options={alumnoOptions}
              value={alumnoSeleccionado1}
              onChange={(opcion) => {
                setAlumno1(
                  opcion
                    ? { id: opcion.value, correo: opcion.correo }
                    : undefined,
                );
                setAlumnoSeleccionado1(opcion);
                verifyPaquete(opcion ? opcion.value : undefined);
              }}
              placeholder="Buscar alumno ..."
              isClearable
            />
            <p className="fst-italic text-muted small">
              * Se muestran los alumnos de la sucursal seleccionada
            </p>
          </div>

          <hr />

          <label className="form-label">
            <strong>Valores de referencia</strong>
          </label>
          <br />
          <div style={{ whiteSpace: "pre-line" }}>
            Sucursal del alumno:{" "}
            <strong>
              {
                sucursales.find((s) =>
                  s.id ==
                  alumnos?.find((a) => (a.id == alumno1?.id ? a : null))
                    ?.sucursalId
                    ? s
                    : null,
                )?.nombre
              }
            </strong>{" "}
            <br />
            Paquete del alumno: <strong>{paqueteNombre}</strong> <br />
            Mensualidad esperada: <strong>{mensualidad}</strong>
            <p className="fst-italic text-muted small">
              * Incluye el descuento individual del alumno
            </p>
          </div>
          <hr />
          <div className="row">
            <div className="col">
              <label className="form-label fw-bold">Cantidad</label>{" "}
              <span className="text-danger">*</span>
              <input
                className="form-control mb-2"
                placeholder="Cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>
            <div className="col">
              <div className="mb-2">
                <label className="form-label fw-bold">Fecha de pago</label>{" "}
                <span className="text-danger">*</span>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-calendar-event"></i>
                  </span>
                  <input
                    type="date"
                    className="form-control"
                    name="fechaDePago"
                    value={fechaDePago}
                    onChange={handleChangeFecha}
                  />
                </div>
              </div>
            </div>
          </div>

          <br />
          <label className="form-label fw-bold">
            Seleciona el mes que se está pagando{" "}
            <span className="text-danger">*</span>
          </label>

          <Dropdown
            items={meses}
            getKey={(s) => s.id}
            getLabel={(s) => " - " + s.nombre}
            placeholder="Selecciona el mes del pago"
            onSelect={(mes) => setMes(mes)}
            value={mes}
          />
          <br />
          <p className="fst-italic small" style={{ color: "red" }}>
            - NOTA: Si el alumno no tiene registrado un correo, no se le enviará
            el comprobante
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

      <div className="row">
        <div className="col">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar pagos..."
          />
        </div>
        <div className="col-md-2 text-end">
          <label className="form-label fw-bold">Filtrar por mes</label>
        </div>
        <div className="col-md-2">
          <select
            className="form-select mb-3"
            value={mesSeleccionado}
            onChange={(e) => {
              setMesSeleccionado(Number(e.target.value));
              if (Number(e.target.value) == 0) {
                setSearch("");
              } else {
                setSearch(
                  meses.find((mes) => mes.id === Number(e.target.value))
                    ?.nombre,
                );
              }
            }}
          >
            <option value={0}>Selecciona</option>
            {meses.map((mes) => (
              <option key={mes.id} value={mes.id}>
                {mes.nombre}
              </option>
            ))}
          </select>
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

      <GenericTable<Pago>
        data={dataFiltrada}
        columns={[
          { key: "id", header: "ID" },
          {
            key: "alumnoNombre",
            header: "Alumno ",
            render: (pago) =>
              pago.alumnoNombre == undefined ? "NA" : pago.alumnoNombre,
          },
          { key: "cantidad", header: "Cantidad" },
          {
            key: "mes",
            header: "Mes",
            render: (pago) => meses.find((m) => m.id === pago.mes)?.nombre,
          },
          { key: "fechaDePago", header: "Fecha de pago" },
          {
            key: "pagaEnPaquete",
            header: "Paga en paquete/pareja",
            render: (pago) => (pago.pagaEnPaquete == true ? "Si" : "No"),
          },
          { key: "sucursalNombre", header: "Sucursal" },
        ]}
        striped
        bordered
        hover
        small
        onDelete={hanldeDeleteButton}
        getId={(profesor) => profesor.id}
      />
    </div>
  );

  function filtrarDatos<T extends Record<string, any>>(
    data: T[],
    search?: string,
  ): T[] {
    if (!search) return data;

    const searchLower = search.toLowerCase();

    return data.filter((item) => {
      const valores = Object.values(item).map((value) => {
        // 👇 Si es el campo mes (número), conviértelo a texto
        if (typeof value === "number" && item.hasOwnProperty("mes")) {
          return (
            mesesDicc[(item as any).mes]?.toLowerCase() ?? value.toString()
          );
        }
        if (
          typeof value === "boolean" &&
          (item as any).hasOwnProperty("pagaEnPaquete")
        ) {
          return value ? "si" : "no";
        }

        return String(value).toLowerCase();
      });

      return valores.some((v) => v.includes(searchLower));
    });
  }
}
