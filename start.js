const express = require('express');
const path = require('path');
require("dotenv").config();
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');

// Importar middlewares
const sessionMiddleware = require('./middlewares/sessionMiddleware'); // middleware de sessão
const flashMiddleware = require('./middlewares/flashMiddleware'); // middleware de mensagens flash
const localVariablesMiddleware = require('./middlewares/localVariablesMiddleware'); // Importa o middleware

const app = express();
const port = process.env.PORT || 5000;

// Configura arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Usar middlewares
app.use(sessionMiddleware);
app.use(flash());
app.use(localVariablesMiddleware);

// Configura o parsing do corpo das requisições
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração para servir arquivos estáticos da pasta 'public'
app.use('/public', express.static(path.join(__dirname, 'public')));

// Define o caminho absoluto para as views
app.set('views', path.join(__dirname, 'views')); // Caminho absoluto para o diretório de views

// Define o template engine e layouts
app.use(expressLayouts);
app.set('layout', path.join(__dirname, 'views', 'layouts', 'default', 'index')); // Usando caminho absoluto para o layout
app.set('view engine', 'ejs');

// Usar as rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const psrRoutes = require('./routes/psrRoutes');
const ongRoutes = require('./routes/ongRoutes');
const voluntarioRoutes = require('./routes/voluntarioRoutes');
const empresaRoutes = require('./routes/empresaRoutes');
const parceiroRoutes = require('./routes/parceiroRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const mainRoutes = require('./routes/mainRoutes');

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
