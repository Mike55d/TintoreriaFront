import { FormControl, FormHelperText, InputLabel, MenuItem } from '@mui/material';
import { Field, useFormikContext } from 'formik';
import { Select } from 'formik-mui';
import React from 'react';

export default function FormikSelectField(props) {
  const {
    id,
    name,
    autoComplete,
    label,
    variant,
    fullWidth,
    type,
    values,
    hideDefault,
    ...otherProps
  } = props;

  const { errors, touched } = useFormikContext();
  return (
    <FormControl variant={variant} fullWidth error={!!touched[name] && !!errors[name]}>
      {/* <InputLabel htmlFor={id}>{label}</InputLabel> */}
      <Field
        component={Select}
        variant={variant}
        type={type}
        name={name}
        label={label}
        inputProps={{ name, id }}
        {...otherProps}
      >
        {!hideDefault && (
          <MenuItem value="">
            <em>Ninguno</em>
          </MenuItem>
        )}
        {values.map(({ text, value, level }, index) => (
          <MenuItem key={index} value={value}>
            <span style={{ width: level * 30 }}></span>
            {text}
          </MenuItem>
        ))}
      </Field>
      {/* <FormHelperText>{!!touched[name] && errors[name]}</FormHelperText> */}
    </FormControl>
  );
}

FormikSelectField.defaultProps = {
  id: '',
  autoComplete: 'off',
  variant: 'standard',
  fullWidth: true,
  type: 'text',
  values: []
};
