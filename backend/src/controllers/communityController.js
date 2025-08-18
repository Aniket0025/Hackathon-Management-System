const Post = require('../models/Post');

async function listPosts(req, res, next) {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 }).lean();
    res.json({ posts });
  } catch (err) {
    next(err);
  }
}

async function createPost(req, res, next) {
  try {
    const { title, author, body } = req.body || {};
    if (!title || !author) {
      return res.status(400).json({ message: 'title and author are required' });
    }
    const post = await Post.create({ title: String(title).trim(), author: String(author).trim(), body: String(body || '').trim() });
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
}

async function likePost(req, res, next) {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPosts, createPost, likePost };
