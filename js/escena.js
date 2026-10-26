/* =====================================================================
   ESCENA 3D
   Motor Three.js: sistema solar, nave, cinturones, vuelos y encuadre.
   La interfaz NO se dibuja acá: esta clase solo avisa por callbacks.
   ===================================================================== */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { crearMateriales, texturaAnillo, texturaBrillo, configurarCalidad } from './texturas.js';

const DEG = Math.PI / 180;

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
}

function clamp01(v) {
    return Math.max(0, Math.min(1, v));
}

function siguienteFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function miniaturaDe(map) {
    if (!map || !map.image) return null;
    try {
        const origen = map.image;
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(origen, 0, 0, 256, 128);
        return canvas.toDataURL('image/jpeg', 0.82);
    } catch {
        return null;
    }
}

export class Recorrido {
    constructor(contenedor, opciones = {}) {
        this.contenedor = contenedor;
        this.opciones = {
            calidadAlta: true,
            alIniciarVuelo: () => {},
            alCambiarParada: () => {},
            alLlegar: () => {},
            alSaltarIntro: () => {},
            ...opciones
        };
        this.cuerpos = [];
        this.asteroides = [];
        this.nave = null;
        this.anclaNave = new THREE.Vector3();
        this.vuelo = null;
        this.contadorVuelos = 0;
        this.autoTour = false;
        this.temporizadorTour = null;
        this.estrellaNave = 0;
        this.faseBalanceo = Math.random() * Math.PI * 2;
        this.destinoActual = 0;
        this.introActiva = false;
        this.haloNave = null;
        this.balizas = [];
        this.calidadAlta = this.opciones.calidadAlta;
        configurarCalidad(this.calidadAlta);
        this._construirBase();
    }

    /* ------------------------------------------------------------------ */
    _construirBase() {
        const ancho = window.innerWidth;
        const alto = window.innerHeight;

        this.escena = new THREE.Scene();
        this.escena.background = new THREE.Color(0x03040c);
        this.escena.fog = new THREE.FogExp2(0x03040c, 0.0022);

        this.reloj = new THREE.Clock();
        this.camara = new THREE.PerspectiveCamera(58, ancho / alto, 0.1, 4000);
        this.camara.position.set(0, 8, 24);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(ancho, alto);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.calidadAlta ? 2 : 1.25));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.02;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.contenedor.appendChild(this.renderer.domElement);

        this.controles = new OrbitControls(this.camara, this.renderer.domElement);
        this.controles.enableDamping = true;
        this.controles.dampingFactor = 0.06;
        this.controles.minDistance = 1.5;
        this.controles.maxDistance = 420;
        this.controles.enablePan = true;
        this.controles.panSpeed = 0.6;
        this.controles.rotateSpeed = 0.55;
        this.controles.zoomSpeed = 0.8;

        // Iluminación: el Sol es la fuente principal. El ambiente es bajo para
        // que los planetas tengan volumen y no se vean "lavados".
        this.escena.add(new THREE.AmbientLight(0x3a4a6a, 0.55));
        this.escena.add(new THREE.HemisphereLight(0x9dc4ff, 0x140f24, 0.7));

        this.luzSol = new THREE.PointLight(0xfff2d8, 3.4, 0, 0);
        this.luzSol.position.set(0, 0, 0);
        this.escena.add(this.luzSol);

        // Luces propias de la nave. Van montadas sobre el grupo (no en
        // coordenadas del mundo) para que acompañen su rotación, y con
        // atenuación lineal para que la iluminación no dependa de la escala.
        this.luzNaveA = new THREE.PointLight(0xcfeaff, 2.6, 3.4, 0);
        this.luzNaveB = new THREE.PointLight(0xff6ad5, 1.0, 2.8, 0);
        this.luzNaveC = new THREE.PointLight(0xffffff, 1.7, 3.2, 0);
        this.luzNaveA.position.set(0.9, 1.1, 1.2);
        this.luzNaveB.position.set(-1.0, 0.15, -0.6);
        this.luzNaveC.position.set(0, 0.7, -1.3);

        this._crearEstrellas();
        this._crearWarp();
        this._crearEstela();

        window.addEventListener('resize', () => this.actualizarTamano());
        this.actualizarTamano();
        this.animar();
    }

    /* ------------------------------------------------------- HIPERESPACIO */
    // Túnel de estelas de luz que vive pegado a la cámara. Es el efecto
    // "velocidad de la luz": las líneas nacen lejos y se acercan a toda
    // velocidad, abriéndose por perspectiva.
    _crearWarp() {
        const cantidad = this.calidadAlta ? 950 : 480;
        const geo = new THREE.BufferGeometry();
        const posiciones = new Float32Array(cantidad * 2 * 3);
        this.warpDatos = [];
        const rand = this._random(7777);

        for (let i = 0; i < cantidad; i++) {
            const ang = rand() * Math.PI * 2;
            const radio = 2.2 + Math.pow(rand(), 0.55) * 22;
            this.warpDatos.push({
                x: Math.cos(ang) * radio,
                y: Math.sin(ang) * radio,
                z: -4 - rand() * 78
            });
        }
        geo.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));
        const mat = new THREE.LineBasicMaterial({
            color: 0xcfeaff,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.warp = new THREE.LineSegments(geo, mat);
        this.warp.frustumCulled = false;
        this.warp.visible = false;
        this.escena.add(this.warp);
        this.intensidadWarp = 0;
    }

    _crearEstela() {
        const tex = texturaBrillo('rgba(190,240,255,0.95)', 'rgba(90,170,255,0)');
        this.estela = new THREE.Sprite(new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0,
            fog: false
        }));
        this.estela.scale.set(9, 9, 1);
        this.estela.visible = false;
        this.escena.add(this.estela);
    }

    _actualizarWarp(delta, intensidad) {
        this.intensidadWarp = intensidad;
        const visible = intensidad > 0.01;
        this.warp.visible = visible;
        this.estela.visible = visible && !!this.nave;
        if (!visible) {
            this.camara.fov = 58;
            this.camara.updateProjectionMatrix();
            return;
        }

        this.warp.material.opacity = 0.9 * intensidad;
        this.warp.position.copy(this.camara.position);
        this.warp.quaternion.copy(this.camara.quaternion);

        const arr = this.warp.geometry.attributes.position.array;
        const velocidad = 34 + 150 * intensidad;
        const largo = 1.2 + 16 * intensidad;
        for (let i = 0; i < this.warpDatos.length; i++) {
            const d = this.warpDatos[i];
            d.z += velocidad * delta;
            if (d.z > -1.2) {
                d.z = -78 - Math.random() * 24;
                const ang = Math.random() * Math.PI * 2;
                const radio = 2.2 + Math.pow(Math.random(), 0.55) * 22;
                d.x = Math.cos(ang) * radio;
                d.y = Math.sin(ang) * radio;
            }
            const o = i * 6;
            arr[o] = d.x; arr[o + 1] = d.y; arr[o + 2] = d.z;
            arr[o + 3] = d.x; arr[o + 4] = d.y; arr[o + 5] = d.z - largo;
        }
        this.warp.geometry.attributes.position.needsUpdate = true;

        // La estela queda detrás de la nave, sobre la línea de vuelo.
        if (this.nave) {
            const dir = this.direccionIntro || new THREE.Vector3(0, 0, -1);
            this.estela.position.copy(this.nave.position).addScaledVector(dir, -3.6);
            this.estela.material.opacity = 0.55 * intensidad;
            this.estela.scale.setScalar(4.5 + 4.5 * intensidad);
        }

        // Un leve aumento de campo de visión acentúa la sensación de velocidad.
        const fov = 58 + 15 * intensidad;
        if (Math.abs(this.camara.fov - fov) > 0.01) {
            this.camara.fov = fov;
            this.camara.updateProjectionMatrix();
        }
    }

    /* ------------------------------------------------------------ ESTRELLAS */
    _crearEstrellas() {
        const cantidad = this.calidadAlta ? 4200 : 2200;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(cantidad * 3);
        const col = new Float32Array(cantidad * 3);
        const color = new THREE.Color();

        for (let i = 0; i < cantidad; i++) {
            // Cascarón esférico lejano: las estrellas quedan detrás de todo.
            const r = 420 + Math.random() * 520;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.cos(phi) * 0.65;
            pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

            const t = Math.random();
            if (t > 0.94) color.setHSL(0.08, 0.6, 0.85);
            else if (t > 0.86) color.setHSL(0.58, 0.5, 0.88);
            else color.setHSL(0.6, 0.08, 0.75 + Math.random() * 0.25);
            col[i * 3] = color.r;
            col[i * 3 + 1] = color.g;
            col[i * 3 + 2] = color.b;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        const mat = new THREE.PointsMaterial({
            size: 1.7,
            sizeAttenuation: false,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
            fog: false
        });
        this.estrellas = new THREE.Points(geo, mat);
        this.escena.add(this.estrellas);

        // Banda de la Vía Láctea: más estrellas concentradas en un plano.
        const bandaCant = this.calidadAlta ? 2600 : 1200;
        const geo2 = new THREE.BufferGeometry();
        const pos2 = new Float32Array(bandaCant * 3);
        for (let i = 0; i < bandaCant; i++) {
            const ang = Math.random() * Math.PI * 2;
            const r = 380 + Math.random() * 480;
            const desvio = (Math.random() + Math.random() + Math.random() - 1.5) * 55;
            pos2[i * 3] = Math.cos(ang) * r;
            pos2[i * 3 + 1] = desvio;
            pos2[i * 3 + 2] = Math.sin(ang) * r;
        }
        geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
        const mat2 = new THREE.PointsMaterial({
            size: 1.15,
            sizeAttenuation: false,
            color: 0xbcd4ff,
            transparent: true,
            opacity: 0.42,
            depthWrite: false,
            fog: false
        });
        const banda = new THREE.Points(geo2, mat2);
        banda.rotation.x = 0.42;
        banda.rotation.z = -0.25;
        this.escena.add(banda);
    }

    /* ---------------------------------------------------------------- SOL */
    _crearSol() {
        const geo = new THREE.SphereGeometry(7, 48, 48);
        const mat = new THREE.MeshBasicMaterial({ map: crearMateriales({ id: 'sol' }).material.map, fog: false });
        this.sol = new THREE.Mesh(geo, mat);
        this.escena.add(this.sol);

        const brillo = texturaBrillo();
        const halo1 = new THREE.Sprite(new THREE.SpriteMaterial({
            map: brillo, transparent: true, blending: THREE.AdditiveBlending,
            depthWrite: false, fog: false, opacity: 0.75
        }));
        halo1.scale.set(21, 21, 1);
        this.escena.add(halo1);

        const halo2 = new THREE.Sprite(new THREE.SpriteMaterial({
            map: brillo, transparent: true, blending: THREE.AdditiveBlending,
            depthWrite: false, fog: false, opacity: 0.32
        }));
        halo2.scale.set(38, 38, 1);
        this.escena.add(halo2);

        this.halosSol = [halo1, halo2];
    }

    /* ------------------------------------------------------------ CUERPOS */
    async construir(cuerpos, alProgreso = () => {}) {
        this.cuerpos = cuerpos;
        alProgreso('Encendiendo el Sol', 0.05);
        await siguienteFrame();
        this._crearSol();

        for (let i = 0; i < cuerpos.length; i++) {
            const cuerpo = cuerpos[i];
            if (cuerpo.id === 'sol') {
                cuerpo.malla = this.sol;
                cuerpo.miniatura = miniaturaDe(this.sol.material.map);
                continue;
            }
            alProgreso(`Modelando ${cuerpo.nombre}`, 0.08 + (i / cuerpos.length) * 0.72);
            await siguienteFrame();
            this._crearCuerpo(cuerpo);
        }

        alProgreso('Sembrando asteroides', 0.84);
        await siguienteFrame();
        this._crearCinturon();
        this._crearKuiper();
        this._crearOrbitas();

        alProgreso('Preparando la nave', 0.92);
        await siguienteFrame();
    }

    _crearCuerpo(cuerpo) {
        const radio = cuerpo.radio;
        const segmentos = this.calidadAlta ? 64 : 36;
        const geo = new THREE.SphereGeometry(radio, segmentos, segmentos / 2);
        const { material, clouds } = crearMateriales(cuerpo, this.calidadAlta);

        const holder = new THREE.Group();
        holder.position.set(cuerpo.pos.x, cuerpo.pos.y, cuerpo.pos.z);
        // Inclinación del eje: le da realismo y explica las estaciones.
        const inclinaciones = { tierra: 23.4, marte: 25.2, saturno: 26.7, neptuno: 28.3, urano: 97.8, jupiter: 3.1 };
        holder.rotation.z = (inclinaciones[cuerpo.id] || 0) * DEG;

        const malla = new THREE.Mesh(geo, material);
        malla.userData.cuerpo = cuerpo.id;
        holder.add(malla);
        this.escena.add(holder);

        cuerpo.malla = malla;
        cuerpo.holder = holder;
        cuerpo.miniatura = miniaturaDe(material.map);

        if (clouds) {
            const nubes = new THREE.Mesh(
                new THREE.SphereGeometry(radio * 1.015, segmentos, segmentos / 2),
                new THREE.MeshStandardMaterial({
                    map: clouds, transparent: true, depthWrite: false,
                    roughness: 1, metalness: 0, opacity: 0.9
                })
            );
            malla.add(nubes);
            cuerpo.nubes = nubes;

            const atmosfera = new THREE.Mesh(
                new THREE.SphereGeometry(radio * 1.1, 40, 40),
                new THREE.MeshBasicMaterial({
                    color: 0x6fc0ff, transparent: true, opacity: 0.16,
                    side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false
                })
            );
            malla.add(atmosfera);
        }

        if (cuerpo.id === 'venus') {
            malla.add(new THREE.Mesh(
                new THREE.SphereGeometry(radio * 1.07, 40, 40),
                new THREE.MeshBasicMaterial({
                    color: 0xffe9b0, transparent: true, opacity: 0.13,
                    side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false
                })
            ));
        }

        if (cuerpo.id === 'jupiter') {
            this._agregarAnillo(holder, radio * 1.35, radio * 1.75, [200, 180, 150], 0.45);
            malla.add(new THREE.Mesh(
                new THREE.SphereGeometry(radio * 1.04, 40, 40),
                new THREE.MeshBasicMaterial({
                    color: 0xffd9a0, transparent: true, opacity: 0.09,
                    side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false
                })
            ));
        }

        if (cuerpo.id === 'saturno') {
            this._agregarAnillo(holder, radio * 1.28, radio * 2.35, [228, 208, 168], 1);
        }

        // El cinturón y el Kuiper se representan con grupos de rocas, no esferas.
        if (cuerpo.id === 'cinturon' || cuerpo.id === 'kuiper') {
            malla.visible = false;
        }
    }

    _agregarAnillo(holder, interior, exterior, tinte, opacidad) {
        const geo = new THREE.RingGeometry(interior, exterior, 128, 1);
        const mat = new THREE.MeshStandardMaterial({
            map: texturaAnillo(interior / exterior, tinte),
            transparent: true,
            side: THREE.DoubleSide,
            roughness: 1,
            metalness: 0,
            opacity: opacidad,
            depthWrite: false
        });
        const anillo = new THREE.Mesh(geo, mat);
        anillo.rotation.x = -Math.PI / 2;
        holder.add(anillo);
        return anillo;
    }

    _crearCinturon() {
        const geo = new THREE.DodecahedronGeometry(0.4, 0);
        const paleta = [0x8a7358, 0x746046, 0x9c8468, 0x655338];
        const mats = paleta.map((color) => new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0.05 }));
        const rand = this._random(4242);
        const cantidad = this.calidadAlta ? 300 : 150;
        const interior = 50, exterior = 68;

        for (let i = 0; i < cantidad; i++) {
            const malla = new THREE.Mesh(geo, mats[i % mats.length]);
            const ang = rand() * Math.PI * 2;
            const rad = interior + rand() * (exterior - interior);
            malla.position.set(Math.cos(ang) * rad, (rand() - 0.5) * 3.2, Math.sin(ang) * rad);
            malla.scale.setScalar(0.35 + rand() * 1.05);
            malla.userData = {
                velocidad: 0.00025 + rand() * 0.0008,
                angulo: ang,
                radio: rad,
                giro: { x: rand() * 0.02, y: rand() * 0.02 }
            };
            this.escena.add(malla);
            this.asteroides.push(malla);
        }

        // Grupo de rocas grandes en la parada del cinturón: le da algo
        // concreto al visitante para mirar y comparar tamaños.
        const parada = this.cuerpos.find((c) => c.id === 'cinturon');
        if (parada) {
            const grupo = new THREE.Group();
            grupo.position.set(parada.pos.x, parada.pos.y, parada.pos.z);
            for (let i = 0; i < 16; i++) {
                const roca = new THREE.Mesh(
                    new THREE.DodecahedronGeometry(0.35 + rand() * 0.85, 0),
                    mats[i % mats.length]
                );
                roca.position.set((rand() - 0.5) * 7, (rand() - 0.5) * 4, (rand() - 0.5) * 7);
                roca.rotation.set(rand() * 3, rand() * 3, rand() * 3);
                grupo.add(roca);
            }
            this.escena.add(grupo);
            parada.grupoParada = grupo;
        }
    }

    _crearKuiper() {
        const rand = this._random(8181);
        const geo = new THREE.IcosahedronGeometry(0.35, 0);
        const mat = new THREE.MeshStandardMaterial({ color: 0x9fb7d8, roughness: 1, metalness: 0.05 });
        const cantidad = this.calidadAlta ? 140 : 70;

        for (let i = 0; i < cantidad; i++) {
            const malla = new THREE.Mesh(geo, mat);
            const ang = rand() * Math.PI * 2;
            const rad = 178 + rand() * 26;
            malla.position.set(Math.cos(ang) * rad, (rand() - 0.5) * 8, Math.sin(ang) * rad);
            malla.scale.setScalar(0.4 + rand() * 1.1);
            malla.userData = {
                velocidad: 0.00012 + rand() * 0.0003,
                angulo: ang,
                radio: rad,
                giro: { x: rand() * 0.01, y: rand() * 0.01 }
            };
            this.escena.add(malla);
            this.asteroides.push(malla);
        }

        // Plutón: pequeño mundo helado en la parada "Más allá".
        const parada = this.cuerpos.find((c) => c.id === 'kuiper');
        if (parada) {
            const pluton = new THREE.Mesh(
                new THREE.SphereGeometry(0.65, 32, 24),
                new THREE.MeshStandardMaterial({ color: 0xcbb9a6, roughness: 1, metalness: 0 })
            );
            pluton.position.set(parada.pos.x, parada.pos.y, parada.pos.z);
            this.escena.add(pluton);
            parada.malla = pluton;
            parada.holder = pluton;
        }
    }

    _crearOrbitas() {
        const material = new THREE.LineBasicMaterial({
            color: 0x3d6ea8, transparent: true, opacity: 0.28, depthWrite: false
        });
        const vistos = new Set();

        for (const cuerpo of this.cuerpos) {
            if (!cuerpo.pos || cuerpo.id === 'sol' || cuerpo.id === 'luna') continue;
            const dist = Math.hypot(cuerpo.pos.x, cuerpo.pos.z);
            if (vistos.has(Math.round(dist))) continue;
            vistos.add(Math.round(dist));
            const puntos = [];
            for (let i = 0; i <= 160; i++) {
                const a = (i / 160) * Math.PI * 2;
                puntos.push(new THREE.Vector3(Math.cos(a) * dist, 0, Math.sin(a) * dist));
            }
            const geo = new THREE.BufferGeometry().setFromPoints(puntos);
            this.escena.add(new THREE.LineLoop(geo, material));
        }

        // Órbita chiquita de la Luna alrededor de la Tierra.
        const tierra = this.cuerpos.find((c) => c.id === 'tierra');
        const luna = this.cuerpos.find((c) => c.id === 'luna');
        if (tierra && luna) {
            const dx = luna.pos.x - tierra.pos.x;
            const dz = luna.pos.z - tierra.pos.z;
            const r = Math.hypot(dx, dz);
            const centro = new THREE.Vector3(tierra.pos.x, tierra.pos.y + 0.6, tierra.pos.z);
            const puntos = [];
            for (let i = 0; i <= 80; i++) {
                const a = (i / 80) * Math.PI * 2;
                puntos.push(new THREE.Vector3(centro.x + Math.cos(a) * r, centro.y + Math.sin(a) * 1.2, centro.z + Math.sin(a) * r));
            }
            this.escena.add(new THREE.LineLoop(
                new THREE.BufferGeometry().setFromPoints(puntos),
                new THREE.LineBasicMaterial({ color: 0x6f8fbf, transparent: true, opacity: 0.35 })
            ));
        }
    }

    _random(seed) {
        let s = seed % 2147483647;
        if (s <= 0) s += 2147483646;
        return () => {
            s = (s * 16807) % 2147483647;
            return (s - 1) / 2147483646;
        };
    }

    /* ---------------------------------------------------------------- NAVE */
    async cargarNave(alProgreso = () => {}) {
        const loader = new GLTFLoader();
        let modelo = null;
        try {
            const gltf = await loader.loadAsync('./models/nave.glb', (xhr) => {
                if (xhr.total) alProgreso(Math.round((xhr.loaded / xhr.total) * 100));
            });
            modelo = gltf.scene;
        } catch (error) {
            console.warn('No se pudo cargar nave.glb, se usa una nave simple.', error);
            modelo = this._naveDeReemplazo();
        }

        // El GLB de Sketchfab trae, además del casco, sillas y consolas del
        // interior repartidas por la escena. Si se escalan con todo eso la
        // nave queda chica y descentrada: nos quedamos solo con el casco.
        modelo.updateMatrixWorld(true);
        const cascos = [];
        modelo.traverse((hijo) => {
            if (!hijo.isMesh) return;
            const nombre = `${hijo.name} ${hijo.parent ? hijo.parent.name : ''}`;
            if (/dropship/i.test(nombre)) cascos.push(hijo);
        });
        const partes = cascos.length ? cascos : [];
        if (!partes.length) {
            modelo.traverse((hijo) => { if (hijo.isMesh) partes.push(hijo); });
        }
        const visibles = new Set(partes);
        modelo.traverse((hijo) => {
            if (hijo.isMesh && !visibles.has(hijo)) hijo.visible = false;
        });

        const caja = new THREE.Box3();
        for (const parte of partes) caja.expandByObject(parte);
        const centro = caja.getCenter(new THREE.Vector3());
        const tamano = caja.getSize(new THREE.Vector3());
        const mayor = Math.max(tamano.x, tamano.y, tamano.z) || 1;

        // El casco queda normalizado: su lado más largo mide 1 unidad.
        // Así la escala del grupo es directamente su tamaño en el mundo.
        const escala = 1 / mayor;
        // El casco tiene la proa sobre +X; girado -90° queda mirando hacia
        // -Z, que es la dirección que usa _orientarNave para el rumbo.
        const giro = -Math.PI / 2;
        modelo.rotation.y = giro;
        modelo.scale.setScalar(escala);
        modelo.position.copy(centro).multiplyScalar(-escala).applyAxisAngle(new THREE.Vector3(0, 1, 0), giro);

        modelo.traverse((hijo) => {
            if (!hijo.isMesh || !hijo.visible) return;
            hijo.frustumCulled = false;
            const mats = Array.isArray(hijo.material) ? hijo.material : [hijo.material];
            const brillantes = mats.map((m) => this._materialBrillante(m));
            hijo.material = brillantes.length === 1 ? brillantes[0] : brillantes;
        });

        const grupo = new THREE.Group();
        grupo.add(modelo);
        grupo.add(this.luzNaveA, this.luzNaveB, this.luzNaveC);
        const { inicio } = this._puntosIntro();
        grupo.position.copy(inicio);
        this.escena.add(grupo);
        this.nave = grupo;
        this.anclaNave.copy(inicio);
        grupo.scale.setScalar(this._escalaNave(0));
        this._orientarNave(inicio, this._waypoint(0), 1);
        this._crearBalizasNave();
        return true;
    }

    // Tamaño de la nave para que ocupe siempre una franja parecida de la
    // pantalla, sin importar si el planeta es la Luna o Júpiter.
    _escalaNave(idx) {
        const cuerpo = this.cuerpos[idx];
        if (!cuerpo) return 1;
        const pos = new THREE.Vector3(cuerpo.pos.x, cuerpo.pos.y, cuerpo.pos.z);
        const dist = this._camaraPara(cuerpo).distanceTo(pos);
        const alto = window.innerHeight || 800;
        const fraccion = alto < 720 ? 0.145 : 0.12;
        const escala = fraccion * 2 * dist * Math.tan(THREE.MathUtils.degToRad(this.camara.fov / 2));
        return THREE.MathUtils.clamp(escala, 0.3, 9);
    }

    // Balizas y halo: la nave se puede localizar de un vistazo aunque esté
    // contra el fondo negro del espacio o en la cara nocturna de un planeta.
    _crearBalizasNave() {
        const tex = texturaBrillo('rgba(255,255,255,0.95)', 'rgba(120,220,255,0)');

        this.haloNave = new THREE.Sprite(new THREE.SpriteMaterial({
            map: tex,
            color: 0x9fe8ff,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: false,
            opacity: 0.24,
            fog: false
        }));
        this.haloNave.renderOrder = 8;
        this.haloNave.scale.set(1.55, 1.55, 1);
        this.nave.add(this.haloNave);

        // Coordenadas locales: el casco mide 1 unidad de largo, así que las
        // balizas van en los extremos de las alas y en el lomo.
        const definiciones = [
            { color: 0xff4d5e, pos: [-0.33, 0.02, 0], fase: 0 },      // babor: rojo
            { color: 0x49ff8a, pos: [0.33, 0.02, 0], fase: Math.PI },  // estribor: verde
            { color: 0xffffff, pos: [0, 0.16, 0], fase: Math.PI / 2 }  // baliza superior
        ];

        for (const def of definiciones) {
            const color = new THREE.Color(def.color);
            const malla = new THREE.Mesh(
                new THREE.SphereGeometry(0.022, 8, 8),
                new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, depthTest: false, fog: false })
            );
            malla.position.set(...def.pos);
            malla.renderOrder = 9;
            this.nave.add(malla);

            const brillo = new THREE.Sprite(new THREE.SpriteMaterial({
                map: tex,
                color,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                depthTest: false,
                opacity: 0.8,
                fog: false
            }));
            brillo.renderOrder = 9;
            brillo.position.copy(malla.position);
            brillo.scale.set(0.3, 0.3, 1);
            this.nave.add(brillo);

            this.balizas.push({ malla, brillo, fase: def.fase });
        }
    }

    _materialBrillante(material) {
        const m = material.clone();
        if ('emissive' in m) {
            m.emissive = new THREE.Color(0x4a7ba8);
            m.emissiveIntensity = 0.85;
        }
        if ('roughness' in m) m.roughness = 0.45;
        if ('metalness' in m) m.metalness = Math.min(m.metalness ?? 0.3, 0.28);
        if ('color' in m && m.color) m.color.multiplyScalar(1.15);
        m.fog = false;
        return m;
    }

    _naveDeReemplazo() {
        const grupo = new THREE.Group();
        const cuerpo = new THREE.Mesh(
            new THREE.ConeGeometry(0.9, 2.2, 8),
            new THREE.MeshStandardMaterial({ color: 0x9fe8ff, emissive: 0x0d6d8c, emissiveIntensity: 0.8 })
        );
        cuerpo.rotation.x = Math.PI / 2;
        grupo.add(cuerpo);
        const ala = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, 0.12, 0.6),
            new THREE.MeshStandardMaterial({ color: 0x6fb7d8, metalness: 0.4, roughness: 0.4 })
        );
        grupo.add(ala);
        return grupo;
    }

    /* -------------------------------------------------------------- VUELOS */
    _puntosIntro(idx = 0) {
        // La nave viene desde el espacio profundo, en la misma dirección desde
        // la que después la cámara mira al planeta. Así el aterrizaje
        // no obliga a un giro brusco de cámara.
        const llegada = this._waypoint(idx);
        const u = new THREE.Vector3(1, 0.42, 1).normalize();
        const inicio = llegada.clone().addScaledVector(u, -380);
        inicio.y += 42;
        return { inicio, llegada, u };
    }

    _camaraPara(cuerpo) {
        const u = new THREE.Vector3(1, 0.42, 1).normalize();
        const d = Math.max(6, cuerpo.radio * (cuerpo.camRatio || 7));
        return new THREE.Vector3(
            cuerpo.pos.x + u.x * d,
            cuerpo.pos.y + u.y * d,
            cuerpo.pos.z + u.z * d
        );
    }

    _waypoint(idx) {
        const cuerpo = this.cuerpos[idx];
        if (!cuerpo) return new THREE.Vector3();
        const posCuerpo = new THREE.Vector3(cuerpo.pos.x, cuerpo.pos.y, cuerpo.pos.z);
        const camPos = this._camaraPara(cuerpo);
        const distCam = camPos.distanceTo(posCuerpo);

        // Cámara virtual con el mismo encuadre (incluido el view offset) para
        // calcular dónde cae el planeta en píxeles.
        const cam = this.camara.clone();
        cam.position.copy(camPos);
        cam.lookAt(posCuerpo);
        cam.updateMatrixWorld(true);

        const ancho = window.innerWidth || 1280;
        const alto = window.innerHeight || 800;
        const aPx = (v) => {
            const p = v.clone().project(cam);
            return { x: (p.x + 1) * 0.5 * ancho, y: (1 - p.y) * 0.5 * alto };
        };

        const centro = aPx(posCuerpo);
        const derecha = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
        const borde = aPx(posCuerpo.clone().addScaledVector(derecha, cuerpo.radio));
        const radioPx = Math.max(18, Math.hypot(borde.x - centro.x, borde.y - centro.y));

        const radioNavePx = Math.max(26, alto * 0.075);
        const separacion = radioPx + radioNavePx + 16;
        const angulo = Math.PI * 0.30; // abajo y a la derecha
        let px = centro.x + Math.cos(angulo) * separacion;
        let py = centro.y + Math.sin(angulo) * separacion;

        // Zona libre real: evita el panel, la barra superior y la ruta.
        const panel = document.getElementById('panel');
        const ruta = document.querySelector('.route');
        const rectPanel = panel ? panel.getBoundingClientRect() : null;
        const rectRuta = ruta ? ruta.getBoundingClientRect() : null;
        const panelAbajo = rectPanel ? rectPanel.top > alto * 0.3 : ancho < 900;
        let izq = 24;
        let der = ancho - 24;
        let arriba = 84;
        let abajo = alto - 24;
        if (!panelAbajo && rectPanel) izq = rectPanel.right + 24;
        if (rectRuta && rectRuta.height) abajo = Math.min(abajo, rectRuta.top - 26);
        if (panelAbajo && rectPanel) abajo = Math.min(abajo, rectPanel.top - 20);
        px = THREE.MathUtils.clamp(px, izq, Math.max(izq, der));
        py = THREE.MathUtils.clamp(py, arriba, Math.max(arriba, abajo));

        // Punto del rayo a una profundidad algo menor que el planeta, pero
        // siempre por delante de su superficie.
        const profundidad = Math.min(distCam * 0.86, distCam - cuerpo.radio * 1.4);
        const plano = new THREE.Plane().setFromNormalAndCoplanarPoint(
            cam.getWorldDirection(new THREE.Vector3()),
            camPos.clone().addScaledVector(cam.getWorldDirection(new THREE.Vector3()), profundidad)
        );
        const ndc = new THREE.Vector2((px / ancho) * 2 - 1, -(py / alto) * 2 + 1);
        const rayo = new THREE.Raycaster();
        rayo.setFromCamera(ndc, cam);
        const punto = new THREE.Vector3();
        if (!rayo.ray.intersectPlane(plano, punto)) {
            // Respaldo: offset clásico si algo falla.
            punto.copy(posCuerpo).add(new THREE.Vector3(0.9, -0.5, 0.25).normalize().multiplyScalar(radioPx / 20));
        }
        return punto;
    }

    _orientarNave(desde, hasta, mezcla = 0.15) {
        if (!this.nave) return;
        const direccion = hasta.clone().sub(desde);
        if (direccion.lengthSq() < 0.0001) return;
        const matriz = new THREE.Matrix4();
        matriz.lookAt(this.nave.position, this.nave.position.clone().add(direccion.normalize()), this.nave.up);
        const objetivo = new THREE.Quaternion().setFromRotationMatrix(matriz);
        objetivo.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI));
        this.nave.quaternion.slerp(objetivo, mezcla);
    }

    irA(idx, { duracion = 2.4, intro = false } = {}) {
        if (!this.cuerpos.length) return;
        idx = Math.max(0, Math.min(this.cuerpos.length - 1, idx));
        const cuerpo = this.cuerpos[idx];
        const destinoCam = this._camaraPara(cuerpo);
        const destinoObjetivo = new THREE.Vector3(cuerpo.pos.x, cuerpo.pos.y, cuerpo.pos.z);
        const destinoNave = this._waypoint(idx);
        const destinoEscala = this._escalaNave(idx);

        let origenCam = this.camara.position.clone();
        let origenObjetivo = this.controles.target.clone();
        let origenNave = this.anclaNave.clone();
        let origenEscala = this.nave ? this.nave.scale.x : destinoEscala;
        let dur = duracion;
        let tipo = 'normal';
        let datosIntro = null;

        if (intro) {
            const { inicio, llegada } = this._puntosIntro();
            const dir = llegada.clone().sub(inicio).normalize();
            const arriba = new THREE.Vector3(0, 1, 0);
            const derecha = new THREE.Vector3().crossVectors(dir, arriba).normalize();
            const arribaCam = new THREE.Vector3().crossVectors(derecha, dir).normalize();

            this.direccionIntro = dir.clone();
            origenNave = inicio.clone();
            origenEscala = destinoEscala;
            this.anclaNave.copy(inicio);
            if (this.nave) {
                this.nave.position.copy(inicio);
                this.nave.scale.setScalar(destinoEscala);
            }

            // Cámara detrás de la nave, mirando hacia adelante: se la ve de
            // espaldas y el túnel de hiperespacio se abre delante de ella.
            origenCam = inicio.clone()
                .addScaledVector(dir, -14)
                .addScaledVector(derecha, 3)
                .addScaledVector(arribaCam, 4);
            origenObjetivo = inicio.clone().addScaledVector(dir, 26);
            this.camara.position.copy(origenCam);
            this.controles.target.copy(origenObjetivo);

            tipo = 'intro';
            // 12 s: el viaje a velocidad luz y la frenada final se aprecian
            // sin apuro (antes eran 7,4 s).
            dur = 12;
            datosIntro = { inicio, llegada, dir, derecha, arribaCam };
        }

        this.contadorVuelos++;
        this.vuelo = {
            id: this.contadorVuelos,
            t0: performance.now(),
            dur: Math.max(0.001, dur),
            origenCam,
            destinoCam,
            origenObjetivo,
            destinoObjetivo,
            origenNave,
            destinoNave,
            origenEscala,
            destinoEscala,
            intro,
            tipo,
            datosIntro
        };
        this.destinoActual = idx;
        this.controles.enabled = false;
        if (intro) this.introActiva = true;
        this.opciones.alCambiarParada(idx);
        this.opciones.alIniciarVuelo(idx, intro);
    }

    saltarIntro() {
        if (!this.introActiva) return;
        this.vuelo = null;
        this.introActiva = false;
        this._actualizarWarp(0, 0);
        const cuerpo = this.cuerpos[this.destinoActual];
        this.camara.position.copy(this._camaraPara(cuerpo));
        this.controles.target.set(cuerpo.pos.x, cuerpo.pos.y, cuerpo.pos.z);
        this.anclaNave.copy(this._waypoint(this.destinoActual));
        if (this.nave) {
            this.nave.position.copy(this.anclaNave);
            this.nave.scale.setScalar(this._escalaNave(this.destinoActual));
        }
        this.controles.enabled = true;
        this.opciones.alSaltarIntro();
        this.opciones.alLlegar(this.destinoActual);
    }

    _actualizarVuelo(ahora, delta) {
        const v = this.vuelo;
        if (!v) {
            this._actualizarWarp(delta, 0);
            return;
        }
        const k = clamp01((ahora - v.t0) / (v.dur * 1000));

        if (v.tipo === 'intro') {
            const d = v.datosIntro;
            // Fase 1: viaje a velocidad luz. Fase 2: frenada y encuadre final.
            const avance = easeOutQuint(clamp01((k - 0.04) / 0.66));
            const posNave = d.inicio.clone().lerp(d.llegada, avance);
            this.anclaNave.copy(posNave);
            if (this.nave) {
                this.nave.position.copy(posNave);
                this.nave.scale.setScalar(v.destinoEscala);
                this._orientarNave(d.inicio, d.llegada, 0.16);
            }

            let intensidad = 0;
            if (k < 0.07) intensidad = k / 0.07;
            else if (k < 0.56) intensidad = 1;
            else if (k < 0.84) intensidad = 1 - (k - 0.56) / 0.28;
            this._actualizarWarp(delta, clamp01(intensidad));

            const camSeguimiento = posNave.clone()
                .addScaledVector(d.dir, -14)
                .addScaledVector(d.derecha, 3)
                .addScaledVector(d.arribaCam, 4);
            const objSeguimiento = posNave.clone().addScaledVector(d.dir, 26);
            const mezcla = easeInOutCubic(clamp01((k - 0.60) / 0.30));

            this.camara.position.lerpVectors(camSeguimiento, v.destinoCam, mezcla);
            this.controles.target.lerpVectors(objSeguimiento, v.destinoObjetivo, mezcla);

            if (k >= 1) {
                this.vuelo = null;
                this.anclaNave.copy(v.destinoNave);
                if (this.nave) {
                    this.nave.position.copy(this.anclaNave);
                    this.nave.scale.setScalar(v.destinoEscala);
                }
                this._actualizarWarp(delta, 0);
                this.controles.enabled = true;
                this.introActiva = false;
                this.opciones.alLlegar(this.destinoActual);
            } else {
                this.introActiva = true;
            }
            return;
        }

        this._actualizarWarp(delta, 0);
        const e = easeInOutCubic(k);

        this.camara.position.lerpVectors(v.origenCam, v.destinoCam, e);
        this.controles.target.lerpVectors(v.origenObjetivo, v.destinoObjetivo, e);

        if (this.nave) {
            this.anclaNave.lerpVectors(v.origenNave, v.destinoNave, e);
            this.nave.position.copy(this.anclaNave);
            this.nave.scale.setScalar(THREE.MathUtils.lerp(v.origenEscala, v.destinoEscala, e));
            this._orientarNave(v.origenNave, v.destinoNave, 0.2);
        }

        if (k >= 1) {
            this.vuelo = null;
            this.anclaNave.copy(v.destinoNave);
            if (this.nave) {
                this.nave.position.copy(this.anclaNave);
                this.nave.scale.setScalar(v.destinoEscala);
            }
            this.controles.enabled = true;
            this.introActiva = false;
            this.opciones.alLlegar(this.destinoActual);
        }
    }

    /* --------------------------------------------------------------- TOUR */
    activarTour(activo, intervalo = 9000) {
        this.autoTour = activo;
        clearTimeout(this.temporizadorTour);
        if (!activo) return;
        const paso = () => {
            if (!this.autoTour) return;
            const siguiente = (this.destinoActual + 1) % this.cuerpos.length;
            this.irA(siguiente);
            this.temporizadorTour = setTimeout(paso, intervalo);
        };
        this.temporizadorTour = setTimeout(paso, intervalo);
    }

    /* --------------------------------------------------------- ENCUADRE */
    // Desplaza la cámara (no el objeto) para que el planeta quede centrado en
    // el espacio libre de la pantalla, lejos de la tarjeta y de la ruta.
    actualizarTamano() {
        const ancho = window.innerWidth;
        const alto = window.innerHeight;
        this.camara.aspect = ancho / alto;

        // Se mira dónde está realmente el panel (CSS Grid lo mueve a la
        // izquierda o abajo según el ancho), no un breakpoint duplicado.
        const panel = document.getElementById('panel');
        const rect = panel ? panel.getBoundingClientRect() : null;
        const panelAbajo = rect ? rect.top > alto * 0.3 : ancho < 900;

        let desplazarX = 0;
        let desplazarY = 0;
        if (!panelAbajo && rect) {
            // Escritorio: la tarjeta ocupa la izquierda.
            desplazarX = Math.min(ancho * 0.22, (rect.width + 48) * 0.5);
        } else {
            // Móvil/tablet: la tarjeta y la ruta ocupan la parte inferior.
            const altoPanel = rect ? rect.height : alto * 0.4;
            desplazarY = Math.min(alto * 0.2, altoPanel * 0.5);
        }

        // setViewOffset mueve el frustum: con estos signos el planeta se
        // corre a la derecha (escritorio) o hacia arriba (móvil), lejos del
        // panel y de la ruta.
        if (desplazarX || desplazarY) {
            this.camara.setViewOffset(ancho, alto, -desplazarX, desplazarY, ancho, alto);
        } else {
            this.camara.clearViewOffset();
        }
        this.camara.updateProjectionMatrix();
        this.renderer.setSize(ancho, alto);
    }

    /* ------------------------------------------------------------ ANIMAR */
    animar() {
        requestAnimationFrame(() => this.animar());
        const delta = Math.min(this.reloj.getDelta(), 0.05);
        const tiempo = this.reloj.elapsedTime;

        if (document.hidden) return;

        this._actualizarVuelo(performance.now(), delta);

        for (const cuerpo of this.cuerpos) {
            if (cuerpo.malla && cuerpo.id !== 'cinturon' && cuerpo.id !== 'kuiper') {
                cuerpo.malla.rotation.y += cuerpo.rotSpeed || 0.002;
            }
            if (cuerpo.nubes) cuerpo.nubes.rotation.y += 0.0007;
            if (cuerpo.grupoParada) cuerpo.grupoParada.rotation.y += 0.0004;
        }
        if (this.sol) this.sol.rotation.y += 0.00035;
        if (this.estrellas) this.estrellas.rotation.y += 0.00002;

        for (const roca of this.asteroides) {
            const d = roca.userData;
            roca.rotation.x += d.giro.x;
            roca.rotation.y += d.giro.y;
            d.angulo += d.velocidad;
            roca.position.x = Math.cos(d.angulo) * d.radio;
            roca.position.z = Math.sin(d.angulo) * d.radio;
        }

        if (this.nave) {
            const escala = this.nave.scale.x || 1;
            this.luzNaveA.distance = 3.4 * escala;
            this.luzNaveB.distance = 2.8 * escala;
            this.luzNaveC.distance = 3.2 * escala;

            if (this.haloNave) {
                const pulso = 0.5 + 0.5 * Math.sin(tiempo * 2.1 + this.faseBalanceo);
                const intensidad = this.intensidadWarp || 0;
                this.haloNave.material.opacity = 0.14 + pulso * 0.08 + intensidad * 0.22;
                this.haloNave.scale.setScalar(1.45 + pulso * 0.16 + intensidad * 1.1);
            }

            for (const baliza of this.balizas) {
                const encendida = Math.sin(tiempo * 3.2 + baliza.fase) > 0.15;
                baliza.malla.material.opacity = encendida ? 1 : 0.18;
                baliza.brillo.material.opacity = encendida ? 0.9 : 0.1;
            }

            if (!this.vuelo) {
                const estable = this.anclaNave.clone();
                estable.y += Math.sin(tiempo * 1.6 + this.faseBalanceo) * 0.14;
                this.nave.position.lerp(estable, Math.min(delta * 5, 1));
                this.nave.rotateZ(Math.sin(tiempo * 1.2) * 0.0007);
            }
        }

        this.controles.update();
        this.renderer.render(this.escena, this.camara);
    }
}
