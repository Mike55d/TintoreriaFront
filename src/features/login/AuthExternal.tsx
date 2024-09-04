import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import { CTError } from '../../utils/errors';
import { v4 as uuid } from 'uuid';
import { authExternal } from './lib/api';

const AuthExternal = () => {
  const router = useRouter();

  const authExternalMutation = useMutation<any, CTError, string>((u: string) => authExternal(u));

  const loginExternal = async () => {
    const userApproval = router.query.userApproval;

    const externalSuccess = await authExternalMutation.mutateAsync(userApproval as string);

    window.localStorage.setItem('uuid', uuid());
    window.localStorage.setItem('authToken', externalSuccess.token);
    window.localStorage.setItem('darkMode', '0');
    router.replace('/');
  };

  useEffect(() => {
    if (router.query.userApproval) {
      loginExternal();
    }
  }, [router]);

  return <>Hello world</>;
};

export default AuthExternal;
