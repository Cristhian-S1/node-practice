# ─────────────────────────────────────────────────────────
#  Dockerfile  →  Imagen Docker de la API
# ─────────────────────────────────────────────────────────
#
# Usamos un build multi-stage (multi-etapa). ¿Por qué?
# -------------------------------------------------------
# Stage 1 (builder): instala TODAS las dependencias (dev + prod)
#                    y compila TypeScript a JavaScript.
# Stage 2 (runner):  copia solo el /dist compilado y las
#                    dependencias de producción.
#
# Resultado: la imagen final es mucho más pequeña porque
# no incluye TypeScript, ts-node, nodemon, etc.
# En producción menos peso = menor tiempo de deploy + menos superficie de ataque.

# ─── Stage 1: Builder ─────────────────────────────────────
FROM node:20-alpine AS builder

# alpine es la versión más liviana de la imagen de Node
# (mucho más pequeña que node:20, basada en Alpine Linux)

WORKDIR /app

# Copiamos primero SOLO los archivos de dependencias.
# Docker cachea cada capa. Si el package.json no cambió,
# Docker reutiliza la capa de npm install (mucho más rápido).
# TRUCO: Si primero copiaras todo el código, cualquier cambio
# en un .ts invalidaría el cache de npm install.
COPY package*.json ./
COPY tsconfig.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para compilar)
RUN npm ci

# Ahora sí copiamos el código fuente
COPY src/ ./src/

# Compilar TypeScript → JavaScript en /app/dist
RUN npm run build

# ─── Stage 2: Runner (imagen final) ───────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# En producción solo necesitamos las dependencias de runtime
COPY package*.json ./
RUN npm ci --omit=dev

# Copiamos solo el código compilado del stage anterior
COPY --from=builder /app/dist ./dist

# El puerto que expone el contenedor (debe coincidir con PORT en .env)
EXPOSE 3000

# Variables de entorno con valores por defecto
# Se pueden sobreescribir al hacer docker run -e PORT=4000
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar la app (usa el JS compilado, no ts-node)
CMD ["node", "dist/index.js"]
