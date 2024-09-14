import { useQuery } from "react-query";
import { CTError } from "../../../../utils/errors";
import { GetClientsParams } from "@/features/clients/lib/types";
import Order from "../api";

export function useOrders(params: GetClientsParams) {
  return useQuery<{ data: Order[]; count: number }, CTError>("orders", () =>
    Order.fetchAll(params)
  );
}
