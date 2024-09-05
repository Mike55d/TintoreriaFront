import { GetClientsParams } from "@/features/clients/lib/types";
import networkClient from "@/networkClient";

const baseUrl = "api/company";

export default class Company {
  id?: string | null;
  name: string;
  brand: string;
  address: string;
  email: string;
  personName: string;
  personEmail: string;
  country: string | null;

  constructor() {
    this.id = null;
    this.name = "";
    this.brand = "";
    this.address = "";
    this.email = "";
    this.personName = "";
    this.personEmail = "";
    this.country = "";
  }

  static async fetchAll(params: GetClientsParams) {
    const { data } = await networkClient.get(baseUrl, {}, params);
    return data;
  }

  static async fetchOne(id: number | undefined) {
    if (!id) {
      return new Company();
    }
    const { data } = await networkClient.get(`${baseUrl}/${id}`);
    return data;
  }

  static async create(record: Company) {
    const { data } = await networkClient.post(`${baseUrl}`, record);
    return data;
  }

  static async update(record: Company) {
    const { data } = await networkClient.patch(
      `${baseUrl}/${record.id}`,
      record
    );
    return data;
  }

  static async delete(record: any) {
    await networkClient.delete(`${baseUrl}/${record.id}`);
  }
}
