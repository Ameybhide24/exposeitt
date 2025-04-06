export const auth0Config = {
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
    audience: process.env.REACT_APP_AUTH0_AUDIENCE,
    redirectUri: window.location.origin,
    auth0Options: {
        overrides: {
            __tenant: process.env.REACT_APP_AUTH0_DOMAIN.split('.')[0],
            __token_issuer: process.env.REACT_APP_AUTH0_DOMAIN,
        },
        displayName: 'Whistleblower App',
        languageDictionary: {
            title: 'Login to continue to ExposeIt App',
            signUpTitle: 'Sign up for ExposeIt App',
            loginSubmitLabel: 'Continue',
            forgotPasswordTitle: 'Reset your password',
        },
        theme: {
            primaryColor: '#1f35c7',
            authButtons: {
                testConnection: {
                    displayName: 'Test Connection',
                    primaryColor: '#1f35c7',
                    foregroundColor: '#ffffff',
                    icon: 'https://example.com/icon.png'
                },
            },
            colors: {
                primary: '#1f35c7',
                page_background: '#f0f4ff',
            },
            fonts: {
                title: {
                    size: '24px',
                    weight: 600
                },
                input: {
                    size: '14px',
                    weight: 400
                }
            }
        }
    }
}; 