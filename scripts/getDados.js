let login;
let dataTest;
const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
}
const instanceLocal = axios.create({
    baseURL: 'http://10.3.246.249:3000/',
    //baseURL: 'http://lab.fam.ulusiada.pt:3000/',
});
 async function checkToken() {
    try {
        dataTest = await instanceLocal.post(`api/data/checkToken`);
        console.log(dataTest)
    }
    catch (err) {
        console.log(err);
    }
}
checkToken();

export async function dataIntervalDias(torre, dado, start, end) {
    try {
        return await instanceLocal.post(`/api/data/dias`, { torre, dado, start, end });
    } catch (error) {
        return error;
    }
}
export async function dataIntervalMinutos(torre, dado, tempo) {
    try {
        return await instanceLocal.post(`/api/data/minutos`, { torre, dado, tempo });
    } catch (error) {
        return error;
    }
}

//meteobase
export async function InfoTowersAll() {
    try {
        return await instanceLocal.get('api/meteo/meteobase/readAll');
    } catch (error) {
        return error;      
    }
}
export async function InfoTowersById(id) {
    return await instanceLocal.get(`meteo/meteobase/readById/${id}`);
}
export async function InfoTowersByName(nome) {
    return await instanceLocal.get(`meteo/meteobase/readByName/${nome}`);
}
export async function DeleteTowerById(id) {
    return await instanceLocal.delete(`meteo/meteobase/deleteById/${id}`);
}

//Torres
export async function InfoTorres() {
    return await instanceLocal.get(`meteo/torres/readAll`);
}
export async function InfoTorresById(meteobase_id, variavel_id) {
    return await instanceLocal.get(`meteo/torres/readByVarIdAndTorreId/${meteobase_id}/${variavel_id}`);
}
export async function DeleteVarTower(id) {
    return await instanceLocal.delete(`meteo/torres/deleteById/${id}`)
        .then((response) => {
            console.log('Dados Eliminados da tabela torre com sucesso.');
        })
        .catch((error) => {
            console.error('Erro ao eliminar dados na tabela Torre: ' + error.message);
        });;
}
export async function EditTower(torreId, variavelId) {
    console.log(torreId)
    return await instanceLocal.put(`meteo/torres/editById/${torreId}/${variavelId}`)
        .then((response) => {
            console.log('Dados atualizados da tabela torre com sucesso.');
        })
        .catch((error) => {
            console.error('Erro ao atualizar dados na tabela Torre: ' + error.message);
        });;
}
export async function addVarTower(contador, id_novaTorre, varAssoc) {
    await instanceLocal.post('meteo/torres/insert', { contador, id_novaTorre, varAssoc })
        .then((response) => {
            console.log('Dados inseridos na tabela com sucesso.');
        })
        .catch((error) => {
            console.error('Erro ao inserir dados na tabela: ' + error.message);
        });
}

//Variaveis
export async function InfoVariaveis() {
    return await instanceLocal.get(`meteo/variaveis/readAll`);
}
export async function InfoVariaveisId(id) {
    return await instanceLocal.get(`meteo/variaveis/readById/${id}`);
}
export async function DeleteVariavel(id) {
    return await instanceLocal.delete(`meteo/variaveis/deleteById/${id}`);
}

//data
export async function ReadDatabyDate(data) {
    return await instanceLocal.get(`meteo/data/readByDate/${data}`);
}
export async function ReadDatabyNameVar(nameVar) {
    return await instanceLocal.get(`meteo/data/readByNameVar/${nameVar}`);
}
export async function ReadDatabyHashCode(hashCode) {
    return await instanceLocal.get(`meteo/data/readByHashCode/${hashCode}`);
}
export async function ReadDatabyHashCodeAndVarId(hashCode, varId) {
    return await instanceLocal.get(`meteo/data/readByHashCodeAndVarId/${hashCode}/${varId}`);
}
export async function ReadDatabyHashCodeAndNameVar(hashCode, nameVar) {
    return await instanceLocal.get(`meteo/data/readByHashCodeAndNameVar/${hashCode}/${nameVar}`);
}
export async function ReadDatabyHashCodeAndNameVarAndTorreId(hashCode, nameVar, torreId) {
    return await instanceLocal.get(`meteo/data/readByHashCodeAndNameVarAndTorreId/${hashCode}/${nameVar}/${torreId}`);
}

//localizaçao
export async function InfoLocalizacao() {
    return await instanceLocal.get(`/meteo/localizacao/readAll`);
}
export async function InfoLocalizacaoId(id) {
    return await instanceLocal.get(`meteo/localizacao/readByMeteobaseId/${id}`);
}
export async function DeleteLocalizacao(id) {
    return await instanceLocal.delete(`meteo/localizacao/deleteByMeteobaseId/${id}`);
}

//all
export async function InfoAllByMeteobaseId(id) {
    return await instanceLocal.get(`meteo/all/readAllByMeteobaseId/${id}`);
}
export async function InfoAllByTorresId(id) {
    return await instanceLocal.get(`meteo/all/readAllByTorresId/${id}`);
}
export async function InfoAllByMeteobaseIdAndTorresId(MeteobaseId, TorresId) {
    return await instanceLocal.get(`meteo/all/readAllByMeteobaseIdAndTorresId/${MeteobaseId}/${TorresId}`);
}
export async function InfoReadVariaveisById(id) {
    return await instanceLocal.get(`meteo/all/readAllByVariaveisId/${id}`);
}
export async function InfoReadVariaveisByName(nomeVariavel, variavelId) {
    const params = { nomeVariavel: nomeVariavel, variavelId: variavelId };
    return await instanceLocal.get(`meteo/all/readAllByVariaveisNameOrId/`, { params })
}
export async function ReadIconByName(nomeIcon) {
    return instanceLocal.get(`meteo/iconsReadByName/${nomeIcon}`, {
        responseType: 'arraybuffer'
    });
}

