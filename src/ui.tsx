import React, { useEffect } from 'react';

import LayoutComponent from '../src/components/Layout';
import networkClient from './networkClient';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from './store';

export const PageLayout = (props: any) => {
  const { user } = useSelector((state: RootState) => state.app);

  // Page Layout is rendered only when exists a valid auth and user
  // so in this component we're going to stablish a socket connection with server
  useEffect(() => {
    if (!user?.token) {
      return;
    }
    const socket = io(process.env.NEXT_PUBLIC_SERVER as string, {
      auth: {
        token: user.token
      },
      transports: ['websocket']
    });
    socket.on('job-progress', (arg: any) => {
      console.log('recibed job progress', arg);
    });
    return () => {
      socket.disconnect();
    };
  }, [user?.token]);

  return <LayoutComponent>{props.children}</LayoutComponent>;
};
