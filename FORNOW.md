Noteflow_v2/
├── backend/
│ ├── src/
│ │ ├── main.rs // Entry point
│ │ ├── routes.rs // REST + WebSocket routes
│ │ ├── auth.rs // JWT login/signup/logout
│ │ ├── models.rs // User, Note, Revision structs
│ │ ├── db.rs // SQLx: DB connectors, queries
│ │ ├── ws.rs // WebSocket handler (real-time sync)
│ │ ├── errors.rs // Custom error types
│ │ ├── utils.rs // Crypto helpers, misc utilities
│ ├── migrations/ // SQLx migrations for schema/version control
│ ├── tests/ // Backend unit/integration/API tests
│ ├── Cargo.toml
│ ├── .env.example // Sample env config
│ ├── Dockerfile
│ └── README.md
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Editor.tsx
│ │ │ ├── NoteCard.tsx
│ │ │ ├── ShareModal.tsx
│ │ │ ├── RevisionViewer.tsx
│ │ │ ├── AIInsightsPanel.tsx
│ │ │ └── SyncIndicator.tsx
│ │ ├── pages/
│ │ │ ├── index.tsx
│ │ │ ├── note/[id].tsx
│ │ │ └── settings.tsx
│ │ ├── hooks/
│ │ │ ├── useWebSocket.ts
│ │ │ ├── useNoteSync.ts
│ │ │ └── useAuth.ts
│ │ ├── utils/
│ │ │ └── formatDate.ts
│ ├── tests/ // Frontend component/unit tests
│ ├── package.json
│ ├── tsconfig.json
│ ├── tailwind.config.js
│ ├── postcss.config.js
│ ├── Dockerfile
│ └── README.md
│
├── ai_microservice/
│ ├── app.py // FastAPI endpoints for AI features
│ ├── requirements.txt
│ ├── Dockerfile
│ └── README.md
│
├── docker-compose.yml // Orchestration: Rust backend + Postgres + Redis + AI + Frontend (optional)
├── README.md // Root project overview
└── docs/
├── architecture.md // System design diagrams + explanations
├── api.md // REST + WebSocket endpoint docs
└── setup.md // Local dev, cloud setup, deployment guides
