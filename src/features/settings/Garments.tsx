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
import { Field, FieldProps, Formik, FormikHelpers } from "formik";
import { TextField } from "formik-mui";
import { useTranslations } from "next-intl";
import useReactTableLang from "@/utils/useReactTableLang";
import useGarments from "./lib/hooks/useGarments";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { CTError } from "@/utils/errors";
import { Garment } from "./lib/api";
import useCurrencies from "./lib/hooks/useCurrencies";
import FormikSelectField from "@/components/formik-fields/FormikSelect";

const NumericField = (props: FieldProps<any>) => (
  <TextField {...props} type="number" />
);

const Garments = () => {
  const t = useTranslations();
  const reactTableLang = useReactTableLang();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Garment | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarType, setSnackbarType] = useState<AlertColor>("success");
  const garments = useGarments();
  const currencies = useCurrencies();

  const mutationOptions = {
    onSuccess: () => queryClient.invalidateQueries("garments"),
  };

  const handleGarmentClick = (garment: Garment) => {
    setCurrentRecord(garment);
    setDialogOpen(true);
  };

  const handleAddGarment = () => {
    setCurrentRecord(new Garment());
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const postMutation = useMutation<Garment, CTError, Garment>(
    (u: Garment) => Garment.create(u),
    mutationOptions
  );

  const patchMutation = useMutation<Garment, CTError, Garment>(
    (u: Garment) => Garment.update(u),
    mutationOptions
  );

  const deleteMutation = useMutation<Garment, CTError, Garment>(
    (u: Garment) => Garment.delete(u),
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

  const columns = useMemo(
    () => [
      {
        Header: t("id"),
        accessor: (row: Garment) => (
          <MuiLink
            sx={{ cursor: "pointer" }}
            onClick={() => handleGarmentClick(row)}
          >
            {row.id}
          </MuiLink>
        ),
      },
      {
        Header: t("name"),
        accessor: "name",
      },
    ],
    [t] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSubmit = async (
    values: Garment,
    actions: FormikHelpers<Garment>
  ) => {
    values.prices = values.prices
      .filter((price) => price.price && price.type)
      .map((price) => ({
        ...price,
        type: parseInt(price.type as string),
      }));
    if (!values.id) {
      postMutation.mutate(values, {
        onSuccess: (result: Garment) => {
          garments.refetch();
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
        onSuccess: (result: Garment) => {
          garments.refetch();
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
      onSuccess: (result: Garment) => {
        garments.refetch();
        setDialogOpen(false);
      },
      onError: (e: CTError) => {},
      onSettled: () => setSubmitting(false),
    });
  };

  return (
    <>
      <Grid container component={Paper} padding={2} marginTop={4}>
        {garments.isLoading && <LinearProgress />}
        <Grid item xs={12}>
          <Stack direction={"row"}>
            <Grid item xs>
              <Typography variant="h6">{t("garments")}</Typography>
            </Grid>
            <Grid item marginRight={1}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddGarment}
              >
                {t("create")}
              </Button>
            </Grid>
          </Stack>
        </Grid>

        <ReactTable
          columns={columns}
          data={garments.data ?? []}
          options={{ filtering: false, paging: false }}
          lang={reactTableLang}
        />
        <Grid item xs={12} marginRight={1}></Grid>

        {/*       DIÁLOGO DE CREACIÓN / ACTUALIZACIÓN      */}
        <Formik initialValues={new Garment()} onSubmit={handleSubmit}>
          {({
            values,
            isSubmitting,
            resetForm,
            submitForm,
            setValues,
            setSubmitting,
            errors,
            setFieldValue,
          }) => {
            // eslint-disable-next-line
            useEffect(() => {
              if (!dialogOpen) {
                resetForm();
              } else {
                if (currentRecord) {
                  const prices = currencies.data?.map((currency) => {
                    const price = currentRecord?.prices.find(
                      (price) => price.currency?.id == currency.id
                    );
                    return price
                      ? { ...price, currencyId: currency.id as number }
                      : {
                          currency,
                          currencyId: currency.id as number,
                          price: undefined,
                          type: 1,
                        };
                  });
                  setValues({ ...currentRecord, prices: prices ?? [] });
                }
              }
            }, [dialogOpen]); // eslint-disable-line react-hooks/exhaustive-deps

            return (
              <Dialog onClose={handleDialogClose} open={dialogOpen} fullWidth>
                <DialogTitle sx={{ m: 0, p: 2 }}>
                  {t("new_garment")}
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
                    {values.prices?.map((price, i) => (
                      <Grid container xs={12} key={i}>
                        <Grid item xs={12} sm={6}>
                          <Field
                            fullWidth
                            autocomplete="off"
                            component={NumericField}
                            variant="standard"
                            name={`prices[${i}].price`}
                            label={`${t("price")} ${price.currency?.name}`}
                          />
                        </Grid>
                        <Grid item xs={12} sm={.8}>
                          <FormikSelectField
                            // label={t("type")}
                            variant="standard"
                            name={`prices[${i}].type`}
                            id="type"
                            hideDefault
                            values={[
                              { text: "%", value: 0 },
                              { text: price.currency?.sign, value: 1 },
                            ]}
                          />
                        </Grid>
                      </Grid>
                    ))}
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

export default Garments;
