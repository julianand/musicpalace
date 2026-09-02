# E2E Playwright — plan de build por fases

Plan de implementación de los tests e2e. Cada fase se construye y se **verifica corriendo sus tests** antes de pasar a la siguiente.

## Decisiones fijadas

- **Sin `dotenv`**: se usa `process.loadEnvFile('.env')` (nativo de Node ≥20.12) en `playwright.config.ts`. El `.env` se lee igual para `next dev` (lo carga solo) y Prisma (`prisma.config.ts`).
- **Usuario de test auto-provisionado**: `auth.setup.ts` hace sign-up con `e2e-<timestamp>@example.com` (password constante ≥6 chars) y guarda el `storageState` en `playwright/.auth/user.json`. Requiere "Confirm email" desactivado en Supabase (ya confirmado).
- **Cascades en Supabase ya aplicados**: `favorites/carts/purchases/reviews → users(id)` y `purchase_items → purchases(id)` con `ON DELETE CASCADE`, más la FK existente `users.auth_id → auth.users` (CASCADE). Por eso el teardown es un solo `DELETE FROM auth.users WHERE email LIKE 'e2e-%'`.
- **Cleanup por test**: `helpers/cleanup.ts` (`test.afterEach`) borra `favorites/carts/purchases/reviews` del test user. El trigger `trg_update_product_ratings` ya corre en `DELETE`, así que los agregados de productos se recomputan solos.
- **Tests en serie**: la suite corre con `workers: 1`. Todos los specs comparten el test user y los de escritura mutan las mismas filas (`cleanupUserData` borra TODO del usuario en `afterEach`; el checkout borra todos los carts). Correr uno tras otro hace determinísticas las aserciones de badge/total y evita que el cleanup de un test pise a otro en paralelo. `auth.spec` mantiene `mode: 'serial'` como documentación de intención.
- **Auth**: setup project + `storageState` para specs con login; `test.use({ storageState: { cookies: [], origins: [] } })` en la cabecera de los specs sin login.

## Fases

### Fase 1 — Fundación + specs sin login ✅
- [x] `playwright.config.ts`: `baseURL`, `process.loadEnvFile('.env')`.
- [x] Borrar `e2e/example.spec.ts`.
- [x] `e2e/home.spec.ts` — hero, filtro categoría, sort, paginación, search bar.
- [x] `e2e/product.spec.ts` — render + breadcrumb + relacionados; toasts de sign-in (cart/favorite); review form deshabilitado.
- **Verificar:** `npx playwright test home.spec.ts product.spec.ts`

### Fase 2 — Infra de auth ✅
- [x] Proyectos `setup` + `chromium` con `storageState` en `playwright.config.ts`.
- [x] `e2e/auth.setup.ts` — sign-up via UI → guarda `playwright/.auth/user.json`.
- [x] `e2e/helpers/cleanup.ts` — `afterEach` que borra filas del test user.
- [x] `e2e/global-teardown.ts` — `DELETE FROM auth.users WHERE email LIKE 'e2e-%'`.
- [x] `e2e/auth.spec.ts` — toggle sign up, validaciones, sign-up real, sign out.
- [x] `docs/agents/e2e.md` + registro en `AGENTS.md` (convención de arquitectura).
- [x] `home.spec.ts` / `product.spec.ts` con override de `storageState` (logged out).
- **Verificar:** `npx playwright test auth.setup.ts auth.spec.ts` y 0 filas `e2e-%` en `auth.users` tras el run.

### Fase 3 — Cart + Purchases ✅
- [x] `e2e/cart.spec.ts` — add → badge + toast, preview con total, +/−, vaciar, checkout → `/purchases`, persistencia tras recargar.
- [x] `e2e/purchases.spec.ts` — redirect sin login; lista con login.
- [x] `workers: 1` en `playwright.config.ts` (estado compartido del test user).
- **Verificar:** correr ambos.

### Fase 4 — Favoritos ✅
- [x] `e2e/favorites.spec.ts` — toggle en product page, heart en homepage (`aria-pressed`), persistencia tras recarga.
- **Verificar:** correrlo.

### Fase 5 — Reviews ✅
- [x] `e2e/review.spec.ts` — gate por compra, post, edición.
- **Verificar:** correrlo.

### Fase 6 — Suite completa + limpieza
- [ ] `npx playwright test` completo.
- [ ] Verificar DB limpia: sin `e2e-%` en `auth.users`, sin filas residuales de `favorites/carts/purchases/reviews` del test user.

## Datos deterministas del seed (para aserciones)

- 50 productos, paginación de 9 → 6 páginas; última página muestra "Showing 5 products".
- Producto más barato: AKG K240 Studio ($69) → primer card con `sort=price_asc`.
- Instrumento top-rated: Fender Player Precision Bass (4.8) → en la página 1, fuera de la página 2.
- Búsqueda "Shure" → Shure SM7B / Shure SM58; "zzzzzz" → "No se encontraron resultados".
- Producto para tests de producto: `fender-player-precision-bass-ffea1` (Instrument, $849, 4.8 · 5 reviews).

> Nota: la DB en vivo puede diferir del seed (agregados de reviews recomputados por trigger). Usar aserciones robustas (regex, `filter({ visible: true })`), no valores exactos del seed.

## Gotcha de `next dev`: duplicado transitorio del Suspense boundary

Las rutas con `loading.tsx` (product, purchases) generan durante el streaming del SSR un `div#S:1` con `display:none` que contiene **una copia oculta de todo el contenido de la página**; se elimina al terminar la hidratación (~1.5s). Consecuencias para los tests:

- `getByText` / locators por texto pueden resolver a **2 elementos** durante esa ventana → strict mode violation **flaky**.
- `getByRole` es inmune (ignora `display:none`, que queda fuera del accessibility tree).
- Fix estándar: `.filter({ visible: true })` en locators por texto de páginas con `loading.tsx`. Home no tiene `loading.tsx` → no le afecta.
- Alternativa para CI: correr e2e contra build de producción (`npm run build && npm run start`), donde el artifact no aparece.