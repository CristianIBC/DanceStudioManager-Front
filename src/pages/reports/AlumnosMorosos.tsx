import { useEffect, useState } from "react";
import { URL } from "../../constants/url";
import type { PagoRealizado } from "../../Interfaces/PagoRealizado";
import useFetch from "../../hooks/useFetch";
import api from "../../hooks/api";
import { useRef } from "react";
import html2pdf from "html2pdf.js";
import type { Moroso } from "../../Interfaces/Moroso";
import { GenericTablePDF } from "../../component/GenericTablePDF";
import { showInfo } from "../../hooks/alerts/InfoAlert";
import type { Sucursal } from "../../Interfaces/Sucursal";
import { showError } from "../../hooks/alerts/ErrorAlert";
import { closeLoading, showLoading } from "../../hooks/alerts/LoadingAlert";
import { getSucursalId } from "../../helpers/sucursalHelper";

export default function AlumnosMorosos() {
  const url = URL.HOST + "/pagos/realizados";
  const [sucursal, setSucursal] = useState<Sucursal | undefined>({});
  const [generar, setGenerar] = useState(false);
  const [morosos, setMorosos] = useState<Moroso[]>([]);
  const anioActual = new Date().getFullYear();
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<number>(
    getSucursalId()
  );
  if (sucursalSeleccionada == 0) {
    showInfo({
      title: "IMPORTANTE",
      message:
        "No hay ninguna sucursal, un administrador debe crear al menos una",
    });
    return;
  }
  const anios = [anioActual, anioActual - 1, anioActual - 2];
  const mesActual = new Date().getMonth() + 1;
  const meses = [
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
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);
  const mesesHastaHoy = meses.filter((m) => m.id <= mesActual);

  const todayCDMX = new Date().toLocaleDateString("es-MX", {
    timeZone: "America/Mexico_City",
    day: "numeric",
  });

  const diaActual = Number(todayCDMX);
  const generarReporte = async () => {
    if (sucursalSeleccionada === 0) {
      showError({ title: "Error", message: "Elije una sucursal" });
      return;
    }

    const sucursalTemp = sucursales.find((s) => s.id === sucursalSeleccionada);

    if (!sucursalTemp) {
      showError({ title: "Error", message: "Sucursal no encontrada" });
      return;
    }
    showLoading("Generando reporte...");

    // Actualizamos estados
    setSucursal(sucursalTemp);

    const resp = await api.get(
      url + `/${mesSeleccionado}/${anioSeleccionado}/${sucursalSeleccionada}`
    );
    const data: PagoRealizado[] = resp.data;
    const pagosAgrupados: PagoRealizado[] = Object.values(
      data.reduce<Record<number, PagoRealizado>>((acc, pago) => {
        if (!pago.alumnoId) return acc; // ignoramos pagos inválidos

        const key = pago.alumnoId;

        if (!acc[key]) {
          acc[key] = {
            ...pago,
            cantidad: pago.cantidad ?? 0,
          };
        } else {
          acc[key].cantidad = (acc[key].cantidad ?? 0) + (pago.cantidad ?? 0);
        }

        return acc;
      }, {})
    );
    if (pagosAgrupados.length == 0) {
      const mes = meses.find((mes) => mes.id == mesSeleccionado);
      closeLoading();
      showInfo({
        title: "Aviso",
        message: `No hay pagos en ${mes?.nombre} ${anioSeleccionado}`,
      });
      setMorosos([]);
    } else {
      getAlumnos(pagosAgrupados);
    }
    setGenerar(true);
  };
  const getAlumnos = async (pagosActuales: PagoRealizado[]) => {
    //JALAR A TODOS LOS ALUMNOS
    const alumnosMorosos: Moroso[] = [];
    const resp = await api.get(
      URL.HOST +
        `/alumnos/sucursal/${sucursalSeleccionada}/${mesSeleccionado}/${anioSeleccionado}`
    );
    if (resp.status == 200) {
      for (let i = 0; i < resp.data.length; i++) {
        const alumno = resp.data[i];
        let yaPago = false;
        for (let j = 0; j < pagosActuales.length; j++) {
          const pago = pagosActuales[j];

          if (pago.alumnoId == alumno.id) {
            yaPago = true;
            //CRIS PAME VALE
            let mensualidadEsperada = alumno.mensualidad - alumno.descuento;

            if (
              pago.cantidad != undefined &&
              pago.cantidad < mensualidadEsperada
            ) {
              alumnosMorosos.push({
                id: alumno.id,
                nombre: alumno.nombre,
                apellido: alumno.apellido,
                cantidad: pago.cantidad,
                mensualidad: alumno.mensualidad - alumno.descuento,
                restante: alumno.mensualidad - alumno.descuento - pago.cantidad,
                estatus: "PAGO IMCOMPLETO",
                diaDePago: alumno.diaDePago,
                sucursal: alumno.sucursalNombre,
              });
            }
          }
        }
        if (!yaPago) {
          if (
            diaActual > alumno.diaDePago &&
            alumno.mensualidad - alumno.descuento > 0
          ) {
            alumnosMorosos.push({
              id: alumno.id,
              nombre: alumno.nombre,
              apellido: alumno.apellido,
              cantidad: 0,
              mensualidad: alumno.mensualidad - alumno.descuento,
              restante: alumno.mensualidad - alumno.descuento - 0,
              estatus: "NO HA PAGADO",
              diaDePago: alumno.diaDePago,
              sucursal: alumno.sucursalNombre,
            });
          }
        }
      }
      setMorosos(alumnosMorosos);
      closeLoading();
    }
  };

  const pdfRef = useRef<HTMLDivElement>(null);

  const exportarPDF = () => {
    if (!pdfRef.current) return;
    if (generar == false) {
      showError({
        title: "Erorr",
        message: "Genera el reporte primero",
      });
      return;
    }
    html2pdf()
      .from(pdfRef.current)
      .set({
        margin: 10,
        filename: "reporte-alumnos-sin-pagar.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      })
      .save();
  };
  //Hook para Obtener sucursales ******************************************************************
  const { data: dataSucursales } = useFetch<Sucursal[]>(
    URL.HOST + "/sucursales"
  );
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  useEffect(() => {
    if (dataSucursales) setSucursales(dataSucursales);
  }, [dataSucursales]);
  return (
    <div className="">
      <h3 className="mb-4 d-flex flex-wrap align-items-center gap-2">
        <span>Reporte de alumnos sin pagar</span>
        <div className="ms-auto">
          <button className="btn btn-danger mb-2" onClick={exportarPDF}>
            <i className="bi bi-file-earmark-pdf"></i> Exportar PDF
          </button>
        </div>
      </h3>
      <div className="row justify-content-left">
        <div className="col-md-2">
          <label className="form-label fw-bold">Selecciona el mes</label>
        </div>

        <div className="col-md-2">
          <label className="form-label fw-bold">Selecciona el año</label>
        </div>

        <div className="col-md-2">
          <label className="form-label fw-bold">Selecciona la sucursal</label>
        </div>
      </div>
      <div className="row justify-content-left">
        <div className="col-md-2">
          <select
            className="form-select"
            value={mesSeleccionado}
            onChange={(e) => {
              setMesSeleccionado(Number(e.target.value));
            }}
          >
            {anioSeleccionado == 2026
              ? mesesHastaHoy.map((mes) => (
                  <option key={mes.id} value={mes.id}>
                    {mes.nombre}
                  </option>
                ))
              : meses.map((mes) => (
                  <option key={mes.id} value={mes.id}>
                    {mes.nombre}
                  </option>
                ))}
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={anioSeleccionado}
            onChange={(e) => {
              setAnioSeleccionado(Number(e.target.value));
              setMesSeleccionado(1);
            }}
          >
            {anios.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
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
        <div className="col-auto ms-3">
          <button
            className="btn btn-primary mb-3 ms-2"
            onClick={generarReporte}
          >
            Generar reporte
          </button>
        </div>
      </div>

      <br />

      <div ref={pdfRef}>
        {generar && (
          <>
            <h4 className="text-center">
              --- Sucursal {sucursal?.nombre} ---{" "}
            </h4>
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">
                  Alumnos sin pagar{" "}
                  {meses.find((mes) => mes.id === mesSeleccionado)?.nombre}{" "}
                  {anioSeleccionado}
                </h5>
              </div>

              <div className="card-body">
                <div className="table-responsive">
                  <GenericTablePDF<Moroso>
                    data={morosos}
                    columns={[
                      { key: "id", header: "Alumno ID" },
                      { key: "nombre", header: "Alumno Nombre" },
                      { key: "apellido", header: "Alumno Apellido" },
                      { key: "cantidad", header: "Cantidad pagada" },
                      { key: "estatus", header: "Estatus" },
                      { key: "mensualidad", header: "Mensualidad" },
                      { key: "diaDePago", header: "Dia de pago" },
                      { key: "restante", header: "Restante" },
                      { key: "sucursal", header: "Sucursal" },
                    ]}
                    striped
                    bordered
                    hover
                    small
                    showActions={false}
                    getId={(pago) => pago.id}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
