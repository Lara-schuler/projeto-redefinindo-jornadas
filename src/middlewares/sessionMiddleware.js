const session = require('express-session');

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'defaultSecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
  },
});

module.exports = sessionMiddleware;
