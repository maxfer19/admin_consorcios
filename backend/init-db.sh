#!/bin/bash

# Script to initialize the database
# This script should be run once to set up the database schema

echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing schema"

# Run the initial schema migration
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" < /app/migrations/001_initial_schema.sql

echo "Database initialized successfully!"
