const express = require("express");
const multer = require("multer");
const mysql = require("mysql");
const cors = require("cors");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const readline = require("readline");
const CircularJSON = require("circular-json");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;

dotenv.config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500,
});

const app = express();
app.use(cors());
app.use(express.static(__dirname));
app.use(limiter);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let accessToken;

let dataAcess = {
  email: process.env.MONGODB_EMAIL,
  password: process.env.MONGODB_PASSWORD,
};
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

// Configuração do logger
const logger = createLogger({
  level: "info",
  format: combine(
    timestamp(),
    printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [new transports.File({ filename: "app.log" })],
});

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

const instance = axios.create({
  baseURL: "http://10.3.80.6:7011/",
});

/* 
let accessToken = null;
let refreshToken = null;
let tokenRefreshTimer = null;

// Função para obter o token de acesso
async function getToken() {
  try {
    const response = await instance.post("/api/auth/login", JSON.stringify(dataAcess), {
      headers: headers,
    });

    accessToken = response.data.accessToken;
    refreshToken = response.data.refreshToken;

    tokenRefreshTimer = setTimeout(() => {
      renewAccessToken();
    }, 55 * 60 * 1000); // 55 minutos em milissegundos
  } catch (error) {
    console.error(error);
    if (error.response && error.response.status === 500) {
      console.log("Erro 500: Tentando novamente em alguns segundos...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await getToken();
    } else {
      console.log("Erro ao obter token. Ação necessária para lidar com outros erros.");
    }
  }
}

// Função para renovar o token de acesso usando o refresh token
async function renewAccessToken() {
  try {
    const response = await instance.post("/api/auth/refresh", JSON.stringify({ refreshToken }), {
      headers: headers,
    });
    accessToken = response.data.accessToken;

    // Defina novamente o temporizador para a próxima renovação
    tokenRefreshTimer = setTimeout(() => {
      renewAccessToken();
    }, 55 * 60 * 1000); // 55 minutos em milissegundos
  } catch (error) {
    console.error("Erro ao renovar token:", error);
  }
}

//getToken();
 */

async function getToken() {
  try {
    const response = await instance.post(
      "/api/auth/login",
      JSON.stringify(dataAcess),
      {
        headers: headers,
      }
    );

    accessToken = response.data.accessToken;
  } catch (error) {
    console.error(error);
    if (error.response && error.response.status === 500) {
      // Tratando um erro 500 específico.
      console.log("Erro 500: Tentando novamente em alguns segundos...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await getToken();
    } else {
      console.log(
        "Erro ao obter token. Ação necessária para lidar com outros erros."
      );
    }
  }
}
app.post("/api/data/checkToken", async (req, res) => {
  const response = await instance.get(
    `api/data/torre2/temperature?interval=5`,
    {
      headers: { Authorization: `bearer ${accessToken}` },
    }
  );
  console.log(response.status);
  if (response.status === 200) {
    const jsonString = CircularJSON.stringify(response.data);
    res.send(jsonString);
  } else {
    await getToken();
  }
});
app.post("/api/data/dias", async (req, res) => {
  const { torre, dado, start, end } = req.body;
  try {
    const response = await instance.get(
      `api/data/${torre}/${dado}?start=${start}&end=${end}`,
      {
        headers: { Authorization: `bearer ${accessToken}` },
      }
    );
    const jsonString = CircularJSON.stringify(response.data);
    res.send(jsonString);
  } catch (error) {
    console.log(error.code);
    if (error.code === "ECONNREFUSED") {
      res.status(500).send(error);
      return;
    }
    if (error.response.status === 401) {
      await getToken();
    }
    res.status(500).send(error.response.data);
  }
});
app.post("/api/data/minutos", async (req, res) => {
  const { torre, dado, tempo } = req.body;
  try {
    const response = await instance.get(
      `api/data/${torre}/${dado}?interval=${tempo}`,
      {
        headers: { Authorization: `bearer ${accessToken}` },
      }
    );
    const jsonString = CircularJSON.stringify(response.data);
    res.send(jsonString);
  } catch (error) {
    console.log(error);
    if (error.code === "ECONNREFUSED") {
      res.status(500).send(error);
      return;
    }
    if (error.response.status === 401) {
      await getToken();
    }
    res.status(500).send(error.response.data);
  }
});

//meteobase Get
app.get("/api/meteo/meteobase/readAll", (req, res) => {
  connection.query("SELECT * FROM meteobase", (err, rows) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});
app.get("/meteo/meteobase/readById/:id", (req, res) => {
  connection.query(
    "SELECT * FROM meteobase WHERE meteobase.id = ?",
    [req.params.id],
    (err, rows) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    }
  );
});
app.get("/meteo/meteobase/readByName/:nome", (req, res) => {
  connection.query(
    "SELECT * FROM meteobase WHERE meteobase.nome = ?",
    [req.params.nome],
    (err, rows) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    }
  );
});
//meteobase Insert
app.post("/meteo/meteobase/insert", (req, res) => {
  const {
    id_novaTorre,
    valornomeTorre,
    valorNome,
    caminho,
    icon,
    valorTorreAssoc,
    numeroPag,
    valorEstado,
  } = req.body;
  const query = `INSERT INTO meteobase (id, nomeTorre, nome, caminho, icon, torreAssoc,
         paginas, activa) VALUES ('${id_novaTorre}','${valornomeTorre}','${valorNome}',
         '${caminho}','${icon}','${valorTorreAssoc}','${numeroPag}','${valorEstado}')`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error(
        "Erro ao inserir dados na tabela meteobase: " + error.stack
      );
      res.status(500).send("Erro ao inserir dados na tabela meteobase.");
      return;
    }
    console.log("Dados inseridos na tabela meteobase com sucesso.");
    res.status(200).send("Dados inseridos na tabela meteobase com sucesso.");
  });
});
//meteobase Edit
app.put("/meteo/meteobase/editById", (req, res) => {
  const {
    id_torre,
    valornomeTorre,
    valorNome,
    caminho,
    icon,
    valorTorreAssoc,
    numeroPag,
    valorEstado,
  } = req.body;
  const query = `UPDATE meteobase SET nomeTorre='${valornomeTorre}',nome='${valorNome}',
    caminho='${caminho}',icon='${icon}',torreAssoc='${valorTorreAssoc}',paginas='${numeroPag}',
    activa='${valorEstado}' WHERE id = ${id_torre};`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Erro ao edita dados na tabela meteobase: " + error.stack);
      res.status(500).send("Erro ao editar dados na tabela meteobase.");
      return;
    }
    console.log("Dados editados na tabela meteobase com sucesso.");
    res.status(200).send("Dados editados na tabela meteobae com sucesso.");
  });
});
//meteobase Delete
app.delete("/meteo/meteobase/deleteById/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    "DELETE FROM meteobase WHERE id = ?",
    [id],
    (error, results) => {
      if (error) {
        res.status(500).send("Erro ao eliminar torre");
      } else {
        console.error("sucesso ao eliminar dados na tabela meteobase");
        res.status(200).send("Torre  eliminado com sucesso");
      }
    }
  );
});

//Torres Get
app.get("/meteo/torres/readAll", (req, res) => {
  connection.query("SELECT * FROM torres ", (err, rows) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});
app.get(
  "/meteo/torres/readByVarIdAndTorreId/:meteobase_id/:variavel_id",
  (req, res) => {
    connection.query(
      "SELECT * FROM `torres` WHERE id_variavel = ? AND id_torre = ?",
      [req.params.variavel_id, req.params.meteobase_id],
      (err, rows) => {
        if (!err) {
          res.send(rows);
        } else {
          console.log(err);
        }
      }
    );
  }
);
//Torres Insert
app.post("/meteo/torres/insert", (req, res) => {
  const { contador, id_novaTorre, varAssoc } = req.body;
  const query = `INSERT INTO torres (torres_id,id_torre, id_variavel) VALUES 
    ('${contador}','${id_novaTorre}', '${varAssoc}')`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Erro ao inserir dados na tabela Torres: " + error.stack);
      res.status(500).send("Erro ao inserir dados na tabela Torres.");
      return;
    }
    console.log("Dados inseridos na tabela Torres com sucesso.");
    res.status(200).send("Dados inseridos na tabela Torres com sucesso.");
  });
});
//Torres Edit
app.put("/meteo/torres/editById/:torre_id/:variavel_id", (req, res) => {
  const torre_id = req.params.torre_id;
  const variavel_id = req.params.variavel_id;
  connection.query(
    "UPDATE torres SET id_variavel= ? WHERE torres_id = ?",
    [variavel_id, torre_id],
    (error, results) => {
      if (error) {
        console.error("Erro ao inserir dados na tabela Torres: " + error.stack);
        res.status(500).send("Erro ao inserir dados na tabela Torres.");
        return;
      }
      console.log("Dados inseridos na tabela Torres com sucesso.");
      res.status(200).send("Dados inseridos na tabela Torres com sucesso.");
    }
  );
});
//Torres Delete
app.delete("/meteo/torres/deleteById/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    "DELETE FROM torres WHERE torres_id = ?",
    [id],
    (error, results) => {
      if (error) {
        console.error("erro ao eliminar dados da tabela torre");
        res.status(500).send("Erro ao eliminar linha da tabela Torres");
      } else {
        console.error("sucesso ao eliminar dados da tabela torre");
        res.status(200).send("Linha da tabela Torres eliminada com sucesso");
      }
    }
  );
});

//variaveis Get
app.get("/meteo/variaveis/readAll", (req, res) => {
  connection.query("SELECT * FROM variaveis ", (err, rows) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});
app.get("/meteo/variaveis/readById/:id", (req, res) => {
  connection.query(
    "SELECT * FROM variaveis WHERE variavel_id = ? ",
    [req.params.id],
    (err, rows) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    }
  );
});
//variaveis Delete
app.delete("/meteo/variaveis/deleteById/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
  connection.query(
    "DELETE FROM variaveis WHERE variavel_id = ?",
    [id],
    (error, results) => {
      console.log(error);
      if (error) {
        res.status(500).send("Erro ao eliminar variável");
      } else {
        res.status(200).send("Variavel eliminado com sucesso");
      }
    }
  );
});
//variaveis Insert
app.post("/meteo/variaveis/insert", (req, res) => {
  const {
    nomeVariavel,
    nomeBaseDados,
    nomeVariavel2,
    nomeBaseDados2,
    nomeNormalizado,
    ficheiro,
    icon,
    grandeza,
  } = req.body;
  const nomeVariavel2Value = nomeVariavel2 ? `${nomeVariavel2}` : "NULL";
  const nomeBaseDados2Value = nomeBaseDados2 ? `${nomeBaseDados2}` : "NULL";
  let query;
  console.log(nomeVariavel2Value);
  console.log(nomeBaseDados2Value);
  if (nomeVariavel2Value == "NULL" || nomeBaseDados2Value == "NULL") {
    query = `INSERT INTO variaveis (variavel_id, nomeVariavel, NomeBaseDados, nomeVariavel2, 
            NomeBaseDados2, nomeNormalizado, ficheiro, icon,grandeza) VALUES (NULL, '${nomeVariavel}',
            '${nomeBaseDados}',NULL,NULL,'${nomeNormalizado}','${ficheiro}',
            '${icon}','${grandeza}')`;
  } else {
    console.log("x2");
    query = `INSERT INTO variaveis (variavel_id, nomeVariavel, NomeBaseDados, nomeVariavel2, 
            NomeBaseDados2, nomeNormalizado, ficheiro, icon,grandeza) VALUES (NULL, '${nomeVariavel}',
            '${nomeBaseDados}','${nomeVariavel2Value}','${nomeBaseDados2Value}','${nomeNormalizado}','${ficheiro}',
            '${icon}','${grandeza}')`;
    console.log(query);
  }
  connection.query(query, (error, results) => {
    if (error) {
      console.error(
        "Erro ao inserir dados na tabela variaveis: " + error.stack
      );
      res.status(500).send("Erro ao inserir dados na tabela variaveis.");
      return;
    }
    console.log("Dados inseridos na tabela variaveis com sucesso.");
    res.status(200).send("Dados inseridos na tabela variaveis com sucesso.");
  });
});

//utilizadores Get
app.get("/meteo/auth/users/readAll", (req, res) => {
  connection.query("SELECT * FROM utilizadores", (err, rows) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});
app.post("/meteo/auth/login/check", (req, res) => {
  const { username, password } = req.body;
  const sql = `SELECT * FROM utilizadores WHERE nome_utilizador = ? AND senha = ?`;
  connection.query(sql, [username, md5(password)], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      const token = jwt.sign({ username: username }, "meteo2023", {
        expiresIn: "30m",
      });
      res.json({ token: token });
    } else {
      res.status(401).send("Nome de utilizador ou Senha errados");
    }
  });
});
app.get("/meteo/auth/admin/check", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  console.log(token);
  jwt.verify(token, "meteo2023", (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido" });
    } else {
      return res.status(200).json({ message: "Token Válido" });
    }
  });
});
app.get("/meteo/auth/logout/check", (req, res) => {
  req.session.destroy();
  res.redirect("http://localhost/meteo/");
});

//data
app.get("/meteo/data/readByDate/:data", (req, res) => {
  const data = req.params.data;
  connection.query(
    "SELECT * FROM `data` WHERE date = ?",
    [data],
    (err, rows) => {
      if (!err) {
        const adjustedRows = rows.map((row) => {
          const adjustedDate = new Date(row.date).toLocaleString("pt-PT", {
            timeZone: "Europe/Lisbon",
          });
          return { ...row, date: adjustedDate };
        });
        res.send(adjustedRows);
      } else {
        console.log(err);
        res.sendStatus(500);
      }
    }
  );
});
app.get("/meteo/data/readByNameVar/:nome", (req, res) => {
  connection.query(
    "SELECT * FROM data WHERE data_nomeVariavel = ? ",
    [req.params.nome],
    (err, rows) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    }
  );
});
app.get("/meteo/data/readByHashCode/:hashCode", (req, res) => {
  connection.query(
    "SELECT * FROM data WHERE data_idHashCode = ? ",
    [req.params.hashCode],
    (err, rows) => {
      if (!err) {
        const adjustedRows = rows.map((row) => {
          const adjustedDate = new Date(row.date).toLocaleString("pt-PT", {
            timeZone: "Europe/Lisbon",
          });
          return { ...row, date: adjustedDate };
        });
        res.send(adjustedRows);
      } else {
        console.log(err);
      }
    }
  );
});
app.get("/meteo/data/readByHashCodeAndVarId/:hashCode/:varId", (req, res) => {
  connection.query(
    "SELECT * FROM data WHERE data_idHashCode = ? AND variavel_id = ?",
    [req.params.hashCode, req.params.varId],
    (err, rows) => {
      if (!err) {
        const adjustedRows = rows.map((row) => {
          const adjustedDate = new Date(row.date).toLocaleString("pt-PT", {
            timeZone: "Europe/Lisbon",
          });
          return { ...row, date: adjustedDate };
        });
        res.send(adjustedRows);
      } else {
        console.log(err);
      }
    }
  );
});
app.get(
  "/meteo/data/readByHashCodeAndNameVar/:hashCode/:nameVar",
  (req, res) => {
    connection.query(
      "SELECT * FROM data WHERE data_idHashCode = ? AND data_nomeVariavel = ?",
      [req.params.hashCode, req.params.nameVar],
      (err, rows) => {
        if (!err) {
          const adjustedRows = rows.map((row) => {
            const adjustedDate = new Date(row.date).toLocaleString("pt-PT", {
              timeZone: "Europe/Lisbon",
            });
            return { ...row, date: adjustedDate };
          });
          res.send(adjustedRows);
        } else {
          console.log(err);
        }
      }
    );
  }
);
app.get(
  "/meteo/data/readByHashCodeAndNameVarAndTorreId/:hashCode/:nameVar/:torreId",
  (req, res) => {
    connection.query(
      "SELECT * FROM data WHERE data_idHashCode = ? AND data_nomeVariavel = ? AND torre_id = ?",
      [req.params.hashCode, req.params.nameVar, req.params.torreId],
      (err, rows) => {
        if (!err) {
          const adjustedRows = rows.map((row) => {
            const adjustedDate = new Date(row.date).toLocaleString("pt-PT", {
              timeZone: "Europe/Lisbon",
            });
            return { ...row, date: adjustedDate };
          });
          res.send(adjustedRows);
        } else {
          console.log(err);
        }
      }
    );
  }
);
app.post("/meteo/data/insert", (req, res) => {
  const {
    data_idHashCode,
    torre_id,
    variavel_id,
    data_nomeVariavel,
    date,
    media,
    max,
    min,
  } = req.body;
  let query;
  console.log("novalinha");
  console.log(date);
  console.log(data_nomeVariavel);
  console.log(media);
  console.log(max);
  console.log(min);
  if (data_nomeVariavel === "Direção Vento") {
    query = `INSERT INTO data (id_data, data_idHashCode, torre_id, variavel_id, data_nomeVariavel, 
            date, media, max, min) VALUES (NULL, '${data_idHashCode}', '${torre_id}', '${variavel_id}', '${data_nomeVariavel}', '${date}', '${media}', NULL, NULL)`;
  } else if (media === null && max === undefined && min === undefined) {
    query = `INSERT INTO data (id_data, data_idHashCode, torre_id, variavel_id, data_nomeVariavel, 
            date, media, max, min) VALUES (NULL, '${data_idHashCode}', '${torre_id}', '${variavel_id}', '${data_nomeVariavel}', '${date}', NULL, NULL, NULL)`;
  } else if (media === null && max === null && min === null) {
    query = `INSERT INTO data (id_data, data_idHashCode, torre_id, variavel_id, data_nomeVariavel, 
            date, media, max, min) VALUES (NULL, '${data_idHashCode}', '${torre_id}', '${variavel_id}', '${data_nomeVariavel}', '${date}', NULL, NULL, NULL)`;
  } else {
    query = `INSERT INTO data (id_data, data_idHashCode, torre_id, variavel_id, data_nomeVariavel, 
            date, media, max, min) VALUES (NULL, '${data_idHashCode}', '${torre_id}', '${variavel_id}', '${data_nomeVariavel}', '${date}', '${media}', '${max}', '${min}')`;
  }
  connection.query(query, (error, results) => {
    if (error) {
      console.error("Erro ao inserir dados na tabela Data: " + error.stack);
      res.status(500).send("Erro ao inserir dados na tabela Data.");
      return;
    }
    console.log("Dados inseridos na tabela Data com sucesso.");
    res.status(200).send("Dados inseridos na tabela Data com sucesso.");
  });
});

//localizaçao
app.get("/meteo/localizacao/readAll", (req, res) => {
  connection.query("SELECT * FROM localizacao ", (err, rows) => {
    if (!err) {
      res.send(rows);
    } else {
      console.log(err);
    }
  });
});
app.get("/meteo/localizacao/readByMeteobaseId/:id", (req, res) => {
  connection.query(
    "SELECT * FROM localizacao WHERE meteobase_id = ? ",
    [req.params.id],
    (err, rows) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    }
  );
});
app.post("/meteo/localizacao/insert", (req, res) => {
  const { id_novaTorre, cidade, local, freguesia, rua, coordenadas } = req.body;
  const query = `INSERT INTO localizacao(localizacao_id, meteobase_id, cidade, local, rua, 
        freguesia, coordenadas) VALUES(NULL, '${id_novaTorre}', '${cidade}', '${local}', '${rua}',
        '${freguesia}', '${coordenadas}')`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error(
        "Erro ao inserir dados na tabela localizaçao: " + error.stack
      );
      res.status(500).send("Erro ao inserir dados na tabela localizaçao.");
      return;
    }
    console.log("Dados inseridos na tabela localizaçao com sucesso.");
    res.status(200).send("Dados inseridos na tabela localizaçao com sucesso.");
  });
});
app.put("/meteo/localizacao/editById", (req, res) => {
  const { id_torre, cidade, local, freguesia, rua, coordenadas } = req.body;
  const query = `UPDATE localizacao SET cidade ='${cidade}',local='${local}',rua='${rua}',
    freguesia='${freguesia}', coordenadas='${coordenadas}' WHERE meteobase_id = ${id_torre};`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error(
        "Erro ao edita dados na tabela localizaçao: " + error.stack
      );
      res.status(500).send("Erro ao editar dados na tabela localizaçao.");
      return;
    }
    console.log("Dados editados na tabela localizaçao com sucesso.");
    res.status(200).send("Dados editados na tabela localizaçao com sucesso.");
  });
});
app.delete("/meteo/localizacao/deleteByMeteobaseId/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    "DELETE FROM localizacao WHERE meteobase_id = ?",
    [id],
    (error, results) => {
      if (error) {
        res.status(500).send("Erro ao eliminar localizaçao");
      } else {
        console.error("sucesso ao eliminar dados na tabela localizaçao");
        res.status(200).send("localizaçao eliminado com sucesso");
      }
    }
  );
});

//all
app.get("/meteo/all/readAllByMeteobaseId/:id", (req, res) => {
  connection.query(
    `SELECT * FROM meteobase LEFT JOIN torres ON(meteobase.id = torres.id_torre) 
    LEFT JOIN variaveis ON(torres.id_variavel = variaveis.variavel_id) WHERE meteobase.id = ? `,
    [req.params.id],
    (err, rows) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    }
  );
});
app.get("/meteo/all/readAllByTorresId/:id", (req, res) => {
  connection.query(
    `SELECT * FROM meteobase INNER JOIN torres ON(meteobase.id = torres.id_torre)
    INNER JOIN variaveis ON(torres.id_variavel = variaveis.variavel_id) WHERE torres.torres_id = ?; `,
    [req.params.id],
    (err, rows) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    }
  );
});
app.get(
  "/meteo/all/readAllByMeteobaseIdAndTorresId/:Meteobaseid/:TorresId",
  (req, res) => {
    connection.query(
      `SELECT * FROM meteobase INNER JOIN torres ON(meteobase.id = torres.id_torre)
    INNER JOIN variaveis ON(torres.id_variavel = variaveis.variavel_id) WHERE torres.torres_id = ? AND meteobase.id = ?; `,
      [req.params.TorresId, req.params.Meteobaseid],
      (err, rows) => {
        if (!err) {
          res.send(rows);
        } else {
          console.log(err);
        }
      }
    );
  }
);
app.get("/meteo/all/readAllByVariaveisId/:id", (req, res) => {
  connection.query(
    `SELECT * FROM meteobase INNER JOIN torres ON(meteobase.id = torres.id_torre)
     INNER JOIN variaveis ON(torres.id_variavel = variaveis.variavel_id) WHERE variaveis.variavel_id = ? ; `,
    [req.params.id],
    (err, rows) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    }
  );
});
app.get("/meteo/all/readAllByDataId/:id", (req, res) => {
  connection.query(
    `SELECT * FROM data INNER JOIN meteobase ON(data.data_id = meteobase.id) 
    INNER JOIN variaveis ON(data.data_nomeVariavel = variaveis.nomeVariavel) 
    WHERE data.data_id = ? ; `,
    [req.params.id],
    (err, rows) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    }
  );
});
app.get("/meteo/all/readAllByVariaveisNameOrId/", (req, res) => {
  const nomeVariavel = req.query.nomeVariavel;
  const variavelId = req.query.variavelId;
  const query = `
    SELECT *
        FROM meteobase
      INNER JOIN torres ON(meteobase.id = torres.id_torre)
      INNER JOIN variaveis ON(torres.id_variavel = variaveis.variavel_id)
      WHERE variaveis.nomeVariavel = ? OR variaveis.variavel_id = ?
        `;
  connection.query(query, [nomeVariavel, variavelId], (err, results) => {
    if (err) {
      console.error("Erro ao executar a consulta:", err);
      res.status(500).json({ error: "Erro interno do servidor" });
    } else {
      res.json(results);
    }
  });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./icons/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const fileFilter = function (req, file, cb) {
  if (file.mimetype === "image/png" || file.mimetype === "image/x-icon") {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não suportado."));
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });
app.post("/meteo/saveIcon", upload.single("icon"), (req, res) => {
  res.send("Ícone salvo");
});
function sleep(millis) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}
const ip = "";
const port = 3000;

app.listen(port, () => {
  console.log("Servidor na porta 3000!");
});

let connection;

function createConnectionSql() {
  connection = mysql.createConnection({
    host: "localhost",
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
  });

  connection.connect(async (err) => {
    if (err) {
      console.error("Erro na conexão com a base de dados:", err);
      setTimeout(() => {
        createConnectionSql();
      }, 5000);
    } else {
      console.log("Conectado ao MySQL!");
    }
  });

  connection.on("error", (err) => {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log(
        "Conexão com a base de dados foi perdida. Tentando reconectar..."
      );
      createConnectionSql();
    } else {
      throw err;
    }
  });
}
createConnectionSql();

void (async () => {
  await sleep(500);
  await getToken();
})();
