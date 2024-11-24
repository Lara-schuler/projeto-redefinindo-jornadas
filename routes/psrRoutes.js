const express = require('express');
const router = express.Router();
const psrController = require('../controllers/psrController');
const upload = require('../middlewares/uploadConfig'); // Importando o Multer configurado


// Rota para a tela de criação de perfil de PSR
router.get('/criar-psr', (req, res) => {
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

router.post('/criar-perfil-psr', upload.single('img_perfil'), (req, res) => {
    // `upload.single('img_perfil')` indica que esperamos um arquivo chamado 'img_perfil'
    psrController.criarPerfilPsr(req, res);
});

// Nova rota para o feed de PSR
router.get('/psr/feed-psr', (req, res) => {
    if (req.session.user) {
        console.log('Usuário logado:', req.session.user);
        // Verifica se o usuário tem perfil de PSR, e renderiza a página de feed
        if (req.session.user.tipo_perfil === 'psr') {
            res.render('feed/psr', {
                layout: './layouts/default', // Certifique-se de que o layout existe
                title: 'Feed PSR',
                usuario: req.session.user
            });
        } else {
            console.log('Usuário não é do tipo PSR');
            res.redirect('/auth/apresentacao');  // Caso não seja PSR, redireciona
        }
    } else {
        console.log('Nenhum usuário logado.');
        res.redirect('/auth/login');
    }
});


module.exports = router;