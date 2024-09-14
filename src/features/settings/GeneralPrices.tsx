import { Field, Formik, FormikHelpers } from "formik";
import { useEffect, useState } from "react";
import { GeneralPrice } from "./lib/api";
import {
  Alert,
  AlertColor,
  Button,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "react-query";
import { CTError } from "@/utils/errors";
import useGeneralPrices from "./lib/hooks/useGeneralPrices";
import { TextField } from "formik-mui";

const GeneralPrices = () => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const generalPrices = useGeneralPrices();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarText, setSnackbarText] = useState("");
  const [snackbarType, setSnackbarType] = useState<AlertColor>("success");

  const mutationOptions = {
    onSuccess: () => queryClient.invalidateQueries("garments"),
  };

  const setSnackbarMessage = (
    message: string,
    type: AlertColor = "success"
  ) => {
    setSnackbarType(type);
    setSnackbarText(message);
    setSnackbarOpen(true);
  };

  const postMutation = useMutation<GeneralPrice, CTError, GeneralPrice>(
    (u: GeneralPrice) => GeneralPrice.create(u),
    mutationOptions
  );

  const handleSubmit = async (
    values: GeneralPrice,
    actions: FormikHelpers<GeneralPrice>
  ) => {
    postMutation.mutate(values, {
      onSuccess: (result: GeneralPrice) => {
        generalPrices.refetch();
        setDialogOpen(false);
        setSnackbarMessage(t("success_add_record"));
      },
      onError: (e: CTError) => {
        setSnackbarMessage(t("error_add_record"), "error");
      },
      onSettled: () => actions.setSubmitting(false),
    });
  };
  if (generalPrices.isLoading) return <LinearProgress />;

  return (
    <>
      <Grid container component={Paper} padding={2} marginTop={4}>
        <Grid item xs={12}>
          <Stack direction={"row"}>
            <Grid item xs>
              <Typography variant="h6">{t("general_prices")}</Typography>
            </Grid>
          </Stack>
        </Grid>
        <Formik
          initialValues={
            generalPrices.data ? generalPrices.data : new GeneralPrice()
          }
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
            setFieldValue,
          }) => {
            // eslint-disable-next-line
            useEffect(() => {
              if (generalPrices.data) {
                setValues(generalPrices.data);
              }
            }, [generalPrices.data]); // eslint-disable-line react-hooks/exhaustive-deps

            return (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      fullWidth
                      autocomplete="off"
                      component={TextField}
                      variant="standard"
                      name={"ironing_discount"}
                      label={t("ironing_discount")+' %'}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      fullWidth
                      autocomplete="off"
                      component={TextField}
                      variant="standard"
                      name={"general_price"}
                      label={t("general_price")}
                    />
                  </Grid>
                </Grid>
                <Divider sx={{ marginTop: 2, width: "100%" }} />
                <Grid
                  item
                  xs={12}
                  display="flex"
                  justifyContent={"flex-end"}
                  mt={2}
                >
                  <Grid item ml={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        submitForm();
                      }}
                    >
                      {t("update")}
                    </Button>
                  </Grid>
                </Grid>
              </>
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

export default GeneralPrices;
