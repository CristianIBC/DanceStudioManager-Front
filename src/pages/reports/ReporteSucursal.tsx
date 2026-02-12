import { Fragment, useEffect, useRef, useState } from "react";
import type { Sucursal } from "../../Interfaces/Sucursal";
import { URL } from "../../constants/url";
import useFetch from "../../hooks/useFetch";
import { showError } from "../../hooks/alerts/ErrorAlert";
import type { Curso } from "../../Interfaces/Curso";
import CardCursoSucursal from "../../component/CardCursoSucursal";
import html2pdf from "html2pdf.js";
import api from "../../hooks/api";
import { closeLoading, showLoading } from "../../hooks/alerts/LoadingAlert";
import { getSucursalId } from "../../helpers/sucursalHelper";
import { showInfo } from "../../hooks/alerts/InfoAlert";
import type { Alumno } from "../../Interfaces/Alumno";

export default function ReporteSucursal() {
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
  const [ingresos, setIngresos] = useState<number>(0);
  const [cursos, setCursos] = useState<Curso[] | undefined>([]);

  //Hook para Obtener sucursales ******************************************************************
  const { data: dataSucursales } = useFetch<Sucursal[]>(
    URL.HOST + "/sucursales",
  );
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  useEffect(() => {
    if (dataSucursales) setSucursales(dataSucursales);
  }, [dataSucursales]);
  // Hook para obtener todos los alumnos (GET) ***************************************************
  const {
    data,
    loading: loadingGet,
    error: errorGet,
  } = useFetch<Alumno[]>(
    URL.HOST + `/alumnos/by-sucursal/${sucursalSeleccionada}`,
  );

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  useEffect(() => {
    if (data) {
      setAlumnos(data);
    }
    console.log(data);
  }, [data]);
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
    setCursos(sucursalTemp.cursos);

    const resp = await api.get(
      URL.HOST + `/sucursales/ingresos/${sucursalTemp.id}`,
    );

    setIngresos(resp.data);
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
        filename: `reporte-general-sucursal-${sucursal?.nombre}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      })
      .save();
  };

  return (
    <div className="container-fluid mt-4">
      <h3 className="mb-4 flex gap-2 ">
        Reporte general de sucursal
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
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Información de la Sucursal</h5>
              </div>

              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <strong>ID:</strong> {sucursal?.id}
                  </div>
                  <div className="col-md-4">
                    {" "}
                    <strong>Nombre:</strong> {sucursal?.nombre}
                  </div>
                  <div className="col-md-4">
                    <strong>Ubicacion:</strong> {sucursal?.ubicacion}
                  </div>
                  <div className="col-md-4">
                    <strong>Telefono:</strong>{" "}
                    {sucursal?.telefono ?? "No registrado"}
                  </div>
                  <div className="col-md-4">
                    <strong>Ingresos totales:</strong> $
                    {ingresos > 0 ? ingresos : 0}
                  </div>
                  <div className="col-md-4">
                    <strong>Alumnos activos: </strong>
                    {alumnos.length}
                  </div>
                </div>
              </div>
            </div>
            <br />
            {cursos?.map((curso, i) => (
              <Fragment key={curso.id}>
                <CardCursoSucursal curso={curso} index={i}></CardCursoSucursal>
                <br />
              </Fragment>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
