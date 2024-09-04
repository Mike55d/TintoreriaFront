import { Filter } from '../../tickets/lib/types';

export interface User {
  id: number;
  name: string;
  email: string;
  token: string;
  status: number;
  photo?: string;
  roles: any;
  profile: {
    skipUntrustedRedirect: boolean;
    darkMode: boolean;
    trustedDomains: string[];
    columns: string[];
    take: number;
    signature: string | null;
    filters?: Filter[];
  };
  permissions: string[];
  support: boolean;
  photoUrl: string | null;
}

export type AppSliceType = {
  msToken: string;
  mobileOpen: boolean;
  loginError?: number;
  user?: User;
};

export type Notification = {
  id: number;
};
