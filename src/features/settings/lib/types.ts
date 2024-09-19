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
  id?: number | string;
  name: string;
  type: PriceType;
  price: number;
  currencyId: number;
  edited?: boolean;
  garmentId: number;
};

export type GeneralPriceForm = {
  generalPrices: GeneralPriceType[];
  garmentsWithPrice: GarmentWithPrice[];
};

export type GeneralPriceType = {
  id?: number;
  currencyId: number | null;
  generalPrice: number | null;
  ironingDiscount: number | null;
};

export type SettingsType = {
  currencyId?:number;
}
