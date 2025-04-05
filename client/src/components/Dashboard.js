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
} from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const Dashboard = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const token = await getAccessTokenSilently();
                const response = await axios.get('http://localhost:5000/api/posts/user', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setPosts(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch your reports');
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, [getAccessTokenSilently]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'approved':
                return 'success';
            case 'rejected':
                return 'error';
            default:
                return 'default';
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
                <Typography variant="h4" gutterBottom>
                    Your Reports
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    href="/create-post"
                    sx={{ mb: 3 }}
                >
                    Submit New Report
                </Button>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date Submitted</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow key={post._id}>
                                    <TableCell>{post.title}</TableCell>
                                    <TableCell>{post.category}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={post.status}
                                            color={getStatusColor(post.status)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="small"
                                            color="primary"
                                            href={`/posts/${post._id}`}
                                        >
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
};

export default Dashboard; 