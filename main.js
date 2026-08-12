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

// ===== DATOS DEL SISTEMA SOLAR =====
const datosPlanetas = [
    {
        nombre: "TIERRA", icono: "🌍",
        descripcion: "Nuestro hogar azul. El único planeta con vida conocida.",
        distancia: "149.6M km", diametro: "12,742 km", temperatura: "15°C",
        posicion: { x: 0, y: 0, z: 0 },
        camara: { x: 25, y: 10, z: 25 },
        color: 0x2266ff
    },
    {
        nombre: "LUNA", icono: "🌙",
        descripcion: "Nuestro satélite natural. Llena de cráteres y silencio.",
        distancia: "384,400 km", diametro: "3,474 km", temperatura: "-173°C a 127°C",
        posicion: { x: -40, y: 5, z: -30 },
        camara: { x: -50, y: 15, z: -40 },
        color: 0xaaaaaa
    },
    {
        nombre: "MARTE", icono: "🔴",
        descripcion: "El planeta rojo. Hogar de los volcanes más grandes.",
        distancia: "227.9M km", diametro: "6,779 km", temperatura: "-63°C",
        posicion: { x: 60, y: -8, z: 45 },
        camara: { x: 75, y: 8, z: 60 },
        color: 0xff4422
    },
    {
        nombre: "CINTURÓN ASTEROIDES", icono: "☄️",
        descripcion: "Millones de rocas espaciales entre Marte y Júpiter.",
        distancia: "2.2-3.2 UA", diametro: "Varía", temperatura: "-73°C",
        posicion: { x: -80, y: 10, z: -60 },
        camara: { x: -70, y: 25, z: -55 },
        color: 0x886644
    },
    {
        nombre: "JÚPITER", icono: "🟠",
        descripcion: "El gigante gaseoso. Más grande que todos los demás juntos.",
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
    // POSICIÓN INICIAL: Detrás y arriba de donde estará la nave
    camera.position.set(0, 42, 68); 

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Controles
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0); // Mirar al centro inicialmente
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Elementos
    setupLighting();
    crearEstrellas();
    cargarNave(); // Carga la nave primero
    crearPlanetas();
    crearAsteroides();
    
    // UI
    setupUI();
    actualizarInfoPanel(0);
    crearIndicadores();

    // Loop
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

function crearPlanetas() {
    datosPlanetas.forEach((d, i) => {
        let radio = 3;
        if (i === 4) radio = 12; // Júpiter grande
        if (i === 3) radio = 1;  // Centro cinturón

        const geo = new THREE.SphereGeometry(radio, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ 
            color: d.color, 
            roughness: 0.8, 
            metalness: 0.2,
            emissive: d.color,
            emissiveIntensity: 0.1
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(d.posicion.x, d.posicion.y, d.posicion.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        planetas.push(mesh);

        // Anillo simple para Júpiter
        if (i === 4) {
            const ringGeo = new THREE.RingGeometry(13, 18, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xccaa88, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.copy(mesh.position);
            scene.add(ring);
        }
    });
}

function crearAsteroides() {
    const geo = new THREE.DodecahedronGeometry(0.4, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0x886644 });
    const centro = datosPlanetas[3].posicion;

    for(let i=0; i<200; i++) {
        const ast = new THREE.Mesh(geo, mat);
        const ang = Math.random() * Math.PI * 2;
        const rad = 15 + Math.random() * 10;
        ast.position.set(
            centro.x + Math.cos(ang) * rad,
            centro.y + (Math.random()-0.5) * 5,
            centro.z + Math.sin(ang) * rad
        );
        ast.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
        ast.userData = { ang, rad, speed: 0.0005 + Math.random()*0.001 };
        scene.add(ast);
        asteroides.push(ast);
    }
}

function cargarNave() {
    const loader = new GLTFLoader();
    const status = document.getElementById('loading-status');
    
    loader.load('./models/nave.glb', (gltf) => {
        nave = gltf.scene;
        
        // ESCALA PEQUEÑA
        nave.scale.set(0.001, 0.001, 0.001);
        
        // POSICIÓN SEGURA INICIAL (Sobre la Tierra, no dentro)
        nave.position.set(0, 40, 60);
        
        nave.traverse(c => {
            if(c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
            }
        });
        
        scene.add(nave);
        console.log("✅ Nave cargada en (0, 40, 60)");
        
        // Ocultar loading
        document.getElementById('progress-fill').style.width = '100%';
        setTimeout(() => {
            document.getElementById('loading-overlay').classList.add('hidden');
        }, 500);

    }, undefined, (err) => {
        console.error(err);
        status.textContent = "Error cargando nave. Usando fallback.";
        crearNaveFallback();
    });
}

function crearNaveFallback() {
    const group = new THREE.Group();
    const geo = new THREE.ConeGeometry(1, 2, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x00ffff });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI/2;
    group.add(mesh);
    group.position.set(0, 40, 60);
    group.scale.set(0.5, 0.5, 0.5);
    scene.add(group);
    nave = group;
    
    document.getElementById('loading-overlay').classList.add('hidden');
}

function setupUI() {
    document.getElementById('btn-noche').onclick = toggleNoche;
    document.getElementById('btn-musica').onclick = toggleMusica;
    document.getElementById('btn-auto').onclick = toggleAuto;
    document.getElementById('btn-prev').onclick = () => irPlaneta(-1);
    document.getElementById('btn-next').onclick = () => irPlaneta(1);
}

function toggleNoche() {
    modoNoche = !modoNoche;
    scene.background.setHex(modoNoche ? 0x000000 : 0x050510);
    scene.fog.color.setHex(scene.background.getHex());
    if(window.sunLight) window.sunLight.intensity = modoNoche ? 0.5 : 3;
    document.getElementById('btn-noche').classList.toggle('activo');
}

function toggleMusica() {
    const audio = document.getElementById('ambient-music');
    musicaActiva = !musicaActiva;
    if(musicaActiva) { audio.play().catch(()=>{}); document.getElementById('btn-musica').classList.add('activo'); }
    else { audio.pause(); document.getElementById('btn-musica').classList.remove('activo'); }
}

function toggleAuto() {
    tourAutomatico = !tourAutomatico;
    const btn = document.getElementById('btn-auto');
    if(tourAutomatico) {
        btn.classList.add('activo');
        btn.textContent = "⏸ Pausa";
        irPlaneta(1);
        tourInterval = setInterval(() => irPlaneta(1), 8000);
    } else {
        btn.classList.remove('activo');
        btn.textContent = "▶ Auto";
        clearInterval(tourInterval);
    }
}

function irPlaneta(dir) {
    planetaActual += dir;
    if(planetaActual < 0) planetaActual = datosPlanetas.length - 1;
    if(planetaActual >= datosPlanetas.length) planetaActual = 0;
    
    actualizarInfoPanel(planetaActual);
    actualizarIndicadores();
    moverCamara(planetaActual);
}

function actualizarInfoPanel(i) {
    const d = datosPlanetas[i];
    document.getElementById('planet-icon').textContent = d.icono;
    document.getElementById('planet-name').textContent = d.nombre;
    document.getElementById('planet-description').textContent = d.descripcion;
    document.getElementById('stat-distance').textContent = d.distancia;
    document.getElementById('stat-diameter').textContent = d.diametro;
    document.getElementById('stat-temp').textContent = d.temperatura;
    
    const panel = document.getElementById('info-panel');
    panel.style.opacity = 0;
    setTimeout(() => panel.style.opacity = 1, 100);
}

function crearIndicadores() {
    const c = document.getElementById('planet-indicators');
    c.innerHTML = '';
    datosPlanetas.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'planet-indicator' + (i === planetaActual ? ' active' : '');
        dot.onclick = () => {
            planetaActual = i;
            actualizarInfoPanel(i);
            actualizarIndicadores();
            moverCamara(i);
        };
        c.appendChild(dot);
    });
}

function actualizarIndicadores() {
    document.querySelectorAll('.planet-indicator').forEach((el, i) => {
        el.classList.toggle('active', i === planetaActual);
    });
}

function moverCamara(i) {
    const d = datosPlanetas[i];
    const targetPos = new THREE.Vector3(d.camara.x, d.camara.y, d.camara.z);
    const targetLook = new THREE.Vector3(d.posicion.x, d.posicion.y, d.posicion.z);
    
    // La nave viaja con la cámara
    const offset = new THREE.Vector3(2, -1, 3);
    const targetNave = targetPos.clone().add(offset);
    
    const startCam = camera.position.clone();
    const startLook = controls.target.clone();
    const startNave = nave ? nave.position.clone() : new THREE.Vector3();
    
    const dur = 2000;
    const inicio = Date.now();
    
    function anim() {
        const t = Math.min((Date.now() - inicio) / dur, 1);
        const ease = 1 - Math.pow(1-t, 3);
        
        camera.position.lerpVectors(startCam, targetPos, ease);
        controls.target.lerpVectors(startLook, targetLook, ease);
        if(nave) nave.position.lerpVectors(startNave, targetNave, ease);
        
        controls.update();
        if(t < 1) requestAnimationFrame(anim);
    }
    anim();
}

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    // Nave sigue a la cámara suavemente
    if(nave) {
        const offset = new THREE.Vector3(2, -0.8, 2.5);
        const target = camera.position.clone().add(offset);
        nave.position.lerp(target, 0.1);
        
        // Vibración motor
        nave.position.y += Math.sin(time * 20) * 0.02;
        
        // Orientación
        const lookAt = camera.position.clone().add(new THREE.Vector3(0, 0, -10).applyQuaternion(camera.quaternion));
        nave.lookAt(lookAt);
    }

    // Asteroides
    asteroides.forEach(a => {
        a.userData.ang += a.userData.speed;
        a.position.x = datosPlanetas[3].posicion.x + Math.cos(a.userData.ang) * a.userData.rad;
        a.position.z = datosPlanetas[3].posicion.z + Math.sin(a.userData.ang) * a.userData.rad;
        a.rotation.x += 0.01;
        a.rotation.y += 0.01;
    });

    // Planetas rotan
    planetas.forEach(p => p.rotation.y += 0.001);

    controls.update();
    renderer.render(scene, camera);
}

// Init
init();
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
