# Noteflow Frontend

Welcome to the Noteflow frontend application — a modern, collaborative note-taking app featuring a fresh neumorphic pastel UI inspired by light gradients, soft shadows, and elegant typography.

---

## Features

- **Collaborative Editing:** Real-time multiuser editing using Yjs and WebSocket sync.
- **AI-powered Insights:** Integrated AI-generated summaries and smart tag suggestions.
- **Rich Text Editor:** Powered by TipTap with seamless revision history and content sync.
- **Neumorphic Design:** Soft UI with pastel gradients and layered shadows for a futuristic yet approachable feel.
- **Theme Support:** Light and dark modes with smooth transitions adapting pastel palettes.
- **User Profiles & Authentication:** Secure JWT-based login/signup flow with account management.
- **Responsive Layout:** Central stacked card layouts optimized for desktop and mobile.
- **Accessible & WCAG-compliant:** High contrast and semantic UI components.

---
## Project Structure

```
frontend/
├── src/
│ ├── components/         # Reusable React components with neumorphic pastel styling
│ ├── context/            # React context providers (e.g., AuthContext)
│ ├── hooks/              # Custom React hooks for auth, API calls, WebSocket, sync, etc.
│ ├── pages/              # Next.js page routes
│ │ ├── \_app.tsx         # Main app wrapper with global providers and layout
│ │ ├── index.tsx         # Dashboard showing notes overview
│ │ ├── login.tsx         # Login page
│ │ ├── signup.tsx        # Signup page
│ │ ├── note/             # Note-related routes
│ │ │ └── [id].tsx        # Note editing/detail page integrating editor and panels
│ │ └── settings.tsx      # User settings and theme toggling page
│ ├── styles/             # Global CSS and Tailwind CSS extensions
│ ├── types/              # Shared TypeScript types and interfaces
│ └── utils/              # Utility functions, e.g., date formatting
├── public/               # Static assets like images and SVG backgrounds
├── package.json          # npm dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration with theme extensions
├── postcss.config.js     # PostCSS setup for Tailwind CSS
├── tsconfig.json         # TypeScript configuration
├── Dockerfile            # Docker instructions for containerizing frontend
└── README.md             # Project documentation and instructions

```
---
## Getting Started

### Requirements

- Node.js 18 or higher
- NPM or Yarn
- Running backend API compatible with Noteflow frontend

### Installation

Clone this repository and install dependencies:
```
npm install
```
or

```
yarn
```

### Development

Start the development server:

```
npm run dev
```

Open your browser at: [http://localhost:3000](http://localhost:3000)

### Building for Production

```
npm run build
npm run start
```

### Docker

Build and run your Docker container:

```
docker build -t noteflow-frontend .
docker run -p 3000:3000 noteflow-frontend
```

---

## Styling

Tailwind CSS extended with custom pastel colors and shadows:

- Pastel pink, mint green, lavender, coral accents
- Neumorphic shadows: layered inset and outset shadows for depth
- Typography: Inter font with elegant spacing and readability
- Dark mode: adapted muted pastel shades on charcoal backgrounds
- Smooth transitions for theme toggling

---

## Contribution & Support

Contributions are welcome!

- Fork the repo
- Create a feature branch
- Submit a pull request with descriptive commits

Please follow the existing style guide and code conventions.

For support or questions, contact the maintainer at `zaudrehman@gmail.com`.

---

## License

This project is licensed under the MIT License.

---
_Powered by Next.js + React + Tailwind CSS – built by Zaud Rehman_