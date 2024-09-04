import { TFunction } from 'next-i18next';
import { useMemo } from 'react';
import * as yup from 'yup';

export default function usePasswordScheme(t: TFunction) {
  return useMemo(() => {
    return yup.object().shape({
      password: yup.string().required(t('required_field'))
    });
  }, [t]);
}
