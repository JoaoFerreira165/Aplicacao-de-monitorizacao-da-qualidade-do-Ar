import { InfoAllByMeteobaseId, InfoTowersAll } from '/meteo/scripts/getDados.js';

var conteudo = document.getElementById("conteudo");
var mensagem = document.getElementById("mensagem");
var mensagem2 = document.getElementById("mensagem2");
var NodataHidden = document.getElementById("NodataHidden");
var restoconteudo = document.getElementById("restoconteudo");

function verifie(infos) {
    if (infos.request.status == 0 || infos.request.status == 500) {
        console.log(infos.request.status);
        conteudo.removeAttribute("hidden");
        NodataHidden.removeAttribute("hidden");
        restoconteudo.setAttribute("hidden",true);
        mensagem.innerHTML = "ERRO...";
        mensagem2.innerHTML = `Mensagem do Servidor: <span style="color: red;"> ${infos.message}</span>`;
        return;
    }
}
let infos = await InfoTowersAll();
console.log(infos);
verifie(infos);

const menuItens = [];
for (let i = 0; i < infos.data.length; i++) {
    let infos2 = await InfoAllByMeteobaseId(infos.data[i].id);
    const subItensTemp = []
    for (let a = 0; a < infos2.data.length; a++) {
        if (i == 0) {
            break;
        }
        else {
            subItensTemp.push({ text: infos2.data[a].nomeVariavel, link: `${infos2.data[a].caminho + infos2.data[a].ficheiro}.html?torre_Id=${infos2.data[a].id_torre + "&variavel_Id=" + infos2.data[a].torres_id}`, icon: `/meteo/icons/${infos2.data[a].icon}`, NomeVariavelBd1: infos2.data[a].NomeBaseDados });
        }
    }
    if (i == 0) {
        menuItens.push({ id: infos.data[i].nomeTorre, text: infos.data[i].nome, torreAssoc: infos.data[i].torreAssoc, link: infos.data[i].caminho, icon: `/meteo/icons/${infos.data[i].icon}`, active: infos.data[i].activa });

    } else {
        menuItens.push({ id: infos.data[i].nomeTorre, text: infos.data[i].nome, torreAssoc: infos.data[i].torreAssoc, link: infos.data[i].caminho, icon: `/meteo/icons/${infos.data[i].icon}`, active: infos.data[i].activa, subItens: subItensTemp })
    }
}
function criarMenu(menuItens, torre, pagina) {
    let html = "";
    menuItens.forEach(item => {
        if (item.active == 0) {
            return;
        } else {
            if (item.subItens) {
                if (item.id === torre) {

                    html += `<li class="nav-item">
                            <a class="nav-link" data-bs-target="#${item.id}-nav" data-bs-toggle="collapse" href="${item.link}">
                                <i class="bi bi-menu-button-wide"></i><span>${item.text}</span><i class="bi bi-chevron-down ms-auto"></i>
                            </a>
                            <ul id="${item.id}-nav" class="nav-content collapse show" data-bs-parent="#sidebar-nav">  `;
                    for (let j = 0; j < item.subItens.length; j++) {
                        if (item.subItens[j].link == pagina) {
                            html += `
                        <li>
                        <a href="${item.subItens[j].link}" class="active">
                        <img src="${item.subItens[j].icon}" class="iconsMenu"><span>${item.subItens[j].text}</span>
                        </a>
                        </li>`;
                        }
                        else {
                            html += `
                        <li>
                        <a href="${item.subItens[j].link}">
                        <img src="${item.subItens[j].icon}" class="iconsMenu"><span>${item.subItens[j].text}</span>
                        </a>
                            </li>`;
                        }
                    }
                    html += `</ul></li>`;
                }
                else {
                    html += `
                <li class="nav-item">
                <a class="nav-link collapsed" data-bs-target="#${item.id}-nav" data-bs-toggle="collapse" href="${item.link}">
                <i class="bi bi-menu-button-wide"></i><span>${item.text}</span><i class="bi bi-chevron-down ms-auto"></i>
                </a>
                <ul id="${item.id}-nav" class="nav-content collapse " data-bs-parent="#sidebar-nav">`;
                    for (let i = 0; i < item.subItens.length; i++) {
                        html += `
                        <li>
                            <a href="${item.subItens[i].link}" class="${item.subItens[i].active}">
                            <img src="${item.subItens[i].icon}" class="iconsMenu"><span>${item.subItens[i].text}</span>
                            </a>
                        </li>`;
                    }
                    html += `</ul></li>`;
                }
            } else {
                if (torre == "dashboard") {
                    console.log(item.icon);
                    html += `
                    <li class="nav-item">
                    <a class="nav-link active" href="${item.link}">
                    <img src="${item.icon}" class="iconsMenu"><span>${item.text}</span>
                    </a>
                    </li>`;
                }
                else {
                    html += `
                    <li class="nav-item">
                    <a class="nav-link collapsed" href="${item.link}">
                    <img src="${item.icon}" class="iconsMenu"><span>${item.text}</span>
                    </a>
                    </li>`;
                }
            }
        }
    })
    return html;
}
export { criarMenu, menuItens }
