/* eslint-disable react/display-name */
import { Box, IconButton } from "@mui/material";
import React from "react";

export function useActions(actions) {
  return hooks => {
    if (!actions.length) {
      return;
    }
    const additionalColumns = [];
    additionalColumns.push({
      id: "actions",
      width: 40,
      Header: () => window.lang.actions,
      Cell: ({ row }) => (
        <Box display="flex">
          {actions.map((item, index) => (
            <IconButton
              size="small"
              key={index}
              onClick={e => item.onClick(e, row)}
            >
              {item.icon}
            </IconButton>
          ))}
        </Box>
      )
    });

    if (additionalColumns.length) {
      hooks.visibleColumns.push(columns => [
        ...additionalColumns,
        ...columns
      ]);
    }
  };
}
