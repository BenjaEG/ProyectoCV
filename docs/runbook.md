# Runbook local

## Requisitos

- Docker
- Docker Compose

## Primer arranque

```bash
cp .env.example .env
docker compose up -d --build
```

## URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8081`
- Keycloak: `http://localhost:8080`

## Reinicio de servicios

```bash
docker compose restart frontend
docker compose restart backend
docker compose restart keycloak
```

## Reconstruir

```bash
docker compose up -d --build
```

## Bajar todo

```bash
docker compose down
```

## Datos persistentes

- MariaDB: `Backend/docker/mariadb/data`
- Adjuntos: `Backend/app/uploads`

## Notas

- El frontend en Docker usa dos URLs del backend:
  - publica: `http://localhost:8081`
  - interna entre contenedores: `http://backend:8081`
- Keycloak corre en `start-dev` porque este setup sigue orientado a desarrollo y demo local.
