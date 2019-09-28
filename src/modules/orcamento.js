module.exports.insert = (id_c, preco_total, sinal, falta = 0, res, con) => {

    var sql = `INSERT INTO orcamento (preco_total, sinal, falta, ID_Client) VALUES (${preco_total}, ${sinal}, ${falta}, ${id_c})`;

    con.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect('/pedido/' + id_c)
        console.log('RESULTADO ORÇAMENTO - frm_pedido', result);
    });

}

module.exports.up = (id_c, preco_total, sinal, falta, res, con) => {

    var sql = `UPDATE orcamento SET preco_total = ${preco_total}, sinal = ${sinal}, falta = ${falta} WHERE ID_Client = ${id_c}`;

    con.query(sql, (err, result) => {
        if (err) throw err;
        console.log('update', result)
        res.redirect('/pedido/' + id_c);
    });
}

module.exports.insertTotal = (id_c, preco_total, con) => {
    var sql = `INSERT INTO orcamento (preco_total) VALUES ${preco_total} WHERE ID_Client = ?`
}