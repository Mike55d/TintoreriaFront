import { useQuery } from "react-query";

import { CTError } from "../../../../utils/errors";
import { GeneralPrice } from "../api";

export default function useGeneralPrices() {
  return useQuery<GeneralPrice, CTError>(
    "generalPrices",
    GeneralPrice.fetchAll
  );
}
