/* eslint-disable react/display-name */
/* eslint-disable react/jsx-key */
import {
  Table as MaUTable,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow
} from '@mui/material';
import { parse } from 'date-fns';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useFilters, usePagination, useRowSelect, useTable } from 'react-table';

import DefaultFilter from './DefaultFilter';
import IndeterminateCheckbox from './IndeterminateCheckbox';
import { useActions } from './useActions';

function dateBetweenFilterFn(page, id, filterValues) {
  return page.filter(r => {
    const time = parse(r.values[id], 'dd-MM-yyyy HH:mm', new Date());
    if (filterValues[0] && time < filterValues[0]) {
      return false;
    }
    if (filterValues[1] && time > filterValues[1]) {
      return false;
    }
    return true;
  });
}

function linkFilterFn(page, id, filterValues) {
  return page.filter(r => {
    const child = r.values[id].props.children;

    if (typeof child !== 'string') {
      return false;
    }

    return child.toLowerCase().includes(filterValues.toLowerCase());
  });
}

linkFilterFn.autoRemove = val => !val;
dateBetweenFilterFn.autoRemove = val => !val;

function ReactTable({
  columns,
  data,
  options,
  actions,
  lang,
  filters,
  setFilters
}) {
  const defaultColumn = React.useMemo(
    () => ({
      Filter: DefaultFilter
    }),
    []
  );

  const filterTypes = React.useMemo(
    () => ({
      dateBetween: dateBetweenFilterFn,
      linkFilter: linkFilterFn
    }),
    []
  );

  const hooksArray = [];
  if (options.filtering) {
    hooksArray.push(useFilters);
  }

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    rows,
    gotoPage,
    setPageSize,
    state
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      manualFilters: !!options.manualFilters,
      filterTypes,
      autoResetFilters: false,
      initialState: {
        filters,
        pageSize:options.pageSize ? options.pageSize : 10
      }
    },
    ...hooksArray,
    usePagination,
    useRowSelect,
    hooks => {
      // if options.selectable make table selectable
      if (options.selectable) {
        hooks.visibleColumns.push(columns => [
          {
            id: 'selection',
            Header: ({ getToggleAllRowsSelectedProps }) => (
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            ),
            Cell: ({ row }) => (
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            )
          },
          ...columns
        ]);
      }
    },
    useActions(actions)
  );

  useEffect(() => {
    setFilters(state.filters);
  }, [state.filters, setFilters]);

  return (
    <>
      <MaUTable {...getTableProps()} size={options.dense ? 'small' : 'medium'}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, i) => {
                let num = 0;
                let defRAlig = options.defaultAlign;

                if (actions.length) num++;
                if (options.selectable) num++;
                if (i > num) defRAlig = options.firstColumnAlign;
                return (
                  <TableCell
                    {...column.getHeaderProps()}
                    style={{ width: column.width }}
                    sx={{ p: 1 }}
                    align={column.align ? column.align : defRAlig}
                  >
                    {column.render('Header')}
                    {column.canFilter ? column.render('Filter') : null}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableHead>
        {!page.length && (
          <TableHead>
            <TableRow>
              <TableCell
                colSpan={headerGroups[0].headers.length}
                style={{ textAlign: 'center' }}
              >
                {lang.noItemsToShow}
              </TableCell>
            </TableRow>
          </TableHead>
        )}
        <TableBody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <TableRow {...row.getRowProps()}>
                {row.cells.map((cell, i) => {
                  let num = 0;
                  let defRAlig = options.defaultAlign;

                  if (actions.length) num++;
                  if (options.selectable) num++;
                  if (i > num) defRAlig = options.firstColumnAlign;

                  return (
                    <TableCell
                      {...cell.getCellProps()}
                      sx={{ p: 1 }}
                      align={cell.column.align ? cell.column.align : defRAlig}
                    >
                      {cell.render('Cell')}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </MaUTable>
      {options.paging !== false && <TablePagination
        component='div'
        count={rows.length}
        page={state.pageIndex}
        rowsPerPage={state.pageSize}
        onPageChange={(_, newPage) => gotoPage(newPage)}
        onRowsPerPageChange={e => setPageSize(e.target.value)}
      />}
    </>
  );
}

ReactTable.defaultProps = {
  options: {
    dense: false,
    selectable: false,
    defaultAlign: 'right',
    firstColumnAlign: 'right'
  },
  lang: {},
  actions: [],
  filters: [],
  setFilters: () => {}
};

ReactTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  filters: PropTypes.array,
  setFilters: PropTypes.func,
  lang: PropTypes.object.isRequired,
  options: PropTypes.shape({
    filtering: PropTypes.bool,
    paging: PropTypes.bool,
    selectable: PropTypes.bool,
    manualFilters: PropTypes.bool,
    dense: PropTypes.bool,
    defaultAlign: PropTypes.oneOf(['right', 'left']),
    firstColumnAlign: PropTypes.oneOf(['right', 'left']),
    pageSize:PropTypes.number
  })
};

export default ReactTable;
