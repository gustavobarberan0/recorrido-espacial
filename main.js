import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ===== VARIABLES GLOBALES =====
let scene, camera, renderer, controls;
let nave = null;
let planetas = [];
let asteroides = [];
let planetaActual = 0;
let tourAutomatico = false;
let tourInterval = null;
let modoNoche = false;
let musicaActiva = false;

// Datos de los planetas
const datosPlanetas = [
    {
        nombre: "TIERRA", icono: "🌍",
        descripcion: "Nuestro hogar azul. El único planeta conocido con vida.",
        distancia: "149.6M km", diametro: "12,742 km", temperatura: "15°C",
        posicion: { x: 0, y: 0, z: 0 },
        camara: { x: 20, y: 10, z: 20 },
        color: 0x2266ff
    },
    {
        nombre: "LUNA", icono: "🌙",
        descripcion: "Nuestro satélite natural. Llena de cráteres y silencio.",
        distancia: "384,400 km", diametro: "3,474 km", temperatura: "-173°C a 127°C",
        posicion: { x: -30, y: 2, z: -25 },
        camara: { x: -40, y: 10, z: -35 },
        color: 0xaaaaaa
    },
    {
        nombre: "MARTE", icono: "🔴",
        descripcion: "El planeta rojo. Hogar del volcán más grande del sistema solar.",
        distancia: "227.9M km", diametro: "6,779 km", temperatura: "-63°C",
        posicion: { x: 50, y: -5, z: 40 },
        camara: { x: 65, y: 10, z: 55 },
        color: 0xff4422
    },
    {
        nombre: "CINTURÓN", icono: "☄️",
        descripcion: "Millones de asteroides orbitando entre Marte y Júpiter.",
        distancia: "2.2-3.2 UA", diametro: "Varía", temperatura: "-73°C",
        posicion: { x: -70, y: 5, z: -50 },
        camara: { x: -60, y: 20, z: -45 },
        color: 0x886644
    },
    {
        nombre: "JÚPITER", icono: "🟠",
        descripcion: "El gigante gaseoso. Inmenso, con su Gran Mancha Roja.",
        distancia: "778.5M km", diametro: "139,820 km", temperatura: "-108°C",
        posicion: { x: 100, y: -10, z: 80 },
        camara: { x: 120, y: 15, z: 100 },
        color: 0xff8844
    }
];

// ===== INICIALIZACIÓN =====
function init() {
    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.015);

    // Cámara
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 30); // Posición inicial segura

    // Renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Controles
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 200;

    // Elementos
    setupLighting();
    crearEstrellas();
    cargarNave();
    crearPlanetas();
    crearAsteroides();
    setupUI();
    
    // Actualizar UI inicial
    actualizarInfoPanel(0);
    crearIndicadores();

    // Loop
    animate();
}

// ===== ILUMINACIÓN =====
function setupLighting() {
    const ambient = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 3);
    sun.position.set(50, 30, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);
}

// ===== ESTRELLAS =====
function crearEstrellas() {
    const geo = new THREE.BufferGeometry();
    const count = 5000;
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) {
        pos[i] = (Math.random() - 0.5) * 400;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({color: 0xffffff, size: 0.5, transparent: true, opacity: 0.8});
    scene.add(new THREE.Points(geo, mat));
}

// ===== PLANETAS =====
function crearPlanetas() {
    datosPlanetas.forEach((d, i) => {
        const radio = i === 4 ? 10 : (i === 3 ? 0.5 : 2.5); // Júpiter grande, Cinturón pequeño centro
        const geo = new THREE.SphereGeometry(radio, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ 
            color: d.color, 
            roughness: 0.8, 
            metalness: 0.2,
            emissive: d.color,
            emissiveIntensity: 0.2
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(d.posicion.x, d.posicion.y, d.posicion.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        planetas.push(mesh);

        // Anillos Júpiter (decorativo)
        if(i === 4) {
            const ringGeo = new THREE.RingGeometry(11, 16, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xcc8866, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.copy(mesh.position);
            scene.add(ring);
        }
    });
}

// ===== ASTEROIDES =====
function crearAsteroides() {
    const geo = new THREE.DodecahedronGeometry(0.4, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0x886644 });
    const centro = datosPlanetas[3].posicion;

    for(let i=0; i<200; i++) {
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

// ===== CARGAR NAVE =====
function cargarNave() {
    const loader = new GLTFLoader();
    loader.load(
        './models/nave.glb',
        (gltf) => {
            nave = gltf.scene;
            
            // ESCALA MUY PEQUEÑA
            const escala = 0.0008;
            nave.scale.set(escala, escala, escala);
            
            // POSICIÓN INICIAL SEGURA (Lejos del centro 0,0,0)
            nave.position.set(0, 15, 30); 
            
            nave.traverse(c => {
                if(c.isMesh) {
                    c.castShadow = true;
                    c.material.needsUpdate = true;
                }
            });
            
            scene.add(nave);
            console.log("Nave cargada y posicionada");
        },
        undefined,
        (err) => {
            console.error("Error cargando nave", err);
            // Fallback simple si falla
            const geo = new THREE.ConeGeometry(0.5, 1, 8);
            const mat = new THREE.MeshStandardMaterial({color: 0x00ffff});
            nave = new THREE.Mesh(geo, mat);
            nave.rotation.x = Math.PI/2;
            nave.position.set(0, 15, 30);
            nave.scale.set(0.01, 0.01, 0.01);
            scene.add(nave);
        }
    );
}

// ===== UI & EVENTOS =====
function setupUI() {
    // Botones
    if(document.getElementById('btn-noche')) {
        document.getElementById('btn-noche').onclick = () => {
            modoNoche = !modoNoche;
            scene.background = new THREE.Color(modoNoche ? 0x000000 : 0x050510);
            scene.fog = new THREE.FogExp2(scene.background.getHex(), 0.015);
        };
    }
    if(document.getElementById('btn-musica')) {
        document.getElementById('btn-musica').onclick = () => {
            const audio = document.getElementById('ambient-music');
            musicaActiva = !musicaActiva;
            if(musicaActiva) audio.play().catch(e=>console.log(e));
            else audio.pause();
        };
    }
    if(document.getElementById('btn-auto')) {
        document.getElementById('btn-auto').onclick = toggleTour;
    }
    if(document.getElementById('btn-prev')) {
        document.getElementById('btn-prev').onclick = () => navegar(-1);
    }
    if(document.getElementById('btn-next')) {
        document.getElementById('btn-next').onclick = () => navegar(1);
    }
}

function toggleTour() {
    tourAutomatico = !tourAutomatico;
    const btn = document.getElementById('btn-auto');
    if(tourAutomatico) {
        btn.textContent = "⏸ Pausa";
        btn.classList.add('activo');
        navegar(1);
        tourInterval = setInterval(() => navegar(1), 6000);
    } else {
        btn.textContent = "▶ Auto";
        btn.classList.remove('activo');
        clearInterval(tourInterval);
    }
}

function navegar(dir) {
    planetaActual += dir;
    if(planetaActual < 0) planetaActual = datosPlanetas.length - 1;
    if(planetaActual >= datosPlanetas.length) planetaActual = 0;
    
    actualizarInfoPanel(planetaActual);
    actualizarIndicadores();
    moverCamara(planetaActual);
}

function actualizarInfoPanel(idx) {
    const d = datosPlanetas[idx];
    const panel = document.getElementById('info-panel');
    
    // Animación simple de fade
    panel.style.opacity = 0;
    
    setTimeout(() => {
        document.getElementById('planet-icon').textContent = d.icono;
        document.getElementById('planet-name').textContent = d.nombre;
        document.getElementById('planet-description').textContent = d.descripcion;
        document.getElementById('stat-distance').textContent = d.distancia;
        document.getElementById('stat-diameter').textContent = d.diametro;
        document.getElementById('stat-temp').textContent = d.temperatura;
        panel.style.opacity = 1;
    }, 200);
}

function crearIndicadores() {
    const cont = document.getElementById('planet-indicators');
    if(!cont) return;
    cont.innerHTML = '';
    datosPlanetas.forEach((_, i) => {
        const div = document.createElement('div');
        div.className = 'planet-indicator' + (i === planetaActual ? ' active' : '');
        div.onclick = () => {
            planetaActual = i;
            actualizarInfoPanel(i);
            actualizarIndicadores();
            moverCamara(i);
        };
        cont.appendChild(div);
    });
}

function actualizarIndicadores() {
    const inds = document.querySelectorAll('.planet-indicator');
    inds.forEach((el, i) => el.classList.toggle('active', i === planetaActual));
}

function moverCamara(idx) {
    const d = datosPlanetas[idx];
    const targetPos = new THREE.Vector3(d.camara.x, d.camara.y, d.camara.z);
    const targetLook = new THREE.Vector3(d.posicion.x, d.posicion.y, d.posicion.z);
    
    // La nave viaja con la cámara manteniendo offset
    const offset = new THREE.Vector3(2, -1, 2);
    const targetNave = targetPos.clone().add(offset);
    
    const startCam = camera.position.clone();
    const startLook = controls.target.clone();
    const startNave = nave ? nave.position.clone() : new THREE.Vector3();
    
    const dur = 2000;
    const inicio = Date.now();
    
    function anim() {
        const t = Math.min((Date.now() - inicio) / dur, 1);
        const ease = 1 - Math.pow(1-t, 3); // Ease out cubic
        
        camera.position.lerpVectors(startCam, targetPos, ease);
        controls.target.lerpVectors(startLook, targetLook, ease);
        
        if(nave) {
            // Interpolamos la nave hacia la nueva posición relativa a la cámara
            nave.position.lerpVectors(startNave, targetNave, ease);
        }
        
        controls.update();
        if(t < 1) requestAnimationFrame(anim);
    }
    anim();
}

// ===== LOOP PRINCIPAL =====
function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    // 1. Movimiento de la nave (Seguimiento suave a la cámara)
    if (nave) {
        // Calculamos dónde debería estar la nave (offset relativo a la cámara)
        const offset = new THREE.Vector3(2, -0.8, 2); 
        const idealPos = camera.position.clone().add(offset);
        
        // Suavizado (Lerp) para que no sea rígido pero tampoco salte
        nave.position.lerp(idealPos, 0.1);
        
        // Pequeña vibración de motor
        nave.position.y += Math.sin(time * 20) * 0.02;
        
        // Orientación: mirar hacia adelante respecto a la cámara
        const lookAtPos = camera.position.clone().add(new THREE.Vector3(0, 0, -10).applyQuaternion(camera.quaternion));
        nave.lookAt(lookAtPos);
    }

    // 2. Animar asteroides
    asteroides.forEach(ast => {
        ast.userData.ang += ast.userData.speed;
        ast.position.x = Math.cos(ast.userData.ang) * ast.userData.rad + datosPlanetas[3].posicion.x;
        ast.position.z = Math.sin(ast.userData.ang) * ast.userData.rad + datosPlanetas[3].posicion.z;
        ast.rotation.x += 0.01;
        ast.rotation.y += 0.01;
    });

    // 3. Rotar planetas
    planetas.forEach(p => p.rotation.y += 0.002);

    controls.update();
    renderer.render(scene, camera);
}

// Init
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
