// CustomSelectEditInput.js
import * as React from "react";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { GridCellParams } from "@mui/x-data-grid";
import { Currency } from "../api";
import { PriceType } from "../types";
import { useTranslations } from "next-intl";

type SelectProps = {
  props: GridCellParams;
  selectedCurrency: Currency | null;
};

const SelectInputGrid: React.FC<SelectProps> = ({
  props,
  selectedCurrency,
}) => {
  const { id, value, api, field } = props;

  console.log(value);

  const handleChange = (event: any) => {
    api.setEditCellValue({ id, field, value: event.target.value });
    api.stopCellEditMode({ id, field });
  };

  const types = [
    {
      type: PriceType.PERCENT,
      label: "%",
    },
    {
      type: PriceType.PRICE,
      label: selectedCurrency?.code,
    },
  ];

  return (
    <>
      {/* <FormControl fullWidth> */}
      {/* <InputLabel>{field}</InputLabel> */}
      <Select
        variant="standard"
        value={value}
        size="small"
        onChange={handleChange}
        autoWidth
        // label={field}
      >
        {types?.map((type, index) => (
          <MenuItem key={index} value={type.type}>
            {type.label}
          </MenuItem>
        ))}
      </Select>
      {/* </FormControl> */}
    </>
  );
};

export default SelectInputGrid;
