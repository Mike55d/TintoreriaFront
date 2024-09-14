import { useQuery } from "react-query";
import { CTError } from "../../../../utils/errors";
import { Garment } from "@/features/settings/lib/api";
import Order from "../api";

export function useOrder(id: number | undefined) {
  return useQuery<Order, CTError>(["order", id], () => Order.fetchOne(id));
}
