# Deployment audit

## Current architecture discovered

The repository contains three distinct parts:

1. `dist/` — the working customer-facing static PWA currently published for private review.
2. `client/` — Angular 22 standalone application containing the Business Dashboard shell.
3. `src/` — .NET 8 Web API solution split into Api, Application, Domain and Infrastructure projects.

There is currently no PostgreSQL integration, Entity Framework Core package, DbContext, migration, JWT authentication, registration/login API, or persistent data store.

## Existing feature dependency report

| Feature | Actual implementation | Frontend-only deployment |
| --- | --- | --- |
| Home | Static HTML/CSS | Works |
| Categories | `dist/demo-data.js` | Works |
| Products | Central demo-data file | Works |
| Product details | Client-side dialog | Works |
| Pincode search | Client-side format check; does not query service areas | Demo works; real coverage does not |
| Bulk enquiry | Builds a WhatsApp message | Works when WhatsApp is available |
| Order tracking | Sample timeline for entered numbers | Demo works; real status does not |
| Business dashboard | Angular shell with static counts | UI shell works; management actions do not |
| Login / registration | Not implemented | Does not exist |
| Orders | Domain model only | No real orders |
| Product management | Not implemented | Does not exist |
| Image upload | Local storage abstraction only | Does not exist in UI/API |

The .NET API exposes in-memory demo business, category and product data through `DemoCatalogService`. The deployed `dist/` customer app does not call this API.

## PostgreSQL and production dependencies

PostgreSQL is not currently present. Consequently, no current feature requires it. The following planned production features will require PostgreSQL once implemented: user and business accounts, authentication, products managed by business users, enquiries, bulk requests, favourites, real orders, status history, service-area lookup and dashboard totals.

`IFileStorageService` and a development-only local implementation exist. Local filesystem uploads are unsuitable for a horizontally scaled cloud API; a production object-storage implementation will be needed later.

## Demo and production modes

The public demo keeps its data in `dist/demo-data.js` and runtime settings in `dist/config.js`. It has no localhost dependency. The Angular shell has separate development, production and demo environment files. Development targets the local .NET API, production leaves the API URL blank until a public backend exists, and the dedicated `demo` build uses centralized mock data.

The intended production architecture remains:

```text
Angular frontend -> .NET 8 Web API -> managed PostgreSQL
                                      -> object storage
```

## Vercel frontend deployment

Import the Git repository into Vercel and use these settings:

- Root directory: repository root
- Framework preset: Other
- Build command: `npm run build`
- Output directory: `dist`
- Install command: leave default (`npm install`)
- Environment variables: none for the current static demo
- Recommended Node version: Node.js 24 LTS (the repository accepts Node 20 or later)

`vercel.json` provides SPA fallback routing. `npm run build` validates all required demo assets. It does not expose the development laptop or require administrator privileges, Docker, ngrok or a tunnel.

For the Angular dashboard demo rather than the current customer PWA, select `client` as the Vercel root, use `npm run build -- --configuration demo`, and publish `dist/client/browser`. That shell is less complete than the customer PWA today.

## Backend deployment readiness

CORS now reads `AllowedOrigins` from configuration. Local development origins live only in `appsettings.Development.json`. A future cloud deployment should set allowed origins through `AllowedOrigins__0`, `AllowedOrigins__1`, and so on.

Before deploying the API, implement EF Core/PostgreSQL persistence, migrations, authentication/JWT, request validation, production logging and real CRUD endpoints. Later configuration should use `ConnectionStrings__DefaultConnection`, `Jwt__Key`, `Jwt__Issuer` and `Jwt__Audience`; none are consumed yet, so they have not been added as misleading placeholders.

## Public demo limitations

- Pincode entry validates the format but cannot confirm actual service coverage.
- Tracking always displays sample progress and does not retrieve a real order.
- Product images and product records are illustrative demo content.
- WhatsApp handoff opens a user-reviewed message; it does not automatically create a database enquiry.
- Login, registration, favourites, real orders, owner uploads and product management are unavailable.
