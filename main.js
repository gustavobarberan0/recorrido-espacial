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

// Posición inicial segura (Lejos del centro)
const POSICION_INICIAL_NAVE = { x: 0, y: 60, z: 100 };

// Datos de planetas
const datosPlanetas = [
    { nombre: "TIERRA", icono: "🌍", descripcion: "Nuestro hogar azul.", distancia: "149.6M km", diametro: "12,742 km", temperatura: "15°C", posicion: { x: 0, y: 0, z: 0 }, camara: { x: 25, y: 10, z: 25 }, color: 0x2266ff },
    { nombre: "LUNA", icono: "🌙", descripcion: "Nuestro satélite natural.", distancia: "384,400 km", diametro: "3,474 km", temperatura: "-173°C", posicion: { x: -40, y: 5, z: -30 }, camara: { x: -50, y: 15, z: -40 }, color: 0xaaaaaa },
    { nombre: "MARTE", icono: "🔴", descripcion: "El planeta rojo.", distancia: "227.9M km", diametro: "6,779 km", temperatura: "-63°C", posicion: { x: 60, y: -8, z: 45 }, camara: { x: 75, y: 8, z: 60 }, color: 0xff4422 },
    { nombre: "CINTURÓN", icono: "☄️", descripcion: "Lluvia de asteroides.", distancia: "2.2-3.2 UA", diametro: "Varía", temperatura: "-73°C", posicion: { x: -80, y: 10, z: -60 }, camara: { x: -70, y: 25, z: -55 }, color: 0x886644 },
    { nombre: "JÚPITER", icono: "🟠", descripcion: "El gigante gaseoso.", distancia: "778.5M km", diametro: "139,820 km", temperatura: "-108°C", posicion: { x: 120, y: -15, z: 90 }, camara: { x: 140, y: 15, z: 110 }, color: 0xff8844 }
];

function init() {
    // Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.FogExp2(0x050510, 0.002);

    // Cámara
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    // POSICIÓN INICIAL: Detrás y arriba de donde estará la nave
    camera.position.set(POSICION_INICIAL_NAVE.x, POSICION_INICIAL_NAVE.y + 5, POSICION_INICIAL_NAVE.z + 20);

    // Render
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Controles
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(POSICION_INICIAL_NAVE.x, POSICION_INICIAL_NAVE.y, POSICION_INICIAL_NAVE.z);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 500;

    // Elementos
    setupLighting();
    crearEstrellas();
    crearPlanetas();
    crearAsteroides();
    cargarNave();
    
    // UI
    setupUI();
    actualizarInfoPanel(0);
    crearIndicadores();

    window.addEventListener('resize', onResize);
    animate();
}

function setupLighting() {
    const ambient = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 3);
    sun.position.set(100, 50, 100);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);
    window.sun = sun;
}

function crearEstrellas() {
    const geo = new THREE.BufferGeometry();
    const count = 5000;
    const pos = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) {
        pos[i] = (Math.random() - 0.5) * 800;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({color: 0xffffff, size: 0.5, transparent: true, opacity: 0.8});
    const stars = new THREE.Points(geo, mat);
    scene.add(stars);
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
            emissiveIntensity: 0.2
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(d.posicion.x, d.posicion.y, d.posicion.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        planetas.push(mesh);

        // Anillo Júpiter simple
        if (i === 4) {
            const ringGeo = new THREE.RingGeometry(13, 18, 64);
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
        const mesh = new THREE.Mesh(geo, mat);
        const ang = Math.random() * Math.PI * 2;
        const rad = 15 + Math.random() * 10;
        mesh.position.set(
            Math.cos(ang) * rad + centro.x,
            (Math.random() - 0.5) * 5 + centro.y,
            Math.sin(ang) * rad + centro.z
        );
        mesh.userData = { ang, rad, speed: 0.001 + Math.random()*0.002 };
        scene.add(mesh);
        asteroides.push(mesh);
    }
}

function cargarNave() {
    const loader = new GLTFLoader();
    const status = document.getElementById('loading-status');
    
    loader.load('./models/nave.glb', (gltf) => {
        nave = gltf.scene;
        
        // ESCALA TINY
        nave.scale.set(0.0005, 0.0005, 0.0005);
        
        // POSICIÓN SEGURA
        nave.position.set(POSICION_INICIAL_NAVE.x, POSICION_INICIAL_NAVE.y, POSICION_INICIAL_NAVE.z);
        
        nave.traverse(c => {
            if(c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
            }
        });
        
        scene.add(nave);
        console.log("✅ Nave cargada y visible");
        
        // Ocultar loading
        setTimeout(() => {
            document.getElementById('loading-overlay').classList.add('hidden');
        }, 1000);
        
    }, undefined, (err) => {
        console.error(err);
        status.textContent = "Error cargando modelo. Usando fallback.";
        crearNaveFallback();
    });
}

function crearNaveFallback() {
    const group = new THREE.Group();
    const geo = new THREE.ConeGeometry(1, 2, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x00ffff });
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = Math.PI/2;
    group.add(m);
    group.position.set(POSICION_INICIAL_NAVE.x, POSICION_INICIAL_NAVE.y, POSICION_INICIAL_NAVE.z);
    group.scale.set(0.5, 0.5, 0.5);
    scene.add(group);
    nave = group;
    document.getElementById('loading-overlay').classList.add('hidden');
}

function setupUI() {
    document.getElementById('btn-noche').onclick = () => {
        modoNoche = !modoNoche;
        scene.background = new THREE.Color(modoNoche ? 0x000000 : 0x050510);
        scene.fog = new THREE.FogExp2(scene.background.getHex(), 0.002);
        if(window.sun) window.sun.intensity = modoNoche ? 0.5 : 3;
        document.getElementById('btn-noche').classList.toggle('activo');
    };
    
    document.getElementById('btn-musica').onclick = () => {
        const audio = document.getElementById('ambient-music');
        musicaActiva = !musicaActiva;
        if(musicaActiva) { audio.play().catch(e=>{}); document.getElementById('btn-musica').classList.add('activo'); }
        else { audio.pause(); document.getElementById('btn-musica').classList.remove('activo'); }
    };

    document.getElementById('btn-auto').onclick = toggleTour;
    document.getElementById('btn-prev').onclick = () => irPlaneta(-1);
    document.getElementById('btn-next').onclick = () => irPlaneta(1);
}

function toggleTour() {
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
}

function crearIndicadores() {
    const cont = document.getElementById('planet-indicators');
    cont.innerHTML = '';
    datosPlanetas.forEach((_, i) => {
        const div = document.createElement('div');
        div.className = 'planet-indicator' + (i===planetaActual?' active':'');
        div.onclick = () => { planetaActual=i; actualizarInfoPanel(i); actualizarIndicadores(); moverCamara(i); };
        cont.appendChild(div);
    });
}

function actualizarIndicadores() {
    document.querySelectorAll('.planet-indicator').forEach((el, i) => {
        el.classList.toggle('active', i===planetaActual);
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
    const start = Date.now();
    
    function loop() {
        const t = Math.min((Date.now() - start) / dur, 1);
        const ease = 1 - Math.pow(1-t, 3);
        
        camera.position.lerpVectors(startCam, targetPos, ease);
        controls.target.lerpVectors(startLook, targetLook, ease);
        if(nave) nave.position.lerpVectors(startNave, targetNave, ease);
        
        controls.update();
        if(t < 1) requestAnimationFrame(loop);
    }
    loop();
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    if(nave) {
        // La nave sigue a la cámara siempre (estilo juego)
        const offset = new THREE.Vector3(2, -0.8, 2.5);
        const target = camera.position.clone().add(offset);
        nave.position.lerp(target, 0.1);
        
        // Vibración suave
        nave.position.y += Math.sin(time * 20) * 0.02;
        
        // Orientación
        const lookAt = camera.position.clone().add(new THREE.Vector3(0,0,-10).applyQuaternion(camera.quaternion));
        nave.lookAt(lookAt);
    }

    // Animar asteroides
    asteroides.forEach(a => {
        a.userData.ang += a.userData.speed;
        a.position.x = Math.cos(a.userData.ang) * a.userData.rad + datosPlanetas[3].posicion.x;
        a.position.z = Math.sin(a.userData.ang) * a.userData.rad + datosPlanetas[3].posicion.z;
        a.rotation.y += 0.01;
    });

    // Rotar planetas
    planetas.forEach(p => p.rotation.y += 0.001);

    controls.update();
    renderer.render(scene, camera);
}

init();
