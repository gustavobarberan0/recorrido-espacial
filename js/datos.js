/* =====================================================================
   DATOS DEL RECORRIDO ESPACIAL
   Todo el contenido educativo vive acá. Para agregar o editar una parada
   no hace falta tocar la escena 3D ni la interfaz.
   ===================================================================== */

export const NIVELES = {
    exploradores: {
        id: 'exploradores',
        nombre: 'Exploradores',
        edades: '6 a 9 años',
        emoji: '🔭',
        voz: { rate: 0.9, pitch: 1.05 }
    },
    cientificos: {
        id: 'cientificos',
        nombre: 'Científicos',
        edades: '10 a 12 años',
        emoji: '🚀',
        voz: { rate: 1.0, pitch: 1.0 }
    }
};

const DEG = Math.PI / 180;

// Posiciones comprimidas (no a escala) para que todo el sistema entre en escena.
// El ORDEN y las proporciones relativas sí respetan la realidad.
function orbita(distancia, angulo, y = 0) {
    return {
        x: distancia * Math.cos(angulo * DEG),
        y,
        z: distancia * Math.sin(angulo * DEG)
    };
}

const posTierra = orbita(34, 275, 0);

export const CUERPOS = [
    /* ------------------------------------------------------------------ SOL */
    {
        id: 'sol',
        nombre: 'Sol',
        emoji: '☀️',
        tipo: 'Estrella',
        color: '#ffc94d',
        pos: { x: 0, y: 0, z: 0 },
        radio: 7,
        rotSpeed: 0.0004,
        camRatio: 5.2,
        resumen: 'La estrella que hace posible la vida en la Tierra.',
        descripcion: {
            exploradores: 'El Sol es una estrella enorme y brillante. Es el centro de nuestro sistema solar y nos da la luz y el calor que necesitamos para vivir. ¡Es tan grande que adentro entrarían más de un millón de Tierras!',
            cientificos: 'El Sol es una estrella de tipo G: una esfera de plasma que fusiona hidrógeno en helio en su núcleo. Concentra el 99,86 % de la masa del sistema solar y su energía tarda 8 minutos y 20 segundos en llegar a la Tierra.'
        },
        datos: [
            { etiqueta: 'Distancia a la Tierra', valor: '149,6 millones km' },
            { etiqueta: 'Diámetro', valor: '1.392.700 km', nota: '109 Tierras' },
            { etiqueta: 'Temperatura de superficie', valor: '5.500 °C' },
            { etiqueta: 'Temperatura del núcleo', valor: '15.000.000 °C' },
            { etiqueta: 'Rotación', valor: '25 a 35 días' },
            { etiqueta: 'Edad', valor: '4.600 millones de años' },
            { etiqueta: 'Composición', valor: '73 % hidrógeno, 25 % helio' },
            { etiqueta: 'Masa del sistema', valor: '99,86 % del total' }
        ],
        curiosidades: [
            { icono: '🌍', titulo: 'Un millón de Tierras', texto: 'Dentro del Sol cabrían aproximadamente 1.300.000 planetas como el nuestro.' },
            { icono: '⏱️', titulo: 'Luz viajera', texto: 'La luz que ves del Sol salió hace 8 minutos y 20 segundos. Si el Sol se apagara, nos enteraríamos recién dentro de ese tiempo.' },
            { icono: '🎨', titulo: 'No es amarillo', texto: 'Desde el espacio el Sol se ve blanco. Lo vemos amarillo porque nuestra atmósfera dispersa parte de su luz azul.' }
        ],
        comparacion: 'Si el Sol fuera un edificio de 24 metros (8 pisos), la Tierra sería una pelota de fútbol de 22 cm.',
        glosario: ['estrella', 'plasma', 'fusion-nuclear', 'gravedad'],
        quiz: [
            { pregunta: '¿Qué es el Sol?', opciones: ['Un planeta gigante', 'Una estrella', 'Un satélite de la Tierra'], correcta: 1, explicacion: 'El Sol es la estrella más cercana a nosotros. Las estrellas producen su propia luz y calor.' },
            { pregunta: '¿Cuánto tarda la luz del Sol en llegar a la Tierra?', opciones: ['8 minutos y 20 segundos', '1 segundo', '24 horas'], correcta: 0, explicacion: 'Aunque la luz es rapidísima, el Sol está a 149,6 millones de km: por eso tarda 8 min 20 s.' }
        ]
    },

    /* -------------------------------------------------------------- MERCURIO */
    {
        id: 'mercurio',
        nombre: 'Mercurio',
        emoji: '☿️',
        tipo: 'Rocoso',
        color: '#b9a898',
        pos: orbita(16, 0, 1),
        radio: 1.1,
        rotSpeed: 0.0015,
        camRatio: 9,
        resumen: 'El más pequeño y el más rápido de los planetas.',
        descripcion: {
            exploradores: 'Mercurio es el planeta más cercano al Sol y el más pequeño. Es un mundo de roca gris lleno de cráteres, casi sin aire. De día hace un calor terrible y de noche un frío congelante.',
            cientificos: 'Mercurio es un planeta rocoso de 4.879 km de diámetro, sin atmósfera significativa. Su rotación dura 58,6 días terrestres y su año, 88 días, lo que produce días solares de 176 días. La temperatura oscila entre -173 °C y 427 °C.'
        },
        datos: [
            { etiqueta: 'Distancia al Sol', valor: '57,9 millones km', nota: '0,39 UA' },
            { etiqueta: 'Diámetro', valor: '4.879 km' },
            { etiqueta: 'Temperatura', valor: '-173 °C a 427 °C' },
            { etiqueta: 'Día (rotación)', valor: '58,6 días terrestres' },
            { etiqueta: 'Año (traslación)', valor: '88 días terrestres' },
            { etiqueta: 'Gravedad', valor: '3,7 m/s²', nota: '38 % de la Tierra' },
            { etiqueta: 'Lunas', valor: 'Ninguna' },
            { etiqueta: 'Atmósfera', valor: 'Casi inexistente' }
        ],
        curiosidades: [
            { icono: '📅', titulo: 'Un día dura más que un año', texto: 'Un día solar en Mercurio dura 176 días terrestres, pero su año dura solo 88. ¡Amanece dos veces por año!' },
            { icono: '🧊', titulo: 'Hielo en el infierno', texto: 'En cráteres de los polos, donde nunca llega el Sol, hay hielo de agua escondido.' },
            { icono: '💨', titulo: 'El más veloz', texto: 'Recorre su órbita a 47,4 km por segundo, más rápido que cualquier otro planeta.' }
        ],
        comparacion: 'Si la Tierra fuera una pelota de fútbol, Mercurio sería una pelota de 8,4 cm: un poco más grande que una de tenis.',
        glosario: ['orbita', 'rotacion', 'crater', 'gravedad'],
        quiz: [
            { pregunta: '¿Por qué Mercurio tiene tantos cráteres?', opciones: ['Por los volcanes', 'Porque casi no tiene atmósfera que lo proteja', 'Por el viento solar'], correcta: 1, explicacion: 'Sin atmósfera, las rocas espaciales chocan directamente contra su superficie y dejan cráteres.' },
            { pregunta: '¿Cuál es la temperatura en Mercurio?', opciones: ['Siempre 20 °C', 'Muy calurosa de día y muy fría de noche', 'Siempre bajo cero'], correcta: 1, explicacion: 'Sin atmósfera que retenga el calor, pasa de 427 °C de día a -173 °C de noche.' }
        ]
    },

    /* ----------------------------------------------------------------- VENUS */
    {
        id: 'venus',
        nombre: 'Venus',
        emoji: '🟡',
        tipo: 'Rocoso',
        color: '#f0c27b',
        pos: orbita(24, 137.5, -2),
        radio: 2.8,
        rotSpeed: 0.0008,
        camRatio: 7,
        resumen: 'El planeta más caliente, con nubes tóxicas y un calor de horno.',
        descripcion: {
            exploradores: 'Venus es el planeta más caliente de todos, aunque no es el más cercano al Sol. Está cubierto de nubes espesas que atrapan el calor como una manta gigante. ¡Es el gemelo malvado de la Tierra!',
            cientificos: 'Venus tiene un diámetro similar al terrestre (12.104 km), pero su atmósfera de CO₂ es 92 veces más densa y contiene nubes de ácido sulfúrico. Su efecto invernadero desbocado eleva la temperatura a 464 °C. Gira al revés y muy lento: 243 días por rotación.'
        },
        datos: [
            { etiqueta: 'Distancia al Sol', valor: '108,2 millones km', nota: '0,72 UA' },
            { etiqueta: 'Diámetro', valor: '12.104 km' },
            { etiqueta: 'Temperatura', valor: '464 °C (promedio)' },
            { etiqueta: 'Día (rotación)', valor: '243 días terrestres' },
            { etiqueta: 'Año (traslación)', valor: '225 días terrestres' },
            { etiqueta: 'Gravedad', valor: '8,87 m/s²', nota: '90 % de la Tierra' },
            { etiqueta: 'Lunas', valor: 'Ninguna' },
            { etiqueta: 'Presión atmosférica', valor: '92 veces la terrestre' }
        ],
        curiosidades: [
            { icono: '🔄', titulo: 'Gira al revés', texto: 'En Venus el Sol sale por el oeste y se pone por el este, porque rota en sentido contrario a casi todos los planetas.' },
            { icono: '🌋', titulo: 'Un horno bajo presión', texto: 'La presión en su superficie es como estar 900 metros bajo el agua: una nave necesita un blindaje enorme para resistirla.' },
            { icono: '✨', titulo: 'El lucero', texto: 'Es el objeto más brillante del cielo después del Sol y la Luna. Por eso se lo llama “lucero del alba” o “del atardecer”.' }
        ],
        comparacion: 'Casi del mismo tamaño que la Tierra: si la Tierra es una pelota de fútbol, Venus es una pelota un poquito más chica.',
        glosario: ['efecto-invernadero', 'atmosfera', 'rotacion'],
        quiz: [
            { pregunta: '¿Por qué Venus es más caliente que Mercurio?', opciones: ['Porque está más cerca del Sol', 'Porque sus nubes atrapan el calor', 'Porque tiene volcanes'], correcta: 1, explicacion: 'Su atmósfera densa de CO₂ produce un efecto invernadero enorme que retiene el calor.' },
            { pregunta: '¿Qué tiene de raro la rotación de Venus?', opciones: ['Es rapidísima', 'Gira al revés y muy lento', 'No gira'], correcta: 1, explicacion: 'Venus rota en sentido retrógrado y tarda 243 días terrestres en completar un giro.' }
        ]
    },

    /* ---------------------------------------------------------------- TIERRA */
    {
        id: 'tierra',
        nombre: 'Tierra',
        emoji: '🌍',
        tipo: 'Rocoso',
        color: '#4fa3ff',
        pos: posTierra,
        radio: 3,
        rotSpeed: 0.0022,
        camRatio: 12.5,
        resumen: 'Nuestro hogar: el único mundo conocido con vida.',
        descripcion: {
            exploradores: 'La Tierra es nuestro hogar. Es el único lugar que conocemos con vida, porque tiene agua líquida, aire para respirar y una temperatura perfecta. Desde el espacio se ve azul por sus océanos.',
            cientificos: 'La Tierra es un planeta rocoso de 12.742 km de diámetro, con el 71 % de su superficie cubierta por agua. Su atmósfera (78 % nitrógeno, 21 % oxígeno) y su campo magnético protegen la vida. Un giro dura 23 h 56 min y una vuelta al Sol, 365,25 días.'
        },
        datos: [
            { etiqueta: 'Distancia al Sol', valor: '149,6 millones km', nota: '1 UA' },
            { etiqueta: 'Diámetro', valor: '12.742 km' },
            { etiqueta: 'Temperatura', valor: '15 °C (promedio)' },
            { etiqueta: 'Día (rotación)', valor: '23 h 56 min' },
            { etiqueta: 'Año (traslación)', valor: '365,25 días' },
            { etiqueta: 'Gravedad', valor: '9,8 m/s²' },
            { etiqueta: 'Lunas', valor: '1 (la Luna)' },
            { etiqueta: 'Superficie con agua', valor: '71 %' }
        ],
        curiosidades: [
            { icono: '🥚', titulo: 'No es una esfera perfecta', texto: 'Está achatada en los polos y ensanchada en el ecuador, porque gira sobre sí misma.' },
            { icono: '💧', titulo: 'Agua, pero poca dulce', texto: 'El 71 % del planeta es agua, pero solo el 3 % es agua dulce y gran parte está congelada.' },
            { icono: '🚀', titulo: 'Viajamos rapidísimo', texto: 'La Tierra se mueve a 107.000 km/h alrededor del Sol. ¡No lo sentimos porque nos movemos con ella!' }
        ],
        comparacion: 'La Tierra es nuestra unidad de medida: todos los demás tamaños se comparan con ella.',
        glosario: ['atmosfera', 'campo-magnetico', 'orbita', 'rotacion', 'traslacion'],
        quiz: [
            { pregunta: '¿Qué hace que la Tierra sea especial?', opciones: ['Es la más grande', 'Tiene agua líquida y atmósfera que permiten la vida', 'Tiene anillos'], correcta: 1, explicacion: 'El agua líquida, el oxígeno y la temperatura adecuada hacen posible la vida tal como la conocemos.' },
            { pregunta: '¿Cuánto tarda la Tierra en dar una vuelta al Sol?', opciones: ['24 horas', '365 días y 6 horas', '30 días'], correcta: 1, explicacion: 'Ese cuarto de día extra se acumula y cada 4 años se suma un 29 de febrero (año bisiesto).' }
        ]
    },

    /* ------------------------------------------------------------------ LUNA */
    {
        id: 'luna',
        nombre: 'Luna',
        emoji: '🌙',
        tipo: 'Satélite',
        color: '#cfcfcf',
        pos: { x: posTierra.x - 6, y: posTierra.y + 1.4, z: posTierra.z - 5 },
        radio: 0.85,
        rotSpeed: 0.0009,
        camRatio: 5.5,
        resumen: 'El único satélite natural de la Tierra y el primer destino humano.',
        descripcion: {
            exploradores: 'La Luna es el único satélite natural de la Tierra. La vemos cambiar de forma cada noche y es el único lugar del espacio al que han viajado seres humanos.',
            cientificos: 'La Luna tiene 3.474 km de diámetro y orbita a 384.400 km de la Tierra. Su rotación y su revolución duran lo mismo (27,3 días), por eso siempre nos muestra la misma cara. Su gravedad es el 17 % de la terrestre y es la responsable principal de las mareas.'
        },
        datos: [
            { etiqueta: 'Distancia a la Tierra', valor: '384.400 km' },
            { etiqueta: 'Diámetro', valor: '3.474 km' },
            { etiqueta: 'Temperatura', valor: '-173 °C a 127 °C' },
            { etiqueta: 'Día (rotación)', valor: '27,3 días' },
            { etiqueta: 'Órbita a la Tierra', valor: '27,3 días' },
            { etiqueta: 'Gravedad', valor: '1,62 m/s²', nota: '17 % de la Tierra' },
            { etiqueta: 'Fases', valor: '8 (de nueva a llena)' },
            { etiqueta: 'Atmósfera', valor: 'Prácticamente nula' }
        ],
        curiosidades: [
            { icono: '👨‍🚀', titulo: 'Doce caminantes', texto: 'Doce personas caminaron sobre la Luna entre 1969 y 1972, en las misiones Apolo.' },
            { icono: '📏', titulo: 'Se aleja', texto: 'La Luna se aleja de la Tierra 3,8 cm por año, más o menos lo que crece una uña en un mes.' },
            { icono: '🌊', titulo: 'Mueve el mar', texto: 'Su gravedad atrae el agua de los océanos y produce las mareas altas y bajas.' }
        ],
        comparacion: 'Si la Tierra fuera una pelota de fútbol, la Luna sería una pelota de 6 cm (como una de tenis un poco más chica) a 6,6 metros de distancia.',
        glosario: ['satelite', 'gravedad', 'marea', 'crater'],
        quiz: [
            { pregunta: '¿Por qué siempre vemos la misma cara de la Luna?', opciones: ['Porque no gira', 'Porque tarda lo mismo en girar que en orbitar la Tierra', 'Porque está quieta'], correcta: 1, explicacion: 'Su rotación y su traslación duran 27,3 días: por eso nos muestra siempre el mismo lado.' },
            { pregunta: '¿Qué provoca las mareas?', opciones: ['El viento', 'La gravedad de la Luna y el Sol', 'La rotación de la Tierra'], correcta: 1, explicacion: 'La atracción gravitatoria de la Luna (y en menor medida del Sol) mueve el agua de los océanos.' }
        ]
    },

    /* ----------------------------------------------------------------- MARTE */
    {
        id: 'marte',
        nombre: 'Marte',
        emoji: '🔴',
        tipo: 'Rocoso',
        color: '#e06a4a',
        pos: orbita(46, 52.5, 2),
        radio: 1.6,
        rotSpeed: 0.0019,
        camRatio: 8.6,
        resumen: 'El planeta rojo: desierto, volcanes gigantes y robots exploradores.',
        descripcion: {
            exploradores: 'Marte es el planeta rojo. Su color viene del óxido de hierro, como el de un clavo viejo. Es un desierto frío con montañas enormes y pistas de que hace millones de años tuvo ríos.',
            cientificos: 'Marte mide 6.779 km de diámetro y tiene una atmósfera muy fina de CO₂ (menos del 1 % de la presión terrestre). Aloja el Monte Olimpo, de 21,9 km, el volcán más alto del sistema solar, y el cañón Valles Marineris, de 4.000 km. Tiene dos lunas: Fobos y Deimos.'
        },
        datos: [
            { etiqueta: 'Distancia al Sol', valor: '227,9 millones km', nota: '1,52 UA' },
            { etiqueta: 'Diámetro', valor: '6.779 km' },
            { etiqueta: 'Temperatura', valor: '-63 °C (promedio)' },
            { etiqueta: 'Día (rotación)', valor: '24 h 37 min' },
            { etiqueta: 'Año (traslación)', valor: '687 días terrestres' },
            { etiqueta: 'Gravedad', valor: '3,71 m/s²', nota: '38 % de la Tierra' },
            { etiqueta: 'Lunas', valor: '2 (Fobos y Deimos)' },
            { etiqueta: 'Atmósfera', valor: '95 % dióxido de carbono' }
        ],
        curiosidades: [
            { icono: '🏔️', titulo: 'El volcán más alto', texto: 'El Monte Olimpo mide 21,9 km: dos veces y media el Everest. Es tan ancho que desde su cima no se ve el horizonte.' },
            { icono: '🌅', titulo: 'Atardeceres azules', texto: 'En Marte el cielo se ve rojizo de día, pero al atardecer alrededor del Sol aparece un halo azul.' },
            { icono: '🤖', titulo: 'Robots exploradores', texto: 'Varios robots recorren Marte: Curiosity y Perseverance analizan rocas y buscan señales de vida antigua.' }
        ],
        comparacion: 'Si la Tierra fuera una pelota de fútbol, Marte sería una pelota de 11,7 cm, como un pomelo.',
        glosario: ['atmosfera', 'orbita', 'crater', 'sonda-espacial'],
        quiz: [
            { pregunta: '¿Por qué Marte es rojo?', opciones: ['Por el fuego', 'Por el óxido de hierro de su suelo', 'Por sus plantas'], correcta: 1, explicacion: 'Su superficie tiene mucho hierro oxidado, igual que un clavo viejo, y eso le da el color rojizo.' },
            { pregunta: '¿Qué robot exploró Marte?', opciones: ['Perseverance', 'Voyager 1', 'Hubble'], correcta: 0, explicacion: 'Perseverance llegó en 2021 y recorre el cráter Jezero buscando señales de vida antigua.' }
        ]
    },

    /* -------------------------------------------------------------- CINTURÓN */
    {
        id: 'cinturon',
        nombre: 'Cinturón de asteroides',
        emoji: '☄️',
        tipo: 'Cinturón',
        color: '#a08a6a',
        pos: orbita(59, 190, -1),
        radio: 0.55,
        rotSpeed: 0.0012,
        camRatio: 4.5,
        resumen: 'Millones de rocas espaciales entre Marte y Júpiter.',
        descripcion: {
            exploradores: 'Entre Marte y Júpiter hay un cinturón de millones de rocas y trozos de hielo llamados asteroides. A pesar de lo que muestran las películas, están muy separados: casi nunca chocan entre sí.',
            cientificos: 'El cinturón principal se extiende entre 2,2 y 3,2 UA del Sol. Contiene millones de cuerpos, pero su masa total es menor al 4 % de la Luna. El mayor es Ceres (940 km), clasificado como planeta enano. Son restos de la formación del sistema solar que la gravedad de Júpiter impidió que se unieran.'
        },
        datos: [
            { etiqueta: 'Distancia al Sol', valor: '2,2 a 3,2 UA' },
            { etiqueta: 'Extensión', valor: 'Unos 150 millones km de ancho' },
            { etiqueta: 'Objeto más grande', valor: 'Ceres (940 km)' },
            { etiqueta: 'Temperatura', valor: 'Alrededor de -73 °C' },
            { etiqueta: 'Composición', valor: 'Roca, metal y hielo' },
            { etiqueta: 'Cantidad estimada', valor: 'Millones de asteroides' },
            { etiqueta: 'Masa total', valor: 'Menos del 4 % de la Luna' },
            { etiqueta: 'Misiones', valor: 'Dawn y Psyche (en camino)' }
        ],
        curiosidades: [
            { icono: '🪨', titulo: 'Ceres, el gigante', texto: 'Ceres es tan grande que se considera un planeta enano. Contiene una gran cantidad de hielo de agua.' },
            { icono: '📏', titulo: 'Muy separados', texto: 'En promedio, los asteroides están a cientos de miles de kilómetros entre sí. Las naves los cruzan sin problemas.' },
            { icono: '🛰️', titulo: 'Misiones', texto: 'La sonda Dawn estudió Vesta y Ceres; Hayabusa2 trajo muestras de un asteroide a la Tierra.' }
        ],
        comparacion: 'Todo el cinturón junto pesa menos que nuestra Luna, aunque está formado por millones de rocas.',
        glosario: ['asteroide', 'planeta-enano', 'orbita', 'cinturon-kuiper'],
        quiz: [
            { pregunta: '¿Dónde está el cinturón de asteroides?', opciones: ['Entre la Tierra y Marte', 'Entre Marte y Júpiter', 'Más allá de Neptuno'], correcta: 1, explicacion: 'Se ubica entre las órbitas de Marte y Júpiter, a unas 2,5 UA del Sol.' },
            { pregunta: '¿Cuál es el objeto más grande del cinturón?', opciones: ['Ceres', 'Plutón', 'Vesta'], correcta: 0, explicacion: 'Ceres mide 940 km de diámetro y es el único planeta enano del cinturón.' }
        ]
    },

    /* --------------------------------------------------------------- JÚPITER */
    {
        id: 'jupiter',
        nombre: 'Júpiter',
        emoji: '🟠',
        tipo: 'Gigante gaseoso',
        color: '#d9a066',
        pos: orbita(82, 327.5, 3),
        radio: 9.5,
        rotSpeed: 0.0055,
        camRatio: 4.33,
        resumen: 'El rey de los planetas: gigante, gaseoso y con una tormenta eterna.',
        descripcion: {
            exploradores: 'Júpiter es el gigante del sistema solar. Es tan grande que dentro de él entrarían más de 1.300 Tierras. Está hecho de gas y tiene una tormenta gigante que gira desde hace cientos de años.',
            cientificos: 'Júpiter es un gigante gaseoso de 139.820 km de diámetro, compuesto sobre todo de hidrógeno y helio. Su rotación de 9 h 56 min es la más rápida del sistema solar y genera fuertes bandas nubosas. La Gran Mancha Roja es un anticiclón mayor que la Tierra. Tiene más de 90 lunas; Europa esconde un océano bajo su hielo.'
        },
        datos: [
            { etiqueta: 'Distancia al Sol', valor: '778,5 millones km', nota: '5,2 UA' },
            { etiqueta: 'Diámetro', valor: '139.820 km', nota: '11 Tierras' },
            { etiqueta: 'Temperatura', valor: '-108 °C (nubes)' },
            { etiqueta: 'Día (rotación)', valor: '9 h 56 min' },
            { etiqueta: 'Año (traslación)', valor: '11,9 años terrestres' },
            { etiqueta: 'Gravedad', valor: '24,79 m/s²', nota: '2,5 veces la Tierra' },
            { etiqueta: 'Lunas', valor: 'Más de 90 confirmadas' },
            { etiqueta: 'Composición', valor: 'Hidrógeno y helio' }
        ],
        curiosidades: [
            { icono: '🌪️', titulo: 'La Gran Mancha Roja', texto: 'Es una tormenta más grande que la Tierra que lleva siglos girando. Sus vientos superan los 400 km/h.' },
            { icono: '🌊', titulo: 'Europa y su océano', texto: 'Bajo la corteza helada de Europa hay un océano de agua líquida: uno de los mejores lugares para buscar vida.' },
            { icono: '🛡️', titulo: 'Escudo cósmico', texto: 'Su enorme gravedad desvía cometas y asteroides, protegiendo en parte a los planetas interiores.' }
        ],
        comparacion: 'Si la Tierra fuera una pelota de fútbol, Júpiter sería una pelota de 2,4 metros de diámetro.',
        glosario: ['gigante-gaseoso', 'gran-mancha-roja', 'satelite', 'gravedad'],
        quiz: [
            { pregunta: '¿Qué es la Gran Mancha Roja?', opciones: ['Un volcán', 'Una tormenta gigante', 'Un océano'], correcta: 1, explicacion: 'Es un enorme remolino de nubes, un anticiclón más grande que la Tierra.' },
            { pregunta: '¿Júpiter tiene superficie sólida?', opciones: ['Sí, rocosa', 'No, es un gigante gaseoso', 'Solo hielo'], correcta: 1, explicacion: 'Está formado por gases y líquidos; no hay un suelo firme donde pararse.' }
        ]
    },

    /* --------------------------------------------------------------- SATURNO */
    {
        id: 'saturno',
        nombre: 'Saturno',
        emoji: '🪐',
        tipo: 'Gigante gaseoso',
        color: '#e3c78f',
        pos: orbita(112, 105, -3),
        radio: 7.8,
        rotSpeed: 0.005,
        camRatio: 5.5,
        resumen: 'El señor de los anillos: hielo y roca girando en un disco gigante.',
        descripcion: {
            exploradores: 'Saturno es famoso por sus anillos. Están hechos de miles de millones de trozos de hielo y roca que giran a su alrededor. Es tan liviano que, si hubiera una bañera gigante, flotaría.',
            cientificos: 'Saturno es un gigante gaseoso de 116.460 km de diámetro y densidad media de 0,687 g/cm³, menor que la del agua. Sus anillos se extienden unos 280.000 km, pero tienen apenas decenas de metros de espesor. Tiene más de 140 lunas; Titán posee atmósfera densa y lagos de metano líquido.'
        },
        datos: [
            { etiqueta: 'Distancia al Sol', valor: '1.434 millones km', nota: '9,6 UA' },
            { etiqueta: 'Diámetro', valor: '116.460 km', nota: '9 Tierras' },
            { etiqueta: 'Temperatura', valor: '-139 °C (nubes)' },
            { etiqueta: 'Día (rotación)', valor: '10 h 42 min' },
            { etiqueta: 'Año (traslación)', valor: '29,4 años terrestres' },
            { etiqueta: 'Gravedad', valor: '10,44 m/s²' },
            { etiqueta: 'Lunas', valor: 'Más de 140 confirmadas' },
            { etiqueta: 'Densidad', valor: '0,687 g/cm³', nota: 'Menor que el agua' }
        ],
        curiosidades: [
            { icono: '🛁', titulo: 'Flotaría', texto: 'Saturno es el planeta menos denso: si existiera una bañera lo bastante grande, flotaría en el agua.' },
            { icono: '💍', titulo: 'Anillos finísimos', texto: 'Miden 280.000 km de ancho, pero en promedio solo decenas de metros de espesor. ¡Como una hoja de papel gigante!' },
            { icono: '🌫️', titulo: 'Titán', texto: 'Su luna Titán tiene ríos y lagos, pero de metano líquido, y una atmósfera más densa que la de la Tierra.' }
        ],
        comparacion: 'Si la Tierra fuera una pelota de fútbol, Saturno sería una pelota de 2 metros con un disco de 4,7 metros.',
        glosario: ['gigante-gaseoso', 'satelite', 'densidad', 'atmosfera'],
        quiz: [
            { pregunta: '¿De qué están hechos los anillos de Saturno?', opciones: ['De gas', 'De hielo y roca', 'De polvo de estrellas'], correcta: 1, explicacion: 'Son miles de millones de fragmentos de hielo y roca que orbitan el planeta.' },
            { pregunta: '¿Qué tiene de especial la densidad de Saturno?', opciones: ['Es más denso que la Tierra', 'Es menor que la del agua', 'Es igual a la del aire'], correcta: 1, explicacion: 'Con 0,687 g/cm³, flotaría en agua, que tiene 1 g/cm³.' }
        ]
    },

    /* ---------------------------------------------------------------- URANO */
    {
        id: 'urano',
        nombre: 'Urano',
        emoji: '🔵',
        tipo: 'Gigante helado',
        color: '#8fe3e8',
        pos: orbita(140, 242.5, 2),
        radio: 3.5,
        rotSpeed: 0.003,
        camRatio: 7,
        resumen: 'El gigante helado que gira acostado y rueda alrededor del Sol.',
        descripcion: {
            exploradores: 'Urano es un gigante helado de color celeste. Lo más raro es que gira de costado, como si estuviera acostado. Tarda 84 años en dar una vuelta al Sol.',
            cientificos: 'Urano mide 50.724 km de diámetro y está compuesto por agua, amoníaco y metano en estado fluido. Su eje está inclinado 98°, probablemente por una colisión antigua, lo que produce estaciones extremas de 21 años. Fue descubierto en 1781 por William Herschel.'
        },
        datos: [
            { etiqueta: 'Distancia al Sol', valor: '2.871 millones km', nota: '19,2 UA' },
            { etiqueta: 'Diámetro', valor: '50.724 km', nota: '4 Tierras' },
            { etiqueta: 'Temperatura', valor: '-195 °C' },
            { etiqueta: 'Día (rotación)', valor: '17 h 14 min' },
            { etiqueta: 'Año (traslación)', valor: '84 años terrestres' },
            { etiqueta: 'Gravedad', valor: '8,87 m/s²' },
            { etiqueta: 'Lunas', valor: '28 conocidas' },
            { etiqueta: 'Inclinación del eje', valor: '98°' }
        ],
        curiosidades: [
            { icono: '🛌', titulo: 'Gira acostado', texto: 'Su eje está casi horizontal: sus polos reciben 42 años de luz continua y 42 años de oscuridad.' },
            { icono: '🔭', titulo: 'Primer planeta descubierto', texto: 'Fue el primero encontrado con telescopio, en 1781. Antes se lo confundía con una estrella.' },
            { icono: '💎', titulo: 'Lluvia de diamantes', texto: 'Los científicos creen que la presión y el metano en su interior podrían formar diamantes microscópicos.' }
        ],
        comparacion: 'Si la Tierra fuera una pelota de fútbol, Urano sería una pelota de 88 cm.',
        glosario: ['gigante-helado', 'rotacion', 'satelite', 'atmosfera'],
        quiz: [
            { pregunta: '¿Qué tiene de especial el eje de Urano?', opciones: ['Está vertical', 'Está inclinado 98°, casi acostado', 'No tiene eje'], correcta: 1, explicacion: 'Gira de costado, probablemente por un impacto enorme en el pasado.' },
            { pregunta: '¿Quién descubrió Urano?', opciones: ['Galileo Galilei', 'William Herschel', 'Isaac Newton'], correcta: 1, explicacion: 'Herschel lo observó en 1781 con un telescopio y lo identificó como planeta.' }
        ]
    },

    /* -------------------------------------------------------------- NEPTUNO */
    {
        id: 'neptuno',
        nombre: 'Neptuno',
        emoji: '🔷',
        tipo: 'Gigante helado',
        color: '#3f6fd8',
        pos: orbita(165, 20, -2),
        radio: 3.4,
        rotSpeed: 0.003,
        camRatio: 7,
        resumen: 'El planeta más lejano y el de los vientos más violentos.',
        descripcion: {
            exploradores: 'Neptuno es el planeta más lejano del Sol y el más ventoso. Sus vientos soplan a más de 2.000 km/h. ¡Fue descubierto con matemáticas antes de verlo con un telescopio!',
            cientificos: 'Neptuno tiene 49.244 km de diámetro y orbita a 30 UA del Sol. Su atmósfera de hidrógeno, helio y metano alcanza vientos de 2.100 km/h, los más rápidos del sistema solar. Fue localizado en 1846 a partir de cálculos de Le Verrier y Adams. Su luna Tritón orbita en sentido retrógrado.'
        },
        datos: [
            { etiqueta: 'Distancia al Sol', valor: '4.495 millones km', nota: '30,1 UA' },
            { etiqueta: 'Diámetro', valor: '49.244 km', nota: '3,9 Tierras' },
            { etiqueta: 'Temperatura', valor: '-201 °C' },
            { etiqueta: 'Día (rotación)', valor: '16 h 6 min' },
            { etiqueta: 'Año (traslación)', valor: '165 años terrestres' },
            { etiqueta: 'Gravedad', valor: '11,15 m/s²' },
            { etiqueta: 'Lunas', valor: '16 conocidas' },
            { etiqueta: 'Vientos', valor: 'Hasta 2.100 km/h' }
        ],
        curiosidades: [
            { icono: '✏️', titulo: 'Descubierto con lápiz y papel', texto: 'Los astrónomos calcularon dónde debía estar un planeta que perturbaba la órbita de Urano. ¡Y lo encontraron ahí!' },
            { icono: '🌀', titulo: 'Vientos supersónicos', texto: 'Sus vientos superan los 2.000 km/h, más rápidos que la velocidad del sonido en la Tierra.' },
            { icono: '🌋', titulo: 'Géiseres en Tritón', texto: 'Su luna Tritón lanza columnas de hielo y gas, y orbita en sentido contrario al resto.' }
        ],
        comparacion: 'Si la Tierra fuera una pelota de fútbol, Neptuno sería una pelota de 85 cm.',
        glosario: ['gigante-helado', 'orbita', 'satelite', 'gravedad'],
        quiz: [
            { pregunta: '¿Cómo se descubrió Neptuno?', opciones: ['Con un telescopio casualmente', 'Con cálculos matemáticos', 'Con una sonda espacial'], correcta: 1, explicacion: 'Le Verrier y Adams calcularon su posición por las perturbaciones en Urano, y luego se confirmó con un telescopio.' },
            { pregunta: '¿Cómo son los vientos de Neptuno?', opciones: ['Suaves', 'Los más rápidos del sistema solar', 'No tiene vientos'], correcta: 1, explicacion: 'Alcanzan 2.100 km/h, los más veloces medidos en un planeta.' }
        ]
    },

    /* --------------------------------------------------------------- MÁS ALLÁ */
    {
        id: 'kuiper',
        nombre: 'Más allá de Neptuno',
        emoji: '🧊',
        tipo: 'Cinturón de Kuiper',
        color: '#9fb7d8',
        pos: orbita(190, 300, 2),
        radio: 0.6,
        rotSpeed: 0.001,
        camRatio: 4.5,
        resumen: 'Plutón, cometas y un enorme anillo de mundos helados.',
        descripcion: {
            exploradores: 'Más allá de Neptuno está el cinturón de Kuiper, un enorme anillo de mundos helados. Allí vive Plutón, que antes era el noveno planeta y hoy es un planeta enano. También vienen de allí muchos cometas.',
            cientificos: 'El cinturón de Kuiper se extiende entre 30 y 50 UA. Plutón (2.377 km) es su miembro más famoso; desde 2006 es un planeta enano. Comparte zona con Eris, Makemake y Haumea. Las sondas Voyager 1 y 2 ya salieron de la heliosfera y New Horizons sobrevoló Plutón en 2015.'
        },
        datos: [
            { etiqueta: 'Distancia al Sol', valor: '30 a 50 UA' },
            { etiqueta: 'Plutón: diámetro', valor: '2.377 km' },
            { etiqueta: 'Temperatura', valor: 'Alrededor de -229 °C' },
            { etiqueta: 'Año en Plutón', valor: '248 años terrestres' },
            { etiqueta: 'Lunas de Plutón', valor: '5 (Caronte es la mayor)' },
            { etiqueta: 'Objetos conocidos', valor: 'Miles de cuerpos helados' },
            { etiqueta: 'Cometas', valor: 'Muchos vienen de esta zona' },
            { etiqueta: 'Explorado por', valor: 'New Horizons (2015)' }
        ],
        curiosidades: [
            { icono: '💔', titulo: 'Plutón cambió de categoría', texto: 'En 2006 dejó de ser planeta y pasó a ser “planeta enano”, porque no despejó su órbita de otros objetos.' },
            { icono: '🌍', titulo: 'Caronte, casi gemela', texto: 'La luna más grande de Plutón mide la mitad que él. Se miran siempre la misma cara, como un baile.' },
            { icono: '🚀', titulo: 'Viaje larguísimo', texto: 'New Horizons tardó 9 años y medio en llegar a Plutón, viajando a más de 50.000 km/h.' }
        ],
        comparacion: 'Si la Tierra fuera una pelota de fútbol, Plutón sería una pelota de ping-pong (4 cm) a unos 102 km de distancia.',
        glosario: ['planeta-enano', 'cometa', 'cinturon-kuiper', 'sonda-espacial', 'unidad-astronomica'],
        quiz: [
            { pregunta: '¿Qué es Plutón desde 2006?', opciones: ['Un planeta gigante', 'Un planeta enano', 'Una estrella'], correcta: 1, explicacion: 'La Unión Astronómica Internacional lo reclasificó como planeta enano porque comparte su órbita con otros objetos.' },
            { pregunta: '¿Qué sonda visitó Plutón?', opciones: ['Voyager 1', 'New Horizons', 'Cassini'], correcta: 1, explicacion: 'New Horizons pasó cerca de Plutón en julio de 2015 y envió las primeras fotos cercanas.' }
        ]
    }
];

/* ------------------------------------------------------------------ GLOSARIO */
export const GLOSARIO = [
    { id: 'orbita', termino: 'Órbita', def: 'Camino que recorre un astro alrededor de otro debido a la gravedad. La Tierra tarda 365 días en completar la suya alrededor del Sol.' },
    { id: 'rotacion', termino: 'Rotación', def: 'Giro de un astro sobre su propio eje. En la Tierra dura unas 24 horas y produce el día y la noche.' },
    { id: 'traslacion', termino: 'Traslación', def: 'Movimiento de un astro alrededor de otro. La traslación de la Tierra alrededor del Sol dura 365 días y 6 horas.' },
    { id: 'gravedad', termino: 'Gravedad', def: 'Fuerza que atrae los cuerpos entre sí. Es la que nos mantiene en el suelo y la que hace girar a los planetas alrededor del Sol.' },
    { id: 'atmosfera', termino: 'Atmósfera', def: 'Capa de gases que envuelve un planeta. La de la Tierra tiene oxígeno y nos protege de la radiación.' },
    { id: 'satelite', termino: 'Satélite natural', def: 'Cuerpo que orbita alrededor de un planeta. La Luna es el satélite natural de la Tierra.' },
    { id: 'planeta-rocoso', termino: 'Planeta rocoso', def: 'Planeta con superficie sólida: Mercurio, Venus, Tierra y Marte. También se los llama planetas interiores.' },
    { id: 'gigante-gaseoso', termino: 'Gigante gaseoso', def: 'Planeta enorme formado sobre todo por gases, sin superficie sólida: Júpiter y Saturno.' },
    { id: 'gigante-helado', termino: 'Gigante helado', def: 'Planeta formado por agua, amoníaco y metano en estado fluido: Urano y Neptuno.' },
    { id: 'asteroide', termino: 'Asteroide', def: 'Roca espacial más pequeña que un planeta. La mayoría se concentra en el cinturón entre Marte y Júpiter.' },
    { id: 'cometa', termino: 'Cometa', def: 'Cuerpo de hielo y polvo que, al acercarse al Sol, libera gas y forma una cola luminosa.' },
    { id: 'planeta-enano', termino: 'Planeta enano', def: 'Cuerpo casi esférico que orbita el Sol pero no despejó su órbita. Plutón y Ceres son ejemplos.' },
    { id: 'crater', termino: 'Cráter', def: 'Hueco en la superficie de un astro producido por el impacto de una roca espacial.' },
    { id: 'unidad-astronomica', termino: 'Unidad astronómica (UA)', def: 'Distancia media entre la Tierra y el Sol: 149,6 millones de km. Sirve para medir distancias en el sistema solar.' },
    { id: 'anio-luz', termino: 'Año luz', def: 'Distancia que recorre la luz en un año: unos 9,46 billones de km. Se usa para medir distancias entre estrellas.' },
    { id: 'eclipse', termino: 'Eclipse', def: 'Cuando un astro tapa a otro desde nuestra perspectiva. El eclipse de Sol ocurre cuando la Luna se interpone.' },
    { id: 'marea', termino: 'Marea', def: 'Subida y bajada del nivel del mar causada por la gravedad de la Luna y del Sol.' },
    { id: 'efecto-invernadero', termino: 'Efecto invernadero', def: 'Fenómeno por el cual ciertos gases retienen el calor de un planeta. En Venus es extremo; en la Tierra, está aumentando por la actividad humana.' },
    { id: 'plasma', termino: 'Plasma', def: 'Estado de la materia muy caliente en el que los átomos se separan en partículas con carga. El Sol es una esfera de plasma.' },
    { id: 'fusion-nuclear', termino: 'Fusión nuclear', def: 'Unión de núcleos atómicos que libera una enorme cantidad de energía. Es lo que hace brillar al Sol.' },
    { id: 'heliosfera', termino: 'Heliosfera', def: 'Burbuja de viento solar que rodea al Sol y se extiende más allá de Plutón.' },
    { id: 'viento-solar', termino: 'Viento solar', def: 'Corriente de partículas cargadas que el Sol expulsa constantemente hacia el espacio.' },
    { id: 'aurora', termino: 'Aurora', def: 'Luces de colores en el cielo polar, producidas cuando partículas del Sol chocan con el campo magnético y la atmósfera.' },
    { id: 'campo-magnetico', termino: 'Campo magnético', def: 'Zona de influencia magnética de un planeta. El de la Tierra desvía las partículas peligrosas del Sol.' },
    { id: 'sonda-espacial', termino: 'Sonda espacial', def: 'Nave sin tripulación que explora otros mundos y envía datos e imágenes a la Tierra.' },
    { id: 'gran-mancha-roja', termino: 'Gran Mancha Roja', def: 'Tormenta gigante y persistente en Júpiter, más grande que la Tierra.' },
    { id: 'cinturon-kuiper', termino: 'Cinturón de Kuiper', def: 'Anillo de cuerpos helados más allá de Neptuno, entre 30 y 50 UA del Sol. Allí está Plutón.' },
    { id: 'densidad', termino: 'Densidad', def: 'Cantidad de masa por unidad de volumen. El agua tiene 1 g/cm³; Saturno, 0,687 g/cm³.' },
    { id: 'estrella', termino: 'Estrella', def: 'Esfera de gas muy caliente que produce su propia luz y energía. El Sol es la estrella más cercana.' },
    { id: 'exoplaneta', termino: 'Exoplaneta', def: 'Planeta que orbita una estrella distinta del Sol. Ya se conocen miles.' }
];

/* ------------------------------------------------- PREGUNTAS DEL DESAFÍO */
export const DESAFIO = [
    { pregunta: '¿Cuál es el planeta más grande del sistema solar?', opciones: ['Saturno', 'Júpiter', 'Neptuno'], correcta: 1, explicacion: 'Júpiter mide 139.820 km de diámetro: dentro cabrían más de 1.300 Tierras.' },
    { pregunta: '¿Qué planeta es conocido como el planeta rojo?', opciones: ['Marte', 'Venus', 'Mercurio'], correcta: 0, explicacion: 'El óxido de hierro de su suelo le da ese color característico.' },
    { pregunta: '¿Qué produce el día y la noche en la Tierra?', opciones: ['La traslación', 'La rotación', 'La Luna'], correcta: 1, explicacion: 'La Tierra gira sobre su eje cada 24 horas y eso produce el día y la noche.' },
    { pregunta: '¿Cuál es el planeta más caliente?', opciones: ['Mercurio', 'Venus', 'Marte'], correcta: 1, explicacion: 'Venus alcanza 464 °C por su efecto invernadero, aunque Mercurio esté más cerca del Sol.' },
    { pregunta: '¿Qué es un año?', opciones: ['Una vuelta de la Tierra sobre su eje', 'Una vuelta de la Tierra al Sol', 'Una vuelta de la Luna a la Tierra'], correcta: 1, explicacion: 'Un año es el tiempo que tarda la Tierra en completar su órbita alrededor del Sol.' },
    { pregunta: '¿Qué planeta tiene los anillos más visibles?', opciones: ['Júpiter', 'Saturno', 'Urano'], correcta: 1, explicacion: 'Los anillos de Saturno son enormes y están formados por hielo y roca.' },
    { pregunta: '¿Cuántos planetas tiene el sistema solar?', opciones: ['8', '9', '10'], correcta: 0, explicacion: 'Desde 2006 son 8 planetas: Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno.' },
    { pregunta: '¿Cuál es el único satélite natural de la Tierra?', opciones: ['Marte', 'La Luna', 'Titán'], correcta: 1, explicacion: 'La Luna orbita la Tierra a 384.400 km de distancia.' },
    { pregunta: '¿Qué planeta gira “acostado”?', opciones: ['Urano', 'Neptuno', 'Saturno'], correcta: 0, explicacion: 'El eje de Urano está inclinado 98°, por eso parece rodar alrededor del Sol.' },
    { pregunta: '¿De qué está hecho el Sol?', opciones: ['Roca y metal', 'Hidrógeno y helio', 'Hielo y polvo'], correcta: 1, explicacion: 'Es una esfera de plasma, sobre todo hidrógeno y helio, que fusiona hidrógeno en su núcleo.' },
    { pregunta: '¿Qué instrumento se usa para observar planetas lejanos?', opciones: ['Microscopio', 'Telescopio', 'Termómetro'], correcta: 1, explicacion: 'El telescopio concentra la luz y permite ver objetos muy distantes.' },
    { pregunta: '¿Dónde se ubica el cinturón de asteroides?', opciones: ['Entre Marte y Júpiter', 'Entre la Tierra y Marte', 'Después de Neptuno'], correcta: 0, explicacion: 'Está a unas 2,5 UA del Sol, entre las órbitas de Marte y Júpiter.' },
    { pregunta: '¿Qué es un cometa?', opciones: ['Una estrella que cae', 'Un cuerpo de hielo y polvo con cola', 'Un planeta pequeño'], correcta: 1, explicacion: 'Al acercarse al Sol, el hielo se convierte en gas y forma la cola del cometa.' },
    { pregunta: '¿Cuánto tarda la luz del Sol en llegar a la Tierra?', opciones: ['8 minutos y 20 segundos', '1 hora', '1 día'], correcta: 0, explicacion: 'La distancia es de 149,6 millones de km y la luz viaja a 300.000 km/s.' },
    { pregunta: '¿Por qué la Luna siempre nos muestra la misma cara?', opciones: ['Porque no gira', 'Porque rota y orbita en el mismo tiempo', 'Porque es plana'], correcta: 1, explicacion: 'Su rotación y su traslación duran 27,3 días, así que siempre vemos el mismo hemisferio.' },
    { pregunta: '¿Qué planeta fue descubierto con cálculos matemáticos?', opciones: ['Urano', 'Neptuno', 'Saturno'], correcta: 1, explicacion: 'Neptuno se localizó en 1846 gracias a los cálculos de Le Verrier y Adams.' },
    { pregunta: '¿Qué es la Vía Láctea?', opciones: ['Un planeta', 'Nuestra galaxia', 'Un cometa'], correcta: 1, explicacion: 'Es la galaxia donde está el sistema solar, con cientos de miles de millones de estrellas.' },
    { pregunta: '¿Cuál es el planeta más cercano al Sol?', opciones: ['Venus', 'Mercurio', 'Tierra'], correcta: 1, explicacion: 'Mercurio orbita a 57,9 millones de km del Sol.' },
    { pregunta: '¿Qué es un planeta enano?', opciones: ['Un planeta muy pequeño que no despejó su órbita', 'Un satélite', 'Una estrella apagada'], correcta: 0, explicacion: 'Plutón y Ceres son planetas enanos: son casi esféricos pero comparten su órbita con otros objetos.' },
    { pregunta: '¿Qué misión llevó personas a la Luna?', opciones: ['Apolo 11', 'Voyager 1', 'New Horizons'], correcta: 0, explicacion: 'Apolo 11 llegó a la Luna el 20 de julio de 1969 con Neil Armstrong y Buzz Aldrin.' }
];

/* Utilidades de datos */
export function buscarGlosario(id) {
    return GLOSARIO.find((g) => g.id === id) || null;
}

export function datosDeCuerpo(id) {
    return CUERPOS.find((c) => c.id === id) || null;
}

export function todasLasPreguntas() {
    const propias = CUERPOS.flatMap((c) => c.quiz.map((q) => ({ ...q, origen: c.nombre })));
    return [...DESAFIO.map((q) => ({ ...q, origen: 'General' })), ...propias];
}
