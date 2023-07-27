import { criarMenu, menuItens } from '/meteo/menu/menuFunction.js';
import { ActualPage } from '/meteo/menu/ActualPage.js';
import { dataIntervalDias, dataIntervalMinutos, InfoAllByMeteobaseIdAndTorresId,  InfoReadVariaveisByName } from '/meteo/scripts/getDados.js';
import { checkData, checkConteudo, DirecaoVentoPorIntervalo, graficosWind, createTable, DataMediaHours, addData, createTableShowData, createCompareDiv, creatBodyModal, chartjs, ResetZoom, setDateInputs, creatBodyModalMostrarMaisDados, distime, checkDados, refreshOtherTowers, addGraph, refreshOtherTowersByDate, exportToCSV, convertHTMLtoPDF2 } from '/meteo/scripts/function.js';

var url = window.location.href;
var x = new URL(url)
const params = new URLSearchParams(x.search);

const torreId = params.get("torre_Id");
const variavelId = params.get("variavel_Id");
console.log("Torre:", torreId);
console.log("Variável:", variavelId);
let infos1torreVar = await InfoAllByMeteobaseIdAndTorresId(torreId, variavelId);
if (infos1torreVar.data.length == 0) {
    window.location.href = "/meteo/errorPage/error_page.html";
}
var pathname = x.pathname;
var filename = pathname.split('/').pop();
if (filename == infos1torreVar.data[0].ficheiro + ".html") {
    console.log("igual");
}
else {
    filename = infos1torreVar.data[0].ficheiro + ".html"; // Define o novo nome do arquivo
    var newURL = `/meteo/geral/${filename}?torre_Id=${torreId}&variavel_Id=${variavelId}`;
    window.location.href = newURL; // Redireciona para a nova 
}
let infosVariaveisByName = await InfoReadVariaveisByName(infos1torreVar.data[0].nomeVariavel2, infos1torreVar.data[0].id_variavel);
var nomeTorre = infos1torreVar.data[0].nome;
var variavel = infos1torreVar.data[0].nomeVariavel;
var IconVariavel = infos1torreVar.data[0].icon;
var nomeTorreBaseDados = infos1torreVar.data[0].torreAssoc;
let nomeVariavelBaseDados = infos1torreVar.data[0].NomeBaseDados;
var nomeTorreAtual = infos1torreVar.data[0].nomeTorre;
let grandeza = infos1torreVar.data[0].grandeza;
let intervalo = 60;
let minutos = 60;
let comIntervalo = false;
let tempoMinutos = false;
document.querySelectorAll('.dropdown-itemFiltro').forEach(function (item) {
    item.addEventListener('click', function () {
        document.querySelectorAll('.dropdown-itemFiltro').forEach(function (item) {
            item.classList.remove('active');
        });
        this.classList.add('active');
    });
});
let valueRefresh = 15000;
document.querySelectorAll('.dropdown-itemRefresh').forEach(function (item) {
    item.addEventListener('click', async function () {
        document.querySelectorAll('.dropdown-itemRefresh').forEach(function (item) {
            item.classList.remove('active');
        });
        this.classList.add('active');
        valueRefresh = parseInt(this.getAttribute('value'));
        console.log(valueRefresh);
        if (valueRefresh === NaN) {
            clearInterval(intervaloAtuali);
        }
        else {
            clearInterval(intervaloAtuali);
            intervaloAtuali = setInterval(atualizarGraf, valueRefresh);
        }
        await atualizarGraf();
    });
});
console.log(infos1torreVar.data[0].NomeBaseDados);
console.log(infos1torreVar.data[0].NomeBaseDados2);
var divForCompare = "divCompare";
var pagina = url.substring(url.indexOf('/meteo'));
document.getElementById("sidebar-nav").innerHTML = criarMenu(menuItens, infos1torreVar.data[0].nomeTorre, pagina);
document.getElementById("Pagina-Atual").innerHTML = await ActualPage(IconVariavel, nomeTorre, variavel);
document.getElementById("TitulovariavelGrafico").innerHTML = variavel;
document.getElementById("TitulovariavelNoData").innerHTML = variavel;
var conteudo = document.getElementById("conteudo");
var gif = document.getElementById("gif");
let dateStart = document.getElementById("start-date");
let dateFinish = document.getElementById("end-date");
dateStart.max = new Date().toISOString().slice(0, new Date().toISOString().lastIndexOf(":"));
dateFinish.max = new Date().toISOString().slice(0, new Date().toISOString().lastIndexOf(":"));
let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('myModal'))
let modalMaisDados = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalMostrarDados'))
let InsertDataIntervalModal = document.getElementById('LastTimeRefreshedModal');
let InsertDataIntervalModalMaisDados = document.getElementById('LastTimeRefreshedModalMaisDados');
let dados;
graficosWind(variavel)
checkConteudo();
let gauge;
let defs1;
defs1 = {
    min: 0,
    max: 100,
    decimals: 2,
    symbol: grandeza,
    pointer: true,
    minLabelMinFontSize: 14,
    maxLabelMinFontSize: 14,
    pointerOptions: {
        toplength: -15,
        bottomlength: 10,
        bottomwidth: 12,
        color: '#8e8e93',
        stroke: '#ffffff',
        stroke_width: 3,
        stroke_linecap: 'round'
    },
    gaugeWidthScale: 0.9,
    counter: true,
}
let graficoGauge = false;
let dados2;
let dadosNormaOntem;
var linhaOntem = false;
let intervaloAtuali;

async function getDadosOntem(start, end) {
    var dateStartNorm = new Date(start.value)
    var dateEndNorm = new Date(end.value)
    dateStartNorm.setDate(dateStartNorm.getDate() - 1)
    dateEndNorm.setDate(dateEndNorm.getDate() - 1)
    dados2 = await dataIntervalDias(nomeTorreBaseDados, nomeVariavelBaseDados, dateStartNorm.toISOString(), dateEndNorm.toISOString());
    console.log(tempoMinutos);
    var dado1Graf = addGraph(dados2.data, intervalo, comIntervalo, tempoMinutos)
    for (let i = 0; i < dado1Graf.length; i++) {
        var date = new Date(dado1Graf[i].x)
        date.setDate(date.getDate() + 1);
        dado1Graf[i].x = date.toISOString();
    }
    return dado1Graf;
}
const nomesDias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
async function showDataWind(start, tabela) {
    var dateEndNorm = new Date(start.value);
    var dateStartNorm = new Date(start.value)
    dateStartNorm.setHours(dateStartNorm.getHours() - 12);
    var dadosWindSpeed = await dataIntervalDias(nomeTorreBaseDados, infos1torreVar.data[0].NomeBaseDados, dateStartNorm.toISOString(), dateEndNorm.toISOString());
    var dadosWindDirection = await dataIntervalDias(nomeTorreBaseDados, infos1torreVar.data[0].NomeBaseDados2, dateStartNorm.toISOString(), dateEndNorm.toISOString());
    const dataWindSpeed = DataMediaHours(dadosWindSpeed.data, 1);
    const dataWindDir = DirecaoVentoPorIntervalo(dadosWindDirection.data, 1);
    var diasDiferentes = false;
    var z = new Date(dataWindSpeed[0].timestamp);
    var z2 = new Date(dataWindSpeed[dataWindSpeed.length - 1].timestamp);
    if (z.getDate() != z2.getDate()) {
        diasDiferentes = true;
    } else {
        diasDiferentes = false;
    }
    var contaDia = 0;
    var contaDiaSeg = 0;
    for (let i = 0; i < dataWindSpeed.length - 1; i++) {
        var dataDia = new Date(dataWindSpeed[0].timestamp);
        var dataDiaSeg = new Date(dataWindSpeed[i].timestamp);
        if (dataDia.getDate() == dataDiaSeg.getDate()) {
            contaDia++;
        }
        else {
            contaDiaSeg++;
        }
    }
    let tab = "";
    if (diasDiferentes) {
        tab = `<thead>
            <tr>
                <th colspan="1" class="text-center"></th>
                <th colspan="${contaDia}" class="text-center">${nomesDias[dataDia.getDay()]} , ${dataDia.getDate()}</th>
                <th colspan="${contaDiaSeg}" class="text-center">${nomesDias[dataDiaSeg.getDay()]} , ${dataDiaSeg.getDate()}</th>
            </tr>
            <tr> 
                <th class="text-center">Variavel</th>
            `;
        for (let i = 0; i < dataWindSpeed.length - 1; i++) {
            var horadoDia = new Date(dataWindSpeed[i].timestamp);
            tab += `
                <th class="text-center">${horadoDia.getHours()}h</th>
            `;
        }
        tab += `</tr></thead>`;
    } else {
        tab = `<thead>
            <tr>
                <th colspan="1}" class="text-center"></th>
                <th colspan="${contaDia}" class="text-center">${nomesDias[dataDia.getDay()]} , ${dataDia.getDate()}</th>
            </tr>
            <tr> 
                <th class="text-center">Vento</th>`;
        for (let i = 0; i < dataWindSpeed.length - 1; i++) {
            var horadoDia = new Date(dataWindSpeed[i].timestamp);
            tab += `<th class="text-center">${horadoDia.getHours()}h</th>`;
        }
        tab += `</tr></thead>`;
    }
    tab += `<tbody><tr><td class="text-center">Velocidade (Km/h)</td>`;
    for (let i = 0; i < dataWindSpeed.length - 1; i++) {
        tab += `<td class="text-center">${dataWindSpeed[i].average.toFixed(2)}</td>`;
    }
    tab += `</tr><tr><td class="text-center">Direção</td>`;
    for (let i = 0; i < dataWindDir.length - 1; i++) {
        tab += `<td class="text-center"><img src="../icons/icon_${dataWindDir[i].maxDirection}.png" class="iconsWindTable"></td>`;
    }
    tab += ` </tr></tbody>`;
    document.getElementById(tabela).innerHTML = tab;
}
const pontos = {
    N: "Norte",
    S: "Sul",
    E: "Este",
    W: "Oeste",
    NE: "Nordeste",
    NW: "Noroeste",
    SE: "Sudeste",
    SW: "Sudoeste",
    NNE: "Norte-nordeste",
    ENE: "Eeste-nordeste",
    ESE: "Este-sudeste",
    SSE: "Sul-sudeste",
    SSW: "Sul-sudoeste",
    WSW: "Oeste-sudoeste",
    WNW: "Oeste-noroeste",
    NNW: "Norte-noroeste"
};
async function WindDirection(data, tabela, tabela2) {
    let nome = "";
    let nomeDif = "";
    if (data[data.length - 1].value in pontos) {
        nome = pontos[data[data.length - 1].value];
    }
    else {
        nome = "undefined";
    }
    let tab = `<img src="../icons/icon_${data[data.length - 1].value}.png" class="iconsWindActual"><span class="nomePonto">${nome}</span>`;
    const ultimoPonto = data[data.length - 1].value;
    let pontoDiferente = null;
    for (let i = data.length - 2; i >= 0; i--) {
        if (data[i].value !== ultimoPonto) {
            pontoDiferente = data[i].value;
            break;
        }
    }
    if (pontoDiferente == null) {
        pontoDiferente = data[data.length - 1].value;
        nomeDif = nome;
    } else {
        if (pontoDiferente in pontos) {
            nomeDif = pontos[pontoDiferente];
        }
        else {
            nomeDif = "undefined";
        }
    }
    let tab2 = `<img src="../icons/icon_${pontoDiferente}.png" class="iconsWindActual"><span  class="nomePonto">${nomeDif}</span>`;
    document.getElementById(tabela).innerHTML = tab;
    document.getElementById(tabela2).innerHTML = tab2;
}
let dadosWindDir;
async function getDadosMinutos() {
    setDateInputs(0, 0, minutos);
    dados = await dataIntervalMinutos(nomeTorreBaseDados, nomeVariavelBaseDados, minutos);
    var x = checkDados(dados);
    if (x) {
        clearInterval(intervaloAtuali);
        document.querySelectorAll('.dropdown-itemRefresh').forEach(function (item) {
            item.classList.remove('active');
        });
        document.getElementById("desativarFiltro").classList.add('active');
        return;
    }
    else {
        dadosNormaOntem = await getDadosOntem(dateStart, dateFinish);
        dadosWindDir = await dataIntervalMinutos(nomeTorreBaseDados, infos1torreVar.data[0].NomeBaseDados2, minutos);
        distime();
        chartjs.destroy();
        graficosWind(variavel);
        checkData(dados.data, chartjs, comIntervalo, intervalo, tempoMinutos);
        ResetZoom();
        await WindDirection(dadosWindDir.data, "ActualWindDIR", "LastWindDirection")
        await showDataWind(dateFinish, "windTable");
        createTable(dados.data, variavel, "tabelaEstatis", grandeza);
        createTableShowData(dados.data, "tabelaMostrarDados", grandeza)
        await refreshOtherTowers(infosVariaveisByName, nomeTorreAtual, minutos, grandeza);
        checkConteudo();
        gauge = new JustGage({
            id: "gauge",
            value: 0,
            defaults: defs1
        });
        graficoGauge = true;
        if (dados.data.length == 0) {
            gauge.destroy();
            graficoGauge = false;
            return;
        }
        else {
            graficoGauge = true;
            gauge.refresh(dados.data[dados.data.length - 1].value.toFixed(3));
        }
        ResetZoom();
        intervaloAtuali = setInterval(atualizarGraf, valueRefresh);
    }
}
getDadosMinutos()
function addLinetoGraph(data) {
    chartjs.data.datasets.push({
        label: ` ${variavel}(dia Anterior)`,
        data: data,
        borderColor: "gray",
        pointRadius: 0
    });
}
function toggleNewLine() {
    var newLineIndex = chartjs.data.datasets.length;
    if (newLineIndex === 1) {
        addLinetoGraph(dadosNormaOntem);
        linhaOntem = true;
    } else {
        chartjs.data.datasets.splice(newLineIndex - 1, 1);
        linhaOntem = false;
    }
    chartjs.update();
}
var toggleButton = document.getElementById("toggle-line");
toggleButton.addEventListener("click", toggleNewLine);
async function atualizarGraf() {
    var dateStartNorm = new Date(dateStart.value);
    var dateEndNorm = new Date();
    dados = await dataIntervalDias(nomeTorreBaseDados, nomeVariavelBaseDados, dateStartNorm.toISOString(), dateEndNorm.toISOString());
    var x = checkDados(dados)
    if (x) {
        clearInterval(intervaloAtuali);
        document.querySelectorAll('.dropdown-itemRefresh').forEach(function (item) {
            item.classList.remove('active');
        });
        document.getElementById("desativarFiltro").classList.add('active');
        return;
    }
    else {
        dadosWindDir = await dataIntervalDias(nomeTorreBaseDados, infos1torreVar.data[0].NomeBaseDados2, dateStartNorm.toISOString(), dateEndNorm.toISOString());
        dadosNormaOntem = await getDadosOntem(dateStart, dateFinish);
        ResetZoom();
        chartjs.destroy();
        graficosWind(variavel);
        addData(dados.data, chartjs, comIntervalo, intervalo);
        ResetZoom();
        await showDataWind(dateFinish, "windTable");
        await WindDirection(dadosWindDir.data, "ActualWindDIR", "LastWindDirection")
        if (linhaOntem) {
            console.log("linha");
            addLinetoGraph(dadosNormaOntem)
            chartjs.update();
        }
        createTable(dados.data, variavel, "tabelaEstatis", grandeza);
        ResetZoom();
        distime();
        gauge.refresh(dados.data[dados.data.length - 1].value.toFixed(3));
        refreshOtherTowers(infosVariaveisByName, nomeTorreAtual, minutos, grandeza);
    }
}
let diffInMinutes;
function timeInMinutes(start, end) {
    var dateStart = new Date(start);
    var dateEnd = new Date(end);
    var diffInMilliseconds = dateEnd - dateStart;
    return Math.floor(diffInMilliseconds / 60000);
}
async function getDadosData(start, end) {
    conteudo.setAttribute("hidden", true);
    gif.removeAttribute("hidden");
    minutos = timeInMinutes(start, end);
    var dateStartNorm = new Date(start);
    var dateEndNorm = new Date(end)
    dados = await dataIntervalDias(nomeTorreBaseDados, nomeVariavelBaseDados, dateStartNorm.toISOString(), dateEndNorm.toISOString());
    var x = checkDados(dados)
    if (x) {
        clearInterval(intervaloAtuali);
        document.querySelectorAll('.dropdown-itemRefresh').forEach(function (item) {
            item.classList.remove('active');
        });
        document.getElementById("desativarFiltro").classList.add('active');
        return;
    }
    else {
        dadosWindDir = await dataIntervalMinutos(nomeTorreBaseDados, infos1torreVar.data[0].NomeBaseDados2, minutos);
        chartjs.destroy();
        graficosWind(variavel);
        if (minutos > 600) {
            tempoMinutos = true;
            intervalo = 15;
        }
        else {
            tempoMinutos = false;
        }
        dadosNormaOntem = await getDadosOntem(dateStart, dateFinish);
        checkData(dados.data, chartjs, comIntervalo, intervalo, tempoMinutos);
        checkConteudo();
        await WindDirection(dadosWindDir.data, "ActualWindDIR", "LastWindDirection")
        await showDataWind(dateFinish, "windTable");
        ResetZoom();
        createTable(dados.data, variavel, "tabelaEstatis", grandeza);
        createTableShowData(dados.data, "tabelaMostrarDados", grandeza)
        if (linhaOntem) {
            console.log("linha");
            addLinetoGraph(dadosNormaOntem)

            chartjs.update();
        }
        if (graficoGauge) {
            console.log(graficoGauge);
            gauge.refresh(dados.data[dados.data.length - 1].value.toFixed(3));
        } else {
            console.log(graficoGauge);
            gauge = new JustGage({
                id: "gauge",
                value: 0,
                defaults: defs1
            });
            gauge.refresh(dados.data[dados.data.length - 1].value.toFixed(3));
            graficoGauge = true;
        }
        distime();
        refreshOtherTowersByDate(infosVariaveisByName, nomeTorreAtual, dateStartNorm.toISOString(), dateEndNorm.toISOString(), grandeza);
        gif.setAttribute("hidden", true);
        conteudo.removeAttribute("hidden");
        dateStart.value = start;
        dateFinish.value = end;
    }
}
//setTimeout(getDadosData, 1000,"2023-04-11T07:51", "2023-04-11T22:51");
$(document).ready(function () {
    $('#ResetZoom').on('click', function () {
        ResetZoom();
    })
});
$(document).ready(function () {
    $('.ActualData').on('click', async function () {
        if (dateStart.value === dateFinish.value) {
            $('#myModalInfo').modal('show');
            $('.modal_body1').html('Datas iguais!!<br> A data Inicial tem de ser diferente da data Final!');
            return;
        }
        if (dateStart.value == "" || dateFinish.value == "") {
            $('#myModalInfo').modal('show');
            $('.modal_body1').html('Tem de selecionar um intervalo de Tempo!');
            return;
        }
        conteudo.setAttribute("hidden", true);
        chartjs.destroy();
        graficosWind(variavel);
        await getDadosData(dateStart.value, dateFinish.value);
    })
});
async function refreshConteudo() {
    gif.removeAttribute("hidden");
    conteudo.setAttribute("hidden", true);
    dados = await dataIntervalMinutos(nomeTorreBaseDados, nomeVariavelBaseDados, minutos);
    dadosWindDir = await dataIntervalMinutos(nomeTorreBaseDados, infos1torreVar.data[0].NomeBaseDados2, minutos);
    var x = checkDados(dados)
    console.log(x);
    if (x) {
        clearInterval(intervaloAtuali);
        document.querySelectorAll('.dropdown-itemRefresh').forEach(function (item) {
            item.classList.remove('active');
        });
        document.getElementById("desativarFiltro").classList.add('active');
        return;
    }
    else {
        distime();
        chartjs.destroy();
        checkData(dados.data, chartjs, comIntervalo, intervalo, tempoMinutos);
        dadosNormaOntem = await getDadosOntem(dateStart, dateFinish);
        if (linhaOntem) {
            console.log("linha");
            addLinetoGraph(dadosNormaOntem)

            chartjs.update();
        }
        ResetZoom();
        createTable(dados.data, variavel, "tabelaEstatis", grandeza);
        await WindDirection(dadosWindDir.data, "ActualWindDIR", "LastWindDirection")
        await showDataWind(dateFinish, "windTable");
        createTableShowData(dados.data, "tabelaMostrarDados", grandeza)

        if (graficoGauge) {
            console.log(graficoGauge);
            gauge.refresh(dados.data[dados.data.length - 1].value.toFixed(3));
        } else {
            console.log(graficoGauge);
            gauge = new JustGage({
                id: "gauge",
                value: 0,
                defaults: defs1
            });
            gauge.refresh(dados.data[dados.data.length - 1].value.toFixed(3));
            graficoGauge = true;
        }
        refreshOtherTowers(infosVariaveisByName, nomeTorreAtual, minutos, grandeza);
        gif.setAttribute("hidden", true);
        conteudo.removeAttribute("hidden");
    }
}
$(document).ready(function () {
    $('.updateChart1h').on('click', async function () {
        minutos = 60;
        setDateInputs(0, 1, 0);
        tempoMinutos = false;
        refreshConteudo()
    })
});
$(document).ready(function () {
    $('.updateChart3h').on('click', async function () {
        minutos = 180;
        setDateInputs(0, 3, 0);
        tempoMinutos = false;
        refreshConteudo()
    })
});
$(document).ready(function () {
    $('.updateChart6h').on('click', async function () {
        minutos = 6 * 60;
        setDateInputs(0, 6, 0);
        tempoMinutos = false;

        refreshConteudo()
    })
});
$(document).ready(function () {
    $('.updateChart12h').on('click', async function () {
        minutos = 12 * 60;
        setDateInputs(0, 12, 0);
        tempoMinutos = true;
        intervalo = 5;
        refreshConteudo()
    })
});
$(document).ready(function () {
    $('.updateChartToday').on('click', async function () {
        var date = new Date();
        console.log();
        minutos = (date.getHours() * 60) + date.getMinutes();
        setDateInputs(0, date.getHours(), date.getMinutes());
        tempoMinutos = true;
        intervalo = 15;
        refreshConteudo()
    })
});
$(document).ready(function () {
    $('.updateChartWeek').on('click', async function () {
        minutos = 7 * 24 * 60;
        setDateInputs(7, 0, 0);
        tempoMinutos = true;
        intervalo = 60;
        refreshConteudo()
    })
});
$(document).ready(function () {
    $('.updateChartMonth').on('click', async function () {
        minutos = 31 * 24 * 60;
        setDateInputs(31, 0, 0);
        tempoMinutos = true;
        intervalo = 5;
        refreshConteudo()
    })
});
createCompareDiv(divForCompare, nomeTorreAtual, infosVariaveisByName.data);
for (let i = 0; i < infosVariaveisByName.data.length; i++) {
    if (infosVariaveisByName.data[i].nomeTorre != nomeTorreAtual && infosVariaveisByName.data[i].nomeVariavel != "Dashboard" && infosVariaveisByName.data[i].activa == 1) {
        let btn = document.getElementById(`abrirModal${i}`);
        let dataTorreCompare = await dataIntervalMinutos(btn.getAttribute('data3'), btn.getAttribute('data4'), minutos);
        $(document).ready(function () {
            $(`#abrirModal${i}`).on('click', async function () {
                console.log("xx");
                creatBodyModal(btn.getAttribute('data'), btn.getAttribute('data2'), dados.data, dataTorreCompare.data);
                const dataStart = dateStart.value.split('T');
                const dataFinish = dateFinish.value.split('T');
                InsertDataIntervalModal.innerHTML = "Entre - " + dataStart[0] + " " + dataStart[1] + " e " + dataFinish[0] + " " + dataFinish[1];
                modal.show();
            })
        });
    }
}
$(document).ready(function () {
    $(`#abrirModalMaisDados`).on('click', async function () {
        creatBodyModalMostrarMaisDados(nomeTorre, dados.data, 5, grandeza)
        const dataStart = dateStart.value.split('T');
        const dataFinish = dateFinish.value.split('T');
        InsertDataIntervalModalMaisDados.innerHTML = "Entre - " + dataStart[0] + " " + dataStart[1] + " e " + dataFinish[0] + " " + dataFinish[1];
        modalMaisDados.show();
    })
});
$(document).ready(function () {
    $('.ReloadPage').on('click', function () {
        window.location.reload(true);
    })
})
$(document).keyup(function (e) {
    if ((e.key == 'Escape' || e.key == 'Esc' || e.keyCode == 27)) {
        modal.hide();
    }
})
$(document).ready(function () {
    $('#btnExportToCsv').on('click', async function () {
        exportToCSV(dadosWindSpeed.data, nomeTorre, variavel, grandeza);
    })
})
$(document).ready(function () {
    $('#btnExportToPdf').on('click', async function () {
        convertHTMLtoPDF2(dadosWindSpeed.data, nomeTorre, variavel, grandeza);
    })
})
