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
  Backdrop,
  CircularProgress,
  DialogContentText,
} from "@mui/material";
import { DataGrid, GridCloseIcon, GridColDef } from "@mui/x-data-grid";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
import { TextField } from "formik-mui";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import useCurrencies from "./lib/hooks/useCurrencies";
import { Currency, GeneralPrice } from "./lib/api";
import useGeneralPrices from "./lib/hooks/useGeneralPrices";
import SelectInputGrid from "./lib/components/SelectInputGrid";
import {
  GarmentWithPrice,
  GeneralPriceForm,
  GeneralPriceType,
} from "./lib/types";
import { useMutation, useQueryClient } from "react-query";
import { CTError, getMessageFromError, SimpleError } from "@/utils/errors";
import { DialogConfig } from "@/utils/types";
import { v4 as uuid } from "uuid";

type PricesModalProps = {
  dialogOpen: boolean;
  setDialogOpen: (val: boolean) => void;
};

const NumericField = (props: FieldProps<any>) => (
  <TextField {...props} type="number" />
);

const PricesModal: React.FC<PricesModalProps> = ({
  dialogOpen,
  setDialogOpen,
}) => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = React.useState("");
  const { data: currencies } = useCurrencies();
  const [selectedCurency, setSelectedCurency] = useState<Currency | null>(null);
  const {
    data: generalPrices,
    isLoading: isLoadingPrices,
    refetch: refetchPrices,
  } = useGeneralPrices(selectedCurency?.id ?? 0);
  const [rows, setRows] = React.useState<GarmentWithPrice[]>([]);
  const [editedRows, setEditedRows] = React.useState<GarmentWithPrice[]>([]);
  const [editedGeneralPrices, setEditedGeneralPrices] = React.useState<
    GeneralPriceType[]
  >([]);
  const [mutationError, setMutationError] = useState(null as SimpleError);
  const [dialogConfig, setDialogConfig] = useState({
    open: false,
  } as DialogConfig);

  const mutationOptions = {
    onSuccess: () => queryClient.invalidateQueries("generalPrices"),
  };

  const columns: GridColDef[] = [
    { field: "garmentId", headerName: t("id"), width: 150 },
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

  const postMutation = useMutation<GeneralPrice, CTError, GeneralPriceForm>(
    (u: GeneralPriceForm) => GeneralPrice.create(u),
    mutationOptions
  );

  const initialValues: GeneralPriceType = {
    currencyId: null,
    generalPrice: null,
    ironingDiscount: null,
  };

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
      newEditRows[index] = {
        ...newEditRows[index],
        ...newRow,
        currencyId: selectedCurency?.id,
      };
    } else {
      newEditRows.push({ ...newRow, currencyId: selectedCurency?.id });
    }
    setEditedRows(newEditRows);
    return newRow;
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSubmit = (values: any, actions: FormikHelpers<any>) => {
    // actions.setSubmitting(false);
    // console.log(editedRows);
    // return;
    const newEditedGeneralPrices = editedGeneralPrices;
    if (values.generalPrice || values.ironingDiscount) {
      const index = newEditedGeneralPrices.findIndex(
        (genPrice) => genPrice.currencyId == selectedCurency?.id
      );
      if (index != -1) {
        newEditedGeneralPrices[index].generalPrice = values.generalPrice;
        newEditedGeneralPrices[index].ironingDiscount = values.ironingDiscount;
      } else {
        newEditedGeneralPrices.push({
          id: values.id,
          currencyId: selectedCurency?.id ?? 0,
          generalPrice: values.generalPrice,
          ironingDiscount: values.ironingDiscount,
        });
      }
    }

    postMutation.mutate(
      { generalPrices: newEditedGeneralPrices, garmentsWithPrice: editedRows },
      {
        onSuccess: (result: any) => {
          setDialogConfig({
            open: true,
            message: t("success_update_record"),
            onClose: () => {
              setDialogConfig({ open: false });
              setEditedRows([]);
              setEditedGeneralPrices([]);
              setEditedRows([]);
              refetchPrices();
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
      }
    );
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
              (editedRow) =>
                editedRow.currencyId == selectedCurency?.id &&
                editedRow.id == garmentWithPrice.id
            );
            return editedValue ?? garmentWithPrice;
          }
        );
        setRows(newRows);
      } else {
        const formatGarmentPrices = generalPrices.garmentsWithPrice.map(
          (garmentPrice) => ({ ...garmentPrice, id: garmentPrice.id ?? uuid() })
        );
        setRows(formatGarmentPrices);
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
          <Formik initialValues={initialValues} onSubmit={handleSubmit}>
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
                const generalPrice = editedGeneralPrices.find(
                  (genPrice) => genPrice.currencyId == selectedCurency?.id
                );
                console.log(generalPrice);
                if (generalPrice) {
                  setValues({
                    currencyId: generalPrice?.id ?? 0,
                    generalPrice: generalPrice.generalPrice,
                    ironingDiscount: generalPrice.ironingDiscount,
                  });
                } else {
                  setValues({
                    id: generalPrices?.generalPrice?.id,
                    currencyId: selectedCurency?.id ?? 0,
                    generalPrice:
                      generalPrices?.generalPrice?.generalPrice ?? 0,
                    ironingDiscount:
                      generalPrices?.generalPrice?.ironingDiscount ?? 0,
                  });
                }
              }, [generalPrices]); // eslint-disable-line react-hooks/exhaustive-deps

              const handleChangeCurrency = (
                event: any,
                newValue: any | null
              ) => {
                setSelectedCurency(newValue);
                const newEditedGeneralPrices = editedGeneralPrices;
                if (values.generalPrice || values.ironingDiscount) {
                  const index = newEditedGeneralPrices.findIndex(
                    (genPrice) => genPrice.currencyId == selectedCurency?.id
                  );
                  if (index != -1) {
                    newEditedGeneralPrices[index].generalPrice =
                      values.generalPrice;
                    newEditedGeneralPrices[index].ironingDiscount =
                      values.ironingDiscount;
                  } else {
                    newEditedGeneralPrices.push({
                      id: values.id,
                      currencyId: selectedCurency?.id ?? 0,
                      generalPrice: values.generalPrice,
                      ironingDiscount: values.ironingDiscount,
                    });
                  }
                  setEditedGeneralPrices(newEditedGeneralPrices);
                }
              };

              if (!generalPrices) return null;

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
                          onChange={handleChangeCurrency}
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
                              component={NumericField}
                              variant="standard"
                              name={"generalPrice"}
                              label={t("general_price")}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Field
                              fullWidth
                              autocomplete="off"
                              component={NumericField}
                              variant="standard"
                              name={"ironingDiscount"}
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
                  <Backdrop
                    open={isSubmitting || isLoadingPrices}
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
                      <DialogContentText>
                        {dialogConfig.message}
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={dialogConfig.onClose}>{t("ok")}</Button>
                    </DialogActions>
                  </Dialog>
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
