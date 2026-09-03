# TeamSync Frontend

The web client for **TeamSync**, a single-tenant internal HR management system. It's a React SPA that talks to the TeamSync backend over a REST API and covers employees, departments & shifts, users & permissions, attendance, leave, goals, and training.

## Prerequisites

- **Node.js `>=18`** (matches the backend's `engines` requirement)
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

If the variable is omitted the app falls back to `http://localhost:8080/api/v1`.

## Running

```bash
npm run dev      # local development server (Vite, HMR)
npm run build    # production bundle -> dist/
npm run preview  # serve the production bundle locally
npm run lint     # oxlint
```

## Project structure

Feature-folder layout under `src/`:

- **`pages/<module>/`** — one folder per feature area (`employees/`, `leave/`, `attendance/`, …). Each holds its route-level pages plus a local `components/` folder for pieces used only within that module, and occasionally a `utils/` folder for module-specific pure logic.
- **`components/ui/`** — shared, presentational primitives (`Button`, `Modal`, `Table`, `Badge`, `Tabs`, `ProgressBar`, `Toast`, …).
- **`components/form/`** — shared form building blocks (`Input`, `FormField`).
- **`components/layout/`** — the authenticated app shell (`AppLayout`, `Sidebar`, `Topbar`).
- **`hooks/`** — TanStack Query wrappers (one query/mutation concern per file, e.g. `useEmployees`, `useLeaveTypes`).
- **`services/`** — thin axios wrappers, one per backend resource (`employeeService`, `leaveRequestService`, …).
- **`lib/`** — cross-cutting singletons: `axios` (instance + interceptors), `router`, `queryClient`, `token` (session/storage), `permissions` (the permission-matrix mirror + `hasPermission`).
- **`store/AuthContext.jsx`** — auth state, login/logout, auto-logout, cross-tab session sync.
- **`routes/`** — `routeConfig` (the single source of module routes + sidebar metadata) and `ProtectedRoute`.

### Routing

Routes are **role-prefixed**: every authenticated page lives under `/<role>/<path>` (e.g. `/hr/employees`, `/manager/team-leave`, `/employee/my-attendance`). `routeConfig` expands one module definition into one route per allowed role, and `ProtectedRoute` redirects anyone hitting a route their role isn't allowed on back to their own dashboard. The sidebar is generated from the same config via `navLabel` / `navIcon` / `navOrder`.

## Known limitations

- **No document download.** Employee documents (Phase 5) and training documents (Phase 10) can be uploaded and listed, but the backend has no file-download or static-serving route, so there is no download affordance anywhere in the UI. Retrieving document contents would require a backend change.
- **Custom (non-seeded) roles aren't routable.** Only the four seeded roles (`Admin`, `HR`, `Manager`, `Employee`) have registered routes. A user on a custom role can authenticate, but `/<custom-role>/dashboard` has no matching route, so they land on the 404 page. Supporting custom roles end to end (routing, nav, redirect behaviour) is outstanding.
