import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useAuth0 } from '@auth0/auth0-react';
import {
    Box,
    Card,
    Typography,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Button,
    IconButton,
    Paper,
    Divider,
    useTheme,
    useMediaQuery,
    Avatar,
    Container,
    Menu,
    MenuItem,
    TextField,
    InputAdornment,
    Tooltip,
    Fade,
    Skeleton,
    Badge,
    Tab,
    Tabs,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch,
    FormControlLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import FlagIcon from '@mui/icons-material/Flag';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SendIcon from '@mui/icons-material/Send';

const MotionCard = motion(Card);
const MotionContainer = motion(Container);
const MotionBox = motion(Box);

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [currentTab, setCurrentTab] = useState(0);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [savedPosts, setSavedPosts] = useState(new Set());
    const [viewMode, setViewMode] = useState('card'); // 'card' or 'compact'
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { getAccessTokenSilently } = useAuth0();
    const baseURL = process.env.REACT_APP_API_URL;


    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching posts from feed...');
            const response = await axios.get(`${baseURL}/api/posts/feed`);
            console.log('Received posts:', response.data);
            
            // Log media information for debugging
            response.data.forEach(post => {
                if (post.mediaUrl) {
                    console.log(`Post ${post._id} has media:`, {
                        mediaUrl: post.mediaUrl,
                        mediaType: post.mediaType
                    });
                }
            });
            
            setPosts(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching feed:', err);
            setError('Failed to load posts. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };

    const handleSortChange = (type) => {
        setSortBy(type);
        handleFilterClose();
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleReportPost = (post) => {
        setSelectedPost(post);
        setShowReportDialog(true);
    };

    const handleSavePost = (postId) => {
        setSavedPosts(prev => {
            const newSaved = new Set(prev);
            if (newSaved.has(postId)) {
                newSaved.delete(postId);
            } else {
                newSaved.add(postId);
            }
            return newSaved;
        });
    };

    const filteredAndSortedPosts = React.useMemo(() => {
        let result = [...posts];
        
        // Apply search filter
        if (searchTerm) {
            result = result.filter(post => 
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply sorting
        switch (sortBy) {
            case 'trending':
                result.sort((a, b) => b.votes - a.votes);
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'upvotes':
                result.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
                break;
            default:
                break;
        }

        return result;
    }, [posts, searchTerm, sortBy]);

    const PostCard = ({ post }) => {
        const [userVote, setUserVote] = useState(null);
        const [menuAnchorEl, setMenuAnchorEl] = useState(null);
        const isSaved = savedPosts.has(post._id);
        const [imageError, setImageError] = useState(false);
        const [upvotes, setUpvotes] = useState(post.upvotes || 0);
        const [downvotes, setDownvotes] = useState(post.downvotes || 0);
        const [commentsOpen, setCommentsOpen] = useState(false);
        const [comments, setComments] = useState([]);
        const [newComment, setNewComment] = useState('');
        const [loadingComments, setLoadingComments] = useState(false);
        const [commentError, setCommentError] = useState(null);
        
        // Log media info when post is rendered
        useEffect(() => {
            if (post.media && post.media.length > 0) {
                console.log(`Rendering post ${post._id} with media:`, {
                    mediaCount: post.media.length,
                    mediaTypes: post.media.map(m => m.type)
                });
            }
        }, [post]);

        const handleVote = async (direction) => {
            const postId = post._id;
        
            try {
                let updatedPost;
        
                if (direction === 1) {
                    const res = await axios.post(`${baseURL}/api/posts/upvote/${postId}`);
                    updatedPost = res.data;
                } else if (direction === -1) {
                    const res = await axios.post(`${baseURL}/api/posts/downvote/${postId}`);
                    updatedPost = res.data;
                }
        
                setUpvotes(updatedPost.upvotes || 0);
                setDownvotes(updatedPost.downvotes || 0);
                setUserVote(direction);
            } catch (err) {
                console.error("Failed to vote:", err);
            }
        };
        
        const handleMenuClick = (event) => {
            setMenuAnchorEl(event.currentTarget);
        };

        const handleMenuClose = () => {
            setMenuAnchorEl(null);
        };

        const getRandomColor = (str) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            const hue = Math.abs(hash % 360);
            return `hsl(${hue}, 70%, 50%)`;
        };

        const avatarColor = getRandomColor(post.authorName);

        const handleImageError = (e) => {
            // Log detailed error information
            console.error('Error loading image:', {
                target: e.target.src,
                error: e
            });
            
            setImageError(true);
            e.target.onerror = null; // Prevent infinite error loop
            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
        };

        // Helper function to get the correct media URL
        const getMediaUrl = (mediaPath) => {
            // Make sure we have a valid media path
            if (!mediaPath) return null;
            
            // Ensure we're using the correct server URL
            const serverBaseUrl = baseURL;
            
            // Check if the URL already has http/https
            if (mediaPath.startsWith('http')) {
                return mediaPath;
            }
            
            // If path already has api/posts/media, don't add it again
            if (mediaPath.includes('api/posts/media')) {
                return `${serverBaseUrl}/${mediaPath}`;
            }
            
            // Otherwise construct the full URL
            return `${serverBaseUrl}/api/posts/media/${mediaPath}`;
        };

        const fetchComments = async () => {
            try {
                setLoadingComments(true);
                setCommentError(null);
                const response = await axios.get(`${baseURL}/api/posts/${post._id}/comments`);
                setComments(response.data);
                setLoadingComments(false);
            } catch (err) {
                console.error('Error fetching comments:', err);
                setCommentError('Failed to load comments. Please try again.');
                setLoadingComments(false);
            }
        };

        const handleCommentsOpen = () => {
            if (!commentsOpen) {
                fetchComments();
            }
            setCommentsOpen(!commentsOpen);
        };

        const handleCommentSubmit = async () => {
            if (!newComment.trim()) return;
            
            try {
                // Get user info from Auth0
                const domain = process.env.REACT_APP_AUTH0_DOMAIN;
                const audience = process.env.REACT_APP_AUTH0_AUDIENCE;
                const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
                const accessToken = await getAccessTokenSilently({
                    authorizationParams: {
                        audience: audience,
                        scope: "openid profile email"
                    }
                });
                
                // Get user profile
                const userDetailResponse = await axios.get(
                    `https://${domain}/userinfo`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
                
                const userData = userDetailResponse.data;
                
                // Save the comment locally first
                const commentText = newComment;
                setNewComment(''); // Clear input field immediately
                
                // Post comment
                const commentData = {
                    text: commentText,
                    authorName: userData.name || userData.nickname,
                    authorEmail: userData.email
                };
                
                const response = await axios.post(
                    `${baseURL}/api/posts/${post._id}/comments`,
                    commentData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
                
                // Add new comment to the comments array
                setComments(prevComments => [response.data, ...prevComments]);
            } catch (err) {
                console.error('Error posting comment:', err);
                alert('Failed to post comment. Please try again.');
            }
        };

        return (
            <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                    '&:hover': {
                        boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                        transform: 'translateY(-4px)',
                        transition: 'all 0.3s ease-in-out'
                    },
                    ...(viewMode === 'compact' ? {
                        '& .post-content': {
                            maxHeight: '80px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }
                    } : {})
                }}
            >
                {/* Media Content - Moved to top for visual prominence */}
                {post.media && post.media.length > 0 && (
                    <Box sx={{ 
                        position: 'relative', 
                        backgroundColor: 'rgba(0,0,0,0.02)',
                        width: '100%'
                    }}>
                        {/* If there's only one media item */}
                        {post.media.length === 1 ? (
                            <Box sx={{ 
                                overflow: 'hidden', 
                                height: 'auto', 
                                minHeight: '200px',
                                maxHeight: '500px',
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderBottom: '1px solid rgba(0,0,0,0.06)'
                            }}>
                                {post.media[0].type === 'image' ? (
                                    <>
                                        {!imageError ? (
                                            <Box 
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    position: 'relative',
                                                    p: 1
                                                }}
                                            >
                                                <Box
                                                    component="img"
                                                    src={getMediaUrl(post.media[0].url)}
                                                    alt="Post media"
                                                    sx={{
                                                        width: 'auto',
                                                        maxWidth: '100%',
                                                        maxHeight: '500px',
                                                        objectFit: 'contain',
                                                        display: 'block',
                                                        transition: 'transform 0.5s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.02)'
                                                        }
                                                    }}
                                                    onError={handleImageError}
                                                    loading="lazy"
                                                />
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    height: '200px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                                }}
                                            >
                                                <Typography color="text.secondary">
                                                    Unable to load image
                                                </Typography>
                                            </Box>
                                        )}
                                    </>
                                ) : post.media[0].type === 'video' ? (
                                    <Box
                                        component="video"
                                        src={getMediaUrl(post.media[0].url)}
                                        controls
                                        sx={{
                                            width: 'auto',
                                            height: 'auto',
                                            maxWidth: '100%',
                                            maxHeight: '500px',
                                            backgroundColor: 'rgba(0,0,0,0.03)',
                                        }}
                                        onError={(e) => {
                                            console.error('Error loading video:', {
                                                src: e.target.src,
                                                error: e
                                            });
                                        }}
                                    />
                                ) : (
                                    <Box sx={{ 
                                        p: 3, 
                                        textAlign: 'center',
                                        backgroundColor: 'rgba(0,0,0,0.03)',
                                    }}>
                                        <Typography color="text.secondary">
                                            Media attachment (unsupported format)
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            // If there are multiple media items, show them in a grid with improved styling
                            <Grid container spacing={0}>
                                {post.media.slice(0, 4).map((media, index) => {
                                    const isShowingPartial = post.media.length > 4 && index === 3;
                                    
                                    return (
                                        <Grid item xs={post.media.length === 2 ? 6 : post.media.length >= 3 ? 6 : 12} key={index} 
                                              sx={{ 
                                                  position: 'relative',
                                                  height: post.media.length <= 2 ? '300px' : '220px',
                                                  overflow: 'hidden',
                                                  border: '1px solid rgba(0,0,0,0.06)',
                                              }}>
                                            {media.type === 'image' ? (
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        position: 'relative',
                                                        padding: '4px',
                                                    }}
                                                >
                                                    <Box
                                                        component="img"
                                                        src={getMediaUrl(media.url)}
                                                        alt={`Post media ${index + 1}`}
                                                        sx={{
                                                            maxWidth: '100%',
                                                            maxHeight: '100%',
                                                            objectFit: 'contain',
                                                            transition: 'transform 0.5s ease',
                                                            '&:hover': {
                                                                transform: 'scale(1.05)'
                                                            }
                                                        }}
                                                        onError={(e) => {
                                                            console.error(`Error loading image ${index}:`, {
                                                                url: media.url,
                                                                fullUrl: e.target.src,
                                                                error: e
                                                            });
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                                                        }}
                                                        loading="lazy"
                                                    />
                                                </Box>
                                            ) : media.type === 'video' ? (
                                                <Box
                                                    component="video"
                                                    src={getMediaUrl(media.url)}
                                                    controls
                                                    sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            ) : (
                                                <Box sx={{ 
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                                }}>
                                                    <Typography color="text.secondary">
                                                        Unsupported format
                                                    </Typography>
                                                </Box>
                                            )}
                                            
                                            {/* Overlay for showing "more images" indicator */}
                                            {isShowingPartial && (
                                                <Box 
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Typography variant="h6" color="white" fontWeight="bold">
                                                        +{post.media.length - 3} more
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}
                    </Box>
                )}

                <Box sx={{ display: 'flex', p: 3 }}>
                    {/* Voting Section - Improved styling */}
                    <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pr: 3,
        borderRight: '1px solid rgba(0,0,0,0.1)',
        minWidth: '60px'
    }}>
        <Tooltip title="Upvote" arrow>
            <IconButton
                size="medium"
                onClick={() => handleVote(1)}
                sx={{ 
                    color: userVote === 1 ? 'primary.main' : 'action.disabled',
                    '&:hover': { color: 'primary.main', transform: 'scale(1.1)' }
                }}
            >
                <ArrowUpwardIcon fontSize="medium" />
            </IconButton>
        </Tooltip>

        <Box sx={{ textAlign: 'center', mt: 1, mb: 1 }}>
            <Typography 
                variant="subtitle2" 
                sx={{ 
                    color: 'primary.main', 
                    fontWeight: 600 
                }}
            >
                ↑ {upvotes}
            </Typography>
            <Typography 
                variant="subtitle2" 
                sx={{ 
                    color: 'error.main', 
                    fontWeight: 600 
                }}
            >
                ↓ {downvotes}
            </Typography>
        </Box>

        <Tooltip title="Downvote" arrow>
            <IconButton
                size="medium"
                onClick={() => handleVote(-1)}
                sx={{ 
                    color: userVote === -1 ? 'error.main' : 'action.disabled',
                    '&:hover': { color: 'error.main', transform: 'scale(1.1)' }
                }}
            >
                <ArrowDownwardIcon fontSize="medium" />
            </IconButton>
        </Tooltip>

        {(upvotes - downvotes) > 10 && (
            <Tooltip title="Trending" arrow>
                <LocalFireDepartmentIcon 
                    sx={{ 
                        color: 'orange',
                        mt: 1,
                        animation: 'pulse 2s infinite'
                    }} 
                />
            </Tooltip>
        )}
    </Box>

                    {/* Main Content */}
                    <Box sx={{ flex: 1, pl: 3 }}>
                        {/* Post Header */}
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                <Avatar 
                                    sx={{ 
                                        width: 36, 
                                        height: 36, 
                                        bgcolor: avatarColor,
                                        fontSize: '1rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {post.authorName.charAt(0)}
                                </Avatar>
                                <Typography variant="subtitle2" color="text.secondary">
                                    {post.authorName} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </Typography>
                                {post.isScammer && (
        <Tooltip title="This user has a high number of downvoted posts. Use caution.">
            <Chip
                icon={<WarningAmberIcon />}
                label="Scammer Risk"
                color="error"
                size="small"
                sx={{
                    fontWeight: 600,
                    backgroundColor: '#fdecea',
                    color: '#b71c1c',
                    borderRadius: 2
                }}
            />
        </Tooltip>
    )}
                                <Chip 
                                    label={post.category}
                                    size="small"
                                    sx={{ 
                                        height: '24px',
                                        fontSize: '0.875rem',
                                        backgroundColor: `${getRandomColor(post.category)}20`,
                                        color: getRandomColor(post.category),
                                        fontWeight: 600,
                                        '&:hover': {
                                            backgroundColor: `${getRandomColor(post.category)}30`,
                                        }
                                    }}
                                />
                            </Box>
                            <Typography variant="h5" sx={{ fontSize: '1.35rem', fontWeight: 700, mb: 1, lineHeight: 1.3 }}>
                                {post.title}
                            </Typography>
                        </Box>

                        {/* Post Content */}
                        <Typography 
                            variant="body1" 
                            color="text.secondary" 
                            sx={{ mb: 2, lineHeight: 1.6 }}
                            className="post-content"
                        >
                            {post.content}
                        </Typography>

                        {/* Location */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {post.location}
                            </Typography>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ 
                            display: 'flex', 
                            gap: 2, 
                            borderTop: '1px solid rgba(0,0,0,0.1)',
                            pt: 2,
                            mt: 2
                        }}>
                            <Tooltip title={commentsOpen ? "Hide comments" : "Show comments"} arrow>
                                <Button
                                    startIcon={comments.length > 0 ? <ChatBubbleIcon /> : <ChatBubbleOutlineIcon />}
                                    size="medium"
                                    onClick={handleCommentsOpen}
                                    sx={{ 
                                        color: commentsOpen ? 'primary.main' : 'text.secondary',
                                        textTransform: 'none',
                                        '&:hover': { 
                                            backgroundColor: 'action.hover',
                                            color: 'primary.main',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                >
                                    {comments.length > 0 ? `Comments (${comments.length})` : 'Comments'}
                                </Button>
                            </Tooltip>
                            <Tooltip title="Share this post" arrow>
                                <Button
                                    startIcon={<ShareIcon />}
                                    size="medium"
                                    sx={{ 
                                        color: 'text.secondary',
                                        textTransform: 'none',
                                        '&:hover': { 
                                            backgroundColor: 'action.hover',
                                            color: 'primary.main',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                >
                                    Share
                                </Button>
                            </Tooltip>
                            <Tooltip title={isSaved ? "Remove from saved" : "Save this post"} arrow>
                                <Button
                                    startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                    size="medium"
                                    onClick={() => handleSavePost(post._id)}
                                    sx={{ 
                                        color: isSaved ? 'primary.main' : 'text.secondary',
                                        textTransform: 'none',
                                        '&:hover': { 
                                            backgroundColor: 'action.hover',
                                            color: 'primary.main',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                >
                                    {isSaved ? 'Saved' : 'Save'}
                                </Button>
                            </Tooltip>
                            <Tooltip title="More options" arrow>
                                <IconButton 
                                    size="medium" 
                                    sx={{ 
                                        ml: 'auto',
                                        '&:hover': { transform: 'rotate(90deg)' },
                                        transition: 'transform 0.3s ease-in-out'
                                    }}
                                    onClick={handleMenuClick}
                                >
                                    <MoreHorizIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
                
                {/* Comment Dropdown Section - replaces the Dialog */}
                <AnimatePresence initial={false}>
                    {commentsOpen && (
                        <MotionBox
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            sx={{ 
                                overflow: 'hidden',
                                borderTop: '1px solid rgba(0,0,0,0.1)',
                                backgroundColor: 'rgba(0,0,0,0.01)'
                            }}
                        >
                            <Box sx={{ p: 3 }}>
                                {/* New Comment Input */}
                                <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: getRandomColor(post.authorName) }}>
                                        {post.authorName.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Write a comment..."
                                            multiline
                                            rows={2}
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton 
                                                            onClick={handleCommentSubmit}
                                                            disabled={!newComment.trim()}
                                                            color="primary"
                                                        >
                                                            <SendIcon />
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                }
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                {/* Comments List */}
                                {loadingComments ? (
                                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress size={32} />
                                    </Box>
                                ) : commentError ? (
                                    <Alert severity="error" sx={{ my: 2 }}>{commentError}</Alert>
                                ) : comments.length === 0 ? (
                                    <Box sx={{ py: 4, textAlign: 'center' }}>
                                        <Typography color="text.secondary">
                                            No comments yet. Be the first to comment!
                                        </Typography>
                                    </Box>
                                ) : (
                                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                        {comments.map((comment) => (
                                            <ListItem
                                                key={comment._id}
                                                alignItems="flex-start"
                                                sx={{ 
                                                    py: 2,
                                                    px: 1,
                                                    '&:hover': { 
                                                        backgroundColor: 'rgba(0,0,0,0.03)',
                                                        borderRadius: 2
                                                    }
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: getRandomColor(comment.authorName) }}>
                                                        {comment.authorName.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                            {comment.authorName}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <>
                                                            <Typography
                                                                component="span"
                                                                variant="body2"
                                                                color="text.primary"
                                                                sx={{ display: 'block', mb: 1 }}
                                                            >
                                                                {comment.text}
                                                            </Typography>
                                                            <Typography
                                                                component="span"
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                            </Typography>
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Box>
                        </MotionBox>
                    )}
                </AnimatePresence>

                <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={handleMenuClose}
                    TransitionComponent={Fade}
                >
                    <MenuItem onClick={() => {
                        handleMenuClose();
                        handleReportPost(post);
                    }}>
                        <FlagIcon sx={{ mr: 1 }} /> Report Post
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                        <VisibilityOffIcon sx={{ mr: 1 }} /> Hide Post
                    </MenuItem>
                </Menu>
            </MotionCard>
        );
    };

    const LoadingSkeleton = () => (
        <Box sx={{ mb: 2 }}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            <Box sx={{ pt: 1 }}>
                <Skeleton width="60%" />
                <Skeleton width="40%" />
            </Box>
        </Box>
    );

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Skeleton variant="rectangular" height={50} sx={{ borderRadius: 1 }} />
                </Box>
                {[1, 2, 3].map((i) => (
                    <LoadingSkeleton key={i} />
                ))}
            </Container>
        );
    }

    if (error) {
        return (
            <Box m={2} display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
                <Button
                    startIcon={<RefreshIcon />}
                    onClick={fetchPosts}
                    variant="contained"
                    color="primary"
                >
                    Retry Loading Posts
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            p: { xs: 2, sm: 3, md: 4 },
            pt: { xs: 8, sm: 9, md: 10 },
            backgroundColor: '#F8F9FB',
            minHeight: '100vh'
        }}>
            <MotionContainer 
                maxWidth="lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header Section - Improved UI */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 3,
                    mb: 4,
                    px: 2,
                    pb: 4,
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                }}>
                    <Box>
                        <Typography variant="h3" sx={{ 
                            fontSize: { xs: '2rem', sm: '2.5rem' },
                            fontWeight: 800,
                            mb: 1,
                            background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Community Feed
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Discover and share stories that matter
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 2,
                        flexDirection: { xs: 'column', sm: 'row' },
                        width: { xs: '100%', sm: 'auto' }
                    }}>
                        <TextField
                            placeholder="Search posts..."
                            size="medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                backgroundColor: 'white',
                                borderRadius: '30px',
                                minWidth: '250px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '30px',
                                }
                            }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                startIcon={<FilterListIcon />}
                                onClick={handleFilterClick}
                                variant="outlined"
                                sx={{ 
                                    textTransform: 'none',
                                    borderRadius: '30px',
                                    whiteSpace: 'nowrap',
                                    px: 3,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    borderColor: 'rgba(0,0,0,0.15)',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                    }
                                }}
                            >
                                Sort: {sortBy === 'newest' 
                                        ? 'Newest' 
                                        : sortBy === 'oldest'
                                        ? 'Oldest'
                                        : sortBy === 'trending' 
                                        ? 'Trending' 
                                        : sortBy === 'upvotes'
                                        ? 'Most Upvoted'
                                        : 'Newest'}
                            </Button>
                            <Button
                                startIcon={<RefreshIcon />}
                                onClick={fetchPosts}
                                variant="contained"
                                sx={{ 
                                    textTransform: 'none',
                                    borderRadius: '30px',
                                    px: 3,
                                    background: 'linear-gradient(45deg, #1a237e 30%, #283593 90%)',
                                    boxShadow: '0 4px 10px rgba(26, 35, 126, 0.3)',
                                    '&:hover': {
                                        boxShadow: '0 6px 12px rgba(26, 35, 126, 0.4)',
                                    }
                                }}
                            >
                                Refresh
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Sort Menu */}
                <Menu
                    anchorEl={filterAnchorEl}
                    open={Boolean(filterAnchorEl)}
                    onClose={handleFilterClose}
                    TransitionComponent={Fade}
                    PaperProps={{
                        sx: { 
                            width: '200px',
                            borderRadius: 2,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            mt: 1
                        }
                    }}
                >
                    <Typography sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 600 }}>
                        Sort Posts By
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <MenuItem 
                        onClick={() => handleSortChange('newest')}
                        sx={{ 
                            py: 1.5,
                            borderLeft: sortBy === 'newest' ? '4px solid #1a237e' : '4px solid transparent',
                            backgroundColor: sortBy === 'newest' ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                        }}
                    >
                        <NewReleasesIcon sx={{ mr: 2, color: sortBy === 'newest' ? 'primary.main' : 'text.secondary' }} />
                        <Typography sx={{ fontWeight: sortBy === 'newest' ? 600 : 400 }}>
                            Newest First
                        </Typography>
                    </MenuItem>
                    <MenuItem 
                        onClick={() => handleSortChange('oldest')}
                        sx={{ 
                            py: 1.5,
                            borderLeft: sortBy === 'oldest' ? '4px solid #1a237e' : '4px solid transparent',
                            backgroundColor: sortBy === 'oldest' ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                        }}
                    >
                        <NewReleasesIcon sx={{ mr: 2, color: sortBy === 'oldest' ? 'primary.main' : 'text.secondary', transform: 'rotate(180deg)' }} />
                        <Typography sx={{ fontWeight: sortBy === 'oldest' ? 600 : 400 }}>
                            Oldest First
                        </Typography>
                    </MenuItem>
                    <MenuItem 
                        onClick={() => handleSortChange('trending')}
                        sx={{ 
                            py: 1.5,
                            borderLeft: sortBy === 'trending' ? '4px solid #1a237e' : '4px solid transparent',
                            backgroundColor: sortBy === 'trending' ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                        }}
                    >
                        <TrendingUpIcon sx={{ mr: 2, color: sortBy === 'trending' ? 'primary.main' : 'text.secondary' }} />
                        <Typography sx={{ fontWeight: sortBy === 'trending' ? 600 : 400 }}>
                            Trending
                        </Typography>
                    </MenuItem>
                    <MenuItem 
                        onClick={() => handleSortChange('upvotes')}
                        sx={{ 
                            py: 1.5,
                            borderLeft: sortBy === 'upvotes' ? '4px solid #1a237e' : '4px solid transparent',
                            backgroundColor: sortBy === 'upvotes' ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                        }}
                    >
                        <ArrowUpwardIcon sx={{ mr: 2, color: sortBy === 'upvotes' ? 'primary.main' : 'text.secondary' }} />
                        <Typography sx={{ fontWeight: sortBy === 'upvotes' ? 600 : 400 }}>
                            Most Upvoted
                        </Typography>
                    </MenuItem>
                </Menu>

                {/* Tabs and View Mode */}
                <Box sx={{ 
                    mb: 4,
                    px: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Tabs 
                        value={currentTab} 
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                minWidth: 120,
                                fontWeight: 600,
                                fontSize: '1rem'
                            },
                            '& .Mui-selected': {
                                color: '#1a237e',
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#1a237e',
                                height: 3,
                                borderRadius: '3px 3px 0 0'
                            }
                        }}
                    >
                        <Tab 
                            label="All Posts" 
                            icon={<WhatshotIcon />} 
                            iconPosition="start"
                        />
                        <Tab 
                            label={
                                <Badge badgeContent={savedPosts.size} color="primary">
                                    Saved
                                </Badge>
                            } 
                            icon={<BookmarkIcon />} 
                            iconPosition="start"
                        />
                    </Tabs>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={viewMode === 'compact'}
                                onChange={(e) => setViewMode(e.target.checked ? 'compact' : 'card')}
                                color="primary"
                            />
                        }
                        label="Compact View"
                        sx={{
                            '& .MuiFormControlLabel-label': {
                                fontWeight: 500
                            }
                        }}
                    />
                </Box>

                {/* Main Content */}
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <AnimatePresence>
                            {filteredAndSortedPosts.length === 0 ? (
                                <Alert 
                                    severity="info" 
                                    sx={{ 
                                        mt: 2,
                                        p: 3,
                                        borderRadius: 2,
                                        fontSize: '1rem'
                                    }}
                                >
                                    No posts match your search criteria
                                </Alert>
                            ) : (
                                currentTab === 0 ?
                                filteredAndSortedPosts.map((post) => (
                                    <PostCard key={post._id} post={post} />
                                )) :
                                filteredAndSortedPosts
                                    .filter(post => savedPosts.has(post._id))
                                    .map((post) => (
                                        <PostCard key={post._id} post={post} />
                                    ))
                            )}
                        </AnimatePresence>
                    </Grid>
                </Grid>
                
                {/* Community Guidelines Section */}
                {!isMobile && (
                    <Box sx={{ mt: 4 }}>
                        <Paper 
                            sx={{ 
                                p: 3, 
                                borderRadius: 3,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}
                            elevation={0}
                        >
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1.5, 
                                mb: 2.5 
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a237e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        fontWeight: 700,
                                        color: '#1a237e',
                                    }}
                                >
                                    Community Guidelines
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            {/* Guidelines Items - Two per row layout that matches the screenshot */}
                            <Grid container spacing={3}>
                                {/* First column */}
                                <Grid item xs={12} sm={6}>
                                    {/* Item 1: Be respectful and constructive */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                                        <Box sx={{ 
                                            backgroundColor: 'rgba(26, 35, 126, 0.1)', 
                                            borderRadius: '50%',
                                            minWidth: 40,
                                            height: 40,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            color: '#1a237e'
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                            </svg>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                Be respectful and constructive
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Treat others with kindness and share information that helps the community.
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Item 3: Report inappropriate content */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <Box sx={{ 
                                            backgroundColor: 'rgba(26, 35, 126, 0.1)', 
                                            borderRadius: '50%', 
                                            minWidth: 40,
                                            height: 40,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            color: '#1a237e'
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                                                <line x1="4" y1="22" x2="4" y2="15"></line>
                                            </svg>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                Report inappropriate content
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Flag harmful, illegal, or misleading posts to maintain safety.
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* Second column */}
                                <Grid item xs={12} sm={6}>
                                    {/* Item 2: Protect personal information */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                                        <Box sx={{ 
                                            backgroundColor: 'rgba(26, 35, 126, 0.1)', 
                                            borderRadius: '50%', 
                                            minWidth: 40,
                                            height: 40,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            color: '#1a237e'
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                            </svg>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                Protect personal information
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Never share private details that could identify or harm others.
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Item 4: Verify information before sharing */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <Box sx={{ 
                                            backgroundColor: 'rgba(26, 35, 126, 0.1)', 
                                            borderRadius: '50%', 
                                            minWidth: 40,
                                            height: 40,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            color: '#1a237e'
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 11 12 14 22 4"></polyline>
                                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                            </svg>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                Verify information before sharing
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Check facts to avoid spreading misinformation in the community.
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                            
                            <Box sx={{ 
                                mt: 3, 
                                pt: 2, 
                                borderTop: '1px solid rgba(0,0,0,0.08)',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                <Button 
                                    variant="outlined" 
                                    size="small"
                                    sx={{ 
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 2
                                    }}
                                >
                                    View Full Guidelines
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                )}
            </MotionContainer>

            {/* Report Dialog */}
            <Dialog 
                open={showReportDialog} 
                onClose={() => setShowReportDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Report Post</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Why are you reporting this post?
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        {[
                            'Inappropriate content',
                            'Misinformation',
                            'Spam',
                            'Harassment',
                            'Other'
                        ].map((reason) => (
                            <MenuItem key={reason} onClick={() => setShowReportDialog(false)}>
                                {reason}
                            </MenuItem>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowReportDialog(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Feed; 