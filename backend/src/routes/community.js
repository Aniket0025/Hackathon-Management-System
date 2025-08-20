const express = require('express');
const { listPosts, createPost, likePost, listAnnouncements, createAnnouncement, uploadAnnouncementBanner, listQuestions, createQuestion, addAnswer, upvoteQuestion, upvoteAnswer, setSolved } = require('../controllers/communityController');
const { auth, requireRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET all posts
router.get('/posts', listPosts);

// Create a new post
router.post('/posts', createPost);

// Like a post
router.post('/posts/:id/like', likePost);

// Announcements
router.get('/announcements', auth(false), listAnnouncements);
router.post('/announcements', auth(true), requireRoles('organizer', 'admin'), createAnnouncement);
router.post('/announcements/:id/banner', auth(true), requireRoles('organizer', 'admin'), upload.single('banner'), uploadAnnouncementBanner);

// Q&A
router.get('/questions', auth(false), listQuestions);
router.post('/questions', auth(true), createQuestion);
router.post('/questions/:id/answers', auth(true), addAnswer);
router.post('/questions/:id/upvote', auth(true), upvoteQuestion);
router.post('/questions/:qid/answers/:aid/upvote', auth(true), upvoteAnswer);
router.post('/questions/:id/solved', auth(true), requireRoles('organizer', 'admin'), setSolved);

module.exports = router;
