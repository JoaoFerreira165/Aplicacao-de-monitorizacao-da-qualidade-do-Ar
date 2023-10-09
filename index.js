import { criarMenu, menuItens } from "/meteo/menu/menuFunction.js";
import { ActualPage } from "/meteo/menu/ActualPage.js";

var url = window.location.href;
var pagina = url.substring(url.indexOf('index'));
console.log("xx")
document.getElementById("Pagina-Atual").innerHTML = await ActualPage("icon_info.png", "", "Dashboard");
document.getElementById("sidebar-nav").innerHTML = criarMenu(menuItens, "dashboard", pagina);
let startDate = document.getElementById("start-date");
let endDate = document.getElementById("end-date");
//Atualizar dados
$(document).ready(function () {
    $('.ActualData').on('click', function () {
        console.log("x");
        console.log(startDate.value);
        console.log(endDate.value);
    });
});
//Atualizar Pagina
$(document).ready(function () {
    $('.ReloadPage').on('click', function () {
        window.location.reload(true);
    });
});
