const express = require('express');
const router = express.Router();
const voluntarioController = require('../controllers/voluntarioController');
const empresaController = require('../controllers/empresaController');
const upload = require('../middlewares/uploadConfig'); // Importando o Multer configurado

// Nova rota para o feed dos parceiros
router.get('/feed/parceiro', (req, res) => {
    if (req.session.user) {
        console.log('Usuário logado:', req.session.user);
        // Verifica se o usuário tem perfil de voluntário ou de empresa, e renderiza a página de feed
        if (req.session.user.tipo_perfil === 'voluntario' || req.session.user.tipo_perfil === 'empresa') {
            res.render('feed/parceiro', {
                layout: './layouts/default', 
                title: 'Feed parceiro',
                usuario: req.session.user
            });
        } else {
            console.log('Usuário não é do tipo voluntário nem empresa');
            res.redirect('/auth/apresentacao');  
        }
    } else {
        console.log('Nenhum usuário logado.');
        res.redirect('/auth/login');
    }
});


module.exports = router;