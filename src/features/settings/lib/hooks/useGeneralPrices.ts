import { useQuery } from "react-query";

import { CTError } from "../../../../utils/errors";
import { GeneralPrice } from "../api";

export default function useGeneralPrices(currencyId: number | null) {
  return useQuery<GeneralPrice, CTError>(["generalPrices", currencyId], () =>
    GeneralPrice.fetchAll(currencyId)
  );
}
