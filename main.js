import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ===== VARIABLES =====
let scene, camera, renderer, controls;
let modoNoche = false;
let musicaActiva = false;
let nave = null;
let audioContext = null;
let tourAutomatico = false;
let tourInterval = null;
let planetaActual = 0;
let planetas = [];
let asteroides = [];
let camaraObjetivo = new THREE.Vector3(0, 0, 0);

// ===== DATOS DE LOS PLANETAS =====
// Distancias escaladas para que sean más realistas y la nave pueda viajar entre ellos
const datosPlanetas = [
    {
        nombre: "TIERRA",
        icono: "🌍",
        descripcion: "Nuestro hogar azul, el único planeta conocido con vida. Un mundo dinámico con océanos, continentes y una atmósfera protectora.",
        distancia: "149.6M km",
        diametro: "12,742 km",
        temperatura: "15°C",
        posicion: { x: 0, y: 0, z: 0 },
        camara: { x: 25, y: 10, z: 25 },
        color: 0x2266ff
    },
    {
        nombre: "LUNA",
        icono: "🌙",
        descripcion: "Nuestro satélite natural. Cubierta de cráteres, sin atmósfera, con temperaturas extremas entre día y noche.",
        distancia: "384,400 km (de la Tierra)",
        diametro: "3,474 km",
        temperatura: "-173°C a 127°C",
        posicion: { x: -40, y: 5, z: -30 },
        camara: { x: -50, y: 15, z: -40 },
        color: 0xaaaaaa
    },
    {
        nombre: "MARTE",
        icono: "🔴",
        descripcion: "El planeta rojo. Hogar del volcán más grande del sistema solar, Olympus Mons. Objetivo principal para la exploración humana.",
        distancia: "227.9M km",
        diametro: "6,779 km",
        temperatura: "-63°C",
        posicion: { x: 60, y: -8, z: 45 },
        camara: { x: 75, y: 8, z: 60 },
        color: 0xff4422
    },
    {
        nombre: "CINTURÓN DE ASTEROIDES",
        icono: "☄️",
        descripcion: "Región entre Marte y Júpiter llena de millones de asteroides. Restos de la formación del sistema solar.",
        distancia: "2.2-3.2 UA",
        diametro: "Varía",
        temperatura: "-73°C",
        posicion: { x: -80, y: 10, z: -60 },
        camara: { x: -70, y: 25, z: -55 },
        color: 0x886644
    },
    {
        nombre: "JÚPITER",
        icono: "🟠",
        descripcion: "El gigante gaseoso. El planeta más grande del sistema solar, con su famosa Gran Mancha Roja y más de 80 lunas.",
        distancia: "778.5M km",
        diametro: "139,820 km",
        temperatura: "-108°C",
        posicion: { x: 120, y: -15, z: 90 },
        camara: { x: 140, y: 15, z: 110 },
        color: 0xff8844
    }
];

// ===== INICIALIZACIÓN =====
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = null;

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
    // Cámara inicial posicionada PARA VER LA NAVE desde atrás (la nave está en 0,100,200)
    camera.position.set(0, 98, 210);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.0;
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2;
    controls.maxDistance = 100;
    controls.autoRotate = false;

    setupLighting();
    crearFondoEstrellas();
    cargarNave();
    crearPlanetas();
    crearAsteroides();
    setupAudio();
    setupUI();
    setupResponsive();
    actualizarInfoPanel(0);
    crearIndicadores();

    animate();
}

// ===== ILUMINACIÓN =====
function setupLighting() {
    const ambient = new THREE.AmbientLight(0x4488cc, 1.2);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffeedd, 3.0);
    sun.position.set(10, 15, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 50;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x88bbff, 1.5);
    fill.position.set(-10, 5, -10);
    scene.add(fill);

    const frontal = new THREE.DirectionalLight(0xffffff, 2.0);
    frontal.position.set(0, 3, 10);
    scene.add(frontal);

    const bottom = new THREE.DirectionalLight(0x4488ff, 1.0);
    bottom.position.set(0, -10, 0);
    scene.add(bottom);

    const warm = new THREE.DirectionalLight(0xff8844, 1.0);
    warm.position.set(-5, 5, -10);
    scene.add(warm);

    const pointLight = new THREE.PointLight(0x88ccff, 0.5, 20);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    window.sunLight = sun;
}

// ===== FONDO DE ESTRELLAS =====
function crearFondoEstrellas() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 6000;
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
        const radius = 80 + Math.random() * 150;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        const color = new THREE.Color().setHSL(0.6 + Math.random() * 0.3, 0.4, 0.4 + Math.random() * 0.6);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starsMaterial = new THREE.PointsMaterial({
        size: 0.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// ===== CREAR PLANETAS =====
function crearPlanetas() {
    datosPlanetas.forEach((datos, index) => {
        const geometria = new THREE.SphereGeometry(index === 3 ? 0 : (index === 4 ? 8 : 2), 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: datos.color,
            metalness: 0.3,
            roughness: 0.7,
            emissive: datos.color,
            emissiveIntensity: 0.2
        });
        const planeta = new THREE.Mesh(geometria, material);
        planeta.position.set(datos.posicion.x, datos.posicion.y, datos.posicion.z);
        planeta.userData = { esPlaneta: true, indice: index };
        scene.add(planeta);
        planetas.push(planeta);
        
        // Añadir anillos a Júpiter
        if (index === 4) {
            const anilloGeo = new THREE.RingGeometry(9, 12, 64);
            const anilloMat = new THREE.MeshBasicMaterial({
                color: 0xcc8866,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.4
            });
            const anillo = new THREE.Mesh(anilloGeo, anilloMat);
            anillo.rotation.x = Math.PI / 2;
            anillo.position.set(datos.posicion.x, datos.posicion.y, datos.posicion.z);
            scene.add(anillo);
        }
    });
}

// ===== CREAR ASTEROIDES =====
function crearAsteroides() {
    const asteroideGeo = new THREE.DodecahedronGeometry(0.3, 0);
    const asteroideMat = new THREE.MeshStandardMaterial({
        color: 0x886644,
        metalness: 0.5,
        roughness: 0.9
    });
    
    for (let i = 0; i < 200; i++) {
        const asteroide = new THREE.Mesh(asteroideGeo, asteroideMat);
        const angle = Math.random() * Math.PI * 2;
        const radius = 20 + Math.random() * 15;
        asteroide.position.set(
            Math.cos(angle) * radius + datosPlanetas[3].posicion.x,
            (Math.random() - 0.5) * 8 + datosPlanetas[3].posicion.y,
            Math.sin(angle) * radius + datosPlanetas[3].posicion.z
        );
        asteroide.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        asteroide.userData = { 
            rotacionSpeed: { 
                x: (Math.random() - 0.5) * 0.02, 
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            },
            orbitSpeed: 0.001 + Math.random() * 0.002,
            orbitAngle: angle,
            orbitRadius: radius
        };
        scene.add(asteroide);
        asteroides.push(asteroide);
    }
}

// ===== CARGAR NAVE =====
let frenteNave = new THREE.Vector3(0, 0, 1); // Dirección del frente (se calcula automáticamente)
let colaNave = new THREE.Vector3(0, 0, -1); // Dirección de la cola
let cinematicaCompletada = false;

function cargarNave() {
    const loader = new GLTFLoader();
    const statusText = document.getElementById('loading-status');
    statusText.textContent = 'Cargando nave...';

    loader.load(
        './models/nave.glb',
        (gltf) => {
            nave = gltf.scene;

            // ESCALA EXTREMADAMENTE PEQUEÑA - La nave debe verse como un punto lejano
            const escalaManual = 0.0005; // Escala mínima posible
            
            // Posición inicial SEGURA: MUY por encima de la Tierra para no estar dentro del planeta
            // La Tierra está en (0,0,0) con radio 2, así que ponemos la nave muy lejos
            nave.position.set(0, 100, 200); // Coordenadas muy seguras, visibles desde lejos
            nave.scale.set(escalaManual, escalaManual, escalaManual);
            nave.renderOrder = 1;

            // Calcular automáticamente el frente y la cola del modelo
            calcularFrenteYCola(nave);

            nave.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.transparent = false;
                    child.material.opacity = 1.0;
                    child.material.depthWrite = true;
                    child.material.depthTest = true;
                    child.material.side = THREE.FrontSide;
                    child.material.needsUpdate = true;
                    child.renderOrder = 1;
                }
            });

            scene.add(nave);
            console.log('✅ Nave cargada correctamente');
            console.log('📏 Escala manual aplicada:', escalaManual);
            console.log('🎯 Frente de la nave:', frenteNave);
            console.log('🔙 Cola de la nave:', colaNave);

            // Iniciar cinemática de introducción
            iniciarCinematicaIntro();

            actualizarBarraCarga(100);
        },
        (xhr) => {
            const progress = (xhr.loaded / xhr.total) * 100;
            statusText.textContent = `Cargando: ${Math.round(progress)}%`;
            actualizarBarraCarga(progress);
        },
        (error) => {
            console.error('❌ Error cargando nave:', error);
            statusText.textContent = 'Error al cargar nave';
            actualizarBarraCarga(100);
            crearNaveFallback();
        }
    );
}

// ===== CALCULAR FRENTE Y COLA DE LA NAVE =====
function calcularFrenteYCola(naveModelo) {
    const box = new THREE.Box3().setFromObject(naveModelo);
    const centro = new THREE.Vector3();
    box.getCenter(centro);
    
    // Encontrar los puntos más extremos en cada eje
    let maxX = -Infinity, minX = Infinity;
    let maxY = -Infinity, minY = Infinity;
    let maxZ = -Infinity, minZ = Infinity;
    
    naveModelo.traverse((child) => {
        if (child.isMesh) {
            const geo = child.geometry;
            if (geo && geo.attributes.position) {
                const positions = geo.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    const vertex = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
                    vertex.applyMatrix4(child.matrixWorld);
                    
                    if (vertex.x > maxX) maxX = vertex.x;
                    if (vertex.x < minX) minX = vertex.x;
                    if (vertex.y > maxY) maxY = vertex.y;
                    if (vertex.y < minY) minY = vertex.y;
                    if (vertex.z > maxZ) maxZ = vertex.z;
                    if (vertex.z < minZ) minZ = vertex.z;
                }
            }
        }
    });
    
    // Asumir que el eje más largo es el frente/cola (normalmente Z o X)
    const largoX = maxX - minX;
    const largoY = maxY - minY;
    const largoZ = maxZ - minZ;
    
    if (largoZ >= largoX && largoZ >= largoY) {
        // El eje Z es el más largo
        frenteNave.set(0, 0, 1);
        colaNave.set(0, 0, -1);
        console.log('📐 Eje principal: Z (largo:', largoZ.toFixed(2), ')');
    } else if (largoX >= largoZ && largoX >= largoY) {
        // El eje X es el más largo
        frenteNave.set(1, 0, 0);
        colaNave.set(-1, 0, 0);
        console.log('📐 Eje principal: X (largo:', largoX.toFixed(2), ')');
    } else {
        // El eje Y es el más largo
        frenteNave.set(0, 1, 0);
        colaNave.set(0, -1, 0);
        console.log('📐 Eje principal: Y (largo:', largoY.toFixed(2), ')');
    }
}

// ===== CINEMÁTICA DE INTRODUCCIÓN =====
function iniciarCinematicaIntro() {
    if (!nave) return;
    
    cinematicaCompletada = false;
    const duracionTotal = 5000; // 5 segundos
    const startTime = Date.now();
    
    // Posición inicial de la cámara: lejos para ver toda la nave (la nave está en 0,100,200)
    const posicionInicialCamara = new THREE.Vector3(0, 95, 220);
    // Posición intermedia: acercándose gradualmente
    const posicionMediaCamara = new THREE.Vector3(0, 98, 210);
    // Posición final: detrás de la nave mirando hacia el frente
    const posicionFinalCamara = new THREE.Vector3(0, 98, 205); // Detrás de la nave
    
    function updateCinematica() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duracionTotal, 1);
        
        // Interpolación suave entre posiciones
        let camPos;
        if (progress < 0.4) {
            // Primera parte: mostrar la nave completa desde lejos
            const p1 = progress / 0.4;
            camPos = posicionInicialCamara.clone().lerp(posicionMediaCamara, p1);
        } else if (progress < 0.8) {
            // Segunda parte: acercarse gradualmente
            const p2 = (progress - 0.4) / 0.4;
            camPos = posicionMediaCamara.clone().lerp(posicionFinalCamara, p2);
        } else {
            // Parte final: posición definitiva detrás de la nave
            camPos = posicionFinalCamara.clone();
        }
        
        camera.position.copy(camPos);
        controls.target.copy(nave.position); // Mirar hacia la nave
        
        if (progress < 1) {
            requestAnimationFrame(updateCinematica);
        } else {
            cinematicaCompletada = true;
            console.log('🎬 Cinemática completada - Vista desde atrás activada');
            console.log('📍 Nave posición:', nave.position);
            console.log('📍 Cámara posición:', camera.position);
        }
    }
    
    updateCinematica();
}

// ===== NAVE FALLBACK =====
function crearNaveFallback() {
    const group = new THREE.Group();
    group.renderOrder = 1;

    const body = new THREE.Mesh(
        new THREE.ConeGeometry(2, 4, 8),
        new THREE.MeshStandardMaterial({
            color: 0x88aaff,
            metalness: 0.7,
            roughness: 0.2,
            emissive: 0x224466,
            emissiveIntensity: 0.2,
            transparent: false,
            opacity: 1.0
        })
    );
    body.rotation.x = Math.PI / 2;
    body.castShadow = true;
    group.add(body);

    const cabin = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 16, 16),
        new THREE.MeshStandardMaterial({
            color: 0x44ddff,
            metalness: 0.1,
            roughness: 0.1,
            transparent: false,
            opacity: 1.0
        })
    );
    cabin.position.set(0, 0.5, 1.5);
    cabin.scale.set(1, 0.8, 0.6);
    group.add(cabin);

    for (let x of [-1.5, 1.5]) {
        const wing = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.05, 1.5),
            new THREE.MeshStandardMaterial({ color: 0x88aaff, metalness: 0.7, roughness: 0.2, transparent: false, opacity: 1.0 })
        );
        wing.position.set(x, -0.3, -0.5);
        wing.castShadow = true;
        group.add(wing);
    }

    for (let x of [-0.8, 0.8]) {
        const engine = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.5, 0.5, 8),
            new THREE.MeshStandardMaterial({
                color: 0xff8844,
                emissive: 0xff4400,
                emissiveIntensity: 0.8,
                transparent: false,
                opacity: 1.0
            })
        );
        engine.position.set(x, -0.2, -2.2);
        engine.rotation.x = Math.PI / 2;
        group.add(engine);
    }

    group.position.set(3, 1, 3); // Mismo offset que la nave cargada
    group.scale.set(0.3, 0.3, 0.3); // Escala reducida para fallback
    scene.add(group);
    nave = group;
}

// ===== ANIMACIÓN DE ENTRADA =====
function animateEntry(object) {
    const duration = 1500;
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        const scale = ease * 0.5;
        object.scale.set(scale, scale, scale);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    update();
}

// ===== UI =====
function setupUI() {
    document.getElementById('btn-noche').addEventListener('click', toggleNightMode);
    document.getElementById('btn-musica').addEventListener('click', toggleMusic);
    document.getElementById('btn-auto').addEventListener('click', toggleTourAutomatico);
    document.getElementById('btn-prev').addEventListener('click', () => navegarPlaneta(-1));
    document.getElementById('btn-next').addEventListener('click', () => navegarPlaneta(1));
}

// ===== NAVEGACIÓN ENTRE PLANETAS =====
function navegarPlaneta(direccion) {
    planetaActual += direccion;
    if (planetaActual < 0) planetaActual = datosPlanetas.length - 1;
    if (planetaActual >= datosPlanetas.length) planetaActual = 0;
    
    actualizarInfoPanel(planetaActual);
    actualizarIndicadores();
    moverCamaraAPlaneta(planetaActual);
}

// ===== ACTUALIZAR INFO PANEL =====
function actualizarInfoPanel(indice) {
    const datos = datosPlanetas[indice];
    document.getElementById('planet-icon').textContent = datos.icono;
    document.getElementById('planet-name').textContent = datos.nombre;
    document.getElementById('planet-description').textContent = datos.descripcion;
    document.getElementById('stat-distance').textContent = datos.distancia;
    document.getElementById('stat-diameter').textContent = datos.diametro;
    document.getElementById('stat-temp').textContent = datos.temperatura;
    
    // Mostrar panel
    const panel = document.getElementById('info-panel');
    panel.classList.remove('hidden');
    panel.style.opacity = '0';
    setTimeout(() => {
        panel.style.transition = 'opacity 0.5s ease';
        panel.style.opacity = '1';
    }, 100);
}

// ===== CREAR INDICADORES =====
function crearIndicadores() {
    const container = document.getElementById('planet-indicators');
    container.innerHTML = '';
    datosPlanetas.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'planet-indicator' + (index === planetaActual ? ' active' : '');
        indicator.addEventListener('click', () => {
            planetaActual = index;
            actualizarInfoPanel(index);
            actualizarIndicadores();
            moverCamaraAPlaneta(index);
        });
        container.appendChild(indicator);
    });
}

// ===== ACTUALIZAR INDICADORES =====
function actualizarIndicadores() {
    const indicators = document.querySelectorAll('.planet-indicator');
    indicators.forEach((ind, index) => {
        ind.classList.toggle('active', index === planetaActual);
    });
}

// ===== MOVER CÁMARA A PLANETA =====
function moverCamaraAPlaneta(indice) {
    const datos = datosPlanetas[indice];
    const targetPos = new THREE.Vector3(datos.camara.x, datos.camara.y, datos.camara.z);
    const targetLook = new THREE.Vector3(datos.posicion.x, datos.posicion.y, datos.posicion.z);
    
    // Calcular posición de la nave relativa a la cámara (offset constante)
    const offsetNave = new THREE.Vector3(2, -0.5, 2); // Offset relativo a la cámara
    
    // Animación suave de la cámara y la nave
    const startPos = camera.position.clone();
    const startLook = controls.target.clone();
    const startNavePos = nave ? nave.position.clone() : new THREE.Vector3(15, 5, 15);
    const targetNavePos = targetPos.clone().add(offsetNave); // La nave sigue a la cámara
    
    const duration = 2000;
    const startTime = Date.now();
    
    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        camera.position.lerpVectors(startPos, targetPos, ease);
        controls.target.lerpVectors(startLook, targetLook, ease);
        
        // Mover la nave junto con la cámara
        if (nave) {
            nave.position.lerpVectors(startNavePos, targetNavePos, ease);
        }
        
        controls.update();
        
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        }
    }
    animateCamera();
}

// ===== TOUR AUTOMÁTICO =====
function toggleTourAutomatico() {
    tourAutomatico = !tourAutomatico;
    const btn = document.getElementById('btn-auto');
    
    if (tourAutomatico) {
        btn.classList.add('activo');
        btn.textContent = '⏸ Pausa';
        navegarPlaneta(1); // Ir al siguiente
        tourInterval = setInterval(() => {
            navegarPlaneta(1);
        }, 8000); // 8 segundos por planeta
    } else {
        btn.classList.remove('activo');
        btn.textContent = '▶ Auto';
        clearInterval(tourInterval);
    }
}

// ===== NOCHE/DÍA =====
function toggleNightMode() {
    modoNoche = !modoNoche;
    const bg = modoNoche ? 0x020208 : 0x050510;
    scene.background = new THREE.Color(bg);

    if (window.sunLight) {
        window.sunLight.intensity = modoNoche ? 0.3 : 3.0;
    }

    const btn = document.getElementById('btn-noche');
    btn.classList.toggle('activo');
    btn.textContent = modoNoche ? '☀️' : '🌙';
}

// ===== MÚSICA =====
function setupAudio() {
    const audio = document.getElementById('ambient-music');
    audio.addEventListener('canplaythrough', () => {
        console.log('🎵 Música lista');
    });
}

function toggleMusic() {
    const audio = document.getElementById('ambient-music');
    const btn = document.getElementById('btn-musica');
    const indicator = document.getElementById('audio-indicator');

    if (!musicaActiva) {
        audio.play().catch(() => {});
        musicaActiva = true;
        btn.classList.add('activo');
        btn.textContent = '🔊';
        indicator.classList.remove('hidden');
    } else {
        audio.pause();
        musicaActiva = false;
        btn.classList.remove('activo');
        btn.textContent = '🎵';
        indicator.classList.add('hidden');
    }
}

// ===== BARRA DE CARGA =====
function actualizarBarraCarga(progress) {
    const fill = document.getElementById('progress-fill');
    fill.style.width = Math.min(progress, 100) + '%';

    if (progress >= 100) {
        setTimeout(() => {
            document.getElementById('loading-overlay').classList.add('hidden');
        }, 500);
    }
}

// ===== RESPONSIVE =====
function setupResponsive() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ===== LOOP =====
function animate() {
    requestAnimationFrame(animate);
    const time = performance.now() / 1000;

    // La nave sigue a la cámara con un offset fijo (como si fueras el piloto)
    if (nave) {
        // Offset relativo a la cámara: derecha y abajo de la vista
        const offset = new THREE.Vector3(2, -0.8, 1.5);
        
        // Calcular posición objetivo basada en la cámara actual
        const targetPos = camera.position.clone().add(offset);
        
        // Interpolación suave para que la nave siga a la cámara
        nave.position.lerp(targetPos, 0.1);
        
        // Pequeña oscilación vertical para efecto de flotación
        nave.position.y += Math.sin(time * 2) * 0.002;
        
        // La nave mira en la dirección del movimiento
        nave.lookAt(camera.position.clone().add(new THREE.Vector3(0, 0, -5)));
    }

    // Animar asteroides
    asteroides.forEach(asteroide => {
        asteroide.rotation.x += asteroide.userData.rotacionSpeed.x;
        asteroide.rotation.y += asteroide.userData.rotacionSpeed.y;
        asteroide.rotation.z += asteroide.userData.rotacionSpeed.z;
        
        // Órbita suave
        asteroide.userData.orbitAngle += asteroide.userData.orbitSpeed;
        asteroide.position.x = Math.cos(asteroide.userData.orbitAngle) * asteroide.userData.orbitRadius + datosPlanetas[3].posicion.x;
        asteroide.position.z = Math.sin(asteroide.userData.orbitAngle) * asteroide.userData.orbitRadius + datosPlanetas[3].posicion.z;
    });

    // Rotación suave de planetas
    planetas.forEach(planeta => {
        if (planeta.userData.esPlaneta) {
            planeta.rotation.y += 0.002;
        }
    });

    controls.update();
    renderer.render(scene, camera);
}

// ===== INICIALIZAR =====
init();

console.log('🚀 RECORRIDO ESPACIAL - Versión Final');
console.log('🎯 Nave cargada correctamente');
console.log('💡 Sin efecto warp - Simple y funcional');// force deploy trigger Tue Aug 11 23:35:50 UTC 2026
