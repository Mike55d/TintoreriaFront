import CurrencyTextField from "@unicef/material-ui-currency-textfield";
import { Field, useFormikContext } from "formik";
import React from "react";

export default function FormikCurrencyField(props) {
  const {
    name,
    autoComplete,
    label,
    variant,
    fullWidth,
    ...otherProps
  } = props;

  const { values, setFieldValue } = useFormikContext();

  return (
    <Field
      fullWidth={fullWidth}
      component={CurrencyTextField}
      variant={variant}
      name={name}
      value={values[name]}
      autoComplete={autoComplete}
      currencySymbol="Bs"
      minimumValue="0"
      decimalCharacter=","
      digitGroupSeparator="."
      onChange={(_, value) => setFieldValue(name, value)}
      label={label}
      {...otherProps}
    />
  );
}

FormikCurrencyField.defaultProps = {
  autoComplete: "off",
  variant: "outlined",
  fullWidth: true
};
