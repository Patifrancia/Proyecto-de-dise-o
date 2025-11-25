# Proyecto Ruta 🇨🇱 🦎🚎✈️🏝️🚊

## 🛣️ El proyecto está compuesto por:

- *Frontend*: React + Vite + TailwindCSS

- *Backend*: Node.js + Express + MongoDB Atlas

- *Autenticación*: JWT + Cookies httpOnly + Google Sign-In

- *Infraestructura*: Vercel (frontend), MongoDB Atlas (DB)

## 🏜️ Cómo ejecutar

### A) Backend:

1. **Entrar al proyecto**: cd Proyecto-de-dise-o
2. **Entrar al backend**: cd viajar-chile-api
3. **Instalar dependencias**: npm install
4. **Ejecutar**: npm run dev

### B) Frontend:

1. **Entrar al proyecto**: cd Proyecto-de-dise-o
2. **Entrar al frontend**: cd viajar-chile-web
3. **Instalar dependencias**: npm install
4. **Ejecutar**: npm run dev

## 🛤️ Las dependencias necesarias para el proyecto son:

### A) Backend (Estas deben estar instaladas (o incluidas en package.json)):

- express
- mongoose
- dotenv
- cors
- bcryptjs
- jsonwebtoken
- cookie-parser
- axios
- nodemon (dev)

### B) Frontend:

- react
- react-dom
- react-router-dom
- vite
- tailwindcss
- postcss
- autoprefixer
- google-identity-services

## 🌅 Las tecnologías utilizadas son:

### A) Backend:

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JWT (jsonwebtoken)
- Bcryptjs (hash de contraseñas)
- CORS (configuración para login con cookies)
- Cookie-parser
- Dotenv
- Axios (para algunos servicios externos)

### B) Frontend:

- React 18
- Vite
- JavaScript ES Modules
- Tailwind CSS
- React Router DOM
- Google Identity Services (Google Sign-In)
- Fetch API
- i18n (multi-idioma)

### C) Infraestructura y herramientas

- MongoDB Atlas (Base de datos nube)
- Vercel (hosting frontend)
- Nodemon (entorno de desarrollo backend)
- Git / GitHub

## 🌇 Para la autenticación se utiliza:

- JWT firmado (7 días)
- Cookies httpOnly para seguridad
- Authorization: Bearer <token> (compatibilidad)
- Google Sign-In para login rápido
