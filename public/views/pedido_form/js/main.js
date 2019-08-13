
/**
 * 
 *  Script formulario pedido
 *  
 *  Inserindo dados na tabela e tratando esses dados
 * 
 */

var txtFalta = document.querySelector('.txt-falta');
let rowTable = document.querySelector('.row-tb');
var total = 0;

const reducer = (accumulator, currentValue) => accumulator + currentValue;

var temp, cp = {
    "pedidos": []
}, pedido_c;

var totalTxt;

function insertTable(in_quant, in_pedido, in_preco) {
   
    rowTable = document.querySelector('.row-tb');
    totalTxt = document.querySelector('.total-txt');

    var newRow = rowTable.insertRow(0);

    var cell0 = newRow.insertCell(0);
    var cell1 = newRow.insertCell(1);
    var cell2 = newRow.insertCell(2);

    cell0.innerHTML = in_quant;
    cell1.innerHTML = in_pedido;
    cell2.innerHTML = in_preco;
    
    for (var i = 0, row; row = rowTable.rows[i]; i++) {

        temp = new Object();
        temp["quant"] = row.cells[0].innerHTML;
        temp["pedido"] = row.cells[1].innerHTML;
        temp["preco"] = row.cells[2].innerHTML;

        cp.pedidos.push(temp);
        //console.log("ROW: ", row);
    }

    console.log("pedido_c", JSON.stringify(cp.pedidos));
}

function selectedRowToInput() {
    rowTable = document.querySelector('.row-tb');

    let inquant = document.querySelector('#inquant'),
        inpedido = document.querySelector('#inpedido'),
        inpreco = document.querySelector('#inpreco');

    for (var i = 0; i < rowTable.rows.length; i++) {
        rowTable.rows[i].onclick = function () {
            // Obtem os valores do item selecionado
            var rIndex = this.rowIndex;

            inquant.value = this.cells[0].innerHTML;
            inpedido.value = this.cells[1].innerHTML;
            inpreco.value = this.cells[2].innerHTML;

            inquant.style.animation = "flash 400ms";
            inpedido.style.animation = "flash 400ms";
            inpreco.style.animation = "flash 400ms";

            
            console.log(cp.pedidos);
            
            rowTable.deleteRow(rIndex - 1);

            console.log(rIndex);
        };
    }
}


function formatReal(int) {
    var tmp = int+'';

    if( tmp.length > 3 ){
        tmp = tmp.replace(/([0-9]{2})$/g, ",$1");
        tmp = tmp.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");
    }
    
    return tmp;
}

function mCPF(cpf){
    cpf=cpf.replace(/\D/g,"")
    cpf=cpf.replace(/(\d{3})(\d)/,"$1.$2")
    cpf=cpf.replace(/(\d{3})(\d)/,"$1.$2")
    cpf=cpf.replace(/(\d{3})(\d{1,2})$/,"$1-$2")
    return cpf
}


class pedido {
    constructor(quant, pedido, preco) {
        this.quant = quant;
        this.pedido = pedido;
        this.preco = preco;
    }
}

