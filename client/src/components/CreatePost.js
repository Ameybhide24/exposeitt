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
    Stepper,
    Step,
    StepLabel,
    IconButton,
    Tooltip,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import SecurityIcon from '@mui/icons-material/Security';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

const categories = [
    'Workplace Issues',
    'Financial Misconduct',
    'Environmental Concerns',
    'Public Safety',
    'Ethical Violations',
    'Other',
];

const steps = ['Report Details', 'Additional Information', 'Review & Submit'];

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!title || !content || !category) {
            setError('Please fill in all required fields.');
            return;
        }

        try {
            const token = await getAccessTokenSilently();
            await axios.post(
                'http://localhost:5050/api/posts',
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

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <MotionBox
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TextField
                            fullWidth
                            label="Report Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            margin="normal"
                            required
                            variant="outlined"
                            sx={textFieldStyle}
                        />
                        <TextField
                            fullWidth
                            label="Category"
                            select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            margin="normal"
                            required
                            sx={textFieldStyle}
                        >
                            {categories.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </MotionBox>
                );
            case 1:
                return (
                    <MotionBox
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TextField
                            fullWidth
                            label="Report Details"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            margin="normal"
                            required
                            multiline
                            rows={6}
                            sx={textFieldStyle}
                            placeholder="Please provide detailed information about your report..."
                        />
                    </MotionBox>
                );
            case 2:
                return (
                    <MotionBox
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Box sx={{ mb: 3, p: 3, background: 'rgba(31, 53, 199, 0.04)', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2, color: 'var(--text-primary)' }}>Review Your Report</Typography>
                            <Typography variant="subtitle1" sx={{ mb: 1, color: 'var(--text-primary)', fontWeight: 600 }}>
                                Title: {title}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ mb: 1, color: 'var(--text-primary)', fontWeight: 600 }}>
                                Category: {category}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                                {content}
                            </Typography>
                        </Box>
                    </MotionBox>
                );
            default:
                return null;
        }
    };

    const textFieldStyle = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: 'white',
            borderRadius: '12px',
            '& fieldset': {
                borderColor: 'rgba(31, 53, 199, 0.1)',
            },
            '&:hover fieldset': {
                borderColor: 'rgba(31, 53, 199, 0.2)',
            },
            '&.Mui-focused fieldset': {
                borderColor: 'var(--primary-blue)',
            },
        },
        '& .MuiInputLabel-root': {
            color: 'var(--text-secondary)',
        },
        '& .MuiInputBase-input': {
            color: 'var(--text-primary)',
        },
    };

    return (
        <Box sx={{ 
            background: 'var(--background-color)',
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
                        background: 'white',
                        borderRadius: '24px',
                        boxShadow: '0 4px 20px rgba(31, 53, 199, 0.08)',
                        border: '1px solid rgba(31, 53, 199, 0.1)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                        <SecurityIcon sx={{ fontSize: 40, color: 'var(--primary-blue)' }} />
                        <Typography 
                            variant={isMobile ? "h4" : "h3"} 
                            sx={{ 
                                color: 'var(--text-primary)',
                                fontWeight: 800,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Submit Anonymous Report
                        </Typography>
                    </Box>

                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ mb: 3 }}
                        >
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert 
                            severity="success" 
                            sx={{ mb: 3 }}
                        >
                            Report submitted successfully! Redirecting to dashboard...
                        </Alert>
                    )}

                    <Box sx={{ position: 'relative' }}>
                        <AnimatePresence mode="wait">
                            {renderStepContent(activeStep)}
                        </AnimatePresence>
                    </Box>

                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        mt: 4,
                        pt: 3,
                        borderTop: '1px solid rgba(31, 53, 199, 0.1)'
                    }}>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{
                                color: 'var(--text-secondary)',
                                '&:not(:disabled):hover': {
                                    background: 'rgba(31, 53, 199, 0.08)',
                                }
                            }}
                            startIcon={<ArrowBackIcon />}
                        >
                            Back
                        </Button>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Tooltip title="Need help?" arrow>
                                <IconButton
                                    sx={{
                                        color: 'var(--text-secondary)',
                                        '&:hover': {
                                            background: 'rgba(31, 53, 199, 0.08)',
                                        }
                                    }}
                                >
                                    <HelpOutlineIcon />
                                </IconButton>
                            </Tooltip>
                            {activeStep === steps.length - 1 ? (
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    sx={{
                                        background: 'var(--primary-gradient)',
                                        color: 'white',
                                        px: 4,
                                        borderRadius: '30px',
                                        '&:hover': {
                                            boxShadow: '0 6px 16px rgba(31, 53, 199, 0.3)',
                                        }
                                    }}
                                >
                                    Submit Report
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        background: 'var(--primary-gradient)',
                                        color: 'white',
                                        px: 4,
                                        borderRadius: '30px',
                                        '&:hover': {
                                            boxShadow: '0 6px 16px rgba(31, 53, 199, 0.3)',
                                        }
                                    }}
                                >
                                    Continue
                                </Button>
                            )}
                        </Box>
                    </Box>
                </MotionPaper>
            </Container>
        </Box>
    );
};

export default CreatePost; 