import { Field, Form, Formik, FormikHelpers } from "formik";
import { useMutation, useQueryClient } from "react-query";
import { useRouter } from "next/router";
import { CTError, getMessageFromError, SimpleError } from "@/utils/errors";
import { useEffect, useMemo, useState } from "react";
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
import * as yup from "yup";
import useCompany from "./lib/hooks/useCompany";
import { CountryType } from "../clients/lib/types";
import Company from "./lib/api";
import FormikSelectField from "@/components/formik-fields/FormikSelect";
import useCurrencies from "../settings/lib/hooks/useCurrencies";

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

const CompaniesForm = () => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = router.query;
  const classes = useStyles();
  const companyQuery = useCompany(id ? parseInt(id as string) : undefined);
  const { data: currencies } = useCurrencies();
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
    brand: yup.string().max(64).required(t("required_field")),
    address: yup.string().max(2000).required(t("required_field")),
    email: yup.string().max(64).email().required(t("required_field")),
    personName: yup.string().max(64).required(t("required_field")),
    personEmail: yup.string().max(64).email().required(t("required_field")),
  });

  const mutationOptions = {
    onSuccess: () => queryClient.invalidateQueries("company"),
  };

  const postMutation = useMutation<Company, CTError, Company>(
    (u: Company) => Company.create(u),
    mutationOptions
  );

  const patchMutation = useMutation<Company, CTError, Company>(
    (u: Company) => Company.update(u),
    mutationOptions
  );

  const deleteMutation = useMutation<void, CTError, Company>((u) =>
    Company.delete(u)
  );

  const handleAutocompleteTextChangeCountry = (value: string) => {
    setCountrySearch(value);
  };

  const handleSetSelectedCountry = (value: any) => {
    setSelectedCountry(value);
  };

  const handleSubmit = (values: Company, actions: FormikHelpers<Company>) => {
    setMutationError(null);
    values.country = selectedCountry ? selectedCountry.alpha2 : null;
    if (!values.id) {
      postMutation.mutate(values, {
        onSuccess: (result: Company) => {
          setDialogConfig({
            open: true,
            message: t("success_create_record"),
            onClose: () => {
              router.replace(`/companies/${result.id}`);
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
              companyQuery.refetch();
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

  const currenciesFormat = useMemo(() => {
    return currencies?.map((currency) => ({
      text: currency.name,
      value: currency.id,
    }));
  }, [currencies]);

  if (id && !companyQuery.data) return null;

  return (
    <>
      <Formik
        initialValues={new Company()}
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
            if (companyQuery.data) {
              console.log(companyQuery.data);
              resetForm();
              setValues(companyQuery.data);
              if (companyQuery.data.country) {
                let objCountry = countries.find(
                  (x) => x.alpha2 == companyQuery.data.country
                );
                handleSetSelectedCountry(objCountry);
              }
            }
          }, [companyQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

          useEffect(()=> {
            console.log(values);
          },[values])

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
                      <Typography variant="h6">{t("company_data")}</Typography>
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
                        name="brand"
                        label={t("brand")}
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
                        name="email"
                        label={t("email")}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.column}>
                      <Field
                        fullWidth
                        component={TextField}
                        variant="standard"
                        name="personName"
                        label={t("personName")}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} className={classes.column}>
                      <Field
                        fullWidth
                        component={TextField}
                        variant="standard"
                        name="personEmail"
                        label={t("personEmail")}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormikSelectField
                        label={t("preferred_currency")}
                        variant="standard"
                        name="currencyId"
                        id="currencyId"
                        hideDefault
                        values={currenciesFormat}
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
                open={isSubmitting || companyQuery.isLoading}
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

export default CompaniesForm;
