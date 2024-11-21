const session = require('express-session'); 

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'defaultSecret', // Use um segredo para proteger a sessão
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Altere para true se estiver usando HTTPS
    },
});

module.exports = sessionMiddleware;
