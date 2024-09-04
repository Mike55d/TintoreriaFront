// import { DatePicker } from '@mui/lab';
import { Box, TextField } from '@mui/material';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  datePickers: {
    paddingRight: 5,
    paddingLeft: 5,
    marginBottom: 15,
    marginTop: 0,
    width: '100%',
    zIndex: 0
  }
});

export default function DateRangeFilter({ column: { filterValue = [null, null], setFilter } }) {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Box display="flex">
      <DatePicker
        value={filterValue[0] || null}
        label={t('from')}
        renderInput={params => <TextField variant="standard" {...params} />}
        onChange={val => {
          setFilter((old = [null, null]) => [val ? val : undefined, old[1]]);
        }}
        className={classes.datePickers}
      />
      <DatePicker
        label={t('until')}
        renderInput={params => <TextField variant="standard" {...params} />}
        value={filterValue[1] || null}
        onChange={val => {
          setFilter((old = [null, null]) => [old[0], val ? val : undefined]);
        }}
        className={classes.datePickers}
      />
    </Box>
  );
}
