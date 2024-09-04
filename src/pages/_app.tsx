import { msalConfig } from "@/authConfig";
import Auth from "@/components/Auth";
import { useStore } from "@/store";
import { PageLayout } from "@/ui";
import { EventType, PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { Grid } from "@mui/material";
import { NextIntlClientProvider } from "next-intl";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";

export const msalInstance = new PublicClientApplication(msalConfig);

const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

msalInstance.addEventCallback((event: any) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
    const account = event.payload.account;
    msalInstance.setActiveAccount(account);
  }
});

export default function App({ Component, pageProps }: any) {
  const store = useStore(pageProps.initialReduxState);
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <NextIntlClientProvider
      locale="es"
      timeZone="Europe/Vienna"
      messages={pageProps.messages}
    >
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <MsalProvider instance={msalInstance}>
            {Component.auth ? (
              <Auth auth={Component.auth}>
                <PageLayout>
                  <Grid container justifyContent="center">
                    <Component {...pageProps} />
                  </Grid>
                </PageLayout>
              </Auth>
            ) : (
              <Component {...pageProps} />
            )}
          </MsalProvider>
        </Provider>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}
