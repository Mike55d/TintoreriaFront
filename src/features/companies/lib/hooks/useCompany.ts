import { useQuery } from "react-query";

import { CTError } from "../../../../utils/errors";
import Company from "../api";

export default function useCompany(id: number | undefined) {
  return useQuery<Company, CTError>(["company", id], () =>
    Company.fetchOne(id)
  );
}
