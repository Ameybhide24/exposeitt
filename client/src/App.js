import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { auth0Config } from './auth0-config';

import Navbar from './components/Navbar';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import CreatePost from './components/CreatePost';
import PostList from './components/PostList';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1f35c7',
        },
        secondary: {
            main: '#4285f4',
        },
    },
});

function App() {
    return (
        <Auth0Provider
            domain={auth0Config.domain}
            clientId={auth0Config.clientId}
            authorizationParams={{
                redirect_uri: auth0Config.redirectUri,
                audience: auth0Config.audience,
                scope: 'openid profile email'
            }}
            useRefreshTokens={true}
            cacheLocation="localstorage"
        >
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/create-post" element={<CreatePost />} />
                        <Route path="/posts" element={<PostList />} />
                    </Routes>
                </Router>
            </ThemeProvider>
        </Auth0Provider>
    );
}

export default App;
