function searchClient() {
    // Declare variables
    var input, filter, row, container, a, i, txtValue;
    input = document.querySelector('.mIn');
    filter = input.value.toUpperCase();
    row = document.querySelector('.mRow');
    container = document.querySelector('.mCard');

    for (i = 0; i < row.length; i++) {
        a = container[i].querySelector(".card-header")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            container[i].style.display = "";
        } else {
            container[i].style.display = "none";
        }
    }
}