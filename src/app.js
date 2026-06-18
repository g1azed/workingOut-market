require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const passport = require('./auth');
const routes = require('./routes');
const path = require('path');
const fs = require('fs');

const app = express();

// Built React SPA (see ../client). Served statically with an index.html
// fallback so client-side routes resolve to the app.
const clientDist = path.join(__dirname, '../client/dist');
const indexHtml = path.join(clientDist, 'index.html');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(clientDist));

// JWT 쿠키로 인증 상태 복원
app.use((req, res, next) => {
  const token = req.cookies.auth_token;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.SESSION_SECRET || 'dev-secret');
    } catch {
      req.user = null;
    }
  }
  req.isAuthenticated = () => !!req.user;
  next();
});

app.use(passport.initialize());
app.use(routes);

// SPA fallback: any non-API/non-auth GET serves the React entry point.
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api') || req.path.startsWith('/auth')) return next();
  if (fs.existsSync(indexHtml)) return res.sendFile(indexHtml);
  next();
});

module.exports = app;
