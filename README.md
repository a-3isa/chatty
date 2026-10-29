# Chatty

A real-time one-to-one chat application: a NestJS backend with Socket.IO, JWT authentication and MongoDB (via Prisma), plus a plain HTML/JS client.

## Features

- Real-time messaging over WebSockets (Socket.IO)
- JWT authentication (Passport) with bcrypt-hashed passwords
- Registration and login
- Persistent message history in MongoDB through Prisma
- Simple static HTML client served by the backend
- Security middleware: Helmet, rate limiting, input validation. See [SECURITY.md](./SECURITY.md).

## Tech stack

NestJS, TypeScript, MongoDB, Prisma, Socket.IO, Passport/JWT, class-validator, bcrypt, Jest, ESLint, Prettier. Client: HTML, CSS, vanilla JavaScript.

## Getting started

Prerequisites: Node.js 18+, npm, and a MongoDB deployment **running as a replica set** (Prisma requires this for MongoDB). A free MongoDB Atlas cluster works out of the box; locally, start `mongod` with `--replSet rs0` and run `rs.initiate()` once.

```bash
git clone https://github.com/a-3isa/chatty
cd chatty
npm install
```

Create `.env`:

```env
# Atlas example; for a local replica set use mongodb://localhost:27017/chatty?replicaSet=rs0
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>/chatty"
JWT_SECRET="change-me"
PORT=3000
```

Generate the client and sync the schema (Prisma migrations are not supported on MongoDB; use `db push`):

```bash
npx prisma generate
npx prisma db push
```

Run:

```bash
npm run start:dev                      # development
npm run build && npm run start:prod    # production
```

Open `http://localhost:3000/client/register.html` to create two users, then use `login.html` and `chat.html` in two browsers to chat.

## API

**Auth**
- `POST /auth/register` with `{ "username", "password" }`
- `POST /auth/login` returns `{ "accessToken", "userId" }`

**Protected (send `Authorization: Bearer <token>`)**
- `GET /users` list users
- `GET /chat/messages?userId=<id>` conversation with a user

**WebSocket events**

```javascript
const socket = io('http://localhost:3000', { auth: { token: accessToken } });
socket.emit('join', userId);
socket.emit('sendMessage', { senderId, receiverId, content });
socket.on('receiveMessage', (message) => { /* render */ });
```

## Structure

```
src/
  auth/       registration, login, JWT strategy
  chat/       REST controller and WebSocket gateway
  messages/   message persistence
  users/      user lookup
  prisma.service.ts
client/       login.html, register.html, chat.html
prisma/       schema.prisma
```

## Testing

```bash
npm run test
npm run test:e2e
npm run test:cov
```

## Roadmap

Group chats, online/offline presence, file sharing, message reactions.

## License

UNLICENSED.
