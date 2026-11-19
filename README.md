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
npm run icons    # re-bundle the Lucide icons the code uses (runs before dev and build)
```

## Project structure

Feature-folder layout under `src/`:

- **`pages/<module>/`** — one folder per feature area (`employees/`, `leave/`, `attendance/`, …). Each holds its route-level pages plus a local `components/` folder for pieces used only within that module, and where needed `utils/` (pure helpers) and `hooks/` (page state). Larger pages are split into sub-folders, e.g. `employees/form/` (the employee wizard) and `employees/list/`.
- **`components/ui/`** — shared, presentational primitives (`Button`, `Modal`, `Drawer`, `ConfirmDialog`, `Table`, `Pagination`, `Select`, `Menu`, `Popover`, `Badge`, `Tabs`, `FileActions`, `Toast`, …).
- **`components/form/`** — shared form building blocks (`Input`, `Textarea`, `FormField`, `DatePicker`, `FileDrop`, `EmployeeSearchSelect` and the `employeeOption` helpers that show a person's role next to their name).
- **`components/layout/`** — the app shells (`AppLayout` with `Sidebar` and `Topbar`; `AuthLayout` for the login page).
- **`hooks/`** — TanStack Query wrappers (one query/mutation concern per file, e.g. `useEmployees`, `useLeaveTypes`) plus a few shared UI hooks: `useListFilters` (filters + page number for list pages, as a `useReducer`), `useDebouncedValue`, `useScrollFade` (edge fades on scroll containers), `useMotion` and the `toast` helper in `useToast`.
- **`services/`** — thin axios wrappers, one per backend resource (`employeeService`, `leaveRequestService`, …).
- **`lib/`** — cross-cutting singletons: `axios` (instance + interceptors), `router`, `queryClient`, `config` (env), `token` (session/storage), `sessionEvents`, `errors`, `files` (authenticated download/preview), `permissions` (`hasPermission` and role-rank helpers), `motion`, `theme` (light/dark appearance) and `icons` (registers the bundled icon set in `icons.json`).
- **`store/`** — `AuthContext.jsx` (the `AuthProvider`: session, login/logout, auto-logout, cross-tab sync), `useAuth.js` (the hook that reads it) and `ui/` (small zustand stores for layout and toasts).
- **`scripts/`** — `build-icons.mjs`, which bundles the icons the code uses (see below).
- **`routes/`** — `routeConfig` (the single source of routes, their permissions and sidebar metadata), `ProtectedRoute` and `Redirects`.

Server data lives in TanStack Query; local page state (filters, dialogs, pagination) lives in small `useReducer` hooks next to each page.

### Routing and permissions

Routes are flat (`/employees`, `/team-leave`, `/my-attendance`, …). Each route in `routeConfig` lists the permissions that unlock it (`anyOf`), and some also need the user to have an employee profile. The signed-in user's permission list comes from the backend (`/auth/login` and `/auth/me`), so a custom role works like any other: the sidebar shows exactly the pages its permissions allow, and `ProtectedRoute` shows a "no access" (403) page to anyone opening a page they can't use. Old role-prefixed bookmarks (`/hr/employees`) redirect to the flat path.

## UI conventions

- **Appearance.** Light or dark, switched with the sun/moon toggle in the topbar (next to the profile menu) and remembered per browser (`localStorage` key `teamsync.theme`; light until changed). An inline script in `index.html` applies it before the app loads, so there's no flash of the wrong theme. Colours are CSS variables in `src/styles/index.css`: light values in `@theme`, dark overrides under `[data-theme="dark"]`. Use the token classes (`bg-surface`, `text-fg-muted`, `border-line`, …) rather than fixed colours so new UI works in both themes.
- **No visible scrollbars.** Scrollbars are hidden app-wide. Scroll containers use `useScrollFade` to fade the edge that has more content: the sidebar, modals, drawers, tabs, tables, the permissions matrix and dropdown menus. The sidebar also shows a small arrow that scrolls down, then back to the top. Use the hook for any new scrolling area.
- **Icons** are [Lucide](https://lucide.dev) via Iconify (`<Icon icon="lucide:name" />`). `npm run icons` copies every `lucide:` icon referenced in `src/` into `src/lib/icons.json`, so icons render without a network request. It runs automatically before `dev` and `build`; run it by hand after adding an icon while the dev server is running.
- **Dates.** `DateField` / `DateRangeField` from `components/form/DatePicker`. With `withDropdownNav`, the month and year pickers use the app's `Select`. `fromYear` / `toYear` limit the range: date of birth allows only years that make someone 18–70 this year.
- **Placeholders** say what to enter ("Enter department name"). Add an example only where the format matters (`name@company.com`, `EMP-001`, phone numbers). Selects say what to pick ("Select a role…"), and filters say what an empty value means ("Any status").
- **Confirm before changing records.** Actions that change data straight away (deleting, changing an employee's shift) go through `ConfirmDialog`.

## Known limitations

- **Saved manager shows no role in the edit form.** The employee details endpoint returns the manager's name without their role, so the Manager field shows the role only after you pick a new manager.
- **Date-of-birth limits are by year.** Any day in the allowed years can be picked, so someone born late in the youngest allowed year can be 17 for part of the year.
