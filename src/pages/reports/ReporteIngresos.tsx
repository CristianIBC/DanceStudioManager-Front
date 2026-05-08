import { useEffect, useState } from "react";
import { URL } from "../../constants/url";
import type { Mes } from "../../Interfaces/Mes";
import useFetch from "../../hooks/useFetch";
import GraficaIngresos from "../../component/GraficaIngresos";
import { showInfo } from "../../hooks/alerts/InfoAlert";
import type { Sucursal } from "../../Interfaces/Sucursal";
import { getSucursalId } from "../../helpers/sucursalHelper";
export default function ReporteIngresos() {
  const url = URL.HOST + "/pagos/reporte-ingresos";

  const [ingresos, setIngresos] = useState<Mes[]>([]);

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

  const { data } = useFetch<Mes[]>(
    `${url}/${anioSeleccionado}/${sucursalSeleccionada}`
  );

  useEffect(() => {
    if (data) {
      if (data.length == 0) {
        showInfo({ title: "Aviso", message: "Ese año no cuenta con ingresos" });
      }
      setIngresos(data);
    }
  }, [data]);
  //Hook para Obtener sucursales ******************************************************************
  const { data: dataSucursales } = useFetch<Sucursal[]>(
    URL.HOST + "/sucursales"
  );
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  useEffect(() => {
    if (dataSucursales) setSucursales(dataSucursales);
  }, [dataSucursales]);
  return (
    <>
      <div className="row justify-content-center">
        <div className="col-md-2">
          <label className="form-label fw-bold">Selecciona el año</label>

          <select
            className="form-select"
            value={anioSeleccionado}
            onChange={(e) => {
              setAnioSeleccionado(Number(e.target.value));
            }}
          >
            {anios.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label fw-bold">Selecciona la sucursal</label>

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
      </div>
      <div
        className="card shadow-sm mt-2"
        style={{ width: "1300px", height: "650px", margin: "0 auto" }}
      >
        <div className="card-body">
          <div style={{ width: "1200px", height: "650px", margin: "0 auto" }}>
            <GraficaIngresos
              ingresos={ingresos}
              anio={anioSeleccionado}
            ></GraficaIngresos>
          </div>
        </div>
      </div>
    </>
  );
}
