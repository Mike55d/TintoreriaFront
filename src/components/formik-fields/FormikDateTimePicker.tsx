import { makeStyles } from '@mui/styles';
import { FieldProps } from 'formik';
import React from 'react';
import { TextField as TextFieldDate } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';

const useStyles = makeStyles({
  datePickers: {
    width: '100%',
    zIndex: 0,
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000000'
    }
  }
});

const DateTimeField = (props: FieldProps & { label: string }) => {
  const classes = useStyles();
  return (
    <>
      <DateTimePicker
        {...props}
        value={props.field.value}
        renderInput={params => (
          <TextFieldDate
            variant="standard"
            {...params}
            error={!!props.form.touched[props.field.name] && !!props.form.errors[props.field.name]}
            helperText={
              !!props.form.touched[props.field.name] && props.form.errors[props.field.name]
            }
          />
        )}
        className={classes.datePickers}
        onChange={value => props.form.setFieldValue(props.field.name, value)}
        label={props.label}
      />
    </>
  );
};

export default DateTimeField;
