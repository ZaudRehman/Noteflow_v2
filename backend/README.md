# Noteflow_v2 Backend

This is the production-ready backend server for the Noteflow_v2 collaborative note-taking application, built with Rust, Axum 0.8, PostgreSQL, and Redis. It provides RESTful APIs for user authentication, note management, and real-time collaboration over WebSocket.

---

## Features

- **User Authentication:** Secure signup and login with hashed passwords (bcrypt) and JWT token-based authentication.
- **Notes CRUD:** Create, read, update, delete notes with revisioning and tagging support.
- **Real-Time Collaboration:** WebSocket-based live note synchronization using Tokio broadcast channel and Redis pub/sub.
- **Database:** PostgreSQL for durable structured storage, managed externally (e.g., Supabase).
- **Cache & Messaging:** Redis used for real-time message broadcasting, managed remotely (e.g., Upstash).
- **Security:** JWT secret stored securely via environment variables, encrypted Redis connection, CORS configured for frontend integration.
- **Dockerized:** Containerized backend for easy deployment and consistent environments.
- **Migrations:** SQLx powered SQL migrations for version-controlled database schema management.

---

## Project Structure

```
backend/
├── src/
│   ├── main.rs               # Application entry point and server setup
│   ├── routes.rs             # REST + WebSocket route configuration
│   ├── auth.rs               # Authentication logic: signup/login with JWT
│   ├── db.rs                 # Database queries and connection handling
│   ├── ws.rs                 # WebSocket handler for real-time sync
│   ├── models.rs             # Core data models (Users, Notes, Revisions, Claims)
│   ├── errors.rs             # Custom error types and response handling
│   ├── utils.rs              # Helpers: password hashing, JWT encode/decode
├── migrations/               # SQL migration scripts for tables and indexes
├── Cargo.toml                # Rust crate and dependency configuration
├── Dockerfile                # Production docker build instructions
├── .env                      # Environment variables
└── README.md                 # This project documentation
```

---

## Setup & Running Locally

### Prerequisites

- Rust and Cargo installed (latest stable)
- SQLx CLI (`cargo install sqlx-cli --no-default-features --features postgres,rustls`)
- Docker & Docker Compose (optional but recommended)
- External PostgreSQL database (e.g., Supabase free tier)
- External Redis instance (e.g., Upstash free tier)

### Configuration

1. Set up the `.env` file and fill in your credentials:

   ```
   DATABASE_URL=postgresql://username:password@host:port/dbname
   REDIS_URL=rediss://:password@host:port
   JWT_SECRET=your_jwt_secret_key_here
   ```

2. Run database migrations:

   ```
   sqlx migrate run
   ```

### Build and Run the Backend

Using Cargo:

```
cargo run --release
```

Using Docker:

```
docker-compose build
docker-compose up
```

The backend listens on port `8080` by default.

---

## API Endpoints

- **POST** `/api/signup`  
  Signup with `{ "username": "...", "password": "..." }`. Returns success status.
- **POST** `/api/login`  
  Login with `{ "username": "...", "password": "..." }`. Returns JWT token.
- **POST** `/api/notes`  
  Create a new note. Requires JWT auth.
- **GET** `/api/users/{user_id}/notes`  
  Fetch user's notes.
- **GET/PUT/DELETE** `/api/notes/{note_id}`  
  Read, update, or delete note by ID.
- **GET** `/api/notes/{note_id}/ws`  
  WebSocket endpoint for real-time collaborative editing.

---

## WebSocket Collaboration Protocol

- Clients connect to `/api/notes/{note_id}/ws`.
- Messages sent or received follow the simple string format:  
  `"note_id:content"`
- Messages are broadcasted to all connected clients on the note.
- Enables live multi-user syncing with conflict-free updates handled by frontend logic.

---

## Logging

Uses `tracing` crate for structured logs. Configure logging level via `RUST_LOG` environment variable, e.g.:

```
RUST_LOG=info cargo run
```

---

## Security

- Passwords are hashed securely with bcrypt.
- JWT secret is environment-driven and not hardcoded.
- Redis connection uses `rediss://` for encrypted communication.
- CORS allows all origins for development; restrict in production accordingly.

---

## Contribution & Support

Contributions are welcome! Please submit pull requests or issues on the project repository.

For support or questions, contact the maintainer at `zaudrehman@gmail.com`.

---

## License

MIT License

---

*Powered by Rust, Axum, SQLx, and Tokio – built by Zaud Rehman*