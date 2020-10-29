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

- validation 25 steps, etc...
- feature flags
- create recipe - set metadata, remove id, title via transformer toRecipeRecord()
- role middleware - (req as any).user['https://recipebible.net/roles']
- create recipe fail to return 404
