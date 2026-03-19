# Ejemplos para Postman

Base URL local:

- `http://localhost:8081`

## Tokens de ejemplo

En Postman usa un header:

```http
Authorization: Bearer <TOKEN>
```

Segun el caso:

- vecino: token con `ROLE_VECINO`
- operador: token con `ROLE_OPERADOR`
- admin: token con `ROLE_ADMIN`

## Publicos

### Ping

```http
GET http://localhost:8081/api/public/ping
```

### Listar noticias publicadas

```http
GET http://localhost:8081/api/public/news
```

### Ver una noticia publicada

```http
GET http://localhost:8081/api/public/news/1
```

### Listar eventos publicos

```http
GET http://localhost:8081/api/public/events
```

## Categorias

### Listar categorias

```http
GET http://localhost:8081/api/ticket-categories
Authorization: Bearer <TOKEN>
```

### Crear categoria

```http
POST http://localhost:8081/api/ticket-categories
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

```json
{
  "name": "Iluminacion"
}
```

## Tickets

### Crear ticket

```http
POST http://localhost:8081/api/tickets
Authorization: Bearer <VECINO_TOKEN>
Content-Type: application/json
```

```json
{
  "title": "Farola apagada en calle principal",
  "description": "Hace dos noches que la luminaria no funciona.",
  "location": "Av. Principal 123",
  "categoryId": 1
}
```

### Listar tickets

```http
GET http://localhost:8081/api/tickets?page=0&size=10&sort=createdAt,desc
Authorization: Bearer <TOKEN>
```

### Listar mis tickets

```http
GET http://localhost:8081/api/tickets?mine=true&sort=createdAt,desc
Authorization: Bearer <VECINO_TOKEN>
```

### Filtrar tickets por estado

```http
GET http://localhost:8081/api/tickets?status=OPEN&page=0&size=10
Authorization: Bearer <TOKEN>
```

### Ver detalle de ticket

```http
GET http://localhost:8081/api/tickets/1
Authorization: Bearer <TOKEN>
```

### Resumen de tickets

```http
GET http://localhost:8081/api/tickets/summary
Authorization: Bearer <TOKEN>
```

### Cambiar estado de ticket

```http
PATCH http://localhost:8081/api/tickets/1/status
Authorization: Bearer <OPERADOR_O_ADMIN_TOKEN>
Content-Type: application/json
```

```json
{
  "status": "IN_PROGRESS"
}
```

### Obtener historial

```http
GET http://localhost:8081/api/tickets/1/history
Authorization: Bearer <TOKEN>
```

## Comentarios

### Agregar comentario

```http
POST http://localhost:8081/api/tickets/1/comments
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

```json
{
  "content": "Estamos revisando el reclamo."
}
```

### Listar comentarios

```http
GET http://localhost:8081/api/tickets/1/comments
Authorization: Bearer <TOKEN>
```

## Adjuntos

### Subir imagen a un ticket

```http
POST http://localhost:8081/api/tickets/1/attachments
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data
```

Body en Postman:

- tipo `form-data`
- clave `file`
- tipo `File`
- selecciona una imagen `jpg`, `png` o `webp`

### Listar adjuntos de un ticket

```http
GET http://localhost:8081/api/tickets/1/attachments
Authorization: Bearer <TOKEN>
```

### Ver archivo adjunto

```http
GET http://localhost:8081/api/tickets/attachments/1/file
Authorization: Bearer <TOKEN>
```

### Borrar adjunto

```http
DELETE http://localhost:8081/api/tickets/attachments/1
Authorization: Bearer <OPERADOR_O_ADMIN_TOKEN>
```

## Noticias admin

### Listar noticias

```http
GET http://localhost:8081/api/news
Authorization: Bearer <ADMIN_TOKEN>
```

### Crear noticia

```http
POST http://localhost:8081/api/news
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

```json
{
  "title": "Nueva iluminacion LED en el barrio",
  "copete": "Se renuevan las luminarias del barrio con tecnologia LED.",
  "content": "El municipio inicio los trabajos de modernizacion del sistema de iluminacion publica...",
  "imageUrl": null,
  "published": true
}
```

### Editar noticia

```http
PUT http://localhost:8081/api/news/1
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

```json
{
  "title": "Nueva iluminacion LED en el barrio",
  "copete": "Actualizacion de obra y avances del proyecto.",
  "content": "Contenido completo actualizado...",
  "imageUrl": null,
  "published": true
}
```

### Borrar noticia

```http
DELETE http://localhost:8081/api/news/1
Authorization: Bearer <ADMIN_TOKEN>
```

## Eventos admin

### Listar eventos

```http
GET http://localhost:8081/api/events
Authorization: Bearer <ADMIN_TOKEN>
```

### Crear evento

```http
POST http://localhost:8081/api/events
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

```json
{
  "title": "Asamblea General de Vecinos",
  "copete": "Encuentro mensual para tratar temas del barrio.",
  "description": "Reunion mensual para discutir temas del barrio y planificar actividades.",
  "eventDate": "2026-03-25",
  "eventTime": "19:00",
  "location": "Sede del Centro Vecinal",
  "imageUrl": null
}
```

### Editar evento

```http
PUT http://localhost:8081/api/events/1
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

```json
{
  "title": "Asamblea General de Vecinos",
  "copete": "Encuentro actualizado del mes.",
  "description": "Descripcion completa actualizada.",
  "eventDate": "2026-03-25",
  "eventTime": "19:30",
  "location": "Sede del Centro Vecinal",
  "imageUrl": null
}
```

### Borrar evento

```http
DELETE http://localhost:8081/api/events/1
Authorization: Bearer <ADMIN_TOKEN>
```

## Usuarios admin

### Listar usuarios

```http
GET http://localhost:8081/api/admin/users?page=0&size=10&sort=createdTimestamp,desc
Authorization: Bearer <ADMIN_TOKEN>
```

### Buscar usuarios

```http
GET http://localhost:8081/api/admin/users?search=benja&enabled=true&role=ROLE_ADMIN&page=0&size=10
Authorization: Bearer <ADMIN_TOKEN>
```

### Listar roles disponibles

```http
GET http://localhost:8081/api/admin/users/roles
Authorization: Bearer <ADMIN_TOKEN>
```

### Ver detalle de usuario

```http
GET http://localhost:8081/api/admin/users/<USER_ID>
Authorization: Bearer <ADMIN_TOKEN>
```

### Crear usuario

```http
POST http://localhost:8081/api/admin/users
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

```json
{
  "username": "usuario@correo.com",
  "email": "usuario@correo.com",
  "firstName": "Juan",
  "lastName": "Perez",
  "enabled": true,
  "emailVerified": false,
  "password": "Temporal123!",
  "roles": ["ROLE_VECINO"]
}
```

### Editar usuario

```http
PUT http://localhost:8081/api/admin/users/<USER_ID>
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

```json
{
  "email": "usuario@correo.com",
  "firstName": "Juan",
  "lastName": "Perez",
  "enabled": true,
  "emailVerified": true
}
```

### Cambiar estado de usuario

```http
PATCH http://localhost:8081/api/admin/users/<USER_ID>/status
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

```json
{
  "enabled": false
}
```

### Actualizar roles de usuario

```http
PATCH http://localhost:8081/api/admin/users/<USER_ID>/roles
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

```json
{
  "roles": ["ROLE_OPERADOR"]
}
```

### Resetear password

```http
PATCH http://localhost:8081/api/admin/users/<USER_ID>/password
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

```json
{
  "password": "NuevaTemporal123!",
  "temporary": true
}
```
