import { Box, Button, TextField } from '@mui/material';
import { useFormikContext } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';

export default function FormikFileField({
  variant,
  disabled,
  mime,
  name,
  buttonVariant,
  label
}) {
  const { lang } = window;
  const { values, errors, touched, setFieldValue, setTouched } =
    useFormikContext();

  return (
    <Box display='flex' flexDirection='row' position='relative'>
      <TextField
        fullWidth
        label={label}
        style={{ flex: 1 }}
        variant={variant}
        disabled={disabled}
        value={values[name] ? values[name].name : ''}
        error={!!touched[name] && !!errors[name]}
        helperText={touched[name] && errors[name]}
        InputProps={{
          readOnly: true
        }}
      />
      <input
        id={`${name}-id`}
        accept={mime}
        style={{ display: 'none' }}
        multiple={false}
        type='file'
        onChange={e => {
          if (e.target.files) {
            setFieldValue(name, e.target.files[0]);
          }
          e.target.value = null;
        }}
        onBlur={() => setTouched({ ...touched, [name]: true })}
        name={name}
      />
      <label htmlFor={`${name}-id`} style={{ margin: 0 }}>
        <Button
          style={{ position: 'absolute', top: 8, right: 8 }}
          variant={buttonVariant}
          color='primary'
          component='span'
          disabled={disabled}
        >
          {lang.upload}
        </Button>
      </label>
    </Box>
  );
}

FormikFileField.defaultProps = {
  mime: '*/*',
  variant: 'outlined',
  buttonVariant: 'contained',
  name: '',
  disabled: false,
  label: ''
};

FormikFileField.propTypes = {
  label: PropTypes.string,
  disabled: PropTypes.bool,
  mime: PropTypes.string,
  variant: PropTypes.string,
  buttonVariant: PropTypes.string,
  name: PropTypes.string
};
