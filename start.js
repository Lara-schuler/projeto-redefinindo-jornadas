const express = require('express'); 
const path = require('path');
require("dotenv").config();
const expressLayouts = require('express-ejs-layouts');


const app = express(); 
const port = 4000; 

//Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: true }));

//Define o template engine
app.use(expressLayouts);
app.set('layout', './layouts/default/index')
app.set('view engine', 'ejs');

app.use((req, res, next) => {
	app.set('layout', './layouts/default/index');
	res.locals.layoutVariables = {
		url : process.env.URL,
		img : "/img/",
		style : "/css/",
		title: 'Redefinindo Jornadas',
	};
	next();
});

//ROTA
app.get('/', (req,res)=>{ 
	res.render('home');	
})

app.listen(port, () => { 
	console.log(`Servidor rodando em http://localhost:${port}`);
});