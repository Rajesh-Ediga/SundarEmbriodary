# Sundar Embroidery Works

Mobile-first embroidery marketplace MVP for the pilot business **Sundar Embroidery Works**, Shop No. 7, Raghuveera Towers, Kamala Nagar, Anantapur, Andhra Pradesh.

## Current first slice

- Installable PWA catalogue in `dist/`
- Responsive home, categories, eight sample designs and product detail dialog
- Pincode enquiry, bulk quotation form and WhatsApp handoff
- Demonstration order-tracking timeline
- .NET 8 Clean Architecture solution shell
- Multi-business-ready domain model with `BusinessId` ownership
- Basic business, category, product and pincode-search APIs
- Local file-storage abstraction
- Angular client shell in `client/` (generated separately)

The public PWA currently uses illustrative sample designs and sends enquiries to WhatsApp. Authentication, PostgreSQL persistence, real order updates and the owner dashboard are the next implementation slice.

## Software to install

1. **Visual Studio Code** for editing the frontend and backend. Install the C# Dev Kit and Angular Language Service extensions.
2. **Node.js 24 LTS** for Angular and frontend tooling.
3. **.NET 8 SDK** for the Web API. The runtime alone is insufficient.
4. **PostgreSQL 16 or later**, plus pgAdmin if a graphical database tool is preferred.
5. **Git** for source history and deployment.

Optional: Docker Desktop can run PostgreSQL without a direct PostgreSQL installation. Postman is optional because the finished backend will expose Swagger/OpenAPI.

## Run the current customer app

Serve `dist/` from any static web server. For example:

```powershell
npx serve dist
```

Then open the local address shown in the terminal.

## Run the backend

```powershell
dotnet restore
dotnet run --project src/SundarEmbroidery.Api
```

Current endpoints:

- `GET /api/health`
- `GET /api/businesses/{id}`
- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/{id}`
- `GET /api/search/products?pincode=&category=&bulk=`

## Architecture

```text
src/
  SundarEmbroidery.Api
  SundarEmbroidery.Application
  SundarEmbroidery.Domain
  SundarEmbroidery.Infrastructure
tests/
  SundarEmbroidery.UnitTests
client/
dist/
```

`Domain` contains business entities and enums. `Application` defines use-case interfaces and currently provides demonstration seed data. `Infrastructure` holds persistence and storage implementations. `Api` exposes HTTP endpoints and composes the application.

## Configuration still needed

- Confirm actual services offered and weekly closing day.
- Add the correct Google Maps URL and shop pincode.
- Replace illustrative samples with real workshop photographs.
- Decide whether the business ships throughout India or serves selected pincodes.
- Add a production email address if customer email communication is required.

## Next development slice

Add PostgreSQL with Entity Framework Core migrations and seed data, JWT authentication and role checks, persistent enquiries, product-image uploads, and the BusinessUser dashboard. Keep all production passwords and signing keys in local environment variables or the deployment platform's secret store.
