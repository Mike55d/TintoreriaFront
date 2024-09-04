import MuiDialogActions from '@mui/material/DialogActions';
import { styled } from '@mui/system';

const DialogActions = styled(MuiDialogActions)(theme => ({
  root: {
    margin: 0,
    padding: 1//theme.spacing(1)
  }
}));

export default DialogActions;
