import { useQuery } from 'react-query';

import { CTError } from '../../../../utils/errors';
import User from '../api';
import { Role } from '../types';

export default function useRoles() {
  return useQuery<Role[], CTError>(['roles'], User.getRoles);
}
