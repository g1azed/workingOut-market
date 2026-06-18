require('dotenv').config();
const express = require('express');
const session = require('express-session');
const FirestoreStore = require('./session-store');
const passport = require('./auth');
const routes = require('./routes');
const path = require('path');
const { db } = require('./firebase');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  store: new FirestoreStore(db),
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

module.exports = app;
