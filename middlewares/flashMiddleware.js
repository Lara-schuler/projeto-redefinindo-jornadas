const flash = require('connect-flash');

// Middleware de flash messages
const flashMiddleware = (req, res, next) => {
    res.locals.messages = {
        error: req.flash('error'),
        success: req.flash('success')
    };
    next();
};

module.exports = flashMiddleware;
