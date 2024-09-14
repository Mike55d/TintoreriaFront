import networkClient from "@/networkClient";
import { Price } from "./types";

const baseUrl = "api/garments";
const baseUrlCurrencies = "api/currencies";
const baseUrlGeneralPrices = "api/settings";

export class Garment {
  id?: string | null;
  name: string;
  prices: Price[];

  constructor() {
    this.id = null;
    this.name = "";
    this.prices = [];
  }

  static async fetchAll() {
    const { data } = await networkClient.get(baseUrl, {});
    return data;
  }

  static async fetchOne(id: number | undefined) {
    if (!id) {
      return new Garment();
    }
    const { data } = await networkClient.get(`${baseUrl}/${id}`);
    return data;
  }

  static async create(record: Garment) {
    const { data } = await networkClient.post(`${baseUrl}`, record);
    return data;
  }

  static async update(record: Garment) {
    const { data } = await networkClient.patch(
      `${baseUrl}/${record.id}`,
      record
    );
    return data;
  }

  static async delete(record: Garment) {
    const { data } = await networkClient.delete(`${baseUrl}/${record.id}`);
    return data;
  }
}

export class Currency {
  id?: number | null;
  name: string;
  code: string;
  sign: string;

  constructor() {
    this.id = null;
    this.name = "";
    this.code = "";
    this.sign = "";
  }

  static async fetchAll() {
    const { data } = await networkClient.get(baseUrlCurrencies, {});
    return data;
  }

  static async fetchOne(id: number | undefined) {
    if (!id) {
      return new Currency();
    }
    const { data } = await networkClient.get(`${baseUrlCurrencies}/${id}`);
    return data;
  }

  static async create(record: Currency) {
    const { data } = await networkClient.post(`${baseUrlCurrencies}`, record);
    return data;
  }

  static async update(record: Currency) {
    const { data } = await networkClient.patch(
      `${baseUrlCurrencies}/${record.id}`,
      record
    );
    return data;
  }

  static async delete(record: Currency) {
    const { data } = await networkClient.delete(
      `${baseUrlCurrencies}/${record.id}`
    );
    return data;
  }
}

export class GeneralPrice {
  id?: number | null;
  ironing_discount: number | null;
  general_price: number | null;
  currencyId: number | null;

  constructor() {
    this.id = null;
    this.ironing_discount = null;
    this.general_price = null;
    this.currencyId = null;
  }

  static async fetchAll() {
    const { data } = await networkClient.get(baseUrlGeneralPrices, {});
    return data;
  }

  static async create(record: GeneralPrice) {
    const { data } = await networkClient.post(`${baseUrlGeneralPrices}`, record);
    return data;
  }
}
