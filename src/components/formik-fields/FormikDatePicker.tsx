import { makeStyles } from '@mui/styles';
import { FieldProps } from 'formik';
import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField as TextFieldDate } from '@mui/material';

const useStyles = makeStyles({
  datePickers: {
    width: '100%',
    zIndex: 0,
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000'
    }
  }
});

const DateField = (props: FieldProps & { label: string }) => {
  const classes = useStyles();
  return (
    <DatePicker
      {...props}
      value={props.field.value}
      renderInput={params => <TextFieldDate variant="standard" {...params} />}
      className={classes.datePickers}
      onChange={value => props.form.setFieldValue(props.field.name, value ? value['$d'] : null)}
      label={props.label}
    />
  );
};

export default DateField;
