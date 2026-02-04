import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);
interface Props {
  title?: string;
  message?: string;
}
export const showSuccess = ({ title = "Éxito", message }: Props) => {
  return MySwal.fire({
    title: title,
    text: message,
    icon: "success",
    timer: 2000,
    showConfirmButton: false,
  });
};
