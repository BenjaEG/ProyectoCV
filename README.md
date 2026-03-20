# Centro Vecinal

Sistema web de gestion vecinal con autenticacion centralizada, gestion de reclamos y paneles diferenciados por rol.

## Stack

- Frontend: Next.js 16, React 19, Tailwind CSS
- Backend: Spring Boot 3, Spring Security, JPA
- Base de datos: MariaDB
- Identidad y accesos: Keycloak
- Orquestacion local: Docker Compose

## Funcionalidades principales

- Login, registro y autogestion de cuenta con Keycloak
- Roles `ROLE_VECINO`, `ROLE_OPERADOR` y `ROLE_ADMIN`
- Creacion, seguimiento y administracion de reclamos
- Carga y visualizacion de imagenes adjuntas
- Noticias y eventos publicados en el sitio publico
- Gestion de usuarios desde panel propio consumiendo Keycloak Admin API

## Arquitectura

- El frontend consume el backend Spring Boot mediante JWT emitidos por Keycloak.
- El backend valida tokens como resource server.
- Keycloak centraliza autenticacion, registro y autogestion de cuenta.
- MariaDB persiste datos de negocio y tambien la base de Keycloak.

Mas detalle en:

- [Arquitectura](/docs/architecture.md)
- [Runbook local](/docs/runbook.md)
- [Endpoints de la API](/docs/api-endpoints.md)
- [Ejemplos para Postman](/docs/postman-examples.md)

## Arranque rapido

1. Copia el archivo de ejemplo de entorno si todavia no tienes `.env`:

```bash
cp .env.example .env
```

2. Levanta todo:

```bash
docker compose up -d --build
```

3. Abre:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8081`
- Keycloak: `http://localhost:8080`

## Credenciales de desarrollo

- Admin de Keycloak:
  - usuario: `admin`
  - password: `admin`

## Estructura

- `Frontend/`: aplicacion Next.js
- `Backend/app/`: API Spring Boot
- `Backend/docker/`: MariaDB, Keycloak y themes
- `docs/`: documentacion de arquitectura y arranque

## Estado actual

El proyecto esta preparado para desarrollo/demo local. Antes de llevarlo a produccion conviene mover secretos fuera de `.env`, endurecer Keycloak y reemplazar configuraciones `start-dev`.
