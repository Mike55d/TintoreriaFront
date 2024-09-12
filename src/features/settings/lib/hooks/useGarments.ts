import { useQuery } from "react-query";

import { CTError } from "../../../../utils/errors";
import { Garment } from "../api";

export default function useGarments() {
  return useQuery<Garment[], CTError>("garments", Garment.fetchAll);
}
