const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const upload = require('../middlewares/uploadConfig'); 

// Rota para a tela de criação de evento
router.get('/criar-evento', (req, res) => {
    if (req.session.user) {
        console.log('Usuário logado na sessão ao criar evento:', req.session.user);
        res.render('usuarios/criar-evento', {
            layout: './layouts/default/criar-evento',
            title: 'Criar Evento',
            usuario: req.session.user
        });
    } else {
        console.log('Usuário não autorizado ou não logado.');
        res.redirect('/login');
    }
});

router.post('/criar-evento', upload.single('imagem'), (req, res) => {
    eventoController.criarEvento(req, res);
});

// Rota para exibir um evento específico
router.get('/:id', eventoController.exibirEvento);

module.exports = router;