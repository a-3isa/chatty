# Chatty - Real-Time Chat Application

A modern real-time chat application built with NestJS backend and simple HTML frontend, featuring user authentication, WebSocket-based messaging, and persistent message storage.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery using WebSockets with Socket.IO
- **User Authentication**: Secure JWT-based authentication with Passport
- **User Management**: Registration and login system
- **Persistent Messages**: All messages stored in PostgreSQL database with Prisma ORM
- **Simple UI**: Clean, responsive HTML interface
- **Cross-platform**: Works on desktop and mobile browsers

## 🛠️ Technology Stack

### Backend

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Passport
- **Real-time**: Socket.IO
- **Validation**: class-validator + class-transformer
- **Password Hashing**: bcrypt

### Frontend

- **HTML5**: Semantic markup
- **CSS3**: Custom styling
- **JavaScript**: ES6+ features
- **WebSockets**: Socket.IO client

### Development Tools

- **Linting**: ESLint
- **Code Formatting**: Prettier
- **Testing**: Jest
- **Build Tool**: NestJS CLI

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database
- Git

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/a-3isa/chatty
   cd chatty
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/chatty_db"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=3000
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # (Optional) Seed the database
   npx prisma db seed
   ```

## 🚀 Running the Application

### Development Mode

```bash
# Start the backend server
npm run start:dev

# The server will be running at http://localhost:3000
```

### Production Mode

```bash
# Build the application
npm run build

# Start the production server
npm run start:prod
```

### Frontend Access

Open your browser and navigate to:

- **Login Page**: `http://localhost:3000/client/login.html`
- **Register Page**: `http://localhost:3000/client/register.html`
- **Chat Interface**: `http://localhost:3000/client/chat.html`

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword"
}
```

#### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1
}
```

### Chat Endpoints

#### Get Messages (Protected)

```http
GET /chat/messages?userId=2
Authorization: Bearer <access_token>
```

**Response:**

```json
[
  {
    "id": 1,
    "content": "Hello!",
    "senderId": 1,
    "receiverId": 2,
    "createdAt": "2024-01-01T10:00:00.000Z",
    "sender": {
      "username": "johndoe"
    }
  }
]
```

#### Get Users (Protected)

```http
GET /users
Authorization: Bearer <access_token>
```

### WebSocket Events

#### Connection

```javascript
const socket = io('http://localhost:3000', {
  auth: { token: accessToken },
  extraHeaders: { authorization: 'Bearer ' + accessToken },
});
```

#### Join Room

```javascript
socket.emit('join', userId);
```

#### Send Message

```javascript
socket.emit('sendMessage', {
  senderId: 1,
  receiverId: 2,
  content: 'Hello, World!',
});
```

#### Receive Message

```javascript
socket.on('receiveMessage', (message) => {
  console.log('New message:', message);
});
```

## 🗂️ Project Structure

```
chatty/
├── src/
│   ├── app.controller.ts      # Main application controller
│   ├── app.module.ts          # Root application module
│   ├── app.service.ts         # Main application service
│   ├── main.ts                # Application entry point
│   ├── auth/                  # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   └── dto/
│   ├── chat/                  # Chat module
│   │   ├── chat.controller.ts
│   │   ├── chat.gateway.ts    # WebSocket gateway
│   │   ├── chat.module.ts
│   │   └── chat.service.ts
│   ├── messages/              # Messages module
│   ├── users/                 # Users module
│   └── prisma.service.ts      # Prisma database service
├── client/                    # Frontend files
│   ├── login.html
│   ├── register.html
│   └── chat.html
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── test/                      # Test files
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run test coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## 📜 Scripts

- `npm run build` - Build the application
- `npm run format` - Format code with Prettier
- `npm run start` - Start production server
- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start debug mode
- `npm run start:prod` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests

## 🔒 Security Features

For comprehensive security documentation, see [SECURITY.md](./SECURITY.md)

### Core Security Features

- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Password Security**: bcrypt hashing with strength validation
- **Account Lockout**: Automatic lockout after failed login attempts
- **Input Sanitization**: Global middleware preventing XSS and injection attacks
- **CSRF Protection**: JWT-based CSRF protection for HTML clients
- **Security Headers**: Helmet middleware with comprehensive HTTP security headers
- **CORS Configuration**: Environment-specific CORS policies
- **Rate Limiting**: Global throttling to prevent abuse
- **Password Reset**: Secure token-based password reset flow
- **Input Validation**: class-validator with comprehensive DTO validation
- **WebSocket Security**: Authentication middleware for real-time connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

## 📞 Support

If you have any questions or need help, please open an issue in the repository.

## 🔄 Future Enhancements

- [ ] Add user profile pictures
- [ ] Implement group chat functionality
- [ ] Add message encryption
- [ ] Mobile app development
- [ ] File sharing capabilities
- [ ] Message reactions and replies
- [ ] Online/offline status indicators
