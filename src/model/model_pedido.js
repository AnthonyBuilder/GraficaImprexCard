
class model_pedido {
    constructor (pedido_c, pedido_preco, pedido_sinal) {
        this.pedido_c = pedido_c;
        this.pedido_preco = pedido_preco;
        this.pedido_sinal = pedido_sinal;

        this.falta = function(){    
            return pedido_preco - pedido_sinal; //retorna a falta
        };
    }
}

module.exports = model_pedido;