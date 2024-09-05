/* eslint-disable react/display-name */
import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Collapse,
  Grid,
  LinearProgress,
  Link as MuiLink,
  Paper,
  Typography
} from '@mui/material';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import DateRangeFilter from '../../components/table/DateRangeFilter';
import ReactTable from '../../components/table/ReactTable';
import SelectFilter from '../../components/table/SelectFilter';
import { RootState } from '../../store';
import useReactTableLang from '../../utils/useReactTableLang';
import User from './lib/api';
import { useUsers } from './lib/hooks/useUsers';
import { formatUserStatus } from './lib/utils';
import SecureAvatar from '../../components/SecureAvatar';
import useGrants from '../roles/lib/hooks/useGrants';
import { checkPermission } from '../../utils/utils';

export default function UsersList() {
  const { isLoading, error, data, refetch } = useUsers();
  const { t } = useTranslation();
  const reactTableLang = useReactTableLang();
  const { user } = useSelector((state: RootState) => state.app);
  const grants = useGrants('users', user);
  const router = useRouter();

  const handleUserClick = (user: User) => (e: any) => {
    e.preventDefault();
    router.push(`users/${user.id}`);
  };

  const columns = React.useMemo(
    () => [
      {
        Header: ' ',
        width: '2rem',
        Filter: () => null,
        accessor: (row: User) => (
          <SecureAvatar
            sx={{ height: '2rem', width: '2rem' }}
            alt={row?.name}
            url={row.photo && `api/users/${row.id}/photo`}
          />
        )
      },
      {
        Header: t('email'),
        filter: 'linkFilter',
        accessor: (row: User) => (
          <MuiLink href={`users/${row.id}`} onClick={handleUserClick(row)}>
            {row.email}
          </MuiLink>
        )
      },
      { Header: t('name'), accessor: 'name' },
      {
        Header: t('status'),
        accessor: (row: User) => t(formatUserStatus(row.status)),
        Filter: SelectFilter
      },
      {
        Header: t('last_connection'),
        accessor: (row: User) =>
          row.lastConnection ? format(row.lastConnection, 'dd-MM-yyyy HH:mm') : '-',
        Filter: DateRangeFilter,
        filter: 'dateBetween'
      }
    ],
    [t] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <>
      {isLoading && <LinearProgress />}
      <Grid container spacing={2} component={Paper}>
        <Grid item xs>
          <Typography variant="h6">{t('users')}</Typography>
        </Grid>
        <Grid item hidden={!checkPermission(grants, 'create')} marginRight={1}>
          <Link href="/users/new" passHref>
            <Button variant="contained" color="primary">
              {t('create')}
            </Button>
          </Link>
        </Grid>
        <Grid item xs={12} marginRight={1}>
          <ReactTable
            columns={columns}
            data={data ?? []}
            options={{ filtering: true }}
            lang={reactTableLang}
          />
        </Grid>
      </Grid>

      <Collapse in={!!error} unmountOnExit>
        <Box my={4}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                {t('retry')}
              </Button>
            }
          >
            <AlertTitle>{t('error')}</AlertTitle>
            {t('unable_to_fetch_data')}
          </Alert>
        </Box>
      </Collapse>
    </>
  );
}
