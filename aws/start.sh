#!/bin/bash

cd "$(dirname "$0")"
source secrets.txt

docker rm -f recipe-bible-db
docker build . -f Dockerfile -t pb-db
docker run -v $(pwd):/reports/ --name recipe-bible-db -e POSTGRES_PASSWORD=veronptas81 -p 5432:5432 -d pb-db
sleep 5
PSQL_DB=$(docker ps | grep recipe-bible-db | cut -d" " -f1)
docker exec -it $PSQL_DB psql -U postgres -c  "CREATE DATABASE recipebible"
docker exec -i $PSQL_DB /bin/bash -c \
  "export PGPASSWORD=$password && pg_dump -C -h $host -U postgres recipebible | psql -h localhost -U postgres recipebible"
