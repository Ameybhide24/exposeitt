import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
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
    FormControlLabel
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

const MotionCard = motion(Card);
const MotionContainer = motion(Container);

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

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching posts from feed...');
            const response = await axios.get('http://localhost:5050/api/posts/feed');
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
                    const res = await axios.post(`http://localhost:5050/api/posts/upvote/${postId}`);
                    updatedPost = res.data;
                } else if (direction === -1) {
                    const res = await axios.post(`http://localhost:5050/api/posts/downvote/${postId}`);
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
            const serverBaseUrl = 'http://localhost:5050';
            
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
                            <Tooltip title="Comment on this post" arrow>
                                <Button
                                    startIcon={<ChatBubbleOutlineIcon />}
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
                                    Comments
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
                                Sort By
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
                    <Grid item xs={12} md={8}>
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
                    
                    {!isMobile && (
                        <Grid item md={4}>
                            <Paper 
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 3,
                                    position: 'sticky',
                                    top: 24,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(10px)'
                                }}
                                elevation={0}
                            >
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                    Community Guidelines
                                </Typography>
                                <Divider sx={{ mb: 3 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        1. Be respectful and constructive
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        2. Protect personal information
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        3. Report inappropriate content
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        4. Verify information before sharing
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
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