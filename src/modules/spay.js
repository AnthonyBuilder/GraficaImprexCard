var spayUp, spayInsert;

module.exports.spayUp = function (req, res, con, idClient) {
    var sql = 'UPDATE orcamento SET frm_pay = ? WHERE ID_Client = ?';

    con.query(sql, [req.body, idClient], (err, result) => {
        if (err) throw err;
    });
}