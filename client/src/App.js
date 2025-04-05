import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';
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

// Wrapper component to handle user sync
const AuthWrapper = ({ children }) => {
    const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();

    useEffect(() => {
        const syncUser = async () => {
            if (isAuthenticated && user) {
                try {
                    const token = await getAccessTokenSilently();
                    await axios.post('http://localhost:5050/api/users/sync', 
                        {
                            sub: user.sub,
                            email: user.email,
                            name: user.name,
                            picture: user.picture
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                } catch (error) {
                    console.error('Error syncing user:', error);
                }
            }
        };

        syncUser();
    }, [isAuthenticated, user, getAccessTokenSilently]);

    return children;
};

function App() {
    return (
        <Auth0Provider
            domain={auth0Config.domain}
            clientId={auth0Config.clientId}
            authorizationParams={{
                redirect_uri: auth0Config.redirectUri,
                audience: auth0Config.audience,
            }}
            useRefreshTokens={true}
            cacheLocation="localstorage"
        >
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <AuthWrapper>
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/create-post" element={<CreatePost />} />
                            <Route path="/posts" element={<PostList />} />
                        </Routes>
                    </AuthWrapper>
                </Router>
            </ThemeProvider>
        </Auth0Provider>
    );
}

export default App;
