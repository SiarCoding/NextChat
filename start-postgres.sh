#!/bin/bash

# Stoppe Container, falls er existiert
docker stop nextchat-db 2>/dev/null || true
docker rm nextchat-db 2>/dev/null || true

# Starte PostgreSQL-Container
docker run --name nextchat-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nextchat \
  -p 5432:5432 \
  -d postgres:15

echo "PostgreSQL-Datenbank läuft auf localhost:5432"
echo "Benutzer: postgres, Passwort: postgres, Datenbank: nextchat"
