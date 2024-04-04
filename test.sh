#!/bin/bash

#set -x
# Returns the environment variables needed for a test run based on dialect env var
# and version env var. Then runs vitest with the provided arguments.

# Usage: ./vitest.sh <database> <version> [args]
# Example: ./vitest.sh postgres 13 --coverage

# postgres versions: 13, 14, 15, 16
# mysql versions: 8
# mariadb versions: 10

test() {
    local database=$1
    local version=$2
    local args=$3

    export NODE_OPTIONS='--no-warnings'
    export DEBUG='1'

    if [ "$database" = "all" ]; then
        args=$(echo "--reporter=dot $2 $args" | xargs)
        docker compose up -d --wait || {
            echo "Failed to start databases"
            exit 1
        }
        echo "vitest run '$args'"
        setenv "mariadb" 10 && pnpm vitest run $args
        setenv "mysql" 8 && pnpm vitest run $args
        setenv "postgres" 13 && pnpm vitest run $args
        setenv "postgres" 14 && pnpm vitest run $args
        setenv "postgres" 15 && pnpm vitest run $args
        setenv "postgres" 16 && pnpm vitest run $args
        docker compose down
    else
        setenv "$database" "$version"

        local service="${database}${version}"
        docker compose up "${service}" -d --wait "${service}" || {
            echo "Failed to start ${service}"
            exit 1
        }

        pnpm vitest "$args"
        exit_code=$?

        docker compose down "${service}"

        exit $exit_code
    fi
}

setenv() {
    local database=$1
    local version=$2

    export SERVICE="${database}${version}"

    case $database in
    postgres)
        export DIALECT=postgresql
        export DB_HOST=localhost
        export DB_USER=postgres_user
        export DB_PASSWORD=postgres_password
        export DB_NAME=test_database
        export DB_SCHEMA=postgres_schema

        case $version in
        13)
            export DB_PORT=5432
            ;;
        14)
            export DB_PORT=5433
            ;;
        15)
            export DB_PORT=5434
            ;;
        16)
            export DB_PORT=5435
            ;;
        *)
            echo "Unknown version: $version. Options: 13, 14, 15, 16"
            exit 1
            ;;
        esac
        ;;
    mysql)
        export DIALECT=mysql
        export DB_NAME=test_database
        export DB_USER=root
        export DB_PASSWORD=mysql_root_password
        export DB_HOST=localhost
        case $version in
        8)
            export DB_PORT=3306
            ;;
        *)
            echo "Unknown version: $version. Options: 8"
            exit 1
            ;;
        esac
        ;;
    mariadb)
        export DIALECT=mariadb
        export DB_NAME=test_database
        export DB_USER=root
        export DB_PASSWORD=mariadb_root_password
        export DB_HOST=localhost
        case $version in
        10)
            export DB_PORT=3300
            ;;
        *)
            echo "Unknown version: $version. Options: 10"
            exit 1
            ;;
        esac
        ;;
    *)
        echo "Unknown database: $database. Options: postgres, mysql, mariadb"
        exit 1
        ;;
    esac

    export REPORTS_DIRECTORY="coverage/${database}${version}"
}

test "$1" "$2" "${@:3}"
