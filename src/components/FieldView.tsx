import { Grid, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

export interface FieldViewProps {
  children: any;
  title: string;
}

export default function FieldView(props: FieldViewProps) {
  const t = useTranslations("HomePage");
  return props.children ? (
    <Grid item xs={12} sm={6}>
      <Grid container>
        <Grid item xs={12} md={4}>
          <Typography sx={{ fontWeight: "bold" }}>{t(props.title)}</Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography>{props.children}</Typography>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <></>
  );
}
