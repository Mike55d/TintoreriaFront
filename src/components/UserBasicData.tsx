import {
  Avatar,
  Box,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import { RootState } from "../store";
import SecureAvatar from "./SecureAvatar";
import { Variant } from "@mui/material/styles/createTypography";
import { useTranslations } from "next-intl";

export interface UserBasicDataProps {
  avatarSize?: number | string;
  titleVariant?: Variant;
  avatarOnClick?: (e: any) => void;
  src?: string | null;
}

export default function UserBasicData(props: UserBasicDataProps) {
  const t = useTranslations("HomePage");
  const router = useRouter();

  const { user } = useSelector((state: RootState) => state.app);
  return (
    <Grid container spacing={0} justifyContent={"center"}>
      <SecureAvatar
        sx={{
          height: props.avatarSize || "auto",
          width: props.avatarSize || "auto",
          cursor: "pointer",
        }}
        onClick={props.avatarOnClick}
        alt={user?.name}
        url={
          props.src || typeof props.src === "undefined"
            ? props.src || (user!.photo && `api/users/${user?.id}/photo`)
            : undefined
        }
      />
      <Grid item xs={12} mt={1}>
        <Typography variant={props.titleVariant || "subtitle1"} align="center">
          {user?.name}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2" align="center">
          {user?.email}
        </Typography>
      </Grid>
    </Grid>
  );
}
/*

<Grid
container
spacing={2}
mb={2}
justifyContent={'center'}
>
<Grid item xs={12} textAlign={'center'}>
  <Avatar
    sx={{ height: '5rem', width: '5rem' }}
    alt={user?.name}
    src='/icons/client-icon.png3'
  />
</Grid>
<Grid item xs={12}>
  <Typography>
    {user?.name}
  </Typography>
</Grid>
</Grid>

*/
