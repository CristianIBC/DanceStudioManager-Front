type SearchBarProps = {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
};

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Buscar...",
}) => {
  return (
    <input
      type="text"
      className="form-control mb-3"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default SearchBar;
