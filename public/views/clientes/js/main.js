function searchClient() {

    var input, filter, container, a, i, txtValue, row;

    row = document.querySelector('.row').childNodes;
    input = document.querySelector('.mIn');
    filter = input.value.toUpperCase();

    container = document.querySelectorAll('.mCon');

    //arrRow.push(row.lastChild);

    //console.log(arrRow.length);

    for (i = 0; i < row.length; i++) {

        a = container[i].querySelector(".mNameCard");
        txtValue = a.textContent || a.innerText;

        if (txtValue.indexOf(filter) > -1) {
            container[i].style.display = "block";
        } else {
            container[i].style.display = "none";
        }
    }
}