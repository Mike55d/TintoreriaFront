import { useQuery } from "react-query";

import { CTError } from "../../../../utils/errors";
import { Currency } from "../api";

export default function useCurrencies() {
  return useQuery<Currency[], CTError>("currencies", Currency.fetchAll);
}
