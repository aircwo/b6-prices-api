# b6-prices-api

A Node API for tracking product prices through price alerts.

## Prerequisites

- Docker
- Node 22
  - To set to the project version, use the command: `nvm use`
  - Else manually change to a node version `>=v22.0.0`

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
