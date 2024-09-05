import networkClient from '../../../networkClient';
import { SettingsType } from '../../tickets/lib/components/ColumnsSection';
import { PasswordForm, UserStatus } from './types';
import sanitizeHtml from 'sanitize-html';
import { SANITIZE_CONFIG } from '../../../components/constants';

export interface UserProfile {
  skipUntrustedRedirect: boolean;
  darkMode: boolean;
  trustedDomains: string[];
  columns: string[];
  take: number;
  signature?: string | null;
}

export default class User {
  id?: number;
  email: string;
  name: string;
  photo: string | null;
  status: UserStatus;
  lastConnection: Date | null;
  profile: UserProfile;
  password?: string;
  confirmPassword?: string;
  verifier?: string;
  salt?: string;
  role: number | string;

  constructor() {
    this.name = '';
    this.email = '';
    this.photo = null;
    this.status = UserStatus.ACTIVE;
    this.lastConnection = null;
    this.profile = {
      skipUntrustedRedirect: false,
      darkMode: false,
      trustedDomains: [],
      columns: [],
      take: 10
    };
    this.password = '';
    this.confirmPassword = '';
    this.role = 1;
  }

  static fromServer(user: Record<string, any>): User {
    return <User>{
      ...user,
      lastConnection: user.lastConnection ? new Date(user.lastConnection) : null
    };
  }

  static async fetchAll() {
    const { data } = await networkClient.get('api/users');
    return data.map((item: User) => User.fromServer(item));
  }

  static async fetchOne(id: number | undefined) {
    if (!id) {
      return new User();
    }
    const { data } = await networkClient.get(`api/users/${id}`);
    return User.fromServer(data);
  }

  static async create(user: User) {
    const { data } = await networkClient.post(`api/users`, {
      email: user.email,
      salt: user.salt,
      verifier: user.verifier,
      roles: [parseInt(user.role as string)]
    });
    return data;
  }

  static async update(user: User) {
    const { data } = await networkClient.patch(`api/users/${user.id}`, {
      email: user.email,
      status: user.status,
      salt: user.salt,
      verifier: user.verifier,
      roles: [parseInt(user.role as string)]
    });
    return data;
  }

  static async updateProfile(profile: UserProfile) {
    await networkClient.patch('api/users/me/profile', {
      ...profile,
      signature: sanitizeHtml(profile.signature ?? '', SANITIZE_CONFIG)
    });
    return profile;
  }

  static async delete(user: User) {
    await networkClient.delete(`api/users/${user.id}`);
  }

  static async updatePassword(idUser: number, password: PasswordForm) {
    const { data } = await networkClient.patch(`api/users/${idUser}/changePassword`, {
      salt: password.salt,
      verifier: password.verifier
    });
    return data;
  }

  static async updateSettings(params: SettingsType) {
    const { data } = await networkClient.patch(`api/users/me/settings`, params);
    return data;
  }

  static async getRoles() {
    const { data } = await networkClient.get(`api/roles`);
    return data;
  }
}
