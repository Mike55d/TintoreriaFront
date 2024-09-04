import { MsalAuthenticationTemplate, useMsal } from '@azure/msal-react';
import {
  InteractionStatus,
  InteractionType,
  InteractionRequiredAuthError,
  AccountInfo
} from '@azure/msal-browser';
import React, { useEffect, useState } from 'react';
import { Paper, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { callMsGraph } from '@/msGraphApiCall';
import { loginRequest } from '@/authConfig';

const ProfileContent = () => {
  const { instance, inProgress } = useMsal();
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    const mstoken = window.localStorage.getItem('mstoken');
    if (!mstoken || (!graphData && inProgress === InteractionStatus.None)) {
      callMsGraph()
        .then((response: any) => {
          console.log('RESPONSE: ', response);
          setGraphData(response);
        })
        .catch(e => {
          console.log(e);
          if (e instanceof InteractionRequiredAuthError) {
            instance.acquireTokenRedirect({
              ...loginRequest,
              account: instance.getActiveAccount() as AccountInfo
            });
          }
        });
    } else {
      location.href = '/';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inProgress, graphData, instance]);

  return <div>Cargando...</div>;
};

const ErrorComponent = (res: any) => {
  return <Typography variant="h6">ERROR: {res.error.errorCode}</Typography>;
};

const Loading = () => {
  return <Typography variant="h6">Iniciando sesión...</Typography>;
};

export default function Profile() {
  const authRequest = {
    ...loginRequest
  };

  return (
    <MsalAuthenticationTemplate
      interactionType={InteractionType.Redirect}
      authenticationRequest={authRequest}
      errorComponent={ErrorComponent}
      loadingComponent={Loading}
    >
      <ProfileContent />
    </MsalAuthenticationTemplate>
  );
}
