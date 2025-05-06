import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();
    const baseURL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const token = await getAccessTokenSilently();
                const response = await axios.get(`${baseURL}/api/posts/my-posts`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setPosts(response.data);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError('Failed to fetch your reports. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, [getAccessTokenSilently]);

    const handleReportToAuthorities = async (postId) => {
        setError('');
        try {
            const token = await getAccessTokenSilently();
            const response = await axios.post(
                `${baseURL}/api/posts/${postId}/notify-authorities`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update the local state to reflect the change
            setPosts(posts.map(post => 
                post._id === postId 
                    ? { ...post, status: 'reported' }
                    : post
            ));

            // Show success message
            setSuccessMessage('Report successfully sent to authorities');
            
            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 5000);

        } catch (err) {
            console.error('Error reporting to authorities:', err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to send report to authorities';
            setError(errorMessage);
            
            // Clear error message after 5 seconds
            setTimeout(() => {
                setError('');
            }, 5000);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'posted':
                return 'info';
            case 'reported':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography 
                    variant="h4" 
                    gutterBottom
                    sx={{ 
                        color: 'primary.main',
                        fontWeight: 600,
                        mb: 3
                    }}
                >
                    Your Reports
                </Typography>

                {error ? (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                ) : (
                    <>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/create-post')}
                            sx={{ 
                                mb: 3,
                                background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #283593 30%, #1a237e 90%)',
                                }
                            }}
                        >
                            Submit New Report
                        </Button>

                        {posts.length === 0 ? (
                            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'rgba(31, 53, 199, 0.04)' }}>
                                <Typography variant="body1" color="textSecondary">
                                    You haven't submitted any reports yet.
                                </Typography>
                            </Paper>
                        ) : (
                            <TableContainer 
                                component={Paper}
                                sx={{
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    borderRadius: 2
                                }}
                            >
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: 'rgba(31, 53, 199, 0.04)' }}>
                                            <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Date Submitted</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {posts.map((post) => (
                                            <TableRow key={post._id}>
                                                <TableCell>{post.title}</TableCell>
                                                <TableCell>{post.category}</TableCell>
                                                <TableCell>{post.location}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={post.status}
                                                        color={getStatusColor(post.status)}
                                                        sx={{ textTransform: 'capitalize' }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {post.status === 'posted' && (
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            variant="outlined"
                                                            onClick={() => handleReportToAuthorities(post._id)}
                                                        >
                                                            Report to Authorities
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </>
                )}
            </Box>
        </Container>
    );
};

export default Dashboard; 