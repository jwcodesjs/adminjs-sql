#PGPASSWORD=${POSTGRES_PASSWORD} psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "CREATE SCHEMA ${POSTGRES_SCHEMA}"
