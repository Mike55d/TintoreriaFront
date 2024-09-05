import {
  Button,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
  DialogContent,
  Avatar,
  SvgIconTypeMap,
  Divider,
  Theme,
  IconButton,
  Typography,
  Grid,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import SecureAvatar from './SecureAvatar';
import { useTranslations } from 'next-intl';

export interface AvatarManagerProps {
  onChange?: (img: string | null, file: File | null) => void;
  onClose: () => void;
  allowChange?: boolean;
  title?: string;
  message?: string;
  icon?: JSX.Element;
  alt?: string;
  src?: string | null;

  open: boolean;
}

export default function AvatarManager(props: AvatarManagerProps) {
  const t = useTranslations();
  const [currImgUrl, setCurrImgUrl] = useState(
    props.src as string | null | undefined
  );
  const [currImg, setCurrImg] = useState(null as File | null);

  const handleClose = () => {
    setCurrImg(null);
    setCurrImgUrl(null);
    props.onClose();
  };

  useEffect(() => {
    if (props.open) {
      setCurrImg(null);
      setCurrImgUrl(props.src);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

  const handlePhotoSelectorChange = (e: any) => {
    if (!e || !e.target.files) {
      return;
    }

    e.preventDefault();
    setCurrImg(e.target.files[0]);
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);

    reader.onloadend = () => {
      setCurrImgUrl(reader.result as string);
    };

    e.target.value = '';
  };

  useEffect(() => {
    if (!props.src) {
      setCurrImgUrl(undefined);
    }
  }, [props.src]);
  
  return (
    <Dialog
      open={props.open}
      keepMounted
      onClose={handleClose}
      fullWidth
      maxWidth='xs'
    >
      <DialogTitle>
        <Typography>
          {props.title || props.allowChange
            ? t('change_photo')
            : t('view_photo')}
        </Typography>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme: Theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ margin: 'auto', height: 'auto' }}>
        <Grid container sx={{ justifyContent: 'center', textAlign: 'center' }}>
          <SecureAvatar
            variant='square'
            sx={{
              height: '100%',
              width: '100%',
              maxWidth: '20rem',
              maxHeight: '20rem'
            }}
            alt={props.alt}
            url={currImgUrl || undefined}
          >
            {props.icon}
          </SecureAvatar>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} m={2}>
            {props.allowChange && (
              <Button
                variant='outlined'
                color='error'
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setCurrImg(null);
                  setCurrImgUrl(null);
                }}
              >
                {t('delete_photo')}
              </Button>
            )}
            <input
              accept='Image/*'
              style={{ display: 'none' }}
              id='photo-selector'
              onChange={handlePhotoSelectorChange}
              type='file'
            />
            <label htmlFor='photo-selector'>
              {props.allowChange && (
                <Button
                  hidden={!props.allowChange}
                  component='span'
                  variant='contained'
                  startIcon={<FileUploadIcon />}
                >
                  {t('upload_photo')}
                </Button>
              )}
            </label>
          </Stack>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button
          hidden={props.allowChange}
          onClick={() => {
            if (props.onChange) {
              props.onChange(currImgUrl || null, currImg);
            }

            handleClose();
          }}
        >
          {t('ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
