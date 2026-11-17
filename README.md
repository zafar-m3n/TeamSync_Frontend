# TeamSync Frontend

The web client for **TeamSync**, a single-tenant internal HR management system. It's a React SPA that talks to the TeamSync backend over a REST API and covers employees, departments & shifts, users, roles & permissions, attendance (clock in/out), leave and holidays, goals, and training.

## Prerequisites

- **Node.js 20.19+ or 22.12+** (required by Vite 8)
- A running instance of the TeamSync backend

## Setup

```bash
npm install
cp .env.example .env
```

Then edit `.env` and point `VITE_API_BASE_URL` at your backend:

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

The variable is required: without it the app shows a configuration error instead of starting.

## Running

```bash
npm run dev      # local development server (Vite, HMR)
npm run build    # production bundle -> dist/
npm run preview  # serve the production bundle locally
npm run lint     # oxlint
```

## Project structure

Feature-folder layout under `src/`:

- **`pages/<module>/`** — one folder per feature area (`employees/`, `leave/`, `attendance/`, …). Each holds its route-level pages plus a local `components/` folder for pieces used only within that module, and where needed `utils/` (pure helpers) and `hooks/` (page state). Larger pages are split into sub-folders, e.g. `employees/form/` (the employee wizard) and `employees/list/`.
- **`components/ui/`** — shared, presentational primitives (`Button`, `Modal`, `Table`, `Badge`, `Tabs`, `Dropdown`, `FileActions`, `Toast`, …).
- **`components/form/`** — shared form building blocks (`Input`, `FormField`, `DatePicker`, `EmployeeSearchSelect`).
- **`components/layout/`** — the app shells (`AppLayout` with `Sidebar` and `Topbar`; `AuthLayout` for the login page).
- **`hooks/`** — TanStack Query wrappers (one query/mutation concern per file, e.g. `useEmployees`, `useLeaveTypes`) plus a few shared UI hooks: `useListFilters` (filters + page number for list pages, as a `useReducer`), `useDebouncedValue`, `useCountUp` and the `toast` helper in `useToast`.
- **`services/`** — thin axios wrappers, one per backend resource (`employeeService`, `leaveRequestService`, …).
- **`lib/`** — cross-cutting singletons: `axios` (instance + interceptors), `router`, `queryClient`, `config` (env), `token` (session/storage), `sessionEvents`, `files` (authenticated download/preview) and `permissions` (`hasPermission` and role-rank helpers).
- **`store/`** — `AuthContext.jsx` (the `AuthProvider`: session, login/logout, auto-logout, cross-tab sync) and `useAuth.js` (the hook that reads it).
- **`routes/`** — `routeConfig` (the single source of routes, their permissions and sidebar metadata), `ProtectedRoute` and `Redirects`.

Server data lives in TanStack Query; local page state (filters, dialogs, pagination) lives in small `useReducer` hooks next to each page.

### Routing and permissions

Routes are flat (`/employees`, `/team-leave`, `/my-attendance`, …). Each route in `routeConfig` lists the permissions that unlock it (`anyOf`), and some also need the user to have an employee profile. The signed-in user's permission list comes from the backend (`/auth/login` and `/auth/me`), so a custom role works like any other: the sidebar shows exactly the pages its permissions allow, and `ProtectedRoute` sends anyone opening a page they can't use back to `/dashboard`. Old role-prefixed bookmarks (`/hr/employees`) redirect to the flat path.

## Known limitations

- **Light mode only.** There is no dark theme.
- **Pages without a sidebar entry show "Dashboard" as the page title.** The topbar title comes from the route's nav label, so My Profile and the employee detail and edit pages fall back to "Dashboard".
- **List pages use their own Previous/Next controls.** Most list pages still render inline pagination rather than the shared `Pagination` component.
