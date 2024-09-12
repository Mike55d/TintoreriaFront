export type Price = {
  id?: number;
  type?: number | string;
  price?: number | null;
  currency?: {
    id: number;
  };
  garment?: {
    id: number;
  };
};
