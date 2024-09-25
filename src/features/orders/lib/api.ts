import networkClient from "@/networkClient";
import { GarmentOrderType, History } from "./types";
import { GetClientsParams } from "@/features/clients/lib/types";
import { Currency, Garment } from "@/features/settings/lib/api";

const baseUrl = "api/orders";

export default class Order {
  id?: string | null;
  created_at: Date;
  currency?: Currency;
  currencyId?: number;
  status: number;
  garments: GarmentOrderType[];
  historyEntries?: History[];

  constructor() {
    this.id = null;
    this.created_at = new Date();
    this.currencyId = 1;
    this.status = 0;
    this.garments = [];
    this.historyEntries = [];
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
      garments: newGarments,
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
      garments: newGarments,
    });
    return data;
  }

  static async delete(record: any) {
    await networkClient.delete(`${baseUrl}/${record.id}`);
  }
}
