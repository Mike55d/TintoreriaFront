import networkClient from '../../../../networkClient';
import Ticket from '../../../tickets/lib/api';

export class Notification {
  id?: number;
  title: string;
  body: string;
  seen: boolean;
  ticket: Ticket;

  constructor() {
    this.title = '';
    this.body = '';
    this.seen = false;
    this.ticket = new Ticket();
  }

  static async setDeviceToken(fcmToken: string) {
    const { data } = await networkClient.patch('api/users/me/deviceToken', {
      token: fcmToken
    });
    return data;
  }

  static async fetchAll() {
    const { data } = await networkClient.get(`api/notifications`);
    return data;
  }

  static async viewedNotifications() {
    const { data } = await networkClient.get(`api/notifications/viewedNotifications/view`);
    return data;
  }
}
