const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { render } = require('ejs');
const MongoClient = require("mongodb").MongoClient;

// Conexão com o banco
const uri = `mongodb+srv://jgcfabris12:12092006@joao.5bzjezq.mongodb.net/?retryWrites=true&w=majority&appName=Joao`;
const client = new MongoClient(uri);
var dbo = client.db("lab10");
var usuarios = dbo.collection("usuarios_carros");
var carros = dbo.collection("carros");

var app = express();
app.use(express.static('.public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.redirect('cadastro_usuarios.html');
});

// Inicia o servidor
app.listen(80, () => {
    console.log("servidor rodando");
});

// Cadastrar usuários
app.post('/cadastrar_usuario', function(req, resp) {
    let data = {
        db_nome: req.body.nome,
        db_login: req.body.login,
        db_senha: req.body.senha 
    };

    usuarios.insertOne(data, function(err) {
        if (err) {
            resp.render('resposta_usuario.ejs', { resposta: "Erro ao cadastrar usuário!" });
        } else {
            resp.redirect('/login.html'); 
        }
    });
});

// Logar usuários
app.post('/logar_usuario', function(req, resp) {
    let data = { db_login: req.body.login, db_senha: req.body.senha };

    usuarios.find(data).toArray(function(err, items) {
        if (err) {
            resp.render('resposta_usuario.ejs', { resposta: "Erro ao logar usuário" });
        } else if (items.length == 0) {
            resp.render('resposta_usuario.ejs', { resposta: "Usuário/senha não encontrados" });
        } else {
            // listar carros
            carros.find().toArray(function(err, items) {
                if (err) {
                    resp.render('resposta_usuario.ejs', { resposta: "Erro ao carregar carros" });
                } else {
                    resp.render("lista_carros.ejs", { carros: items });
                }
            });
        }
    });
});

// Cadastrar carro 
app.post('/cadastrar_carro', function(req, resp) {
    let data = {
        db_marca: req.body.marca,
        db_modelo: req.body.modelo,
        db_ano: req.body.ano
    };

    carros.insertOne(data, function(err) {
        if (err) {
            resp.render('resposta_usuario.ejs', { resposta: "Erro ao cadastrar carro" });
        } else {
            resp.render('resposta_usuario.ejs', { resposta: "Carro cadastrado com sucesso" });
        }
    });
});


// Gerenciar carros 
app.post("/gerenciar_carros", function(req, resp) {
    const acao = req.body.acao;

    const filtro = {
        db_marca: req.body.marca,
        db_modelo: req.body.modelo,
        db_ano: req.body.ano
    };

    if (acao === "atualizar") {
        const novosDados = {
            $set: {
                db_marca: req.body.novamarca,
                db_modelo: req.body.novomodelo,
                db_ano: req.body.novoano
            }
        };

        carros.updateOne(filtro, novosDados, function(err, result) {
            if (err) {
                resp.render('resposta_usuario.ejs', { resposta: "Erro ao atualizar carro!" });
            } else if (result.modifiedCount === 0) {
                resp.render('resposta_usuario.ejs', { resposta: "Carro não encontrado ou dados iguais!" });
            } else {
                resp.render('resposta_usuario.ejs', { resposta: "Carro atualizado com sucesso!" });
            }
        });

    } else if (acao === "remover") {
        carros.deleteOne(filtro, function(err, result) {
            if (err) {
                resp.render('resposta_usuario.ejs', { resposta: "Erro ao remover carro!" });
            } else if (result.deletedCount === 0) {
                resp.render('resposta_usuario.ejs', { resposta: "Esgotado" });
            } else {
                resp.render('resposta_usuario.ejs', { resposta: "Carro removido com sucesso!" });
            }
        });
    }
});
