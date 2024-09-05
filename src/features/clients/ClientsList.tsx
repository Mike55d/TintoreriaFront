import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useClients } from "./lib/hooks/useClients";

const SerialCellComponent = (col: any) => {
  return <Link href={`clients/${col.row.id}`}>{col.row.id}</Link>;
};

// const DateCell = (col: any) => {
//   return (
//     <td>
//       {col.row.regDate
//         ? format(new Date(col.row.regDate), "dd/MM/yyyy HH:mm:ss")
//         : ""}
//     </td>
//   );
// };

const ClientsList = () => {
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
  const { data, refetch, isFetching, isRefetching } = useClients(params);

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
      field: "name",
      headerName: t("name") as string,
      width: 150,
    },
    {
      field: "lastname",
      headerName: t("lastname") as string,
      width: 150,
    },
    {
      field: "email",
      headerName: t("email") as string,
      width: 150,
    },
    {
      field: "phone",
      headerName: t("phone") as string,
      width: 150,
    },
  ];

  return (
    <>
      <Grid container spacing={2} component={Paper} marginTop={2}>
        <Grid item xs>
          <Typography variant="h6">{t("clients")}</Typography>
        </Grid>
        <Grid item marginRight={1}>
          <Link href="/clients/new" passHref>
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

export default ClientsList;
