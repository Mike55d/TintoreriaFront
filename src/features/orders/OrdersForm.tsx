import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
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
  Stack,
  IconButton,
  FormControlLabel,
  Autocomplete,
  Chip,
  FormHelperText,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { TextField, Checkbox } from "formik-mui";
import DialogTitle from "@/components/dialog/DialogTitle";
import * as yup from "yup";
import { useOrder } from "./lib/hooks/useOrder";
import FormikSelectField from "@/components/formik-fields/FormikSelect";
import useCurrencies from "../settings/lib/hooks/useCurrencies";
import Order from "./lib/api";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import useGarments from "../settings/lib/hooks/useGarments";
import { Garment } from "../settings/lib/api";
import useGeneralPrices from "../settings/lib/hooks/useGeneralPrices";
import { PriceType } from "../settings/lib/types";
import { GarmentOrderType } from "./lib/types";
import CloseIcon from "@mui/icons-material/Close";

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

const OrdersForm = () => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = router.query;
  const classes = useStyles();
  const { data: currencies } = useCurrencies();
  const { data: generalPrices } = useGeneralPrices();
  const { data: garments } = useGarments();
  const orderQuery = useOrder(id ? parseInt(id as string) : undefined);
  const [mutationError, setMutationError] = useState(null as SimpleError);
  const [dialogConfig, setDialogConfig] = useState({
    open: false,
  } as DialogConfig);
  const [deleteDialogConfig, setDeleteDialogConfig] = useState({
    open: false,
  } as DialogConfig);

  const validationSchema = yup.object().shape({
    currencyId: yup.string().required(t("required_field")),
  });

  const mutationOptions = {
    onSuccess: () => queryClient.invalidateQueries("users"),
  };

  const postMutation = useMutation<Order, CTError, Order>(
    (u: Order) => Order.create(u),
    mutationOptions
  );

  const patchMutation = useMutation<Order, CTError, Order>(
    (u: Order) => Order.update(u),
    mutationOptions
  );

  const deleteMutation = useMutation<void, CTError, Order>((u) =>
    Order.delete(u)
  );
  const handleSubmit = (values: Order, actions: FormikHelpers<Order>) => {
    // console.log(values);
    // actions.setSubmitting(false);
    // return;
    setMutationError(null);
    if (!values.id) {
      postMutation.mutate(values, {
        onSuccess: (result: Order) => {
          setDialogConfig({
            open: true,
            message: t("success_create_record"),
            onClose: () => {
              router.replace(`/orders/${result.id}`);
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
              orderQuery.refetch();
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

  if (id && !orderQuery.data) return null;

  return (
    <>
      <Formik
        initialValues={orderQuery.data ?? new Order()}
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
          touched,
          errors,
        }) => {
          const currenciesFormat = useMemo(() => {
            return currencies?.map((currency) => ({
              text: currency.name,
              value: currency.id,
            }));
          }, [currencies]);

          useEffect(() => {
            console.log(errors);
          },[errors])

          // eslint-disable-next-line
          useEffect(() => {
            console.log(values);
            if (orderQuery.isFetched && orderQuery.data) {
              setValues({ ...orderQuery.data });
            }
          }, [orderQuery.data, orderQuery.isFetched]); // eslint-disable-line react-hooks/exhaustive-deps

          const handleAddField = () => {
            let newField: any = {
              ironingOnly: false,
              quantity: 1,
            };
            values.garments.push(newField);
            setValues(values);
          };

          const handleRemoveField = (index: number) => {
            values = {
              ...values,
              garments: values.garments.filter((_, i) => i !== index),
            };
            setValues(values);
          };

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

          const getPrice = (garment: GarmentOrderType) => {
            if (!garment.garment) return "";
            const priceCurrency = garment.garment?.prices?.find(
              (price) => price.currency?.id == values.currencyId
            );
            if (priceCurrency) {
              if (priceCurrency.type == PriceType.PERCENT) {
                if (generalPrices?.general_price && priceCurrency.price) {
                  return (
                    (generalPrices?.general_price * priceCurrency.price) / 100
                  );
                } else {
                  return generalPrices?.general_price;
                }
              } else {
                return priceCurrency.price;
              }
            } else {
              return generalPrices?.general_price;
            }
          };

          return (
            <Form autoComplete="new-user">
              <Container maxWidth="lg" fixed>
                <Grid container spacing={2} paddingRight={2} paddingBottom={2}>
                  <Grid container mt={2} component={Paper} p={2} spacing={2}>
                    <Grid item xs={12} className={classes.title}>
                      <Typography variant="h6">{t("order")}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      <FormikSelectField
                        label={t("currency")}
                        variant="standard"
                        name="currencyId"
                        id="currencyId"
                        hideDefault
                        values={currenciesFormat}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6">{t("garments")}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack direction={"row"} spacing={1}>
                        <IconButton
                          aria-label="delete"
                          size="small"
                          onClick={() => handleAddField()}
                        >
                          <ControlPointIcon fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      {values.garments.map((garment, i) => {
                        return (
                          <Grid container key={i} spacing={2}>
                            <Grid item xs={12} sm={3}>
                              <Autocomplete
                                isOptionEqualToValue={(
                                  option: any,
                                  value: any
                                ) => option.id == value.id}
                                disablePortal
                                fullWidth
                                options={garments ?? []}
                                getOptionLabel={(option) =>
                                  (option as Garment).name
                                }
                                value={values.garments[i].garment}
                                onChange={(_: any, newValue: any | null) => {
                                  const newGarment = [...values.garments];
                                  newGarment[i].garment = newValue;
                                  console.log(newGarment);
                                  setValues({
                                    ...values,
                                    garments: newGarment,
                                  });
                                }}
                                renderInput={(params) => (
                                  <MUITextField
                                    {...params}
                                    // error={
                                    //   !!touched["alertTitle"] &&
                                    //   !!errors["alertTitle"]
                                    // }
                                    label={t("garments")}
                                    variant="standard"
                                  />
                                )}
                              />
                              <FormHelperText sx={{ color: "red" }}>
                                {/* {!!touched["alertTitle"] && errors["alertTitle"]} */}
                              </FormHelperText>
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <Field
                                fullWidth
                                autocomplete="off"
                                component={TextField}
                                variant="standard"
                                name={`garments[${i}].quantity`}
                                label={t("quantity")}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <MUITextField
                                value={getPrice(garment)}
                                disabled
                                type="number"
                                variant="standard"
                                label={`${t("price")} ${
                                  currencies?.find(
                                    (curency) => curency.id == values.currencyId
                                  )?.sign
                                }`}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <FormControlLabel
                                control={
                                  <Field
                                    component={Checkbox}
                                    name={`garments[${i}].ironingOnly`}
                                    type="checkbox"
                                    label={t("ironing_only")}
                                  />
                                }
                                label={t("ironing_only") as string}
                              />
                            </Grid>
                            <Grid item xs={12} sm={1}>
                              <IconButton
                                onClick={() => handleRemoveField(i)}
                                sx={{
                                  color: (theme) => theme.palette.grey[500],
                                }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Grid>
                          </Grid>
                        );
                      })}
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
                open={isSubmitting || orderQuery.isLoading}
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

export default OrdersForm;
