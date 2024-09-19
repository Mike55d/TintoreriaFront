import networkClient from "@/networkClient";
import {
  GarmentWithPrice,
  GeneralPriceForm,
  GeneralPriceType,
  Price,
  SettingsType,
} from "./types";

const baseUrl = "api/garments";
const baseUrlCurrencies = "api/currencies";

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

const baseUrlGeneralPrices = "api/general-prices";

export class GeneralPrice {
  id?: number | null;
  generalPrice: GeneralPriceType;
  garmentsWithPrice: GarmentWithPrice[];

  constructor() {
    this.id = null;
    this.generalPrice = {} as GeneralPriceType;
    this.garmentsWithPrice = [];
  }

  static async fetchAll(currencyId: number | null) {
    if (!currencyId) return new GeneralPrice();
    const { data } = await networkClient.get(
      `${baseUrlGeneralPrices}/${currencyId}`,
      {}
    );
    return data;
  }

  static async create(record: GeneralPriceForm) {
    const formatGarments = record.garmentsWithPrice.map((garment) => ({
      ...garment,
      id: typeof garment.id === "string" ? undefined : garment.id,
    }));
    const { data } = await networkClient.post(`${baseUrlGeneralPrices}`, {
      ...record,
      garmentsWithPrice: formatGarments,
    });
    return data;
  }
}

const baseUrlSettings = "api/settings";

export class Settings {
  id?: number | null;
  currencyId?: number;

  constructor() {
    this.id = null;
  }

  static async fetchAll() {
    const { data } = await networkClient.get(baseUrlSettings, {});
    return data;
  }

  static async create(record: SettingsType) {
    const { data } = await networkClient.post(baseUrlSettings, {
      ...record,
    });
    return data;
  }
}
