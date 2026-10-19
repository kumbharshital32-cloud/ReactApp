# Users Web App

Frontend for the **User Directory** coding task: a React single-page app with a **List** page and an **Add** page (plus Edit and Delete). Built with React 19 + Vite, Bootstrap, AG Grid, and Auth0 login. The backend lives in a separate repository: [UsersApi](https://github.com/kumbharshital32-cloud/UsersApi).

## Tech stack
- React 19 (JavaScript) with Vite 8
- React Router 8 for pages and navigation
- Bootstrap 5.3 for styling
- AG Grid Community 36 for the users table (sorting, column resizing)
- Auth0 React SDK (OAuth2 / OIDC) for login and access tokens
- Browser `fetch` API for HTTP calls

## Prerequisites
- [Node.js](https://nodejs.org/) 22.22 or newer (includes npm)
- The **UsersApi** backend running at `http://localhost:5165` (see its README)

Check they're installed:

```bash
node --version
npm --version
```

## Getting started

```bash
# 1. Clone the repository
git clone <this-repo-url>
cd ReactApp/ReactApp

# 2. Install packages
npm install

# 3. Run the app
npm run dev
```

The app runs at **http://localhost:5174**.

> The port is fixed (`server: { port: 5174, strictPort: true }` in `vite.config.js`), because the API's CORS policy and the Auth0 callback URLs expect exactly this address. If the port is busy, Vite stops with an error instead of silently picking another port.

Other commands:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm run lint      # check the code with oxlint
```

## Configuration

All settings are in `ReactApp/.env`.

### API
```
VITE_API_URL=http://localhost:5165
```
- The backend's base URL. Every API call uses it (`import.meta.env.VITE_API_URL`).

### Authentication (Auth0)
```
VITE_AUTH0_DOMAIN=dev-ur2864mr0lo4dht2.us.auth0.com
VITE_AUTH0_CLIENT_ID=Qt0J2uJkmf5CnXlr7F5q6ecv1e8Rs5jH
VITE_AUTH0_AUDIENCE=https://usersapi
```
- **Domain**: the Auth0 tenant.
- **Client ID**: the Auth0 *Single Page Application*. It's public by design; no client secret is used in the frontend.
- **Audience**: the API identifier. It must match the backend's `Auth:Audience`, otherwise the API rejects the token with 401.

Only variables starting with `VITE_` are available in the code. Restart `npm run dev` after changing `.env`.

### Auth0 dashboard (only if you use your own tenant)
1. **Applications → Applications → Create → Single Page Application.** Set **Allowed Callback URLs**, **Allowed Logout URLs** and **Allowed Web Origins** to `http://localhost:5174`.
2. **Applications → APIs → Create API** with the identifier `https://usersapi`.
3. In that API's **Settings → Application Access Policy**, set **User-Delegated Access** to *All apps allowed* (or grant the SPA access in the **Application Access** tab). Without this, login fails with *"Client … is not authorized to access resource server"*.
4. Create an app user in **User Management → Users**, or use **Sign up** on the login page. The Auth0 dashboard account is not an app user.

## Pages

| Route | Page | Description | Auth |
|---|---|---|---|
| `/` | List | All users in a grid: Name, Age, City, State, Pincode. Edit/Delete buttons when logged in | **Public** |
| `/users/add` | Add | Form to create a user | Login required |
| `/users/edit/:id` | Edit | Same form, pre-filled; saves with `PUT` | Login required |

The top bar has **List** and **Add** links, and **Login / Logout** (with the user's email when logged in).

### API calls

| Page | Request | Token |
|---|---|---|
| List | `GET /api/users` | – |
| Add | `POST /api/users` | Bearer |
| Edit | `GET /api/users/{id}`, then `PUT /api/users/{id}` | Bearer |
| Delete (List) | `DELETE /api/users/{id}` | Bearer |

## Authentication

Login uses **Auth0** (OAuth2 / OIDC, Authorization Code flow with PKCE, handled by the Auth0 React SDK).

**Access decision:**
- The **List** page is **public**, so anyone can view users.
- **Add** and **Edit** require login, and the Edit/Delete buttons are hidden when logged out.

How it works:
- `Auth0Provider` (in `main.jsx`) wraps the app with the domain, client ID and audience.
- Protected pages use `withAuthenticationRequired`. Opening them while logged out redirects to the Auth0 login.
- Before each protected API call, the app gets an access token with `getAccessTokenSilently()` and sends `Authorization: Bearer <token>`. The API validates it.

## Validation rules

Checked on submit, before any request is sent. Each invalid field turns red and shows a message under it. The message clears as the user types.

| Field | Type | Rules |
|---|---|---|
| `name` | string | required, 2–100 characters |
| `age` | integer | required, whole number, 0–120 |
| `city` | string | required |
| `state` | string | required |
| `pincode` | string | required, 4–10 characters |

The API enforces the same rules again (400 Bad Request).

## Project structure

```
ReactApp/
├── README.md
└── ReactApp/
    ├── src/
    │   ├── component/
    │   │   ├── UserComponent.jsx   List page: loads users, AG Grid, edit/delete handlers
    │   │   ├── UserActions.jsx     Grid cell with Edit / Delete buttons
    │   │   └── AddUser.jsx         Add/Edit form: inputs, validation, POST/PUT
    │   ├── App.jsx                 Top bar and routes (Add/Edit protected)
    │   └── main.jsx                Entry: Bootstrap CSS, AG Grid modules, Auth0Provider, router
    ├── .env                        API URL and Auth0 settings
    ├── index.html                  The single HTML page
    ├── vite.config.js              Dev server on port 5174
    └── package.json                Dependencies and scripts
```

## Notes
- **Single form for Add and Edit:** `AddUser.jsx` checks the URL (`/users/edit/:id`) to switch between create (`POST`) and update (`PUT`), so the validation is written once.
- **Controlled inputs:** form values live in one state object; one `handleChange` updates any field by its `name`.
- **Delete** asks for confirmation, calls the API, and removes the row from the grid without reloading.
- **AG Grid** modules are registered once in `main.jsx` (`AllCommunityModule`), as required since AG Grid v33.

## Development process
1. **Backend first:** built and tested the API in Swagger (CRUD, validation, SQLite, JWT) before starting the UI.
2. **Scaffold:** created the app with `npm create vite@latest` (React, JavaScript), removed the demo content, added Bootstrap.
3. **List page:** AG Grid with sample data first, then real data from `GET /api/users` using `useEffect` + `fetch`, with the API URL in `.env`.
4. **Routing:** React Router with List and Add pages and a top navigation bar.
5. **Add form:** controlled inputs, a `validate()` function, and inline Bootstrap error messages.
6. **Auth0:** `Auth0Provider`, Login/Logout, the access token sent to the API, the Add/Edit routes protected, and the Edit/Delete buttons hidden when logged out.
7. **Edit and Delete:** Edit reuses the Add form and saves with `PUT`; Delete confirms, calls `DELETE`, and updates the grid.

Problems solved along the way: an import path whose upper/lower case only worked on Windows, a `.env` file Vite didn't recognise (it must be named exactly `.env`), a port clash with another local app (fixed port + CORS), and an Auth0 access-policy error.

## Technologies and AI tools disclosure
- **Technologies:** React, Vite, React Router, Bootstrap, AG Grid Community, Auth0 React SDK.
- **AI assistance:** I used **Claude Code** (Anthropic's AI coding assistant, in VS Code) throughout as a tutor and reviewer. It explained React concepts, broke the work into small steps, suggested code snippets, reviewed my code, and helped diagnose errors (the CORS/port clash, Auth0 configuration, React state issues). I wrote and integrated the application code following that guidance. The AI made a few small edits directly (for example a class-name typo fix) and drafted this README, which I reviewed.

## Known limitations / not done
- **Bonus items not implemented:** unit tests and Docker / docker-compose.
- No loading spinner, custom empty/error message, or success toast yet. *(Update this section once they're added.)*
- Errors and confirmations on Edit/Delete use simple `alert` / `confirm` dialogs.
