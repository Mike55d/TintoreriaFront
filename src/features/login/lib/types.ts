
export interface CylanceService {
  idTenant: string;
  appId: string;
  appKey: string;
  contractDate: Date | null;
  tenantToken: string;
}

export interface Client {
  id?: number;
  name: string;
  hasCylanceService: boolean;
  cylanceService: CylanceService;
}

export const EmptyClient: Client = {
  name: '',
  hasCylanceService: false,
  cylanceService: {
    appId: '',
    idTenant: '',
    appKey: '',
    tenantToken: '',
    contractDate: null
  }
};

export type StartSession = {
  username: string;
  clientEphemeral: string;
};

export type StartSessionSuccess = {
  salt: string;
  serverEphemeral: string;
  presessionId: number;
};

export type LoginForm = {
  email: string;
  password: string;
};

export type EmailFormType = {
  email: string;
};

export type PasswordFormType = {
  password: string;
};

export type ConfirmSession = {
  clientSessionProof: string;
  presessionId: number;
};

export enum ProviderCredentialsType {
  GOOGLE,
  MICROSOFT
}