import { Button,Dialog } from "@mui/material";
import React from "react";

import DialogActions from "../../../components/dialog/DialogActions";
import DialogTitle from "../../../components/dialog/DialogTitle";
import { useTranslations } from "next-intl";

export type ResultDialogProps = {
  message?: string;
  onClose?: () => void;
};

function ResultDialog({ message, onClose }: ResultDialogProps) {
  const t = useTranslations();

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="result-dialog-title"
      open={!!message}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id="result-dialog-title" onClose={handleClose}>
        {message}
      </DialogTitle>

      <DialogActions>
        <Button autoFocus onClick={handleClose} color="primary">
          {t("accept")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ResultDialog;
