import DialogTitle from "@/components/dialog/DialogTitle";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField as MuiTextField,
} from "@mui/material";
import { DataGrid, GridCloseIcon, GridColDef } from "@mui/x-data-grid";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { TextField } from "formik-mui";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";

type PricesModalProps = {
  dialogOpen: boolean;
  setDialogOpen: (val: boolean) => void;
};

const PricesModal: React.FC<PricesModalProps> = ({
  dialogOpen,
  setDialogOpen,
}) => {
  const t = useTranslations();
  const [searchText, setSearchText] = React.useState("");
  const [rows, setRows] = React.useState([
    { id: 1, garment: "camisa", price: 120, type: 1 },
    { id: 2, garment: "pantalón", price: 80, type: 2 },
    { id: 3, garment: "chaqueta", price: 150, type: 1 },
    { id: 4, garment: "falda", price: 60, type: 2 },
    { id: 5, garment: "abrigo", price: 200, type: 1 },
    { id: 6, garment: "sombrero", price: 40, type: 3 },
    { id: 7, garment: "bufanda", price: 30, type: 3 },
    { id: 8, garment: "guantes", price: 25, type: 3 },
  ]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 150 },
    {
      field: "garment",
      headerName: "Garment",
      width: 200,
      editable: false,
    },
    {
      field: "price",
      headerName: "Price",
      type: "number",
      width: 200,
      editable: true,
    },
    {
      field: "type",
      headerName: "Type",
      type: "number",
      width: 200,
      editable: true,
    },
  ];

  const handleProcessRowUpdate = (newRow: any) => {
    const updatedRows = rows.map((row) =>
      row.id === newRow.id ? { ...row, ...newRow } : row
    );
    setRows(updatedRows);
    return newRow;
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSubmit = (values: any, actions: FormikHelpers<any>) => {
    actions.setSubmitting(false);
    console.log(rows);
    console.log(values);
  };

  const filteredRows = rows.filter((row) =>
    Object.values(row).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <>
      <Dialog maxWidth="md" onClose={handleDialogClose} open={dialogOpen} fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>{t("prices")}</DialogTitle>
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
          <Formik initialValues={{}} onSubmit={handleSubmit}>
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
              //   useEffect(() => {
              //     if (generalPrices.data) {
              //       setValues(generalPrices.data);
              //     }
              //   }, [generalPrices.data]); // eslint-disable-line react-hooks/exhaustive-deps

              return (
                <>
                  <Form id="pricesForm">
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Field
                          fullWidth
                          autocomplete="off"
                          component={TextField}
                          variant="standard"
                          name={"ironing_discount"}
                          label={t("ironing_discount") + " %"}
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
                    <Box
                      sx={{
                        height: 400,
                        width: "100%",
                        marginTop: 1,
                      }}
                    >
                      <Grid xs={12} sm={6} mb={3}>
                        <MuiTextField
                          label={t("search")}
                          variant="standard"
                          fullWidth
                          onChange={(e) => setSearchText(e.target.value)}
                          value={searchText}
                          />
                          </Grid>
                      <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        processRowUpdate={handleProcessRowUpdate}
                        pagination
                        pageSizeOptions={[10, 25, 50]}
                        // disableColumnFilter
                        disableColumnMenu
                        disableRowSelectionOnClick
                      />
                    </Box>
                  </Form>
                </>
              );
            }}
          </Formik>
        </DialogContent>
        <DialogActions>
          <Button form="pricesForm" type="submit" variant="contained" autoFocus>
            {t("update")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default PricesModal;
