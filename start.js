const express = require('express');
const path = require('path');
require('dotenv').config();
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');

// Importar middlewares
const sessionMiddleware = require('./src/middlewares/sessionMiddleware'); // middleware de sessão
const flashMiddleware = require('./src/middlewares/flashMiddleware'); // middleware de mensagens flash
const localVariablesMiddleware = require('./src/middlewares/localVariablesMiddleware'); // Importa o middleware

const app = express();
const port = process.env.PORT || 5000;

// Usar middlewares
app.use(sessionMiddleware);
app.use(flash());
app.use(localVariablesMiddleware);

// Configura o parsing do corpo das requisições
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, './src/public')));

// Define o caminho absoluto para as views
app.set('views', path.join(__dirname, './src/views'));

// Define o template engine e layouts
app.use(expressLayouts);
app.set('layout', path.join(__dirname, './src/views', './src/layouts', './src/default', './src/index')); // Usando caminho absoluto para o layout
app.set('view engine', 'ejs');

// Usar as rotas
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const psrRoutes = require('./src/routes/psrRoutes');
const ongRoutes = require('./src/routes/ongRoutes');
const voluntarioRoutes = require('./src/routes/voluntarioRoutes');
const empresaRoutes = require('./src/routes/empresaRoutes');
const parceiroRoutes = require('./src/routes/parceiroRoutes');
const eventoRoutes = require('./src/routes/eventoRoutes');
const servicoRoutes = require('./src/routes/servicoRoutes');
const mainRoutes = require('./src/routes/mainRoutes');

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/psr', psrRoutes);
app.use('/ong', ongRoutes);
app.use('/voluntario', voluntarioRoutes);
app.use('/empresa', empresaRoutes);
app.use('/eventos', eventoRoutes);
app.use('/servicos', servicoRoutes);
app.use('/parceiro', parceiroRoutes);
app.use('/', mainRoutes);

// Inicializa o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
