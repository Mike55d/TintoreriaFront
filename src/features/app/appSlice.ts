import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

import networkClient from "../../networkClient";
import { CTError } from "../../utils/errors";
import { AppSliceType, User } from "./lib/types";

const defaultAppState: AppSliceType = {
  msToken: "",
  mobileOpen: false,
};

const slice = createSlice({
  name: "app",
  initialState: defaultAppState,
  reducers: {
    setMSToken: (state, action: PayloadAction<string>) => {
      state.msToken = action.payload;
    },
    setUser: (state, action: PayloadAction<User | undefined>) => {
      window.localStorage.setItem(
        "darkMode",
        action.payload?.profile?.darkMode ? "1" : "0"
      );
      state.user = action.payload;
    },
    setMobileOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileOpen = action.payload;
    },
    setLoginError: (state, action: PayloadAction<number | undefined>) => {
      state.loginError = action.payload;
    },
  },
});

export const fetchUserData = () => {
  return async (dispatch: any, getState: any) => {
    try {
      const jwt = window.localStorage.getItem("authToken");
      if (!jwt) {
        return;
      }

      networkClient.setAuthorizationToken(jwt);

      const result = await networkClient.get("api/users/me");

      dispatch(
        setUser({
          id: result.data.id,
          name: result.data.name,
          email: result.data.email,
          token: jwt,
          status: result.data.status,
          photo: result.data.photo ? result.data.photo : undefined,
          permissions: result.data.permissions,
          roles: result.data.roles,
          support: result.data.support,
          photoUrl: result.data.photo
            ? `api/users/${result.data.id}/photo`
            : null,
          profile: {
            ...result.data.profile,
            filters: JSON.parse(result.data.profile.filters),
          },
        })
      );
    } catch (e: any) {
      console.log(e);
      window.localStorage.removeItem("authToken");
      dispatch(setLoginError((e as CTError).error));
    }
  };
};

export const startInternalSession = (provider: string, oauthSession: any) => {
  return async (dispatch: any, getState: any) => {
    let sessionUrl = "";
    switch (provider) {
      case "google":
        sessionUrl = "/sessions/start/google";
        break;
      case "microsoft":
        sessionUrl = "api/sessions/start/microsoft";
        break;
      default:
        sessionUrl = "/sessions/start";
    }

    if (!window.localStorage.getItem("uuid")) {
      window.localStorage.setItem("uuid", uuid());
    }

    try {
      let result = await networkClient.post(sessionUrl, {
        deviceId: window.localStorage.getItem("uuid"),
        accessToken: oauthSession.jwt,
      });

      const { user, token } = result.data;

      dispatch(
        setUser({
          id: user.id,
          name: user.name,
          email: user.email,
          token: token,
          photo: user.photo ? user.photo : undefined,
          permissions: user.permissions,
          status: user.status,
          support: result.data.support,
          roles: user.roles,
          photoUrl: user.photo ? `api/users/${user.id}/photo` : null,
          profile: {
            ...user.profile,
            filters: JSON.parse(user.profile.filters),
          },
        })
      );

      networkClient.setAuthorizationToken(token);
      // TODO: Implementar un anti-crsf en el server y en el cliente
      window.localStorage.setItem("authToken", token);
    } catch (e: any) {
      console.log(e);
      window.localStorage.removeItem("authToken");
      dispatch(setLoginError((e as CTError).error));
    }
  };
};

export default slice.reducer;
export const { setMobileOpen, setMSToken, setUser, setLoginError } =
  slice.actions;
