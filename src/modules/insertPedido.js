//Insere os dados da tabela Pedido
module.exports.insert = (req, res, con) => {

    var inValPedido = req.body,
        date_e = inValPedido.data_entrega;

    var d = new Date(date_e);

    var dia = d.getDate() + 1,
        mes = d.getMonth() + 1,
        ano = d.getFullYear();

    var dateF = `${dia}/${mes}/${ano}`;

    con.query(`INSERT INTO pedido (quant, nome_pedido, preco, data_entrega, ID_Client) 
                VALUES (${inValPedido.quant}, '${inValPedido.name_pedido}', ${inValPedido.preco}, STR_TO_DATE("${dateF}", "%d/%m/%Y") , ${inValPedido.id_client})`, function (err, result, fields) {

        if (err) throw err;
        res.redirect(`pedido/${inValPedido.id_client}`);
    });
}