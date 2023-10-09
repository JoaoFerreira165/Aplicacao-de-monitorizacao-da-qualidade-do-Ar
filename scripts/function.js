import { menuItens } from "/meteo/menu/menuFunction.js";
import { dataIntervalMinutos, dataIntervalDias, } from "/meteo/scripts/getDados.js";
const { jsPDF } = window.jspdf;
let result = {};
let averages = {};
let maxDirections = {};
let NodataHidden = document.getElementById("NodataHidden");
let mensagem2 = document.getElementById("mensagem2");
let mensagem = document.getElementById("mensagem");

let restoconteudo = document.getElementById("restoconteudo");
let dateStart = document.getElementById("start-date");
let dateFinish = document.getElementById("end-date");
let lastTimeRefresh = document.getElementById("LastTimeRefreshed");
let formato = {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};
let formato2 = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};
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
let checkConteudoShow = true;
let chart = document.getElementById("chart");
export let chartjs;
export function checkData(variavel, grafico, ComIntervalo, intervalo, tempoMinutos) {
  if (variavel.length == 0) {
    restoconteudo.setAttribute("hidden", true);
    NodataHidden.removeAttribute("hidden");
    mensagem.innerHTML = "Sem Dados...";
    return;
  } else {
    restoconteudo.removeAttribute("hidden");
    NodataHidden.setAttribute("hidden", true);
    addData(variavel, grafico, ComIntervalo, intervalo, tempoMinutos);
    chart.removeAttribute("hidden");
  }
}
export function DataMediaSeconds(variavel, intervalo) {
  result = {};
  averages = {};
  variavel.forEach((item) => {
    if (item.value == null) {
      return;
    } else {
      const dataHora = new Date(item.date);
      const minutos = dataHora.getSeconds();
      const roundedSeconds = Math.floor(minutos / intervalo) * intervalo;
      dataHora.setSeconds(roundedSeconds, 0, 0);
      const key = dataHora.toISOString();
      if (!result[key]) {
        result[key] = { count: 0, sum: 0 };
      }
      result[key].count++;
      result[key].sum += item.value;
    }
  });

  averages = Object.keys(result).map((key) => {
    const count = result[key].count;
    const sum = result[key].sum;
    const average = sum / count;
    return { timestamp: key, average };
  });
  return averages;
}
export function DataMediaMinutes(variavel, intervalo) {
  result = {};
  averages = {};
  variavel.forEach((item) => {
    if (item.value == null) {
      return;
    } else {
      const dataHora = new Date(item.date);
      const minutos = dataHora.getMinutes();
      const roundedMinutes = Math.floor(minutos / intervalo) * intervalo;
      dataHora.setMinutes(roundedMinutes, 0, 0);
      const key = dataHora.toISOString();
      if (!result[key]) {
        result[key] = { count: 0, sum: 0 };
      }
      result[key].count++;
      result[key].sum += item.value;
    }
  });

  averages = Object.keys(result).map((key) => {
    const count = result[key].count;
    const sum = result[key].sum;
    const average = sum / count;
    return { timestamp: key, average };
  });
  return averages;
}
export function DataMediaHours(variavel, intervalo) {
  result = {};
  averages = {};
  variavel.forEach((item) => {
    if (item.value == null) {
      return;
    } else {
      const dataHora = new Date(item.date);
      const horas = dataHora.getHours();
      const roundedHours = Math.floor(horas / intervalo) * intervalo;
      dataHora.setHours(roundedHours, 0, 0, 0);
      const key = dataHora.toISOString();

      if (!result[key]) {
        result[key] = { count: 0, sum: 0 };
      }

      result[key].count++;
      result[key].sum += item.value;
    }
  });

  averages = Object.keys(result).map((key) => {
    const count = result[key].count;
    const sum = result[key].sum;
    const average = sum / count;
    return { timestamp: key, average };
  });

  return averages;
}
export function DirecaoVentoPorIntervalo(variavel, intervalo) {
  result = {};
  maxDirections = {};
  variavel.forEach((item) => {
    if (item.value == null || typeof item.value !== "string") {
      return;
    } else {
      const dataHora = new Date(item.date);
      const horas = dataHora.getHours();
      const roundedHours = Math.floor(horas / intervalo) * intervalo;
      dataHora.setHours(roundedHours, 0, 0, 0);
      const key = dataHora.toISOString();
      if (!result[key]) {
        result[key] = {};
      }
      const direction = item.value;
      if (!result[key][direction]) {
        result[key][direction] = 0;
      }
      result[key][direction]++;
    }
  });
  maxDirections = Object.keys(result).map((key) => {
    const directions = result[key];
    let maxDirection = "";
    let maxCount = 0;

    Object.keys(directions).forEach((direction) => {
      const count = directions[direction];
      if (count > maxCount) {
        maxCount = count;
        maxDirection = direction;
      }
    });
    return { timestamp: key, maxDirection };
  });
  return maxDirections;
}
export function DirecaoVentoPorIntervaloByDay(variavel) {
  result = {};
  maxDirections = {};

  variavel.forEach((item) => {
    if (item.value === null || typeof item.value !== "string") {
      return;
    } else {
      const dataHora = new Date(item.date);
      const data = new Date(
        dataHora.getFullYear(),
        dataHora.getMonth(),
        dataHora.getDate()
      );
      const key = data.toISOString();
      if (!result[key]) {
        result[key] = {};
      }

      const direction = item.value;

      if (!result[key][direction]) {
        result[key][direction] = 0;
      }

      result[key][direction]++;
    }
  });

  maxDirections = Object.keys(result).map((key) => {
    const directions = result[key];
    let maxDirection = "";
    let maxCount = 0;

    Object.keys(directions).forEach((direction) => {
      const count = directions[direction];
      if (count > maxCount) {
        maxCount = count;
        maxDirection = direction;
      }
    });

    return { timestamp: key, maxDirection };
  });

  return maxDirections;
}
export function addData(variavel, grafico, ComIntervalo, intervalo, tempoMinutos) {
  if (ComIntervalo) {
    if (tempoMinutos) {
      var dadosMedia = DataMediaMinutes(variavel, intervalo);
      for (let i = 0; i < dadosMedia.length; i++) {
        grafico.data.labels.push(dadosMedia[i].timestamp);
        grafico.data.datasets[0].data.push(dadosMedia[i].average);
      }
    }
    else {
      var dadosMedia = DataMediaSeconds(variavel, intervalo);
      for (let i = 0; i < dadosMedia.length; i++) {
        grafico.data.labels.push(dadosMedia[i].timestamp);
        grafico.data.datasets[0].data.push(dadosMedia[i].average);
      }
    }
  } else {
    for (let i = 0; i < variavel.length; i++) {
      grafico.data.labels.push(variavel[i].date);
      grafico.data.datasets[0].data.push(variavel[i].value);
    }
  }
}
export function addGraph(variavel, intervalo, comIntervalo, tempoMinutos) {
  let dadosSerie1 = [];
  if (comIntervalo) {
    if (tempoMinutos) {
      let dadosMedia = DataMediaMinutes(variavel, intervalo);
      for (let i = 0; i < dadosMedia.length; i++) {
        dadosSerie1.push({
          x: dadosMedia[i].timestamp,
          y: dadosMedia[i].average,
        });
      }
    } else {
      let dadosMedia = DataMediaSeconds(variavel, intervalo);
      for (let i = 0; i < dadosMedia.length; i++) {
        dadosSerie1.push({
          x: dadosMedia[i].timestamp,
          y: dadosMedia[i].average,
        });
      }
    }
  } else {
    for (let i = 0; i < variavel.length; i++) {
      dadosSerie1.push({
        x: variavel[i].date,
        y: variavel[i].value,
      });
    }
  }
  return dadosSerie1;
}
export function checkConteudo() {
  if (checkConteudoShow == false) {
    gif.setAttribute("hidden", true);
    conteudo.removeAttribute("hidden");
    checkConteudoShow = true;
  } else {
    conteudo.setAttribute("hidden", true);
    gif.removeAttribute("hidden");
    checkConteudoShow = false;
  }
}
export function DadoCalc(dado) {
  if (dado.length === 0) {
    return {
      media: NaN,
      dp: NaN,
      max: NaN,
      min: NaN,
      horaMax: '-',
      horaMin: '-'
    };
  } else {
    let soma = 0,
      max = 0,
      min = 100,
      dp = 0,
      horaMax,
      horaMin;
    for (let i = 0; i < dado.length; i++) {
      if (dado[i].value == null) {
        i++;
      } else {
        soma += dado[i].value;
        if (max < dado[i].value) {
          max = dado[i].value;
          var horaMaxConv = new Date(dado[i].date);
          horaMax = horaMaxConv.toLocaleString([], formato);
        }
        if (min > dado[i].value) {
          min = dado[i].value;
          var horaMinConv = new Date(dado[i].date);
          horaMin = horaMinConv.toLocaleString([], formato);
        }
      }
    }
    let media = soma / dado.length;
    soma = 0;
    for (var i = 0; i < dado.length; i++) {
      soma += (dado[i].value - media) ** 2;
    }
    dp = Math.sqrt(soma / dado.length);
    if (horaMax === undefined) {
      horaMax = " --- ";
    }
    return {
      media: media,
      dp: dp,
      max: max,
      min: min,
      horaMax: horaMax,
      horaMin: horaMin,
    };
  }
}
export function createTable(dado, variavel, tabela, grandeza) {
  const values = DadoCalc(dado);
  let tab = `
    <thead class="table-primary table-bordered border-secondary" >
    <tr>
        <th>Variavel</th>
        <th>Média</th>
        <th>Desvio Padrão</th>
        <th>Máximo</th>
        <th>Mínimo</th>
    </tr>
    </thead>
    <tbody>
        <tr> 
            <td style="font-size: 11pt">${variavel} (${grandeza} )</td>
            <td>${values.media.toFixed(2)}</td>
            <td>${values.dp.toFixed(2)}</td>
            <td>${values.max.toFixed(2)}</td>
            <td>${values.min.toFixed(2)}</td>
        </tr>
    </tbody>`;
  document.getElementById(tabela).innerHTML = tab;
  document.getElementById("MaxValue").innerHTML = values.max.toFixed(2);
  document.getElementById("MinValue").innerHTML = values.min.toFixed(2);
  document.getElementById("dateMaxValue").innerHTML = values.horaMax;
  document.getElementById("dateMinValue").innerHTML = values.horaMin;
}
export async function createCompareDiv(div, torreAtual, infos) {
  let divCompare = "";
  let id = 1;
  for (let j = 0; j < menuItens.length; j++) {
    if (menuItens[j].id == torreAtual) {
      id = j;
    }
  }
  for (let i = 0; i < infos.length; i++) {
    console.log(infos[i].activa);
    if (
      infos[i].nomeTorre != torreAtual &&
      infos[i].nomeVariavel != "Dashboard" && infos[i].activa == 1
    ) {
      divCompare += `
                <div class="compare">
                    <span class="torre">
                        ${infos[i].nome
        }<span class="LastValue" id="LastValueDivCompare${i}"><br></span>
                    </span>
                    <div class="buttonsOpenCompare">
                        <button type="button" onclick="window.open('${infos[i].caminho + infos[i].ficheiro
        }.html?torre_Id=${infos[i].id_torre + "&variavel_Id=" + infos[i].torres_id
        }','_blank');"  class="btn btn-sm btn-outline-primary rounded openPage">Abrir</button>
                        <button type="button" id="abrirModal${i}" data="${menuItens[id].text
        }" data2="${infos[i].nome}" data3="${infos[i].torreAssoc}" data4="${infos[i].NomeBaseDados
        }" class="btn btn-sm btn-outline-primary rounded">Comparar</button>
                    </div>
                </div>`;
    }
  }
  document.getElementById(div).innerHTML = divCompare;
}
export function creatBodyModal(torreEsq, torreDir, dadoTorreEsq, dadoTorreDir) {
  const valuesTorreEsq = DadoCalc(dadoTorreEsq);
  const valuesTorreDir = DadoCalc(dadoTorreDir);
  let x;
  document.getElementById("torreEsq").innerHTML = torreEsq;
  document.getElementById("torreDir").innerHTML = torreDir;
  if (dadoTorreEsq.length == 0 || dadoTorreDir.length == 0) {
    x = `<h3 class="AlertNodata"> NO DATA </h3>`;
  } else {
    x = `
            <div class="value-comparison border-top">
                <div class="valueDiv">
                    <p class="value">${dadoTorreEsq[
        dadoTorreEsq.length - 1
      ].value.toFixed(2)}</p>
                </div>
                <div class="valueDiv">
                    <h3>Atual</h3>
                 </div>
                <div class="valueDiv">
                <p class="value">${dadoTorreDir[
        dadoTorreDir.length - 1
      ].value.toFixed(2)}</p>
                </div>
            </div>
            <div class="value-comparison border-top border-bottom">
                <div class="valueDiv">
                    <p class="value">${valuesTorreEsq.media.toFixed(2)}</p>
                </div>
                <div class="valueDiv">
                    <h3>Média</h3>
                </div>
                <div class="valueDiv">
                    <p class="value">${valuesTorreDir.media.toFixed(2)}</p>
                </div>
            </div>
            <div class="value-comparison border-top border-bottom">
                <div class="valueDiv">
                    <p class="value">${valuesTorreEsq.max.toFixed(2)}</p>
                </div>
                <div class="valueDiv">
                    <h3>Máximo</h3>
                </div>
                <div class="valueDiv">
                    <p class="value">${valuesTorreDir.max.toFixed(2)}</p>
                </div>
            </div>
            <div class="value-comparison border-top border-bottom">
                <div class="valueDiv">
                    <p class="value">${valuesTorreEsq.min.toFixed(2)}</p>
                </div>
                <div class="valueDiv">
                    <h3>Mínimo</h3>
                </div>
                <div class="valueDiv">
                    <p class="value">${valuesTorreDir.min.toFixed(2)}</p>
                </div>
            </div>
            <div class="value-comparison border-top border-bottom">
                <div class="valueDiv">
                    <p class="value">${valuesTorreEsq.dp.toFixed(2)}</p>
                </div>
                <div class="valueDiv">
                    <h3>Desvio Padrão</h3>
                </div>
                <div class="valueDiv">
                <p class="value">${valuesTorreDir.dp.toFixed(2)}</p>
                </div>
            </div>
                <p></p>
        </div>
            `;
  }
  document.getElementById("conteudoModal").innerHTML = x;
}
export function graficos(nomeVariavel) {
  //Chart Temperatura
  chartjs = new Chart(chart, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: nomeVariavel,
          backgroundColor: "rgb(141, 191, 255)",
          borderColor: "blue",
          backgroundColor: "rgb(141, 191, 255)",
          fill: false,
          //spanGaps: true,
          //pointRadius: 0
          spanGaps: true,
          showLine: false,
        },
      ],
    },
    options: optionsGraphs,
  });
}
export function graficosWind(nomeVariavel) {
  //Chart Temperatura
  chartjs = new Chart(chart, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: nomeVariavel,
          backgroundColor: "rgb(141, 191, 255)",
          borderColor: "blue",
          backgroundColor: "rgb(141, 191, 255)",
          fill: false,
          spanGaps: true,
          pointRadius: 0,
        },
      ],
    },
    options: optionsGraphs,
  });
}
export function ResetZoom() {
  chartjs.resetZoom();
}
export function setDateInputs(dias, hora, minutos) {
  var date = new Date();
  date.setDate(date.getDate() - dias);
  date.setHours(date.getHours() + 1 - hora);
  date.setMinutes(date.getMinutes() - minutos);
  dateStart.value = date
    .toISOString()
    .slice(0, new Date().toISOString().lastIndexOf(":"));
  var xdate = new Date();
  xdate.setHours(xdate.getHours() + 1);
  dateFinish.value = xdate
    .toISOString()
    .slice(0, xdate.toISOString().lastIndexOf(":"));
}
export function createTableShowData(dado, tabela, grandeza) {
  var dadosMedia = DataMediaMinutes(dado, 60);
  let tabShowData = `<thead>
        <tr>
            <th scope="col">Hora</th>                                
            <th scope="col">Valor</th>
        </tr>
    </thead>
    <tbody>`;
  let x = 1;
  let dataTempo;
  for (let i = 0; i < dadosMedia.length; i++) {
    if (x > 3) {
      x = 0;
      i = dadosMedia.length;
    } else {
      dataTempo = new Date(dadosMedia[dadosMedia.length - x].timestamp);
      tabShowData += `
          <tr>
              <td>${dataTempo.toLocaleString([], formato2)}</td>
              <td>${dadosMedia[dadosMedia.length - x].average.toFixed(2) + " " + grandeza}</td>
          </tr>`;
      x++;
    }
  }
  tabShowData += `
    </tbody>`;
  document.getElementById(tabela).innerHTML = tabShowData;
}
export function creatBodyModalMostrarMaisDados(torreAtual, dadoTorreAtual, cadenciaDados, grandeza) {
  document.getElementById("torreAtualModal").innerHTML = torreAtual;
  let x;
  x = `<table class="table table-hover table-bordered border-secondary text-center">
            <thead>
                <tr>
                    <th>Hora</th>                                
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>`;

  if (dadoTorreAtual.length > 0) {
    const valores = DataMediaMinutes(dadoTorreAtual, cadenciaDados);
    for (let i = 0; i < valores.length; i++) {
      var hora = new Date(valores[i].timestamp);
      x += `
            <tr>
                <td>${hora.toLocaleString()}</td>
                <td>${valores[i].average.toFixed(2) + " " + grandeza}</td>
            </tr>
            `;
    }
    x += `</tbody>`;
  } else {
    x = `<h3 class="AlertNodata"> NO DATA </h3>`;
  }
  document.getElementById("conteudoModalMostrarMaisDados").innerHTML = x;
}
export function distime() {
  var now = new Date();
  var sDateTime = now.toLocaleString();
  lastTimeRefresh.innerHTML = sDateTime;
}
export function checkDados(dado) {
  if (dado.request.status == 500) {
  gif.setAttribute("hidden", true);
  restoconteudo.setAttribute("hidden", true);

    mensagem.innerHTML = "ERRO...";
    if (dado.response.data === "Status(StatusCode=\"ResourceExhausted\", Detail=\"Received message exceeds the maximum configured message size.\")") {
      mensagem2.innerHTML = `Mensagem do Servidor: <span style="color: red;"> O intervalo de tempo configurado excede o tamanho máximo configurado.</span>`;
    }
    else {
      mensagem2.innerHTML = `Mensagem do Servidor: <span style="color: red;"> ${dado.response.data}</span>`;
    }
    if (dado.response.data.code === "ECONNREFUSED") {
      mensagem2.innerHTML = `Mensagem do Servidor: <span style="color: red;"> ${dado.response.data.message}<p> Servidor da base de dados dos dados adquiridos em baixo!</p></span>`;
    }
    NodataHidden.removeAttribute("hidden");
    conteudo.removeAttribute("hidden");
    return true;
  }
  else if (dado.request.status == 401) {
    gif.setAttribute("hidden", true);
    restoconteudo.setAttribute("hidden", true);
    mensagem.innerHTML = "ERRO...";
    mensagem2.innerHTML = `Mensagem do Servidor: <span style="color: red;"> ${dado.message + "\n" + dado.response.statusText}</span>`;
    NodataHidden.removeAttribute("hidden");
    conteudo.removeAttribute("hidden");
    return true;
  }
  else if (dado.request.status == 0) {
    gif.setAttribute("hidden", true);
    restoconteudo.setAttribute("hidden", true);	
    mensagem.innerHTML = "ERRO...";
    mensagem2.innerHTML = `Mensagem do Servidor: <span style="color: red;"> ${dado.message}</span>`;
    NodataHidden.removeAttribute("hidden");
    conteudo.removeAttribute("hidden");
    return true;
  }
  else if (dado.data.length == 0) {
    gif.setAttribute("hidden", true);
    restoconteudo.setAttribute("hidden", true);
    mensagem.innerHTML = "Sem Dados...";
    var horaStartConv = new Date(dateStart.value);
    var horaEndConv = new Date(dateFinish.value);
    mensagem2.innerHTML = `Não foram resgistados dados entre ${horaStartConv.toLocaleString([], formato)} e ${horaEndConv.toLocaleString([], formato)}`;
    NodataHidden.removeAttribute("hidden");
    conteudo.removeAttribute("hidden");
    return true;
  }
  else {
    return false;
  }
}
export async function refreshOtherTowers(infosVariaveisByName, nomeTorreAtual, minutos, grandeza) {
  for (let i = 0; i < infosVariaveisByName.data.length; i++) {
    if (infosVariaveisByName.data[i].nomeTorre != nomeTorreAtual &&
      infosVariaveisByName.data[i].activa == 1
    ) {
      const dataTorre = await dataIntervalMinutos(
        infosVariaveisByName.data[i].torreAssoc,
        infosVariaveisByName.data[i].NomeBaseDados,
        minutos
      );
      if (dataTorre.request.status == 500) {
        document.getElementById(`LastValueDivCompare${i}`).innerHTML =
          "<br>" + "<span class='AlertNodata2'>Sem dados</span>";
      } else if (dataTorre.data.length == 0) {
        document.getElementById(`LastValueDivCompare${i}`).innerHTML =
          "<br>" + "<span class='AlertNodata2'>Sem dados</span>";
      } else {
        document.getElementById(`LastValueDivCompare${i}`).innerHTML =
          "<br>" +
          dataTorre.data[dataTorre.data.length - 1].value.toFixed(2) +
          grandeza;
      }
    }
  }
}
export async function refreshOtherTowersByDate(infosVariaveisByName, nomeTorreAtual, start, end, grandeza) {
  for (let i = 0; i < infosVariaveisByName.data.length; i++) {
    if (
      infosVariaveisByName.data[i].nomeTorre != nomeTorreAtual &&
      infosVariaveisByName.data[i].activa == 1
    ) {
      const dataTorre = await dataIntervalDias(
        infosVariaveisByName.data[i].torreAssoc,
        infosVariaveisByName.data[i].NomeBaseDados,
        start,
        end
      );
      if (dataTorre.request.status == 500) {
        document.getElementById(`LastValueDivCompare${i}`).innerHTML =
          "<br>" + "<span class='AlertNodata2'>Sem dados</span>";
      } else if (dataTorre.data.length == 0) {
        document.getElementById(`LastValueDivCompare${i}`).innerHTML =
          "<br>" + "<span class='AlertNodata2'>Sem dados</span>";
      } else {
        document.getElementById(`LastValueDivCompare${i}`).innerHTML =
          "<br>" +
          dataTorre.data[dataTorre.data.length - 1].value.toFixed(2) +
          grandeza;
      }
    }
  }
}
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}
function formatDate2(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}-${month}-${year},${hours}h${minutes}s`;
}
export function exportToCSV(data, bucket, field, grandeza) {
  const header = `Bucket:  ${bucket};;; Field:  ${field};;; Registros:  ${data.length}\n`;
  const header2 = `Start:  ${formatDate(data[0].date)};;; End:  ${formatDate(data[data.length - 1].date)}\n`;
  const csvContent = "data:text/csv;charset=utf-8," + header + header2 + `Date;;Value (${grandeza})\n` + data.map(obj => `${formatDate(obj.date)};;${obj.value}`).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  var start = formatDate2(data[0].date);
  var end = formatDate2(data[data.length - 1].date);
  link.setAttribute("download", `${bucket}_${field}_${start}_${end}.csv`);
  document.body.appendChild(link);
  link.click();
}
export function convertHTMLtoPDF2(data, bucket, field, grandeza) {
  const tableData = data.map(obj => {
    return [formatDate(obj.date), obj.value];
  });
  let yPos = 20;
  const doc2 = new jsPDF();
  doc2.setFontSize(13);
  doc2.text("Dados", 90, yPos);
  yPos += 10;
  doc2.text(`Torre: ${bucket}`, 10, yPos);
  doc2.text(`Variável: ${field}`, 80, yPos);
  doc2.text(`Registos: ${data.length}`, 150, yPos);
  yPos += 10;
  doc2.text(`Start: ${formatDate(data[0].date)}`, 20, yPos);
  doc2.text(`End: ${formatDate(data[data.length - 1].date)}`, 120, yPos);
  yPos += 5;
  doc2.autoTable({
    startY: yPos,
    head: [['Data', `Value (${grandeza})`]],
    body: tableData,
    theme: 'grid',
  })
  var start = formatDate2(data[0].date);
  var end = formatDate2(data[data.length - 1].date);
  doc2.save(`${bucket}_${field}_${start}_${end}.pdf`);
}

