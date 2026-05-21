# EcoHome Store — Backend Beta

Backend RESTful para la plataforma de e-commerce EcoHome Store.  
Stack: **Node.js + Express.js + PostgreSQL + JWT**

---

## Requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar y configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL

# 3. Crear la base de datos en PostgreSQL
createdb ecohome_db

# 4. Ejecutar el script SQL (tablas + seed)
psql -U ecohome_user -d ecohome_db -f schema.sql

# 5. Iniciar el servidor
npm start          # producción
npm run dev        # desarrollo con nodemon
```

---

## Variables de entorno (.env)

| Variable | Descripción | Ejemplo |
|---|---|---|
| DB_HOST | Host de PostgreSQL | localhost |
| DB_PORT | Puerto | 5432 |
| DB_NAME | Nombre de la BD | ecohome_db |
| DB_USER | Usuario de BD | ecohome_user |
| DB_PASS | Contraseña de BD | supersecret |
| JWT_SECRET | Clave secreta JWT | clave_larga_aleatoria |
| JWT_EXPIRES_IN | Duración del token | 24h |
| PORT | Puerto del servidor | 3000 |

---

## Endpoints

### Autenticación

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | /auth/signup | Público | Registra usuario (rol client) |
| POST | /auth/login | Público | Login → retorna JWT |

### Productos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | /products | Auth | Lista todos los productos activos |
| GET | /products/:id | Auth | Obtiene un producto por ID |
| POST | /products | Admin | Crea un producto |
| PUT | /products/:id | Admin | Actualiza un producto completo |
| PATCH | /products/:id | Admin | Actualiza campos específicos |
| DELETE | /products/:id | Admin | Elimina un producto |

---

## Flujo de autenticación

```
1. POST /auth/signup  → crea cuenta con rol 'client'
2. POST /auth/login   → retorna { token, user }
3. Usar token en cabecera: Authorization: Bearer <token>
```

Para crear un admin, regístrate y luego ejecuta en PostgreSQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'tu@email.com';
```

---

## Roles

| Acción | client | admin |
|---|---|---|
| Ver productos | ✅ | ✅ |
| Crear producto | ❌ | ✅ |
| Editar producto | ❌ | ✅ |
| Eliminar producto | ❌ | ✅ |

---

## Códigos HTTP

| Código | Situación |
|---|---|
| 200 | Consulta exitosa |
| 201 | Recurso creado |
| 204 | Eliminado (sin contenido) |
| 400 | Validación fallida |
| 401 | Sin token o token inválido |
| 403 | Rol insuficiente |
| 404 | Recurso no encontrado |
| 409 | Email ya registrado |
| 500 | Error interno |

---

## Prueba rápida con cURL

```bash
# 1. Signup
curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana García","email":"ana@test.com","password":"password123"}'

# 2. Login (obtener token)
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@test.com","password":"password123"}' | jq -r '.token')

# 3. Listar productos
curl -s http://localhost:3000/products \
  -H "Authorization: Bearer $TOKEN"
```

Ver el archivo `pruebas.sh` para el flujo completo.
