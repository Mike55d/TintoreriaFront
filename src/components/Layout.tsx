import { Box, Container, Toolbar, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import React from 'react';

import AppBar from './AppBar';
import Drawer from './navigation/Drawer';

const Offset = styled('div')(({ theme }) => {
  // @ts-ignore
  return theme.mixins?.toolbar;
});

const variants = {
  hidden: { opacity: 0, y: -50 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 0 }
};

export default function Layout({ children }: any) {
  const router = useRouter();

  const getView = () => {
    return (
      <>
        <Box sx={{ display: 'flex' }}>
          <AppBar />
          <Drawer />
        </Box>
        <motion.main
          style={{ flexGrow: 1 }}
          key={router.route}
          variants={variants}
          initial='hidden'
          animate='enter'
          exit='exit'
        >
          <Box sx={{ bgcolor: 'background.default', p: 3 }}>
            <Offset />
            <Container maxWidth='xl' fixed>
              {children}
            </Container>
          </Box>
        </motion.main>
      </>
    );
  };

  return <div style={{ display: 'flex' }}>{getView()}</div>;
}
