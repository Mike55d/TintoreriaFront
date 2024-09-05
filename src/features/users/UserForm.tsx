import {
  Alert,
  AlertTitle,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  InputAdornment,
  Paper,
  Typography,
} from "@mui/material";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { TextField } from "formik-mui";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import FormikSelect from "../../components/formik-fields/FormikSelect";
import { RootState } from "../../store";
import { CTError, getMessageFromError, SimpleError } from "../../utils/errors";
import User from "./lib/api";
import useUser from "./lib/hooks/useUser";
import useUserScheme from "./lib/hooks/useUserScheme";
import { UserEffectivePermissions, UserStatus } from "./lib/types";
import { DialogConfig } from "../../utils/types";
import Checkbox from "@mui/material/Checkbox";
import { makeStyles } from "@mui/styles";
import useRoles from "./lib/hooks/useRoles";
import { checkPermission } from "../../utils/utils";
import { useTranslations } from "next-intl";

const PasswordField = (props: any) => {
  return <TextField {...props} type="password" style={{ marginBottom: 15 }} />;
};

const useStyles = makeStyles({
  column: {
    paddingRight: 10,
  },
  title: {
    marginBottom: 10,
  },
  showMore: {
    marginTop: 10,
  },
});

export default function UserForm() {
  const t = useTranslations();
  const userScheme = useUserScheme(t);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = router.query;
  const { user } = useSelector((state: RootState) => state.app);
  const [disabled, setDisabled] = useState(false);
  const [mutationError, setMutationError] = useState(null as SimpleError);
  const userQuery = useUser(id ? parseInt(id as string) : undefined);
  const classes = useStyles();
  const roles = useRoles();

  const mutationOptions = {
    onSuccess: () => queryClient.invalidateQueries("users"),
  };

  const postMutation = useMutation<User, CTError, User>(
    (u: User) => User.create(u),
    mutationOptions
  );

  const patchMutation = useMutation<User, CTError, User>(
    (u: User) => User.update(u),
    mutationOptions
  );

  const deleteMutation = useMutation<void, CTError, User>((u) =>
    User.delete(u)
  );

  const [dialogConfig, setDialogConfig] = useState({
    open: false,
  } as DialogConfig);
  const [deleteDialogConfig, setDeleteDialogConfig] = useState({
    open: false,
  } as DialogConfig);

  const formatRoles = useMemo(() => {
    return roles.data?.map((role) => ({ text: t(role.name), value: role.id }));
  }, [roles.data]);

  const handleSubmit = (values: User, actions: FormikHelpers<User>) => {
    setMutationError(null);
    if (!values.id) {
      postMutation.mutate(values, {
        onSuccess: (result: User) => {
          setDialogConfig({
            open: true,
            message: t("success_create_record"),
            onClose: () => {
              setDialogConfig({ open: false });
              router.replace(`/users/${result.id}`);
            },
          });
        },
        onError: (e: CTError) => {
          setMutationError({
            title: t("error_creting_record"),
            message: t(getMessageFromError(e.error)),
          });
        },
        onSettled: () => actions.setSubmitting(false),
      });
    } else {
      patchMutation.mutate(values, {
        onSuccess: () => {
          setDialogConfig({
            open: true,
            message: t("success_update_record"),
            onClose: () => {
              setDialogConfig({ open: false });
              userQuery.refetch();
            },
          });
        },
        onError: (e: CTError) => {
          setMutationError({
            title: t("error_updating_record"),
            message: t(getMessageFromError(e.error)),
          });
        },
        onSettled: () => actions.setSubmitting(false),
      });
    }
  };

  useEffect(() => {
    postMutation.reset();
    userQuery.refetch();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Formik
      initialValues={new User()}
      validationSchema={userScheme}
      onSubmit={handleSubmit}
    >
      {({
        values,
        isSubmitting,
        resetForm,
        submitForm,
        setValues,
        setSubmitting,
      }) => {
        const { id, status, lastConnection, name } = values;

        // eslint-disable-next-line
        useEffect(() => {
          if (userQuery.data) {
            resetForm();
            setValues(userQuery.data);
          }
        }, [userQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

        const handleDeleteRecord = () => {
          setDeleteDialogConfig({
            open: true,
            title: t("delete_record"),
            message: t("question_delete_this_record"),
            onClose: (confirmed: boolean) => {
              setDeleteDialogConfig({
                open: false,
              });

              if (confirmed) {
                setSubmitting(true);
                deleteMutation.mutate(values, {
                  onSuccess: () => {
                    setDialogConfig({
                      open: true,
                      message: t("success_delete_record"),
                      onClose: () => {
                        router.replace("/users");
                      },
                    });
                  },
                  onError: (e: CTError) => {
                    setMutationError({
                      title: t("error_deleting_record"),
                      message: t(getMessageFromError(e.error)),
                    });
                  },
                  onSettled: () => setSubmitting(false),
                });
              }
            },
          });
        };

        return (
          <Form autoComplete="new-user">
            <Container maxWidth="lg" fixed>
              <Grid container spacing={2} paddingRight={2} paddingBottom={2}>
                <Grid container mt={2} component={Paper} p={2}>
                  <Grid item xs={12} className={classes.title}>
                    <Typography variant="h6">{t("basic_data")}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} className={classes.column}>
                    <Field
                      fullWidth
                      component={TextField}
                      name="email"
                      label={t("email")}
                      disabled={disabled}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} className={classes.column}>
                    <Box hidden={!id}>
                      <FormikSelect
                        name="status"
                        id="status"
                        values={[
                          {
                            text: t("active"),
                            value: UserStatus.ACTIVE,
                          },
                          {
                            text: t("inactive"),
                            value: UserStatus.INACTIVE,
                          },
                        ]}
                        readOnly={disabled}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} hidden={!id} marginTop={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography color="textSecondary">
                        {t("name")} : {name ? name : t("no_specified")}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Grid container mt={2} component={Paper} p={2}>
                  <Grid item xs={12} className={classes.title}>
                    <Typography variant="h6">{t("roles")}</Typography>
                  </Grid>
                  <Grid
                    item
                    sm={12}
                    md={6}
                    width={"100%"}
                    className={classes.column}
                  >
                    <Box>
                      <FormikSelect
                        label={t("role")}
                        variant="standard"
                        name="role"
                        id="role"
                        values={formatRoles}
                        readOnly={disabled}
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* <Grid container mt={2} component={Paper} p={2}>
                  <Grid item xs={12} className={classes.title}>
                    <Typography variant="h6">{t('security')}</Typography>
                  </Grid>
                  <Grid item sm={12} md={6} width={'100%'} className={classes.column}>
                    <Field
                      fullWidth
                      component={PasswordField}
                      name="password"
                      label={t('password')}
                      disabled={disabled}
                    />
                  </Grid>
                  <Grid item sm={12} md={6} width={'100%'} className={classes.column}>
                    <Field
                      fullWidth
                      component={PasswordField}
                      name="confirmPassword"
                      label={t('confirm_password')}
                      disabled={disabled}
                    />
                  </Grid>
                </Grid> */}

                <Grid
                  item
                  xs={12}
                  hidden={disabled}
                  display="flex"
                  justifyContent={"flex-end"}
                >
                  <Button color="error" onClick={handleDeleteRecord}>
                    {t("delete")}
                  </Button>
                  <Grid item ml={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        submitForm();
                      }}
                    >
                      {t(id ? "update" : "create")}
                    </Button>
                  </Grid>
                </Grid>

                <Grid
                  item
                  xs={12}
                  component={Collapse}
                  in={!!mutationError}
                  unmountOnExit
                >
                  <Alert severity="error">
                    <AlertTitle>{mutationError?.title}</AlertTitle>
                    {mutationError?.message}
                  </Alert>
                </Grid>
              </Grid>
            </Container>

            <Backdrop
              open={isSubmitting || userQuery.isLoading}
              sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                color: "#fff",
              }}
            >
              <CircularProgress />
            </Backdrop>

            <Dialog
              open={dialogConfig.open}
              keepMounted
              onClose={dialogConfig.onClose}
            >
              <DialogTitle>{dialogConfig.title}</DialogTitle>
              <DialogContent>
                <DialogContentText>{dialogConfig.message}</DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={dialogConfig.onClose}>{t("ok")}</Button>
              </DialogActions>
            </Dialog>

            <Dialog
              open={deleteDialogConfig.open}
              keepMounted
              onClose={() => deleteDialogConfig.onClose!()}
            >
              <DialogTitle>{deleteDialogConfig.title}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {deleteDialogConfig.message}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => deleteDialogConfig.onClose!()}>
                  {t("cancel")}
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => deleteDialogConfig.onClose!(true)}
                >
                  {t("delete")}
                </Button>
              </DialogActions>
            </Dialog>
          </Form>
        );
      }}
    </Formik>
  );
}
