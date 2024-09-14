import DialogTitle from "@/components/dialog/DialogTitle";
import ReactTable from "@/components/table/ReactTable";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
  Link as MuiLink,
  AlertColor,
} from "@mui/material";
import { GridCloseIcon } from "@mui/x-data-grid";
import { Field, Formik, FormikHelpers } from "formik";
import { TextField } from "formik-mui";
import { useTranslations } from "next-intl";
import useReactTableLang from "@/utils/useReactTableLang";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { CTError } from "@/utils/errors";
import useCurrencies from "./lib/hooks/useCurrencies";
import * as yup from "yup";
import { Currency } from "./lib/api";

const Currencies = () => {
  const t = useTranslations();
  const reactTableLang = useReactTableLang();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Currency | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarType, setSnackbarType] = useState<AlertColor>("success");
  const currencies = useCurrencies();

  const mutationOptions = {
    onSuccess: () => queryClient.invalidateQueries("currencies"),
  };

  const handleCurrencyClick = (currency: Currency) => {
    setCurrentRecord(currency);
    setDialogOpen(true);
  };

  const handleAddCurrency = () => {
    setCurrentRecord(new Currency());
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const postMutation = useMutation<Currency, CTError, Currency>(
    (u: Currency) => Currency.create(u),
    mutationOptions
  );

  const patchMutation = useMutation<Currency, CTError, Currency>(
    (u: Currency) => Currency.update(u),
    mutationOptions
  );

  const deleteMutation = useMutation<Currency, CTError, Currency>(
    (u: Currency) => Currency.delete(u),
    mutationOptions
  );

  const setSnackbarMessage = (
    message: string,
    type: AlertColor = "success"
  ) => {
    setSnackbarType(type);
    setSnackbarText(message);
    setSnackbarOpen(true);
  };

  const validationSchema = yup.object().shape({
    name: yup.string().max(64).required(t("required_field")),
    code: yup.string().max(3).required(t("required_field")),
    sign: yup.string().max(1).required(t("required_field")),
  });

  const columns = useMemo(
    () => [
      {
        Header: t("name"),
        accessor: (row: Currency) => (
          <MuiLink
            sx={{ cursor: "pointer" }}
            onClick={() => handleCurrencyClick(row)}
          >
            {row.name}
          </MuiLink>
        ),
      },
      {
        Header: t("code"),
        accessor: "code",
      },
      {
        Header: t("sign"),
        accessor: "sign",
      },
    ],
    [t] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSubmit = async (
    values: Currency,
    actions: FormikHelpers<Currency>
  ) => {
    console.log(values);
    if (!values.id) {
      postMutation.mutate(values, {
        onSuccess: (result: Currency) => {
          currencies.refetch();
          setDialogOpen(false);
          setSnackbarMessage(t("success_add_record"));
        },
        onError: (e: CTError) => {
          setSnackbarMessage(t("error_add_record"), "error");
        },
        onSettled: () => actions.setSubmitting(false),
      });
    } else {
      patchMutation.mutate(values, {
        onSuccess: (result: Currency) => {
          currencies.refetch();
          setDialogOpen(false);
        },
        onError: (e: CTError) => {},
        onSettled: () => actions.setSubmitting(false),
      });
    }
  };

  const handleDeleteRecord = async (
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    if (!currentRecord) return;
    setSubmitting(true);
    deleteMutation.mutate(currentRecord, {
      onSuccess: (result: Currency) => {
        currencies.refetch();
        setDialogOpen(false);
      },
      onError: (e: CTError) => {},
      onSettled: () => setSubmitting(false),
    });
  };

  return (
    <>
      <Grid container component={Paper} padding={2} marginTop={4}>
        {currencies.isLoading && <LinearProgress />}
        <Grid item xs={12}>
          <Stack direction={"row"}>
            <Grid item xs>
              <Typography variant="h6">{t("currencies")}</Typography>
            </Grid>
            <Grid item marginRight={1}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddCurrency}
              >
                {t("create")}
              </Button>
            </Grid>
          </Stack>
        </Grid>

        <ReactTable
          columns={columns}
          data={currencies.data ?? []}
          options={{ filtering: false, paging: false }}
          lang={reactTableLang}
        />
        <Grid item xs={12} marginRight={1}></Grid>

        {/*       DIÁLOGO DE CREACIÓN / ACTUALIZACIÓN      */}
        <Formik
          initialValues={new Currency()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            isSubmitting,
            resetForm,
            submitForm,
            setValues,
            setSubmitting,
            errors,
          }) => {
            // eslint-disable-next-line
            useEffect(() => {
              resetForm();
              if (currentRecord) {
                setValues(currentRecord);
              }
            }, [dialogOpen]); // eslint-disable-line react-hooks/exhaustive-deps

            return (
              <Dialog onClose={handleDialogClose} open={dialogOpen} fullWidth>
                <DialogTitle sx={{ m: 0, p: 2 }}>
                  {t("new_currency")}
                </DialogTitle>
                <IconButton
                  onClick={handleDialogClose}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <GridCloseIcon />
                </IconButton>
                <DialogContent dividers>
                  <Grid container>
                    <Grid item xs={12}>
                      <Field
                        fullWidth
                        autoComplete="off"
                        component={TextField}
                        variant="standard"
                        name="name"
                        label={t("name")}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        fullWidth
                        autoComplete="off"
                        component={TextField}
                        variant="standard"
                        name="code"
                        label={t("code")}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        fullWidth
                        autoComplete="off"
                        component={TextField}
                        variant="standard"
                        name="sign"
                        label={t("sign")}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  {currentRecord?.id && (
                    <Button
                      variant="contained"
                      color="error"
                      autoFocus
                      onClick={() => handleDeleteRecord(setSubmitting)}
                      disabled={
                        postMutation.isLoading || patchMutation.isLoading
                      }
                    >
                      {t("delete")}
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    autoFocus
                    onClick={submitForm}
                    disabled={postMutation.isLoading || patchMutation.isLoading}
                  >
                    {t("save")}
                  </Button>
                </DialogActions>
              </Dialog>
            );
          }}
        </Formik>

        <Snackbar open={snackbarOpen} autoHideDuration={3000}>
          <Alert severity={snackbarType}>{snackbarText}</Alert>
        </Snackbar>
      </Grid>
    </>
  );
};

export default Currencies;
