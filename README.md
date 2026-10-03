# Yoke – project hub with real-time chat

Yoke keeps a team's projects, task board and chat in one place. The repo holds two apps:

- `apps/api` – NestJS (Express) + TypeORM API backed by PostgreSQL, with a Socket.IO chat room for each project.
- `apps/web` – React + Vite web app with the project list and a drag-and-drop task board. Login and tasks run on mocks until the API has them.

The database runs in Docker Compose; the apps run with Node on your machine.

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
   Optionally set `PORT` to change the port the API listens on (default `3000`).

3. Start PostgreSQL and pgAdmin

   ```bash
   docker compose up -d
   ```

4. Start the apps in watch mode

   ```bash
   npm run dev        # API and web together
   npm run dev:api    # API only
   npm run dev:web    # web only
   ```

The API is now at http://localhost:3000 and the web app at http://localhost:5173.

## Check it works

- http://localhost:3000 – hello endpoint
- http://localhost:3000/db-test – confirms the database connection
- http://localhost:5050 – pgAdmin (login with `PGADMIN_EMAIL` / `PGADMIN_PASSWORD` from `.env`)

To connect pgAdmin to the database, add a server with host `db`, port `5432`, and the `DB_USERNAME` / `DB_PASSWORD` from `.env`.

## HTTP endpoints

| Method | Path            | Description                    |
| ------ | --------------- | ------------------------------ |
| GET    | `/`             | Hello endpoint                 |
| GET    | `/db-test`      | Checks the database connection |
| POST   | `/projects`     | Create a project               |
| GET    | `/projects`     | List projects                  |
| GET    | `/projects/:id` | Get a project by id            |

## Real-time chat (Socket.IO)

A Socket.IO server runs on the same port as the HTTP API. Each project has its own chat room.

Client → server events:

- `joinProject` with `{ projectId: number }` – joins the project's room. The server replies with `joinedProject` and `{ projectId }`.
- `sendMessage` with `{ projectId: number, text: string }` – broadcasts the message to everyone in the project's room.

Server → client events:

- `newMessage` with `{ projectId, text, senderId, sentAt }`

Example with `socket.io-client`:

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('newMessage', (msg) => console.log(msg));

socket.emit('joinProject', { projectId: 1 });
socket.emit('sendMessage', { projectId: 1, text: 'Hello!' });
```

## Stop

```bash
docker compose down        # stop containers, keep data
docker compose down -v     # stop containers and delete the database volume
```

## Other scripts

API scripts are run with `-w api` (the workspace name):

```bash
npm run build -w api        # compile to apps/api/dist/
npm run start:prod -w api   # run compiled build
npm run lint -w api         # eslint with --fix
npm run format -w api       # prettier
npm run test -w api         # unit tests
npm run test:e2e -w api     # e2e tests
```

`npm run build` without `-w` builds both apps.
