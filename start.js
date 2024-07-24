const express = require('express'); 
const path = require('path');
require("dotenv").config();


const app = express(); 
const port = 4000; 

//Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: true }));


app.set('view engine', 'ejs');

//ROTA
app.get('/', (req,res)=>{ 
	res.render('home');	
})

app.listen(port, () => { 
	console.log(`Servidor rodando em http://localhost:${port}`);
});