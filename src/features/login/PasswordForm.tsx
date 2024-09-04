import {
  Alert,
  AlertTitle,
  Backdrop,
  Button,
  CircularProgress,
  Collapse,
  Grid
} from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@mui/styles';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { TextField } from 'formik-mui';
import { useMutation } from 'react-query';
import { CTError, SimpleError, getMessageFromError } from '../../utils/errors';
import { StartSession, StartSessionSuccess, ConfirmSession, PasswordFormType } from './lib/types';
import { confirmSession, startSession } from './lib/api';
import srp from 'secure-remote-password/client';
import { v4 as uuid } from 'uuid';
import usePasswordScheme from './lib/hooks/usePasswordScheme';

const useStyles = makeStyles((theme: any) => ({
  blue: {
    height: 52,
    marginTop: 10
  },
  imgContainer: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    height: '100%',
    width: '100%',
    [theme.breakpoints.up(750)]: {
      height: '40%',
      width: '40%'
    }
  }
}));

const PasswordField = (props: any) => {
  return <TextField {...props} type="password" style={{ marginTop: 10 }} />;
};

const initialValues = {
  password: ''
};

type FormPasswordType = {
  email: string;
};

export default function PasswordForm({ email }: FormPasswordType) {
  const classes = useStyles();
  const { t } = useTranslation('common');
  const signInScheme = usePasswordScheme(t);
  const [mutationError, setMutationError] = useState<SimpleError | null>(null);
  const startSessionMutation = useMutation<StartSessionSuccess, CTError, StartSession>(
    (u: StartSession) => startSession(u)
  );
  const router = useRouter();

  const confirmSessionMutation = useMutation<any, CTError, ConfirmSession>((u: ConfirmSession) =>
    confirmSession(u)
  );

  const handleSubmit = async (
    values: PasswordFormType,
    actions: FormikHelpers<PasswordFormType>
  ) => {
    const clientEphemeral = srp.generateEphemeral();
    try {
      const startSessionSuccess = await startSessionMutation.mutateAsync({
        username: email,
        clientEphemeral: clientEphemeral.public
      });

      const privateKey = srp.derivePrivateKey(startSessionSuccess.salt, email, values.password);

      const clientSession = srp.deriveSession(
        clientEphemeral.secret,
        startSessionSuccess.serverEphemeral,
        startSessionSuccess.salt,
        email,
        privateKey
      );
      const confirmSessionSuccess = await confirmSessionMutation.mutateAsync({
        clientSessionProof: clientSession.proof,
        presessionId: startSessionSuccess.presessionId
      });
      if (confirmSessionSuccess) {
        window.localStorage.setItem('uuid', uuid());
        window.localStorage.setItem('authToken', confirmSessionSuccess.token);
        window.localStorage.setItem('darkMode', '0');
        router.replace('/');
      }
    } catch (e: any) {
      setMutationError({
        title: t('invalid_credentials'),
        message: t(getMessageFromError(e.error))
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <>
      <Grid item xs={12} marginBottom={4}>
        <Formik
          initialValues={initialValues}
          validationSchema={signInScheme}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <>
              <Form>
                <Field fullWidth component={PasswordField} name="password" label={t('password')} />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                  className={classes.blue}
                >
                  Sign In
                </Button>
              </Form>
              <Backdrop
                open={isSubmitting}
                sx={{
                  zIndex: theme => theme.zIndex.drawer + 1,
                  color: '#fff'
                }}
              >
                <CircularProgress />
              </Backdrop>
              <Grid item xs={12} component={Collapse} in={!!mutationError} unmountOnExit>
                <Alert severity={mutationError?.type || 'error'}>
                  <AlertTitle>{mutationError?.title}</AlertTitle>
                  {mutationError?.message}
                </Alert>
              </Grid>
            </>
          )}
        </Formik>
      </Grid>
    </>
  );
}
