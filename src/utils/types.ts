export interface DialogConfig {
  open: boolean,
  message?: string;
  title?: string;
  onClose?: (confirm?: any) => void;
}