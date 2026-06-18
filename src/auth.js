const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { db } = require('./firebase');

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = {
      id: profile.id,
      username: profile.username,
      avatar: profile.avatar || null,
    };
    await db.collection('users').doc(profile.id).set(user, { merge: true });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

module.exports = passport;
