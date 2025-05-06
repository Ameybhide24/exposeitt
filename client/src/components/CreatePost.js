import React, { useState, useRef } from 'react';
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
    IconButton,
    Grid,
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
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import DeleteIcon from '@mui/icons-material/Delete';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VideocamIcon from '@mui/icons-material/Videocam';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';

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
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [recordingError, setRecordingError] = useState('');
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    
    // Add media upload states
    const [mediaFiles, setMediaFiles] = useState([]);
    const [mediaPreviews, setMediaPreviews] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const baseURL = process.env.REACT_APP_API_URL;


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
    
            const response = await axios.post('https://exposeitt.com/gen/api/posts/generate', postData);
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

    const startRecording = async () => {
        try {
            setRecordingError('');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Error starting recording:', err);
            setRecordingError('Failed to access microphone. Please ensure you have granted permission.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const deleteRecording = () => {
        setAudioBlob(null);
        setContent('');
    };

    const handleAudioTranscription = async () => {
        if (!audioBlob) return;

        setIsSubmitting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.wav');

            const token = await getAccessTokenSilently();
            const response = await axios.post(
                'https://exposeitt.com/gen/api/posts/transcribe-audio',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.success) {
                setAiEnhancedPost(response.data.post);
                setActiveStep(3); // Move to Final Review
            }
        } catch (err) {
            console.error('Error transcribing audio:', err);
            setError('Failed to process audio recording. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMediaUpload = async (files) => {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);
        setError('');

        try {
            // Create previews for all files
            const newPreviews = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileType = file.type.startsWith('image/') ? 'image' : 
                               file.type.startsWith('video/') ? 'video' : null;

                if (!fileType) {
                    console.warn('Skipping unsupported file type:', file.type);
                    continue;
                }

                // Create preview
                const reader = new FileReader();
                const preview = await new Promise((resolve) => {
                    reader.onloadend = () => resolve({
                        dataUrl: reader.result,
                        type: fileType
                    });
                    reader.readAsDataURL(file);
                });

                newPreviews.push(preview);
            }

            setMediaPreviews([...mediaPreviews, ...newPreviews]);

            // Create form data for upload
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('media', files[i]);
            }

            const token = await getAccessTokenSilently();
            const response = await axios.post(
                `${baseURL}/api/posts/upload-media`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                    }
                }
            );

            console.log('Upload response:', response.data);
            
            // Add new media files to the existing ones
            if (response.data.media && response.data.media.length > 0) {
                const newMediaFiles = response.data.media.map(item => ({
                    url: item.filename,
                    type: item.mediaType
                }));
                
                setMediaFiles([...mediaFiles, ...newMediaFiles]);
            }
            
            setUploadProgress(100);
            
        } catch (err) {
            console.error('Error uploading media:', err);
            setError('Failed to upload media. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleMediaUpload(e.target.files);
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleMediaUpload(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleRemoveMedia = (index) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
        setMediaPreviews(prev => prev.filter((_, i) => i !== index));
        
        // Reset file input if all files are removed
        if (mediaFiles.length === 1 && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        // Updated validation to check for either regular content or AI enhanced content
        if (!title || !category || !location || (!content && !aiEnhancedPost)) {
            console.log('Validation failed:', { 
                title: !!title, 
                content: !!content,
                aiEnhancedPost: !!aiEnhancedPost,
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
                `${baseURL}/api/users`,
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

            // Log media info before creating post
            console.log('Media info before post creation:', {
                mediaFiles,
                mediaPreviews,
                hasMediaFiles: !!mediaFiles.length,
                hasMediaPreviews: !!mediaPreviews.length
            });

            // Prepare post data - use enhanced data if available, otherwise use original data
            const postData = aiEnhancedPost ? {
                title: String(aiEnhancedPost.title).trim(),
                content: String(aiEnhancedPost.content).trim(),
                category: String(aiEnhancedPost.category).trim(),
                location: String(aiEnhancedPost.location).trim(),
                media: mediaFiles.map(item => ({
                    url: item.url,
                    type: item.type
                })),
                userId: user.sub,
                authorName: user.name,
                authorEmail: user.email,
                isEnhanced: true
            } : {
                title: String(title).trim(),
                content: String(content).trim(),
                category: String(category).trim(),
                location: String(location).trim(),
                media: mediaFiles.map(item => ({
                    url: item.url,
                    type: item.type
                })),
                userId: user.sub,
                authorName: user.name,
                authorEmail: user.email,
                isEnhanced: false
            };

            console.log('Post data before submission:', postData);
            const relevanceAssessment = await axios.post(
                'https://exposeitt.com/gen/api/posts/assess-description',
                { description: postData.content },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }
            );
            console.log(relevanceAssessment, "here it issssss");
            if (relevanceAssessment.data.isRelevant === "no") {
                setError("This description does not pertain to a crime.");

                return;
            }
            // Submit the post
            const response = await axios.post(
                `${baseURL}/api/posts`,
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
            setAiEnhancedPost(null);
            setMediaFiles([]);
            setMediaPreviews([]);
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
                        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            {!isRecording && !audioBlob && (
                                <Button
                                    variant="outlined"
                                    startIcon={<MicIcon />}
                                    onClick={startRecording}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Start Recording
                                </Button>
                            )}
                            {isRecording && (
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<StopIcon />}
                                    onClick={stopRecording}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Stop Recording
                                </Button>
                            )}
                            {audioBlob && (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AudioFileIcon color="primary" />
                                        <Typography>Recording saved</Typography>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={deleteRecording}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Delete Recording
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleAudioTranscription}
                                        disabled={isSubmitting}
                                        sx={{
                                            borderRadius: 2,
                                            background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #283593 30%, #1a237e 90%)',
                                            }
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            'Process Recording'
                                        )}
                                    </Button>
                                </>
                            )}
                        </Box>

                        {/* Media Upload Section */}
                        <Box 
                            sx={{ 
                                mb: 3, 
                                border: '2px dashed rgba(0, 0, 0, 0.2)',
                                borderRadius: 2,
                                p: 3,
                                textAlign: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: mediaPreviews.length > 0 ? 'flex-start' : 'center', 
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleFileDrop}
                            onDragOver={handleDragOver}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*, video/*"
                                onChange={handleFileChange}
                                multiple
                                style={{ display: 'none' }}
                            />
                            
                            {mediaPreviews.length === 0 ? (
                                <>
                                    <Box sx={{ mb: 2 }}>
                                        <AttachFileIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                                    </Box>
                                    <Typography variant="h6" gutterBottom>
                                        Add Media Evidence
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Drag & drop images or videos, or click to browse
                                    </Typography>
                                    <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                                        <Button 
                                            variant="outlined" 
                                            startIcon={<AddAPhotoIcon />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                        >
                                            Upload Media
                                        </Button>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Box sx={{ width: '100%', mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6" color="primary">
                                            Media Files ({mediaPreviews.length})
                                        </Typography>
                                        <Button 
                                            variant="outlined" 
                                            startIcon={<AddAPhotoIcon />}
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                        >
                                            Add More
                                        </Button>
                                    </Box>
                                    
                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        {mediaPreviews.map((preview, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={index}>
                                                <Box sx={{ position: 'relative', height: '100%' }}>
                                                    <IconButton 
                                                        sx={{ 
                                                            position: 'absolute', 
                                                            top: 8, 
                                                            right: 8,
                                                            zIndex: 2,
                                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                                            color: 'white',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(0,0,0,0.7)',
                                                            }
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveMedia(index);
                                                        }}
                                                    >
                                                        <CloseIcon />
                                                    </IconButton>
                                                    
                                                    {preview.type === 'image' ? (
                                                        <Box
                                                            component="img"
                                                            src={mediaFiles[index]?.url 
                                                                ? `${baseURL}/api/posts/media/${mediaFiles[index].url}` 
                                                                : preview.dataUrl}
                                                            alt={`Uploaded image ${index + 1}`}
                                                            sx={{
                                                                width: '100%',
                                                                height: '200px',
                                                                objectFit: 'cover',
                                                                borderRadius: 1,
                                                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                            }}
                                                        />
                                                    ) : preview.type === 'video' ? (
                                                        <Box
                                                            component="video"
                                                            src={mediaFiles[index]?.url 
                                                                ? `${baseURL}/api/posts/media/${mediaFiles[index].url}` 
                                                                : preview.dataUrl}
                                                            controls
                                                            sx={{
                                                                width: '100%',
                                                                height: '200px',
                                                                objectFit: 'cover',
                                                                borderRadius: 1,
                                                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                            }}
                                                        />
                                                    ) : null}
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                    
                                    {isUploading && (
                                        <Box sx={{ width: '100%', mt: 2 }}>
                                            <Typography variant="body2">
                                                Uploading: {uploadProgress}%
                                            </Typography>
                                            <Box
                                                sx={{
                                                    mt: 1,
                                                    width: '100%',
                                                    height: 4,
                                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: `${uploadProgress}%`,
                                                        height: '100%',
                                                        backgroundColor: 'primary.main',
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    )}
                                </>
                            )}
                        </Box>

                        <Divider sx={{ my: 3 }}>
                            <Typography color="textSecondary">OR</Typography>
                        </Divider>

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
                                
                                {mediaPreviews.length > 0 && (
                                    <>
                                        <Typography variant="subtitle2" color="primary">
                                            Media Evidence ({mediaPreviews.length})
                                        </Typography>
                                        <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
                                            {mediaPreviews.map((preview, index) => (
                                                <Grid item xs={12} sm={6} md={4} key={index}>
                                                    {preview.type === 'image' ? (
                                                        <Box
                                                            component="img"
                                                            src={mediaFiles[index]?.url 
                                                                ? `${baseURL}/api/posts/media/${mediaFiles[index].url}` 
                                                                : preview.dataUrl}
                                                            alt={`Uploaded image ${index + 1}`}
                                                            sx={{
                                                                width: '100%',
                                                                height: '150px',
                                                                objectFit: 'cover',
                                                                borderRadius: 1,
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                            }}
                                                        />
                                                    ) : preview.type === 'video' ? (
                                                        <Box
                                                            component="video"
                                                            src={mediaFiles[index]?.url 
                                                                ? `${baseURL}/api/posts/media/${mediaFiles[index].url}` 
                                                                : preview.dataUrl}
                                                            controls
                                                            sx={{
                                                                width: '100%',
                                                                height: '150px',
                                                                objectFit: 'cover',
                                                                borderRadius: 1,
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                            }}
                                                        />
                                                    ) : null}
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </>
                                )}
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
                                <Typography variant="subtitle2" color="primary">Title</Typography>
                                {isEditingEnhanced ? (
                                    <TextField
                                        fullWidth
                                        value={aiEnhancedPost.title}
                                        onChange={(e) => setAiEnhancedPost({...aiEnhancedPost, title: e.target.value})}
                                        sx={{ mb: 2 }}
                                    />
                                ) : (
                                    <Typography paragraph>{aiEnhancedPost.title}</Typography>
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
                                        value={aiEnhancedPost.location}
                                        onChange={(e) => setAiEnhancedPost({...aiEnhancedPost, location: e.target.value})}
                                        sx={{ mb: 2 }}
                                    />
                                ) : (
                                    <Typography paragraph>{aiEnhancedPost.location}</Typography>
                                )}
                                
                                <Typography variant="subtitle2" color="primary">Content</Typography>
                                {isEditingEnhanced ? (
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        value={aiEnhancedPost.content}
                                        onChange={(e) => setAiEnhancedPost({...aiEnhancedPost, content: e.target.value})}
                                        sx={{ mb: 2 }}
                                    />
                                ) : (
                                    <Typography paragraph>{aiEnhancedPost.content}</Typography>
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
                                
                                <Typography variant="subtitle2" color="primary">Content</Typography>
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