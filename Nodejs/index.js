const http = require("node:http");
const fs = require("node:fs");

const puerto = process.env.PORT ?? 3000;

const procesarRequest = (req, res) => {
  res.setHeader("Content-Type", "text/html", "charset=utf-8");

  if (req.url == "/") {
    res.statusCode = 200; //ok
    res.end("Hola a la direccion raiz");
  } else if (req.url == "/file.png") {
    fs.readFile("./file.png", (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end("Error al cargar la imagen");
      } else {
        res.setHeader("Content-Type", "image/png");
        res.end(data);
      }
    });
  } else if (req.url == "/home") {
    res.statusCode = 200;
    res.end("Esta es la ruta home");
  } else {
    res.statusCode = 404;
    res.end("Error");
  }
};

const server = http.createServer(procesarRequest);

server.listen(puerto, () => {
  console.log(`servidor escuchando en puerto http://localhost:${puerto}`);
});
