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

const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
});

console.log(formatter(1000));

function redirPD(id) {
    window.location.href = '/pedido/' + id;
}