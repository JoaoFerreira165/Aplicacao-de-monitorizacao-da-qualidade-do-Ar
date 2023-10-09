import { criarMenu, menuItens } from "/meteo/menu/menuFunction.js";
import { ActualPage } from "/meteo/menu/ActualPage.js";
import { ReadDatabyDate, InfoAllByMeteobaseIdAndTorresId, ReadDatabyNameVar, ReadDatabyHashCodeAndNameVar, ReadDatabyHashCodeAndNameVarAndTorreId, ReadDatabyHashCode, ReadDatabyHashCodeAndVarId, dataIntervalDias, dataIntervalMinutos, InfoAllByMeteobaseId, InfoAllByTorresId, InfoReadVariaveisById, InfoReadVariaveisByName, InfoLocalizacaoId } from "/meteo/scripts/getDados.js";
import {
  checkData, checkConteudo, createTable, addData, createTableShowData, DirecaoVentoPorIntervaloByDay, DirecaoVentoPorIntervalo,
  DataMediaSeconds, createCompareDiv, creatBodyModal, setDateInputs, creatBodyModalMostrarMaisDados,
  distime, checkDados, refreshOtherTowers, addGraph, refreshOtherTowersByDate, DadoCalc
} from "/meteo/scripts/function.js";
//lOCALHOST
/*
const instance = axios.create({
  baseURL: 'http://10.3.246.249:3000/',
});
*/
//LUSIADA
const instance = axios.create({
  baseURL: 'http://lab.fam.ulusiada.pt:3000/',
});

var url = window.location.href;
var urlNorm = new URL(url);
const params = new URLSearchParams(urlNorm.search);
const torreId = params.get("torre_Id");
const variavelId = params.get("variavel_Id");
console.log("Torre:", torreId);
console.log("Variável:", variavelId);

let InfosTorreVaria = await InfoAllByTorresId(variavelId);
if (InfosTorreVaria.data.length == 0) {
  window.location.href = "/meteo/errorPage/error_page.html";
}
var pathname = urlNorm.pathname;
var filename = pathname.split("/").pop();
if (filename == InfosTorreVaria.data[0].ficheiro + ".html") {
  console.log("igual");
} else {
  filename = InfosTorreVaria.data[0].ficheiro + ".html"; // Define o novo nome do arquivo
  var newURL = `/meteo/geral/${filename}?torre_Id=${torreId}&variavel_Id=${variavelId}`;
  window.location.href = newURL; // Redireciona para a nova
}

var localizacao = await InfoLocalizacaoId(torreId); ~
  console.log(localizacao);
var nomeTorre = InfosTorreVaria.data[0].nome;
var variavel = InfosTorreVaria.data[0].nomeVariavel;
var IconVariavel = InfosTorreVaria.data[0].icon;

let infosTorreTodasVar = await InfoAllByMeteobaseId(torreId);
var pagina = url.substring(url.indexOf("/meteo"));
document.getElementById("sidebar-nav").innerHTML = criarMenu(menuItens, InfosTorreVaria.data[0].nomeTorre, pagina);
document.getElementById("Pagina-Atual").innerHTML = await ActualPage(IconVariavel, nomeTorre, variavel);
var restoconteudo = document.getElementById("restoconteudo");
var grafico = document.getElementById("grafico");
var mensagemGrafico = document.getElementById("mensagemGrafico");
var gif = document.getElementById("gif");

var cores = ["#FF0000", "#1eff00", "#0000FF", "#FFFF00", "#ff00bf", "#ffa600"];
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
const nomesDias = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];
var nomeMeses = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];
let formato = {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};
function showGif() {
  restoconteudo.setAttribute("hidden", true);
  grafico.setAttribute("hidden", true);
  gif.removeAttribute("hidden");
}
function hideGif() {
  gif.setAttribute("hidden", true);
  restoconteudo.removeAttribute("hidden");
  grafico.removeAttribute("hidden");
}
function hashCode(str) {
  var hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (var i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Converte para um inteiro de 32 bits
  }
  return hash;
}
const zoomOptions = {
  pan: {
    enabled: true,
    mode: "x",
    modifierKey: "ctrl",
  },
  zoom: {
    wheel: {
      enabled: true,
    },
    drag: {
      enabled: true,
    },
    pinch: {
      enabled: true,
    },
    mode: "x",
  },
};
var optionsGraphs = {
  scales: {
    x: {
      position: "bottom",
      type: "time",
      ticks: {
        autoSkip: true,
        autoSkipPadding: 50,
        maxRotation: 0,
      },
      time: {
        displayFormats: {
          hour: "HH:mm",
          minute: "HH:mm",
          second: "HH:mm:ss",
        },
      },
    },
    y: {
      type: "linear",
      position: "left",
    },
  },
  legend: {
    display: true,
  },
  plugins: {
    zoom: zoomOptions,
  },
};
let chart = document.getElementById("chart");
let chartjs;
chartjs = new Chart(chart, {
  type: "line",
  data: {
    labels: [],
  },
  options: optionsGraphs,
});
$(document).ready(function () {
  $('#ResetZoom').on('click', function () {
    chartjs.resetZoom();
  })
});

async function valueAt0(dado) {
  for (let i = 0; i < dado.length; i++) {
    if (dado[i].value < 0) {
      dado[i].value = 0;
    }
    else if (dado[i].value > 100) {
      dado[i].value = 100;
    }
  }
}

async function showData() {
  showGif();
  let dados = await dataIntervalMinutos("torre2", "temperature", 20);
  console.log(dados)
  if (dados.request.status == 0 || dados.request.status == 500) {
    gif.setAttribute("hidden", true);
    restoconteudo.setAttribute("hidden", true);
    mensagem.innerHTML = "ERRO...";
    mensagem2.innerHTML = `Mensagem do Servidor:  <span style="color:red;">${dados.message}</span>`;
    NodataHidden.removeAttribute("hidden");
    conteudo.removeAttribute("hidden");
  }
  else {
    await createTable7days("IndexTable");
    await createDivs("#restoconteudo");
    hideGif();
    chartjs.update();
    chartjs.resetZoom();
  }
}
showData();

async function createTable7days(tabela) {
  let tab;
  var valores = [];
  var valoresWinddir = [];
  var dadosGuadar2 = [];
  tab = `<thead><tr><th colspan="1" class="col text-center">Variável</th>`;
  var hasWindDir = false;
  for (var i = 7; i >= 1; i--) {
    var data = new Date();
    data.setDate(data.getDate() - i);
    var diaSemana = nomesDias[data.getDay()];
    tab += `<th colspan="1" class="col text-center">${diaSemana}, ${data.getDate()}</th>`;
  }
  tab += `</tr></thead><tbody>`;
  for (var b = 1; b < infosTorreTodasVar.data.length; b++) {
    tab += `<tr><th class="text-center" scope="row">${infosTorreTodasVar.data[b].nomeVariavel} (${infosTorreTodasVar.data[b].grandeza})</th>`;
    valores = [];
    valoresWinddir = [];
    let soma = 0;
    let media = 0;
    let maximo = 0;
    let minimo = 0;
    for (var i = 7; i >= 1; i--) {
      var data = new Date();
      var dataInicio = new Date(data);
      var dataFim = new Date(data);
      dataInicio.setDate(dataInicio.getDate() - i);
      var diaSemana = nomesDias[dataInicio.getDay()];
      var dia = dataInicio.getDate();
      var ano = dataInicio.getFullYear();
      var mes = dataInicio.getMonth() + 1;
      dataInicio.setHours(0, 0, 0, 0);
      dataFim.setDate(dataFim.getDate() - i);
      dataFim.setHours(23, 59, 59, 999);
      var hashCodeDay = hashCode(dia + "-" + mes + "-" + ano);
      var data_idHashCode = hashCodeDay;
      var torre_id = infosTorreTodasVar.data[b].id_torre;
      var variavel_id = infosTorreTodasVar.data[b].variavel_id;
      var data_nomeVariavel = infosTorreTodasVar.data[b].nomeVariavel;
      var date = ano + "-" + mes + "-" + dia;
      var max;
      var min;
      if (infosTorreTodasVar.data[b].nomeVariavel2 == "Direção Vento") {
        var dadosSql = await ReadDatabyHashCodeAndNameVarAndTorreId(hashCodeDay, infosTorreTodasVar.data[b].nomeVariavel2, infosTorreTodasVar.data[b].id_torre);
        if (dadosSql.data.length > 0) {
          valoresWinddir.push({
            nome: dataInicio.getDay(),
            nome2: dataInicio.getDate(),
            direcao: dadosSql.data[0].media,
          });
          hasWindDir = true;
        } else {
          data_nomeVariavel = infosTorreTodasVar.data[b].nomeVariavel2;
          max = NaN;
          min = NaN;
          let dadosWindDirections = await dataIntervalDias(
            infosTorreTodasVar.data[b].torreAssoc,
            infosTorreTodasVar.data[b].NomeBaseDados2,
            dataInicio.toISOString(),
            dataFim.toISOString()
          );
          let dataWindDir = DirecaoVentoPorIntervaloByDay(
            dadosWindDirections.data
          );
          valoresWinddir.push({
            nome: dataInicio.getDay(),
            nome2: dataInicio.getDate(),
            direcao: dataWindDir[0]?.maxDirection ?? "default",
          });
          media = dataWindDir[0]?.maxDirection ?? "default";
          await instance.post('/meteo/data/insert', { data_idHashCode, torre_id, variavel_id, data_nomeVariavel, date, media, max, min })
            .then((response) => {
              console.log('Dados inseridos na tabela data com sucesso.');
            })
            .catch((error) => {
              console.error('Erro ao inserir dados na tabela: ' + error.message);
            });

          dadosGuadar2.push({ nome: hashCodeDay, variavel: infosTorreTodasVar.data[b].nomeVariavel2, idVariavel: infosTorreTodasVar.data[b].id_variavel, idTorre: infosTorreTodasVar.data[b].id_torre, idTorres: infosTorreTodasVar.data[b].torres_id, date: ano + "-" + mes + "-" + dia, media: dataWindDir[0]?.maxDirection ?? "default", maximo: NaN, minimo: NaN });
          hasWindDir = true;
        }
      }
      var dadosSql = await ReadDatabyHashCodeAndNameVarAndTorreId(hashCodeDay, infosTorreTodasVar.data[b].nomeVariavel, infosTorreTodasVar.data[b].id_torre);
      if (dadosSql.data.length > 0) {
        var max, min;
        if (dadosSql.data[0].media === undefined || dadosSql.data[0].media === null) {
          media = NaN;
        }
        else {
          media = parseFloat(dadosSql.data[0].media);
        }
        if (dadosSql.data[0].max === undefined || dadosSql.data[0].max === null) {
          max = NaN;
        }
        else {
          max = dadosSql.data[0].max;
        }
        if (dadosSql.data[0].min === undefined || dadosSql.data[0].min === null) {
          min = NaN;
        }
        else {
          min = dadosSql.data[0].min;
        }
        valores.push({ nome: dataInicio.getDate(), media: media, max: max, min: min });;
      }
      else {
        let dados = await dataIntervalDias(
          infosTorreTodasVar.data[b].torreAssoc,
          infosTorreTodasVar.data[b].NomeBaseDados,
          dataInicio.toISOString(),
          dataFim.toISOString()
        );
        maximo = 0;
        minimo = 0;
        media = 0;
        soma = 0;
        if (dados.data.length == 0) {
          media = NaN;
          maximo = NaN;
          minimo = NaN;
	  max = NaN;
	  min = NaN;
        }
        else {
          if (infosTorreTodasVar.data[b].NomeBaseDados2 === "humidity") {
            await valueAt0(dados.data);
          }
          maximo = dados.data[0]?.value ?? NaN;
          minimo = dados.data[0]?.value ?? NaN;
          for (var z = 0; z < dados.data.length; z++) {
            if (dados.data[z].value === null) {
              continue;
            }
            soma += dados.data[z].value;
            if (dados.data[z].value > maximo) {
              maximo = dados.data[z].value;
            }
            if (dados.data[z].value < minimo) {
              minimo = dados.data[z].value;
            }
          }
          media = soma / dados.data.length;
          max = maximo;
          min = minimo;
        }
        data_nomeVariavel = infosTorreTodasVar.data[b].nomeVariavel;
        await instance.post('/meteo/data/insert', { data_idHashCode, torre_id, variavel_id, data_nomeVariavel, date, media, max, min })
          .then((response) => {
            console.log('Dados inseridos na tabela data com sucesso.');
          })
          .catch((error) => {
            console.error('Erro ao inserir dados na tabela: ' + error.message);
          });
        valores.push({ nome: dataInicio.getDate(), media: media, max: maximo, min: minimo });
        dadosGuadar2.push({ nome: hashCodeDay, variavel: infosTorreTodasVar.data[b].nomeVariavel, idVariavel: infosTorreTodasVar.data[b].id_variavel, idTorre: infosTorreTodasVar.data[b].id_torre, idTorres: infosTorreTodasVar.data[b].torres_id, date: ano + "-" + mes + "-" + dia, media: media, maximo: maximo, minimo: minimo });
      }
    }
    let colspanMedia = 1;
    let hasNaNSequenceMedia = false;
    console.log(valores)
    for (let i = 0; i < valores.length; i++) {
      let valorAtual = valores[i];
      let valorProximo = valores[i + 1];
      console.log(isNaN(valorAtual.media))
      if (isNaN(valorAtual.media) && isNaN(valorProximo?.media)) {
        if (!hasNaNSequenceMedia) {
          console.log("entroo");
          colspanMedia = 2;
          hasNaNSequenceMedia = true;
        } else {
          colspanMedia++;
        }
        if (valorProximo === undefined) {
          tab += `<td colspan="${colspanMedia}" class="text-center align-middle text-danger">Sem Dados</td>`;
        }
      } else {
        console.log(hasNaNSequenceMedia);
        console.log(colspanMedia);
        if (hasNaNSequenceMedia) {
          tab += `<td colspan="${colspanMedia}" class="text-center align-middle text-danger">Sem Dados</td>`;
          colspanMedia = 1;
          hasNaNSequenceMedia = false;
        }
        else {
          if (isNaN(valorAtual.media)) {
            tab += `<td class="text-center align-middle text-danger">Sem Dados</td>`;
          }
          else {
            tab += `<td class="text-center align-middle">${valorAtual.media.toFixed(2)}</td>`;
          }
        }
      }
    }
    tab += `</tr><tr><td class="text-center">Min.<br> Max.</td>`;

    let colspan = 1;
    let hasNaNSequence = false;
    for (let i = 0; i < valores.length; i++) {
      let valorAtual = valores[i];
      let valorProximo = valores[i + 1];
      if (isNaN(valorAtual.max) && isNaN(valorProximo?.max)) {
        if (!hasNaNSequence) {
          colspan = 2;
          hasNaNSequence = true;
        } else {
          colspan++;
        }
        if (valorProximo === undefined) {
          tab += `<td colspan="${colspanMedia}" class="text-center align-middle text-danger">Sem Dados</td>`;
        }
      } else {
        if (hasNaNSequence) {
          tab += `<td colspan="${colspan}" class="text-center align-middle text-danger">Sem Dados</td>`;
          colspan = 1;
          hasNaNSequence = false;
        }
        else {
          if (isNaN(valorAtual.min) && isNaN(valorAtual.max)) {
            tab += `<td class="text-center align-middle text-danger">Sem Dados</td>`;
          } else {
            tab += `<td class="text-center"><span class="text-primary">${valorAtual.min.toFixed(2)}</span>
            <br> <span class="text-warning">${valorAtual.max.toFixed(2)}</span></td>`;
          }
        }
      }
    }
    tab += `</tr>`;
  }

  if (hasWindDir) {
    tab += `<tr><th class="text-center" scope="row">Direção do Vento</th>`;
    let colspanVento = 1;
    let hasNaNSequenceVento = false;
    console.log(valoresWinddir)
    for (let i = 0; i < valoresWinddir.length; i++) {
      let valorAtual = valoresWinddir[i];
      let valorProximo = valoresWinddir[i + 1];
      console.log(i);
      console.log(valorAtual);
      console.log(valorProximo);
      if (valorAtual.direcao == "No Data" && valorProximo != undefined && valorProximo.direcao == "No Data") {
        if (!hasNaNSequenceVento) {
          colspanVento = 2;
          hasNaNSequenceVento = true;
        } else {
          colspanVento++;
        }
      } else {
        if (hasNaNSequenceVento) {
          tab += `<td colspan="${colspanVento}" class="text-center align-middle text-danger">Sem Dados</td>`;
          colspanVento = 1;
          hasNaNSequenceVento = false;
        }
        else {
          if (valorAtual.direcao === "No Data") {
            tab += `<td class="text-center"><img src="../icons/icon_default.png" class="iconsWindTableIndex"></td>`;
          } else {
            tab += `<td class="text-center"><img src="../icons/icon_${valorAtual.direcao}.png" class="iconsWindTableIndex"></td>`;
          }
        }
      }
    }
    tab += `</tr>`;
  }
  tab += `</tbody>`;
  var dadosAgrupados = {};
  for (var i = 0; i < dadosGuadar2.length; i++) {
    var item = dadosGuadar2[i];
    var nome = item.nome;
    if (dadosAgrupados[nome]) {
      dadosAgrupados[nome].push(item);
    } else {
      dadosAgrupados[nome] = [item];
    }
  }
  document.getElementById(tabela).innerHTML = tab;
}
async function createDivs(div) {
  var data = new Date();
  var dataInicio = new Date(data);
  var dataFim = new Date(data);
  dataInicio.setHours(0, 0, 0, 0);
  var string = nomesDias[dataInicio.getDay()] + ", " + dataInicio.getDate() + " de " + nomeMeses[dataInicio.getMonth()] + " de " + dataInicio.getFullYear() + ", às " + dataInicio.getHours().toString().padStart(2, '0') + ":" + dataInicio.getMinutes().toString().padStart(2, '0');
  var string2 = nomesDias[dataFim.getDay()] + ", " + dataFim.getDate() + " de " + nomeMeses[dataFim.getMonth()] + " de " + dataFim.getFullYear() + ", às " + dataFim.getHours().toString().padStart(2, '0') + ":" + dataFim.getMinutes().toString().padStart(2, '0');
  $('#data').append(string + " - " + string2);
  var num;
  console.log("numero de variaveis: " + (infosTorreTodasVar.data.length - 1));
  if (infosTorreTodasVar.data.length - 1 < 3) {
    num = 4;
  }
  else {
    num = 3;
  }
  let tab = '';
  tab += `
  <div class="col-md-${num} mt-2">
    <div class="card">
      <div class="card-body xxx">
        <div class="d-flex justify-content-center border-bottom">
            <img src="/meteo/icons/icon_local.png" class="iconsTitle">
            <h4 class="card-title"> Localização </h4>
        </div>
        <div class="mt-3">
            <div>
                <img src="/meteo/icons/icon_localization.png" class="iconsBody">
                <span class="localizacao">${localizacao.data[0]?.local ?? "Sem informação"}</span>
            </div>
            <div class="mt-3">
                <img src="/meteo/icons/icon_city.png" class="iconsBody">
                <span class="localizacao"> ${localizacao.data[0]?.cidade ?? "Sem informação"}</span>
            </div>
            <div class="mt-3">
                <img src="/meteo/icons/icon_rua.png" class="iconsBody">
                <span class="localizacao"> ${localizacao.data[0]?.rua ?? ""}, ${localizacao.data[0]?.freguesia ?? "Sem informação"}</span>
            </div>
            <div class="mt-3">
                <img src="/meteo/icons/icon_coordenadas.png" class="iconsBody">
                <span class="localizacao ms-1">${localizacao.data[0]?.coordenadas ?? "Sem informação"}</span>
            </div>
        </div>
      </div>
    </div>
  </div>`;
  let checkData2 = false
  for (var i = 1; i < infosTorreTodasVar.data.length; i++) {
    tab += ` 
    <div class="col-md-${num} mt-2">
      <div class="card">
        <div class="card-body xxx">
          <div class="card-title text-center border-bottom"> 
            <h5> ${infosTorreTodasVar.data[i].nomeVariavel} ( ${infosTorreTodasVar.data[i].grandeza} )</h5>
          </div>
          <div class="mt-3">`;
    let dados = await dataIntervalDias(
      infosTorreTodasVar.data[i].torreAssoc,
      infosTorreTodasVar.data[i].NomeBaseDados,
      dataInicio.toISOString(),
      dataFim.toISOString()
    );
    if (dados.data.length == 0) {
      checkData2 = true;
    }
    else {
      if (infosTorreTodasVar.data[i].NomeBaseDados == "humidity") {
        await valueAt0(dados.data);
      }
      checkData2 = false;
      var dadosNormalizados = addGraph(dados.data, 5, true, true)
      chartjs.data.datasets.push({
        label: infosTorreTodasVar.data[i].nomeVariavel + ` (${infosTorreTodasVar.data[i].grandeza})`,
        data: dadosNormalizados,
        borderColor: cores[i - 1],
        fill: false,
        spanGaps: true,
        showLine: false,
      });
      chartjs.update();
    }
    var dadoscalculados = DadoCalc(dados.data);
    console.log(dadoscalculados)
    var horaMaxConv = new Date(dados.data[dados.data.length - 1]?.date ?? "");
    var horaAtual = horaMaxConv?.toLocaleString([], formato) ?? "-";
    if (horaAtual === "Invalid Date") {
      horaAtual = "-";
    }
    console.log(infosTorreTodasVar.data[i].grandeza);
    tab += `
    <div class="mt-2 p-1 d-flex justify-content-between">
      <div id="Min">
        <span class="min" style="margin-left: -2px;">Atual.</span>
        <span class="Value">${dados.data[dados.data.length - 1]?.value.toFixed(2) ?? "NaN"} </span>
        <br>
        <span class="min d-flex justify-content-center">${horaAtual}</span>
      </div>
      <div id="Max">
        <span class="min">Média</span>
        <span class="Value">${dadoscalculados.media.toFixed(2)} </span>
        <br>
        <span class="min d-flex justify-content-center">-</span>
      </div>
    </div>
    <div class="d-flex p-1 justify-content-between">
      <div id="Min">
        <span class="min">Min.</span>
        <span class="MinValue">${dadoscalculados.min.toFixed(2)}</span>
        <br>
        <span class="min d-flex justify-content-center">${dadoscalculados.horaMin}</span>
      </div>
      <div id="Max">
        <span class="max">Max.</span>
        <span class="MaxValue">${dadoscalculados.max.toFixed(2)} </span>
        <br>
        <span class="max d-flex justify-content-center">${dadoscalculados.horaMax}</span>
      </div>
    </div>
    </div></div></div></div>`;
    if (infosTorreTodasVar.data[i].nomeVariavel2 == "Direção Vento") {
      let dados = await dataIntervalDias(
        infosTorreTodasVar.data[i].torreAssoc,
        infosTorreTodasVar.data[i].NomeBaseDados2,
        dataInicio.toISOString(),
        dataFim.toISOString()
      );
      let nome = "";
      let nomeDif = "";
      let pontoDiferente;
      let dataWindDir;
      dataWindDir = DirecaoVentoPorIntervaloByDay(dados.data);

      if (dados.data.length == 0) {
        nome = "undefined";
        nomeMedia = "undefined";
        nomeDif = "undefined";
        pontoDiferente = "default";
      }
      else {
        if (dados.data[dados.data.length - 1].value in pontos) {
          nome = pontos[dados.data[dados.data.length - 1].value];
        }
        else {
          nome = "undefined";
        }
        const ultimoPonto = dados.data[dados.data.length - 1]?.value ?? "undefined";
        pontoDiferente = null;
        for (let i = dados.data.length - 2; i >= 0; i--) {
          if (dados.data[i].value !== ultimoPonto) {
            pontoDiferente = dados.data[i].value;
            break;
          }
        }
        if (pontoDiferente == null) {
          pontoDiferente = dados.data[dados.data.length - 1].value;
          nomeDif = nome;
        } else {
          if (pontoDiferente in pontos) {
            nomeDif = pontos[pontoDiferente];
          }
          else {
            nomeDif = "undefined";
          }
        }
        var nomeMedia;
        if (dataWindDir[0].maxDirection in pontos) {
          nomeMedia = pontos[dataWindDir[0].maxDirection];
        }
        else {
          nomeMedia = "undefined";
        }
      }
      tab += `
      <div class="col-md-${num} mt-2">
        <div class="card">
          <div class="card-body xxx" >
              <div class="d-flex justify-content-center border-bottom">
                <img src="../icons/icon_RosaVentos.png" class="iconsWind">
                <h4 class="card-title">Direção do Vento</h4>
              </div>
              <div class=" mt-3">
                  <span class="fst-italic min">Atual:
                    <span class="min">
                      <img src="../icons/icon_${dados.data[dados.data.length - 1]?.value ?? "default"}.png" 
                      class="iconsWindActual"><span class="nomePonto">${nome}</span>
                    </span>
                  </span>
              </div>
              <div class="mt-2">
                <span class="fst-italic min">Anterior a Esta: 
                    <span class="min">
                      <img src="../icons/icon_${pontoDiferente}.png" 
                        class="iconsWindActual"><span  class="nomePonto">${nomeDif}
                    </span>
                </span>
              </div>
              <div class="mt-2">
                  <span class="fst-italic min">Média: 
                    <span class="min">
                      <img src="../icons/icon_${dataWindDir[0]?.maxDirection ?? "default"}.png" 
                       class="iconsWindActual"><span  class="nomePonto">${nomeMedia}
                    </span>
                  </span>
              </div>
          </div>
        </div>
      </div>`
    }
  }
  console.log(checkData2);
  if (checkData2) {
    mensagemGrafico.removeAttribute("hidden");
  }
  else {
    mensagemGrafico.setAttribute("hidden", true);
    chart.removeAttribute("hidden");
    chartjs.resetZoom();
  }
  $(div).append(tab);
}

