# Endpoints de la API

Base URL local:

- `http://localhost:8081`

Autenticacion:

- Los endpoints privados esperan `Authorization: Bearer <token>`
- Los roles de negocio salen de `realm_access.roles` en Keycloak
- Roles usados por la app:
  - `ROLE_VECINO`
  - `ROLE_OPERADOR`
  - `ROLE_ADMIN`

## Publicos

### `GET /api/public/ping`

- Rol: publico
- Sirve para: validar que la API esta respondiendo

### `GET /api/public/news`

- Rol: publico
- Sirve para: listar noticias publicadas

### `GET /api/public/news/{newsId}`

- Rol: publico
- Sirve para: ver el detalle de una noticia publicada

### `GET /api/public/events`

- Rol: publico
- Sirve para: listar eventos

### `GET /api/public/events/{eventId}`

- Rol: publico
- Sirve para: ver el detalle de un evento

## Autenticacion / debug

### `GET /api/me`

- Rol: cualquier usuario autenticado
- Sirve para: devolver el `sub` del JWT autenticado

### `GET /api/debug/auth`

- Rol: cualquier usuario autenticado
- Sirve para: ver authorities resueltas por Spring Security

## Categorias de tickets

### `GET /api/ticket-categories`

- Rol: `ROLE_VECINO`, `ROLE_OPERADOR`, `ROLE_ADMIN`
- Sirve para: listar categorias disponibles de reclamos

### `POST /api/ticket-categories`

- Rol: `ROLE_ADMIN`
- Sirve para: crear una nueva categoria

## Tickets

### `POST /api/tickets`

- Rol: `ROLE_VECINO`, `ROLE_ADMIN`
- Sirve para: crear un reclamo

### `GET /api/tickets`

- Rol: `ROLE_VECINO`, `ROLE_OPERADOR`, `ROLE_ADMIN`
- Sirve para: listar tickets con filtros y paginacion
- Filtros soportados:
  - `q`
  - `status`
  - `categoryId`
  - `assigned`
  - `assignedToMe`
  - `mine`
  - `page`
  - `size`
  - `sort`

### `GET /api/tickets/{ticketId}`

- Rol: `ROLE_VECINO`, `ROLE_OPERADOR`, `ROLE_ADMIN`
- Sirve para: ver el detalle completo de un ticket

### `PATCH /api/tickets/{ticketId}/assignment`

- Rol: `ROLE_OPERADOR`, `ROLE_ADMIN`
- Sirve para: actualizar la asignacion del ticket
- Nota:
  - La UI hoy no lo usa, pero el backend lo mantiene disponible

### `PATCH /api/tickets/{ticketId}/status`

- Rol: `ROLE_OPERADOR`, `ROLE_ADMIN`
- Sirve para: cambiar el estado del ticket
- Estados usados:
  - `OPEN`
  - `IN_REVIEW`
  - `IN_PROGRESS`
  - `RESOLVED`
  - `CLOSED`

### `GET /api/tickets/{ticketId}/history`

- Rol: `ROLE_VECINO`, `ROLE_OPERADOR`, `ROLE_ADMIN`
- Sirve para: consultar historial de cambios de estado

### `GET /api/tickets/summary`

- Rol: `ROLE_VECINO`, `ROLE_OPERADOR`, `ROLE_ADMIN`
- Sirve para: obtener resumen de tickets segun el usuario autenticado

## Comentarios

### `POST /api/tickets/{ticketId}/comments`

- Rol: `ROLE_VECINO`, `ROLE_OPERADOR`, `ROLE_ADMIN`
- Sirve para: agregar un comentario a un ticket

### `GET /api/tickets/{ticketId}/comments`

- Rol: `ROLE_VECINO`, `ROLE_OPERADOR`, `ROLE_ADMIN`
- Sirve para: listar comentarios de un ticket

## Adjuntos

### `POST /api/tickets/{ticketId}/attachments`

- Rol: `ROLE_VECINO`, `ROLE_OPERADOR`, `ROLE_ADMIN`
- Sirve para: subir una imagen adjunta a un ticket
- Formato: `multipart/form-data`
- Campo esperado:
  - `file`
- Validaciones:
  - maximo 5 imagenes por ticket
  - maximo 10 MB por archivo
  - solo `jpg`, `png`, `webp`
  - validacion de firma binaria

### `GET /api/tickets/{ticketId}/attachments`

- Rol: `ROLE_VECINO`, `ROLE_OPERADOR`, `ROLE_ADMIN`
- Sirve para: listar metadata de adjuntos de un ticket

### `GET /api/tickets/attachments/{attachmentId}/file`

- Rol: `ROLE_VECINO`, `ROLE_OPERADOR`, `ROLE_ADMIN`
- Sirve para: descargar o visualizar el binario del adjunto

### `DELETE /api/tickets/attachments/{attachmentId}`

- Rol: `ROLE_OPERADOR`, `ROLE_ADMIN`
- Sirve para: borrar un adjunto y su archivo fisico

## Noticias

### `GET /api/news`

- Rol: `ROLE_ADMIN`
- Sirve para: listar noticias en panel admin

### `GET /api/news/{newsId}`

- Rol: `ROLE_ADMIN`
- Sirve para: ver detalle de noticia en panel admin

### `POST /api/news`

- Rol: `ROLE_ADMIN`
- Sirve para: crear noticia

### `PUT /api/news/{newsId}`

- Rol: `ROLE_ADMIN`
- Sirve para: editar noticia

### `DELETE /api/news/{newsId}`

- Rol: `ROLE_ADMIN`
- Sirve para: borrar noticia

## Eventos

### `GET /api/events`

- Rol: `ROLE_ADMIN`
- Sirve para: listar eventos en panel admin

### `GET /api/events/{eventId}`

- Rol: `ROLE_ADMIN`
- Sirve para: ver detalle de evento en panel admin

### `POST /api/events`

- Rol: `ROLE_ADMIN`
- Sirve para: crear evento

### `PUT /api/events/{eventId}`

- Rol: `ROLE_ADMIN`
- Sirve para: editar evento

### `DELETE /api/events/{eventId}`

- Rol: `ROLE_ADMIN`
- Sirve para: borrar evento

## Administracion de usuarios

Todos estos endpoints requieren `ROLE_ADMIN`.

### `GET /api/admin/users`

- Rol: `ROLE_ADMIN`
- Sirve para: listar usuarios de Keycloak con paginacion
- Filtros soportados:
  - `search`
  - `enabled`
  - `role`
  - `page`
  - `size`
  - `sort`

### `GET /api/admin/users/roles`

- Rol: `ROLE_ADMIN`
- Sirve para: listar roles disponibles para asignar

### `GET /api/admin/users/{userId}`

- Rol: `ROLE_ADMIN`
- Sirve para: obtener detalle de un usuario

### `POST /api/admin/users`

- Rol: `ROLE_ADMIN`
- Sirve para: crear usuario en Keycloak
- Nota:
  - los usuarios creados por admin quedan con password temporal
  - Keycloak obliga a cambiarla en el primer login

### `PUT /api/admin/users/{userId}`

- Rol: `ROLE_ADMIN`
- Sirve para: editar email, nombre, apellido y estado base

### `PATCH /api/admin/users/{userId}/status`

- Rol: `ROLE_ADMIN`
- Sirve para: activar o desactivar usuario

### `PATCH /api/admin/users/{userId}/roles`

- Rol: `ROLE_ADMIN`
- Sirve para: actualizar roles del usuario

### `PATCH /api/admin/users/{userId}/password`

- Rol: `ROLE_ADMIN`
- Sirve para: resetear password
- Soporta password temporal para forzar cambio al proximo login
