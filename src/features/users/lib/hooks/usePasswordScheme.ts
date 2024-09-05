import { useMemo } from 'react';
import * as yup from 'yup';

type tFn = (k: string) => string;

export default function usePasswordScheme(t: tFn) {
  return useMemo(() => {
    return yup.object().shape({
      password: yup
        .string()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/, t('password_validate')),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], t('password_match'))
        .when('password', {
          is: (password: string) => (password?.length ? true : false),
          then: yup.string().required(t('required_field'))
        })
      //role: yup.number().required(t("required_field"))
    });
  }, [t]);
}
