/* eslint-disable react/display-name */
import { Checkbox } from '@mui/material';
import React from 'react';

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return <Checkbox size='small' ref={resolvedRef} {...rest} />;
  }
);

export default IndeterminateCheckbox;
