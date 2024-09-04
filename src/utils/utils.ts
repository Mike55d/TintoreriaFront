import { v4 as uuidv4 } from 'uuid';
import { User } from '../features/app/lib/types';
import { es, enUS as en } from 'date-fns/locale';

const DeviceIdKey = 'deviceId';

export const HEX_REGEX = /^[A-F0-9]+$/;

export function getDeviceId() {
  if (!localStorage.getItem(DeviceIdKey)) {
    const uuid = uuidv4();
    localStorage.setItem(DeviceIdKey, uuid);
  }
  return localStorage.getItem(DeviceIdKey);
}

export function sleep(seconds: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(0);
    }, seconds);
  });
}

export function checkPermission(permissions?: string[], op?: string) {
  return !!(permissions && permissions.find(x => x.endsWith(`:${op}`)));
}

export function isUrl(str: string | null) {
  if (!str) {
    return false;
  }

  var pattern =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
  return !!pattern.test(str);
}

export function getFileExt(file: string) {
  if (!file || !file.length) {
    return '';
  }

  const sp = file.split('.');
  if (!sp.length) {
    return '';
  }

  return sp.pop();
}

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

export function strToFnsLocale(locale: string) {
  const langs = {es, en} as any;
  return langs[locale] as Locale;
}
