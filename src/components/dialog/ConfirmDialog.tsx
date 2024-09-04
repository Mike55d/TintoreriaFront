import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import React from 'react';

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  onClose?: (confirmed: boolean) => void;
  content?: string;
  disableOk?: boolean;
  disableCancel?: boolean;
  cancelText?: string;
}

export default function ConfirmDialog({
  open,
  title,
  content,
  disableOk,
  disableCancel,
  cancelText = 'cancel',
  onClose
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  const handleClose = () => {
    if (onClose) {
      onClose(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby={`confirm-${title}`}
      aria-describedby='confirm-description'
      fullWidth
      maxWidth='sm'
    >
      <DialogTitle id='confirm-title'>{title}</DialogTitle>
      {content && (
        <DialogContent>
          <DialogContentText id='confirm-description'>
            {content}
          </DialogContentText>
        </DialogContent>
      )}

      <DialogActions>
        <Button hidden={disableCancel} onClick={handleClose}>
          {t(cancelText)}
        </Button>

        <Button
          disabled={disableOk}
          color='primary'
          autoFocus
          onClick={() => {
            if (onClose) {
              onClose(true);
            }
          }}
        >
          {t('accept')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
