// localVariablesMiddleware.js
const localVariablesMiddleware = (req, res, next) => {
  res.locals.layoutVariables = {
    url: process.env.URL,
    img: '/img/',
    style: '/css/',
    title: 'Redefinindo Jornadas',
  };
  res.locals.messages = req.flash(); // Adiciona mensagens do flash, se você estiver usando
  next();
};

module.exports = localVariablesMiddleware;
