const http = require("node:http");
const json = require("./talleres.json");

const puerto = process.env.PORT ?? 4201;

//Funcion que responde a cada request y se discrima por el metodo y la ruta
const procesarRequest = (req, res) => {
  const { method, url } = req;

  switch (method) {
    case "GET":
      switch (url) {
        case "/talleres":
          res.setHeader("Content-Type", "application/json", "charset=utf-8");
          return res.end(JSON.stringify(json));

        default:
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/html", "charset=utf-8");
          return res.end("<h1>Error/h1>");
      }
    case "POST":
      switch (url) {
        case "/crear":
          let body = "";

          //escuchar el evento data
          req.on("data", (chunk) => {
            body += chunk.toString();
          });

          req.on("end", () => {
            const data = JSON.parse(body);
            //Llamar una base de datos para guarda la info
            res.writeHead(201, {
              "Content-Type": "application/json; charset=utf-8",
            });
            res.end(JSON.stringify(data));
          });

          break;
      }
  }
};

const server = http.createServer(procesarRequest);

server.listen(puerto, () => {
  console.log(`servidor escuchando el puerto http://localhost:${puerto}`);
});
