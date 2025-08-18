const express = require('express');
const { listPosts, createPost, likePost } = require('../controllers/communityController');

const router = express.Router();

// GET all posts
router.get('/posts', listPosts);

// Create a new post
router.post('/posts', createPost);

// Like a post
router.post('/posts/:id/like', likePost);

module.exports = router;
