# FormaChat Frontend

A vanilla TypeScript + Vite single-page application that provides the dashboard and embeddable chat widget for the FormaChat platform.

## Tech Stack

- **Language:** TypeScript 5.9
- **Bundler:** Vite 7
- **Package Manager:** pnpm
- **Runtime:** Browser (no framework — custom router and components)
- **Backend API:** `https://formachat.onrender.com`

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Install & Run

```bash
cd client
pnpm install
pnpm dev
```

The dev server starts at `http://localhost:5173`.

### Build

```bash
pnpm build        # type-check + bundle
pnpm preview      # preview the production build locally
pnpm type-check   # type-check only (no emit)
```

## Project Structure

```
client/
├── src/
│   ├── config/
│   │   └── api.config.ts        # API base URLs and all endpoint constants
│   ├── components/              # Reusable UI components (vanilla TS)
│   ├── pages/
│   │   ├── public/              # Home, login, register, verify-email, chat widget
│   │   └── dashboard/           # Protected dashboard pages
│   │       ├── businesses/      # Business CRUD pages
│   │       ├── channels/        # Channel detail pages
│   │       └── analytics/       # Analytics pages
│   ├── services/                # API service wrappers
│   │   ├── auth.service.ts
│   │   ├── business.service.ts
│   │   ├── chat.service.ts
│   │   └── feedback.service.ts
│   ├── types/                   # TypeScript interfaces
│   ├── utils/                   # Helpers (auth, fetch, DOM, token refresh)
│   ├── router.ts                # Hash-based SPA router
│   ├── main.ts                  # App entry point
│   └── style.css
├── public/
│   └── assets/
├── index.html
├── package.json
└── tsconfig.json
```

## Routing

Navigation uses URL hash (`/#/path`). Routes are registered in [client/src/router.ts](client/src/router.ts).

| Path | Auth required | Description |
|------|:---:|---|
| `/` | No | Home / landing page |
| `/login` | No | Login |
| `/register` | No | Registration |
| `/verify-email` | No | OTP email verification |
| `/chat/:businessId` | No | Embeddable chat widget |
| `/dashboard` | Yes | Dashboard home |
| `/dashboard/businesses` | Yes | Business list |
| `/dashboard/businesses/create` | Yes | Create business |
| `/dashboard/businesses/:id/edit` | Yes | Edit business |
| `/dashboard/channels` | Yes | Channels list |
| `/dashboard/channels/:id` | Yes | Channel details |
| `/dashboard/analytics` | Yes | Analytics overview |
| `/dashboard/analytics/:id` | Yes | Analytics detail |

## API Configuration

All endpoints are defined in [client/src/config/api.config.ts](client/src/config/api.config.ts):

```ts
export const API_BASE_URLS = {
  AUTH:     'https://formachat.onrender.com/api/v1/auth',
  BUSINESS: 'https://formachat.onrender.com/api/v1',
  CHAT:     'https://formachat.onrender.com/api/chat',
};
```

To point at a local backend instead, replace the URLs above.

## Authentication

- JWT-based — access token + refresh token stored in `localStorage`
- The app auto-refreshes the access token 30 seconds before expiry
- A 401 response triggers an automatic refresh; failure redirects to `/login`
- Tokens are cleared on explicit logout or when refresh fails

## Embed / Widget Mode

The chat widget at `/chat/:businessId` can be embedded in any third-party site via an `<iframe>`. Embed mode is detected automatically when:

- The page is loaded inside an iframe (`window.self !== window.top`)
- The URL contains `?embed=true` or `#embed=true`

In embed mode the router skips all auth guards and renders only the chat widget.
