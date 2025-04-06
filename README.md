# b6-prices-api

A Node API for tracking product prices through price alerts.

Sample requests and responses can be found at the publicly available postman collection at the following link:
<https://www.postman.com/arcwo/bs-prices-api/collection/g0o8zf7/b6-prices-api?action=share&creator=28292021>

If running locally, this collection can be downloaded into your local Postman app.

## Prerequisites

- Docker
- Node 22
  - To set to the project version, use the command: `nvm use`
  - Else manually change to a node version `>=v22.0.0`
- Postman (optional)

## Running Locally

Clone the repo:

```bash
git clone https://github.com/aircwo/b6-prices-api.git
```

Navigate to the project source:

```bash
cd b6-prices-api
```

Install project dependencies:

```bash
npm i
```

Next, copy the `.env.example` file to `.env` and set a `x-api-key` at minimum. This should be sent as a header for alert specific routes.

Start the Postgres docker container:

```bash
docker-compose up -d
```

Load the database migrations into the postgres database:

```bash
npm run migration:run
```

Build and run the application:

```bash
npm run build && npm run start
```

## Testing and other scripts

Test with coverage:

```bash
npm run test:coverage
```

Linting and code formatting:

```bash
npm run eslint
```

Revert database changes:

```bash
npm run migration:revert
```

## License

Code is published to an open sourced repository under the BSL-1.0 license.
