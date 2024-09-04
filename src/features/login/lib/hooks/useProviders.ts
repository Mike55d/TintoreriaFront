import { useQuery } from 'react-query';
import { CTError } from '../../../../utils/errors';
import { getProviders } from '../api';

export function useProviders(email: string) {
  return useQuery<{ authtype: number }, CTError>(['authProviders', email], () =>
    getProviders(email)
  );
}
