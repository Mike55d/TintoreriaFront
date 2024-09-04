import MuiTextField from '@mui/material/TextField';
import { Field } from 'formik';
import { fieldToTextField } from 'formik-mui';
import React from 'react';

export function Wrapper(props) {
  const {
    form: { setFieldValue },
    field: { name }
  } = props;
  const onChange = React.useCallback(
    event => {
      const { value } = event.target;
      setFieldValue(name, value ? value.toUpperCase() : '');
    },
    [setFieldValue, name]
  );
  return <MuiTextField {...fieldToTextField(props)} onChange={onChange} />;
}

export default function FormikUpperCasingTextField(props) {
  const { name, autoComplete, label, variant, fullWidth, ...otherProps } =
    props;
  return (
    <Field
      fullWidth={fullWidth}
      component={Wrapper}
      variant={variant}
      name={name}
      autoComplete={autoComplete}
      label={label}
      {...otherProps}
    />
  );
}

FormikUpperCasingTextField.defaultProps = {
  autoComplete: 'off',
  variant: 'outlined',
  fullWidth: true
};
