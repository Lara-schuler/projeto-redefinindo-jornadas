const session = require('express-session'); 

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'defaultSecret', // Use um segredo para proteger a sessão
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
    },    
});

module.exports = sessionMiddleware;
