import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Collapse,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { fetchUserData, startInternalSession } from "../app/appSlice";
import { makeStyles } from "@mui/styles";
import PasswordForm from "./PasswordForm";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";
import { useTranslations } from "next-intl";

const useStyles = makeStyles((theme: any) => ({
  buttons: {
    height: 52,
    marginTop: 10,
  },
  imgContainer: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    height: "100%",
    width: "100%",
    [theme.breakpoints?.up(750)]: {
      height: "40%",
      width: "40%",
    },
  },
}));

export default function Login() {
  const classes = useStyles();
  const t = useTranslations();
  const { user, loginError } = useSelector((state: RootState) => state.app);
  const router = useRouter();
  const dispatch = useDispatch<any>();
  const [email, setEmail] = useState<string>();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const MicrosoftIcon = (
    <Avatar variant="square" src="/icons/Microsoft_icon.svg.png" />
  );
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      window.localStorage.removeItem("mstoken");
      await instance.clearCache();
      await instance.loginRedirect(loginRequest);
    } catch (e: any) {}
  };

  useEffect(() => {
    const localTokenExists = !!window.localStorage.getItem("authToken");
    const mstoken = window.localStorage.getItem("mstoken");

    if (user) {
      router.replace("/");
    } else if (localTokenExists) {
      dispatch(fetchUserData());
    }
  }, [router, loginError, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loginButtonTheme = createTheme({
    palette: {
      primary: {
        main: grey[50],
      },
    },
  });

  const authHandler = (err: any, data: any) => {
    console.log(err, data);
  };

  return (
    <Box sx={{ bgcolor: "background.default", flex: 1 }}>
      <Container maxWidth="xs">
        <Box marginTop={16} component={Paper} paddingX={4}>
          <Grid container spacing={2} justifyContent={"center"}>
            <Grid item xs={12} />
            <Grid item xs={12} sx={{ textAlign: "center", maxWidth: "10rem" }}>
              <Grid className={classes.imgContainer}>
                {/* <Image layout="intrinsic" src={clientLogo} alt="adv-ic" /> */}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" align="center">
                {t("app_title")}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" align="center">
                {email}
              </Typography>
            </Grid>
            <Grid item xs={12} marginBottom={4}>
              <ThemeProvider theme={loginButtonTheme}>
                <Button
                  variant="contained"
                  startIcon={MicrosoftIcon}
                  fullWidth
                  onClick={handleLogin}
                  className={classes.buttons}
                >
                  {t("microsoft_signin")}
                </Button>
              </ThemeProvider>

              <Collapse in={!!loginError} unmountOnExit>
                <Grid item xs={12} marginTop={2}>
                  <Alert severity="error">
                    <AlertTitle>
                      {t("unable_to_get_access_from_3c_title")}
                    </AlertTitle>
                    {t("unable_to_get_access_from_3c_details")}
                  </Alert>
                </Grid>
              </Collapse>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
