const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const passport = require('./auth');

const router = express.Router();

const uploadDir = process.env.UPLOAD_PATH || path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('이미지 파일만 업로드 가능합니다.'));
  }
});

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// Auth
router.get('/auth/discord', passport.authenticate('discord'));
router.get('/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/login' }),
  (req, res) => res.redirect('/')
);
router.get('/auth/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

// Pages
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/');
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
router.get('/items/new', requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../public/new-item.html')));
router.get('/items/:id', (req, res) => res.sendFile(path.join(__dirname, '../public/item-detail.html')));
router.get('/profile', requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../public/profile.html')));

// API
router.get('/api/me', (req, res) => {
  if (!req.isAuthenticated()) return res.json(null);
  res.json(req.user);
});

router.get('/api/items', (req, res) => {
  const { category, search, page = 1 } = req.query;
  const limit = 20;
  const offset = (page - 1) * limit;
  let query = 'SELECT items.*, users.username, users.avatar FROM items JOIN users ON items.user_id = users.id WHERE 1=1';
  const params = [];

  if (category && category !== 'all') { query += ' AND category = ?'; params.push(category); }
  if (search) { query += ' AND (title LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const total = db.prepare(query.replace('SELECT items.*, users.username, users.avatar', 'SELECT COUNT(*)')).get(...params);
  query += ' ORDER BY items.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const items = db.prepare(query).all(...params);
  items.forEach(item => { item.images = JSON.parse(item.images || '[]'); });

  res.json({ items, total: total['COUNT(*)'], page: Number(page), pages: Math.ceil(total['COUNT(*)'] / limit) });
});

router.get('/api/items/:id', (req, res) => {
  const item = db.prepare('SELECT items.*, users.username, users.avatar, users.id as seller_id FROM items JOIN users ON items.user_id = users.id WHERE items.id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  item.images = JSON.parse(item.images || '[]');
  res.json(item);
});

router.post('/api/items', requireAuth, upload.array('images', 5), (req, res) => {
  const { title, description, price, category } = req.body;
  if (!title || !description || !price || !category) return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
  const images = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
  const result = db.prepare('INSERT INTO items (user_id, title, description, price, category, images) VALUES (?, ?, ?, ?, ?, ?)')
    .run(req.user.id, title, description, Number(price), category, JSON.stringify(images));
  res.json({ id: result.lastInsertRowid });
});

router.patch('/api/items/:id/status', requireAuth, (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  if (item.user_id !== req.user.id) return res.status(403).json({ error: '권한이 없습니다.' });
  const { status } = req.body;
  if (!['selling', 'reserved', 'sold'].includes(status)) return res.status(400).json({ error: '올바르지 않은 상태입니다.' });
  db.prepare('UPDATE items SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

router.delete('/api/items/:id', requireAuth, (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  if (item.user_id !== req.user.id) return res.status(403).json({ error: '권한이 없습니다.' });
  const images = JSON.parse(item.images || '[]');
  images.forEach(img => {
    const filePath = path.join(uploadDir, path.basename(img));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });
  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.get('/api/profile/items', requireAuth, (req, res) => {
  const items = db.prepare('SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  items.forEach(item => { item.images = JSON.parse(item.images || '[]'); });
  res.json(items);
});

module.exports = router;
