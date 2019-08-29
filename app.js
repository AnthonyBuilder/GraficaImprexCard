//Modules
var updateP = require('./src/modules/updatePedido');


const expressLayouts = require('express-ejs-layouts')
const express = require('express')
const app = express()
const ejs = require('ejs')

var path = require('path')
var fs = require('fs')
var bp = require('body-parser')
var mysql = require('mysql')

const port = process.env.PORT || 8888;
app.listen(port, () => console.log(`run in port: ${port}`));


var urlEncodedBP = bp.urlencoded({
    extended: false
})

//Config Express 
app.use(bp.json());
app.set('view engine', 'pug')

//Mysql driver
var con = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'root',
    database: 'grafica',
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

    let __clients, __pedidos;
    var sql_c = 'SELECT * FROM client WHERE ID_Client = ? ORDER BY ',
        sql_p = 'SELECT * FROM pedido WHERE ID_Client = ? ORDER BY ';



    res.render('page_init/index', {
        js: ['views/page_init/js/main.js']
    });
});

app.set('views', path.join(__dirname, 'public/views'));

let totalPedidos, id_p;

//Obtem o model do Mysql para o front @form-pedido
app.get('/pedido/:id', function (req, res) {

    var id_cli = req.params.id,
        sql_c = 'SELECT * FROM client WHERE ID_Client = ?',
        sql_p = 'SELECT * FROM pedido WHERE ID_Client = ?',
        sql_sum = 'SELECT FORMAT(SUM(quant * preco), 2) total FROM pedido WHERE ID_Client = ?',
        sql_falta = 'SELECT FORMAT(SUM(preco_total - sinal), 2) falta FROM orcamento WHERE ID_Client = ?',
        result_c,
        date;

    con.query(sql_c, id_cli, function (err, result_c, fields) {

        if (err) throw err;

        con.query(sql_p, id_cli, (err, result_p, fields) => {

            if (err || result_p === null) throw err;

            result_cli = JSON.parse(JSON.stringify(result_c));

            con.query(sql_sum, id_cli, (err, total) => {

                if (err) throw err;

                var r = JSON.parse(JSON.stringify(total));
                date = result_p.data_entrega;
                totalPedidos = r[0].total;
                id_p = result_p.ID_Pedido;

                console.log('id_p', id_cli);

                //define o valor em falta
                con.query(sql_falta, id_cli, (err, result) => {

                    let val_falta = result;
                    console.log(val_falta)
                    res.render('pedido/pedido_view', {
                        js: ['view/pedido/js/main.js'],
                        pedidos: result_p,
                        client: result_cli[0],
                        totalP: totalPedidos,
                        id_c: id_cli,
                        falta: val_falta
                    });
                });
            });
        });
        //++res.send(row);1
    });
});


app.post("/set-s/:id_p/:id_c", urlEncodedBP, (req, res) => {
    var sql = `UPDATE pedido SET pd_state = '${req.body.setState}' WHERE ID_Pedido = ${req.params.id_p}`;
    con.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect('/pedido/' + req.params.id_c)
    });
});

app.post('/sinal/:id', urlEncodedBP, (req, res) => {
    updateOrcamento(req.params.id, req.body.total_p_sinal, req.body.in_sinal, res);
});

/** 
 * Clientes 
 */

app.get('/frm-cliente', function (req, res) {
    res.render('forms/client_form/cliente', {
        js: ['views/client_form/js/script.js']
    });
    //--createTableClient();
});

app.post('/frm-cliente', urlEncodedBP, function (req, res) {
    formInsertDataInClients(req, res);
});

app.get('/clientes', (req, res) => {

    var sql = 'SELECT * FROM client';

    con.query(sql, (err, result, fields) => {
        res.render('clientes/index', {
            allClients: result,
            js: ['views/clientes/js/main.js', 'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js']
        });

        console.log('Clients', result);
    });
});

// Renderiza a view Formulario pedido dando o @GET no servidor 

app.get('/frm-pedido/:id', function (req, res) {

    var nome, id_usr = req.params.id;

    //--createTablePedido();

    con.query("SELECT nome, ID_Client FROM client WHERE ID_Client = ?", id_usr, (err, result, fields) => {

        nome = result[0].nome;
        id_usr = result[0].ID_Client;

        if (err || result === null) {
            console.log(err);
        } else {
            res.render('forms/pedido_form/pedido', {
                user: nome,
                id: id_usr,
                js: ['views/pedido_form/js/main.js', 'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js']
            });
        }
    });
});

// Injeta os dados e da um post na base de dados usando a função @formInsertDataClientes
app.post('/frm-pedido', urlEncodedBP, function (req, res) {
    formInsertDataInPedidos(req, res);
});


app.get('/frm-edit-pedido/:id_p/:id_c', (req, res) => {

    var sql = `SELECT * FROM pedido WHERE ID_Pedido = ${req.params.id_p}`;

    con.query(sql, (err, result) => {
        if (err || result === null) {
            throw err;
        } else {
            res.render('forms/pedido_form_update/index', {
                id_pedido: req.params.id_p,
                id_client: req.params.id_c,
                pedido: result
            });
        }
    });
});

app.post('/frm-edit-pedido/:id_p/:id_c', urlEncodedBP, (req, res) => {

    var mReq = req.params,
        mBody = req.body,
        up;

    up = updateP.formUpdatePedido(res, mReq, mBody);


    con.query(up, (err, result, fields) => {

        if (err || result === null) throw err
        console.log('Valores atualizados:  \n', result);

        if (result.affectedRows >= 1) {
            res.redirect('/pedido/' + mReq.id_c);
        }
    });
});

/**
 * 
 * Crud para a tabela clientes 
 * 
 */


//Insere os dados da tabela cliente
function formInsertDataInClients(req, res) {

    var inC = req.body;

    console.log("Client body", inC);

    con.query(`INSERT INTO client (ID_Client, nome, numero, tipo_num, cpf) VALUES (default, '${inC.name_client}', ${inC.numero_client}, '${inC.tipo_numero}', '${inC.cpf_client}')`, (err, result, fields) => {
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

    var inC = req.body,
        date_e = inC.data_entrega;

    var d = new Date(date_e);

    var dia = d.getDate() + 1,
        mes = d.getMonth() + 1,
        ano = d.getFullYear();

    var dateF = `${dia}/${mes}/${ano}`;

    con.query(`INSERT INTO pedido (quant, nome_pedido, preco, data_entrega, ID_Client) 
                VALUES (${inC.quant}, '${inC.name_pedido}', ${inC.preco}, STR_TO_DATE("${dateF}", "%d/%m/%Y") , ${inC.id_client})`, function (err, result, fields) {

        if (err) throw err;
        console.log(dateF);
        res.redirect(`pedido/${inC.id_client}`);
    });
}


// Funções de manipulação das tabelas no mysql

function createTableClient() {
    var sql = `CREATE TABLE client (
                ID_Client int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                nome varchar(50) NOT NULL,
                numero integer,
                tipo_num varchar(50),
                cpf varchar(255),
                ID_Pedido integer)`;

    con.query(sql, function (err, res) {
        if (err) throw err;
        console.log(res);
    });
}

//Cria a tabela de pedidos no banco

function createTablePedido() {
    var sql = `CREATE TABLE pedido (
                ID_Pedido int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                quant integer,
                nome_pedido varchar(50),
                preco float(10),
                data_entrega date,
                pd_state varchar(100),
                ID_Client integer)`;

    con.query(sql, (err, res) => {
        if (err) throw err;
    });
}

//Cria a tabela orcamento

function createTableOrcamento() {

    var sql = `CREATE TABLE orcamento (
                ID_Orcamento int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                preco_total float(20),
                sinal float(20),
                falta float(20),
                ID_Client integer   
            )`;

    con.query(sql, (err, result) => {
        if (err) throw err;
    });
}


function insereOrcamento(id_c, preco_total, sinal, res) {

    var sql = `INSERT INTO orcamento (preco_total, sinal, ID_Client) VALUES (${preco_total}, ${sinal}, ${id_c})`;

    con.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect('/pedido/' + id_c)
        console.log(result);
    });
}

function updateOrcamento(id_c, preco_total, sinal, res) {

    var sql = `UPDATE orcamento SET preco_total = ${preco_total}, sinal = ${sinal} WHERE ID_Client = ${id_c}`;

    con.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect('/pedido/' + id_c)
        console.log(result);
    });
}

function calcTotalPedido(id_c) {
    return totalPedidos;
}