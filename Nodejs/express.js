const express = require("express");
const jsonTalleres = require("./talleres.json");
const app = express();

const PORT = process.env.PORT ?? 6969;

//Podemos hacer un middleware que afecte a todas las peticiones
//O puede colocar solo las peticiones que quieres que se vean afectadas
//por ejemplo todas las /talleres/* se veran afectadas
//O tambien para que sea solo para get, post, etc...
app.use((req, res, next) => {
  if (req.method != "POST") return next();
  if (req.headers["content-type"] != "application/json") return next();

  console.log("Mi primer middleware!");
  //Solo para request que son POST y que tienen el header json
  let body = "";

  //Escucha el evento data
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    const data = JSON.parse(body);
    data.timestamp = Date.now();
    req.body = data;
    next();
  });

  //next() es vital porque luego de que el middleware haga su logica,
  //le indico que continue a la ruta que le corresponde
});

//Express ya detecta automaticamente cual es el content-type
app.get("/", (req, res) => {
  //res.status(200).send("<h1>Estas ejecutando el framework express</h1>");

  //Ya realiza el stringify, el content-type, lo hace todo
  res.json({ mensaje: "json mensaje" });
});

app.get("/talleres", (req, res) => {
  res.json(jsonTalleres);
});

/**
 Sin middleware deberia realizar lo siguiente
 app.post("/crear", (req, res) => {
  let body = "";

  //Escucha el evento data
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    const data = JSON.parse(body);
    data.timestamp = Date.now();
    res.status(201).json(data);
  });
});
 */

//Con middleware que ha mutado la request
app.post("/crear", (req, res) => {
  res.status(201).json(req.body);
});

//Tiene que estar de ultima, porque va por orden
//Si no encontro la URL tomara esta use(TODOS LOS METHOD)
app.use((req, res) => {
  res.status(404).send("<h1>Error 404</h1>");
});

app.listen(PORT, () => {
  console.log(`Server con express escuchando desde http://localhost:${PORT}`);
});
