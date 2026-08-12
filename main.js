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

// Estados de la cinemática
let cinematicaActiva = true;
let tiempoCinematicaInicio = 0;

// ===== DATOS DE LOS PLANETAS =====
const datosPlanetas = [
    {
        nombre: "TIERRA",
        icono: "🌍",
        descripcion: "Nuestro hogar azul, el único planeta conocido con vida.",
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
        descripcion: "Nuestro satélite natural. Cubierta de cráteres.",
        distancia: "384,400 km",
        diametro: "3,474 km",
        temperatura: "-173°C a 127°C",
        posicion: { x: -40, y: 5, z: -30 },
        camara: { x: -50, y: 15, z: -40 },
        color: 0xaaaaaa
    },
    {
        nombre: "MARTE",
        icono: "🔴",
        descripcion: "El planeta rojo. Hogar del volcán Olympus Mons.",
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
        descripcion: "Región entre Marte y Júpiter llena de asteroides.",
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
        descripcion: "El gigante gaseoso. El planeta más grande del sistema solar.",
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
    scene.fog = new THREE.FogExp2(0x050510, 0.002);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Posición inicial de cámara LEJOS para ver la nave en la intro
    camera.position.set(0, 110, 240); 

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 300;
    // Durante la cinemática, deshabilitamos el control manual temporalmente en el loop

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
    const ambient = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xffffff, 3);
    sunLight.position.set(50, 30, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);
    
    window.sunLight = sunLight;
}

// ===== FONDO DE ESTRELLAS =====
function crearFondoEstrellas() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 8000;
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
        const r = 200 + Math.random() * 300;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const color = new THREE.Color().setHSL(0.6, 0.5, Math.random() * 0.5 + 0.5);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starsMaterial = new THREE.PointsMaterial({ size: 0.7, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

// ===== CREAR PLANETAS =====
function crearPlanetas() {
    datosPlanetas.forEach((datos, index) => {
        // Radio ajustado: Tierra=3, Júpiter=12, Asteroides=0
        let radio = 3;
        if (index === 4) radio = 12; // Júpiter grande
        if (index === 3) radio = 0.5; // Centro del cinturón
        
        const geometria = new THREE.SphereGeometry(radio, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            color: datos.color,
            roughness: 0.8,
            metalness: 0.1,
            emissive: datos.color,
            emissiveIntensity: 0.1
        });
        
        const planeta = new THREE.Mesh(geometria, material);
        planeta.position.set(datos.posicion.x, datos.posicion.y, datos.posicion.z);
        planeta.castShadow = true;
        planeta.receiveShadow = true;
        scene.add(planeta);
        planetas.push(planeta);

        // Anillos de Júpiter (simulados)
        if (index === 4) {
            const anilloGeo = new THREE.RingGeometry(13, 18, 64);
            const anilloMat = new THREE.MeshBasicMaterial({ color: 0xccaa88, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
            const anillo = new THREE.Mesh(anilloGeo, anilloMat);
            anillo.rotation.x = Math.PI / 2;
            anillo.position.copy(planeta.position);
            scene.add(anillo);
        }
    });
}

// ===== CREAR ASTEROIDES =====
function crearAsteroides() {
    const asteroideGeo = new THREE.DodecahedronGeometry(0.5, 0);
    const asteroideMat = new THREE.MeshStandardMaterial({ color: 0x886644, roughness: 1 });
    
    for (let i = 0; i < 300; i++) {
        const asteroide = new THREE.Mesh(asteroideGeo, asteroideMat);
        const angle = Math.random() * Math.PI * 2;
        const radius = 15 + Math.random() * 10;
        
        asteroide.position.set(
            Math.cos(angle) * radius + datosPlanetas[3].posicion.x,
            (Math.random() - 0.5) * 5 + datosPlanetas[3].posicion.y,
            Math.sin(angle) * radius + datosPlanetas[3].posicion.z
        );
        
        asteroide.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        asteroide.userData = { 
            speed: 0.0005 + Math.random() * 0.001,
            angle: angle,
            radius: radius,
            rotSpeed: { x: Math.random()*0.02, y: Math.random()*0.02 }
        };
        scene.add(asteroide);
        asteroides.push(asteroide);
    }
}

// ===== CARGAR NAVE =====
function cargarNave() {
    const loader = new GLTFLoader();
    const statusText = document.getElementById('loading-status');
    statusText.textContent = 'Iniciando sistemas...';

    loader.load(
        './models/nave.glb',
        (gltf) => {
            nave = gltf.scene;
            
            // ESCALA TINY (Microscópica)
            const escalaFinal = 0.0005;
            nave.scale.set(escalaFinal, escalaFinal, escalaFinal);
            
            // POSICIÓN INICIAL SEGURA (Lejos de la Tierra)
            nave.position.set(0, 100, 200);
            
            nave.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.needsUpdate = true;
                }
            });

            scene.add(nave);
            console.log('✅ Nave cargada en posición segura (0, 100, 200)');
            
            // Iniciar la cinemática apenas carga
            iniciarCinematicaIntro();
            
            actualizarBarraCarga(100);
        },
        (xhr) => {
            const percent = (xhr.loaded / xhr.total) * 100;
            statusText.textContent = `Cargando modelos: ${Math.round(percent)}%`;
            actualizarBarraCarga(percent);
        },
        (error) => {
            console.error('Error cargando nave:', error);
            statusText.textContent = 'Error. Usando nave básica.';
            crearNaveFallback();
        }
    );
}

// ===== CINEMÁTICA DE INTRODUCCIÓN =====
function iniciarCinematicaIntro() {
    if (!nave) return;
    
    cinematicaActiva = true;
    tiempoCinematicaInicio = Date.now();
    const duracion = 5000; // 5 segundos
    
    // Puntos clave de la cámara
    const startPos = new THREE.Vector3(0, 120, 250); // Muy lejos arriba
    const midPos = new THREE.Vector3(20, 105, 220);  // Lateral acercándose
    const endPos = new THREE.Vector3(0, 99, 205);     // Detrás de la nave (vista piloto)
    
    function updateCinematica() {
        const ahora = Date.now();
        const transcurrido = ahora - tiempoCinematicaInicio;
        const progreso = Math.min(transcurrido / duracion, 1);
        
        // Curva de suavizado (Ease In Out Quad)
        const ease = progreso < 0.5 ? 2 * progreso * progreso : -1 + (4 - 2 * progreso) * progreso;
        
        let currentPos;
        let lookTarget = nave.position.clone();
        
        if (progreso < 0.5) {
            // Primera mitad: Lejos a Lateral
            const p = progreso * 2;
            currentPos = startPos.clone().lerp(midPos, p);
        } else {
            // Segunda mitad: Lateral a Vista Piloto
            const p = (progreso - 0.5) * 2;
            currentPos = midPos.clone().lerp(endPos, p);
        }
        
        camera.position.copy(currentPos);
        controls.target.lerp(lookTarget, 0.1);
        controls.update();
        
        if (progreso < 1) {
            requestAnimationFrame(updateCinematica);
        } else {
            cinematicaActiva = false;
            console.log('🎬 Cinemática finalizada. Control activado.');
        }
    }
    
    updateCinematica();
}

function crearNaveFallback() {
    const group = new THREE.Group();
    const geo = new THREE.ConeGeometry(1, 2, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x004444 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    group.add(mesh);
    group.position.set(0, 100, 200);
    group.scale.set(0.5, 0.5, 0.5);
    scene.add(group);
    nave = group;
    iniciarCinematicaIntro();
}

// ===== UI & EVENTOS =====
function setupUI() {
    document.getElementById('btn-noche').addEventListener('click', toggleNightMode);
    document.getElementById('btn-musica').addEventListener('click', toggleMusic);
    document.getElementById('btn-auto').addEventListener('click', toggleTourAutomatico);
    document.getElementById('btn-prev').addEventListener('click', () => navegarPlaneta(-1));
    document.getElementById('btn-next').addEventListener('click', () => navegarPlaneta(1));
}

function toggleNightMode() {
    modoNoche = !modoNoche;
    scene.background = new THREE.Color(modoNoche ? 0x000000 : 0x050510);
    scene.fog = new THREE.FogExp2(scene.background.getHex(), 0.002);
    if(window.sunLight) window.sunLight.intensity = modoNoche ? 0.5 : 3;
    document.getElementById('btn-noche').classList.toggle('activo');
}

function toggleMusic() {
    const audio = document.getElementById('ambient-music');
    const btn = document.getElementById('btn-musica');
    if (musicaActiva) { audio.pause(); btn.classList.remove('activo'); }
    else { audio.play().catch(e=>console.log(e)); btn.classList.add('activo'); }
    musicaActiva = !musicaActiva;
}

function toggleTourAutomatico() {
    tourAutomatico = !tourAutomatico;
    const btn = document.getElementById('btn-auto');
    if (tourAutomatico) {
        btn.classList.add('activo');
        btn.textContent = '⏸ Pausa';
        navegarPlaneta(1);
        tourInterval = setInterval(() => navegarPlaneta(1), 8000);
    } else {
        btn.classList.remove('activo');
        btn.textContent = '▶ Auto';
        clearInterval(tourInterval);
    }
}

function navegarPlaneta(dir) {
    planetaActual += dir;
    if (planetaActual < 0) planetaActual = datosPlanetas.length - 1;
    if (planetaActual >= datosPlanetas.length) planetaActual = 0;
    
    actualizarInfoPanel(planetaActual);
    actualizarIndicadores();
    moverCamaraAPlaneta(planetaActual);
}

function actualizarInfoPanel(idx) {
    const d = datosPlanetas[idx];
    document.getElementById('planet-icon').textContent = d.icono;
    document.getElementById('planet-name').textContent = d.nombre;
    document.getElementById('planet-description').textContent = d.descripcion;
    document.getElementById('stat-distance').textContent = d.distancia;
    document.getElementById('stat-diameter').textContent = d.diametro;
    document.getElementById('stat-temp').textContent = d.temperatura;
    
    const panel = document.getElementById('info-panel');
    panel.style.opacity = 0;
    setTimeout(() => panel.style.opacity = 1, 50);
}

function crearIndicadores() {
    const c = document.getElementById('planet-indicators');
    c.innerHTML = '';
    datosPlanetas.forEach((_, i) => {
        const div = document.createElement('div');
        div.className = 'planet-indicator' + (i === planetaActual ? ' active' : '');
        div.onclick = () => { planetaActual = i; actualizarInfoPanel(i); actualizarIndicadores(); moverCamaraAPlaneta(i); };
        c.appendChild(div);
    });
}

function actualizarIndicadores() {
    document.querySelectorAll('.planet-indicator').forEach((el, i) => {
        el.classList.toggle('active', i === planetaActual);
    });
}

function moverCamaraAPlaneta(idx) {
    const datos = datosPlanetas[idx];
    const targetCam = new THREE.Vector3(datos.camara.x, datos.camara.y, datos.camara.z);
    const targetLook = new THREE.Vector3(datos.posicion.x, datos.posicion.y, datos.posicion.z);
    
    // La nave viaja con la cámara
    const offsetNave = new THREE.Vector3(2, -1, 3); 
    const targetNave = targetCam.clone().add(offsetNave);
    
    const startCam = camera.position.clone();
    const startLook = controls.target.clone();
    const startNave = nave ? nave.position.clone() : new THREE.Vector3();
    
    const duracion = 2000;
    const inicio = Date.now();
    
    function anim() {
        const t = Math.min((Date.now() - inicio) / duracion, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        
        camera.position.lerpVectors(startCam, targetCam, ease);
        controls.target.lerpVectors(startLook, targetLook, ease);
        if(nave) nave.position.lerpVectors(startNave, targetNave, ease);
        
        controls.update();
        if(t < 1) requestAnimationFrame(anim);
    }
    anim();
}

function actualizarBarraCarga(p) {
    document.getElementById('progress-fill').style.width = p + '%';
    if(p >= 100) setTimeout(() => document.getElementById('loading-overlay').classList.add('hidden'), 800);
}

function setupResponsive() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ===== LOOP PRINCIPAL =====
function animate() {
    requestAnimationFrame(animate);
    const time = performance.now() * 0.001;

    // 1. Lógica de la Nave
    if (nave) {
        if (cinematicaActiva) {
            // Durante la intro, la nave solo flota suavemente
            nave.position.y += Math.sin(time * 2) * 0.05;
            nave.rotation.z = Math.sin(time) * 0.1;
        } else {
            // Modo Juego: La nave sigue a la cámara (Vista trasera)
            const offset = new THREE.Vector3(2, -0.8, 2.5); // Offset relativo
            const targetPos = camera.position.clone().add(offset);
            nave.position.lerp(targetPos, 0.1); // Suavizado
            
            // Oscilación de motor
            nave.position.y += Math.sin(time * 15) * 0.02;
            
            // Orientación: Mirar hacia donde mira la cámara
            const lookTarget = camera.position.clone().add(new THREE.Vector3(0, 0, -10).applyQuaternion(camera.quaternion));
            nave.lookAt(lookTarget);
        }
    }

    // 2. Animación Asteroides
    asteroides.forEach(ast => {
        ast.userData.angle += ast.userData.speed;
        ast.position.x = Math.cos(ast.userData.angle) * ast.userData.radius + datosPlanetas[3].posicion.x;
        ast.position.z = Math.sin(ast.userData.angle) * ast.userData.radius + datosPlanetas[3].posicion.z;
        ast.rotation.x += ast.userData.rotSpeed.x;
        ast.rotation.y += ast.userData.rotSpeed.y;
    });

    // 3. Rotación Planetas
    planetas.forEach(p => p.rotation.y += 0.001);

    controls.update();
    renderer.render(scene, camera);
}

init();
console.log('🚀 Sistema iniciado. Esperando cinemática...');
