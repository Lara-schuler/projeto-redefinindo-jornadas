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

module.exports = router;