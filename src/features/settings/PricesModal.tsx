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
  FormHelperText,
  Autocomplete,
} from "@mui/material";
import { DataGrid, GridCloseIcon, GridColDef } from "@mui/x-data-grid";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { TextField } from "formik-mui";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import useCurrencies from "./lib/hooks/useCurrencies";
import { Currency } from "./lib/api";
import useGeneralPrices from "./lib/hooks/useGeneralPrices";
import SelectInputGrid from "./lib/components/SelectInputGrid";
import { GarmentWithPrice } from "./lib/types";

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
  const { data: currencies } = useCurrencies();
  const [selectedCurency, setSelectedCurency] = useState<Currency | null>(null);
  const { data: generalPrices } = useGeneralPrices(selectedCurency?.id ?? 0);
  const [rows, setRows] = React.useState<GarmentWithPrice[]>([]);
  const [editedRows, setEditedRows] = React.useState<GarmentWithPrice[]>([]);

  const columns: GridColDef[] = [
    { field: "id", headerName: t("id"), width: 150 },
    {
      field: "name",
      headerName: t("name"),
      width: 320,
      editable: false,
    },
    {
      field: "price",
      headerName: t("price"),
      type: "number",
      width: 200,
      editable: true,
    },
    {
      field: "type",
      headerName: t("type"),
      type: "number",
      width: 100,
      editable: true,
      renderEditCell: (params) => (
        <SelectInputGrid props={params} selectedCurrency={selectedCurency} />
      ),
      renderCell: (params) => (
        <>
          {params.row.type != null
            ? params.row.type == 0
              ? "%"
              : selectedCurency?.code
            : null}
        </>
      ),
    },
  ];

  const handleProcessRowUpdate = (newRow: any) => {
    const updatedRows = rows.map((row) =>
      row.id === newRow.id ? { ...row, ...newRow } : row
    );
    setRows(updatedRows);
    let newEditRows = editedRows;
    const index = editedRows.findIndex(
      (row) => row.currencyId == selectedCurency?.id && row.id == newRow.id
    );
    if (index != -1) {
      newEditRows[index] = { ...newEditRows[index], ...newRow };
    } else {
      newEditRows.push(newRow);
    }
    setEditedRows(newEditRows);
    return newRow;
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSubmit = (values: any, actions: FormikHelpers<any>) => {
    actions.setSubmitting(false);
    console.log(values);
    console.log(editedRows);
  };

  const filteredRows = rows.filter((row) =>
    Object.values(row).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  useEffect(() => {
    if (generalPrices?.garmentsWithPrice?.length) {
      const editedRowsCurrency = editedRows.filter(
        (row) => row.currencyId == selectedCurency?.id
      );
      if (editedRowsCurrency.length) {
        const newRows = generalPrices.garmentsWithPrice.map(
          (garmentWithPrice) => {
            const editedValue = editedRowsCurrency.find(
              (editedRow) => editedRow.id == garmentWithPrice.id
            );
            return editedValue ?? garmentWithPrice;
          }
        );
        setRows(newRows);
      } else {
        setRows(generalPrices.garmentsWithPrice);
      }
    }
  }, [generalPrices]);

  // useEffect(() => {
  //   console.log(selectedCurency);
  // }, [selectedCurency]);

  return (
    <>
      <Dialog
        maxWidth="md"
        onClose={handleDialogClose}
        open={dialogOpen}
        fullWidth
      >
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
          <Formik initialValues={{ currencyId: null }} onSubmit={handleSubmit}>
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
                    <Grid
                      container
                      spacing={2}
                      component={Paper}
                      padding={2}
                      mt={1}
                    >
                      <Grid item xs={12} sm={12} style={{ paddingTop: 0 }}>
                        <Autocomplete
                          isOptionEqualToValue={(option: any, value: any) =>
                            option.id == value.id
                          }
                          disablePortal
                          fullWidth
                          options={currencies ?? []}
                          getOptionLabel={(option) => (option as Currency).code}
                          value={selectedCurency}
                          onChange={(_: any, newValue: any | null) => {
                            setSelectedCurency(newValue);
                          }}
                          renderInput={(params) => (
                            <MuiTextField
                              {...params}
                              label={t("currency")}
                              variant="standard"
                            />
                          )}
                        />
                        {/* <FormHelperText sx={{ color: "red" }}>
                          {!!touched["alertTitle"] && errors["alertTitle"]}
                        </FormHelperText> */}
                      </Grid>
                      {selectedCurency && (
                        <>
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
                          <Grid item xs={12} sm={6}>
                            <Field
                              fullWidth
                              autocomplete="off"
                              component={TextField}
                              variant="standard"
                              name={"ironing_discount"}
                              label={t("ironing_discount")}
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                    {selectedCurency && (
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
                          disableColumnMenu
                          disableRowSelectionOnClick
                        />
                      </Box>
                    )}
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
