import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
    useTheme,
    useMediaQuery,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    Avatar,
    Fade,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth0 } from '@auth0/auth0-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionButton = motion(Button);
const MotionIconButton = motion(IconButton);

const Navbar = () => {
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [anchorEl, setAnchorEl] = React.useState(null);
    const navigate = useNavigate();
    const [previousPath, setPreviousPath] = React.useState('/');

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout({ returnTo: window.location.origin });
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleLogin = () => {
        setPreviousPath(window.location.pathname);
        loginWithRedirect({
            appState: { returnTo: window.location.pathname },
            authorizationParams: {
                prompt: "login",
                screen_hint: "login",
            }
        });
    };

    React.useEffect(() => {
        if (isAuthenticated) {
            const params = new URLSearchParams(window.location.search);
            const returnTo = params.get('returnTo');
            if (returnTo) {
                navigate(returnTo);
            }
        }
    }, [isAuthenticated, navigate]);

    return (
        <AppBar 
            position="fixed" 
            sx={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(31, 53, 199, 0.1)',
                boxShadow: '0 4px 12px rgba(31, 53, 199, 0.08)',
            }}
        >
            <Container maxWidth="lg">
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {window.location.pathname !== '/' && (
                            <MotionIconButton
                                color="primary"
                                onClick={handleBack}
                                sx={{
                                    color: 'var(--primary-blue)',
                                    '&:hover': {
                                        background: 'rgba(31, 53, 199, 0.08)',
                                    }
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <ArrowBackIcon />
                            </MotionIconButton>
                        )}
                        <Typography
                            variant="h6"
                            component={RouterLink}
                            to="/"
                            sx={{
                                textDecoration: 'none',
                                fontWeight: 800,
                                background: 'var(--primary-gradient)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: { xs: '1.25rem', md: '1.5rem' },
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Whistleblower
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {!isAuthenticated ? (
                            <AnimatePresence>
                                <MotionButton
                                    color="primary"
                                    onClick={handleLogin}
                                    sx={{
                                        background: 'var(--primary-gradient)',
                                        color: 'white',
                                        padding: '8px 24px',
                                        borderRadius: '30px',
                                        textTransform: 'none',
                                        boxShadow: '0 4px 12px rgba(31, 53, 199, 0.2)',
                                        '&:hover': {
                                            boxShadow: '0 6px 16px rgba(31, 53, 199, 0.3)',
                                        }
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                >
                                    Login
                                </MotionButton>
                            </AnimatePresence>
                        ) : isMobile ? (
                            <>
                                <Tooltip title="Notifications" arrow>
                                    <MotionIconButton
                                        color="primary"
                                        sx={{
                                            color: 'var(--primary-blue)',
                                            '&:hover': {
                                                background: 'rgba(31, 53, 199, 0.08)',
                                            }
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <NotificationsIcon />
                                    </MotionIconButton>
                                </Tooltip>
                                <IconButton
                                    edge="end"
                                    onClick={handleMenu}
                                    sx={{ p: 0 }}
                                >
                                    <Avatar
                                        src={user?.picture}
                                        alt={user?.name}
                                        sx={{ 
                                            width: 40, 
                                            height: 40,
                                            border: '2px solid var(--primary-blue)',
                                        }}
                                    />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                    TransitionComponent={Fade}
                                    PaperProps={{
                                        sx: {
                                            background: 'rgba(255, 255, 255, 0.98)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(31, 53, 199, 0.1)',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 20px rgba(31, 53, 199, 0.12)',
                                            mt: 1.5,
                                        }
                                    }}
                                >
                                    <MenuItem 
                                        component={RouterLink} 
                                        to="/dashboard"
                                        onClick={handleClose}
                                        sx={{ 
                                            color: 'var(--text-primary)',
                                            borderRadius: '8px',
                                            mx: 1,
                                            my: 0.5,
                                            '&:hover': {
                                                background: 'rgba(31, 53, 199, 0.08)',
                                            }
                                        }}
                                    >
                                        Dashboard
                                    </MenuItem>
                                    <MenuItem 
                                        component={RouterLink} 
                                        to="/create-post"
                                        onClick={handleClose}
                                        sx={{ 
                                            color: 'var(--text-primary)',
                                            borderRadius: '8px',
                                            mx: 1,
                                            my: 0.5,
                                            '&:hover': {
                                                background: 'rgba(31, 53, 199, 0.08)',
                                            }
                                        }}
                                    >
                                        Create Post
                                    </MenuItem>
                                    <MenuItem 
                                        onClick={handleLogout}
                                        sx={{ 
                                            color: '#d32f2f',
                                            borderRadius: '8px',
                                            mx: 1,
                                            my: 0.5,
                                            '&:hover': {
                                                background: 'rgba(211, 47, 47, 0.08)',
                                            }
                                        }}
                                    >
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <>
                                <Tooltip title="Notifications" arrow>
                                    <MotionIconButton
                                        color="primary"
                                        sx={{
                                            color: 'var(--primary-blue)',
                                            '&:hover': {
                                                background: 'rgba(31, 53, 199, 0.08)',
                                            }
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <NotificationsIcon />
                                    </MotionIconButton>
                                </Tooltip>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <MotionButton
                                        component={RouterLink}
                                        to="/dashboard"
                                        sx={{
                                            color: 'var(--text-primary)',
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            '&:hover': {
                                                background: 'rgba(31, 53, 199, 0.08)',
                                            }
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Dashboard
                                    </MotionButton>
                                    <MotionButton
                                        component={RouterLink}
                                        to="/create-post"
                                        sx={{
                                            color: 'var(--text-primary)',
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            '&:hover': {
                                                background: 'rgba(31, 53, 199, 0.08)',
                                            }
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Create Post
                                    </MotionButton>
                                    <MotionButton
                                        onClick={handleLogout}
                                        sx={{
                                            color: '#d32f2f',
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            '&:hover': {
                                                background: 'rgba(211, 47, 47, 0.08)',
                                            }
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Logout
                                    </MotionButton>
                                </Box>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar; 