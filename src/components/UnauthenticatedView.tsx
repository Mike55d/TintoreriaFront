import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';

import advIcon from '../../public/icons/adv-ic.webp';
import msIcon from '../../public/icons/microsoft.svg';
import { useTranslations } from 'next-intl';

export default function UnauthenticatedView() {
  const t = useTranslations("HomePage");

  return (
    <Box sx={{ bgcolor: 'background.default', flex: 1, height: '100vh' }}>
      <Container maxWidth='sm'>
        <Box marginTop={16} component={Paper} p={4}>
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <Image src={advIcon} alt='adv-ic' />
            </Grid>

            <Grid item xs={12}>
              <Typography variant='h6' align='center'>
                {t('wellcome_to_alm')}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant='contained'
                color='primary'
                fullWidth
                startIcon={
                  <Image src={msIcon} width={24} height={24} alt='microsoft' />
                }
              >
                {t('signin')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
