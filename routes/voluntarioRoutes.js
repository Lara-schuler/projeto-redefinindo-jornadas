const express = require('express');
const router = express.Router();
const voluntarioController = require('../controllers/voluntarioController');
const upload = require('../middlewares/uploadConfig'); // Importando o Multer configurado


// Rota para a tela de criação de perfil de Voluntário
router.get('/criar-voluntario', (req, res) => {
    if (req.session.user) {
        console.log('Usuário logado:', req.session.user);
        res.render('usuarios/perfis/criar-voluntario', {
            layout: './layouts/default/criar-voluntario',
            title: 'Criar Perfil de Voluntário',
            usuario: req.session.user
        });
    } else {
        console.log('Nenhum usuário logado.');
        res.redirect('/login');
    }
});

router.post('/criar-perfil-voluntario', upload.single('img_perfil'), (req, res) => {
    // `upload.single('img_perfil')` indica que esperamos um arquivo chamado 'img_perfil'
    voluntarioController.criarPerfilVoluntario(req, res);
});

module.exports = router;