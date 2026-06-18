require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const passport = require('./auth');
const routes = require('./routes');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

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

module.exports = app;
