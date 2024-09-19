import { useQuery } from "react-query";

import { CTError } from "../../../../utils/errors";
import { Settings } from "../api";

export default function useSettings() {
  return useQuery<Settings, CTError>("settings", Settings.fetchAll);
}
