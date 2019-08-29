function redir(param) {
    window.location.href = '/' + param;
}

function redirPedido() {
    var txt;
    var person = prompt("Criar pedido usando o ID do cliente", "ID");
    if (person == null || person == "") {
        txt = "?";
    } else {
        txt = person;
    }
    redir('frm-pedido/' + person);
}