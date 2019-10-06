//Modulos dos pedidos
let updateP = require('./src/modules/updatePedido'),
    in_p = require('./src/modules/insertPedido'),
    inOrc = require('./src/modules/orcamento'),
    mTables = require('./src/modules/manTables'),
    sqlPay = require('./src/modules/spay');

//Sql definitivo
var sql_sum = 'SELECT FORMAT(SUM(quant * preco), 2) total FROM pedido WHERE ID_Client = ?';

const expressLayouts = require('express-ejs-layouts')
const express = require('express')
const app = express()
const ejs = require('ejs')
const numeral = require('numeral')
const moment = require('moment')
const currency = require('currency-formatter')
var id_c;

var path = require('path')
var fs = require('fs')
var bp = require('body-parser')
var mysql = require('mysql')
//var JSAlert = require("js-alert");


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

app.set('views', path.join(__dirname, 'public/views'));

app.get('/', function (req, res) {

    let __clients, __pedidos, stPronto;

    var sql_p = 'SELECT * FROM pedido WHERE ID_Client = ?',
        sql_p_stp = 'SELECT * FROM pedido';

    con.query(sql_p_stp, (err, result_stp, fields) => {

        if (err) throw err;

        let pd = JSON.parse(JSON.stringify(result_stp));


        if (pd !== null || pd !== '') {

            res.render('page_init/index', {
                js: ['views/page_init/js/main.js'],
                pedidos: pd,
            });

        } else {
            //JSAlert.alert("Não existe nenhum dado");
        }
    });
});



/**
 * Obtem todos os pedidos do respectivo cliente
 * Trata a quantidade e seu valor apresentando o resultado
 * Define o sinal calculando a falta de seu respectivo valor
 * Define seu status sinalizando o seu processo para entrega ao cliente
 */

var sql_c = 'SELECT * FROM client WHERE ID_Client = ?',
    sql_p = 'SELECT * FROM pedido WHERE ID_Client = ?',
    sql_falta = 'SELECT FORMAT(falta, 2) f, FORMAT(sinal, 2) s FROM orcamento WHERE ID_Client = ? LIMIT 1',
    totalPedidos, id_p, result_c, valFalta, valSinal, rSinFal;

var number = numeral(valFalta);
//Obtem o model do Mysql para o front @form-pedido
app.get('/pedido/:id', function (req, res) {

    var id_cli = req.params.id;
    id_c = id_cli;

    con.query(sql_c, id_cli, (err, result_c, fields) => {

        if (err) throw err;

        con.query(sql_p, id_cli, (err, result_p, fields) => {

            if (err || result_p === null) throw err;

            var date = moment(result_p[0].data_entrega).format('L');

            console.log(date);

            //Cria a tabela orcamento se ela não existir, ao acessar o pedido
            mTables.createTableOrcamento(con);

            var result_cli = JSON.parse(JSON.stringify(result_c));

            con.query(sql_sum, id_cli, (err, total) => {

                if (err) throw err;

                var rTotal = JSON.parse(JSON.stringify(total));
                totalPedidos = rTotal[0].total;
                id_p = result_p.ID_Pedido;


                rPentrega = result_p[0].data_entrega;
                dateF = new Date(rPentrega);

                //define o valor em falta
                con.query(sql_falta, id_cli, (err, sinFal) => {

                    if (err) throw err;

                    var r = JSON.parse(JSON.stringify(sinFal));

                    var numRows = sinFal.length,
                        string = number.format('0,0');

                    if (numRows <= 0 && numRows === 0) throw inOrc.insert(id_cli, 0, 0, 0, res, con);

                    valFalta = r[0].f;
                    valSinal = r[0].s;

                    faltaTotal = totalPedidos - valSinal;
                    inOrc.up(id_cli, valFalta, valSinal, faltaTotal, res, con);


                    var f_currency = currency.format(valFalta, {
                        code: 'BRL'
                    });

                    var s_currency = currency.format(valSinal, {
                        code: 'BRL'
                    });

                    var t_currency = currency.format(totalPedidos, {
                        code: 'BRL'
                    })

                    res.render('pedido/pedido_view', {
                        js: ['views/pedido/js/main.js'],
                        pedidos: result_p,
                        client: result_cli[0],
                        tP: totalPedidos,
                        totalP: t_currency,
                        id_c: id_cli,
                        falta: f_currency,
                        sinal: s_currency,
                        data_e: date,
                    });
                });
            });
        });
        //++res.send(row);1
    });
});

//Define o status do pedido
app.post("/set-s/:id_p/:id_c", urlEncodedBP, (req, res) => {
    var sql = `UPDATE pedido SET pd_state = '${req.body.setState}' WHERE ID_Pedido = ${req.params.id_p}`;
    con.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect('/pedido/' + req.params.id_c);
    });
});

//Insere ou atualiza o orçamento
app.post('/sinal/:id', urlEncodedBP, (req, res) => {

    let sinalVals = req.body;

    con.query(`SELECT * FROM orcamento WHERE ID_Client = ${req.params.id} LIMIT 1`, (err, result, fields) => {

        if (err) throw err;

        var numRows = result.length,
            falta = sinalVals.total_p_sinal - sinalVals.in_sinal;

        if (numRows <= 0 && numRows === 0) {
            inOrc.insert(req.params.id, sinalVals.total_p_sinal, sinalVals.in_sinal, falta, res, con);
            console.log('Orcamento inserido');
        } else {
            inOrc.up(req.params.id, sinalVals.total_p_sinal, sinalVals.in_sinal, falta, res, con);
            console.log('Orcamento atualizado');
        }
    });
});

app.post('/frm-pagamento/:id', urlEncodedBP, (req, res) => con.query(sqlPay.spayUp(req, res, con, id_c), req.params.id, (err, result) => {
    if (err) throw err;
    console.log('Pay ', result);
}));


/** 
 * Clientes 
 */

app.get('/frm-cliente', function (req, res) {

    //Cria a tabela cliente

    mTables.createTableClient(con);

    res.render('forms/client_form/cliente', {
        js: ['views/client_form/js/script.js']
    });
});

app.post('/frm-cliente', urlEncodedBP, function (req, res) {
    formInsertDataInClients(req, res);
});

app.get('/clientes', (req, res) => {

    var sql = 'SELECT * FROM client ORDER BY ID_Client DESC';

    con.query(sql, (err, result, fields) => {
        res.render('clientes/index', {
            allClients: result,
            js: ['views/clientes/js/main.js']
        });
        //console.log('Clients', result);
    });
});


// Renderiza a view Formulario pedido dando o @GET no servidor 

app.get('/frm-pedido/:id', function (req, res) {

    var nome, id_usr = req.params.id;

    mTables.createTablePedido(con);

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

// Injeta os dados e da um post na base de dados usando o  insertPedido
app.post('/frm-pedido', urlEncodedBP, function (req, res) {
    //module @insertPedido
    in_p.insert(req, res, con);
});



app.get('/frm-edit-pedido/:id_p/:id_c', (req, res) => {

    var sql = `SELECT * FROM pedido WHERE ID_Pedido = ${req.params.id_p}`;

    con.query(sql, (err, result) => {
        if (err) throw err;

        let r = JSON.parse(JSON.stringify(result));

        res.render('forms/pedido_form_update/index', {
            id_pedido: req.params.id_p,
            id_client: req.params.id_c,
            pedido: r[0]
        });

        console.log(r);
    });
});

app.post('/frm-edit-pedido/:id_p/:id_c', urlEncodedBP, (req, res) => {

    var mReq = req.params,
        mBody = req.body,
        up = updateP.formUpdatePedido(res, mReq, mBody);


    con.query(up, (err, result, fields) => {

        if (err || result === null) throw err
        console.log('Valores atualizados:  \n', result);

        if (result.affectedRows >= 1) {
            res.redirect('/pedido/' + mReq.id_c);
        }
    });
});

app.post('/delete/:id_p/:id_c', urlEncodedBP, (req, res) => {
    deletePedido(req.params.id_p, res, req.params.id_c);
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

    con.query(`INSERT INTO client (ID_Client, nome, numero, tipo_num, cpf) VALUES (default, '${inC.name_client}', '${inC.num_c}', '${inC.tipo_numero}', '${inC.cpf_client}')`, (err, result, fields) => {
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

function deletePedido(id_p, res, id_c) {
    con.query(`DELETE FROM pedido WHERE ID_Pedido = ${id_p}`, (err, result) => {
        if (err) throw err;
        res.redirect('/pedido/' + id_c)
    });
}