# recipe-bible-api

Start docker postgres db

```
./database/start.sh
```

Postgres connection:

```
postgres@localhost/recipebible
```

## todo

- helmet
- csurf
- validate schema
- validation
- feature flags
- create recipe - set metadata, remove id, title via transformer toRecipeRecord()
- role middleware - (req as any).user['https://recipebible.net/roles']
- create recipe fail to return 404
