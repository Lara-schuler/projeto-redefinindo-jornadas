const express = require('express');
const router = express.Router();

// Rota da home (página inicial)
router.get('/', (req, res) => { 
    res.render('home', {
        layout: 'layouts/default/index',
        title: 'Redefinindo Jornadas'
    }); 
});

module.exports = router;
