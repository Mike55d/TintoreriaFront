import { Garment } from "@/features/settings/lib/api";

export type GarmentOrderType = {
  id?: number;
  quantity: number;
  price: number | null;
  total: number | null;
  ironingOnly: boolean;
  garment: Garment;
};

export enum Status {
  RECEIVED = 1,
  PROCESSING,
  LATE,
  DELIVERED,
  CANCELED,
}

export enum PayType {
  DEBIT,
  CREDIT,
  CASH,
}

export type History = {
  id: number;
  status: number;
};
