require('dotenv').config();
const express = require('express');
const cookieSession = require('cookie-session');
const passport = require('./auth');
const routes = require('./routes');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_SECRET || 'dev-secret',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
}));
// passport와 cookie-session 호환
app.use((req, res, next) => {
  if (req.session && !req.session.regenerate) {
    req.session.regenerate = (cb) => cb();
    req.session.save = (cb) => cb();
  }
  next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

module.exports = app;
