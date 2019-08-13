
const expressLayouts = require('express-ejs-layouts')
const express = require('express')
const app = express()
const ejs = require('ejs')

var path = require('path')
var fs = require('fs')
var bp = require('body-parser')
var mysql = require('mysql')

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`run in port: ${port}`));


var urlEncodedBP = bp.urlencoded({ extended: false })

//Config Express 
app.use(bp.json());
app.set('view engine', 'pug')

//Mysql driver
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'produtos_grafica',
    multipleStatements: true
});

con.connect((err) => {
    if (!err)
        console.log('Connection Established Successfully');
    else
        console.log('Connection Failed!' + JSON.stringify(err, undefined, 2));
});

app.use(express.static(__dirname + '/public'));

/** 
 * Rotas
 * 
 * Renderiza a primeira pagina
 * Obtem e trata os dados no mysql
 *  
*/

app.get('/', urlEncodedBP, function (req, res) {
    db_get(res);
    res.sendFile(__dirname + '/public/index.html');
});

app.set('views', path.join(__dirname, 'public/views'));

//__Obtem o model do Mysql para o front @form-pedido
app.get('/pedido/:id', function (req, res) {
    getPedidoClient(req, res);
});


// Cria tabela de clientes 
app.get('/frm-cliente', function (req, res) {
    res.render('client_form/cliente', { js: ['views/client_form/js/script.js'] });
    //createTableClient();
});

app.post('/frm-cliente', urlEncodedBP, function(req, res) {
    formInsertDataInClients(req, res);
});

// Renderiza a view Formulario pedido dando o @GET no servidor 
app.get('/frm-pedido/:id', function (req, res) {

    var nome, id_usr;
    
    //createTablePedido();

    con.query("SELECT nome, ID_Client FROM client WHERE ID_Client = ?", req.params.id, (err, result, fields) => { 
    
        nome = result[0].nome;
        id_usr = result[0].ID_Client;

        if (err || result === null) {
            console.log(err);
        } else {
            res.render('pedido_form/pedido', { 
                user: nome, id: id_usr,
                js: ['views/pedido_form/js/main.js', 'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js']
            });
        }

        console.log(id_usr);
        console.log(nome);
    
    }); 
});

// Injeta os dados e da um post na base de dados usando a função @formInsertDataClientes
app.post('/frm-pedido', urlEncodedBP, function (req, res) {
    formInsertDataInPedidos(req, res);
});

/**
 * 
 * Crud para a tabela clientes 
 * 
 */

function getAllDataInClients(res) {
    con.query('SELECT * FROM produtos', function (err, rows) {
        //res.send(rows);
    });
}

//Insere os dados da tabela cliente
function formInsertDataInClients(req, res) {

    var inC = req.body;

    console.log("Client body", inC);

    con.query(`INSERT INTO client (ID_Client, nome, numero, tipo_num, cpf) VALUES (default, '${inC.name_client}', '${inC.numero_client}', '${inC.tipo_numero}', '${inC.cpf_client}')`, (err, result, fields) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
            res.redirect(`frm-pedido/${result.insertId}`); 
        }
    });
}

function deleteDataInClients(req) {

    var _idClient = req.params.id;

    con.query('DELETE INTO client WHERE id = ?', _idClient, function (err, result, fields) {
        if (err) throw err;
        console.log("Numero de tabelas afetadas: ", result.affectedRows);
    });
}

/** Pedidos dos clientes - CRUD */

//Insere os dados da tabela Pedido
function formInsertDataInPedidos(req, res) {

    var inC = req.body;

    console.log(inC);

    con.query(`INSERT INTO pedido (quant, nome_pedido, preco, data_entrega) VALUES (${inC.quant}, '${inC.name_pedido}', ${inC.preco}, STR_TO_DATE('${inC.data_entrega}', '%Y-%m-%d'))`, function (err, result, fields) {
        if (err) throw err;
        console.log("FIELDS ", fields)
        console.log("Numero de tabelas afetadas: ", result);

        res.redirect(`pedido/${result.insertId}`);
    });
}

//retorna o pedido do respectivo cliente

function getPedidoClient(res, req) {

    con.query('SELECT * FROM pedido WHERE ID_Pedido = ?', req.params.id, function (err, row, fields) {
        if (err) throw err;
        console.log(row);
        res.render('pedido/pedido_view', { pedido: row});
        //++res.send(row);1
    });
}

// Funções de manipulação das tabelas no mysql

function createTableClient() {
    var sql = `CREATE TABLE client (
        ID_Client int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nome varchar(50) NOT NULL,
        numero integer,
        tipo_num varchar(50),
        cpf varchar(255))`;

    con.query(sql, function (err, res) {
        if (err) throw err;
        console.log(res);
    });
}

function createTablePedido() {
    var sql = `CREATE TABLE pedido (
        ID_Pedido int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        quant integer,
        nome_pedido varchar(50),
        preco float(10),
        data_entrega date,
        ID_Client integer
    )`;

    con.query(sql, (err, res) => {
        if (err) throw err;
    });
}