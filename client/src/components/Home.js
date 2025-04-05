import React from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
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

const MotionCard = motion(Card);

const Home = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { loginWithRedirect } = useAuth0();

    const features = [
        {
            icon: <SecurityIcon sx={{ fontSize: 40 }} />,
            title: 'Secure',
            description: 'Your identity is protected with advanced encryption and authentication.',
            color: '#4CAF50'
        },
        {
            icon: <LockIcon sx={{ fontSize: 40 }} />,
            title: 'Anonymous',
            description: 'Post your concerns without revealing your identity.',
            color: '#2196F3'
        },
        {
            icon: <PublicIcon sx={{ fontSize: 40 }} />,
            title: 'Accessible',
            description: 'Easy to use platform available to everyone.',
            color: '#FF9800'
        }
    ];

    return (
        <Box sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            minHeight: '100vh',
            py: 8
        }}>
            <Container maxWidth="lg">
                <Box sx={{ 
                    textAlign: 'center',
                    mb: 8,
                    color: 'white'
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Typography 
                            variant={isMobile ? "h3" : "h2"} 
                            component="h1" 
                            gutterBottom
                            sx={{
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #FF9800, #FF5722)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Welcome to Whistleblower
                        </Typography>
                    </motion.div>
                    <Typography 
                        variant="h5" 
                        component="h2" 
                        gutterBottom 
                        sx={{ 
                            color: 'rgba(255, 255, 255, 0.8)',
                            mb: 4
                        }}
                    >
                        A secure platform for anonymous reporting
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => loginWithRedirect()}
                        sx={{
                            background: 'linear-gradient(45deg, #FF9800, #FF5722)',
                            color: 'white',
                            padding: '12px 36px',
                            borderRadius: '30px',
                            fontSize: '1.1rem',
                            textTransform: 'none',
                            boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #FF5722, #FF9800)',
                            }
                        }}
                    >
                        Get Started
                    </Button>
                </Box>

                <Grid container spacing={4} sx={{ mt: 4 }}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <MotionCard
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                sx={{
                                    height: '100%',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '15px',
                                    transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-10px)',
                                    }
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        mb: 2,
                                        color: feature.color
                                    }}>
                                        {feature.icon}
                                    </Box>
                                    <Typography 
                                        variant="h5" 
                                        component="h3" 
                                        gutterBottom
                                        sx={{ 
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {feature.title}
                                    </Typography>
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            lineHeight: 1.6
                                        }}
                                    >
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    ))}
                </Grid>

                <Paper 
                    elevation={0}
                    sx={{ 
                        mt: 8,
                        p: 4,
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '15px',
                    }}
                >
                    <Typography 
                        variant="h4" 
                        gutterBottom
                        sx={{ 
                            color: 'white',
                            fontWeight: 'bold',
                            mb: 3
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
                            <Box 
                                key={index}
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: 2
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(45deg, #FF9800, #FF5722)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {index + 1}
                                </Box>
                                <Typography 
                                    variant="body1"
                                    sx={{ 
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {step}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Home; 