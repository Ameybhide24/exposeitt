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
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    Divider,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PublishIcon from '@mui/icons-material/Publish';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';

const categories = [
    { value: 'Workplace Issues', icon: '🏢', description: 'Report workplace harassment, discrimination, or safety concerns' },
    { value: 'Financial Misconduct', icon: '💰', description: 'Report fraud, embezzlement, or other financial irregularities' },
    { value: 'Environmental Concerns', icon: '🌍', description: 'Report environmental violations or safety hazards' },
    { value: 'Public Safety', icon: '🚨', description: 'Report threats to public safety or well-being' },
    { value: 'Ethical Violations', icon: '⚖️', description: 'Report violations of ethical standards or professional conduct' },
    { value: 'Other', icon: '📝', description: 'Other concerns not covered by the categories above' },
];

const steps = ['Basic Information', 'Event Details', 'Review Post', 'Final Review'];

const CreatePost = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiEnhancedPost, setAiEnhancedPost] = useState(null);
    const [isEditingEnhanced, setIsEditingEnhanced] = useState(false);
    const { getAccessTokenSilently, user } = useAuth0();
    const navigate = useNavigate();
    const theme = useTheme();

    const handleNext = () => {
        if (activeStep === 0 && (!category || !title || !location)) {
            setError('Please fill in all required fields for basic information');
            return;
        }
        if (activeStep === 1 && !content) {
            setError('Please provide event details');
            return;
        }
        setError('');
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleEnhanceWithAI = async () => {
        try {
            console.log('Enhancing with AI...');
            setIsSubmitting(true);
    
            const postData = {
                title: title,
                description: content,
                category: category,
                location: location,
            };
    
            const response = await axios.post('http://localhost:9000/api/posts/generate', postData);
            setAiEnhancedPost(response.data.post);
            setIsEditingEnhanced(false);
            setActiveStep(3); // Move to Final Review step
            console.log('Post enhanced successfully:', response.data);
    
        } catch (error) {
            console.error('Error enhancing post:', error);
            setError('Failed to enhance post with AI. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        // Validate all required fields
        if (!title || !content || !category || !location) {
            console.log('Validation failed:', { 
                title: !!title, 
                content: !!content, 
                category: !!category, 
                location: !!location,
                locationValue: location 
            });
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const token = await getAccessTokenSilently();
            
            if (!user?.sub) {
                setError('Authentication error. Please try logging in again.');
                return;
            }

            // First ensure user exists in database
            await axios.post(
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

            // Prepare post data with explicit string conversion
            const postData = {
                title: String(title).trim(),
                content: String(content).trim(),
                category: String(category).trim(),
                location: String(location).trim(),
                userId: user.sub,
                authorName: user.name,
                authorEmail: user.email
            };

            console.log('Post data before submission:', {
                ...postData,
                locationLength: postData.location.length,
                locationType: typeof postData.location
            });

            // Submit the post
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

            console.log('Post creation successful:', response.data);

            // Clear form and redirect
            setTitle('');
            setContent('');
            setCategory('');
            setLocation('');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                data: err.response?.data?.errors,
                requestData: err.config?.data
            });
            setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ mt: 3 }}>
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
                            label="Location *"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                            error={!location && error}
                            placeholder="Enter the location where the event occurred"
                            helperText={!location && error ? "Location is required" : "Please provide specific location details"}
                            InputProps={{
                                startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />,
                                sx: { borderRadius: 1 }
                            }}
                        />
                    </Box>
                );
            case 1:
                return (
                    <Box sx={{ mt: 3 }}>
                        <TextField
                            fullWidth
                            label="Event Details *"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            multiline
                            rows={8}
                            placeholder="Provide detailed information about the incident..."
                            InputProps={{
                                sx: { borderRadius: 1 }
                            }}
                        />
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ mt: 3 }}>
                        <Card sx={{ mb: 3, backgroundColor: 'rgba(31, 53, 199, 0.04)' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Your Report</Typography>
                                <Divider sx={{ mb: 2 }} />
                                
                                <Typography variant="subtitle2" color="primary">Category</Typography>
                                <Typography paragraph>{category}</Typography>
                                
                                <Typography variant="subtitle2" color="primary">Title</Typography>
                                <Typography paragraph>{title}</Typography>
                                
                                <Typography variant="subtitle2" color="primary">Location</Typography>
                                <Typography paragraph>{location}</Typography>
                                
                                <Typography variant="subtitle2" color="primary">Details</Typography>
                                <Typography paragraph>{content}</Typography>
                            </CardContent>
                        </Card>
                        
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
                            <Button
                                variant="outlined"
                                startIcon={<SmartToyIcon />}
                                onClick={handleEnhanceWithAI}
                                disabled={isSubmitting}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                }}
                            >
                                {isSubmitting ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Enhance with AI'
                                )}
                            </Button>
                        </Box>
                    </Box>
                );
            case 3:
                return (
                    <Box sx={{ mt: 3 }}>
                        <Card sx={{ mb: 3, backgroundColor: 'rgba(31, 53, 199, 0.04)' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">
                                        {aiEnhancedPost ? 'AI Enhanced Report' : 'Your Report'}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setIsEditingEnhanced(!isEditingEnhanced)}
                                        startIcon={isEditingEnhanced ? <CheckIcon /> : <EditIcon />}
                                    >
                                        {isEditingEnhanced ? 'Save Changes' : 'Edit'}
                                    </Button>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                
                                {aiEnhancedPost ? (
                                    <>
                                        <Typography variant="subtitle2" color="primary">Heading</Typography>
                                        {isEditingEnhanced ? (
                                            <TextField
                                                fullWidth
                                                value={aiEnhancedPost.heading}
                                                onChange={(e) => setAiEnhancedPost({...aiEnhancedPost, heading: e.target.value})}
                                                sx={{ mb: 2 }}
                                            />
                                        ) : (
                                            <Typography paragraph>{aiEnhancedPost.heading}</Typography>
                                        )}
                                        
                                        <Typography variant="subtitle2" color="primary">Category</Typography>
                                        {isEditingEnhanced ? (
                                            <TextField
                                                fullWidth
                                                value={aiEnhancedPost.category}
                                                onChange={(e) => setAiEnhancedPost({...aiEnhancedPost, category: e.target.value})}
                                                sx={{ mb: 2 }}
                                            />
                                        ) : (
                                            <Typography paragraph>{aiEnhancedPost.category}</Typography>
                                        )}
                                        
                                        <Typography variant="subtitle2" color="primary">Location & Time</Typography>
                                        {isEditingEnhanced ? (
                                            <TextField
                                                fullWidth
                                                value={aiEnhancedPost.locationTime}
                                                onChange={(e) => setAiEnhancedPost({...aiEnhancedPost, locationTime: e.target.value})}
                                                sx={{ mb: 2 }}
                                            />
                                        ) : (
                                            <Typography paragraph>{aiEnhancedPost.locationTime}</Typography>
                                        )}
                                        
                                        <Typography variant="subtitle2" color="primary">Summary</Typography>
                                        {isEditingEnhanced ? (
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={3}
                                                value={aiEnhancedPost.summary}
                                                onChange={(e) => setAiEnhancedPost({...aiEnhancedPost, summary: e.target.value})}
                                                sx={{ mb: 2 }}
                                            />
                                        ) : (
                                            <Typography paragraph>{aiEnhancedPost.summary}</Typography>
                                        )}
                                        
                                        <Typography variant="subtitle2" color="primary">Additional Information</Typography>
                                        {isEditingEnhanced ? (
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={2}
                                                value={aiEnhancedPost.additionalInfo}
                                                onChange={(e) => setAiEnhancedPost({...aiEnhancedPost, additionalInfo: e.target.value})}
                                                sx={{ mb: 2 }}
                                            />
                                        ) : (
                                            <Typography>{aiEnhancedPost.additionalInfo}</Typography>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Typography variant="subtitle2" color="primary">Category</Typography>
                                        {isEditingEnhanced ? (
                                            <TextField
                                                fullWidth
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                sx={{ mb: 2 }}
                                            />
                                        ) : (
                                            <Typography paragraph>{category}</Typography>
                                        )}
                                        
                                        <Typography variant="subtitle2" color="primary">Title</Typography>
                                        {isEditingEnhanced ? (
                                            <TextField
                                                fullWidth
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                sx={{ mb: 2 }}
                                            />
                                        ) : (
                                            <Typography paragraph>{title}</Typography>
                                        )}
                                        
                                        <Typography variant="subtitle2" color="primary">Location</Typography>
                                        {isEditingEnhanced ? (
                                            <TextField
                                                fullWidth
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                sx={{ mb: 2 }}
                                            />
                                        ) : (
                                            <Typography paragraph>{location}</Typography>
                                        )}
                                        
                                        <Typography variant="subtitle2" color="primary">Details</Typography>
                                        {isEditingEnhanced ? (
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                sx={{ mb: 2 }}
                                            />
                                        ) : (
                                            <Typography paragraph>{content}</Typography>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
                            <Button
                                variant="contained"
                                startIcon={<PublishIcon />}
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #283593 30%, #1a237e 90%)',
                                    }
                                }}
                            >
                                {isSubmitting ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Publish Report'
                                )}
                            </Button>
                        </Box>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Container maxWidth="md">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Paper 
                    elevation={3} 
                    sx={{ 
                        p: 4, 
                        mt: 4,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.98)'
                    }}
                >
                    <Typography 
                        variant="h4" 
                        gutterBottom
                        sx={{ 
                            color: 'primary.main',
                            fontWeight: 600,
                            mb: 3
                        }}
                    >
                        Submit a Report
                    </Typography>

                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {renderStepContent(activeStep)}

                    <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                        <Button
                            variant="outlined"
                            onClick={activeStep === 0 ? () => navigate(-1) : handleBack}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                            }}
                        >
                            {activeStep === 0 ? 'Cancel' : 'Back'}
                        </Button>
                        {activeStep < 3 && (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                sx={{
                                    borderRadius: 2,
                                    px: 4,
                                    background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #283593 30%, #1a237e 90%)',
                                    }
                                }}
                            >
                                Next
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LockIcon color="primary" />
                            <Typography variant="body2">End-to-end encrypted</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SecurityIcon color="primary" />
                            <Typography variant="body2">Anonymous submission</Typography>
                        </Box>
                    </Box>
                </Paper>
            </motion.div>
        </Container>
    );
};

export default CreatePost; 