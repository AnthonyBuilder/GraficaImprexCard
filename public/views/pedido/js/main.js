var btnDelete = document.querySelector('#btn-delete');
var stateText = document.querySelector('#mystate');

stateText.value.toLowerCase();

if (stateText.nodeValue === 'pronto' || stateText.nodeValue === 'pronto para entrega') {
    btnDelete.className = 'btn-danger';
}