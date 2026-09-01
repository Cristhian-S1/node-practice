# ⚽ Football API — Node.js + Express + TypeScript + PostgreSQL

API REST para gestión de estadios, clubes y partidos de fútbol chileno.
Construida como proyecto de referencia con buenas prácticas.

---

## 🗂️ Estructura del proyecto

```
src/
├── db/
│   └── connection.ts        # Pool de conexión a PostgreSQL
├── schemas/
│   └── index.ts             # Schemas Zod (validación + tipos TypeScript)
├── queries/
│   ├── estadio.queries.ts   # SQL puro para Estadio
│   ├── club.queries.ts      # SQL puro para Club
│   └── partido.queries.ts   # SQL puro para Partido
├── controllers/
│   ├── estadio.controller.ts
│   ├── club.controller.ts
│   └── partido.controller.ts
├── routes/
│   ├── estadio.routes.ts
│   ├── club.routes.ts
│   └── partido.routes.ts
├── middlewares/
│   └── validate.ts          # Middleware genérico de validación Zod
├── app.ts                   # Configuración de Express
└── index.ts                 # Punto de entrada (arranca el servidor)
```

---

## 🚀 Opción 1: Desarrollo local con Nodemon

Ideal para desarrollo diario. La app recarga automáticamente al guardar cambios.

### Prerrequisitos
- Node.js 18+ instalado
- PostgreSQL corriendo en localhost
- Base de datos `football_db` creada con el script de tu BD

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tu password de Postgres (si tienes uno)

# 3. Asegúrate de que tu DB tiene las tablas y datos
# Ejecuta el SQL de tu proyecto en psql o pgAdmin

# 4. Arrancar en modo desarrollo (con hot-reload)
npm run dev
```

---

## 🐳 Opción 2: Docker Compose (app + PostgreSQL en contenedores)

Levanta todo el sistema (app + base de datos) sin instalar nada localmente.

```bash
# Construir imágenes y levantar todos los servicios
docker compose up --build

# En segundo plano (detached mode)
docker compose up --build -d

# Ver logs en tiempo real
docker compose logs -f api

# Detener y eliminar contenedores (los datos persisten en el volumen)
docker compose down

# Detener Y eliminar volúmenes (borra los datos de la DB)
docker compose down -v
```

> **Nota:** La primera vez que levantes con Compose, el `init.sql` crea
> las tablas e inserta los datos de prueba automáticamente.

---

## 📋 Endpoints

### Estadios

| Método | Ruta                          | Descripción                         |
|--------|-------------------------------|-------------------------------------|
| GET    | `/api/v1/estadios`            | Listar todos los estadios           |
| GET    | `/api/v1/estadios?minCapacidad=40000` | Filtrar por capacidad mínima |
| GET    | `/api/v1/estadios/:id`        | Obtener estadio por ID (con clubes) |
| POST   | `/api/v1/estadios`            | Crear nuevo estadio                 |
| DELETE | `/api/v1/estadios/:id`        | Eliminar estadio                    |

**POST /api/v1/estadios — body:**
```json
{
  "nombre": "Estadio Sausalito",
  "ubicacion": "Viña del Mar, Chile",
  "capacidad": 20000
}
```

---

### Clubes

| Método | Ruta                          | Descripción                         |
|--------|-------------------------------|-------------------------------------|
| GET    | `/api/v1/clubs`               | Listar todos los clubes (con estadio) |
| GET    | `/api/v1/clubs?ciudad=Santiago` | Filtrar por ciudad                |
| GET    | `/api/v1/clubs/:id`           | Obtener club por ID                 |
| POST   | `/api/v1/clubs`               | Crear nuevo club                    |
| DELETE | `/api/v1/clubs/:id`           | Eliminar club                       |

**POST /api/v1/clubs — body:**
```json
{
  "nombre": "Huachipato",
  "direccion": "Av CAP 1000",
  "ciudad": "Talcahuano",
  "estadio_id": 1
}
```

---

### Partidos

| Método | Ruta                             | Descripción                        |
|--------|----------------------------------|------------------------------------|
| GET    | `/api/v1/partidos`               | Listar todos los partidos          |
| GET    | `/api/v1/partidos?desde=2025-01-01&hasta=2025-12-31` | Filtrar por fechas |
| GET    | `/api/v1/partidos/club/:clubId`  | Partidos de un club (local o visita) |
| POST   | `/api/v1/partidos`               | Registrar nuevo partido            |
| DELETE | `/api/v1/partidos`               | Eliminar partido (por PK compuesta) |

**POST /api/v1/partidos — body:**
```json
{
  "fecha": "2025-04-05",
  "horario": "15:00",
  "goles_local": 3,
  "goles_visita": 1,
  "estadio_id": 1,
  "club_id_local": 1,
  "club_id_visita": 3
}
```

**DELETE /api/v1/partidos — body:**
```json
{
  "club_id_local": 1,
  "club_id_visita": 2,
  "fecha": "2025-03-10"
}
```

---

## 🛠️ Scripts disponibles

```bash
npm run dev        # Desarrollo con nodemon (hot-reload)
npm run build      # Compilar TypeScript → JavaScript en /dist
npm run start      # Arrancar desde /dist (producción local)
```

---

## 🧠 Decisiones de diseño

| Decisión | Razón |
|----------|-------|
| **Pool de conexiones** | Reutiliza conexiones en vez de crear una por request |
| **Queries separadas de controllers** | Cambiar la DB no afecta la lógica de negocio |
| **Zod para validación** | Tipado en runtime + tipos TypeScript automáticos |
| **Middleware de validación genérico** | No repites lógica de validación en cada controller |
| **`RETURNING *` en INSERT** | Devuelve el registro completo incluyendo el ID generado |
| **Parámetros `$1, $2`** | Previenen SQL Injection siempre |
| **Multi-stage Dockerfile** | Imagen final sin herramientas de desarrollo (~50% más pequeña) |
| **Versioning `/api/v1/`** | Permite hacer cambios breaking en v2 sin romper clientes en v1 |
