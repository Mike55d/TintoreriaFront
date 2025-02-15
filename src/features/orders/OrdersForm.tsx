import {
  Field,
  FieldProps,
  Form,
  Formik,
  FormikFormProps,
  FormikHelpers,
  FormikProps,
  useFormikContext,
} from "formik";
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
  Stepper,
  Step,
  StepLabel,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { TextField } from "formik-mui";
import DialogTitle from "@/components/dialog/DialogTitle";
import * as yup from "yup";
import { useOrder } from "./lib/hooks/useOrder";
import useCurrencies from "../settings/lib/hooks/useCurrencies";
import Order from "./lib/api";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import useGarments from "../settings/lib/hooks/useGarments";
import { Currency, Garment } from "../settings/lib/api";
import useGeneralPrices from "../settings/lib/hooks/useGeneralPrices";
import { PriceType } from "../settings/lib/types";
import CloseIcon from "@mui/icons-material/Close";
import {
  Cancel,
  CheckCircleOutline,
  LocalShipping,
  Warning,
} from "@mui/icons-material";
import LoopIcon from "@mui/icons-material/Loop";
import { Status } from "./lib/types";
import DateField from "@/components/formik-fields/FormikDatePicker";
import { format } from "date-fns";
import { useClients } from "../clients/lib/hooks/useClients";
import Client from "../clients/lib/api";
import useSettings from "../settings/lib/hooks/useSettings";

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
export enum PayType {
  UNPAID,
  DEBIT,
  CREDIT,
  CASH,
}

const PriceField = (props: FieldProps) => {
  const { values, setFieldValue } = useFormikContext<Order>();
  const { data: generalPrices } = useGeneralPrices(values.currency?.id ?? 0);

  return (
    <TextField
      {...props}
      type="number"
      onChange={(e) => {
        props.field.onChange(e);
        const index = props.field.name.substring(
          props.field.name.indexOf("[") + 1,
          props.field.name.lastIndexOf("]")
        );
        const garment = values.garments[parseInt(index)];
        const fieldTotal = `${props.field.name.split(".")[0]}.total`;

        const quantity = garment.quantity;
        const price = parseInt(e.target.value);
        const discount =
          (price * (generalPrices?.generalPrice.ironingDiscount ?? 0)) / 100;
        const formatPrice = garment.ironingOnly ? price - discount : price;
        const total = quantity * (formatPrice ?? 0);
        setFieldValue(fieldTotal, total.toFixed(2));
      }}
    />
  );
};

const QuantityField = (props: FieldProps) => {
  const { values, setFieldValue } = useFormikContext<Order>();
  const { data: generalPrices } = useGeneralPrices(values.currency?.id ?? 0);

  return (
    <TextField
      {...props}
      type="number"
      onChange={(e) => {
        props.field.onChange(e);
        const fieldTotal = `${props.field.name.split(".")[0]}.total`;
        const index = props.field.name.substring(
          props.field.name.indexOf("[") + 1,
          props.field.name.lastIndexOf("]")
        );
        const garment = values.garments[parseInt(index)];
        const quantity = parseInt(e.target.value);
        const price = garment.price ?? 0;
        const discount =
          (price * (generalPrices?.generalPrice.ironingDiscount ?? 0)) / 100;
        const formatPrice = garment.ironingOnly ? price - discount : price;
        const total = quantity * (formatPrice ?? 0);
        setFieldValue(fieldTotal, total.toFixed(2));
      }}
    />
  );
};

const OrdersForm = () => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = router.query;
  const classes = useStyles();
  const { data: currencies } = useCurrencies();
  const { data: garments } = useGarments();
  const { data: clients } = useClients();
  const orderQuery = useOrder(id ? parseInt(id as string) : undefined);
  const [mutationError, setMutationError] = useState(null as SimpleError);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [payMethod, setPayMethod] = useState<any>();
  const { data: settings } = useSettings();
  const [dialogConfig, setDialogConfig] = useState({
    open: false,
  } as DialogConfig);
  const [ordersPriceEdited, setOrdersPriceEdited] = useState<Order[]>([]);

  const [deleteDialogConfig, setDeleteDialogConfig] = useState({
    open: false,
  } as DialogConfig);

  const validationSchema = yup.object().shape({
    currency: yup.object().required(t("required_field")),
    client: yup.object().required(t("required_field")),
  });

  const mutationOptions = {
    onSuccess: () => queryClient.invalidateQueries(["order", id]),
  };

  const postMutation = useMutation<Order, CTError, Order>(
    (u: Order) => Order.create(u),
    mutationOptions
  );

  const changeStatusMutation = useMutation<
    Order,
    CTError,
    { id: number; statusId: number }
  >(
    (u: { id: number; statusId: number }) =>
      Order.changeStatus(u.id, u.statusId),
    mutationOptions
  );

  const AddPayMutation = useMutation<
    Order,
    CTError,
    { id: number; payId: number }
  >(
    (u: { id: number; payId: number }) => Order.AddPay(u.id, u.payId),
    mutationOptions
  );

  const patchMutation = useMutation<Order, CTError, Order>(
    (u: Order) => Order.update(u),
    mutationOptions
  );

  const deleteMutation = useMutation<void, CTError, Order>((u) =>
    Order.delete(u)
  );

  const payStatus = [
    {
      text: t("unpaid"),
    },
    {
      text: t("debit"),
    },
    {
      text: t("credit"),
    },
    {
      text: t("cash"),
    },
  ];

  const payMethods = [
    {
      id: PayType.UNPAID,
      text: t("none"),
    },
    {
      id: PayType.DEBIT,
      text: t("debit"),
    },
    {
      id: PayType.CREDIT,
      text: t("credit"),
    },
    {
      id: PayType.CASH,
      text: t("cash"),
    },
  ];

  const steps = [
    {
      id: 1,
      label: t("received"),
      Icon: CheckCircleOutline,
      activeColor: "#86D293",
      active: true,
    },
    {
      id: 2,
      label: t("processing"),
      Icon: LoopIcon,
      activeColor: "#86D293",
      active: false,
    },
    {
      id: 3,
      label: t("late"),
      Icon: Warning,
      activeColor: "#FFEAC5",
      active: false,
    },
    {
      id: 4,
      label: t("delivered"),
      Icon: LocalShipping,
      activeColor: "#86D293",
      active: false,
    },
  ];

  const formatSteps = useMemo(() => {
    let allSteps = steps;
    const isLate = orderQuery.data?.historyEntries?.find(
      (history) => history.status == Status.LATE
    );
    if (!isLate) {
      allSteps = allSteps.filter((step) => step.id != Status.LATE);
    } else {
      allSteps = allSteps.map((step) =>
        step.id == Status.LATE ? { ...step, active: true } : step
      );
    }
    const isCanceled = orderQuery.data?.historyEntries?.find(
      (history) => history.status == Status.CANCELED
    );
    let newSteps = allSteps.map((step) => {
      const existStep = orderQuery.data?.historyEntries?.find(
        (history) => history.status == step.id
      );
      return existStep ? { ...step, active: true } : step;
    });
    if (isCanceled) {
      newSteps = newSteps.filter((step) => step.active);
      newSteps.push({
        id: 5,
        label: t("canceled"),
        Icon: Cancel,
        activeColor: "#F05A7E",
        active: true,
      });
    }
    console.log(newSteps);
    return newSteps;
  }, [orderQuery.data]);

  const handleAddPayMethod = () => {
    setShowPayDialog(false);
    AddPayMutation.mutate(
      { id: id ? parseInt(id as string) : 0, payId: payMethod },
      {
        onSuccess: () => {
          setDialogConfig({
            open: true,
            message: t("success_update_record"),
            onClose: () => {
              setDialogConfig({ open: false });
              orderQuery.refetch();
              setShowPayDialog(false);
            },
          });
        },
        onError: (e: CTError) => {
          setMutationError({
            title: t("error_updating_record"),
            message: t(getMessageFromError(e.error)),
          });
        },
      }
    );
  };

  const handleChangeStatus = (statusId: number) => {
    changeStatusMutation.mutate(
      { id: id ? parseInt(id as string) : 0, statusId },
      {
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
      }
    );
  };

  const handleSubmit = (values: Order, actions: FormikHelpers<Order>) => {
    const formatGarments = values.garments.filter(
      (garment) => garment.garment && garment.quantity > 0
    );
    // actions.setSubmitting(false);
    // console.log(values);
    // console.log(formatGarments);
    // return;
    setMutationError(null);
    if (!values.id) {
      postMutation.mutate(
        { ...values, garments: formatGarments },
        {
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
        }
      );
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
          setFieldValue,
          touched,
          errors,
        }) => {
          const { data: generalPrices } = useGeneralPrices(
            values.currency?.id ?? 0
          );

          // eslint-disable-next-line
          useEffect(() => {
            if (orderQuery.isFetched && orderQuery.data && !values.id) {
              setValues({ ...orderQuery.data });
            }
          }, [orderQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

          useEffect(() => {
            console.log(errors);
          }, [errors]);

          const handleChangeCurrency = (event: any, newValue: any | null) => {
            setFieldValue("currency", newValue);
            const orders = [...ordersPriceEdited];
            const indexOrderEdited = ordersPriceEdited.findIndex(
              (order) => order.currency?.id == values.currency?.id
            );
            if (indexOrderEdited != -1) {
              orders[indexOrderEdited] = values;
            }
            setOrdersPriceEdited([...orders, values]);
          };

          const getPrice = (garment: Garment): number | null => {
            if (!garment) return null;
            const priceCurrency = generalPrices?.garmentsWithPrice.find(
              (garmentWithPrice) =>
                garmentWithPrice.currencyId == values.currency?.id &&
                garmentWithPrice.garmentId == garment.id
            );

            if (priceCurrency) {
              if (priceCurrency.type == PriceType.PERCENT) {
                if (
                  generalPrices?.generalPrice.generalPrice &&
                  priceCurrency.price
                ) {
                  return (
                    (generalPrices?.generalPrice.generalPrice *
                      priceCurrency.price) /
                    100
                  );
                } else {
                  return generalPrices?.generalPrice.generalPrice ?? 0;
                }
              } else {
                return priceCurrency.price ?? 0;
              }
            } else {
              return generalPrices?.generalPrice.generalPrice ?? 0;
            }
          };

          useEffect(() => {
            const editedOrder = ordersPriceEdited.find(
              (orderPrice) => orderPrice.currency?.id == values.currency?.id
            );
            if (editedOrder) {
              setValues(editedOrder);
            } else {
              if (values.currency?.id != orderQuery.data?.currency?.id) {
                const oldGarments = [...values.garments];
                const newGarments = oldGarments.map((garment) => {
                  const price = generalPrices?.garmentsWithPrice.find(
                    (garmentWithPrice) =>
                      garmentWithPrice.garmentId == garment.garment.id
                  )?.price;
                  const total = garment.quantity * (price ?? 0);
                  return { ...garment, price: price ?? 0, total };
                });
                setValues({ ...values, garments: newGarments });
              } else {
                if (orderQuery.data) {
                  setValues({ ...orderQuery.data });
                }
              }
            }
          }, [generalPrices, orderQuery.data]);

          const handleChangeGarment = (newValue: Garment | null, i: number) => {
            if (!newValue) return;
            const newGarments = [...values.garments];
            const price = getPrice(newValue);
            const discount =
              ((price ?? 0) *
                (generalPrices?.generalPrice.ironingDiscount ?? 0)) /
              100;
            const formatPrice = newGarments[i].ironingOnly
              ? (price ?? 0) - discount
              : price;
            newGarments[i].garment = newValue;
            newGarments[i].price = price;
            const quantity = values.garments[i].quantity;
            newGarments[i].total = quantity * (formatPrice ?? 0);
            setValues({
              ...values,
              garments: newGarments,
            });
          };

          const handleCheckIroningOnly = (isChecked: boolean, i: number) => {
            const newGarments = [...values.garments];
            const discount =
              ((newGarments[i].price ?? 0) *
                (generalPrices?.generalPrice.ironingDiscount ?? 0)) /
              100;
            const price = isChecked
              ? (newGarments[i].price ?? 0) - discount
              : newGarments[i].price;
            const quantity = values.garments[i].quantity;
            newGarments[i].ironingOnly = isChecked;
            newGarments[i].total = (quantity * (price ?? 0)).toFixed(2);
            setValues({
              ...values,
              garments: newGarments,
            });
          };

          const handleAddField = () => {
            let newField: any = {
              ironingOnly: false,
              quantity: 1,
              price: "",
              total: "",
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
                          router.replace("/orders");
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

          if (!generalPrices) return null;

          return (
            <Form autoComplete="new-user">
              <Container maxWidth="lg" fixed>
                <Grid container spacing={2} paddingRight={2} paddingBottom={2}>
                  <Grid container mt={2} component={Paper} p={2} spacing={2}>
                    <Grid item xs={12} sm={10} className={classes.title}>
                      <Typography variant="h6">
                        {t("order")}{" "}
                        {orderQuery.data?.id ? `# ${orderQuery.data?.id}` : ""}
                      </Typography>
                    </Grid>
                    {!!id && (
                      <Grid item xs={12} sm={2}>
                        <Alert
                          severity={
                            orderQuery.data?.payType == 0 ? "error" : "success"
                          }
                        >
                          {payStatus[orderQuery.data?.payType ?? 0].text}
                        </Alert>
                      </Grid>
                    )}
                    {!!id && (
                      <Box sx={{ width: "100%" }} mt={3} mb={2}>
                        <Stepper>
                          {formatSteps?.map((step, index) => {
                            if (!step) return null;
                            const { label, Icon, active, activeColor } = step;
                            return (
                              <Step key={index}>
                                <StepLabel
                                  StepIconComponent={() => (
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        backgroundColor: "#F5F7F8",
                                        padding: 10,
                                        borderRadius: 30,
                                      }}
                                    >
                                      <Icon
                                        fontSize="large"
                                        style={{
                                          color: active ? activeColor : "grey",
                                        }}
                                      />
                                    </div>
                                  )}
                                >
                                  {label}
                                </StepLabel>
                              </Step>
                            );
                          })}
                        </Stepper>
                      </Box>
                    )}
                    <Grid item xs={12} sm={4}>
                      <Autocomplete
                        isOptionEqualToValue={(option: any, value: any) =>
                          option.id == value.id
                        }
                        disablePortal
                        fullWidth
                        options={clients?.data ?? []}
                        getOptionLabel={(option) => option.name}
                        value={values.client}
                        onChange={(_: any, newValue: Client | null) => {
                          setValues({
                            ...values,
                            client: newValue,
                            currency: id
                              ? values.currency
                              : newValue?.company?.currency ??
                                currencies?.find(
                                  (currency) =>
                                    currency.id == settings?.currencyId
                                ),
                          });
                        }}
                        renderInput={(params) => (
                          <MUITextField
                            {...params}
                            label={t("client")}
                            variant="standard"
                          />
                        )}
                      />
                      <FormHelperText sx={{ color: "red" }}>
                        {!!touched["client"] && errors["client"]}
                      </FormHelperText>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Autocomplete
                        isOptionEqualToValue={(option: any, value: any) =>
                          option.id == value.id
                        }
                        disablePortal
                        fullWidth
                        options={currencies ?? []}
                        getOptionLabel={(option) => option.code}
                        value={values.currency}
                        onChange={handleChangeCurrency}
                        renderInput={(params) => (
                          <MUITextField
                            {...params}
                            label={t("currency")}
                            variant="standard"
                          />
                        )}
                      />
                      <FormHelperText sx={{ color: "red" }}>
                        {!!touched["currency"] && errors["currency"]}
                      </FormHelperText>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Field
                        fullWidth
                        component={DateField}
                        variant="standard"
                        name="endDate"
                        label={t("end_date_order")}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Stack direction={"row"} spacing={1}>
                        <Typography
                          variant="h6"
                          style={{ display: "inline-block" }}
                        >
                          {t("garments")}
                        </Typography>
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
                                onChange={(_: any, newValue: Garment | null) =>
                                  handleChangeGarment(newValue, i)
                                }
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
                            <Grid item xs={12} sm={1}>
                              <Field
                                fullWidth
                                autocomplete="off"
                                component={QuantityField}
                                variant="standard"
                                name={`garments[${i}].quantity`}
                                label={t("quantity")}
                              />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <Field
                                fullWidth
                                autoComplete="off"
                                component={PriceField}
                                variant="standard"
                                name={`garments[${i}].price`}
                                label={t("price")}
                              />
                            </Grid>
                            <Grid item xs={12} sm={2}>
                              <Field
                                fullWidth
                                disabled
                                autoComplete="off"
                                component={TextField}
                                variant="standard"
                                name={`garments[${i}].total`}
                                label={t("total")}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={values.garments[i].ironingOnly}
                                    onChange={(e: any) => {
                                      // setFieldValue(
                                      //   `garments[${i}].ironingOnly`,
                                      //   e.target.checked
                                      // );
                                      handleCheckIroningOnly(
                                        e.target.checked,
                                        i
                                      );
                                    }}
                                  />
                                }
                                label={t("ironing_only")}
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
                    {orderQuery.data &&
                      orderQuery.data?.status != 5 &&
                      orderQuery.data?.status != 4 && (
                        <Button
                          color="error"
                          onClick={() => handleChangeStatus(5)}
                        >
                          {t("cancel")}
                        </Button>
                      )}
                    {orderQuery.data?.status != 4 &&
                      orderQuery.data?.status != 5 && (
                        <Grid item ml={1}>
                          <Button
                            color="primary"
                            onClick={() => {
                              submitForm();
                            }}
                          >
                            {t(id ? "update" : "create")}
                          </Button>
                        </Grid>
                      )}
                    {id &&
                      orderQuery.data?.status == 4 &&
                      orderQuery.data.payType == 0 && (
                        <Grid item ml={1}>
                          <Button
                            color="primary"
                            onClick={() => setShowPayDialog(true)}
                          >
                            {t("pay_method")}
                          </Button>
                        </Grid>
                      )}
                    {!!id && orderQuery.data && orderQuery.data?.status < 2 && (
                      <Grid item ml={1}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            handleChangeStatus(2);
                          }}
                        >
                          {t("process")}
                        </Button>
                      </Grid>
                    )}
                    {orderQuery.data &&
                      (orderQuery.data?.status == 2 ||
                        orderQuery.data?.status == 3) && (
                        <Grid item ml={1}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setShowPayDialog(true)}
                          >
                            {t("deliver")}
                          </Button>
                        </Grid>
                      )}
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
      <Dialog
        open={showPayDialog}
        keepMounted
        onClose={() => setShowPayDialog(false)}
      >
        <DialogTitle>{t("pay_method")}</DialogTitle>
        <DialogContent>
          <Grid item sm={12} xs={12}>
            <FormControl variant="standard" fullWidth>
              <InputLabel id="payMethod">{t("pay_method")}</InputLabel>
              <Select
                labelId="payMethod"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
              >
                {payMethods.map((payMethod) => (
                  <MenuItem value={payMethod.id} key={payMethod.id}>
                    {payMethod.text}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPayDialog(false)}>{t("cancel")}</Button>
          <Button onClick={handleAddPayMethod}>{t("save")}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrdersForm;
