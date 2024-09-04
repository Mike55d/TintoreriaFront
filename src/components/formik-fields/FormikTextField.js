import { Field } from "formik";
import { TextField } from "formik-mui";
import React from "react";

export default function FormikTextField(props) {
  const {
    name,
    autoComplete,
    label,
    variant,
    fullWidth,
    ...otherProps
  } = props;
  return (
    <Field
      fullWidth={fullWidth}
      component={TextField}
      variant={variant}
      name={name}
      autoComplete={autoComplete}
      label={label}
      {...otherProps}
    />
  );
}

FormikTextField.defaultProps = {
  autoComplete: "off",
  variant: "outlined",
  fullWidth: true
};
