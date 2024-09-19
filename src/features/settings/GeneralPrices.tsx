import { useState } from "react";
import { Button, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import PricesModal from "./PricesModal";

const GeneralPrices = () => {
  const t = useTranslations();
  const [dialogOpen, setDialogOpen] = useState(false);

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
      </Grid>
      <PricesModal dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />
    </>
  );
};

export default GeneralPrices;
