import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useOrders } from "./lib/hooks/useOrders";
import { Status } from "./lib/types";

const SerialCellComponent = (col: any) => {
  return <Link href={`orders/${col.row.id}`}>{col.row.id}</Link>;
};

const StatusCellComponent = (col: any) => {
  const t = useTranslations();
  const status = [
    {
      id: Status.RECEIVED,
      text: t("received"),
    },
    {
      id: Status.PROCESING,
      text: t("processing"),
    },
    {
      id: Status.READY,
      text: t("ready"),
    },
  ];

  return <td>{status[col.row.status].text}</td>;
};

const DateCell = (col: any) => {
  return (
    <td>
      {col.row.created_at
        ? format(new Date(col.row.created_at), "dd/MM/yyyy")
        : ""}
    </td>
  );
};

const OrdersList = () => {
  const t = useTranslations();
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const params = useMemo(() => {
    const skip = paginationModel.page * paginationModel.pageSize;
    const take = paginationModel.pageSize;
    return {
      skip,
      take,
    };
  }, [paginationModel]);
  const { data, refetch, isFetching, isRefetching } = useOrders(params);

  useEffect(() => {
    refetch();
  }, [paginationModel, refetch]);

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: t("id") as string,
      width: 200,
      renderCell: SerialCellComponent,
    },
    {
      field: "date",
      headerName: t("date") as string,
      width: 150,
      renderCell: DateCell,
    },
    {
      field: "status",
      headerName: t("status") as string,
      width: 150,
      renderCell: StatusCellComponent,
    },
  ];

  return (
    <>
      <Grid container spacing={2} component={Paper} marginTop={2}>
        <Grid item xs>
          <Typography variant="h6">{t("orders")}</Typography>
        </Grid>
        <Grid item marginRight={1}>
          <Link href="/orders/new" passHref>
            <Button variant="contained" color="primary">
              {t("create")}
            </Button>
          </Link>
        </Grid>

        <Grid item xs={12} pr={2} pb={2}>
          <Box sx={{ height: 400, width: "100%", maxWidth: "75vw" }}>
            <DataGrid
              rows={data?.data}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel,
                },
              }}
              paginationMode="server"
              pageSizeOptions={[5, 25, 50, 100]}
              onPaginationModelChange={setPaginationModel}
              paginationModel={paginationModel}
              loading={isFetching || isRefetching}
              disableColumnMenu
              rowCount={data?.count}
              disableRowSelectionOnClick
              disableColumnSelector
              disableColumnSorting
            />
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default OrdersList;
