import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import {
  AppBar as MuiAppBar,
  Avatar,
  Box,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  Paper,
  MenuList,
  ListItemText,
  Badge,
} from "@mui/material";
import router from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { setMobileOpen, setUser } from "../features/app/appSlice";
import { RootState } from "../store";
import UserBasicData from "./UserBasicData";
import SecureAvatar from "./SecureAvatar";
import Image from "next/image";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { Notification } from "../features/app/lib/hooks/api";
import ErrorIcon from "@mui/icons-material/Error";
import { useTranslations } from "next-intl";

export default function AppBar() {
  const t = useTranslations("HomePage");
  const { mobileOpen, user } = useSelector((state: RootState) => state.app);
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorElNotification, setAnchorElNotification] = React.useState(null);
  const dispatch = useDispatch();
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });
  const settings = ["Configuración", "Cerrar sesión"];
  const [logo, setLogo] = useState<string | undefined>();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleDrawerToggle = () => {
    dispatch(setMobileOpen(!mobileOpen));
  };

  const handleOpenNavMenu = (event: any) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: any) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSettingsClick = () => {
    router.push("/profile");
  };

  const handleLogoutClick = () => {
    window.localStorage.removeItem("authToken");
    dispatch(setUser());
    router.replace("/auth/signin");
  };

  return (
    <div style={{ display: "flex" }}>
      <MuiAppBar
        position="fixed"
        sx={{
          zIndex: (theme: any) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          {logo?.split(":")[1] && (
            <Grid
              width={150}
              height={45}
              marginBottom={1}
              marginTop={1}
              marginRight={1}
            >
              <div
                style={{ width: "100%", height: "100%", position: "relative" }}
              >
                <Image
                  alt="Org Logo"
                  src={logo ?? ""}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </Grid>
          )}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: "flex" } }}
          >
            {isMobile ? t("short_app_title") : t("full_app_title")}
          </Typography>

          <Box hidden={isMobile} sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <SecureAvatar
                  alt={user?.name}
                  url={user!.photo && `api/users/${user?.id}/photo`}
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: 6 }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <Box>
                <Grid sx={{ width: "15rem" }}>
                  <UserBasicData
                    avatarSize={"5rem"}
                    avatarOnClick={() => router.push("/profile")}
                  />
                  <Divider sx={{ margin: 2 }} />
                  <MenuItem onClick={handleSettingsClick}>
                    <ListItemIcon>
                      <ManageAccountsOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography textAlign="center">
                      {t("user_profile")}
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogoutClick}>
                    <ListItemIcon>
                      <LogoutOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography textAlign="center">{t("logout")}</Typography>
                  </MenuItem>
                </Grid>
              </Box>
            </Menu>
          </Box>
        </Toolbar>
      </MuiAppBar>
    </div>
  );
}
