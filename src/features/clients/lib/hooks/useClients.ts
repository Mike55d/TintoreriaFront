import { useQuery } from "react-query";
import { CTError } from "../../../../utils/errors";
import { GetClientsParams } from "../types";
import Client from "../api";

export function useClients(params?: GetClientsParams) {
  return useQuery<{ data: Client[]; count: number }, CTError>("clients", () =>
    Client.fetchAll(params)
  );
}
