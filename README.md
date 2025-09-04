Chatty

Chatty is a real-time one-on-one chat application built with NestJS, Prisma, REST APIs, and WebSockets. It enables seamless, low-latency communication between users, making it ideal for applications requiring instant messaging capabilities.

🚀 Features

Real-Time Messaging: Utilizes WebSockets for instant, bi-directional communication between users.

User Authentication: Secure login and registration mechanisms to ensure user privacy.

Message Persistence: Employs Prisma ORM with PostgreSQL for reliable message storage and retrieval.

RESTful API: Provides a REST API for managing user profiles and fetching chat histories.

Typing Indicators: Real-time feedback on user typing status.

Message Status: Indicators for message delivery and read receipts.
The Right Software

🛠️ Technologies Used

NestJS: A progressive Node.js framework for building efficient and scalable server-side applications.

Prisma: An ORM for Node.js and TypeScript, providing a type-safe database client.

WebSocket: Protocol for full-duplex communication channels over a single TCP connection.

PostgreSQL: A powerful, open-source relational database system.

Swagger: API documentation and testing tool integrated via NestJS.

📦 Installation

1. Clone the Repository
   git clone https://github.com/a-3isa/chatty.git
   cd chatty

2. Install Dependencies
   npm install

3. Set Up Environment Variables

Create a .env file in the root directory and configure the following variables:

DATABASE_URL="postgresql://user:password@localhost:5432/chatty"
JWT_SECRET="your_jwt_secret"

4. Run Database Migrations
   npx prisma migrate dev

5. Start the Application
   npm run start

The application will be accessible at http://localhost:3000.
Talent500

🧪 Testing

To run unit and integration tests:
wanago.io
+5
GitHub
+5
Sling Academy
+5

npm run test

📄 API Documentation

API endpoints are documented and can be accessed via Swagger UI at:

http://localhost:3000/api

🧑‍💻 Contributing

Contributions are welcome! Please fork the repository, create a new branch, and submit a pull request.

📄 License

This project is licensed under the MIT License.

Feel free to customize this README further to match any additional features or configurations specific to your project.
