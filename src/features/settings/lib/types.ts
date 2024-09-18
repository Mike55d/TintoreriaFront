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

export type GarmentWithPrice = {
  id: number;
  name: string;
  type: PriceType;
  price: number;
  currencyId: number;
  edited?: boolean;
};

export type GeneralPriceForm = {
  curencyId: number;
  generalPrice: number;
  ironingDiscount: number;
  garmentsWithPrice: GarmentWithPrice[];
};
