const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rota para a criação de perfil
router.get('/criar-perfil', (req, res) => {
    if (req.session.user) {
        console.log('Usuário logado na sessão ao criar perfil:', req.session.user);
        res.render('usuarios/criar-perfil', {
            layout: './layouts/default/criar-perfil',
            title: 'Criar Perfil',
            usuario: req.session.user
        });
    } else {
        res.redirect('/auth/login'); // Redireciona para login se não houver usuário logado
    }
});

router.post('/criar-perfil', usuarioController.criarPerfil);

module.exports = router;
