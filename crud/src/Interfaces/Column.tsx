export interface Column<T> {
  key: keyof T;
  header: string;
}
