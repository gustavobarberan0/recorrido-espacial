import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ===== VARIABLES GLOBALES =====
let scene, camera, renderer, controls;
let nave = null;
let planetaActual = 0;
let planetas = [];
let asteroides = [];
let tourAutomatico = false;
let tourInterval = null;
let modoNoche = false;
let musicaActiva = false;

// Configuración de datos
const datosPlanetas = [
    {
        nombre: "TIERRA", icono: "🌍",
        descripcion: "Nuestro hogar azul. El único planeta conocido con vida.",
        distancia: "149.6M km", diametro: "12,742 km", temperatura: "15°C",
        posicion: { x: 0, y: 0, z: 0 },
        camara: { x: 25, y: 10, z: 25 },
        color: 0x2266ff
    },
    {
        nombre: "LUNA", icono: "🌙",
        descripcion: "Nuestro satélite natural. Cubierta de cráteres y sin atmósfera.",
        distancia: "384,400 km", diametro: "3,474 km", temperatura: "-173°C a 127°C",
        posicion: { x: -40, y: 5, z: -30 },
        camara: { x: -50, y: 15, z: -40 },
        color: 0xaaaaaa
    },
    {
        nombre: "MARTE", icono: "🔴",
        descripcion: "El planeta rojo. Hogar del volcán más grande del sistema solar.",
        distancia: "227.9M km", diametro: "6,779 km", temperatura: "-63°C",
        posicion: { x: 60, y: -8, z: 45 },
        camara: { x: 75, y: 8, z: 60 },
        color: 0xff4422
    },
    {
        nombre: "CINTURÓN DE ASTEROIDES", icono: "☄️",
        descripcion: "Millones de rocas espaciales entre Marte y Júpiter.",
        distancia: "2.2-3.2 UA", diametro: "Varía", temperatura: "-73°C",
        posicion: { x: -80, y: 10, z: -60 },
        camara: { x: -70, y: 25, z: -55 },
        color: 0x886644
    },
    {
        nombre: "JÚPITER", icono: "🟠",
        descripcion: "El gigante gaseoso. Más grande que todos los planetas juntos.",
        distancia: "778.5M km", diametro: "139,820 km", temperatura: "-108°C",
        posicion: { x: 120, y: -15, z: 90 },
        camara: { x: 140, y: 15, z: 110 },
        color: 0xff8844
    }
];

// ===== INICIALIZACIÓN =====
function init() {
    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.002);

    // Cámara
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 55, 90); // Posición inicial para ver la nave

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.body.appendChild(renderer.domElement);

    // Controles
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 200;

    // Elementos
    setupLighting();
    crearFondoEstrellas();
    cargarNave(); // Esto dispara la carga asíncrona
    crearPlanetas();
    crearAsteroides();
    
    // UI
    setupUI();
    actualizarInfoPanel(0);
    crearIndicadores();
    setupResponsive();

    animate();
}

function setupLighting() {
    const ambient = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 3);
    sun.position.set(50, 30, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);
    window.sunLight = sun;
}

function crearFondoEstrellas() {
    const geo = new THREE.BufferGeometry();
    const count = 5000;
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) {
        pos[i] = (Math.random() - 0.5) * 400;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Points(geo, mat));
}

function crearPlanetas() {
    datosPlanetas.forEach((datos, index) => {
        let radio = 3;
        if (index === 4) radio = 12; // Júpiter grande
        if (index === 3) radio = 1;  // Centro cinturón

        const geo = new THREE.SphereGeometry(radio, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ 
            color: datos.color, 
            roughness: 0.8, 
            metalness: 0.2,
            emissive: datos.color,
            emissiveIntensity: 0.2
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(datos.posicion.x, datos.posicion.y, datos.posicion.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        planetas.push(mesh);

        // Anillo Júpiter simple
        if (index === 4) {
            const anilloGeo = new THREE.RingGeometry(13, 18, 32);
            const anilloMat = new THREE.MeshBasicMaterial({ color: 0xccaa88, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
            const anillo = new THREE.Mesh(anilloGeo, anilloMat);
            anillo.rotation.x = Math.PI / 2;
            anillo.position.copy(mesh.position);
            scene.add(anillo);
        }
    });
}

function crearAsteroides() {
    const geo = new THREE.DodecahedronGeometry(0.4, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0x886644, roughness: 1 });
    const centro = datosPlanetas[3].posicion;

    for (let i = 0; i < 200; i++) {
        const mesh = new THREE.Mesh(geo, mat);
        const ang = Math.random() * Math.PI * 2;
        const rad = 15 + Math.random() * 10;
        
        mesh.position.set(
            Math.cos(ang) * rad + centro.x,
            (Math.random() - 0.5) * 4 + centro.y,
            Math.sin(ang) * rad + centro.z
        );
        mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
        mesh.userData = { ang, rad, speed: 0.0005 + Math.random()*0.001 };
        scene.add(mesh);
        asteroides.push(mesh);
    }
}

function cargarNave() {
    const loader = new GLTFLoader();
    const statusText = document.getElementById('loading-status');
    
    loader.load(
        './models/nave.glb',
        (gltf) => {
            nave = gltf.scene;
            
            // ESCALA TINY
            nave.scale.set(0.0005, 0.0005, 0.0005);
            
            // POSICIÓN SEGURA (Lejos del centro)
            nave.position.set(0, 50, 80);
            
            nave.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.material.needsUpdate = true;
                }
            });

            scene.add(nave);
            console.log("✅ Nave cargada");
            
            // OCULTAR PANTALLA DE CARGA
            finalizarCarga();
        },
        (xhr) => {
            const percent = (xhr.loaded / xhr.total) * 100;
            if(statusText) statusText.textContent = `Cargando: ${Math.round(percent)}%`;
            actualizarBarra(percent);
        },
        (error) => {
            console.error("Error cargando nave", error);
            if(statusText) statusText.textContent = "Error. Usando fallback.";
            crearNaveFallback();
            finalizarCarga();
        }
    );
}

function crearNaveFallback() {
    const geo = new THREE.ConeGeometry(1, 2, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x00ffff });
    nave = new THREE.Mesh(geo, mat);
    nave.rotation.x = Math.PI / 2;
    nave.position.set(0, 50, 80);
    nave.scale.set(0.5, 0.5, 0.5);
    scene.add(nave);
}

function finalizarCarga() {
    actualizarBarra(100);
    setTimeout(() => {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('hidden');
    }, 500);
}

function actualizarBarra(percent) {
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = percent + '%';
}

// ===== LÓGICA DE UI Y NAVEGACIÓN =====

function setupUI() {
    document.getElementById('btn-noche')?.addEventListener('click', toggleNoche);
    document.getElementById('btn-musica')?.addEventListener('click', toggleMusica);
    document.getElementById('btn-auto')?.addEventListener('click', toggleAuto);
    document.getElementById('btn-prev')?.addEventListener('click', () => irPlaneta(-1));
    document.getElementById('btn-next')?.addEventListener('click', () => irPlaneta(1));
}

function toggleNoche() {
    modoNoche = !modoNoche;
    scene.background = new THREE.Color(modoNoche ? 0x000000 : 0x050510);
    scene.fog = new THREE.FogExp2(scene.background.getHex(), 0.002);
    if(window.sunLight) window.sunLight.intensity = modoNoche ? 0.5 : 3;
    document.getElementById('btn-noche').classList.toggle('activo');
}

function toggleMusica() {
    const audio = document.getElementById('ambient-music');
    const btn = document.getElementById('btn-musica');
    if (!audio) return;
    
    musicaActiva = !musicaActiva;
    if (musicaActiva) {
        audio.play().catch(e => console.log("Interacción requerida"));
        btn.classList.add('activo');
    } else {
        audio.pause();
        btn.classList.remove('activo');
    }
}

function toggleAuto() {
    tourAutomatico = !tourAutomatico;
    const btn = document.getElementById('btn-auto');
    if (tourAutomatico) {
        btn.classList.add('activo');
        btn.textContent = '⏸ Pausa';
        irPlaneta(1);
        tourInterval = setInterval(() => irPlaneta(1), 8000);
    } else {
        btn.classList.remove('activo');
        btn.textContent = '▶ Auto';
        clearInterval(tourInterval);
    }
}

function irPlaneta(dir) {
    planetaActual += dir;
    if (planetaActual < 0) planetaActual = datosPlanetas.length - 1;
    if (planetaActual >= datosPlanetas.length) planetaActual = 0;
    
    actualizarInfoPanel(planetaActual);
    actualizarIndicadores();
    moverCamara(planetaActual);
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
    if(panel) {
        panel.style.opacity = 0;
        setTimeout(() => panel.style.opacity = 1, 100);
    }
}

function crearIndicadores() {
    const container = document.getElementById('planet-indicators');
    if(!container) return;
    container.innerHTML = '';
    datosPlanetas.forEach((_, i) => {
        const div = document.createElement('div');
        div.className = 'planet-indicator' + (i === planetaActual ? ' active' : '');
        div.onclick = () => {
            planetaActual = i;
            actualizarInfoPanel(i);
            actualizarIndicadores();
            moverCamara(i);
        };
        container.appendChild(div);
    });
}

function actualizarIndicadores() {
    document.querySelectorAll('.planet-indicator').forEach((el, i) => {
        el.classList.toggle('active', i === planetaActual);
    });
}

function moverCamara(idx) {
    const datos = datosPlanetas[idx];
    const targetPos = new THREE.Vector3(datos.camara.x, datos.camara.y, datos.camara.z);
    const targetLook = new THREE.Vector3(datos.posicion.x, datos.posicion.y, datos.posicion.z);
    
    // La nave viaja con la cámara manteniendo distancia relativa
    const offsetNave = new THREE.Vector3(2, -1, 3); 
    const targetNavePos = targetPos.clone().add(offsetNave);
    
    const startCam = camera.position.clone();
    const startLook = controls.target.clone();
    const startNave = nave ? nave.position.clone() : new THREE.Vector3();
    
    const duracion = 2000;
    const inicio = Date.now();
    
    function anim() {
        const t = Math.min((Date.now() - inicio) / duracion, 1);
        const ease = 1 - Math.pow(1 - t, 3); // Suavizado
        
        camera.position.lerpVectors(startCam, targetPos, ease);
        controls.target.lerpVectors(startLook, targetLook, ease);
        
        if (nave) {
            // Movemos la nave directamente a su nueva posición objetivo suavemente
            nave.position.lerpVectors(startNave, targetNavePos, ease);
        }
        
        controls.update();
        if (t < 1) requestAnimationFrame(anim);
    }
    anim();
}

function setupResponsive() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ===== LOOP DE ANIMACIÓN =====
function animate() {
    requestAnimationFrame(animate);
    const time = performance.now() * 0.001;

    // 1. Animar Nave (Flotación suave)
    if (nave) {
        // La nave ya fue movida por la función moverCamara si estamos viajando.
        // Si estamos quietos, solo hacemos una micro-flotación sobre su posición actual.
        // NOTA: No usamos lerp aquí para evitar el "salto", la posición la define la cámara o el viaje.
        nave.position.y += Math.sin(time * 5) * 0.05;
        
        // Rotación sutil hacia adelante
        const lookTarget = new THREE.Vector3(0, 0, -10).applyQuaternion(camera.quaternion).add(camera.position);
        nave.lookAt(lookTarget);
    }

    // 2. Animar Asteroides
    asteroides.forEach(ast => {
        ast.userData.ang += ast.userData.speed;
        ast.position.x = Math.cos(ast.userData.ang) * ast.userData.rad + datosPlanetas[3].posicion.x;
        ast.position.z = Math.sin(ast.userData.ang) * ast.userData.rad + datosPlanetas[3].posicion.z;
        ast.rotation.y += 0.01;
    });

    // 3. Rotar Planetas
    planetas.forEach(p => p.rotation.y += 0.002);

    controls.update();
    renderer.render(scene, camera);
}

// Arrancar
init();
