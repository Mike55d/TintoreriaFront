import React from 'react';
import {NumericFormat} from 'react-number-format';

interface NumberFormatProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  symbol?: string;
}

export const getCurrencyFormatter = (symbol: string) => {
  return React.forwardRef<any, NumberFormatProps>(
    function NumberFormatCustom(props, ref) {
      const { onChange, ...other } = props;
  
      return (
        <NumericFormat
          {...other}
          getInputRef={ref}
          onValueChange={values => {
            onChange({
              target: {
                name: props.name,
                value: values.value
              }
            });
          }}
          allowNegative={false}
          decimalScale={2}
          fixedDecimalScale={true}
          valueIsNumericString
          prefix='$ '
        />
      );
    }
  );
};

export const PositiveNumberFormat = React.forwardRef<any, NumberFormatProps>(
  function NumberFormatCustom(props, ref) {
    const { onChange, symbol, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={values => {
          onChange({
            target: {
              name: props.name,
              value: values.value
            }
          });
        }}
        allowNegative={false}
        fixedDecimalScale={true}
        decimalScale={0}
        valueIsNumericString
      />
    );
  }
);

export const NumberFormatCustom = React.forwardRef<any, NumberFormatProps>(
  function NumberFormatCustom(props, ref) {
    const { onChange, symbol, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={values => {
          onChange({
            target: {
              name: props.name,
              value: values.value
            }
          });
        }}
        allowNegative={false}
        decimalScale={2}
        fixedDecimalScale={true}
        valueIsNumericString
        prefix={`${symbol} `}
      />
    );
  }
);
