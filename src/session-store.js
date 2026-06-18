const session = require('express-session');

class FirestoreStore extends session.Store {
  constructor(db) {
    super();
    this.col = db.collection('sessions');
  }

  get(sid, cb) {
    this.col.doc(sid).get()
      .then(doc => {
        if (!doc.exists) return cb(null, null);
        const { sess, expires } = doc.data();
        if (expires && expires < Date.now()) {
          this.destroy(sid, () => {});
          return cb(null, null);
        }
        cb(null, sess);
      })
      .catch(cb);
  }

  set(sid, sess, cb) {
    const expires = sess.cookie?.expires
      ? new Date(sess.cookie.expires).getTime()
      : Date.now() + 7 * 24 * 60 * 60 * 1000;
    this.col.doc(sid).set({ sess, expires })
      .then(() => cb(null))
      .catch(cb);
  }

  destroy(sid, cb) {
    this.col.doc(sid).delete()
      .then(() => cb(null))
      .catch(cb);
  }
}

module.exports = FirestoreStore;
