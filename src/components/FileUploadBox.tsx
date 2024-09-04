import { Grid, IconButton, Paper, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { FileIcon, defaultStyles } from 'react-file-icon';
import { getFileExt } from '../utils/utils';
import { useTranslations } from 'next-intl';

export interface FUBFile {
  id?: string;
  name: string;
  size: number;
  file?: File;
  deleted?: boolean
}

export interface FileUploadBoxProps {
  files: FUBFile[];
  readOnly?: boolean;
  onFilesChange?: (files: FUBFile[], deletedFile?: FUBFile) => void;
  onFileClick?: (file: FUBFile) => void;
  multiple?:boolean;
}

export default function FileUploadBox(props: FileUploadBoxProps) {
  const t = useTranslations("HomePage");
  let fileUploader = useRef<HTMLInputElement>(null);

  const handleAddFilesClick = () => {
    const mouseClickEvents = ['mousedown', 'click', 'mouseup'];
    mouseClickEvents.forEach(mouseEventType =>
      fileUploader.current!.dispatchEvent(
        new MouseEvent(mouseEventType, {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1
        })
      )
    );
  };

  const handleInputFileChange = (e: any) => {
    let newFiles = props.files;

    if (e.target.files) {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const existentFile = newFiles.find(
          x => x.name === file.name && x.size === file.size
        );
        if (!existentFile) {
          newFiles.push({
            name: file.name,
            size: file.size,
            file: file
          });
        }
      }
    }
    if(props.multiple != undefined && props.multiple == false){
      const file = e.target.files[0];
      newFiles = [{
        name: file.name,
        size: file.size,
        file: file
      }];
    }
    e.target.value = '';
    props.onFilesChange!([...newFiles]);
  };

  const handleDeleteFileClick = (e:any,file: FUBFile) => {
    e.stopPropagation();
    let newFiles = props.files.filter(
      x => x.name !== file.name && x.size !== file.size
    );

    props.onFilesChange!([...newFiles], file);
  };

  return (
    <Grid container spacing={2}>
      {!props.readOnly && (
        <Grid item xs={12} sm={6}>
          <input
            multiple={props.multiple === undefined ? true : props.multiple}
            ref={fileUploader}
            type={'file'}
            style={{ display: 'none' }}
            onChange={handleInputFileChange}
          />

          <Grid
            onClick={handleAddFilesClick}
            container
            sx={{
              border: 1,
              borderColor: 'primary.main',
              borderStyle: 'dashed',
              borderRadius: '5px',
              minHeight: '10rem',
              padding: 2,
              cursor: 'pointer'
            }}
          >
            <Grid item xs={4} m={'auto'}>
              <Image
                alt={''}
                src={'/icons/file_add.svg'}
                width={'100%'}
                height={'100%'}
              />
            </Grid>
            <Grid item xs={8} sx={{ margin: 'auto', padding: 2 }}>
              <Typography variant='subtitle1'>{t('select_files')}</Typography>
              <Typography variant='caption' flexWrap={'wrap'}>
                {t('file_max')}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      )}
      <Grid item xs={12} sm={6}>
        {props.files.map(x => (
          <Grid
            component={Paper}
            p={1}
            mb={1}
            key={x.name + x.size}
            sx={{ cursor: (!x.file && (props.readOnly || props.onFileClick)) ? 'pointer' : 'auto' }}
            onClick={() => {
              if (props.onFileClick && !x.file) {
                props.onFileClick(x);
              }
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={2} maxWidth={'3rem'}>
                <FileIcon
                  extension={getFileExt(x.name)}
                  {...(defaultStyles as any)[getFileExt(x.name)!]}
                />
              </Grid>
              <Grid item sx={{ flexGrow: 1 }}>
                {!props.readOnly && (
                  <IconButton
                    sx={{
                      float: 'right',
                      top: 5,
                      cursor: 'pointer',
                      color: theme => theme.palette.grey[500]
                    }}
                    onClick={ e => {
                      handleDeleteFileClick(e,x);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
                <Typography>{x.name}</Typography>
                <Typography variant='caption'>{`${(x.size / 1024).toFixed(
                  0
                )} KB`}{x.file && ` (${t('new')})`}</Typography>
              </Grid>
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}
