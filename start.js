const express = require('express'); 
const path = require('path');
require("dotenv").config();
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');

const usuarioController = require('./controllers/usuarioController');

const app = express(); 
const port = 4000; 

// Configura arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

//Inicia sessão
app.use(session({
    secret: 'rj2024',
    resave: false, 
    saveUninitialized: false
}));

// Configura o parsing do corpo das requisições
app.use(express.urlencoded({ extended: true }));

// Define o template engine e layouts
app.use(expressLayouts);
app.set('layout', './layouts/default/index');
app.set('view engine', 'ejs');

// "Middleware" para definir variáveis locais
app.use((req, res, next) => {
    res.locals.layoutVariables = {
        url: process.env.URL,
        img: "/img/",
        style: "/css/",
        title: 'Redefinindo Jornadas',
    };
    next();
});

app.use(flash());

// Middleware para adicionar mensagens ao res.locals
app.use((req, res, next) => {
    res.locals.message = req.flash('message');
    next();
});

// Rotas
app.get('/', (req, res) => { 
    res.render('home', {
        layout: './layouts/default/index',
        title: 'Redefinindo Jornadas'
    }); 
});

// Rotas de login
app.get('/login', (req, res) => {
    res.render('usuarios/login', {
        layout: './layouts/default/login',
        title: 'Login'
    });
});

app.post('/login', (req, res) => {
    usuarioController.autenticar(req, res);
});

// Rotas de criação de conta
app.get('/criar-conta', (req, res) => {
    res.render('usuarios/criar-conta', {
        layout: './layouts/default/criar-conta',
        title: 'Criar Conta'
    });
});

app.post('/criar-conta', (req, res) => {
    usuarioController.criarConta(req, res);
});

// Rotas para recuperação de senha
app.get('/recuperar-senha', (req, res) => {
    res.render('usuarios/recuperar-senha', {
        layout: './layouts/default/recuperar-senha',
        title: 'Recuperar Senha'
    });
});

app.post('/recuperar-senha', (req, res) => {
    usuarioController.recuperarSenha(req, res);
});

// Rotas para verificação de token
app.get('/verificar-token', (req, res) => {
    res.render('usuarios/verificar-token', {
        layout: './layouts/default/verificar-token',
        title: 'Verificar Token'
    });
});

app.post('/verificar-token', (req, res) => {
    usuarioController.verificarToken(req, res);
});

// Rotas para redefinir a senha
app.get('/redefinir-senha', (req, res) => {
    res.render('usuarios/redefinir-senha', {
        layout: './layouts/default/redefinir-senha',
        title: 'Redefinir Senha'
    });
});

app.post('/redefinir-senha', (req, res) => {
    usuarioController.redefinirSenha(req, res);
});

// Inicializa o servidor
app.listen(port, () => { 
    console.log(`Servidor rodando em http://localhost:${port}`);
});
