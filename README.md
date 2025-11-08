# MareaTattoo

Sitio web estático generado con Vite para el estudio Marea Tattoo.

## Desarrollo local

- Requisitos: Node.js 18+ y npm 10+.
- Instala dependencias con `npm ci` (o `npm install` la primera vez).
- Ejecuta `npm run dev` para correr el servidor de desarrollo.
- Usa `npm run build` para generar la carpeta `dist/` que sirve Nginx.

Los archivos fuente residen en `src/` y los recursos estáticos compartidos en `public/`. Mantén la carpeta `dist/` fuera del control de versiones (ya está en `.gitignore`).

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

