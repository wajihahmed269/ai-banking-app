# Frontend Agent Standards

These standards apply to the React/Vite frontend under `frontend/`. The frontend owns dashboard rendering, authentication/session behavior, API calls, transaction UI, receipts, notifications, performance mode, and runtime error resilience.

## React/Vite Structure

- Keep application entry behavior in `src/main.jsx` and high-level routing/composition in `src/App.jsx`.
- Prefer focused components under `src/components/` instead of expanding `App.jsx`.
- Keep API modules under `src/api/`: `client.js`, `authApi.js`, `bankingApi.js`, and `aiApi.js`.
- Keep session behavior under `src/auth/session.js`.
- Keep data formatting and transaction utilities under `src/utils/`.
- Keep hooks under `src/hooks/` when stateful behavior is reused across components.
- Static assets belong in `public/` or `src/assets/` according to Vite conventions.

## API Client Conventions

- Route backend calls through the existing API client layer; do not scatter raw `fetch` calls through components.
- Centralize base URL, headers, JSON parsing, authentication headers, and error normalization.
- Treat non-2xx responses as errors with structured details.
- Preserve idempotency key handling for financial write actions when implemented.
- Keep AI calls through `aiApi.js` and banking calls through `bankingApi.js`.
- Do not hardcode production URLs in components; use `src/config.js` or environment-driven configuration.

## Auth And Session Handling

- Store and read auth state consistently through `src/auth/session.js`.
- Attach JWTs only through the API client layer.
- Clear session state on logout, token expiry, or authentication failure.
- Do not render authenticated dashboard data from stale anonymous state.
- Do not log JWTs, Authorization headers, or user-sensitive session payloads.
- Avoid localStorage/sessionStorage sprawl; keep token handling centralized.

## Dashboard Rendering Safety

- Dashboard components must tolerate loading, empty, error, and partial-data states.
- Balance, transaction, notification, and analytics displays must guard against `null`, `undefined`, malformed arrays, and unexpected API fields.
- Use money formatting utilities from `src/utils/money.js` rather than ad hoc formatting.
- Use transaction utilities from `src/utils/transactions.js` for transaction shape or filtering behavior.
- Receipt UI must render stable transaction data and not invent successful outcomes when an API request fails.
- Do not let animation or visual effects block primary banking actions.

## Runtime Error Prevention

- Avoid unsafe property access on API data.
- Keep async effects cancellable or guarded to prevent state updates after unmount.
- Handle rejected promises visibly and consistently through toasts or error states.
- Keep form submit handlers idempotent from the user's perspective: disable duplicate submission while a request is pending.
- Validate amounts and required fields client-side, while still relying on backend validation as authoritative.
- Test empty transaction history, slow network, failed login, failed transfer, and expired session scenarios.

## Lazy Loading Guidance

- Lazy-load heavy visual, AI, animation, or dashboard subtrees when it reduces initial bundle cost.
- Keep authentication-critical UI and primary dashboard shell quick to render.
- Provide stable loading states with `Suspense` or existing skeleton components.
- Avoid lazy-loading so aggressively that common flows feel fragmented.
- Watch bundle impact from `three`, `ogl`, `postprocessing`, and `face-api.js`.

## Component Rules

- Components should have one clear responsibility.
- Business API logic belongs in API modules or hooks, not deeply inside presentational components.
- Prefer props with explicit names and stable shapes.
- Keep component state local unless it needs to coordinate across the dashboard.
- Reuse existing UI components such as `ToastViewport`, `EmptyState`, `Skeletons`, and banking/dashboard components.
- Do not introduce a new design system unless explicitly requested.

## Styling Conventions

- Follow existing CSS organization in `src/App.css`, `src/index.css`, and component-specific CSS files.
- Keep banking workflows readable before decorative.
- Ensure responsive dashboard layouts do not overlap text, controls, or transaction rows.
- Maintain accessibility basics: visible focus, usable contrast, semantic controls, and labels for form inputs.
- Avoid styling changes that make balances, transaction amounts, or status indicators ambiguous.

## Bundle-Size Awareness

- Run production builds after adding dependencies or heavy visual features.
- Do not add a package for behavior already covered by React, Vite, or existing utilities.
- Prefer route/component lazy loading for large libraries.
- Inspect Vite output when bundle size changes materially.
- Keep generated assets out of source unless they are necessary and reasonably sized.

## Debugging Browser Console Issues

1. Reproduce in `npm run dev`.
2. Check console stack traces and component names.
3. Check Network tab status codes, payloads, CORS failures, and Authorization headers.
4. Confirm `src/config.js` resolves the correct backend URL.
5. Confirm session state from `src/auth/session.js`.
6. Add guards for missing API fields instead of assuming perfect backend responses.
7. Run lint and build after the fix.

## Validation And Build Commands

```bash
cd frontend
npm install
npm run lint
npm run build
npm run dev
npm run preview
```

Use `npm run dev` for local reproduction and `npm run build` as the production gate.

## Forbidden Frontend Anti-Patterns

- Raw `fetch` calls scattered across components.
- Logging tokens, passwords, Authorization headers, or full sensitive payloads.
- Rendering fake success states after failed financial requests.
- Storing auth state in multiple unrelated locations.
- Assuming arrays or nested fields always exist in API responses.
- Mutating props or shared transaction data in place.
- Disabling lint rules instead of fixing hook dependencies or unsafe code.
- Adding heavy dependencies without checking production build impact.
- Hardcoding backend, EC2, or production URLs in UI components.
- Letting visual effects break banking workflows, readability, or responsiveness.

