# EcoConciencia

Proyecto web educativo para concientizar sobre el medio ambiente.

## Requisitos
- Node.js >= 16
- MySQL

## Configuración rápida
1. Clona o descomprime el proyecto.
2. Crea la base de datos MySQL (usa `sql/schema.sql`):
   ```bash
   mysql -u root -p < sql/schema.sql
   ```
3. Copia `.env.example` a `.env` y completa los valores:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=eco_conciencia
   JWT_SECRET=tu_secreto_jwt
   ```
4. Instala dependencias:
   ```bash
   npm install
   ```
5. Inicia el servidor:
   ```bash
   npm start
   ```
6. Abre `http://localhost:3000` en tu navegador.

## Estructura del proyecto
```
EcoConciencia/
├── README.md
├── .env.example
├── package.json
├── server.js
├── config/
│   └── db.js
├── models/
│   ├── index.js
│   ├── User.js
│   └── Result.js
├── routes/
│   ├── auth.js
│   ├── calculadora.js
│   └── games.js
├── sql/
│   └── schema.sql
└── public/
    ├── index.html
    ├── calculadora.html
    ├── juegos.html
    ├── login.html
    ├── enlaces.html
    ├── estilos.css
    └── app.js
```

## Notas
- El frontend está en `public/` y se sirve estáticamente.
- Endpoints principales:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/calculadora` (autenticado)
  - `POST /api/games/score` (autenticado)
  - `GET /api/games/scores` (autenticado)
