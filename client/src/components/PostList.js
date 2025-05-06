import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CardActions,
    Button,
    Grid,
    Chip,
} from '@mui/material';
import axios from 'axios';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const baseURL = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${baseURL}/api/posts`);
                setPosts(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch posts');
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

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
                    Recent Reports
                </Typography>
                <Grid container spacing={3}>
                    {posts.map((post) => (
                        <Grid item xs={12} md={6} key={post._id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {post.title}
                                    </Typography>
                                    <Chip
                                        label={post.category}
                                        color="primary"
                                        size="small"
                                        sx={{ mb: 2 }}
                                    />
                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {post.content}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" color="primary">
                                        Read More
                                    </Button>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ ml: 'auto' }}
                                    >
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </Typography>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
};

export default PostList; 