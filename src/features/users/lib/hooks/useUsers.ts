import { useQuery } from "react-query";

import { CTError } from "../../../../utils/errors";
import User from "../api";

export function useUsers() {
  return useQuery<User[], CTError>("users", User.fetchAll);
};
