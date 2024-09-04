import { Avatar, AvatarProps } from '@mui/material';
import React, { useEffect, useState } from 'react';
import networkClient from '../networkClient';

export interface SecureAvatarProps extends AvatarProps {
  url?: string | null;
}

export default function SecureAvatar(props: SecureAvatarProps) {
  const [src, setSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    const isUrlData = props.url?.includes('data:');

    if (!props.url && !isUrlData) {
      setSrc(undefined);
      return;
    }

    if (isUrlData) {
      setSrc(props.url!);
      return;
    }

    networkClient
      .getFileUrl(props.url!)
      .then(result => {
        setSrc(result);
      })
      .catch(e => {});
  }, [props.url]);

  return (
    <Avatar {...props} src={src}>
      {props.children}
    </Avatar>
  );
}
