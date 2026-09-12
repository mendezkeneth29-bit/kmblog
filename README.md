# ✦ keneth.txt — blog personal desde Guatemala

Soy Keneth Méndez, tengo 13 años y vivo en Guatemala. Blog hecho a mano solo con **HTML + CSS + JS + JSON**. Cero Python, cero dependencias, cero build.

Guiños 2000s: marquesina, contador, libro de visitas, webring, botones 88×31 **y un reproductor de música** al lado de las pestañas.

## reproductor de música ♪
- Toca los `.mp3` de la carpeta `mp3/` (ya carga tus 4 canciones).
- **Al abrir el blog suena solo "Softcore"** desde 0 (sesión nueva); si el navegador bloquea el auto-play, empieza con tu primer clic o tecla. Entre páginas sigue justo por donde iba.
- La lista y la portada se editan en el bloque `<script type="application/json" id="tracks-data">` de cada página.
- Búscalo junto al menú: portada ● canción ● barra de tiempo ● ◂◂ ► ▸▸. Suena en todas las páginas (también en los posts).

## modo admin secreto
- Abrir: pulsa **Ctrl+Shift+A** en cualquier página, doble clic en los ● de la barra superior o el botón **[ admin ]** del menú.
- Contraseña: **2026** (está en `js/admin.js`; no es seguridad real).
- Pestañas: **▤ POSTS** (editor de entradas), **▩ LIBROS** (crear libros con color y páginas), **▦ GALERÍA** (subir fotos con título y texto), **✉ VISITAS** (libro de visitas), **✎ COMENTARIOS** (moderar comentarios) y **◍ AJUSTES** (color acento, contador, marquesina, efecto CRT). Los cambios se guardan en el navegador (`localStorage`).
- "restaurar originales" vuelve a los posts de `data/posts.json`.

## galería
- Sube fotos con título y descripción desde el admin → pestaña **▦ GALERÍA** (se redimensionan solas, máx. 40).
- Se ven en `gallery.html`; clic en una foto para verla en grande (lightbox, `Esc` para cerrar).

## comentarios
- Cada entrada tiene su sección de comentarios al final en `post.html`.
- Se administran desde el admin → pestaña **✎ COMENTARIOS** (borrar uno a uno o vaciar todo).

## efecto CRT
- Líneas de escaneo + viñeta + banda de luz móvil + parpadeo suave. Se apaga/enciende en el admin → **◍ AJUSTES**.

## biblioteca de libros
- En la portada, sección "▤ biblioteca": libros 3D con el color que tú elijas.
- Se crean desde el admin → pestaña **▩ LIBROS**: título, autor, etiqueta, **color de cubierta** y páginas (separadas con una línea `---`).
- Al hacer clic en el libro se abre el lector; clic en la mitad derecha para pasar página, izquierda para retroceder (o flechas del teclado).
- Si el libro está vacío en la portada se muestra un aviso de "crea el primero en el admin".

## verlo (sin servidor, solo doble clic)
Abre `index.html` con doble clic en tu navegador y todo funciona: posts, libro de visitas, contador y el modo admin. Nada de Python, Node ni servidores.

> Si algún día lo subes a internet, el blog también lee `data/posts.json` (el JSON incrustado es una copia para que funcione sin servidor).

## publicar una entrada
La vía fácil: abre el **MODEM admin** (Ctrl+Shift+A → clave `2026`) y usa la pestaña ▤ POSTS con `＋ nuevo` y `▸ guardar`.

La vía manual: edita el bloque `<script type="application/json" id="posts-data">` que está en `index.html`, `archive.html` y `post.html`, añadiendo tu post en el mismo formato que los demás (parecido a esto):

```json
{
  "slug": "mi-nuevo-post",
  "title": "Mi nuevo post",
  "date": "2026-09-11",
  "tags": ["diario"],
  "excerpt": "Resumen de una línea.",
  "html": "<p>Contenido en HTML...</p>"
}
```
Aparece solo en inicio, archivo y `post.html?slug=mi-nuevo-post`. Si tu blog está en internet, edita también `data/posts.json`.

## personalizar
- Nombre, bio y links → `index.html` y `about.html`
- Colores y fuentes → `css/style.css` (`:root`)
- Posts de ejemplo → `data/posts.json`

## estructura
```
index.html    → portada (últimos posts + biblioteca + libro de visitas)
posts.html    → todas las entradas completas en una página
archive.html  → archivo con buscador (?q=etiqueta)
gallery.html  → galería de fotos (subidas desde el admin)
post.html     → plantilla de entrada (+ comentarios)
about.html    → sobre mí + colofón
css/style.css → todo el estilo
data/posts.json → tus entradas (JSON puro)
mp3/          → tus canciones
js/posts.js   → cargador del JSON (fetch)
js/main.js    → lógica (sin frameworks)
js/books.js   → biblioteca 3D + lector
js/player.js  → reproductor (auto-arranque con "Softcore")
js/gallery.js → galería + lightbox
js/admin.js   → panel admin secreto (MODEM)
```
