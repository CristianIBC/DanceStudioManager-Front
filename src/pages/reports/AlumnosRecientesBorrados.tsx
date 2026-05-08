import html2pdf from "html2pdf.js";
import { URL } from "../../constants/url";
import useFetch from "../../hooks/useFetch";
import { showError } from "../../hooks/alerts/ErrorAlert";
import {  useEffect, useRef, useState } from "react";
import type { Sucursal } from "../../Interfaces/Sucursal";
import type { Alumno } from "../../Interfaces/Alumno";
import { GenericTablePDF } from "../../component/GenericTablePDF";
import api from "../../hooks/api";
import { closeLoading, showLoading } from "../../hooks/alerts/LoadingAlert";
import { getSucursalId } from "../../helpers/sucursalHelper";
import { showInfo } from "../../hooks/alerts/InfoAlert";

export default function AlumnosRecientesBorrados() {
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
  const [sucursal, setSucursal] = useState<Sucursal | undefined>({});
  const [generar, setGenerar] = useState(false);
  const [alumnosRecientes, setAlumnosRecientes] = useState<
    Alumno[] | undefined
  >([]);
  const [alumnosBorrados, setAlumnosBorrados] = useState<Alumno[] | undefined>(
    [],
  );
  //Hook para Obtener sucursales ******************************************************************
  const { data: dataSucursales } = useFetch<Sucursal[]>(
    URL.HOST + "/sucursales",
  );
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  useEffect(() => {
    if (dataSucursales) setSucursales(dataSucursales);
  }, [dataSucursales]);

  const generarReporte = async () => {
    if (sucursalSeleccionada === 0) {
      showError({ title: "Error", message: "Elije una sucursal" });
      return;
    }
    showLoading("Generando reporte...");
    const sucursalTemp = sucursales.find((s) => s.id === sucursalSeleccionada);

    if (!sucursalTemp) {
      closeLoading();
      showError({ title: "Error", message: "Sucursal no encontrada" });
      return;
    }
    // Actualizamos estados
    setSucursal(sucursalTemp);

    const resp = await api.get(
      URL.HOST + `/alumnos/recientes/by-sucursal/${sucursalTemp.id}`,
    );
    setAlumnosRecientes(resp.data);

    const resp2 = await api.get(
      URL.HOST + `/alumnos/inactivos/by-sucursal/${sucursalTemp.id}`,
    );
    setAlumnosBorrados(resp2.data);
    closeLoading();
    setGenerar(true);
  };
  const pdfRef = useRef<HTMLDivElement>(null);

  const exportarPDF = () => {
    if (!pdfRef.current) return;
    if (sucursalSeleccionada == 0) {
      showError({
        title: "Erorr",
        message: "Selecciona una sucursal y genera el reporte primero",
      });
      return;
    }
    html2pdf()
      .from(pdfRef.current)
      .set({
        margin: 10,
        filename: `reporte-alumnos-sucursal-${sucursal?.nombre}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      })
      .save();
  };
  return (
    <div className="container-fluid mt-4">
      <h3 className="mb-4 flex gap-2 ">
        Reporte de alumnnos recientes y borrados
        <div className="text-end">
          {" "}
          <button className="btn btn-danger mb-1 ml-4" onClick={exportarPDF}>
            <i className="bi bi-file-earmark-pdf"></i> Exportar PDF
          </button>
        </div>
      </h3>
      <label className="form-label fw-bold">Selecciona la sucursal</label>

      <div className="row ">
        <div className="col-md-3">
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
            className="btn btn-primary mb-3 ml-4"
            onClick={generarReporte}
          >
            Generar reporte
          </button>
        </div>
      </div>

      {/* DATA DE LA SUCURSAL */}
      <div ref={pdfRef}>
        {generar && (
          <>
            <h4 className="text-center">
              --- Sucursal {sucursal?.nombre} ---{" "}
            </h4>
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">
                  Alumnos agregados en los últimos 3 meses
                </h5>
              </div>

              <div className="card-body">
                <GenericTablePDF<Alumno>
                  data={alumnosRecientes}
                  columns={[
                    {
                      key: "nombre",
                      header: "Alumno ",
                      render: (a) => a.nombre + " " + a.apellido,
                    },
                    { key: "telefono", header: "Telefono" },
                    {
                      key: "fechaDeCreacion",
                      header: "Fecha de Creación",
                    },
                    {
                      key: "estatus",
                      header: "Estatus",
                      render: (alumno) =>
                        alumno.estatus ? "Activo" : "Inactivo",
                    },
                    {
                      key: "mensualidad",
                      header: "Mensualidad",
                      render: (a) => (a.mensualidad ?? 0) - (a.descuento ?? 0),
                    },
                    { key: "paqueteNombre", header: "Paquete" },
                  ]}
                  striped
                  bordered
                  hover
                  small
                  showActions={false}
                  getId={(alumno) => alumno.id}
                />
              </div>
            </div>
            <br />
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Alumnos borrados</h5>
              </div>

              <div className="card-body">
                <GenericTablePDF<Alumno>
                  data={alumnosBorrados}
                  columns={[
                    {
                      key: "nombre",
                      header: "Alumno ",
                      render: (a) => a.nombre + " " + a.apellido,
                    },
                    { key: "telefono", header: "Telefono" },
                    {
                      key: "fechaDeCreacion",
                      header: "Fecha de Creación",
                    },
                    {
                      key: "estatus",
                      header: "Estatus",
                      render: (alumno) =>
                        alumno.estatus ? "Activo" : "Inactivo",
                    },
                    {
                      key: "mensualidad",
                      header: "Mensualidad",
                      render: (a) => (a.mensualidad ?? 0) - (a.descuento ?? 0),
                    },
                    { key: "paqueteNombre", header: "Paquete" },
                  ]}
                  striped
                  bordered
                  hover
                  small
                  showActions={false}
                  getId={(alumno) => alumno.id}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
