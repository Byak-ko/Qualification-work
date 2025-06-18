export type Unit = {
  id: number | string;
  name: string;
  type: string;
  departments: {
    id: number | string;
    name: string;
  }[];
}