/* =====================================================================
   TEXTURAS PROCEDURALES
   Todo se dibuja con canvas al vuelo: no hay imágenes externas.
   Así el recorrido funciona sin internet y sin descargar assets.
   ===================================================================== */

import * as THREE from 'three';

let ESCALA = 1; // 1 = calidad alta, 0.5 = calidad liviana

export function configurarCalidad(alta) {
    ESCALA = alta ? 1 : 0.5;
}

function dim(w, h) {
    return [Math.max(64, Math.round(w * ESCALA)), Math.max(32, Math.round(h * ESCALA))];
}

function crearTextura(canvas) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
}

/* ------------------------------- RUIDO ------------------------------- */
function makeSeededRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

function makeNoiseField(seed, { terms = 6, kxMin = 1, kxMax = 6, kyMin = 0.5, kyMax = 4 } = {}) {
    const rand = makeSeededRandom(seed);
    const layers = [];
    for (let i = 0; i < terms; i++) {
        layers.push({
            kx: kxMin + Math.floor(rand() * (kxMax - kxMin + 1)),
            ky: kyMin + rand() * (kyMax - kyMin),
            px: rand() * Math.PI * 2,
            py: rand() * Math.PI * 2,
            amp: Math.pow(0.6, i)
        });
    }
    return function (u, v) {
        let s = 0, n = 0;
        for (const l of layers) {
            s += l.amp * Math.sin(2 * Math.PI * l.kx * u + l.px) * Math.sin(Math.PI * l.ky * v + l.py + Math.PI / 2);
            n += l.amp;
        }
        return (s / n + 1) / 2;
    };
}

function makeFractal(seed) {
    const a = makeNoiseField(seed, { terms: 4, kxMin: 2, kxMax: 7, kyMin: 1, kyMax: 3 });
    const b = makeNoiseField(seed + 50, { terms: 5, kxMin: 8, kxMax: 16, kyMin: 2, kyMax: 6 });
    const c = makeNoiseField(seed + 99, { terms: 6, kxMin: 18, kxMax: 34, kyMin: 3, kyMax: 10 });
    return (u, v) => a(u, v) * 0.55 + b(u, v) * 0.30 + c(u, v) * 0.15;
}

function lerpColor(c1, c2, t) {
    return [
        c1[0] + (c2[0] - c1[0]) * t,
        c1[1] + (c2[1] - c1[1]) * t,
        c1[2] + (c2[2] - c1[2]) * t
    ];
}

function nuevoCanvas(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return { canvas, ctx: canvas.getContext('2d') };
}

/* ------------------------------ TIERRA ------------------------------ */
export function texturaTierra() {
    const [w, h] = dim(1024, 512);
    const field = makeFractal(11);
    const cloudField = makeFractal(777);
    const { canvas, ctx } = nuevoCanvas(w, h);
    const { canvas: cloudCanvas, ctx: cctx } = nuevoCanvas(w, h);
    const img = ctx.createImageData(w, h);
    const cimg = cctx.createImageData(w, h);

    const oceanDeep = [7, 26, 64], oceanShallow = [22, 88, 148];
    const landLow = [45, 108, 58], landMid = [122, 112, 62], desert = [176, 146, 88];
    const landHigh = [150, 138, 118], landPeak = [238, 238, 238];

    for (let y = 0; y < h; y++) {
        const v = y / h;
        const lat = (v - 0.5) * 2;
        const poleFactor = Math.max(0, (Math.abs(lat) - 0.80) / 0.20);
        for (let x = 0; x < w; x++) {
            const u = x / w;
            const n = field(u, v);
            let col;
            if (n < 0.47) {
                col = lerpColor(oceanDeep, oceanShallow, n / 0.47);
            } else {
                const t = (n - 0.47) / 0.53;
                if (t < 0.35) col = lerpColor(landLow, landMid, t / 0.35);
                else if (t < 0.55) col = lerpColor(landMid, desert, (t - 0.35) / 0.20);
                else if (t < 0.8) col = lerpColor(desert, landHigh, (t - 0.55) / 0.25);
                else col = lerpColor(landHigh, landPeak, (t - 0.8) / 0.20);
            }
            col = lerpColor(col, [250, 250, 255], Math.min(1, poleFactor));

            const idx = (y * w + x) * 4;
            img.data[idx] = col[0]; img.data[idx + 1] = col[1]; img.data[idx + 2] = col[2]; img.data[idx + 3] = 255;

            const cn = cloudField(u + 0.3, v);
            const alpha = Math.min(1, Math.max(0, (cn - 0.48) * 3.4)) * (1 - poleFactor * 0.5);
            cimg.data[idx] = 255; cimg.data[idx + 1] = 255; cimg.data[idx + 2] = 255; cimg.data[idx + 3] = Math.round(alpha * 255);
        }
    }
    ctx.putImageData(img, 0, 0);
    cctx.putImageData(cimg, 0, 0);
    return { map: crearTextura(canvas), clouds: crearTextura(cloudCanvas) };
}

/* ------------------------------- LUNA ------------------------------- */
export function texturaLuna() {
    const [w, h] = dim(512, 256);
    const field = makeFractal(303);
    const { canvas, ctx } = nuevoCanvas(w, h);
    const img = ctx.createImageData(w, h);
    const mare = [72, 70, 68], base = [152, 150, 146], highlight = [198, 196, 190];

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const n = field(x / w, y / h);
            const col = n < 0.4 ? lerpColor(mare, base, n / 0.4) : lerpColor(base, highlight, (n - 0.4) / 0.6);
            const idx = (y * w + x) * 4;
            img.data[idx] = col[0]; img.data[idx + 1] = col[1]; img.data[idx + 2] = col[2]; img.data[idx + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);

    const rand = makeSeededRandom(909);
    for (let i = 0; i < 130; i++) {
        const cx = rand() * w, cy = rand() * h, r = 2 + rand() * 13;
        const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
        grad.addColorStop(0, 'rgba(212,210,204,0.55)');
        grad.addColorStop(0.55, 'rgba(110,108,104,0.30)');
        grad.addColorStop(0.8, 'rgba(60,58,55,0.30)');
        grad.addColorStop(1, 'rgba(60,58,55,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    return crearTextura(canvas);
}

/* ------------------------------- MARTE ------------------------------- */
export function texturaMarte() {
    const [w, h] = dim(768, 384);
    const field = makeFractal(505);
    const ridge = makeFractal(606);
    const { canvas, ctx } = nuevoCanvas(w, h);
    const img = ctx.createImageData(w, h);
    const low = [104, 48, 28], mid = [176, 86, 46], high = [214, 140, 92], dust = [232, 178, 122];

    for (let y = 0; y < h; y++) {
        const v = y / h;
        const lat = (v - 0.5) * 2;
        const poleFactor = Math.max(0, (Math.abs(lat) - 0.82) / 0.18);
        for (let x = 0; x < w; x++) {
            const u = x / w;
            const n = field(u, v);
            const rdg = Math.abs(ridge(u, v) * 2 - 1);
            let col;
            if (n < 0.4) col = lerpColor(low, mid, n / 0.4);
            else if (n < 0.75) col = lerpColor(mid, high, (n - 0.4) / 0.35);
            else col = lerpColor(high, dust, (n - 0.75) / 0.25);
            col = lerpColor(col, low, rdg * 0.22);
            col = lerpColor(col, [255, 250, 245], Math.min(1, poleFactor));
            const idx = (y * w + x) * 4;
            img.data[idx] = col[0]; img.data[idx + 1] = col[1]; img.data[idx + 2] = col[2]; img.data[idx + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
    return crearTextura(canvas);
}

/* ------------------------------ MERCURIO ------------------------------ */
export function texturaMercurio() {
    const [w, h] = dim(512, 256);
    const field = makeFractal(1313);
    const { canvas, ctx } = nuevoCanvas(w, h);
    const img = ctx.createImageData(w, h);
    const low = [70, 62, 56], base = [140, 128, 116], highlight = [180, 168, 152];

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const n = field(x / w, y / h);
            const col = n < 0.4 ? lerpColor(low, base, n / 0.4) : lerpColor(base, highlight, (n - 0.4) / 0.6);
            const idx = (y * w + x) * 4;
            img.data[idx] = col[0]; img.data[idx + 1] = col[1]; img.data[idx + 2] = col[2]; img.data[idx + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);

    const rand = makeSeededRandom(1717);
    for (let i = 0; i < 170; i++) {
        const cx = rand() * w, cy = rand() * h, r = 1.5 + rand() * 11;
        const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
        grad.addColorStop(0, 'rgba(196,186,170,0.55)');
        grad.addColorStop(0.55, 'rgba(80,72,64,0.35)');
        grad.addColorStop(0.78, 'rgba(34,30,26,0.35)');
        grad.addColorStop(1, 'rgba(34,30,26,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    return crearTextura(canvas);
}

/* -------------------------------- VENUS -------------------------------- */
export function texturaVenus() {
    const [w, h] = dim(1024, 512);
    const field = makeFractal(2121);
    const swirl = makeFractal(2222);
    const { canvas, ctx } = nuevoCanvas(w, h);
    const img = ctx.createImageData(w, h);
    const deep = [196, 150, 88], mid = [226, 196, 138], bright = [246, 232, 196];

    for (let y = 0; y < h; y++) {
        const v = y / h;
        for (let x = 0; x < w; x++) {
            const u = x / w;
            const warp = (swirl(u, v) - 0.5) * 0.35;
            let uu = (u + warp) % 1; if (uu < 0) uu += 1;
            const n = field(uu, v);
            const col = n < 0.5 ? lerpColor(deep, mid, n / 0.5) : lerpColor(mid, bright, (n - 0.5) / 0.5);
            const idx = (y * w + x) * 4;
            img.data[idx] = col[0]; img.data[idx + 1] = col[1]; img.data[idx + 2] = col[2]; img.data[idx + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
    return crearTextura(canvas);
}

/* -------------------------------- SOL -------------------------------- */
export function texturaSol() {
    const [w, h] = dim(1024, 512);
    const field = makeFractal(909);
    const fine = makeFractal(1001);
    const { canvas, ctx } = nuevoCanvas(w, h);
    const img = ctx.createImageData(w, h);
    const deep = [255, 132, 30], hot = [255, 196, 84], core = [255, 244, 190];

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const n = field(x / w, y / h) * 0.7 + fine(x / w, y / h) * 0.3;
            const col = n < 0.5 ? lerpColor(deep, hot, n / 0.5) : lerpColor(hot, core, (n - 0.5) / 0.5);
            const idx = (y * w + x) * 4;
            img.data[idx] = col[0]; img.data[idx + 1] = col[1]; img.data[idx + 2] = col[2]; img.data[idx + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
    return crearTextura(canvas);
}

/* ------------------------------- JÚPITER ------------------------------- */
export function texturaJupiter() {
    const [w, h] = dim(1024, 512);
    const bandNoise = makeFractal(707);
    const turbulence = makeFractal(808);
    const { canvas, ctx } = nuevoCanvas(w, h);
    const img = ctx.createImageData(w, h);
    const palette = [[224, 198, 162], [198, 154, 106], [230, 216, 190], [170, 122, 82], [238, 226, 206], [152, 106, 70]];

    for (let y = 0; y < h; y++) {
        const v = y / h;
        for (let x = 0; x < w; x++) {
            const u = x / w;
            const warp = (turbulence(u, v) - 0.5) * 0.07;
            const bandPos = ((v + warp) * 18) % palette.length;
            const bi = Math.floor((bandPos + palette.length) % palette.length);
            const biNext = (bi + 1) % palette.length;
            const tFrac = bandPos - Math.floor(bandPos);
            let col = lerpColor(palette[bi], palette[biNext], tFrac);
            const n = bandNoise(u, v);
            col = lerpColor(col, [255, 240, 220], (n - 0.5) * 0.2);
            const idx = (y * w + x) * 4;
            img.data[idx] = col[0]; img.data[idx + 1] = col[1]; img.data[idx + 2] = col[2]; img.data[idx + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);

    const spotX = w * 0.62, spotY = h * 0.64, rx = w * 0.07, ry = rx * 0.58;
    ctx.save();
    ctx.translate(spotX, spotY);
    ctx.scale(1, ry / rx);
    ctx.translate(-spotX, -spotY);
    const grad = ctx.createRadialGradient(spotX, spotY, 4, spotX, spotY, rx);
    grad.addColorStop(0, 'rgba(196,84,58,0.95)');
    grad.addColorStop(0.6, 'rgba(184,94,62,0.75)');
    grad.addColorStop(1, 'rgba(184,94,62,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(spotX, spotY, rx, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    return crearTextura(canvas);
}

/* ------------------------------- SATURNO ------------------------------- */
export function texturaSaturno() {
    const [w, h] = dim(1024, 512);
    const bandNoise = makeFractal(2323);
    const turbulence = makeFractal(2424);
    const { canvas, ctx } = nuevoCanvas(w, h);
    const img = ctx.createImageData(w, h);
    const palette = [[230, 214, 178], [214, 194, 152], [238, 226, 196], [200, 180, 138]];

    for (let y = 0; y < h; y++) {
        const v = y / h;
        for (let x = 0; x < w; x++) {
            const u = x / w;
            const warp = (turbulence(u, v) - 0.5) * 0.05;
            const bandPos = ((v + warp) * 14) % palette.length;
            const bi = Math.floor((bandPos + palette.length) % palette.length);
            const biNext = (bi + 1) % palette.length;
            const tFrac = bandPos - Math.floor(bandPos);
            let col = lerpColor(palette[bi], palette[biNext], tFrac);
            const n = bandNoise(u, v);
            col = lerpColor(col, [250, 240, 215], (n - 0.5) * 0.12);
            const idx = (y * w + x) * 4;
            img.data[idx] = col[0]; img.data[idx + 1] = col[1]; img.data[idx + 2] = col[2]; img.data[idx + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
    return crearTextura(canvas);
}

/* --------------------------- GIGANTES HELADOS --------------------------- */
function texturaGiganteHelado(seed, base, variant, spot) {
    const [w, h] = dim(1024, 512);
    const field = makeFractal(seed);
    const { canvas, ctx } = nuevoCanvas(w, h);
    const img = ctx.createImageData(w, h);

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const n = field(x / w, y / h);
            const col = lerpColor(base, variant, n * 0.5);
            const idx = (y * w + x) * 4;
            img.data[idx] = col[0]; img.data[idx + 1] = col[1]; img.data[idx + 2] = col[2]; img.data[idx + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);

    if (spot) {
        const sx = w * 0.58, sy = h * 0.55, rx = w * 0.055, ry = rx * 0.62;
        ctx.save();
        ctx.translate(sx, sy); ctx.scale(1, ry / rx); ctx.translate(-sx, -sy);
        const grad = ctx.createRadialGradient(sx, sy, 4, sx, sy, rx);
        grad.addColorStop(0, 'rgba(20,40,70,0.85)');
        grad.addColorStop(0.6, 'rgba(30,55,90,0.6)');
        grad.addColorStop(1, 'rgba(30,55,90,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(sx, sy, rx, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
    return crearTextura(canvas);
}

export function texturaUrano() {
    return texturaGiganteHelado(2525, [176, 224, 224], [206, 240, 238], false);
}

export function texturaNeptuno() {
    return texturaGiganteHelado(2626, [46, 74, 168], [70, 108, 200], true);
}

/* ------------------------------- ANILLOS ------------------------------- */
// RingGeometry proyecta el UV en coordenadas planas: el degradé concéntrico
// se dibuja como un blanco radial centrado en el canvas.
export function texturaAnillo(innerFrac, tint = [195, 177, 150]) {
    const [size] = dim(512, 512);
    const { canvas, ctx } = nuevoCanvas(size, size);
    const img = ctx.createImageData(size, size);
    const cx = size / 2, cy = size / 2, R = size / 2;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = (x - cx) / R, dy = (y - cy) / R;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const idx = (y * size + x) * 4;
            let a = 0;
            if (dist >= innerFrac && dist <= 1) {
                const t = (dist - innerFrac) / (1 - innerFrac);
                a = 0.12 + 0.10 * Math.sin(t * 40) + 0.06 * Math.sin(t * 97 + 1.1);
                a = Math.max(0, Math.min(0.38, a));
                a *= Math.min(1, Math.min(t, 1 - t) * 8);
            }
            img.data[idx] = tint[0]; img.data[idx + 1] = tint[1]; img.data[idx + 2] = tint[2]; img.data[idx + 3] = Math.round(a * 255);
        }
    }
    ctx.putImageData(img, 0, 0);
    return crearTextura(canvas);
}

/* -------------------------------- BRILLO -------------------------------- */
export function texturaBrillo(inner = 'rgba(255,244,214,0.95)', outer = 'rgba(255,170,70,0)') {
    const { canvas, ctx } = nuevoCanvas(256, 256);
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.35, inner.replace(/[\d.]+\)$/, '0.45)'));
    grad.addColorStop(1, outer);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    return crearTextura(canvas);
}

/* --------------------------- TEXTURAS POR CUERPO --------------------------- */
export function crearMateriales(cuerpo, calidadAlta) {
    const comun = { roughness: 0.9, metalness: 0.02 };
    switch (cuerpo.id) {
        case 'sol':
            return { material: new THREE.MeshBasicMaterial({ map: texturaSol(), fog: false }) };
        case 'mercurio':
            return { material: new THREE.MeshStandardMaterial({ ...comun, map: texturaMercurio(), roughness: 1 }) };
        case 'venus':
            return { material: new THREE.MeshStandardMaterial({ ...comun, map: texturaVenus() }) };
        case 'tierra': {
            const { map, clouds } = texturaTierra();
            return { material: new THREE.MeshStandardMaterial({ ...comun, map, roughness: 0.75, metalness: 0.05 }), clouds };
        }
        case 'luna':
            return { material: new THREE.MeshStandardMaterial({ ...comun, map: texturaLuna(), roughness: 1 }) };
        case 'marte':
            return { material: new THREE.MeshStandardMaterial({ ...comun, map: texturaMarte(), roughness: 0.95 }) };
        case 'jupiter':
            return { material: new THREE.MeshStandardMaterial({ ...comun, map: texturaJupiter(), roughness: 0.85 }) };
        case 'saturno':
            return { material: new THREE.MeshStandardMaterial({ ...comun, map: texturaSaturno(), roughness: 0.85 }) };
        case 'urano':
            return { material: new THREE.MeshStandardMaterial({ ...comun, map: texturaUrano(), roughness: 0.8 }) };
        case 'neptuno':
            return { material: new THREE.MeshStandardMaterial({ ...comun, map: texturaNeptuno(), roughness: 0.8 }) };
        case 'cinturon':
        case 'kuiper':
            return { material: new THREE.MeshStandardMaterial({ color: cuerpo.color, roughness: 1, metalness: 0.05 }) };
        default:
            return { material: new THREE.MeshStandardMaterial({ ...comun, color: cuerpo.color }) };
    }
}
