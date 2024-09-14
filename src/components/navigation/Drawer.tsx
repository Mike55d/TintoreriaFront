import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import {
  Box,
  Collapse,
  Divider,
  Drawer as MaterialUIDrawer,
  Grid,
  List,
} from "@mui/material";
import { motion } from "framer-motion";
import React, { useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { setMobileOpen, setUser } from "../../features/app/appSlice";
import { RootState } from "../../store";
import { DRAWER_WIDTH } from "../../utils/constants";
import router from "next/router";
import UserBasicData from "../UserBasicData";
import NavItem, { NavItemProps } from "./NavItem";
import { useTranslations } from "next-intl";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import SettingsIcon from "@mui/icons-material/Settings";
import ReceiptIcon from "@mui/icons-material/Receipt";

const drawerVariants = {
  hidden: { x: -DRAWER_WIDTH, zIndex: 9999, height: "100vh" },
  enter: { x: 0, zIndex: 9999, height: "100vh" },
  exit: { x: -DRAWER_WIDTH, zIndex: 9999, height: "100vh" },
};

export default function Drawer() {
  const t = useTranslations();
  const { user } = useSelector((state: RootState) => state.app);
  const { mobileOpen } = useSelector((state: RootState) => state.app);
  const dispatch = useDispatch();
  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  const filterDrawer = (items: NavItemProps[]) => {
    let newItems = items.filter((item) => {
      return (
        !item.permissions ||
        !item.permissions.length ||
        user!.permissions.some((x: any) => item.permissions!.includes(x))
      );
    });
    for (const item of newItems) {
      if (item.items) {
        item.items = filterDrawer(item.items);
      }
    }
    return newItems;
  };

  const filteredDrawerItems = useMemo(() => {
    if (!user) {
      return [];
    }

    // Definiciones del menú lateral
    const rawDrawer: NavItemProps[] = [
      {
        href: "/#",
        text: t("dashboard"),
        icon: DashboardIcon,
      },
      {
        href: "/clients",
        text: t("clients"),
        icon: PeopleIcon,
      },
      {
        href: "/companies",
        text: t("companies"),
        icon: ApartmentIcon,
      },
      {
        href: "/settings",
        text: t("settings"),
        icon: SettingsIcon,
      },
      {
        href: "/orders",
        text: t("orders"),
        icon: ReceiptIcon,
      },
    ];

    return filterDrawer(rawDrawer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDrawerToggle = () => {
    dispatch(setMobileOpen(!mobileOpen));
  };

  const handleLogoutClick = () => {
    window.localStorage.removeItem("authToken");
    dispatch(setUser());
    router.replace("/auth/signin");
  };

  const drawer = (
    <>
      <Grid mt={8} />

      <Grid container>
        <Grid item xs={12}>
          <Collapse in={isMobile}>
            <UserBasicData avatarSize={"5rem"} />
            <Divider sx={{ mt: 2 }} />
          </Collapse>
        </Grid>

        <Grid item xs={12}>
          <List>
            {filteredDrawerItems.map((item, index) => (
              <NavItem {...item} key={index} />
            ))}

            {isMobile && (
              <>
                <Divider />
                <NavItem
                  icon={LogoutIcon}
                  text={t("logout")}
                  onClick={handleLogoutClick}
                />
              </>
            )}
          </List>
        </Grid>
      </Grid>
    </>
  );

  const container =
    typeof window !== undefined ? () => window.document.body : undefined;

  return (
    <Box
      component="nav"
      sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      <motion.div
        key="drawer"
        variants={drawerVariants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{ type: "linear" }}
      >
        <MaterialUIDrawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </MaterialUIDrawer>

        <MaterialUIDrawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </MaterialUIDrawer>
      </motion.div>
    </Box>
  );
}
