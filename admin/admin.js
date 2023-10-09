import { InfoTowersAll, InfoVariaveisId, InfoTowersById, InfoAllByMeteobaseId, InfoVariaveis, InfoTorres, DeleteVarTower, DeleteTowerById, DeleteVariavel, addVarTower, InfoReadVariaveisById, DeleteLocalizacao, InfoLocalizacaoId, InfoLocalizacao } from '../scripts/getDados.js';
async function CheckLogin() {
    const token = localStorage.getItem('tokenLogin');
    if (!token) {
        window.location.href = '../login/login.html';
        return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    try {
        const response = await axios.get('http://localhost:3000/meteo/auth/admin/check', { headers });
        console.log(response);
        if (response.status !== 200) {
            window.location.href = '../login/login.html';
        }
    } catch (error) {
        console.error(error);
        window.location.href = '../login/login.html';
    }
}
$(document).ready(function () {
    $('#btnBack').on('click', async function () {
        localStorage.clear('tokenLogin');
        console.log(localStorage.getItem('tokenLogin'))
        const token = localStorage.getItem('tokenLogin');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            const response = await axios.get('http://localhost:3000/meteo/auth/admin/check', { headers });
            console.log(response);
            if (response.status !== 200) {
                window.location.href = '../login/login.html';
            }
        } catch (error) {
            console.error(error);
            window.location.href = '../login/login.html';
        }
    })
});
CheckLogin();
var x = document.getElementById("btn_addRow");
var btn_addtoTable = document.getElementById("btn_addtoTable");
var btn_addtoTableVar = document.getElementById("btn_addtoTableVar");
var btn_deletefromTable = document.getElementById("btn_deletefromTable");
var btn_deletefromTableVar = document.getElementById("btn_deletefromTableVar");
var btn_addtoTableEdit = document.getElementById("btn_editTable");
var btn_openModal = document.getElementById("openModal");
var btn_openModalVar = document.getElementById("openModalVar");
let infos = await InfoTowersAll();
var visibilidadeInfovaria = document.getElementById("infoNovasVariaveis");
let conta = 0;
let variaveisSelect;
let id_novaTorre;

var value = $("#form_Variaveis").val();
$("#form_Variaveis").on('keyup change click', function () {
    if (this.value > value) {
        console.log("changed");
        value = this.value;
    }
});
$("#form_Variaveis").on('keydown change click', function () {
    if (this.value < value) {
        console.log("changedxx");
        value = this.value;
    }
});

//dinamica para adicionar e remover variaveis no modal de adicionar e editar
$(document).ready(function () {
    const adicionarLinha = async function () {
        if ($('#form_Variaveis').val() == 0) {
            $('#form_Variaveis').val(1);
        } else {
            $('#form_Variaveis').val(parseInt($('#form_Variaveis').val()) + 1);
        }
        variaveisSelect = await InfoVariaveis();
        let htmlSelect;
        htmlSelect = ` <div class="col-md-6 position-relative mb-1">
        <select class="form-select" id="form_NomeVariavelAssoc${conta}" aria-label="Default select example">
            <option selected disabled>Variavel Associada</option>`;
        for (let i = 2; i < variaveisSelect.data.length; i++) {
            htmlSelect += `<option value="${variaveisSelect.data[i].variavel_id}">${variaveisSelect.data[i].nomeVariavel}(${variaveisSelect.data[i].NomeBaseDados})</option>`;
        }
        htmlSelect += `</select></div>`;
        visibilidadeInfovaria.removeAttribute("hidden");
        $('#form_name').append(htmlSelect);
        conta++;
    };
    const removerLinha = function () {
        $('#form_name').children().last().remove();
        if ($('#form_Variaveis').val() - 1 >= 0) {
            $('#form_Variaveis').val($('#form_Variaveis').val() - 1);
        } else {
            return;
        }
    };
    $('#adicionar-linha').click(adicionarLinha);
    $('#remover-linha').click(removerLinha);
});
$(document).ready(function () {
    const adicionarLinha = async function () {
        if ($('#form_VariaveisEdit').val() == 0) {
            $('#form_VariaveisEdit').val(1);
        } else {
            $('#form_VariaveisEdit').val(parseInt($('#form_VariaveisEdit').val()) + 1);
        }
        variaveisSelect = await InfoVariaveis();
        console.log(variaveisSelect);
        let htmlSelect;
        htmlSelect = ` <div class="col-md-6 position-relative mb-1">
        <select class="form-select" id="form_NomeVariavelAssocEdit${contaEdit}" aria-label="Default select example">
            <option selected disabled>Variavel Associada</option>`;
        for (let i = 2; i < variaveisSelect.data.length; i++) {
            htmlSelect += `<option value="${variaveisSelect.data[i].variavel_id}">${variaveisSelect.data[i].nomeVariavel}(${variaveisSelect.data[i].NomeBaseDados})</option>`;
        }
        htmlSelect += `</select></div>`;
        visibilidadeInfovaria.removeAttribute("hidden");
        $('#form_nameEdit').append(htmlSelect);
        contaEdit++;
    };
    const removerLinha = function () {
        $('#form_nameEdit').children().last().remove();
        if ($('#form_VariaveisEdit').val() - 1 >= 0) {
            $('#form_VariaveisEdit').val($('#form_VariaveisEdit').val() - 1);
        } else {
            return;
        }
    };
    $('#adicionar-linhaEdit').click(adicionarLinha);
    $('#remover-linhaEdit').click(removerLinha);
});

//abrir modal de adicionar
function openModal() {
    var meuSelect = document.getElementById('form_estado');
    meuSelect.selectedIndex = 0;
    conta = 0;
    $('#form_NomeTorre').val('');
    $('#form_TorreAssoc').val('');
    $('#form_Variaveis').val('');
    $('#form_estado').prop('selectedIndex', 0);
    $('#form_NomeCidade').val('');
    $('#form_NomeFreguesia').val('');
    $('#form_NomeRua').val('');
    $('#form_NomeLocal').val('');
    $('#form_coordenadas').val('');
    $('#form_name').empty();
    $('#myModal').modal('show');
}
btn_openModal.addEventListener('click', openModal);
let infoTorres = await InfoTorres();
var contador;
if (infoTorres.data.length > 0) {
    contador = parseInt(infoTorres.data[infoTorres.data.length - 1].torres_id) + 1;
}
else {
    contador = 0;
}

//adicionar nova Torre 
async function addLine() {
    id_novaTorre = infos.data[infos.data.length - 1].id + 1;
    const numLinhas = $('#form_name').children().length;
    var valornomeTorre = "torre" + id_novaTorre;
    var caminho = "/meteo/geral/";
    var valorNome = document.getElementById("form_NomeTorre").value;
    var valorTorreAssoc = document.getElementById("form_TorreAssoc").value;
    var valorEstado = document.getElementById("form_estado").value;
    var icon = "";
    var valorNumVaria = document.getElementById("form_Variaveis").value;
    var numeroPag = parseInt(valorNumVaria);
    var cidade = document.getElementById("form_NomeCidade").value;
    var freguesia = document.getElementById("form_NomeFreguesia").value;
    var local = document.getElementById("form_NomeLocal").value;
    var rua = document.getElementById("form_NomeRua").value;
    var coordenadas = document.getElementById("form_coordenadas").value;
    console.log(cidade)
    console.log(local)
    await axios.post('http://localhost:3000/meteo/meteobase/insert', { id_novaTorre, valornomeTorre, valorNome, caminho, icon, valorTorreAssoc, numeroPag, valorEstado })
        .then((response) => {
            console.log('Dados inseridos na tabela com sucesso.');
        })
        .catch((error) => {
            console.error('Erro ao inserir dados na tabela: ' + error.message);
        });
    var varAssoc = 1;
    addVarTower(contador, id_novaTorre, varAssoc);
    for (let i = 0; i < numLinhas; i++) {
        var varAssoc = document.getElementById(`form_NomeVariavelAssoc${i}`).value;
        contador++;
        addVarTower(contador, id_novaTorre, varAssoc)
    }
    if (cidade === "" && local === "" && freguesia === "") {
        console.log("nao inserir");
    }
    else {
        await axios.post('http://localhost:3000/meteo/localizacao/insert', {
            id_novaTorre,
            cidade, local, freguesia, rua, coordenadas
        })
            .then((response) => {
                console.log('Dados inseridos na tabela com sucesso.');
            })
            .catch((error) => {
                console.error('Erro ao inserir dados na tabela: ' + error.message);
            });
    }

    createTableTowers();
    var modal = document.getElementById("myModal");
    var bsModal = bootstrap.Modal.getInstance(modal);
    bsModal.hide();
}
btn_addtoTable.addEventListener("click", addLine)
let contaEdit = 0;
let index;
let indexVar;
let infosId;

//gerar tabela com todas as torres
async function createTableTowers() {
    infos = await InfoTowersAll();
    console.log(infos);
    $('#tabelaTorres tbody > tr').remove();
    var tabela = $('#tabelaTorres');
    // Cria uma nova linha com as células desejadas
    let x;
    for (var i = 1; i < infos.data.length; i++) {
        var localiz = await InfoLocalizacaoId(infos.data[i].id);
        console.log(localiz)
        let local = "";
        let cidade = "";
        let freguesia = "";
        let join;
        let infoloc = "";
        if (localiz.data.length == 0) {
            local = "Sem informação";
            cidade = "Sem informação";
            freguesia = "Sem informação";
            join = "Sem informação"
            infoloc = `<p class="fw-normal mb-1">${local}</p>`;
        }
        else {
            local = localiz.data[0].local;
            cidade = localiz.data[0].cidade;
            freguesia = localiz.data[0].freguesia;
            join = freguesia + ", " + cidade;
            infoloc = `<p class="fw-normal mb-1">${local}</p>
            <p class="text-muted mb-0">${join}</p>`;
        }
        if (infos.data[i].activa == 1) {
            x = `<td>
             <span class="badge rounded-pill bg-success ">Ativa</span>
                </td>`;
        }
        else {
            x = `<td>
             <span class="badge rounded-pill bg-danger ">Desativa</span>
                </td>`;
        }
        let infos2 = await InfoAllByMeteobaseId(infos.data[i].id);
        let variaveis = "";
        for (var j = 0; j < infos2.data.length; j++) {
            if (infos2.data[j].nomeVariavel == "Info") {
                variaveis += " ";
            } else {
                variaveis += infos2.data[j].nomeVariavel + "&nbsp&nbsp | &nbsp&nbsp";
            }
        }
        let linhaEscondida = `<tr class="hidden-rows${i} collapse">
        <td colspan="1">Variáveis:</td>
        <td colspan="4">${variaveis}</td>
    </tr>`;
        var novaLinha = $(` 
        <tr>
            <td data-bs-toggle="collapse" data-bs-target=".hidden-rows${i}">
                <div class="d-flex align-items-center nomeTorre">
                    <i class="bi bi-chevron-down"></i>
                    <div class="ms-3">
                        <span class="fw-bold mb-1">${infos.data[i].nome}</span>
                    </div>
                </div>
            </td>
            <td>
                ${infoloc}
            </td>
            <td>
                <span>${infos.data[i].torreAssoc}</span>
            </td>
            <td>
                <span>${infos.data[i].paginas}</span>
            </td>
            ${x}
            <td>
                <button type="button" class="btn btn-outline-primary btn-rounded btn-editar" id="btnEdit${infos.data[i].id}">
                    Editar
                </button>
                <button type="button" class="btn btn-outline-primary btn-rounded" id="btnDelete${infos.data[i].id}">
                    Apagar
                </button>
            </td>
        </tr>
        ${linhaEscondida}
        `);
        tabela.append(novaLinha);
    }
}
createTableTowers()

//abrir modal de ediçao a aparecer as informaçoes automaticamente
$('#tabelaTorres').on('click', 'button[id^="btnEdit"]', async function (event) {
    contaEdit = 0;
    const buttonId = event.target.id; // Obter o ID do botão clicado
    index = buttonId.replace("btnEdit", ""); // Obter o índice do botão a partir do ID
    console.log(`Botão Editar ${index} clicado!`);
    infosId = await InfoAllByMeteobaseId(index);
    let infosloc = await InfoLocalizacaoId(infosId.data[0].id)
    console.log(infosId);
    console.log(infosloc);
    document.getElementById('infoNovasVariaveisEdit').removeAttribute("hidden");
    variaveisSelect = await InfoVariaveis();
    $('#form_IdTorreEdit').val(infosId.data[0].id);
    $('#form_NomeTorreEdit').val(infosId.data[0].nome);
    $('#form_TorreAssocEdit').val(infosId.data[0].torreAssoc);
    $('#form_estadoEdit').val(infosId.data[0].activa);
    $('#form_NomeCidadeEdit').val(infosloc.data[0]?.cidade);
    $('#form_NomeFreguesiaEdit').val(infosloc.data[0]?.freguesia);
    $('#form_NomeLocalEdit').val(infosloc.data[0]?.local);
    $('#form_NomeRuaEdit').val(infosloc.data[0]?.rua);
    $('#form_coordenadasEdit').val(infosloc.data[0]?.coordenadas);
    $('#form_nameEdit').empty();
    if (infosId.data.length == 0 || infosId.data.length == 1) {
        $('#form_VariaveisEdit').val(0);
        $('#myModalEdit').modal('show');
    } else {
        $('#form_VariaveisEdit').val(infosId.data.length - 1);
        for (let j = 0; j < infosId.data.length; j++) {
            let variavelEncontrada = false;
            let selectOptions = "";
            if (infosId.data[j].nomeVariavel == "Info") {
                j++;
            }
            for (let i = 2; i < variaveisSelect.data.length; i++) {
                const variavel = variaveisSelect.data[i];
                if (infosId.data[j].nomeVariavel == variavel.nomeVariavel) {
                    selectOptions += `<option selected value="${infosId.data[j].id_variavel}">${infosId.data[j].nomeVariavel}(${infosId.data[j].NomeBaseDados})</option>`;
                    variavelEncontrada = true;
                } else if (variavelEncontrada) {
                    selectOptions += `<option value="${variavel.variavel_id}">${variavel.nomeVariavel}(${variavel.NomeBaseDados})</option>`;
                }
                else {
                    selectOptions += `<option value="${variavel.variavel_id}">${variavel.nomeVariavel}(${variavel.NomeBaseDados})</option>`;
                }
            }
            const htmlSelect = `
            <div class="col-md-6 mt-2">
            <select class="form-select" id="form_NomeVariavelAssocEdit${contaEdit}" aria-label="Default select example">
            <option disabled>Variavel Associada</option>
            ${selectOptions}
            </select>
            </div>
            `;
            $('#form_nameEdit').append(htmlSelect);
            contaEdit++;
        }
        $('#myModalEdit').modal('show');
    }
});
let buttonId

async function updateLine() {
    const numLinhas = $('#form_nameEdit').children().length;
    let infoTorresEdit = await InfoTorres();
    var contador;
    if (infoTorresEdit.data.length > 0) {
        contador = parseInt(infoTorresEdit.data[infoTorresEdit.data.length - 1].torres_id) + 1;
    }
    else {
        contador = 0;
    }
    infos = await InfoTowersById(index);
    console.log(infos);
    var id_torre = document.getElementById("form_IdTorreEdit").value;
    var valornomeTorre = "torre" + id_torre;
    var caminho = "/meteo/geral/";
    var valorNome = document.getElementById("form_NomeTorreEdit").value;
    var valorTorreAssoc = document.getElementById("form_TorreAssocEdit").value;
    var valorEstado = document.getElementById("form_estadoEdit").value;
    var cidade = document.getElementById("form_NomeCidadeEdit").value;
    var freguesia = document.getElementById("form_NomeFreguesiaEdit").value;
    var local = document.getElementById("form_NomeLocalEdit").value;
    var rua = document.getElementById("form_NomeRuaEdit").value;
    var coordenadas = document.getElementById("form_coordenadasEdit").value;
    var icon = "";
    var numeroPag = numLinhas;
    await axios.put('http://localhost:3000/meteo/meteobase/editById', { id_torre, valornomeTorre, valorNome, caminho, icon, valorTorreAssoc, numeroPag, valorEstado })
        .then((response) => {
            console.log('Dados atualizados na tabela com sucesso.');
            console.log(response)
        })
        .catch((error) => {
            console.error('Erro ao atualizar dados na tabela: ' + error.message);
        });
    let infosloc = await InfoLocalizacaoId(infosId.data[0].id)
    if (infosloc.data.length == 0) {
        let id_novaTorre = id_torre;
        await axios.post('http://localhost:3000/meteo/localizacao/insert', {
            id_novaTorre, cidade, local, freguesia, rua, coordenadas
        })
            .then((response) => {
                console.log('Dados inseridos na tabela com sucesso.');
            })
            .catch((error) => {
                console.error('Erro ao inserir dados na tabela: ' + error.message);
            });

    } else {
        await axios.put('http://localhost:3000/meteo/localizacao/editById', { id_torre, cidade, local, freguesia, rua, coordenadas })
            .then((response) => {
                console.log('Dados atualizados na tabela com sucesso.');
                console.log(response)
            }).catch((error) => { console.error('Erro ao atualizar dados na tabela: ' + error.message); });
    }

    let infosTowersVar = await InfoAllByMeteobaseId(infos.data[0].id);
    console.log(index);
    console.log(infosTowersVar);
    for (let i = 0; i < infosTowersVar.data.length; i++) {
        await DeleteVarTower(infosTowersVar.data[i].torres_id);
    }
    var varAssoc = 1;
    let id_novaTorre = id_torre;
    addVarTower(contador, id_novaTorre, varAssoc)
    console.log(numLinhas);
    for (let i = 0; i < numLinhas; i++) {
        console.log(document.getElementById(`form_NomeVariavelAssocEdit${i}`).value);
        var varAssoc = document.getElementById(`form_NomeVariavelAssocEdit${i}`).value;
        console.log(varAssoc);
        contador++;
        addVarTower(contador, id_novaTorre, varAssoc)
    }
    createTableTowers();
    contaEdit = 0;
    $('#myModalEdit').modal('hide');
}
//abrir modal para apagar uma torre selecionada
$('#tabelaTorres').on('click', 'button[id^="btnDelete"]', async function (event) {
    buttonId = event.target.id; // Obter o ID do botão clicado
    index = buttonId.replace("btnDelete", ""); // Obter o índice do botão a partir do ID
    infos = await InfoTowersById(index);
    console.log(infos);
    console.log(`Botão delete ${index} clicado!`);
    $('#modalDeletebody').empty();
    let html = '';
    html = `<div class=""><h5>Vai eliminar a <span style="color: red">${infos.data[0].nome}</span> da base de dados...</h5></div>`;
    $('#modalDeletebody').append(html)
    $('#myModalDelete').modal('show');
});

if (btn_addtoTableEdit) {
    btn_addtoTableEdit.addEventListener("click", updateLine)
}
//apagar a torre selecionada
async function deleteLine() {
    console.log(infos.data);
    console.log(index);
    let infosTowersVar = await InfoAllByMeteobaseId(infos.data[0].id);
    console.log(infosTowersVar)
    for (let i = 0; i < infosTowersVar.data.length; i++) {
        await DeleteVarTower(infosTowersVar.data[i].torres_id);
    }
    console.log(infosTowersVar);
    await DeleteLocalizacao(infosTowersVar.data[0].id);
    await DeleteTowerById(infosTowersVar.data[0].id);
    createTableTowers();
    $('#myModalDelete').modal('hide');
}
btn_deletefromTable.addEventListener("click", deleteLine);

let infosVariaveis;
//gerar tabela com todas as Variaveis
async function createTableVariaveis() {
    infosVariaveis = await InfoVariaveis();
    $('#tabelaVariaveis tbody > tr').remove();
    var tabela = $('#tabelaVariaveis');
    // Cria uma nova linha com as células desejadas
    for (var i = 2; i < infosVariaveis.data.length; i++) {
        var novaLinha = $(` 
        <tr>
            <td>
                <div class="nomeTorre">
                        <span class="fw-bold mb-1">${infosVariaveis.data[i].nomeVariavel}</span>
                </div>
            </td>
            <td>
                <p class="fw-normal mb-1">${infosVariaveis.data[i].NomeBaseDados}</p>
            </td>
            <td>
                <span>${infosVariaveis.data[i].nomeVariavel2}</span>
            </td>
            <td>
                <span>${infosVariaveis.data[i].NomeBaseDados2}</span>
            </td>
            <td>
                <span>${infosVariaveis.data[i].ficheiro}</span>
            </td>
            <td>
                <img src="${"/meteo/icons/" + infosVariaveis.data[i].icon}" class="iconsWindTableIndex">
            </td>
            <td>
                <span>${infosVariaveis.data[i].grandeza}</span>
            </td>
            <td>
                <button type="button" class="btn btn-outline-primary btn-rounded" id="btnDeleteVar${infosVariaveis.data[i].variavel_id}">
                    Apagar
                </button>
            </td>
        </tr>`);

        tabela.append(novaLinha);
    }
}
createTableVariaveis()
//abrir modal de adicionar Variavel
function openModalVar() {
    $('#myModalAddVariavel').modal('show');
}
btn_openModalVar.addEventListener('click', openModalVar);
//adicionar nova Variável 
async function addVariable(event) {
    event.preventDefault();
    var nomeVariavel = document.getElementById("form_NomeVar").value;
    var nomeBaseDados = document.getElementById("form_VarAssoc").value;
    var nomeVariavel2 = document.getElementById("form_NomeVar2").value;
    var nomeBaseDados2 = document.getElementById("form_VarAssoc2").value;
    var ficheiro = document.getElementById("form_NomeFicheiro").value;
    var grandeza = document.getElementById("form_Grandeza").value;
    var nomeNormalizado = nomeVariavel.toLowerCase();
    const file = document.getElementById('iconInput');
    let newName;
    if (file.files.length > 0) {
        newName = 'icon_' + file.files[0].name;
    }
    else {
        newName = 'icon_default.png';
    }
    var icon = newName;
    await axios.post('http://localhost:3000/meteo/variaveis/insert', { nomeVariavel, nomeBaseDados, nomeVariavel2, nomeBaseDados2, nomeNormalizado, ficheiro, icon, grandeza })
        .then((response) => {
            console.log('Dados inseridos na tabela com sucesso.');
        })
        .catch((error) => {
            console.error('Erro ao inserir dados na tabela: ' + error.message);
        });

    if (file.files.length > 0) {
        const formData = new FormData();
        formData.append('icon', file.files[0], newName);
        axios.post('http://localhost:3000/meteo/saveIcon', formData)
            .then(response => {
                console.log('Ícone enviado com sucesso');
            })
            .catch(error => {
                console.error('Erro ao enviar o ícone:', error);
            });
    } else {
        console.log('Não foi selecionado nenhum Icon');
    }
    createTableVariaveis();
    var modal = document.getElementById("myModalAddVariavel");
    var bsModal = bootstrap.Modal.getInstance(modal);
    bsModal.hide();
}
btn_addtoTableVar.addEventListener("click", addVariable)
let infosVar;
let infosVariavel;
let checkData = false;
$('#tabelaVariaveis').on('click', 'button[id^="btnDeleteVar"]', async function (event) {
    buttonId = event.target.id; // Obter o ID do botão clicado
    indexVar = buttonId.replace("btnDeleteVar", ""); // Obter o índice do botão a partir do ID
    infosVar = await InfoReadVariaveisById(indexVar);
    console.log(indexVar);
    let html = '';
    $('#modalDeletebodyVar').empty();
    if (infosVar.data.length > 0) {
        checkData = true;
        console.log(infosVar);
        console.log(`Botão delete ${indexVar} clicado!`);
        html += `<div class=""><h5>Vai eliminar a variável<span style="color: red"> ${infosVar.data[0].nomeVariavel}</span> da base de dados...</h5></div>`;
        if (infosVar.data.length == 1) {
            html += `<br><span>Ao apagar essa variável vai apagar também da ${infosVar.data[0].nome} a mesma variável, deixando de poder visualizar os dados da mesma.</span>`;
        } else {
            html += `<br><span>Ao apagar essa variável vai apagar também da `;
            for (let i = 0; i < infosVar.data.length; i++) {
                html += ` ${infosVar.data[i].nome}, `;
            }
            html += `a mesma variável, deixando de poder visualizar os dados da mesma.</span>`;
        }
    } else {
        checkData = false;
        infosVariavel = await InfoVariaveisId(indexVar)
        console.log(infosVariavel);
        html += `<div class=""><h5>Vai eliminar a variável<span style="color: red"> ${infosVariavel.data[0].nomeVariavel}</span> da base de dados...</h5></div>`;

    }
    $('#modalDeletebodyVar').append(html)
    $('#myModalDeleteVar').modal('show');
});


//apagar a torre selecionada
async function deleteVarLine() {
    console.log(checkData);
    console.log("x1");
    if (checkData) {
        console.log("x3");
        for (let i = 0; i < infosVar.data.length; i++) {
            await DeleteVarTower(infosVar.data[i].torres_id);
        }

        await DeleteVariavel(infosVar.data[0].variavel_id);
    }
    else {
        await DeleteVariavel(infosVariavel.data[0].variavel_id);
        console.log("x2");
    }
    $('#myModalDeleteVar').modal('hide');
    createTableVariaveis();
    createTableTowers();
}
btn_deletefromTableVar.addEventListener("click", deleteVarLine);


