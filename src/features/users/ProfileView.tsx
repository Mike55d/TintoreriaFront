import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import React, { useContext, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AvatarManager from "../../components/AvatarManager";
import UserBasicData from "../../components/UserBasicData";
import { RootState } from "../../store";
import { useTranslations } from "next-intl";


export default function ProfileView() {
  const t = useTranslations();
  const { user } = useSelector((state: RootState) => state.app);
  const [photoUrl, setPhotoUrl] = useState<string | null>(user!.photoUrl);
  const [avatarMgrOpen, setAvatarMgrOpen] = useState(false);

  const onAvatarChange = (url: string | null, file: File | null) => {
    setPhotoUrl(url);
  };

  return (
    <>
      <Container maxWidth="md" fixed>
        <Grid
          component={Paper}
          container
          spacing={0}
          justifyContent={"center"}
          p={2}
        >
          <UserBasicData
            avatarSize={"10rem"}
            titleVariant="h5"
            avatarOnClick={() => setAvatarMgrOpen(true)}
            src={photoUrl || null}
          />
          <AvatarManager
            open={avatarMgrOpen}
            onChange={onAvatarChange}
            onClose={() => setAvatarMgrOpen(false)}
            allowChange={true}
            src={photoUrl}
          />
        </Grid>

        <Grid component={Paper} container spacing={0} mt={2} p={2}>
          <Grid item xs={12}>
            <Typography>{t("general_settings")}</Typography>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
