import CloseIcon from '@mui/icons-material/Close';
import {
  DialogTitle as MuiDialogTitle,
  IconButton,
  Typography
} from '@mui/material';
import React from 'react';

export default function DialogTitle(props) {
  const { children, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography sx={{ m: 0, p: 2 }} {...other}>
      <Typography variant='h6'>{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label='close'
          sx={{
            position: 'absolute',
            right: 1,
            top: 1,
            color: theme => theme.palette.grey[500]
          }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
}
