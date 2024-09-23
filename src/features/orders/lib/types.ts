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
  RECEIVED,
  PROCESING,
  READY,
}
