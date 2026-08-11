import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ===== VARIABLES =====
let scene, camera, renderer, controls;
let modoNoche = false;
let musicaActiva = false;
let nave = null;
let audioContext = null;

// ===== INICIALIZACIÓN =====
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);
    scene.fog = null;

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(10, 5, 15);

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
    setupAudio();
    setupUI();
    setupResponsive();

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
    const starsCount = 4000;
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

// ===== CARGAR NAVE =====
function cargarNave() {
    const loader = new GLTFLoader();
    const statusText = document.getElementById('loading-status');
    statusText.textContent = 'Cargando nave...';

    loader.load(
        './models/nave.glb',
        (gltf) => {
            nave = gltf.scene;

            nave.position.set(0, 0, 0);
            nave.scale.set(0.5, 0.5, 0.5);
            nave.renderOrder = 1;

            nave.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.transparent = false;
                    child.material.opacity = 1.0;
                    child.material.depthWrite = true;
                    child.material.depthTest = true;
                    child.material.side = THREE.FrontSide;
                    child.material.needsUpdate = true;
                }
            });

            scene.add(nave);
            console.log('✅ Nave cargada correctamente');

            nave.scale.set(0, 0, 0);
            animateEntry(nave);

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

    group.position.set(0, 0, 0);
    group.scale.set(0.5, 0.5, 0.5);
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

    if (nave) {
        nave.position.y = Math.sin(time * 0.3) * 0.1;
    }

    controls.update();
    renderer.render(scene, camera);
}

// ===== INICIALIZAR =====
init();

console.log('🚀 RECORRIDO ESPACIAL - Versión Final');
console.log('🎯 Nave cargada correctamente');
console.log('💡 Sin efecto warp - Simple y funcional');