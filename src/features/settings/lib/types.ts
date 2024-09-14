import { Currency } from "./api";

export type Price = {
  id?: number;
  type?: number | string;
  price?: number | null;
  currency?: Currency;
  garment?: {
    id: number;
  };
};

export enum PriceType {
  PERCENT,
  PRICE,
}
