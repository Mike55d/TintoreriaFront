import { useQuery } from "react-query";
import { CTError } from "../../../../utils/errors";
import { GetClientsParams } from "@/features/clients/lib/types";
import Company from "../api";

export function useCompanies(params: GetClientsParams) {
  return useQuery<{ data: Company[]; count: number }, CTError>(
    "companies",
    () => Company.fetchAll(params)
  );
}
