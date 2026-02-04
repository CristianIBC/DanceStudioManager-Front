import React, { useEffect, useState } from "react";

type Column<T> = {
  key: keyof T;
  header: string;
  render?: (item: T) => React.ReactNode;
};

type GenericTableProps<T> = {
  data: T[] | undefined;
  columns: Column<T>[];
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
  small?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onActivate?: (item: T) => void;
  onInscribir?: (item: T) => void;
  getId?: (item: T) => number | undefined;
  showActions?: boolean;
  showInscribir?: boolean;
};

export function GenericTablePDF<T>({
  data,
  columns,
  striped = true,
  bordered = true,
  hover = true,
  small = false,
  onEdit,
  onDelete,
  onView,
  onInscribir,
  onActivate,
  getId,
  showActions = true,
  showInscribir = false,
}: GenericTableProps<T>) {
  const tableClasses = [
    "table",
    striped ? "table-striped" : "",
    bordered ? "table-bordered" : "",
    hover ? "table-hover" : "",
    small ? "table-sm" : "",
  ]
    .join(" ")
    .trim();
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <>
      <table className={tableClasses}>
        <thead className="table-dark">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)}>{col.header}</th>
            ))}
            {showActions && <th>Acciones</th>}
            {showInscribir && <th>Inscribir cursos</th>}
          </tr>
        </thead>
        <tbody>
          {data?.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (showActions ? 1 : 0)}
                className="text-center text-muted"
              >
                No hay datos para mostrar
              </td>
            </tr>
          ) : (
            data?.map((item) => (
              <tr key={getId?.(item)}>
                {columns.map((col) => (
                  <td key={String(col.key)}>
                    {col.render
                      ? col.render(item)
                      : String(item[col.key]) == "null"
                      ? "N/A"
                      : String(item[col.key])}
                  </td>
                ))}
                {showActions && (
                  <td className="text-center">
                    {onView && (
                      <button
                        onClick={() => onView(item)}
                        className="btn btn-dark btn-sm me-2"
                        title="Ver"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="btn btn-primary btn-sm me-2"
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                    )}
                    {onActivate && (
                      <button
                        onClick={() => onActivate(item)}
                        className="btn btn-success btn-sm me-2"
                        title="Activar"
                      >
                        <i className="bi bi-person-check"></i>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="btn btn-danger btn-sm"
                        title="Borrar"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </td>
                )}
                {showInscribir && (
                  <td className="text-center">
                    {onInscribir && (
                      <button
                        onClick={() => onInscribir(item)}
                        className="btn btn-warning btn-sm me-2"
                        title="Inscribir "
                      >
                        <i className="bi bi-journal-check"></i>
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
