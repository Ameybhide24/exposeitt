import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    MenuItem,
    Alert,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

const categories = [
    'Workplace Issues',
    'Financial Misconduct',
    'Environmental Concerns',
    'Public Safety',
    'Ethical Violations',
    'Other',
];

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        try {
            const token = await getAccessTokenSilently();
            await axios.post(
                'http://localhost:5000/api/posts',
                { title, content, category },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setError('Failed to create post. Please try again.');
        }
    };

    return (
        <Box sx={{ 
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            minHeight: '100vh',
            py: 8,
            pt: { xs: 12, sm: 8 }
        }}>
            <Container maxWidth="md">
                <MotionPaper
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    elevation={0}
                    sx={{ 
                        p: { xs: 3, sm: 4 },
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '15px',
                    }}
                >
                    <Typography 
                        variant={isMobile ? "h4" : "h3"} 
                        gutterBottom
                        sx={{ 
                            color: 'white',
                            fontWeight: 'bold',
                            mb: 3,
                            textAlign: 'center'
                        }}
                    >
                        Submit Anonymous Report
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            color: 'rgba(255, 255, 255, 0.7)',
                            mb: 4,
                            textAlign: 'center'
                        }}
                    >
                        Your identity will remain completely anonymous. All information is encrypted for your protection.
                    </Typography>

                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 3,
                                background: 'rgba(211, 47, 47, 0.1)',
                                color: 'white',
                                border: '1px solid rgba(211, 47, 47, 0.3)'
                            }}
                        >
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert 
                            severity="success" 
                            sx={{ 
                                mb: 3,
                                background: 'rgba(76, 175, 80, 0.1)',
                                color: 'white',
                                border: '1px solid rgba(76, 175, 80, 0.3)'
                            }}
                        >
                            Report submitted successfully! Redirecting to dashboard...
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            margin="normal"
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.4)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#FF9800',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Category"
                            select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            margin="normal"
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.4)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#FF9800',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                },
                                '& .MuiSelect-icon': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                },
                            }}
                        >
                            {categories.map((option) => (
                                <MenuItem 
                                    key={option} 
                                    value={option}
                                    sx={{
                                        color: 'white',
                                        background: 'rgba(26, 26, 26, 0.9)',
                                        '&:hover': {
                                            background: 'rgba(255, 255, 255, 0.1)',
                                        },
                                    }}
                                >
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            label="Details"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            margin="normal"
                            multiline
                            rows={6}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(255, 255, 255, 0.4)',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#FF9800',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                },
                            }}
                        />
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
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
                                Submit Report
                            </Button>
                        </Box>
                    </form>
                </MotionPaper>
            </Container>
        </Box>
    );
};

export default CreatePost; 