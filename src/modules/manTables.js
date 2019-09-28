var createTableClient, createTablePedido, createTableOrcamento;

module.exports.createTableClient = function (con) {

    var sql = `create table if not exists client (
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

module.exports.createTablePedido = function (con) {
    var sql = `create table if not exists pedido (
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

module.exports.createTableOrcamento = function (con) {

    var sql = `create table if not exists orcamento (
                ID_Orcamento int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                preco_total float(20),
                sinal float(20) NOT NULL DEFAULT '0',
                falta float(20) DEFAULT '0',
                ID_Client integer)`;

    con.query(sql, (err, result) => {
        if (err) throw err;
    });
}