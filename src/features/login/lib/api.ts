import axios from 'axios';
import networkClient from '../../../networkClient';
import { Client, EmptyClient, StartSession, ConfirmSession } from './types';

function toLocal(client: Record<string, any>): Client {
  return <Client>{
    ...client,
    hasCylanceService: !!client.cylanceService,
    cylanceService: client.cylanceService ?? {
      appKey: '',
      appId: '',
      idTenant: '',
      tenantToken: '',
      contractDate: null
    }
  };
}

function toServer(client: Client) {
  const result: Record<string, any> = {
    id: client.id,
    name: client.name
  };

  if (client.hasCylanceService) {
    result.cylanceService = client.cylanceService;
  }

  return result;
}

export async function fetchClients() {
  const { data } = await networkClient.get('api/clients');
  return data.map((item: Client) => toLocal(item));
}

export async function fetchClient(id?: number) {
  if (!id) {
    return EmptyClient;
  }
  const { data } = await networkClient.get(`api/clients/${id}`);
  return toLocal(data);
}

export async function postClient(client: Client) {
  const { data } = await networkClient.post(`api/clients`, toServer(client));
  return data;
}

export async function patchClient(client: Client) {
  const { data } = await networkClient.patch(`api/clients/${client.id}`, toServer(client));
  return data;
}

export async function deleteClient(client: Client) {
  await networkClient.delete(`api/clients/${client.id}`);
}

const authPath = 'api/sessions';

export async function startSession(startSession: StartSession) {
  const { data } = await networkClient.post(`${authPath}/start`, startSession);
  return data;
}

export async function confirmSession(confirmSession: ConfirmSession) {
  const { data } = await networkClient.post(`${authPath}/confirm`, confirmSession);
  return data;
}

const authExternalPath = 'api/sessions';

export async function authExternal(externaluid: string) {
  const { data } = await networkClient.get(
    `${authExternalPath}/authSupport`,
    {},
    {
      userApproval: externaluid
    }
  );
  return data;
}

export async function getCredentials(email: string, token: string) {
  if (!email) return {};
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER}/api/provider-credentials`, {
    params: {
      email
    },
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function getAppToken(clientId: string, clientSecret: string) {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER}/api/sessions/authApplication`,
    {
      params: {
        clientId,
        clientSecret
      }
    }
  );
  return data;
}

export async function getProviders(email: string) {
  if (!email) {
    return null;
  }
  const { data } = await networkClient.get(
    `api/provider-credentials/getProviders`,
    {},
    {
      email
    }
  );
  return data;
}
