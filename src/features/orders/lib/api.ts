import networkClient from "@/networkClient";
import { GarmentOrderType, History } from "./types";
import { GetClientsParams } from "@/features/clients/lib/types";
import { Currency, Garment } from "@/features/settings/lib/api";
import { format } from "date-fns";
import Client from "@/features/clients/lib/api";

const baseUrl = "api/orders";

export default class Order {
  id?: string | null;
  created_at: Date;
  currency?: Currency | null;
  status: number;
  garments: GarmentOrderType[];
  historyEntries?: History[];
  endDate?: Date | null;
  payType: number;
  client?: Client | null;

  constructor() {
    this.id = null;
    this.created_at = new Date();
    this.status = 0;
    this.garments = [];
    this.historyEntries = [];
    this.payType = 0;
    this.endDate = null;
    this.currency = null;
    this.client = null;
  }

  static fromServer(data: Order[]) {
    return data.map((order) => ({
      ...order,
      created_at: new Date(order.created_at),
    }));
  }

  static async fetchAll(params: GetClientsParams) {
    const { data } = await networkClient.get(baseUrl, {}, params);
    const blue = { data: this.fromServer(data.data), count: data.count };
    console.log(blue);
    return blue;
  }

  static async fetchOne(id: number | undefined) {
    if (!id) {
      return new Order();
    }
    const { data } = await networkClient.get(`${baseUrl}/${id}`);
    return data;
  }

  static async create(record: Order) {
    const newGarments = record.garments.map((garment) => ({
      quantity: garment.quantity,
      ironingOnly: garment.ironingOnly,
      garmentId: garment.garment.id,
      price: garment.price,
      total: garment.total,
    }));
    const { data } = await networkClient.post(`${baseUrl}`, {
      ...record,
      endDate: record.endDate
        ? format(record.endDate, "YYYY/MM/DD")
        : undefined,
      garments: newGarments,
      clientId: record.client?.id,
      currencyId: record.currency?.id,
    });
    return data;
  }

  static async update(record: Order) {
    const newGarments = record.garments.map((garment) => ({
      id: garment.id,
      quantity: garment.quantity,
      ironingOnly: garment.ironingOnly,
      garmentId: garment.garment.id,
      price: garment.price,
      total: garment.total,
    }));
    const { data } = await networkClient.patch(`${baseUrl}/${record.id}`, {
      ...record,
      endDate: record.endDate
        ? format(record.endDate, "YYYY/MM/DD")
        : undefined,
      garments: newGarments,
      clientId: record.client?.id,
      currencyId: record.currency?.id,
    });
    return data;
  }

  static async delete(record: any) {
    await networkClient.delete(`${baseUrl}/${record.id}`);
  }

  static async changeStatus(id: number, statusId: number) {
    const { data } = await networkClient.patch(
      `${baseUrl}/changeStatus/${id}`,
      { statusId }
    );
    return data;
  }

  static async AddPay(id: number, payId: number) {
    const { data } = await networkClient.patch(`${baseUrl}/${id}`, {
      payType: payId,
      statusId:4
    });
    return data;
  }
}
