mariadb \
  --user="root" \
  --password="${MYSQL_ROOT_PASSWORD}" \
  --execute="CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
