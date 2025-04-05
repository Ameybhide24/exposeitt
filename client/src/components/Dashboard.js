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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import WarningIcon from '@mui/icons-material/Warning';

const Dashboard = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmDialog, setConfirmDialog] = useState({ open: false, postId: null });
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const token = await getAccessTokenSilently();
                const response = await axios.get('http://localhost:5050/api/posts/my-posts', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setPosts(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching posts:', err);
                setError('Failed to fetch your reports');
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, [getAccessTokenSilently]);

    const handleReportToAuthorities = async (postId) => {
        try {
            const token = await getAccessTokenSilently();
            await axios.patch(
                `http://localhost:5050/api/posts/${postId}/status`,
                { status: 'reported' },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            
            // Update the local state to reflect the change
            setPosts(posts.map(post => 
                post._id === postId 
                    ? { ...post, status: 'reported' }
                    : post
            ));
            
            setConfirmDialog({ open: false, postId: null });
        } catch (err) {
            console.error('Error reporting to authorities:', err);
            setError('Failed to report to authorities. Please try again.');
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

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return 'posted';
            case 'reported':
                return 'reported';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <Container>
                <Typography>Loading...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error">{error}</Typography>
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
                <Button
                    variant="contained"
                    color="primary"
                    href="/create-post"
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
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(post.status)}
                                            color={getStatusColor(post.status)}
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {post.status !== 'reported' && (
                                            <Button
                                                size="small"
                                                color="error"
                                                variant="outlined"
                                                startIcon={<WarningIcon />}
                                                onClick={() => setConfirmDialog({ 
                                                    open: true, 
                                                    postId: post._id 
                                                })}
                                                sx={{
                                                    borderColor: 'error.main',
                                                    '&:hover': {
                                                        backgroundColor: 'error.main',
                                                        color: 'white'
                                                    }
                                                }}
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
            </Box>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, postId: null })}
            >
                <DialogTitle sx={{ color: 'error.main' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon color="error" />
                        Confirm Report to Authorities
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to report this to the authorities? This action cannot be undone.
                        Once reported, the relevant authorities will be notified and will investigate the matter.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setConfirmDialog({ open: false, postId: null })}
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => handleReportToAuthorities(confirmDialog.postId)}
                        color="error"
                        variant="contained"
                        autoFocus
                    >
                        Confirm Report
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Dashboard; 