import { UserStatus } from "./types";

export const formatUserStatus = (status: UserStatus) => {
  switch (status) {
    case UserStatus.ACTIVE:
      return "active";
    case UserStatus.INACTIVE:
      return "inactive";
    default:
      return "invalid_status";
  }
};
