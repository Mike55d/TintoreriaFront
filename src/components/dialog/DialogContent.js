import MuiDialogContent from '@mui/material/DialogContent';
import { styled } from '@mui/system';

const DialogContent = styled(MuiDialogContent)(({theme}) => ({
  root: {
    padding: theme.spacing(2)
  }
}));

export default DialogContent;
