const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');
const upload = require('../middlewares/uploadConfig'); // Importando o Multer configurado


// Rota para a tela de criação de perfil de Empresa
router.get('/criar-empresa', (req, res) => {
    if (req.session.user) {
        console.log('Usuário logado:', req.session.user);
        res.render('usuarios/perfis/criar-empresa', {
            layout: './layouts/default/criar-empresa',
            title: 'Criar Perfil de Empresa',
            usuario: req.session.user
        });
    } else {
        console.log('Nenhum usuário logado.');
        res.redirect('/login');
    }
});

router.post('/criar-perfil-empresa', upload.single('img_perfil'), (req, res) => {
    // `upload.single('img_perfil')` indica que esperamos um arquivo chamado 'img_perfil'
    empresaController.criarPerfilEmpresa(req, res);
});

module.exports = router;