import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  InputLabel,
  Tab,
  Tabs,
  TextField,
  useTheme
} from '@mui/material';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditor,
  MenuButtonUnderline,
  MenuButtonHighlightColor,
  MenuButtonImageUpload,
  MenuButtonTextColor,
  MenuButtonAddTable,
  TableMenuControls,
  TableImproved,
  TableBubbleMenu,
  insertImages,
  ResizableImage
} from 'mui-tiptap';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { ChangeEventHandler, Ref, useCallback, useEffect, useState } from 'react';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { v4 as uuid } from 'uuid';
import networkClient from '../networkClient';
import { useTranslation } from 'next-i18next';
import { EditorOptions } from '@tiptap/core';
import sanitizeHtml from 'sanitize-html';
import { SANITIZE_CONFIG } from './constants';
import { DialogConfig } from '../utils/types';
import DialogTitle from './dialog/DialogTitle';
import { KeyboardDoubleArrowDownSharp } from '@mui/icons-material';

function fileListToImageFiles(fileList: FileList): File[] {
  // You may want to use a package like attr-accept
  // (https://www.npmjs.com/package/attr-accept) to restrict to certain file
  // types.
  return Array.from(fileList).filter(file => {
    const mimeType = (file.type || '').toLowerCase();
    return mimeType.startsWith('image/');
  });
}
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

type MuiRichTextEditorProps = {
  initialContent: string;
  rteRef: any;
  endpointFiles: string;
  editable?: boolean;
  title?: string;
  customHtml: string | null;
  setCustomHtml: (html: string) => void;
};

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
};

const CustomTabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const TextEditor: React.FC<MuiRichTextEditorProps> = ({
  initialContent,
  rteRef,
  endpointFiles,
  editable = true
}) => {
  const theme = useTheme();

  const handleNewImageFiles = useCallback(async (files: File[], insertPosition?: number) => {
    if (!rteRef.current?.editor) {
      return;
    }
    let newFiles: any = files.map(
      file =>
        new File([file], `${uuid()}.${file.name.split('.')[1]}`, {
          type: file.type
        })
    );
    await networkClient.post(endpointFiles, {}, {}, newFiles);
    newFiles = newFiles.map((file: any) => ({
      src: `${process.env.NEXT_PUBLIC_SERVER}/api/tickets/${file.name}/file`,
      alt: file.name
    }));
    insertImages({
      images: newFiles,
      editor: rteRef.current.editor,
      position: insertPosition
    });
  }, []);

  const handlePaste: NonNullable<EditorOptions['editorProps']['handlePaste']> = useCallback(
    (_view, event, _slice) => {
      if (!event.clipboardData) {
        return false;
      }

      const pastedImageFiles = fileListToImageFiles(event.clipboardData.files);
      if (pastedImageFiles.length > 0) {
        handleNewImageFiles(pastedImageFiles);
        return true;
      }
      return false;
    },
    [handleNewImageFiles]
  );

  return (
    <RichTextEditor
      ref={rteRef}
      editable={editable}
      editorProps={{
        handlePaste: handlePaste
      }}
      extensions={[
        StarterKit,
        Underline,
        Highlight.configure({ multicolor: true }),
        ResizableImage,
        Color,
        TextStyle,
        TableImproved.configure({
          resizable: true
        }),
        TableRow,
        TableHeader,
        TableCell
      ]} // Or any Tiptap extensions you wish!
      content={initialContent} // Initial content for the editor
      // Optionally include `renderControls` for a menu-bar atop the editor:
      renderControls={() => (
        <MenuControlsContainer>
          <MenuSelectHeading />
          <MenuDivider />
          <MenuButtonBold />
          <MenuButtonItalic />
          <MenuButtonUnderline />
          <MenuButtonImageUpload
            onPaste={event => console.log(event)}
            onUploadFiles={async files =>
              // For the sake of a demo, we don't have a server to upload the files
              // to, so we'll instead convert each one to a local "temporary" object
              // URL. This will not persist properly in a production setting. You
              // should instead upload the image files to your server, or perhaps
              // convert the images to bas64 if you would like to encode the image
              // data directly into the editor content, though that can make the
              // editor content very large.
              {
                const newFiles = files.map(
                  file =>
                    new File([file], `${uuid()}.${file.name.split('.')[1]}`, {
                      type: file.type
                    })
                );
                await networkClient.post(endpointFiles, {}, {}, newFiles);
                return newFiles.map(file => ({
                  src: `${process.env.NEXT_PUBLIC_SERVER}/api/tickets/${file.name}/file`,
                  alt: file.name
                }));
              }
            }
          />
          <MenuButtonHighlightColor
            swatchColors={[
              { value: '#595959', label: 'Dark grey' },
              { value: '#dddddd', label: 'Light grey' },
              { value: '#ffa6a6', label: 'Light red' },
              { value: '#ffd699', label: 'Light orange' },
              // Plain yellow matches the browser default `mark` like when using Cmd+Shift+H
              { value: '#ffff00', label: 'Yellow' },
              { value: '#99cc99', label: 'Light green' },
              { value: '#90c6ff', label: 'Light blue' },
              { value: '#8085e9', label: 'Light purple' }
            ]}
          />
          <MenuButtonTextColor
            defaultTextColor={theme.palette.text.primary}
            swatchColors={[
              { value: '#000000', label: 'Black' },
              { value: '#ffffff', label: 'White' },
              { value: '#888888', label: 'Grey' },
              { value: '#ff0000', label: 'Red' },
              { value: '#ff9900', label: 'Orange' },
              { value: '#ffff00', label: 'Yellow' },
              { value: '#00d000', label: 'Green' },
              { value: '#0000ff', label: 'Blue' }
            ]}
          />
          <MenuButtonAddTable />
          <TableBubbleMenu />
        </MenuControlsContainer>
      )}
    />
  );
};

const MuiRichTextEditor: React.FC<MuiRichTextEditorProps> = props => {
  const [tab, setTab] = useState(props.initialContent?.slice(0, 7) == '-!code-' ? 1 : 0);
  const { t } = useTranslation();
  const [changeEditorDialog, setChangeEditorDialog] = useState({
    open: false
  } as DialogConfig);

  const handleChange = (event: React.SyntheticEvent, newTab: number) => {
    if (props.editable == false) return;
    if (newTab == 0) {
      setChangeEditorDialog({
        open: true,
        title: t('change_html_editor'),
        message: t('question_change_html_editor'),
        onClose: (confirmed: boolean) => {
          setChangeEditorDialog({
            open: false
          });
          if (confirmed) {
            if (newTab == 0) {
              props.setCustomHtml(`-!edit-${props.customHtml?.slice(7)}`);
            }
            setTab(newTab);
          }
        }
      });
    } else {
      props.setCustomHtml(`-!code-${props.rteRef.current?.editor?.getHTML()}`);
      setTab(newTab);
    }
  };

  const handleChangeTextArea = (event: any) => {
    props.setCustomHtml(`-!code-${event.target.value}`);
  };

  useEffect(() => {
    props.setCustomHtml(props.initialContent);
  }, [props.initialContent]);

  if(props.customHtml == undefined) return null;

  return (
    <>
      <Box sx={{ marginTop: 2, width: '100%' }}>
        <Box>
          <InputLabel id="title">{props.title}</InputLabel>
          <Tabs value={tab} onChange={handleChange}>
            <Tab label={t('text_editor')} {...a11yProps(0)} />
            <Tab label={t('html_editor')} {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={tab} index={0}>
          <TextEditor {...props} initialContent={props.customHtml?.slice(7) ?? ''} />
        </CustomTabPanel>
        <CustomTabPanel value={tab} index={1}>
          <TextField
            variant="standard"
            multiline
            minRows={8}
            fullWidth
            placeholder={t('code_html')}
            onChange={handleChangeTextArea}
            value={props.customHtml?.slice(7)}
          />
        </CustomTabPanel>
      </Box>
      <Dialog
        open={changeEditorDialog.open}
        keepMounted
        onClose={() => changeEditorDialog.onClose!()}
      >
        <DialogTitle>{changeEditorDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{changeEditorDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => changeEditorDialog.onClose!()}>{t('cancel')}</Button>

          <Button
            variant="contained"
            color="error"
            onClick={() => changeEditorDialog.onClose!(true)}
          >
            {t('change_editor')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MuiRichTextEditor;
