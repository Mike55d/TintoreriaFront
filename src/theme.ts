import { PaletteMode } from '@mui/material';
import { grey, red } from '@mui/material/colors';

export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
        primary: {
          light: '#64b5f6',
          main: '#1976d2',
          dark: '#303f9f',
          contrastText: '#FFFFFF'
        },
        secondary: {
          light: '#B2EBF2',
          main: '#00BCD4',
          dark: '#0097A7',
          contrastText: '#FFFFFF'
        },
        error: {
          main: red.A400
        },
        background: {
          default: grey[50]
        }
      }
      : {
        primary: {
          light: '#64b5f6',
          main: '#1976d2',
          dark: '#303f9f',
          contrastText: '#FFFFFF'
        },
        secondary: {
          light: '#B2EBF2',
          main: '#00BCD4',
          dark: '#0097A7',
          contrastText: '#FFFFFF'
        },
        error: {
          main: red.A400
        },
        background: {
          default: grey[900]
        }
      })
  }
});
