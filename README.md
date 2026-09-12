# Project Hub API

NestJS + Fastify + TypeORM API backed by PostgreSQL. The database runs in Docker Compose; the app runs with Node on your machine.

## Prerequisites

- Node.js 20+
- Docker Desktop (with Docker Compose)

## Run locally

1. Install dependencies

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=project_hub

   PGADMIN_EMAIL=admin@admin.com
   PGADMIN_PASSWORD=admin
   ```

   These values are used by both Docker Compose and the app. Change them if you like.

3. Start PostgreSQL and pgAdmin

   ```bash
   docker compose up -d
   ```

4. Start the API in watch mode

   ```bash
   npm run start:dev
   ```

The API is now at http://localhost:3000.

## Check it works

- http://localhost:3000 – hello endpoint
- http://localhost:3000/db-test – confirms the database connection
- http://localhost:5050 – pgAdmin (login with `PGADMIN_EMAIL` / `PGADMIN_PASSWORD` from `.env`)

To connect pgAdmin to the database, add a server with host `db`, port `5432`, and the `DB_USERNAME` / `DB_PASSWORD` from `.env`.

## Stop

```bash
docker compose down        # stop containers, keep data
docker compose down -v     # stop containers and delete the database volume
```

## Other scripts

```bash
npm run build        # compile to dist/
npm run start:prod   # run compiled build
npm run lint         # eslint with --fix
npm run format       # prettier
npm run test         # unit tests
npm run test:e2e     # e2e tests
```
