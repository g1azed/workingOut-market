require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./src/auth');
const routes = require('./src/routes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = process.env.UPLOAD_PATH || path.join(__dirname, 'public/uploads');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
