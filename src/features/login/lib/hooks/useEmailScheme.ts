import { TFunction } from 'next-i18next';
import { useMemo } from 'react';
import * as yup from 'yup';

export default function useEMailScheme(t: TFunction) {
  return useMemo(() => {
    return yup.object().shape({
      email: yup.string().required(t('required_field'))
      // password: yup.string().required(t('required_field'))
    });
  }, [t]);
}
