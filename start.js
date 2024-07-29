const express = require('express'); 
const path = require('path');
require("dotenv").config();
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');

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

// Middleware para definir variáveis locais
app.use((req, res, next) => {
    res.locals.layoutVariables = {
        url: process.env.URL,
        img: "/img/",
        style: "/css/",
        title: 'Redefinindo Jornadas',
    };
    next();
});

// Rotas
app.get('/', (req, res) => { 
    res.render('home', {
        layout: './layouts/default/index',
        title: 'Redefinindo Jornadas'
    }); 
});

app.get('/login', (req, res) => {
    res.render('usuarios/login', {
        layout: './layouts/default/login',
        title: 'Login'
    });
});

app.post('/login', (req, res) => {
    usuarioController.autenticar(req, res);
});

// Inicializa o servidor
app.listen(port, () => { 
    console.log(`Servidor rodando em http://localhost:${port}`);
});
