import { Field, Form, Formik, FormikHelpers } from "formik";
import Client from "./lib/api";
import { useMutation, useQueryClient } from "react-query";
import { useRouter } from "next/router";
import { CTError, getMessageFromError, SimpleError } from "@/utils/errors";
import { useEffect, useState } from "react";
import useClient from "./lib/hooks/useClient";
import { DialogConfig } from "@/utils/types";
import { useTranslations } from "next-intl";
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
  Grid,
  Paper,
  Typography,
  TextField as MUITextField,
  Autocomplete,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { TextField } from "formik-mui";
import DialogTitle from "@/components/dialog/DialogTitle";
import countries from "../../../public/countries.json";
import { CountryType } from "./lib/types";
import * as yup from "yup";
import { useCompanies } from "../companies/lib/hooks/useCompanies";

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

const CLientsForm = () => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = router.query;
  const classes = useStyles();
  const { data: companies } = useCompanies();
  const clientQuery = useClient(id ? parseInt(id as string) : undefined);
  const [countrySearch, setCountrySearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryType | null>(
    null
  );
  const [mutationError, setMutationError] = useState(null as SimpleError);
  const [dialogConfig, setDialogConfig] = useState({
    open: false,
  } as DialogConfig);
  const [deleteDialogConfig, setDeleteDialogConfig] = useState({
    open: false,
  } as DialogConfig);

  const validationSchema = yup.object().shape({
    name: yup.string().max(64).required(t("required_field")),
    lastname: yup.string().max(64).required(t("required_field")),
    phone: yup.string().max(64).required(t("required_field")),
    address: yup.string().max(2000).required(t("required_field")),
    email: yup.string().max(64).email().required(t("required_field")),
    postalCode: yup.string().max(64).required(t("required_field")),
    rfc: yup.string().max(2000).required(t("required_field")),
    companies:yup.array().nullable()
  });

  const mutationOptions = {
    onSuccess: () => queryClient.invalidateQueries("users"),
  };

  const postMutation = useMutation<Client, CTError, Client>(
    (u: Client) => Client.create(u),
    mutationOptions
  );

  const patchMutation = useMutation<Client, CTError, Client>(
    (u: Client) => Client.update(u),
    mutationOptions
  );

  const deleteMutation = useMutation<void, CTError, Client>((u) =>
    Client.delete(u)
  );

  const handleAutocompleteTextChangeCountry = (value: string) => {
    setCountrySearch(value);
  };

  const handleSetSelectedCountry = (value: any) => {
    setSelectedCountry(value);
  };

  const handleSubmit = (values: Client, actions: FormikHelpers<Client>) => {
    console.log(values);
    setMutationError(null);
    values.country = selectedCountry ? selectedCountry.alpha2 : null;
    if (!values.id) {
      postMutation.mutate(values, {
        onSuccess: (result: Client) => {
          setDialogConfig({
            open: true,
            message: t("success_create_record"),
            onClose: () => {
              router.replace(`/clients/${result.id}`);
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
              clientQuery.refetch();
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

  if (id && !clientQuery.data) return null;

  return (
    <>
      <Formik
        initialValues={new Client()}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {({
          values,
          isSubmitting,
          resetForm,
          submitForm,
          setValues,
          setSubmitting,
        }) => {
          // eslint-disable-next-line
          useEffect(() => {
            if (clientQuery.data) {
              console.log(clientQuery.data);
              resetForm();
              setValues(clientQuery.data);
              if (clientQuery.data.country) {
                let objCountry = countries.find(
                  (x) => x.alpha2 == clientQuery.data.country
                );
                handleSetSelectedCountry(objCountry);
              }
            }
          }, [clientQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

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
                  <Grid container mt={2} component={Paper} p={2} spacing={2}>
                    <Grid item xs={12} className={classes.title}>
                      <Typography variant="h6">{t("client_data")}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.column}>
                      <Field
                        fullWidth
                        component={TextField}
                        variant="standard"
                        name="name"
                        label={t("name")}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.column}>
                      <Field
                        fullWidth
                        component={TextField}
                        variant="standard"
                        name="lastname"
                        label={t("lastname")}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.column}>
                      <Field
                        fullWidth
                        component={TextField}
                        variant="standard"
                        name="email"
                        label={t("email")}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.column}>
                      <Field
                        fullWidth
                        component={TextField}
                        variant="standard"
                        name="address"
                        label={t("address")}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.column}>
                      <Field
                        fullWidth
                        component={TextField}
                        variant="standard"
                        name="phone"
                        label={t("phone")}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Autocomplete
                        isOptionEqualToValue={(option: any, value: any) =>
                          option.id == value.id
                        }
                        multiple
                        disablePortal
                        fullWidth
                        options={companies?.data ?? []}
                        getOptionLabel={(option) => option.name}
                        value={values.companies}
                        onChange={(_: any, newValue: any | null) => {
                          setValues({ ...values, companies: newValue });
                        }}
                        renderInput={(params) => (
                          <MUITextField
                            {...params}
                            label={t("companies")}
                            variant="standard"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Autocomplete
                        disablePortal
                        fullWidth
                        options={countries}
                        sx={{ mt: 2 }}
                        getOptionLabel={(option) => option.es}
                        value={selectedCountry}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value?.id
                        }
                        onChange={(_: any, newValue: any | null) => {
                          setSelectedCountry(newValue);
                        }}
                        renderOption={(props, option) => (
                          <Box component="li" {...props}>
                            <Grid container spacing={2}>
                              <Grid item>
                                <img
                                  width="20"
                                  src={`/locales/country-flags/24x24/${option.alpha2}.png`}
                                  alt=""
                                />
                              </Grid>

                              <Grid item>{option.es}</Grid>
                            </Grid>
                          </Box>
                        )}
                        renderInput={(params) => (
                          <MUITextField
                            {...params}
                            fullWidth
                            name="country"
                            variant="standard"
                            value={countrySearch}
                            onChange={(e) =>
                              handleAutocompleteTextChangeCountry(
                                e.target.value
                              )
                            }
                            placeholder={t("country")}
                            inputProps={{
                              ...params.inputProps,
                              autoComplete: "new-password", // disable autocomplete and autofill
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.column}>
                      <Field
                        fullWidth
                        component={TextField}
                        variant="standard"
                        name="postalCode"
                        label={t("postalCode")}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.column}>
                      <Field
                        fullWidth
                        component={TextField}
                        variant="standard"
                        name="rfc"
                        label={t("rfc")}
                      />
                    </Grid>
                  </Grid>

                  <Grid item xs={12} display="flex" justifyContent={"flex-end"}>
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
                open={isSubmitting || clientQuery.isLoading}
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
    </>
  );
};

export default CLientsForm;
