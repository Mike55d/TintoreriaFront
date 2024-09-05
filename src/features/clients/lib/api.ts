import networkClient from "@/networkClient";
import { GetClientsParams } from "./types";

const baseUrl = "api/clients";

export default class Client {
  id?: string | null;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  country: string | null;
  postalCode: string;
  rfc: string;

  constructor() {
    this.id = null;
    this.name = "";
    this.lastname = "";
    this.email = "";
    this.phone = "";
    this.country = "";
    this.postalCode = "";
    this.rfc = "";
  }

  static async fetchAll(params: GetClientsParams) {
    const { data } = await networkClient.get(baseUrl, {}, params);
    return data;
  }

  static async fetchOne(id: number | undefined) {
    if (!id) {
      return new Client();
    }
    const { data } = await networkClient.get(`${baseUrl}/${id}`);
    return data;
  }

  static async create(record: Client) {
    const { data } = await networkClient.post(`${baseUrl}`, record);
    return data;
  }

  static async update(record: Client) {
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
