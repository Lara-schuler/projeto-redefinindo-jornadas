const express = require('express');
const router = express.Router();
const ongController = require('../controllers/ongController');
const upload = require('../middlewares/uploadConfig'); // Importando o Multer configurado

// Rota para a tela de criação de perfil de Ong
router.get('/criar-ong', (req, res) => {
    if (req.session.user) {
        console.log('Usuário logado:', req.session.user);
        res.render('usuarios/perfis/criar-ong', {
            layout: './layouts/default/criar-ong',
            title: 'Criar Perfil de ONG',
            usuario: req.session.user
        });
    } else {
        console.log('Nenhum usuário logado.');
        res.redirect('/login');
    }
});

router.post('/criar-perfil-ong', upload.single('img_perfil'), (req, res) => {
    ongController.criarPerfilOng(req, res);
});

// Nova rota para o feed de ONG
router.get('/feed-ong', (req, res) => {
    if (req.session.user) {
        console.log('Usuário logado:', req.session.user);
        // Verifica se o usuário tem perfil de ONG, e renderiza a página de feed
        if (req.session.user.tipo_perfil === 'ong') {
            ongController.exibirFeedOng(req, res);
        } else {
            console.log('Usuário não é do tipo ONG');
            res.redirect('/auth/apresentacao');  
        }
    } else {
        console.log('Nenhum usuário logado.');
        res.redirect('/auth/login');
    }
});

module.exports = router;