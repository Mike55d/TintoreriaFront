export enum UserStatus {
  INACTIVE,
  ACTIVE
}

export interface UserEffectivePermissions {
  module: string;
  permissions: string[];
}

export type PasswordForm = {
  verifier: string;
  salt: string;
};

export type Role = {
  id: string;
  name: string;
  permissions: string[];
};
