const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const db = require('./db');

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify']
}, (accessToken, refreshToken, profile, done) => {
  console.log('Discord OAuth callback - profile:', profile?.id, profile?.username);
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(profile.id);
  if (!existing) {
    db.prepare('INSERT INTO users (id, username, discriminator, avatar) VALUES (?, ?, ?, ?)')
      .run(profile.id, profile.username, profile.discriminator || '0', profile.avatar || null);
  } else {
    db.prepare('UPDATE users SET username = ?, avatar = ? WHERE id = ?')
      .run(profile.username, profile.avatar || null, profile.id);
  }
  return done(null, { id: profile.id, username: profile.username, avatar: profile.avatar });
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  done(null, user || false);
});

module.exports = passport;
