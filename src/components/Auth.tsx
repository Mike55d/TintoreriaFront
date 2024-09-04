import { useRouter } from "next/router";
import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { ColorModeContext } from '../../pages/_app';

import { fetchUserData, startInternalSession } from "../features/app/appSlice";
import { RootState } from "../store";
import { useMsal } from "@azure/msal-react";

export interface AuthProps {
  children: JSX.Element | JSX.Element[];
  auth: Record<string, any>;
}

export default function Auth({ children, auth }: AuthProps): JSX.Element {
  const router = useRouter();
  // const colorContext = useContext(ColorModeContext);
  const { user, loginError } = useSelector((state: RootState) => state.app);
  const dispatch = useDispatch<any>();
  let checker = true;

  React.useEffect(() => {
    if (loginError) {
      router.replace("/auth/signin");
    }

    const mstoken = window.localStorage.getItem("mstoken");
    console.log(mstoken);
    const localTokenExists = !!window.localStorage.getItem("authToken");
    const darkModeConfig = window.localStorage.getItem("darkMode");

    // if (darkModeConfig && darkModeConfig == '1' && colorContext.getMode() === 'light') {
    //   colorContext.setMode('dark');
    // }

    if (localTokenExists) {
      dispatch(fetchUserData());
    } else if (!mstoken) {
      router.replace("/auth/signin");
    } else {
      dispatch(
        startInternalSession("microsoft", {
          jwt: mstoken,
        })
      );
    }
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [checker, loginError, auth, router]);

  if (user) {
    return children as JSX.Element;
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return auth.loading;
}
