import { useQuery } from 'react-query';

import { CTError } from '../../../../utils/errors';
import { Notification } from './api';

export default function useNotifications() {
  return useQuery<Notification[], CTError>('notifications', () => Notification.fetchAll());
}
