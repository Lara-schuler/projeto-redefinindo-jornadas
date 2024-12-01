const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rota de login
router.get('/login', (req, res) => {
    res.render('usuarios/login', {
        layout: 'layouts/default/login',
        title: 'Login'
    });
});

router.post('/login', (req, res) => {
    usuarioController.login(req, res); // Certifique-se de que está chamando a função login
});

// Rotas de criação de conta
router.get('/criar-conta', (req, res) => {
    res.render('usuarios/criar-conta', {
        layout: 'layouts/default/criar-conta',
        title: 'Criar Conta'
    });
});

router.post('/criar-conta', (req, res) => {
    usuarioController.criarConta(req, res);
});

// Rotas para recuperação de senha
router.get('/recuperar-senha', (req, res) => {
    res.render('usuarios/recuperar-senha', {
        layout: 'layouts/default/recuperar-senha',
        title: 'Recuperar Senha'
    });
});

router.post('/recuperar-senha', (req, res) => {
    usuarioController.recuperarSenha(req, res);
});

router.get('/verificar-token', (req, res) => {
    const { email, token } = req.query;
    res.render('usuarios/verificar-token', {
        layout: 'layouts/default/verificar-token',
        title: 'Verificar Token',
        email,
        token
    });
});


router.post('/verificar-token', (req, res) => {
    usuarioController.verificarToken(req, res);
});


// Rotas para redefinir a senha
router.get('/redefinir-senha', (req, res) => {
    const { email, token } = req.query;
    res.render('usuarios/redefinir-senha', {
        layout: 'layouts/default/redefinir-senha',
        title: 'Redefinir Senha',
        email,
        token
    });
});

router.post('/redefinir-senha', (req, res) => {
    usuarioController.redefinirSenha(req, res);
});

// Rota para a tela de Apresentação
router.get('/apresentacao', usuarioController.exibirApresentacao);


module.exports = router