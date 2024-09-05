import { useQuery } from "react-query";

import { CTError } from "../../../../utils/errors";
import Client from "../api";

export default function useClient(id: number | undefined) {
  return useQuery<Client, CTError>(["client", id], () => Client.fetchOne(id));
}
