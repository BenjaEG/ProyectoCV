# Arquitectura

## Componentes

- `Frontend`
  - Next.js 16
  - consume la API REST
  - integra `keycloak-js` para login/logout
- `Backend`
  - Spring Boot 3
  - valida JWT de Keycloak
  - expone API para tickets, contenido y administracion de usuarios
- `Keycloak`
  - login, registro y cuenta del usuario
  - emite tokens JWT
  - provee Admin API para gestion de usuarios
- `MariaDB`
  - persiste negocio y base de Keycloak

## Flujo de autenticacion

1. El usuario entra al frontend.
2. El frontend redirige a Keycloak.
3. Keycloak autentica y devuelve tokens.
4. El frontend llama al backend con `Authorization: Bearer ...`.
5. El backend valida el JWT y aplica autorizacion por roles.

## Roles

- `ROLE_VECINO`
  - crea y consulta sus reclamos
- `ROLE_OPERADOR`
  - gestiona reclamos del sistema
- `ROLE_ADMIN`
  - gestiona reclamos, contenido y usuarios

## Gestion de usuarios

- El backend usa un cliente tecnico de Keycloak (`backend-admin-cli`)
- El panel admin del frontend consume endpoints propios del backend
- El frontend no habla directo con la Admin API de Keycloak

## Adjuntos

- Las imagenes se optimizan en cliente antes del upload
- El backend valida tipo, tamano y firma binaria
- Los archivos se guardan en disco local
- La metadata se persiste en MariaDB
