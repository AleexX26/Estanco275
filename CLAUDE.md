# CLAUDE.md — Estanco 275

Web informativa estática del Estanco 275 (Av. de la Aviación 71, Latina, Madrid): horarios, ubicación y contacto. Repo: github.com/AleexX26/Estanco275.

## Stack
- HTML + CSS estático, sin build ni dependencias
- Un único script inline (resalta el día actual en la tabla de horarios)

## Arquitectura
- `index.html` — portada (hero con rótulo, horarios, ubicación, contacto, aviso +18)
- `aviso-legal.html`, `privacidad.html`, `almacenamiento.html` — legales
- `404.html`, `robots.txt`
- `assets/styles.css` (tema tabaco: marrón oscuro, latón, rojo rótulo), `assets/favicon.svg`

## Panel de administración
- `/admin/` (noindex): formulario para editar horario, teléfono, correo y dirección. Guarda en Cloudflare KV (binding `CONFIG`, se autoprovisiona al desplegar). Escritura protegida con contraseña: huella PBKDF2 (`ADMIN_SALT`/`ADMIN_HASH`) en `vars` de `wrangler.jsonc` (el secreto del dashboard no se aplicaba). Worker en `src/worker.js`; `assets/datos.js` aplica los datos a la web (HTML estático = valores por defecto).

## Comandos
- Abrir `index.html` en el navegador (o `npx serve .`). Deploy previsto: Cloudflare Pages.

## Decisiones
- 2026-10-15: ventana de mayoría de edad (`assets/edad.js`); quitados ONCE y juegos de azar; servicios: shisha (accesorios), fotocopias, bebidas, recargas/tarjetas, sellos.
- 2026-10-14: panel propio (Worker + KV + contraseña) en vez de Decap CMS: el dueño no necesita GitHub.
- 2026-10-14: mapa embebido con carga bajo demanda (botón) para no conectar con Google sin acción; reseñas solo enlazadas (sin API). Servicios: shisha, fotocopias, bebidas frías, ONCE.
- 2026-10-14: tema estanco (madera oscura + latón + rótulo rojo); sin fotos propias (derechos de imagen).
- 2026-10-14: sin venta ni promoción de productos de tabaco (publicidad prohibida); solo info + aviso de menores/salud.
- 2026-10-14: datos de Google Maps: 608 52 56 17, L–V 9–14 y 16–20:30, S 9–14, D cerrado; 4,4★ (19 reseñas).

## Pendiente
- Datos del titular (razón social, NIF, correo) en las páginas legales. Nº expendeduría: 275 (Cuatro Vientos), ya puesto.
- Dominio y revisión de cookies del alojamiento definitivo.

## Última actualización

2026-10-15
