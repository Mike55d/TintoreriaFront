// Config object to be passed to Msal on creation

// productions values
let clientId = 'e0d9c69e-afc0-46dc-afc5-dc6a17b08b63'; // REVISAR: process.env.AZURE_CLIENT_ID as string;
let redirectUri = 'https://support.adv-ic.com/mscallback';
let authority = 'https://login.microsoftonline.com/a49a4fb3-1433-4b30-8010-e08a3c6be97b/';

if (process.env.NODE_ENV !== 'production') {
  redirectUri = 'http://localhost:3000/mscallback';
}

export const msalConfig = {
  auth: {
    clientId,
    authority,
    redirectUri,
    postLogoutRedirectUri: '/'
  }
};

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest = {
  scopes: ['User.Read']
};

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me'
};
