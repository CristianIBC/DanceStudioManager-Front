import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../styles/Dashborad.css";
import {
  FaChartLine,
  FaClipboardList,
  FaUserClock,
  FaUserGraduate,
} from "react-icons/fa";

interface DashboardCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const cards: DashboardCard[] = [
  {
    title: "Reporte de Alumnos sin pagar",
    description: "Alumnos inscritos y que no han pagado",
    icon: <FaUserGraduate size={32} />,
    path: "/panel/home/morosos",
  },
  {
    title: "Reporte de ingresos",
    description: "Ingresos desglozados a lo largo del año",
    icon: <FaChartLine size={32} />,
    path: "/panel/home/ingresos",
  },
  {
    title: "Reporte general de sucursal",
    description: "Alumnos activos, cursos, profesores e ingreso",
    icon: <FaClipboardList size={32} />,
    path: "/panel/home/reporte-sucursal",
  },
  {
    title: "Reporte de alumnos recientes/borrados",
    description: "Alumnos borrados y agregados en los últimos 3 meses",
    icon: <FaUserClock size={32} />,
    path: "/panel/home/recientes-borrados",
  },
];

const DashboardCards = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid mt-4">
      <div className="row g-4 gx-2">
        {cards.map((card, index) => (
          <div key={index} className="col-12 col-md-6">
            <motion.div
              className="card h-100 dashboard-card cursor-pointer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => navigate(card.path)}
            >
              <div className="card-body d-flex align-items-center gap-3">
                <div className="icon-box">{card.icon}</div>
                <div>
                  <h5 className="card-title mb-1">{card.title}</h5>
                  <p className="card-text text-muted mb-0">
                    {card.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardCards;
