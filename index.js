import { criarMenu, menuItens } from "/meteo/menu/menuFunction.js";
import { ActualPage } from "/meteo/menu/ActualPage.js";
import { InfoAllByMeteobaseId, InfoTowersAll } from '/meteo/scripts/getDados.js';

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

async function start() {
    await contentBuild("#restoconteudo");
}
start();
async function contentBuild(div) {
    let numberTowers = await InfoTowersAll();
    let tab = "";
    tab += `
             <div class="row">
                <div class="col-lg-12">
                    <div class="card">
                        <div class="card-body">`;
    for (let i = 1; i < numberTowers.data.length; i++) {
        if (numberTowers.data[i].activa == 1) {
            tab += `
            <div class="col mt-2">
                <div class="card">
                    <div class="card-body">
                        <div class="card-title text-center border-bottom ">
                            <h5 class="fw-bold">${numberTowers.data[i].nome}</h5>
                        </div>
                        <div class="mt-3">
                            <div class="row">`;
            let numberVariables = await InfoAllByMeteobaseId(numberTowers.data[i].id);
            for (let j = 0; j < numberVariables.data.length; j++) {
                tab += `
                <div class="col-lg-4 compareIndex">
                        <div class="torre"> ${numberVariables.data[j].nomeVariavel}
                            <span class="LastValue" id="LastValueDivCompare"><br>15</span>
                        </div>
                        <div class="buttonsOpenCompare">
                            <button type="button" onclick="window.open('${numberVariables.data[j].caminho + numberVariables.data[j].ficheiro
                            }.html?torre_Id=${numberVariables.data[j].id_torre + "&variavel_Id=" + numberVariables.data[j].torres_id
                            }','_blank');"  class="btn btn-sm btn-outline-primary rounded openPage">Abrir</button>
                        </div>
                </div>`;
            }
            tab += `</div></div></div></div></div>`;
        }
    }
    tab += `    </div>
            </div>
        </div>
    </div>`;
    $(div).append(tab);
}

