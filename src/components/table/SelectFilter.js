import { FormControl, MenuItem, Select } from "@mui/material";
import { useTranslation } from "next-i18next";
import React from "react";

export default function SelectFilter({
  column: { filterValue, setFilter, preFilteredRows, id }
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const { t } = useTranslation();
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach(row => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  return (
    <FormControl fullWidth variant="standard">
      <Select
        labelId="select-filter"
        id="select-filter-id"
        value={filterValue || ""}
        onChange={e => {
          setFilter(e.target.value || undefined);
        }}
      >
        <MenuItem key="" value="">
          {t("all")}
        </MenuItem>
        {options.map((option, i) => (
          <MenuItem key={i} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
