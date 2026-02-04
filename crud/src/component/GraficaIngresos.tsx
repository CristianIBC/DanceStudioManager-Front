import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import type { Mes } from "../Interfaces/Mes";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Props = {
  ingresos: Mes[];
  anio: Number;
};

const mesesOrden = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function GraficaIngresos({ ingresos, anio }: Props) {
  // Completa los meses faltantes con 0
  const dataOrdenada = mesesOrden.map((mes, index) => {
    const encontrado = ingresos.find((g) => g.id === index + 1);
    return {
      nombre: mes,
      total: encontrado ? encontrado.total : 0,
    };
  });

  const data = {
    labels: dataOrdenada.map((m) => m.nombre),
    datasets: [
      {
        label: `Ingresos del año ${anio}`,
        data: dataOrdenada.map((m) => m.total),
        backgroundColor: "#4f46e5",
      },
    ],
  };

  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Meses del año",
            },
          },
          y: {
            title: {
              display: true,
              text: "Monto de ingresos ($)",
            },
            beginAtZero: true,
          },
        },
      }}
    />
  );
}
