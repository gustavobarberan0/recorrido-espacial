# 🚀 Recorrido Espacial

Viaje 3D interactivo por el sistema solar pensado para **escuelas primarias** (6 a 12 años).
Funciona **sin internet** y no necesita instalar nada: se abre en el navegador.

![Paradas](https://img.shields.io/badge/paradas-12-5fd7ff) ![Niveles](https://img.shields.io/badge/niveles-2-ffd166) ![Offline](https://img.shields.io/badge/offline-sí-49ff8a)

---

## ✨ Qué incluye

- **12 paradas**: Sol, Mercurio, Venus, Tierra, Luna, Marte, Cinturón de asteroides,
  Júpiter, Saturno, Urano, Neptuno y Más allá de Neptuno.
- **Dos niveles de lectura**: 🔭 *Exploradores* (6-9) y 🚀 *Científicos* (10-12).
- **Intro cinematográfica**: la nave entra al sistema solar a velocidad luz. Se puede
  saltear y repetir (botón en la Guía docente o tecla `I`).
- **Ficha por parada** con descripción, 8 datos, 3 curiosidades, comparación de tamaño,
  conceptos clave y un quiz de 2 preguntas.
- **Desafío** final de 20 preguntas con puntaje.
- **Glosario** de 30 términos con buscador.
- **Narración** en voz alta con la voz del sistema (`speechSynthesis`).
- **Ficha imprimible** por planeta para trabajar en papel.
- **Recorrido automático** (9 segundos por parada) para proyecciones.
- **Nave con luces propias, balizas roja/verde/blanca y halo** para ubicarla incluso
  en las zonas más oscuras.
- **Layout responsive** sin superposiciones: panel lateral en escritorio, panel inferior
  en tablet/móvil.

---

## 🖥️ Cómo abrirlo

El proyecto usa **módulos ES** e `importmap`, así que necesita servirse por HTTP
(abrir el `index.html` con doble clic no funciona en la mayoría de los navegadores).

### Opción 1: servidor local (recomendado para probar)

```bash
cd recorrido-espacial
python -m http.server 8123
```

Luego abrir <http://localhost:8123>.

### Opción 2: publicarlo en Cloudflare Pages

```bash
wrangler pages deploy . --project-name=recorrido-espacial
```

Es un sitio **100 % estático**: no hay backend ni variables de entorno.

---

## 🗂️ Estructura

```
recorrido-espacial/
├── index.html              Estructura de la app, modales e intro
├── css/
│   └── styles.css          Layout responsive, panel, ruta, modales
├── js/
│   ├── main.js             Arranque, detección de calidad y carga
│   ├── datos.js            Todo el contenido educativo (12 cuerpos, glosario, quiz)
│   ├── escena.js           Motor Three.js: planetas, nave, intro, vuelos, encuadre
│   ├── interfaz.js         Panel, pestañas, ruta, quiz, desafío, glosario, voz
│   └── texturas.js         Texturas procedurales (no usa imágenes externas)
├── vendor/three/           Three.js r160 + addons (GLTFLoader, OrbitControls)
├── models/nave.glb         Modelo de la nave
└── favicon.svg
```

---

## 🎮 Controles

| Acción | Cómo |
| --- | --- |
| Parada siguiente / anterior | `→` / `←` o las flechas de la ruta |
| Primera / última parada | `Inicio` / `Fin` |
| Recorrido automático | `P` o el botón ▶ |
| Repetir la intro | `I` o **Guía docente → Repetir la intro** |
| Cerrar modal / detener voz | `Esc` |
| Girar / acercar la escena | Arrastrar / rueda del mouse |
| Pantalla completa | Botón ⛶ |

---

## ⚙️ Parámetros de URL

| Parámetro | Efecto |
| --- | --- |
| `?calidad=alta` | Fuerza texturas y efectos de alta calidad |
| `?calidad=baja` | Modo liviano para equipos modestos |
| `?intro=0` | Saltea la intro (útil para proyectar directo) |
| `?debug=1` | Expone `window.__recorrido` para inspeccionar la escena |

Ejemplo: `index.html?calidad=baja&intro=0`

---

## 📴 Funciona sin internet

- Three.js y sus addons están **vendorizados** en `vendor/three/`.
- Las texturas de los planetas se **generan por código** en `js/texturas.js`.
- No se usan Google Fonts, CDNs, analíticas ni telemetría.
- La voz usa el sintetizador del sistema operativo.

Alcanza con copiar la carpeta completa a una netbook o pendrive y servirla localmente.

---

## 🧪 Compatibilidad

- Chrome, Edge, Firefox y Safari recientes con **WebGL2**.
- En equipos de 4 GB de RAM o pantallas chicas se activa automáticamente el modo
  de calidad baja; también se puede forzar con `?calidad=baja`.
- Si WebGL no está disponible, la app muestra un mensaje explicativo.

---

## 📜 Créditos

- [Three.js](https://threejs.org/) r160 — licencia MIT.
- Modelo de nave: **“Transformers Fall Of Cybertron Decepticons”** de
  [hafid.quispe](https://sketchfab.com/hafid.quispe), licencia
  [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/), vía Sketchfab.
  Se usa como nave exploradora del recorrido; si redistribuís el proyecto,
  mantené esta atribución.
- Texturas procedurales, textos y código de la interfaz: elaboración propia.

---

## 🛠️ Ideas para seguir mejorando

- Agregar sonido ambiente y efectos de motor (con archivos locales).
- Sumar una parada sobre cometas y la nube de Oort.
- Traducir el contenido a otros idiomas.
- Modo “pizarra”: ocultar la nave y mostrar solo el planeta.
