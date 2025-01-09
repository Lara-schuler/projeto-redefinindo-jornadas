const express = require('express');

const router = express.Router();
const servicoController = require('../controllers/servicoController');
const upload = require('../middlewares/uploadConfig');

// Rota para a tela de criação de serviço
router.get('/criar-servico', (req, res) => {
  if (req.session.user) {
    console.log('Usuário logado na sessão ao criar serviço:', req.session.user);
    res.render('usuarios/criar-servico', {
      layout: './layouts/default/criar-servico',
      title: 'Criar Serviço',
      usuario: req.session.user,
    });
  } else {
    console.log('Usuário não autorizado ou não logado.');
    res.redirect('/login');
  }
});

// Rota para criar ou atualizar um serviço
router.post('/criar-servico', upload.single('imagem'), (req, res) => {
  servicoController.criarServico(req, res);
});

// Rota para exibir um serviço específico
router.get('/:id', servicoController.exibirServico);

module.exports = router;
