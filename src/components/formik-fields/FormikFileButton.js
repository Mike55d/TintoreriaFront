import { Button } from '@mui/material';
import { useFormikContext } from 'formik';
import React from 'react';

export default function FormikFileField(props) {
  const { name, label, variant, docExts, disabled, ...otherProps } = props;
  const { setFieldValue } = useFormikContext();

  const loadFile = event => {
    const file = event.target.files[0];
    setFieldValue(name, file);
  };
  return (
    <>
      <input
        name={name}
        accept={docExts.join(',')}
        style={{ display: 'none' }}
        id={`${name}-button-file`}
        multiple={false}
        type='file'
        onChange={loadFile}
      />
      <label htmlFor={`${name}-button-file`}>
        <Button
          variant='contained'
          color='primary'
          component='span'
          disabled={disabled}
          {...otherProps}
        >
          {label}
        </Button>
      </label>
    </>
  );
}

FormikFileField.defaultProps = {
  variant: 'outlined',
  disabled: false,
  docExts: []
};
