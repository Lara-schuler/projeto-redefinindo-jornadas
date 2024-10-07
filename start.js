const express = require('express'); 
const path = require('path');
require("dotenv").config();
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');

const usuarioController = require('./controllers/usuarioController');
const psrController = require('./controllers/psrController');

const app = express(); 
const port = 5000; 

// Configuração do Multer para upload de imagens de perfil
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); // Pasta onde as imagens serão armazenadas
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Define um nome único para o arquivo
    }
});

const upload = multer({ storage: storage });


// Configura arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Inicia sessão
app.use(session({
    secret: 'rj2024', // Uma string secreta para assinatura dos cookies
    resave: false, // Não resave a sessão se não houver alterações
    saveUninitialized: false, // Não crie uma sessão até que algo seja armazenado
    cookie: { secure: false } // Defina como true se estiver usando HTTPS
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
    res.locals.messages = {
        error: req.flash('error'),
        success: req.flash('success')
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

app.get('/verificar-token', (req, res) => {
    const { email, token } = req.query;
    res.render('usuarios/verificar-token', {
        layout: './layouts/default/verificar-token',
        title: 'Verificar Token',
        email,
        token
    });
});


app.post('/verificar-token', (req, res) => {
    usuarioController.verificarToken(req, res);
});


// Rotas para redefinir a senha
app.get('/redefinir-senha', (req, res) => {
    const { email, token } = req.query;
    res.render('usuarios/redefinir-senha', {
        layout: './layouts/default/redefinir-senha',
        title: 'Redefinir Senha',
        email,
        token
    });
});

app.post('/redefinir-senha', (req, res) => {
    usuarioController.redefinirSenha(req, res);
});

// Rota para a tela de Apresentação
app.get('/login/apresentacao', (req, res) => {
    res.render('apresentacao', {
        layout: './layouts/default/apresentacao',
        title: 'Apresentação'
    });
});

// Rota para a tela de criação de perfil
app.get('/criar-perfil', (req, res) => {
    if (req.session.user) {
        console.log('Usuário logado:', req.session.user);
        // Renderize a página de criação de perfil com os dados do usuário na sessão
        res.render('usuarios/criar-perfil', {
            layout: './layouts/default/criar-perfil',
            title: 'Criar Perfil',
            usuario: req.session.user // Passe os dados do usuário para a view
        });
    } else {
        console.log('Nenhum usuário logado.');
        res.redirect('/login'); // Redirecione para a página de login se o usuário não estiver logado
    }
});


app.post('/criar-perfil', (req, res) => {
    usuarioController.criarPerfil(req, res);
});

// Rota para a tela de criação de perfil de PSR
app.get('/criar-perfil-psr', (req, res) => {
    if (req.session.user) {
        console.log('Usuário logado:', req.session.user);
        res.render('usuarios/perfis/criar-psr', {
            layout: './layouts/default/criar-psr',
            title: 'Criar Perfil de PSR',
            usuario: req.session.user
        });
    } else {
        console.log('Nenhum usuário logado.');
        res.redirect('/login');
    }
});

app.post('/criar-perfil-psr', upload.single('img_perfil'), (req, res) => {
    // `upload.single('img_perfil')` indica que esperamos um arquivo chamado 'img_perfil'
    psrController.criarPerfilPsr(req, res);
});

// Inicializa o servidor
app.listen(port, () => { 
    console.log(`Servidor rodando em http://localhost:${port}`);
});
