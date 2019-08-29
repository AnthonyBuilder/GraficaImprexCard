//Atualiza os valores na tabela Pedido
var formUpdatePedido, getPedido, alterStatus;

module.exports.formUpdatePedido = function (res, req, body) {

    var id = {
        pedido: req.id_p,
    };

    console.log(id);

    var sql = `UPDATE pedido SET quant = ${body.quant} WHERE ID_Pedido = ${id.pedido}`;

    return sql;
}

module.exports.getPedido = function (id) {
    var sql = "SELECT * FROM pedido WHERE ID_Pedido = ?";

    con.query(sql, id, (err, res, fields) => {

        if (err) throw err

        return sql;
    });
}

module.exports.alterStatus = function (id, values) {

    sql = `UPDATE pedido SET pd_state = ${values} WHERE ID_Pedido = ${id}`;

    con.query(sql, (err, result) => {
        if (err) throw err;
    });
}