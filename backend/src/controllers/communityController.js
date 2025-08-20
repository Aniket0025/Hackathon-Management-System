const Post = require('../models/Post');
const Announcement = require('../models/Announcement');
const Question = require('../models/Question');
const { uploadBuffer } = require('../utils/cloudinary');
const User = require('../models/User');

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

// Announcements
async function listAnnouncements(req, res, next) {
  try {
    const anns = await Announcement.find({}).sort({ pinned: -1, createdAt: -1 }).lean();
    res.json({ announcements: anns });
  } catch (err) {
    next(err);
  }
}

async function createAnnouncement(req, res, next) {
  try {
    const { title, body, author, pinned, tags } = req.body || {};
    if (!title || !body) {
      return res.status(400).json({ message: 'title and body are required' });
    }
    const ann = await Announcement.create({
      title: String(title).trim(),
      body: String(body).trim(),
      author: author ? String(author).trim() : undefined,
      pinned: !!pinned,
      tags: Array.isArray(tags) ? tags.map(String) : [],
    });
    res.status(201).json({ announcement: ann });
  } catch (err) {
    next(err);
  }
}

module.exports.listAnnouncements = listAnnouncements;
module.exports.createAnnouncement = createAnnouncement;

// Upload banner for an announcement
async function uploadAnnouncementBanner(req, res, next) {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: 'No banner file uploaded' });

    const ann = await Announcement.findById(id);
    if (!ann) return res.status(404).json({ message: 'Announcement not found' });

    const folder = `announcements/${id}/banner`;
    const result = await uploadBuffer(req.file.buffer, folder, {
      transformation: [{ width: 1600, height: 900, crop: 'fill' }],
      format: 'jpg',
    });

    ann.bannerUrl = result.secure_url;
    await ann.save();

    return res.json({ announcement: ann, bannerUrl: ann.bannerUrl });
  } catch (err) {
    next(err);
  }
}

module.exports.uploadAnnouncementBanner = uploadAnnouncementBanner;

// Q&A
async function listQuestions(req, res, next) {
  try {
    const qs = await Question.find({}).sort({ upvotes: -1, createdAt: -1 }).lean();

    // Replace ObjectId-like author strings with user names for nicer UI
    const objectIdRe = /^[a-fA-F0-9]{24}$/;
    const ids = new Set();
    for (const q of qs) {
      if (typeof q.author === 'string' && objectIdRe.test(q.author)) ids.add(q.author);
      if (Array.isArray(q.answers)) {
        for (const a of q.answers) {
          if (a && typeof a.author === 'string' && objectIdRe.test(a.author)) ids.add(a.author);
        }
      }
    }
    const idList = Array.from(ids);
    let nameMap = new Map();
    if (idList.length) {
      const users = await User.find({ _id: { $in: idList } }).select('name email').lean();
      for (const u of users) {
        nameMap.set(String(u._id), u.name || (u.email ? String(u.email).split('@')[0] : 'User'));
      }
    }
    const mapped = qs.map((q) => ({
      ...q,
      author: (typeof q.author === 'string' && nameMap.get(q.author)) || q.author,
      answers: (q.answers || []).map((a) => ({
        ...a,
        author: (a && typeof a.author === 'string' && nameMap.get(a.author)) || a.author,
      })),
    }));

    res.json({ questions: mapped });
  } catch (err) {
    next(err);
  }
}

async function createQuestion(req, res, next) {
  try {
    const { title, body, author, tags } = req.body || {};
    if (!title || !body) {
      return res.status(400).json({ message: 'title and body are required' });
    }
    // derive author from request body or authenticated user
    let finalAuthor = (author && String(author).trim()) || null;
    if (!finalAuthor && req.user) {
      try {
        const u = await User.findById(req.user.id).select('name email').lean();
        finalAuthor = (u && (u.name || (u.email ? String(u.email).split('@')[0] : null))) || req.user.id || 'User';
      } catch { finalAuthor = req.user.id || 'User'; }
    }
    if (!finalAuthor) finalAuthor = 'Anonymous';

    const q = await Question.create({
      title: String(title).trim(),
      body: String(body).trim(),
      author: String(finalAuthor).trim(),
      tags: Array.isArray(tags) ? tags.map(String) : [],
    });
    res.status(201).json({ question: q });
  } catch (err) {
    next(err);
  }
}

module.exports.listQuestions = listQuestions;
module.exports.createQuestion = createQuestion;

// Add an answer to a question
async function addAnswer(req, res, next) {
  try {
    const { id } = req.params;
    const { body, author } = req.body || {};
    if (!body) return res.status(400).json({ message: 'body is required' });

    let finalAuthor = (author && String(author).trim()) || null;
    if (!finalAuthor && req.user) {
      try {
        const u = await User.findById(req.user.id).select('name email').lean();
        finalAuthor = (u && (u.name || (u.email ? String(u.email).split('@')[0] : null))) || req.user.id || 'User';
      } catch { finalAuthor = req.user.id || 'User'; }
    }
    if (!finalAuthor) finalAuthor = 'Anonymous';

    const q = await Question.findById(id);
    if (!q) return res.status(404).json({ message: 'Question not found' });

    q.answers.push({ body: String(body).trim(), author: String(finalAuthor).trim() });
    await q.save();

    const answer = q.answers[q.answers.length - 1];
    res.status(201).json({ question: q, answer });
  } catch (err) {
    next(err);
  }
}

module.exports.addAnswer = addAnswer;

// Upvote a question
async function upvoteQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const q = await Question.findByIdAndUpdate(id, { $inc: { upvotes: 1 } }, { new: true });
    if (!q) return res.status(404).json({ message: 'Question not found' });
    res.json({ question: q });
  } catch (err) {
    next(err);
  }
}

// Upvote an answer on a question
async function upvoteAnswer(req, res, next) {
  try {
    const { qid, aid } = req.params;
    const q = await Question.findById(qid);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    const answer = q.answers.id(aid);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    answer.upvotes = (answer.upvotes || 0) + 1;
    await q.save();
    res.json({ question: q, answer });
  } catch (err) {
    next(err);
  }
}

// Toggle or set solved on a question
async function setSolved(req, res, next) {
  try {
    const { id } = req.params;
    const { solved } = req.body || {};
    const q = await Question.findById(id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    const nextVal = typeof solved === 'boolean' ? !!solved : !q.solved;
    q.solved = nextVal;
    await q.save();
    res.json({ question: q });
  } catch (err) {
    next(err);
  }
}

module.exports.upvoteQuestion = upvoteQuestion;
module.exports.upvoteAnswer = upvoteAnswer;
module.exports.setSolved = setSolved;
