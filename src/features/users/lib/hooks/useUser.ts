import { useQuery } from "react-query";

import { CTError } from "../../../../utils/errors";
import User from "../api";

export default function useUser(id: number | undefined) {
  return useQuery<User, CTError>(["user", id], () => User.fetchOne(id), {
    initialData: new User(),
    enabled: false
  });
}
