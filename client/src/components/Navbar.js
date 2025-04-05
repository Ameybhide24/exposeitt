import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const Navbar = () => {
    const { loginWithRedirect, logout, isAuthenticated } = useAuth0();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [anchorEl, setAnchorEl] = React.useState(null);

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

    return (
        <AppBar 
            position="fixed" 
            sx={{ 
                background: 'rgba(26, 26, 26, 0.8)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            <Container maxWidth="lg">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'white',
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #FF9800, #FF5722)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Whistleblower
                    </Typography>
                    <Box>
                        {!isAuthenticated ? (
                            <MotionButton
                                color="inherit"
                                onClick={() => loginWithRedirect()}
                                sx={{
                                    background: 'linear-gradient(45deg, #FF9800, #FF5722)',
                                    color: 'white',
                                    padding: '8px 24px',
                                    borderRadius: '30px',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #FF5722, #FF9800)',
                                    }
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Login
                            </MotionButton>
                        ) : isMobile ? (
                            <>
                                <IconButton
                                    edge="end"
                                    color="inherit"
                                    aria-label="menu"
                                    onClick={handleMenu}
                                >
                                    <MenuIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                    PaperProps={{
                                        sx: {
                                            background: 'rgba(26, 26, 26, 0.9)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                >
                                    <MenuItem 
                                        component={RouterLink} 
                                        to="/dashboard"
                                        onClick={handleClose}
                                        sx={{ color: 'white' }}
                                    >
                                        Dashboard
                                    </MenuItem>
                                    <MenuItem 
                                        component={RouterLink} 
                                        to="/create-post"
                                        onClick={handleClose}
                                        sx={{ color: 'white' }}
                                    >
                                        Create Post
                                    </MenuItem>
                                    <MenuItem 
                                        onClick={handleLogout}
                                        sx={{ color: 'white' }}
                                    >
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <MotionButton
                                    component={RouterLink}
                                    to="/dashboard"
                                    sx={{
                                        color: 'white',
                                        textTransform: 'none',
                                        '&:hover': {
                                            background: 'rgba(255, 255, 255, 0.1)',
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
                                        color: 'white',
                                        textTransform: 'none',
                                        '&:hover': {
                                            background: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Create Post
                                </MotionButton>
                                <MotionButton
                                    onClick={() => logout({ returnTo: window.location.origin })}
                                    sx={{
                                        color: 'white',
                                        textTransform: 'none',
                                        '&:hover': {
                                            background: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Logout
                                </MotionButton>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar; 