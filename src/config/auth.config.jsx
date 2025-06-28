export const AUTH_CONFIG = {
    clientId: 'spa-client',
    authEndpoint: globalInitConfig.REACT_APP_API_AUTH_URL+'oauth2/authorize',
    tokenEndpoint: globalInitConfig.REACT_APP_API_AUTH_URL+'oauth2/token',
    redirectUri: window.location.origin+'/callback',
    logoutEndpoint: globalInitConfig.REACT_APP_API_AUTH_URL+'connect/logout',
    postLogoutRedirectUri: window.location.origin+"/logout",
    scope: 'openid api.read api.write'
};
