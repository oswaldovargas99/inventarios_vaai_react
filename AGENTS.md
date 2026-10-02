# Repository Guidelines

## Project Structure & Module Organization

This is a Laravel 12 REST API with a React/Vite SPA, MySQL/MariaDB, and Sanctum. Keep backend and frontend concerns separate. Backend code lives in `app/`; API routes belong in `routes/api.php`, while `routes/web.php` serves the SPA. Keep administrative controllers under `app/Http/Controllers/Administrador` and catalogs under `app/Http/Controllers/Administrador/Catalogos`.

The frontend entry point is `resources/js/app.jsx`. Place pages in `resources/js/pages`, components in `resources/js/components`, layouts in `resources/js/layouts`, navigation in `resources/js/coreui`, and API clients in `resources/js/services`. Styles live in `resources/css` and `resources/scss`. Database files belong in `database/`; tests are split between `tests/Feature` and `tests/Unit`. `TEMPLATE/` is reference material, not production source.

## Architecture, Security & Data Rules

Request `/sanctum/csrf-cookie` before authentication mutations and send credentials with Axios. Protect private API routes with `auth:sanctum` and enforce the existing roles: `Administrador`, `Patrimonio`, `Secretario`, and `Usuario`. Do not rely on frontend visibility as authorization.

Prefix application tables with `vaai_`. Never alter an already-executed migration without explicit authorization; create a new migration instead. Do not commit secrets or `.env`.

## Build, Test, and Development Commands

- `composer install` / `npm install`: install dependencies.
- `composer dev`: run Laravel, Vite, queue processing, and logs.
- `php artisan migrate --seed`: migrate and seed the configured database.
- `npm run dev`: start Vite only.
- `npm run build`: build production assets.
- `php artisan test`: run PHPUnit 11 tests.
- `./vendor/bin/pint`: format PHP.

## Coding Style & Naming Conventions

Use four spaces, PSR-12-compatible PHP, and JavaScript semicolons. Use `PascalCase` for classes/components and `camelCase` for methods/variables. Prefer Spanish domain names such as `TipoEquipo` and `cambiarEstatus`. Keep JSON and pagination consistent. Build responsive CoreUI interfaces; reuse existing layouts and components. Do not add backup files such as `Page copy.jsx`.

## Testing & Change Workflow

Before implementation, inspect related code and reuse existing components. Do not remove code without documenting why. Before changing multiple files, state which files will change. Add request, authentication, authorization, validation, and database tests to `tests/Feature`; use `tests/Unit` for isolated logic. Name tests after their subject, for example `TipoEquipoApiTest.php`.

After implementation, review errors, run `php artisan test` and `npm run build`, verify routes with `php artisan route:list`, and report modified files.

## Commit & Pull Request Guidelines

No established convention exists beyond the initial commit. Use concise imperative messages such as `catalogos: valida nombres de marcas`. Pull requests should describe behavior, database impact, test evidence, linked issues, and screenshots for visible UI changes.
