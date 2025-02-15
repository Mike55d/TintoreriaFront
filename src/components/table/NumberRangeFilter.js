import { TextField } from '@mui/material';
import React from 'react';

export default function NumberRangeFilter({
    column: { filterValue = [], preFilteredRows, setFilter, id }
  }) {
    const [min, max] = React.useMemo(() => {
      let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
      let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
      preFilteredRows.forEach(row => {
        min = Math.min(row.values[id], min);
        max = Math.max(row.values[id], max);
      });
      return [min, max];
    }, [id, preFilteredRows]);
  
    return (
      <div
        style={{
          display: "flex"
        }}
      >
        <TextField
          value={filterValue[0] || ""}
          type="number"
          onChange={e => {
            const val = e.target.value;
            setFilter((old = []) => [
              val ? parseInt(val, 10) : undefined,
              old[1]
            ]);
          }}
          placeholder={`Min (${min})`}
          style={{
            width: "70px",
            marginRight: "0.5rem"
          }}
        />
        {window.lang.to}
        <TextField
          value={filterValue[1] || ""}
          type="number"
          onChange={e => {
            const val = e.target.value;
            setFilter((old = []) => [
              old[0],
              val ? parseInt(val, 10) : undefined
            ]);
          }}
          placeholder={`Max (${max})`}
          style={{
            width: "70px",
            marginLeft: "0.5rem"
          }}
        />
      </div>
    );
  }