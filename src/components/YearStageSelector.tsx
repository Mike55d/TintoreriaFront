/* eslint-disable react-hooks/exhaustive-deps */

import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Box,
  IconButton
} from '@mui/material';
import { format } from 'date-fns';
import { isArray } from 'lodash';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import { strToFnsLocale } from '../utils/utils';
import { Unstable_DateField as DateField } from '@mui/x-date-pickers/DateField';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { DateRangePicker, DateRange } from 'mui-daterange-picker';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  dateRangePicker: {
    position: 'absolute'
  }
});

export enum YearStageSelectorType {
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  BiAnnual = 'bi_annual',
  Yearly = 'yearly',
  Custom = 'custom'
}

export interface YearStageSelectorFields {
  /**
   * Tipo de selector
   * Default: monthly
   */
  selectorType?: YearStageSelectorType;

  /**
   * Fecha de inicio para el selector. Solo para tipo 'custom'
   */
  startDate?: Date;

  /**
   * Fecha final para el selector. Solo para tipo 'custom'
   */
  endDate?: Date;

  /**
   * Número de trimestre o semestre seleccionado
   */
  stage?: number;

  /**
   * Número de mes seleccionado
   */
  month?: number;

  /**
   * Año seleccionado
   */
  year?: number;

  /**
   * Sin criterio de fecha
   */
  allDates?: boolean;
}

export interface YearStageSelectorProps {
  value: YearStageSelectorFields;

  /**
   * Mostrar el selector de tipo de período
   * Default: `true`
   */
  showSelectorType?: boolean;

  /**
   * Mostrar el selector de año.
   * Solo visible para períodos mensuales, trimestrales y semestrales. Se ignora en otros períodos.
   * Este valor en `false` ignora los campos 'minDate' y 'maxDate'.
   *
   * Default `true`
   */
  showYearSelector?: boolean;

  /**
   * Fecha inicial válida para el selector
   */
  minDate?: Date;

  /**
   * Fecha final válida para el selector
   */
  maxDate?: Date;

  onChange: (value: YearStageSelectorFields) => void;
}

type DataChange = {
  field: string;
  value: any;
};

export default function YearStageSelector(props: YearStageSelectorProps) {
  const { t, i18n } = useTranslation();
  const { showSelectorType = true, showYearSelector = true, onChange } = props;
  const { selectorType, startDate, endDate, month, stage, year } = props.value;
  const [open, setOpen] = useState(false);
  const startYear = 2022;
  const classes = useStyles();

  function handleDataChange(changes: string | DataChange[], value?: any) {
    let newState: any = {
      ...props.value
    };

    if (!isArray(changes)) {
      changes = [
        {
          field: changes,
          value
        }
      ];
    }

    for (const { field, value } of changes) {
      newState[field] = value;

      if (field === 'selectorType' && startDate) {
        newState.stage =
          value === YearStageSelectorType.BiAnnual
            ? +(startDate.getMonth() > 5)
            : Math.trunc(startDate.getMonth() / 3);
      }
    }

    onChange(newState);
  }

  const monthList = useMemo(() => {
    let months: string[] = [];
    for (let i = 0; i < 12; i++) {
      const currDate = new Date(`${i + 1}/01/1900`);
      const locale = strToFnsLocale(i18n.language);

      let monthName = format(currDate, 'LLLL', {
        locale
      });
      monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      months.push(monthName);
    }
    return months;
  }, [i18n.language]);

  const yearList = useMemo(() => {
    const years: string[] = [];
    const currDate = new Date();
    for (let i = startYear; i <= currDate.getFullYear(); i++) {
      years.push(`${i}`);
    }
    return years;
  }, []);

  return (
    <Grid container spacing={2}>
      {showSelectorType && (
        <Grid item md={3} sm={6} xs={12}>
          <FormControl variant="standard" fullWidth>
            <InputLabel id="yss-sel-type">{t('type')}</InputLabel>
            <Select
              labelId="yss-sel-type"
              value={selectorType}
              onChange={e => handleDataChange('selectorType', e.target.value)}
            >
              {Object.values(YearStageSelectorType).map(x => (
                <MenuItem value={x} key={x}>
                  {t(x)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}

      {selectorType === YearStageSelectorType.Monthly && (
        <Grid item md={3} sm={6} xs={12}>
          <FormControl variant="standard" fullWidth>
            <InputLabel id="yss-sel-month">{t('month')}</InputLabel>
            <Select
              labelId="yss-sel-month"
              value={month}
              onChange={e => handleDataChange('month', e.target.value)}
            >
              {monthList.map((x, i) => (
                <MenuItem value={i} key={i}>
                  {x}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}

      {(selectorType === YearStageSelectorType.Quarterly ||
        selectorType === YearStageSelectorType.BiAnnual) && (
        <Grid item md={3} sm={6} xs={12}>
          <FormControl variant="standard" fullWidth>
            <InputLabel id="yss-sel-stage">
              {t(selectorType === YearStageSelectorType.Quarterly ? 'quarter' : 'semester')}
            </InputLabel>
            <Select
              labelId="yss-sel-stage"
              value={stage}
              onChange={e => handleDataChange('stage', e.target.value)}
            >
              <MenuItem value={0}>1</MenuItem>
              <MenuItem value={1}>2</MenuItem>
              {selectorType === YearStageSelectorType.Quarterly && <MenuItem value={2}>3</MenuItem>}
              {selectorType === YearStageSelectorType.Quarterly && <MenuItem value={3}>4</MenuItem>}
            </Select>
          </FormControl>
        </Grid>
      )}

      {selectorType != YearStageSelectorType.Custom && showYearSelector && (
        <Grid item md={3} sm={6} xs={12}>
          <FormControl variant="standard" fullWidth>
            <InputLabel id="yss-sel-year">{t('year')}</InputLabel>
            <Select
              labelId="yss-sel-year"
              value={year}
              onChange={e => handleDataChange('year', e.target.value)}
            >
              {yearList.map(x => (
                <MenuItem value={x} key={x}>
                  {x}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}
      {selectorType === YearStageSelectorType.Custom && (
        <Grid item md={6} sm={6} xs={12}>
          <FormControl variant="standard" fullWidth>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                '& > :not(style)': { ml: 1 }
              }}
            >
              <DateField value={startDate} label={t('startDate')} format="dd/MM/yyyy" />
              <DateField value={endDate} label={t('endDate')} format="dd/MM/yyyy" />
              <IconButton aria-label="delete" onClick={() => setOpen(true)}>
                <DateRangeIcon />
              </IconButton>
            </Box>
            <DateRangePicker
              wrapperClassName={classes.dateRangePicker}
              open={open}
              toggle={() => setOpen(!open)}
              onChange={range =>
                handleDataChange([
                  {
                    field: 'startDate',
                    value: range.startDate
                  },
                  {
                    field: 'endDate',
                    value: range.endDate
                  }
                ])
              }
            />
          </FormControl>
        </Grid>
      )}
    </Grid>
  );
}
