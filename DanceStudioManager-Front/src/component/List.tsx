import React, { useState, type ReactNode } from "react";

interface Props<T> {
  data: T[] | null;
  renderItem: (elemento: T) => React.ReactNode;
  getKey: (elemento: T) => React.Key;
}

function List<T>({ data, renderItem, getKey }: Props<T>) {
  const [index, setIndex] = useState(-1);
  const handlerClick = (i: number) => {
    setIndex(i);
  };
  return (
    <ul className="list-group">
      {data?.map((elemento, i) => (
        <li
          onClick={() => handlerClick(i)}
          key={getKey(elemento)}
          className={`list-group-item ${index == i ? "active" : ""}`}
        >
          {renderItem(elemento)}
        </li>
      ))}
    </ul>
  );
}

export default List;
