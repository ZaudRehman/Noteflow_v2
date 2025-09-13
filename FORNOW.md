Noteflow_v2/
├── backend/
│ ├── src/
│ │ ├── main.rs       // Entry point
│ │ ├── routes.rs     // REST + WebSocket routes
│ │ ├── auth.rs       // JWT login/signup/logout
│ │ ├── models.rs     // User, Note, Revision structs
│ │ ├── db.rs         // SQLx: DB connectors, queries
│ │ ├── ws.rs         // WebSocket handler (real-time sync)
│ │ ├── errors.rs     // Custom error types
│ │ ├── utils.rs      // Crypto helpers, misc utilities
│ ├── migrations/     // SQLx migrations for schema/version control
│ ├── tests/          // Backend unit/integration/API tests
│ ├── Cargo.toml
│ ├── .env            // env config
│ ├── Dockerfile
│ └── README.md
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Editor.tsx              # Rich text collaborative editor with neumorphic UI
│ │ │ ├── NoteCard.tsx            # Note preview cards with soft shadows, pastel accents
│ │ │ ├── ShareModal.tsx          # Modal to share notes with permissions & expiry
│ │ │ ├── RevisionViewer.tsx      # Revision history panel with diff and restore UI
│ │ │ ├── AIInsightsPanel.tsx     # AI-driven summary and tags with neumorphic styling
│ │ │ ├── SyncIndicator.tsx       # Real-time sync status indicator with collaborator info
│ │ │ ├── Header.tsx              # Top app header with user menu & auth controls
│ │ │ ├── Sidebar.tsx             # Collapsible sidebar with pastel highlights
│ │ │ ├── FeedbackToast.tsx       # Toast notifications with pastel neumorphic style
│ │ │ └── UserPresence.tsx        # Displays collaborators cursors/names in pastel colors
│ │ ├── context/
│ │ │ └── AuthContext.tsx         # Authentication state provider, integrating with useAuth
│ │ ├── hooks/
│ │ │ ├── useWebSocket.ts         # WebSocket connection hook with reconnection strategy
│ │ │ ├── useNoteSync.ts          # Hook integrating Yjs + WebSocket for collaboration
│ │ │ ├── useAuth.ts              # Auth hook managing login/logout and token state
│ │ │ └── useApiClient.ts         # Centralized fetch wrapper with JWT & error handling
│ │ ├── pages/
│ │ │ ├── \_app.tsx               # Main app wrapper with global providers & layout
│ │ │ ├── index.tsx               # Dashboard page with notes overview
│ │ │ ├── login.tsx               # Login page
│ │ │ ├── signup.tsx              # Signup page
│ │ │ ├── note/
│ │ │ │ └── [id].tsx              # Note editing/detail page integrating Editor & panels
│ │ │ └── settings.tsx            # User settings page with theme toggling
│ │ ├── styles/
│ │ │ └── globals.css             # Global styles including base resets and typography
│ │ ├── utils/
│ │ │ └── formatDate.ts           # Date formatting utilities using date-fns
│ │ └── types/
│ │   └── index.ts                # Shared TypeScript types & interfaces
│ ├── public/                     # Static assets like images, icons
│ ├── tests/
│ │ ├── components/
│ │ ├── hooks/
│ │ └── pages/
│ ├── package.json                # npm dependencies and scripts
│ ├── tsconfig.json               # Typescript configuration
│ ├── tailwind.config.js          # Tailwind CSS configuration including theme extensions
│ ├── postcss.config.js           # PostCSS setup for Tailwind
│ ├── Dockerfile                  # Docker instructions for containerizing frontend
│ └── README.md                   # Frontend-specific project documentation
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





Additional API usage in frontend (beyond backend routes.rs)
AI Summary and Tags: calls to an AI microservice endpoint like /api/ai/summary/{note_id} for NLP features — Not currently in backend routes, this will require implementing corresponding backend handlers for AI functionality.

Sharing Invitations: POST /api/notes/{note_id}/share — used in ShareModal to send invites. This endpoint should be implemented server-side if not already.

Revision Restore: POST /api/notes/{note_id}/revisions/{revision_id}/restore — used in RevisionViewer to restore old versions of notes. This also needs backend support.



{
"name": "frontend",
"version": "0.1.0",
"private": true,
"scripts": {
"dev": "next dev --turbopack",
"build": "next build --turbopack",
"start": "next start",
"lint": "next lint"
},
"dependencies": {
"react": "19.1.0",
"react-dom": "19.1.0",
"next": "15.5.2"
},
"devDependencies": {
"typescript": "^5",
"@types/node": "^20",
"@types/react": "^19",
"@types/react-dom": "^19",
"@tailwindcss/postcss": "^4",
"tailwindcss": "^4",
"eslint": "^9",
"eslint-config-next": "15.5.2",
"@eslint/eslintrc": "^3"
}
}
