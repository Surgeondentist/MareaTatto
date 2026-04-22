# MareaTattoo

Sitio web estático generado con Vite para el estudio Marea Tattoo.

## Desarrollo local

- Requisitos: Node.js 18+ y npm 10+.
- Instala dependencias con `npm ci` (o `npm install` la primera vez).
- Ejecuta `npm run dev` para correr el servidor de desarrollo.
- Usa `npm run build` para generar la carpeta `dist/` que sirve Nginx.

Los archivos fuente residen en `src/` y los recursos estáticos compartidos en `public/`. Mantén la carpeta `dist/` fuera del control de versiones (ya está en `.gitignore`).

## Reseñas de Google en la web

La sección **Opiniones en Google Maps** (`index.html`) pide datos a **`/api/reviews`** y, si no hay respuesta útil, usa **`public/reviews-fallback.json`** (textos ilustrativos o curados por vosotros).

- **Vercel (recomendado para Places):** el archivo `api/reviews.js` se despliega como función serverless. En el proyecto de Vercel, crea las variables de entorno `GOOGLE_MAPS_API_KEY` y `GOOGLE_PLACE_ID` (ver `.env.example`). Google devuelve como máximo **cinco** reseñas por petición en Place Details.
- **Solo Nginx / hosting estático:** no existirá `/api/reviews`; el navegador usará el JSON de `public/reviews-fallback.json`. Ahí puedes sustituir textos reales (con permiso) o dejar `reviews: []` para mostrar solo el mensaje de enlace a Maps.
- **Desarrollo con Vite:** `vite.config.js` hace proxy de `GET /api/reviews` a `https://www.mareatattoo.shop` para probar la misma ruta que en producción.

## Flujo de despliegue recomendado

La instancia EC2 debería clonar este repositorio y ejecutarse con Node.js instalado. Para adoptar cambios:

1. **Actualizar código**  
   ```bash
   git fetch origin
   git checkout main
   git pull --ff-only origin main
   ```

2. **Compilar build**  
   ```bash
   npm ci
   npm run build
   ```

3. **Publicar archivos compilados**  
   Sincroniza `dist/` con la carpeta que Nginx expone (por ejemplo `/var/www/html/mareatatto`) y recarga Nginx:
   ```bash
   rsync -av --delete dist/ /var/www/html/mareatatto/
   sudo systemctl reload nginx
   ```

Como atajo, el script `scripts/deploy.sh` automatiza estos pasos. Ajusta las variables `REPO_DIR`, `NGINX_ROOT` y `BRANCH` al entorno del servidor y ejecútalo tras cada `git pull` o intégralo en una GitHub Action que se conecte por SSH.

## Integración con GitHub

- Empuja los cambios desde tu máquina con `git push origin main`.
- En el servidor, `git pull origin main` trasladará exactamente los commits que acabas de subir.
- Mantén las claves/Personal Access Tokens de la cuenta propietaria del repositorio configuradas en tu entorno (`ssh-agent` o credenciales HTTPS) para que `git pull` y `git push` funcionen sin pasos manuales extra.

## Próximos pasos

Con el flujo de despliegue automatizado podemos enfocarnos en evolucionar el diseño del sitio y optimizar los assets (por ejemplo, moviendo videos a un CDN).

