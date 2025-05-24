# xD

Migrations must be ran manually: `npm run migration:run`

TODO:

- Migrate to Postgres because MySQL is ass
- When migrated, add migrations:

```
"migration:make": "mikro-orm migration:create --blank --config ./server/config/db.ts",
"migration:run": "mikro-orm migration:up --config ./server/config/db.ts"
```
