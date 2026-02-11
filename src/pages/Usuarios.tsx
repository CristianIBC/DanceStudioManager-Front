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
import type { Perfil } from "../Interfaces/Perfil";
import type { Usuario } from "../Interfaces/Usuario";
import { Dropdown } from "../component/Dropdown";
import type { UsuarioPassword } from "../Interfaces/UsuarioPassword";
import api from "../hooks/api";
export default function Usuarios() {
  const url = URL.HOST + "/usuarios";
  //Variables para mostrar los modales *******************************************************
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  //Variables de la interfaz *****************************************************************
  const [id, setId] = useState<number | undefined>(undefined);
  const [nombre, setNombre] = useState<string | undefined>("");
  const [apellido, setApellido] = useState<string | undefined>("");
  const [username, setUsername] = useState<string | undefined>("");
  const [password, setPassword] = useState<string | undefined>("");
  const [password2, setPassword2] = useState<string | undefined>("");
  const [perfilId, setPerfilId] = useState<number | undefined>(undefined);
  const [perfil, setPerfil] = useState<Perfil>();
  const [usuarioReset, setUsuarioReset] = useState<Usuario>();
  //Handlers para los modales ***************************************************************
  const handleOpenAdd = () => setShowAddModal(true);
  const handleCloseAdd = () => {
    setShowAddModal(false);
    cleanData();
  };
  const handleOpenReset = () => setShowResetModal(true);
  const handleCloseReset = () => {
    setShowResetModal(false);
    setUsuarioReset({});
    setPassword("");
    setPassword2("");
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
    setApellido("");
    setUsername("");
    setPassword("");
    setId(undefined);
    setPerfil({});
    setPerfilId(undefined);
  };

  // Hook para obtener todos los usuarios (GET) ***************************************************
  const {
    data,
    loading: loadingGet,
    error: errorGet,
  } = useFetch<Usuario[]>(url);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  useEffect(() => {
    if (data) {
      const id = localStorage.getItem("id");
      setUsuarios(data.filter((usuario) => usuario.id !== Number(id)));
    }
  }, [data]);

  //Variable para actualizar la data con base en la busqueda ***************************************
  const dataFiltrada = filtrarDatos(usuarios, search);
  // Hook para crear profesor (POST) ****************************************************************
  const {
    post,
    loading: loadingPost,
    error: errorPost,
  } = usePost<Usuario>(url);

  // Hook para elimminar profesor DELETE ************************************************************
  const { deleteRecord } = useDelete({
    endpoint: url,
  });
  const { confirmDelete } = DeleteAlert();
  // Hook para actualizar prfesor PUT **************************************************************

  const { update, loading } = useUpdate<Usuario, Usuario>(url, {
    onSuccess: () =>
      showSuccess({
        message: "Usuario actualizado correctamente",
        title: "Exito",
      }),
  });
  //Hook para Obtener paquetes ******************************************************************
  const { data: dataPerfiles } = useFetch<Perfil[]>(URL.HOST + "/perfiles");
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  useEffect(() => {
    if (dataPerfiles) setPerfiles(dataPerfiles);
  }, [dataPerfiles]);
  // Handler para agregar profesor ************************************************************
  const handleSubmitAdd = async () => {
    if (
      nombre == "" ||
      apellido == "" ||
      username == "" ||
      password == "" ||
      perfilId == undefined
    ) {
      showError({
        title: "Datos incorrectos",
        message: "Todos los campos son obligatorios",
      });
    } else {
      if (password != password2) {
        showError({ title: "Error", message: "Las contraseñas no coinciden" });
      } else {
        const usuario: Usuario = {
          nombre: nombre,
          apellido: apellido,
          perfilId: perfilId,
          username: username,
          password: password,
        };
        try {
          const nuevoUsuario = await post(usuario);
          if (nuevoUsuario.id != undefined && nuevoUsuario.id > 0) {
            showSuccess({
              title: "Exito",
              message: "Usuario agregado correctamente",
            });
            setUsuarios([...usuarios, nuevoUsuario]);
          } else {
            showError({
              title: "Error",
              message: "Algo salio mal",
            });
          }
        } catch (err) {
          showError({
            title: "Error",
            message: "Algo salio mal",
          });
        }
        handleCloseAdd();
        cleanData();
      }
    }
  };
  // Handler para actualizar profesor **********************************************************
  const handleSubmitEdit = async () => {
    if (
      nombre == "" ||
      apellido == "" ||
      username == "" ||
      perfilId == undefined ||
      id == undefined
    ) {
      showError({
        title: "Datos incorrectos",
        message: "Todos los campos son obligatorios",
      });
    } else {
      const usuario: Usuario = {
        nombre: nombre,
        apellido: apellido,
        perfilId: perfilId,
        username: username,
        id: id,
      };
      try {
        const usuarioEditado = await update(usuario.id, usuario);
        const usuarioDTO: Usuario = {
          nombre: usuarioEditado.nombre,
          apellido: usuarioEditado.apellido,
          id: usuarioEditado.id,
          perfilId: usuarioEditado.perfilId,
          perfilName: usuarioEditado.perfilName,
          username: usuarioEditado.username,
        };

        setUsuarios((prev) =>
          prev.map((a) => (a.id === usuarioDTO.id ? usuarioDTO : a)),
        );
      } catch (err) {
        showError({ message: "Error al actualizar el usuario" });
      }
      handleCloseEdit();
      cleanData();
    }
  };
  const handleSubmitReset = async () => {
    if (usuarioReset == undefined || password == "" || password2 == "") {
      showError({ title: "Error", message: "Todos los campos son requeridos" });
    } else {
      if (password != password2) {
        showError({ title: "Error", message: "Las contraseñas no coinciden" });
      } else {
        try {
          const dto: UsuarioPassword = {
            username: usuarioReset.username,
            password: password,
          };

          const resp = await api.put(url, dto);
          if (resp.data) {
            showSuccess({ message: "Contraseña reestablecida" });
            handleCloseReset();
          } else {
            showError({ title: "Error", message: "Algo salió mal" });
          }
        } catch (error: any) {
          showError({
            title: "Error",
            message: "Algo salió mal:" + error.response?.data,
          });
        }
      }
    }
  };
  // Handlear para abrir los modales *****************************************************************
  const handleEditButton = (usuario: Usuario) => {
    handleOpenEdit();
    setNombre(usuario.nombre);
    setApellido(usuario.apellido);
    setId(usuario.id);
    setUsername(usuario.username);
    setPerfil({ id: usuario.perfilId, nombre: usuario.perfilName });
    setPerfilId(usuario.perfilId);
  };
  const hanldeDeleteButton = async (usuario: Usuario) => {
    const confirmed = await confirmDelete({
      title: "¿Eliminar usuario?",
      text: `¿Estás seguro de eliminar a ${usuario.nombre}?`,
    });
    if (confirmed) {
      try {
        // Aquí va tu llamada a la API
        // await deleteUser(id);
        const result = await deleteRecord(usuario.id);

        if (result.success) {
          setUsuarios(usuarios.filter((u) => u.id !== usuario.id));
          showSuccess({
            message: `Usuario ${usuario.nombre} eliminado correctamente`,
          });
        } else {
          showError({
            message:
              "No se pudo eliminar al usuario, posiblemente este ligado a otras cosas",
          });
        }
      } catch (error) {
        showError({
          message:
            "No se pudo eliminar al usuario, posiblemente este ligado a otras cosas",
        });
      }
    }
  };
  const handleResetButton = async (usuario: Usuario) => {
    setUsuarioReset(usuario);
    handleOpenReset();
  };
  // HTML *******************************************************************************************
  return (
    <div className="">
      <h2>Usuarios</h2>
      <div className="text-end">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenAdd}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Agregar usuario
        </button>
      </div>
      <br />
      {/* MODAL PARA CREATE */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAdd}
        title={"Agregar usuario"}
      >
        <div className="modal-body">
          <div className="row">
            <div className="col">
              {" "}
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
              {" "}
              <label className="form-label fw-bold">
                {" "}
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

          <label className="form-label fw-bold">
            {" "}
            Username <span className="text-danger">*</span>
          </label>

          <input
            className="form-control mb-2"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label className="form-label fw-bold">
            {" "}
            Contraseña <span className="text-danger">*</span>
          </label>

          <input
            className="form-control mb-2"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className="form-label fw-bold">
            Confirma contraseña <span className="text-danger">*</span>
          </label>

          <input
            className="form-control mb-2"
            placeholder="Contraseña"
            type="password"
            onChange={(e) => setPassword2(e.target.value)}
          />
          <p
            style={{
              color: password === password2 ? "green" : "red",
              fontWeight: "600",
              marginTop: "8px",
            }}
          >
            {password && password2
              ? password === password2
                ? "Las contraseñas coinciden"
                : "Las contraseñas no coinciden"
              : ""}
          </p>
          <label className="form-label fw-bold">
            {" "}
            Selecciona el perfil <span className="text-danger">*</span>
          </label>

          <Dropdown
            items={perfiles}
            getKey={(s) => s.id}
            getLabel={(s) => s.nombre}
            placeholder="Selecciona el perfil"
            onSelect={(paquete) => setPerfilId(paquete.id)}
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
        title={"Editar usuario"}
      >
        <div className="modal-body">
          <div className="row">
            <div className="col">
              {" "}
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
              {" "}
              <label className="form-label fw-bold">
                {" "}
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
          <label className="form-label fw-bold">
            {" "}
            Username <span className="text-danger">*</span>
          </label>

          <input
            className="form-control mb-2"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label className="form-label fw-bold">
            {" "}
            Selecciona el perfil <span className="text-danger">*</span>
          </label>

          <Dropdown
            items={perfiles}
            getKey={(s) => s.id}
            getLabel={(s) => s.nombre}
            placeholder="Selecciona el perfil"
            onSelect={(paquete) => setPerfilId(paquete.id)}
            value={perfil}
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

      {/* MODAL PARA REESTABLECER CONTRASEÑA */}
      <Modal
        isOpen={showResetModal}
        onClose={handleCloseReset}
        title={"Reestablecer contraseña"}
        size="sm"
      >
        <div className="modal-body">
          <strong>Usuario: </strong>
          {usuarioReset?.nombre + " " + usuarioReset?.apellido} <br />
          <strong>Username: </strong> {usuarioReset?.username}
          <br />
          <br />
          <label className="form-label fw-bold">
            Ingresa la nueva contraseña <span className="text-danger">*</span>
          </label>
          <input
            className="form-control mb-2"
            placeholder="Nueva contraseña"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className="form-label fw-bold">
            Confirma contraseña <span className="text-danger">*</span>
          </label>
          <input
            className="form-control mb-2"
            placeholder="Confirma contraseña"
            type="password"
            onChange={(e) => setPassword2(e.target.value)}
          />
          <p
            style={{
              color: password === password2 ? "green" : "red",
              fontWeight: "600",
              marginTop: "8px",
            }}
          >
            {password && password2
              ? password === password2
                ? "Las contraseñas coinciden"
                : "Las contraseñas no coinciden"
              : ""}
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCloseReset}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmitReset}>
            Reestablecer
          </button>
        </div>
      </Modal>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar usuario..."
      />
      <GenericTable<Usuario>
        data={dataFiltrada}
        columns={[
          { key: "id", header: "ID" },
          { key: "nombre", header: "Nombre" },
          { key: "apellido", header: "Apellido" },
          { key: "username", header: "Username" },
          { key: "perfilName", header: "Perfil" },
        ]}
        striped
        bordered
        hover
        small
        onEdit={handleEditButton}
        onDelete={hanldeDeleteButton}
        onReset={handleResetButton}
        getId={(profesor) => profesor.id}
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
