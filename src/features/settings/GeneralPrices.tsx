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
import PricesModal from "./PricesModal";
import { GeneralPriceForm } from "./lib/types";

const GeneralPrices = () => {
  const t = useTranslations();
  const queryClient = useQueryClient();
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

  const postMutation = useMutation<GeneralPrice, CTError, GeneralPriceForm>(
    (u: GeneralPriceForm) => GeneralPrice.create(u),
    mutationOptions
  );

  return (
    <>
      <Grid container component={Paper} padding={2} marginTop={4}>
        <Grid item xs={12}>
          <Stack direction={"row"}>
            <Grid item xs>
              <Typography variant="h6">{t("prices")}</Typography>
            </Grid>
          </Stack>
        </Grid>
        <Divider sx={{ marginTop: 2, width: "100%" }} />
        <Grid item xs={12} display="flex" justifyContent={"flex-end"} mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDialogOpen(true)}
          >
            {t("edit")}
          </Button>
        </Grid>
        <Snackbar open={snackbarOpen} autoHideDuration={3000}>
          <Alert severity={snackbarType}>{snackbarText}</Alert>
        </Snackbar>
      </Grid>
      <PricesModal dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />
    </>
  );
};

export default GeneralPrices;
