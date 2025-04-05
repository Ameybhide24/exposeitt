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
    FormControl,
    InputLabel,
    Select,
    CircularProgress,
    useTheme,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';

const categories = [
    { value: 'Workplace Issues', icon: '🏢', description: 'Report workplace harassment, discrimination, or safety concerns' },
    { value: 'Financial Misconduct', icon: '💰', description: 'Report fraud, embezzlement, or other financial irregularities' },
    { value: 'Environmental Concerns', icon: '🌍', description: 'Report environmental violations or safety hazards' },
    { value: 'Public Safety', icon: '🚨', description: 'Report threats to public safety or well-being' },
    { value: 'Ethical Violations', icon: '⚖️', description: 'Report violations of ethical standards or professional conduct' },
    { value: 'Other', icon: '📝', description: 'Other concerns not covered by the categories above' },
];

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { getAccessTokenSilently, user } = useAuth0();
    const navigate = useNavigate();
    const theme = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content || !category) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Get the token and log user info for debugging
            const token = await getAccessTokenSilently();
            console.log('Auth0 User:', user);
            console.log('Token received:', token ? 'Yes' : 'No');

            if (!user?.sub) {
                console.error('No user.sub found in Auth0 user object');
                setError('User authentication error. Please try logging in again.');
                return;
            }

            // First ensure user exists in database
            console.log('Creating/updating user with data:', {
                email: user.email,
                name: user.name,
                picture: user.picture
            });

            const userResponse = await axios.post(
                'http://localhost:5050/api/users',
                {
                    email: user.email,
                    name: user.name,
                    picture: user.picture
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                }
            );

            console.log('User creation/update response:', userResponse.data);

            // Then submit the post
            const postData = {
                title,
                content,
                category,
                authorName: user.name,
                authorEmail: user.email
            };

            console.log('Creating post with data:', postData);

            const response = await axios.post(
                'http://localhost:5050/api/posts',
                postData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                }
            );

            console.log('Post creation response:', response.data);

            // Clear form and redirect
            setTitle('');
            setContent('');
            setCategory('');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            console.error('Full error object:', err);
            console.error('Error response data:', err.response?.data);
            console.error('Error status:', err.response?.status);
            setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                >
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography
                            variant="h4"
                            component="h1"
                            gutterBottom
                            sx={{
                                fontWeight: 600,
                                color: theme.palette.primary.main,
                                mb: 2
                            }}
                        >
                            Submit Anonymous Report
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Your identity will remain completely anonymous. All information is encrypted for your protection.
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LockIcon color="primary" />
                                <Typography variant="body2">End-to-end encrypted</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SecurityIcon color="primary" />
                                <Typography variant="body2">Anonymous submission</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel id="category-label">Category *</InputLabel>
                            <Select
                                labelId="category-label"
                                value={category}
                                label="Category *"
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.value} value={cat.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <span>{cat.icon}</span>
                                            <Typography>{cat.value}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Title *"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            sx={{ mb: 3 }}
                            InputProps={{
                                sx: { borderRadius: 1 }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Details *"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            multiline
                            rows={6}
                            sx={{ mb: 4 }}
                            InputProps={{
                                sx: { borderRadius: 1 }
                            }}
                        />

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate(-1)}
                                sx={{
                                    borderRadius: 2,
                                    px: 4,
                                }}
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isSubmitting}
                                sx={{
                                    borderRadius: 2,
                                    px: 4,
                                    background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #283593 30%, #1a237e 90%)',
                                    }
                                }}
                            >
                                {isSubmitting ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Submit Report'
                                )}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default CreatePost; 