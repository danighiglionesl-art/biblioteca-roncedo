# Biblioteca del Club Sportivo y Biblioteca Dr. Lautaro Roncedo
## Plataforma Web Progresiva (PWA) e Identidad Digital Comunitaria
### Alcira Gigena, Córdoba • Dominio Oficial: `www.bibliotecaroncedo.ar`

---

## 🏛️ Descripción del Proyecto

Plataforma Web Progresiva (PWA) desarrollada para la **Biblioteca del Club Sportivo y Biblioteca Dr. Lautaro Roncedo** de Alcira Gigena. 
El sistema combina la gestión social de socios (con **Carnet Digital con QR oficial** y control de cuotas), el catálogo de la biblioteca, archivo de actas históricas con OCR, archivo fotográfico colaborativo, eventos culturales, el Museo Digital Dr. Lautaro Roncedo y tienda institucional.

Diseñada especialmente con criterios de alta accesibilidad, interfaz amigable para personas mayores, navegación intuitiva y compatibilidad total para instalarse en celulares Android, iPhone y computadoras.

---

## 🚀 Módulos y Etapas de Desarrollo

- [x] **Etapa 1 (Completada):**
  - Pantalla exclusiva de Login y Registro previo (bloqueo total de contenido no autenticado).
  - Acceso con **Google OAuth** y creación manual con **Email / Contraseña**.
  - Recuperación de contraseña (`/recuperar`).
  - Roles de usuario: **Usuario Registrado**, **Socio Activo** y **Administrador**.
  - **Home Institucional** con los 8 accesos principales y sector de novedades.
  - **Perfil de Usuario** con formulario completo y solicitud guiada de socio.
  - **Carnet Digital de Socio** con escudo oficial, foto, estado de cuota ("AL DÍA" / "PENDIENTE") y código QR interactivo de alta resolución.
  - **Panel de Administración** (`/admin`) para revisar y aprobar solicitudes de socios con asignación de número y categoría, padrón de socios y conmutador de cuotas.
  - **Página `/instalar`** con detección automática de dispositivo y guía paso a paso para Android y iPhone.
  - Soporte PWA, Web App Manifest y Service Worker offline.
- [ ] **Etapa 2:** Catálogo de libros, disponibilidad física, préstamos y reservas.
- [ ] **Etapa 3:** Archivo fotográfico histórico, etiquetado de personas y aportes comunitarios con moderación.
- [ ] **Etapa 4:** Archivo de actas digitalizadas con preparación para OCR y buscador histórico.
- [ ] **Etapa 5:** Eventos, charlas, talleres culturales e inscripción online.
- [ ] **Etapa 6:** Espacio Museo Digital Dr. Lautaro Roncedo (biografía, manuscritos, objetos).
- [ ] **Etapa 7:** Tienda institucional, pedidos por WhatsApp y pagos online.

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** Next.js 15 (App Router, React 19, TypeScript).
- **Estilos:** Tailwind CSS con la paleta de colores institucional del Club Roncedo.
- **PWA:** Web App Manifest + Service Worker nativo para disponibilidad offline de credenciales y carnet.
- **Base de Datos & Auth:** PostgreSQL relacional vía Supabase (con script SQL completo en `supabase/schema.sql`).
- **Códigos QR:** `qrcode.react` con codificación de seguridad verificable.
- **Despliegue Continuo:** GitHub $\rightarrow$ Vercel.

---

## 💻 Ejecución Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abrir en el navegador: [http://localhost:3000](http://localhost:3000)

---

## 🔐 Cuentas de Demostración (Modo Rápido 1-Clic)

En la pantalla de inicio de sesión o mediante el conmutador superior, puedes probar instantáneamente:
- **Administrador:** `admin@bibliotecaroncedo.ar` (acceso a `/admin` para aprobar socios).
- **Socio Activo:** `socio@bibliotecaroncedo.ar` (Socio #1042 con carnet digital y cuota al día).
- **Nuevo Usuario:** `usuario@bibliotecaroncedo.ar` (usuario registrado listo para solicitar asociarse).

---

## 🌐 Publicación en Vercel y Dominio Propio

1. Crear un repositorio en GitHub (ej: `biblioteca-roncedo`).
2. Vincular el repositorio local:
   ```bash
   git remote add origin https://github.com/tu-usuario/biblioteca-roncedo.git
   git push -u origin main
   ```
3. Importar el repositorio en [Vercel](https://vercel.com).
4. Configurar el dominio definitivo: `www.bibliotecaroncedo.ar`.
