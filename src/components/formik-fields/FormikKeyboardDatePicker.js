import { Field } from 'formik';
import { DatePicker } from 'formik-mui-lab';
import React from 'react';

export default function FormikKeyboardDatePickerField(props) {
  const { lang } = window;
  const {
    name,
    autoComplete,
    label,
    variant,
    fullWidth,
    inputVariant,
    disableFuture,
    format,
    ...otherProps
  } = props;
  return (
    <Field
      component={DatePicker}
      autoOk
      clearable
      fullWidth={fullWidth}
      autoComplete={autoComplete}
      disableFuture={disableFuture}
      inputVariant={inputVariant}
      variant={variant}
      format={format}
      name={name}
      label={label}
      invalidDateMessage={lang.invalid_date_message}
      maxDateMessage={lang.date_should_not_be_after_until_date}
      {...otherProps}
    />
  );
}

FormikKeyboardDatePickerField.defaultProps = {
  autoComplete: 'off',
  variant: 'dialog',
  inputVariant: 'outlined',
  fullWidth: true,
  disableFuture: false,
  format: 'dd/MM/yyyy'
};
