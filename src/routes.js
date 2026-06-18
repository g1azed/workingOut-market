const express = require('express');
const multer = require('multer');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const { db } = require('./firebase');
const passport = require('./auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('이미지 파일만 업로드 가능합니다.'));
  }
});

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'workingout-market', resource_type: 'image' },
      (err, result) => err ? reject(err) : resolve(result.secure_url)
    );
    stream.end(file.buffer);
  });
}

async function deleteFromCloudinary(url) {
  try {
    const match = url.match(/workingout-market\/([^.]+)/);
    if (match) await cloudinary.uploader.destroy('workingout-market/' + match[1]);
  } catch {}
}

// Auth
router.get('/auth/discord', passport.authenticate('discord'));
router.get('/auth/discord/callback',
  (req, res, next) => {
    passport.authenticate('discord', (err, user) => {
      if (err) { console.error('Discord auth error:', JSON.stringify(err)); return res.redirect('/login'); }
      if (!user) return res.redirect('/login');
      req.logIn(user, err2 => {
        if (err2) return res.redirect('/login');
        res.redirect('/');
      });
    })(req, res, next);
  }
);
router.get('/auth/logout', (req, res) => req.logout(() => res.redirect('/')));

// Pages
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/');
  res.sendFile(path.join(__dirname, '../public/login.html'));
});
router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
router.get('/items/new', requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../public/new-item.html')));
router.get('/items/:id/edit', requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../public/edit-item.html')));
router.get('/items/:id', (req, res) => res.sendFile(path.join(__dirname, '../public/item-detail.html')));
router.get('/profile', requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../public/profile.html')));

// API
router.get('/api/me', (req, res) => res.json(req.isAuthenticated() ? req.user : null));

router.get('/api/items', async (req, res) => {
  try {
    const { category, search, page = 1 } = req.query;
    const limit = 20;

    let query = db.collection('items').orderBy('created_at', 'desc');
    if (category && category !== 'all') query = query.where('category', '==', category);

    const snapshot = await query.get();
    let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(item =>
        item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      );
    }

    const total = items.length;
    const offset = (Number(page) - 1) * limit;
    items = items.slice(offset, offset + limit);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/items/:id', async (req, res) => {
  try {
    const doc = await db.collection('items').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/items', requireAuth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, price, category, trade_type, trade_location } = req.body;
    if (!title || !description || !price || !category) return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    if (!['direct', 'delivery'].includes(trade_type)) return res.status(400).json({ error: '거래 방식을 선택해주세요.' });

    const images = req.files ? await Promise.all(req.files.map(uploadToCloudinary)) : [];

    const item = {
      user_id: req.user.id,
      username: req.user.username,
      avatar: req.user.avatar || null,
      seller_id: req.user.id,
      title, description,
      price: Number(price),
      category,
      images,
      status: 'selling',
      trade_type,
      trade_location: trade_type === 'direct' ? (trade_location || '') : '',
      created_at: new Date().toISOString(),
    };

    const ref = await db.collection('items').add(item);
    res.json({ id: ref.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/items/:id', requireAuth, upload.array('images', 5), async (req, res) => {
  try {
    const doc = await db.collection('items').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    if (doc.data().user_id !== req.user.id) return res.status(403).json({ error: '권한이 없습니다.' });

    const { title, description, price, category, trade_type, trade_location } = req.body;
    if (!title || !description || !price || !category) return res.status(400).json({ error: '모든 필드를 입력해주세요.' });

    let images = doc.data().images || [];
    if (req.files && req.files.length > 0) {
      await Promise.all(images.map(deleteFromCloudinary));
      images = await Promise.all(req.files.map(uploadToCloudinary));
    }

    await db.collection('items').doc(req.params.id).update({
      title, description, price: Number(price), category, images,
      trade_type, trade_location: trade_type === 'direct' ? (trade_location || '') : '',
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/api/items/:id/status', requireAuth, async (req, res) => {
  try {
    const doc = await db.collection('items').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    if (doc.data().user_id !== req.user.id) return res.status(403).json({ error: '권한이 없습니다.' });
    const { status } = req.body;
    if (!['selling', 'reserved', 'sold'].includes(status)) return res.status(400).json({ error: '올바르지 않은 상태입니다.' });
    await db.collection('items').doc(req.params.id).update({ status });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/items/:id', requireAuth, async (req, res) => {
  try {
    const doc = await db.collection('items').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
    if (doc.data().user_id !== req.user.id) return res.status(403).json({ error: '권한이 없습니다.' });
    await Promise.all((doc.data().images || []).map(deleteFromCloudinary));
    await db.collection('items').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/profile/items', requireAuth, async (req, res) => {
  try {
    const snapshot = await db.collection('items')
      .where('user_id', '==', req.user.id)
      .orderBy('created_at', 'desc')
      .get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
