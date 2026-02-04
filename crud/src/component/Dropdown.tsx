import { useState } from "react";

interface GenericDropdownProps<T> {
  items: T[];
  getLabel: (item: T) => string | undefined;
  getKey: (item: T) => number | undefined;
  onSelect?: (item: T) => void;
  placeholder?: string;
  value?: T | null;
}

export function Dropdown<T>({
  items,
  getLabel,
  getKey,
  onSelect,
  placeholder = "Selecciona",
  value = null,
}: GenericDropdownProps<T>) {
  const [selected, setSelected] = useState<T | null>(value);
  const handleSelect = (item: T) => {
    setSelected(item);
    onSelect?.(item);
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-primary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
      >
        {selected ? getLabel(selected) : placeholder}
      </button>

      <ul
        className="dropdown-menu overflow-auto"
        style={{ maxHeight: "200px" }}
      >
        {items.map((item) => (
          <li key={getKey(item)}>
            <button
              className="dropdown-item"
              type="button"
              onClick={() => handleSelect(item)}
            >
              {getLabel(item)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
