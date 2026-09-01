# node-practice

> Repositorio de práctica para conceptos de backend con **Node.js + Express + TypeScript**

Colección de ejercicios y proyectos progresivos que cubren desde el módulo nativo `http` hasta una API REST completa con PostgreSQL, validación con Zod y Docker.

---

## 📁 Estructura del repositorio

```
node-practice/
├── Nodejs/                          # Fundamentos: http nativo y Express básico
│   ├── index.js                     # Servidor con http nativo (rutas, archivos estáticos)
│   ├── method.js                    # Manejo de métodos HTTP (GET / POST) sin framework
│   ├── express.js                   # Servidor con Express + middleware manual
│   ├── talleres.json                # Datos de prueba (mock)
│   ├── api.http                     # Requests de prueba (VS Code REST Client)
│   └── package.json
│
├── football-node.js-express-doc/    # API Football — versión documentada / de referencia
│   ├── src/
│   │   ├── db/                      # Pool de conexión PostgreSQL
│   │   ├── schemas/                 # Validación con Zod
│   │   ├── queries/                 # SQL puro (Estadio, Club, Partido)
│   │   ├── controllers/             # Lógica de negocio
│   │   ├── routes/                  # Definición de rutas Express
│   │   ├── middlewares/             # validate.ts, dbErrorHandler, etc.
│   │   ├── app.ts                   # Configuración de Express
│   │   └── index.ts                 # Entrypoint del servidor
│   ├── init.sql                     # Esquema y datos de prueba
│   ├── docker-compose.yml           # App + PostgreSQL en contenedores
│   ├── Dockerfile                   # Multi-stage build
│   └── README.md                    # Documentación detallada del proyecto
│
├── football-node.js-training/       # API Football — versión de entrenamiento / ejercicio
│   ├── src/
│   │   ├── config/                  # Conexión a BD
│   │   ├── classes/                 # AppError y utilidades
│   │   ├── models/                  # Modelos
│   │   ├── schemas/                 # Schemas Zod
│   │   ├── controllers/             # Controllers (stadium, team, match)
│   │   ├── routes/                  # Rutas versionadas /api/v1/*
│   │   ├── middlewares/             # Validación y manejo de errores
│   │   ├── app.ts                   # createApp() factory
│   │   └── index.ts                 # Bootstrap con testConnection()
│   ├── init.sql
│   └── package.json
│
├── futbol.pdf                       # Enunciado / material de referencia
├── .env.example                     # Plantilla de variables de entorno
└── .gitignore
```

---

## 🧠 Conceptos practicados

| Área | Conceptos |
|------|-----------|
| **Fundamentos Node.js** | Módulo `node:http`, `node:fs`, creación de servidor, manejo de `req`/`res`, códigos de estado, `Content-Type`, servicio de archivos estáticos |
| **HTTP** | Métodos (GET, POST, DELETE), routing manual con `switch`, parsing de body (`data`/`end` events), status codes (200, 201, 404, 500) |
| **Express.js** | `express()`, `app.get/post/use`, `express.json()`, middlewares, `Router`, manejo de 404 y errores globales, `res.json()` / `res.status()` |
| **Middlewares** | Middleware global, middleware condicional (por método y `Content-Type`), mutación de `req.body`, encadenamiento con `next()`, `next(error)` |
| **TypeScript** | Tipado de `Request`/`Response`/`Application`, `tsconfig.json`, `ts-node`/`tsx`, tipos inferidos desde Zod |
| **Validación** | [Zod](https://zod.dev/) — schemas, validación en runtime, middleware genérico `validate.ts` |
| **Base de datos** | PostgreSQL con `pg` (Pool), queries parametrizadas (`$1, $2` contra SQL Injection), `RETURNING *`, `init.sql` |
| **Arquitectura** | Separación en capas: `routes → controllers → queries → db`, factory `createApp()`, versionado `/api/v1/` |
| **DevOps** | Docker + Docker Compose (app + DB), multi-stage Dockerfile, `nodemon` / `tsx --watch`, variables de entorno con `dotenv` |

---

## 🔧 Proyectos

### 1. `Nodejs/` — Fundamentos sin y con Express

Ejercicios introductorios para entender qué abstrae Express.

| Archivo | Descripción | Puerto |
|---------|-------------|--------|
| `index.js` | Servidor con `node:http` — rutas `/`, `/home`, `/file.png` (servicio de imagen con `fs.readFile`) | `3000` |
| `method.js` | Servidor con `node:http` discriminando por método — `GET /talleres` y `POST /crear` con parsing manual del body | `4201` |
| `express.js` | Mismo caso con Express — middleware manual que parsea JSON y añade `timestamp`, `GET /`, `GET /talleres`, `POST /crear`, handler 404 | `6969` |

```bash
cd Nodejs
npm install

# http nativo — rutas básicas
npm run dev:2      # nodemon index.js  → http://localhost:3000

# http nativo — métodos GET/POST
npm run dev:1      # nodemon method.js → http://localhost:4201

# Express + middleware manual
npm run dev:3      # node --watch express.js → http://localhost:6969
```

Prueba los endpoints con el archivo `Nodejs/api.http` (extensión REST Client de VS Code).

---

### 2. `football-node.js-express-doc/` — API Football (versión documentada)

API REST completa para gestión de **estadios, clubes y partidos** de fútbol chileno. Proyecto de referencia con buenas prácticas y documentación inline (`.docx` con apuntes de cada capa).

**Stack:** Express 4 + TypeScript + PostgreSQL + Zod + Docker

Ver [football-node.js-express-doc/README.md](football-node.js-express-doc/README.md) para documentación completa de endpoints, Docker y decisiones de diseño.

```bash
cd football-node.js-express-doc
npm install
cp ../.env.example .env   # o cp .env.example .env si existe local
# Editar .env con tus credenciales de Postgres

# Desarrollo con hot-reload
npm run dev

# O con Docker (app + DB)
docker compose up --build
```

**Endpoints principales:**

| Recurso | Método | Ruta | Descripción |
|---------|--------|------|-------------|
| Estadios | GET | `/api/v1/estadios` | Listar (filtro `?minCapacidad=`) |
| Estadios | GET | `/api/v1/estadios/:id` | Detalle con clubes |
| Estadios | POST | `/api/v1/estadios` | Crear |
| Clubes | GET | `/api/v1/clubs` | Listar (filtro `?ciudad=`) |
| Clubes | POST | `/api/v1/clubs` | Crear |
| Partidos | GET | `/api/v1/partidos` | Listar (filtro `?desde=&hasta=`) |
| Partidos | GET | `/api/v1/partidos/club/:clubId` | Partidos de un club |
| Partidos | POST | `/api/v1/partidos` | Registrar partido |
| Partidos | DELETE | `/api/v1/partidos` | Eliminar (PK compuesta por body) |

---

### 3. `football-node.js-training/` — API Football (versión de entrenamiento)

Reimplementación del mismo dominio como ejercicio práctico. Estructura similar pero con diferencias intencionales para practicar:

- Factory `createApp(): Application` testeable
- Clase `AppError` para errores controlados
- Rutas en inglés (`/api/v1/stadiums`, `/api/v1/teams`, `/api/v1/matches`)
- Endpoint de health check `GET /test`
- Manejo de errores con `next(error)` → middleware `ErrorRequestHandler`
- Arranque con `testConnection()` antes de `app.listen()`

```bash
cd football-node.js-training
npm install
cp ../.env.example .env
# Editar .env

npm run build        # tsc → dist/
npm start            # nodemon --exec tsx src/index.ts
```

---

## ⚙️ Requisitos

- **Node.js** 18+ (recomendado 20+)
- **PostgreSQL** 14+ (solo para los proyectos `football-*`; o usar Docker)
- **Docker + Docker Compose** (opcional, para levantar todo sin instalar Postgres local)

---

## 🚀 Inicio rápido

```bash
# Clonar
git clone <url-del-repo>
cd node-practice

# Variables de entorno (para los proyectos football-*)
cp .env.example .env
# Editar .env con tus valores reales:
# DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, PORT, NODE_ENV
```

Cada subproyecto tiene su propio `package.json` — entra a la carpeta que quieras practicar e instala dependencias allí:

```bash
cd Nodejs && npm install
# o
cd football-node.js-express-doc && npm install
# o
cd football-node.js-training && npm install
```

---

## 🧪 Probar la API

Cada proyecto incluye un archivo `api.http` compatible con la extensión [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) de VS Code:

- `Nodejs/api.http`
- `football-node.js-express-doc/api.http`
- `football-node.js-training/api.http`

Alternativamente usa `curl`:

```bash
curl http://localhost:3000/api/v1/estadios
curl -X POST http://localhost:3000/api/v1/estadios \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Estadio Sausalito","ubicacion":"Viña del Mar, Chile","capacidad":20000}'
```

---

## 📚 Orden de estudio sugerido

1. **`Nodejs/index.js`** — Entiende el servidor sin frameworks.
2. **`Nodejs/method.js`** — Ve el manejo manual de métodos y body.
3. **`Nodejs/express.js`** — Compara con la abstracción de Express y el concepto de middleware.
4. **`football-node.js-express-doc/`** — Estudia la arquitectura por capas, Zod, `pg` y Docker leyendo los `.docx` de cada carpeta.
5. **`football-node.js-training/`** — Reimplementa por tu cuenta tomando la versión `express-doc` como referencia.

---

## 📄 Licencia

ISC — Uso educativo / práctica personal.
