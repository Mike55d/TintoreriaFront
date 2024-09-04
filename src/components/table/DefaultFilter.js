import { TextField } from '@mui/material';
import React from 'react';

export default function DefaultFilter({ column: { filterValue, setFilter } }) {
  return (
    <TextField
      fullWidth
      variant='standard'
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
    />
  );
}
