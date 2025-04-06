import React from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Card,
    CardContent,
    Button,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from 'framer-motion';
import '../styles/EnhancedUI.css';

const MotionCard = motion(Card);

const Home = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { loginWithRedirect } = useAuth0();

    const features = [
        {
            icon: <SecurityIcon sx={{ fontSize: 56, color: '#1f35c7' }} />,
            title: 'Secure',
            description: 'Your identity is protected with advanced encryption and authentication.',
            color: '#1f35c7'
        },
        {
            icon: <LockIcon sx={{ fontSize: 56, color: '#4285f4' }} />,
            title: 'Anonymous',
            description: 'Post your concerns without revealing your identity.',
            color: '#4285f4'
        },
        {
            icon: <PublicIcon sx={{ fontSize: 56, color: '#1f35c7' }} />,
            title: 'Accessible',
            description: 'Easy to use platform available to everyone.',
            color: '#1f35c7'
        }
    ];

    return (
        <Box sx={{ 
            background: 'var(--background-color)',
            minHeight: '100vh',
            py: { xs: 4, md: 8 },
            px: { xs: 2, md: 0 }
        }}>
            <Container maxWidth="lg">
                <Box sx={{ 
                    textAlign: 'center',
                    mb: { xs: 6, md: 8 }
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                        className="fade-in"
                    >
                        <Typography 
                            variant={isMobile ? "h3" : "h2"} 
                            component="h1" 
                            gutterBottom
                            className="enhanced-typography"
                            sx={{
                                fontWeight: 800,
                                background: 'var(--primary-gradient)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 2,
                                letterSpacing: '-0.02em',
                                fontSize: { xs: '2.5rem', md: '3.5rem' }
                            }}
                        >
                            Welcome to ExposeIt
                        </Typography>
                    </motion.div>
                    <Typography 
                        variant="h5" 
                        component="h2" 
                        gutterBottom 
                        className="enhanced-typography-secondary"
                        sx={{ 
                            mb: 4,
                            maxWidth: '600px',
                            mx: 'auto',
                            lineHeight: 1.4,
                            fontWeight: 500,
                            fontSize: { xs: '1.25rem', md: '1.5rem' }
                        }}
                    >
                        A secure platform for anonymous reporting
                    </Typography>
                    <Button
                        className="enhanced-button"
                        variant="contained"
                        size="large"
                        onClick={() => loginWithRedirect()}
                    >
                        Get Started
                    </Button>
                </Box>

                <Box className="features-grid">
                    {features.map((feature, index) => (
                        <MotionCard
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                            className="enhanced-card"
                            elevation={0}
                        >
                            <CardContent sx={{ 
                                textAlign: 'center', 
                                p: 4,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#ffffff'
                            }}>
                                <Box className="feature-icon">
                                    {feature.icon}
                                </Box>
                                <Typography 
                                    variant="h5" 
                                    component="h3" 
                                    gutterBottom
                                    className="enhanced-typography"
                                    sx={{ 
                                        fontWeight: 700,
                                        mb: 2,
                                        fontSize: '1.5rem',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    {feature.title}
                                </Typography>
                                <Typography 
                                    variant="body1" 
                                    className="enhanced-typography-secondary"
                                    sx={{ 
                                        lineHeight: 1.6,
                                        fontSize: '1.1rem',
                                        maxWidth: '280px',
                                        color: 'var(--text-secondary)',
                                        fontWeight: 400
                                    }}
                                >
                                    {feature.description}
                                </Typography>
                            </CardContent>
                        </MotionCard>
                    ))}
                </Box>

                <Paper 
                    elevation={0}
                    className="enhanced-card"
                    sx={{ 
                        mt: { xs: 6, md: 8 },
                        p: { xs: 3, md: 4 },
                        background: '#ffffff'
                    }}
                >
                    <Typography 
                        variant="h4" 
                        gutterBottom
                        className="enhanced-typography"
                        sx={{ 
                            fontWeight: 700,
                            mb: 4,
                            fontSize: { xs: '1.75rem', md: '2rem' },
                            color: 'var(--text-primary)'
                        }}
                    >
                        How It Works
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[
                            'Create an account using Auth0 authentication',
                            'Submit your anonymous report through our secure form',
                            'Your report will be encrypted and stored securely',
                            'Track the status of your report through your dashboard'
                        ].map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="step-container"
                            >
                                <div className="step-number">{index + 1}</div>
                                <Typography 
                                    variant="body1"
                                    className="enhanced-typography-secondary"
                                    sx={{ 
                                        fontSize: '1.1rem',
                                        fontWeight: 500,
                                        color: 'var(--text-secondary)'
                                    }}
                                >
                                    {step}
                                </Typography>
                            </motion.div>
                        ))}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Home; 