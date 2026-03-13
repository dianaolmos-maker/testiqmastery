// ================== HEADER ==================

// Función para crear el header con logo (1 sola vez, fijo)
function createHeader() {
    const existing = document.querySelector('.header-logo');
    if (existing) return existing;

    const header = document.createElement('div');
    header.className = 'header-logo';

    const logoUrl = 'Logo_Mastery_PNG-05.png';

    header.innerHTML = `
        <img src="${logoUrl}" alt="Logo Empresa" class="logo-img">
    `;

    document.body.appendChild(header);

    const img = header.querySelector('.logo-img');
    if (img) {
        if (img.complete) applyHeaderOffset();
        else img.addEventListener('load', applyHeaderOffset);
    } else {
        setTimeout(applyHeaderOffset, 50);
    }

    return header;
}

/**
 * Ajusta automáticamente el espacio superior del contenido
 * para que nunca se monte debajo del logo fijo.
 */
function applyHeaderOffset() {
    const header = document.querySelector('.header-logo');
    if (!header) return;

    const rect = header.getBoundingClientRect();
    const topPx = parseFloat(getComputedStyle(header).top) || 0;

    const offset = Math.ceil(topPx + rect.height + 12);
    const finalOffset = Math.max(90, Math.min(offset, 180));

    document.documentElement.style.setProperty('--top-offset', `${finalOffset}px`);
}

// Función para resaltar "IQ", "negocio", "negocios" y "founder" donde aparezcan como palabras completas
function highlightIQ(text) {
    if (!text) return '';
    return String(text)
        .replace(/\bIQ\b/g, '<span class="purple-iq">IQ</span>')
        .replace(/\bnegocios?\b/gi, '<span class="gradient-word">$&</span>')
        .replace(/\bfounder\b/gi, '<span class="gradient-word">founder</span>');
}


// Resaltado SOLO para la pantalla results15 (no afecta otras pantallas)
function highlightResults15(text) {
    if (!text) return '';
    // 1) aplica el resaltado base (IQ, negocios, founder)
    let html = highlightIQ(text);

    // 2) resalta palabras clave SOLO en results15
    html = html.replace(/\b(perfil|index|estado)\b/gi, (match) => {
        return `<span class="results15-purple">${match}</span>`;
    });

    return html;
}

window.addEventListener('resize', applyHeaderOffset);



// ================== DATA ==================

// Variables globales
let currentPage = 1;
let totalPages = 16;
let score = 0;
let answers = [];
let latestResults = null; // guarda el cálculo final para la página de resultados

// Valores de las respuestas
const answerValues = {
    'A': 4,
    'B': 3,
    'C': 5,
    'D': 2
};

// Perfiles y rangos
const profiles = {
    'A': {
        name: 'Operativo',
        range: '18 – 24',
        status: 'Crecimiento reactivo'
    },
    'B': {
        name: 'Intuitivo',
        range: '25 – 31',
        status: 'Avance inestable'
    },
    'C': {
        name: 'Estratégico Parcial',
        range: '32 – 38',
        status: 'Estructura en transición'
    },
    'D': {
        name: 'Estratégico Escalable',
        range: '39 – 45',
        status: 'Base escalable'
    }
};

// Datos de cada página
const pageData = {
    1: {
        type: 'intro',
        title: 'Vertical IQ',
        subtitle: 'Una experiencia para entender si estás diseñado para crecer.',
        paragraph: 'Vertical IQ no mide conocimientos ni experiencia previa. Observa patrones de decisión, criterio bajo presión y cómo interpretas la complejidad real de tu negocio.',
        disclaimer: 'Al finalizar, recibirás tu Vertical IQ Index, una lectura estratégica que identifica los límites reales de tu crecimiento actual, por qué se están produciendo y qué tipo de corrección estructural requieren. No hay respuestas correctas o incorrectas. Hay patrones.'
    },
    2: {
        type: 'question',
        title: 'Negocios con los mismos recursos pueden crecer distintamente. La diferencia casi nunca es la idea. Es la forma en que el founder (emprendedor) interpreta lo que ocurre.',
        paragraph: 'Cuando algo en tu negocio deja de funcionar como esperabas, tu reacción suele ser:',
        optionsType: 'text',
        options: [
            'Trabajo más duro para compensar',
            'Busco entender qué parte del sistema falló',
            'Cambio de estrategia rápidamente',
            'Espero a tener información antes de moverme'
        ]
    },
3: {
        type: 'question',
        title: 'Cuando tu negocio empieza a crecer, ¿qué suele pasar contigo dentro de la operación?',
        paragraph: 'A medida que un negocio crece, la forma en que el founder (emprendedor) se involucra suele determinar si ese crecimiento se sostiene… o se rompe.',
        optionsType: 'text',
        options: [
            'Termino involucrándome en más cosas para que no se descontrole',
            'Intento ordenar procesos, pero sigo siendo el punto de referencia',
            'Delego, aunque no siempre con claridad',
            'Diseño sistemas para no ser el cuello de botella'
        ]
},
    4: {
    type: 'question',
    title: 'No pienses en tu negocio… todavía.',
    subtitle: '',
    paragraph: 'Elige la representación que más se parece a cómo organizas problemas complejos en tu mente.',
    optionsType: 'image', 
        options: [
        'pregunta4opcionA.png',
        'pregunta4opcionB.png',
        'pregunta4opcionC.png',
    ]
},
    5: {
        type: 'progress',
        title: 'Interesante...',
        subtitle: 'Tu forma de pensar no es común.',
        paragraph: 'La mayoría de los founders nunca se detiene a observar cómo estructura los problemas en su mente. Eso explica por qué muchos negocios avanzan… pero no logran sostener el crecimiento.',
        progress: 35
    },
    6: {
        type: 'question',
        title: 'Cuando tu negocio exige más de lo que puedes manejar…',
        subtitle: 'No es falta de trabajo ni es falta de intención. Es el momento en que el negocio se mueve más rápido que tu capacidad de pensar, entonces:',
        paragraph: '',
        optionsType: 'text',
        options: [
            'Empiezo a sentir que todo depende de mí.',
            'Tengo muchas ideas, me cuesta decidir cuál es la correcta.',
            'Sé que algo estructural falta, no tengo claro qué.',
            'Empiezo a notar que el modelo no escala igual que antes.'
        ]
    },
    7: {
        type: 'question',
        title: 'Observa con atención.',
        paragraph: 'Elige la imagen que más se relacione contigo:',
        optionsType: 'image',
        options: [
            'pregunta7opcionA.png',
            'pregunta7opcionB.png',
            'pregunta7opcionC.png',
    ]
},
    8: {
        type: 'question',
        title: 'Cuando piensas en el siguiente nivel de tu negocio…',
        paragraph: 'Lo que más pesa en tus decisiones es:',
        optionsType: 'text',
        options: [
            'No romper lo que ya funciona.',
            'Encontrar la siguiente palanca de crecimiento.',
            'Evitar errores costosos.',
            'Diseñar algo que no dependa tanto de mí.'
        ]
    },
    9: {
        type: 'question',
        title: '¿Cuál de estas frases se acerca más a tu realidad actual?',
        subtitle: '',
        paragraph: 'Tu negocio funciona mejor cuando tú…',
        optionsType: 'text',
        options: [
            'Estás presente en casi todas las decisiones clave.',
            'Puedes ausentarte un poco, pero ciertas cosas se frenan.',
            'El negocio sigue funcionando, aunque no estés en el día a día.',
            'El sistema ya no depende directamente de ti para crecer'
        ]
    },
    10: {
        type: 'progress',
        title: 'Cuando un negocio empieza a exigir más estructura, el límite no suele ser la idea, ni el esfuerzo.',
        subtitle: 'Suele aparecer en cómo se toman las decisiones y en qué tan diseñado está el sistema para crecer sin fricción.',
        paragraph: '',
        progress: 75
    },
    11: {
        type: 'question',
        title: 'Cuando tienes que tomar una decisión importante sin tener toda la información…',
        subtitle: 'Lo que más guía tu decisión suele ser:',
        paragraph: '',
        optionsType: 'text',
        options: [
            'Analizas todo lo posible y postergas hasta sentir más certeza.',
            'Confias en tu experiencia previa y ajustas sobre la marcha.',
            'Diseñas una decisión reversible para limitar el riesgo.',
            'Avanzas rápido y corriges después, incluso si el error es costoso.'
        ]
    },
    12: {
        type: 'question',
        title: 'Imagina tu negocio en dos o tres años…',
        subtitle: '',
        paragraph: 'Lo que aparece en tu mente es:',
        optionsType: 'text',
        options: [
            'Un número específico: ingresos, tamaño o facturación.',
            'Un estilo de vida distinto al actual.',
            'Un modelo de negocio más estructurado y replicable.',
            'Un sistema que funciona incluso si yo no estoy.'
        ]
    },
    13: {
        type: 'progress',
        title: 'Vertical IQ no es solo un test. Es un índice de cómo estás diseñado para crecer.',
        subtitle: 'A lo largo de esta experiencia no se midieron respuestas correctas o incorrectas. Se observaron patrones de decisión, criterio bajo presión y cómo interpretas la complejidad real de tu negocio hoy.',
        paragraph: 'A partir de estas variables, Vertical IQ genera un índice que refleja tu posición actual frente a la escalabilidad real.',
        disclaimer: 'Tu resultado ya está calculado.',
        progress: 100
    },
    14: {
        type: 'form-page',
        title: '¡Tu resultado está listo!',
        subtitle: 'Queremos asegurarnos de que puedas conservarlo y volver a consultarlo cuando lo necesites.',
        paragraph: 'Te lo mostraremos ahora mismo y también te lo enviaremos para que lo tengas guardado.',
        },
    15: {
        type: 'results',
        title: 'negocio.',
        progress: 100
    },
    16: {
        type: 'results-2',
        title: 'negocios',
        progress: 100
    }
};

// ================== APP ==================

function initApp() {
    createHeader();
    showPage(currentPage);
    setTimeout(applyHeaderOffset, 0);
}

function showPage(pageNumber) {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const page = pageData[pageNumber];

    createHeader();

    if (page.type === 'intro') {
        app.appendChild(createIntroPage(page));
    } else if (page.type === 'question') {
        app.appendChild(createQuestionPage(page, pageNumber));
    } else if (page.type === 'progress') {
        app.appendChild(createProgressPage(page));
    } else if (page.type === 'form-page') {
        app.appendChild(createFormPage(page));
    } else if (page.type === 'results') {
        app.appendChild(createResultsPage15());
    } else if (page.type === 'results-2') {
        app.appendChild(createResultsPage16());
}

    setTimeout(applyHeaderOffset, 0);
}

// ================== PAGES ==================

function createIntroPage(page) {
    const container = document.createElement('div');
    container.className = 'page active page-intro';

    const content = document.createElement('div');
    content.innerHTML = `
        <h1>${highlightIQ(page.title)}</h1>
        <h2>${highlightIQ(page.subtitle)}</h2>
        <h3>${highlightIQ(page.paragraph)}</h3>
        <p class="intro-disclaimer">${page.disclaimer || ''}</p>

        <div class="button-container">
            <button class="btn" onclick="startTest()">INICIAR EVALUACIÓN</button>
        </div>
    `;

    container.appendChild(content);
    return container;
}

function createQuestionPage(page, pageNumber) {
    const container = document.createElement('div');
    container.className = 'page active page-question';

    const subtitleHTML = page.subtitle && page.subtitle.trim().length
        ? `<h3 class="screen-subtitle">${page.subtitle}</h3>`
        : '';

    const content = document.createElement('div');
    content.innerHTML = `
        <h2 class="screen-title">${highlightIQ(page.title)}</h2>
        ${subtitleHTML}
        <p class="screen-paragraph">${highlightIQ(page.paragraph)}</p>

        <div class="options-container" id="options-container"></div>
    `;

    container.appendChild(content);

    const optionsContainer = content.querySelector('#options-container');
    const optionLabels = ['A', 'B', 'C', 'D'];

    const optionsType = page.optionsType || (Array.isArray(page.options) ? 'text' : 'image');
    optionsContainer.classList.add(optionsType === 'text' ? 'options--text' : 'options--image');
    const optionsText = Array.isArray(page.options) ? page.options : [];

    // Ajustar etiquetas según el número de opciones disponibles
    const labels = optionLabels.slice(0, optionsText.length);

    labels.forEach((label, index) => {
        const option = document.createElement('div');
        option.className = 'option';
        option.dataset.value = label;
        option.dataset.page = pageNumber;

        option.classList.add(optionsType === 'text' ? 'option--text' : 'option--image');

        if (optionsType === 'text') {
            const title = optionsText[index] || `Opción ${label}`;
            option.innerHTML = `
                <div class="option-copy">
                    <div class="option-title">${title}</div>
                </div>
            `;
        } else {
            option.innerHTML = `
                <div class="option-image">
                    <img src="${optionsText[index]}" alt="Opción ${label}" />
                </div>
            `;
        }

        option.onclick = () => selectOption(option, label, pageNumber);
        optionsContainer.appendChild(option);
    });

    return container;
}

function createProgressPage(page) {
    const container = document.createElement('div');
    container.className = 'page active page-progress';

    // Agregar un título h1 para la pantalla de progreso (similar a la pantalla de introducción)
    const titleHTML = `<h1 class="screen-title">${highlightIQ(page.title)}</h1>`;

    // Agregar un subtítulo h2 (si existe)
    const subtitleHTML = page.subtitle && page.subtitle.trim().length
        ? `<h2 class="screen-subtitle">${page.subtitle}</h2>`
        : '';

    // Agregar párrafo h3 (si existe)
    const paragraphHTML = page.paragraph && page.paragraph.trim().length
        ? `<h3 class="screen-paragraph">${page.paragraph}</h3>`
        : '';

    // Agregar el disclaimer (p)
    const disclaimerHTML = page.disclaimer && page.disclaimer.trim().length
        ? `<p class="disclaimer-text">${page.disclaimer}</p>`
        : '';

    // Crear el contenido
    const content = document.createElement('div');
    content.innerHTML = `
        ${titleHTML}
        ${subtitleHTML}
        ${paragraphHTML}
        ${disclaimerHTML}

        <div class="progress-container">
            <div class="progress-bar" id="progress-bar"></div>
        </div>

        <div class="progress-percent" id="progress-percent">0%</div>

        <div class="button-container">
            <button class="btn" onclick="nextPage()">CONTINUAR</button>
        </div>
    `;

    container.appendChild(content);

    // Actualizar el ancho de la barra de progreso
setTimeout(() => {
    const progressBar = content.querySelector('#progress-bar');
    if (progressBar) progressBar.style.width = `${page.progress}%`;

    const progressPercent = content.querySelector('#progress-percent');
    if (progressPercent) progressPercent.textContent = `${page.progress}%`;
}, 100);

    return container;
}

function createFormPage(page) {
    const container = document.createElement('div');
    container.className = 'page active form-page';

    const subtitleHTML = page.subtitle && page.subtitle.trim().length
        ? `<h3 class="screen-subtitle">${page.subtitle}</h3>`
        : '';

    const content = document.createElement('div');
    content.innerHTML = `
        <h2 class="screen-title">${highlightIQ(page.title)}</h2>
        ${subtitleHTML}
        <p class="screen-paragraph">${highlightIQ(page.paragraph)}</p>

        <div class="ghl-form-container">
            <div class="ghl-form">
                <div class="form-group">
                    <label for="ghl-name">Nombre completo *</label>
                    <input type="text" id="ghl-name" placeholder="Ej: María González" required>
                </div>
                <div class="form-group">
                    <label for="ghl-email">Correo electrónico *</label>
                    <input type="email" id="ghl-email" placeholder="ejemplo@empresa.com" required>
                    <p id="email-error" class="error-message" style="display: none; color: #ff6b6b; font-size: 0.9rem; margin-top: 5px;">
                        ❌ Por favor ingresa un email válido
                    </p>
                </div>
                <div class="form-group">
                    <label for="ghl-phone">Teléfono *</label>
                    <input type="tel" id="ghl-phone" placeholder="+57 300 1234567 o +1 555 1234567">
                    <p id="phone-error" class="error-message" style="display: none; color: #ff6b6b; font-size: 0.9rem; margin-top: 5px;">
                        ❌ Formato válido: Colombia (+57) o USA (+1)
                    </p>
                </div>

                <div class="button-container" style="margin-top: 30px;">
                    <button id="submit-results-btn" class="btn" disabled
                            style="opacity: 0.6; cursor: not-allowed;">
                        VER MIS RESULTADOS
                    </button>
                </div>

                <p style="font-size: 0.7rem; color: #5a5a5a; text-align: center; margin-top: 15px;">
                    Tus datos están seguros. Los usaremos para enviarte tu análisis.
                </p>
            </div>
        </div>

        <!-- Barra de progreso eliminada en la página de formulario -->
    `;

    container.appendChild(content);

    setTimeout(() => {
        initFormValidation();
    }, 100);

    return container;
}

// ================= VALIDACIÓN FORM =================

function initFormValidation() {
    const emailInput = document.getElementById('ghl-email');
    const phoneInput = document.getElementById('ghl-phone');
    const submitBtn = document.getElementById('submit-results-btn');

    if (!emailInput || !submitBtn) return;

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
        if (!phone || phone.trim() === '') return true;
        const clean = phone.replace(/\s+/g, '').replace(/[()-]/g, '');
        const co = /^(\+57)?3\d{9}$/;
        const us = /^(\+1)?\d{10}$/;
        return co.test(clean) || us.test(clean);
    }

    function showError(id, show) {
        const el = document.getElementById(id);
        if (el) el.style.display = show ? 'block' : 'none';
    }

    function checkFormValidity() {
        const email = emailInput.value;
        const phone = phoneInput ? phoneInput.value : '';
        const name = document.getElementById('ghl-name')?.value || '';

        const okEmail = isValidEmail(email);
        const okPhone = isValidPhone(phone);
        const okName = name.trim().length > 0;

        showError('email-error', !okEmail && email.length > 0);
        if (phoneInput) showError('phone-error', !okPhone && phone.length > 0);

        if (okEmail && okPhone && okName) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        } else {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.6';
            submitBtn.style.cursor = 'not-allowed';
        }
    }

    emailInput.addEventListener('input', checkFormValidity);
    emailInput.addEventListener('blur', checkFormValidity);

    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            let value = this.value.replace(/\D/g, '');

            if (value.startsWith('57') && value.length > 2) {
                value = '+57 ' + value.substring(2, 5) + ' ' + value.substring(5, 8) + ' ' + value.substring(8, 12);
            } else if (value.startsWith('1') && value.length > 1) {
                value = '+1 ' + value.substring(1, 4) + ' ' + value.substring(4, 7) + ' ' + value.substring(7, 11);
            } else if (value.length > 0) {
                value = '+' + value;
            }

            this.value = value.trim();
            checkFormValidity();
        });

        phoneInput.addEventListener('blur', checkFormValidity);
    }

    document.getElementById('ghl-name')?.addEventListener('input', checkFormValidity);

    submitBtn.addEventListener('click', function () {
        if (!this.disabled) submitAndShowResults();
    });
}

// ================= RESULTADOS =================

function createResultsPage15() {
  const container = document.createElement('div');
  container.className = 'page active page-results-15';

  const r = latestResults || calcularResultados();
  const profile = profiles?.[r.profileCode];

  const chipText = profile?.status || 'Estado';
  const teaserText = 'Este resultado explica por qué tu crecimiento se detiene donde se detiene. En la siguiente pantalla verás exactamente qué significa.';

const content = document.createElement('div');
content.className = 'results15-wrap';

content.innerHTML = `
    <div class="results15-card">
    <div class="results15-title">
        <div class="results15-title-pre">
        ${highlightResults15('Tu Vertical IQ Index es:')}
        </div>

        <!-- GAUGE CIRCULAR -->
        <div class="results15-gauge">
        <svg viewBox="0 0 200 120" class="gauge-svg">
            <!-- Fondo gris -->
            <path d="M 20 100 A 80 80 0 0 1 180 100" 
                fill="none" stroke="#e0e0e0" stroke-width="12" stroke-linecap="round"/>
            <!-- Barra de progreso -->
            <path d="M 20 100 A 80 80 0 0 1 180 100" 
                fill="none" stroke="url(#gaugeGradient)" stroke-width="12" 
                stroke-linecap="round" class="gauge-progress"
                style="stroke-dasharray: 251; stroke-dashoffset: 251;"/>
            <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#7a2394;stop-opacity:1" />
                <stop offset="70%" style="stop-color:#ff6347;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#ffa51f;stop-opacity:1" />
            </linearGradient>
            </defs>
        </svg>
        <div class="gauge-text">
            <div class="gauge-value">${r.score}</div>
        </div>
        </div>

        <div class="results15-midtitle">
        ${highlightResults15('Este puntaje corresponde al perfil:')}
        </div>

        <div class="results15-title-top">
        ${highlightIQ(profile?.name || 'Perfil')}
        </div>
      </div>

      <div class="results15-status-wrap">
        <div class="results15-status-label">${highlightResults15('Tu estado es:')}</div>
        <p class="results15-status">${highlightIQ(chipText)}</p>
      </div>

      <p class="results15-teaser">
        ${highlightIQ(teaserText)}
      </p>
    </div>

    <div class="results15-actions">
      <button class="btn results15-btn" onclick="nextPage()">CONTINUAR</button>
    </div>
  `;

  container.appendChild(content);

  // Animar el gauge después de que el DOM esté listo
  setTimeout(() => {
    const gaugePath = content.querySelector('.gauge-progress');
    if (gaugePath) {
      const maxScore = 75;
      const percentage = Math.min(r.score / maxScore, 1);
      const circumference = 251;
      const offset = circumference * (1 - percentage);
      gaugePath.style.strokeDashoffset = offset;
    }
  }, 100);

  return container;
}

function createResultsPage16() {
  const container = document.createElement('div');
  container.className = 'page active page-results-16';

  const r = latestResults || calcularResultados();
  const profile = profiles?.[r.profileCode];

  // ✅ Contenido exacto por perfil (el que me pasaste)
  const byProfile = {
    A: {
      lectura:
        'Tu resultado indica que el crecimiento de tu negocio está siendo gestionado principalmente desde la urgencia operativa. Las decisiones se toman para resolver lo inmediato, no para construir estructura.',
      interpretacion:
        'Esto suele generar una sensación constante de esfuerzo, desgaste y presión. El negocio avanza, pero depende excesivamente de tu presencia, tu energía y tu capacidad de reacción diaria.',
      brecha:
        'En este nivel, el límite del crecimiento no es el mercado, sino la falta de un diseño que permita avanzar sin apagar incendios todo el tiempo. Sin estructura, el esfuerzo no se convierte en escalabilidad.'
    },
    B: {
      lectura:
        'Tu Vertical IQ muestra un perfil con buen instinto y visión, pero con poca sistematización. Las decisiones suelen basarse en intuición más que en un marco claro de prioridades y procesos.',
      interpretacion:
        'Este tipo de perfil logra avances importantes, pero de forma irregular. Hay momentos de crecimiento y momentos de estancamiento, generalmente porque el negocio no tiene una estructura que sostenga lo que se construye.',
      brecha:
        'Aquí el riesgo no es la falta de ideas, sino la ausencia de un sistema que transforme la intuición en crecimiento predecible y repetible.'
    },
    C: {
      lectura:
        'Tu resultado refleja que ya existe pensamiento estratégico y una comprensión clara de que el crecimiento no depende solo del esfuerzo, sino del diseño del negocio.',
      interpretacion:
        'Sin embargo, el sistema aún depende en exceso de ti. Hay estructura en algunas áreas, pero no de forma integral, lo que limita la velocidad y la estabilidad del crecimiento.',
      brecha:
        'En este punto, el negocio suele tener potencial real, pero necesita orden, prioridades claras y un diseño coherente para dejar de crecer “a empujones” y empezar a escalar con control.'
    },
    D: {
      lectura:
        'Tu Vertical IQ indica un perfil con pensamiento sistémico, criterio estratégico y capacidad para diseñar crecimiento antes de ejecutarlo.',
      interpretacion:
        'Este nivel refleja claridad en la toma de decisiones, entendimiento del negocio como sistema y una menor dependencia de la operación diaria para avanzar.',
      brecha:
        'Aquí, el reto no suele ser “qué hacer”, sino cómo optimizar, ordenar y acelerar sin perder control ni enfoque. La escalabilidad es posible, pero requiere precisión.'
    }
  };

  // ✅ Slide 4: texto fijo Mastery (ajústalo a tu copy final)
    const masteryFixed =
    'Por eso, muchos founders en este punto optan por una <span class="purple-cta">conversación estratégica breve</span>, para confirmar si lo que están viendo aquí realmente aplica a su caso específico.';

  const data = byProfile[r.profileCode] || byProfile.A;

  const slides = [
    { title: 'Lectura estratégica', body: data.lectura },
    { title: 'Interpretación clave', body: data.interpretacion },
    { title: 'Brecha implícita', body: data.brecha },
    { title: 'Cuando el Vertical IQ se encuentra en este rango, el siguiente paso es entender exactamente qué cambiar y en qué orden', body: masteryFixed }
  ];

  let currentSlide = 0;

  const content = document.createElement('div');
  content.className = 'results16-wrap';

  // 👇 Reuso de look de la 15 (si quieres el mismo fondo/sombra/bordes)
  content.innerHTML = `
    <div class="results15-card results16-card">
      <div class="results16-carousel-header">
        <button class="results16-nav results16-prev" type="button" aria-label="Anterior">‹</button>
        <div class="results16-progress-wrapper">
  <div class="results16-progress">
    <span class="results16-progress-current">1</span>/<span class="results16-progress-total">4</span>
  </div>
  <div class="results16-progress-bar">
    <div class="results16-progress-fill"></div>
  </div>
</div>
        <button class="results16-nav results16-next" type="button" aria-label="Siguiente">›</button>
      </div>

      <div class="results16-slide">
        <h2 class="results16-slide-title"></h2>
        <p class="results16-slide-text"></p>
      </div>
    </div>

    <div class="results16-actions">
  <button class="btn results15-btn" id="results16-continue">
    EVALUAR MI CASO CON UN ESTRATEGA
  </button>

  <p class="results16-disclaimer">
    Conversación de diagnóstico sin costo (45–60 min). 
    No es una llamada de ventas. 
    Solo para founders en operación.
  </p>

  <button class="results16-link" type="button" onclick="prevPage()">Volver</button>
</div>
  `;

  const titleEl = content.querySelector('.results16-slide-title');
  const textEl = content.querySelector('.results16-slide-text');
  const currentEl = content.querySelector('.results16-progress-current');
  const totalEl = content.querySelector('.results16-progress-total');
  const progressFill = content.querySelector('.results16-progress-fill');
  const prevBtn = content.querySelector('.results16-prev');
  const nextBtn = content.querySelector('.results16-next');
  const continueBtn = content.querySelector('#results16-continue');
  const disclaimerEl = content.querySelector('.results16-disclaimer');

  totalEl.textContent = String(slides.length);

  function renderSlide() {
    const s = slides[currentSlide];

    titleEl.innerHTML = highlightIQ(s.title);
    textEl.innerHTML = highlightIQ(s.body);
    currentEl.textContent = String(currentSlide + 1);
    const progressPercent = ((currentSlide + 1) / slides.length) * 100;
if (progressFill) progressFill.style.width = `${progressPercent}%`;

    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === slides.length - 1;

    const isLastSlide = currentSlide === slides.length - 1;

    continueBtn.textContent = isLastSlide
        ? 'EVALUAR MI CASO CON UN ESTRATEGA'
        : 'CONTINUAR';

    // 👇 Mostrar disclaimer solo en 4/4
    disclaimerEl.style.display = isLastSlide ? 'block' : 'none';
}

  prevBtn.addEventListener('click', () => {
    if (currentSlide > 0) {
      currentSlide--;
      renderSlide();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      renderSlide();
    }
  });

  // *** CAMBIO AQUÍ: Botón final redirige al calendario ***
  continueBtn.addEventListener('click', () => {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      renderSlide();
    } else {
      // Reemplaza con la URL de calendario correcta
      const calendarioURL = 'https://www.taskifydco.com/widget/booking/TivcYyJdqOWBGKhGTIi9'; // <--- CAMBIA ESTA URL
      window.open(calendarioURL, '_blank'); // Abre en nueva pestaña
      // Si quieres que redirija en la misma pestaña: window.location.href = calendarioURL;
    }
  });

  renderSlide();
  container.appendChild(content);
  return container;
}

// ================= WEBHOOK =================

// *** CAMBIO AQUÍ: Nueva URL del webhook ***
const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/W602heI1rkidSvaFESri/webhook-trigger/a47cf295-47d7-49ca-ad20-3d8eb6d6db2c'; // <--- REEMPLAZA CON LA NUEVA URL

async function submitAndShowResults() {
    const name = document.getElementById('ghl-name')?.value || '';
    const email = document.getElementById('ghl-email')?.value || '';
    const phone = document.getElementById('ghl-phone')?.value || '';

    if (!name || !email) {
        alert('❌ Por favor completa nombre y email');
        return;
    }

    // Calcula resultados y guarda en latestResults
    latestResults = calcularResultados();

    // Datos para enviar a GHL
    const datosGHL = {
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || '',
        email: email,
        phone: phone,
        score: latestResults.score,          // <--- CORREGIDO: usar latestResults
        perfil: latestResults.perfil,
        rango: latestResults.rango,
        profileCode: latestResults.profileCode
    };

    console.log('📤 Enviando datos a GHL:', datosGHL);

    try {
        const enviado = await enviarAGHL(datosGHL);

        if (enviado) {
            console.log('✅ Webhook exitoso');
            // Ir a página de resultados (15) solo después de envío exitoso
            currentPage = 15;
            showPage(currentPage);
        } else {
            alert('⚠️ Hubo un error al guardar tus datos. Intenta de nuevo.');
        }
    } catch (error) {
        console.error('❌ Error en envío:', error);
        alert('⚠️ Error de conexión. Intenta de nuevo.');
    }
}

async function enviarAGHL(datos) {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        return response.ok;
    } catch (error) {
        console.error('Error en fetch:', error);
        return false;
    }
}

function calcularResultados() {
    let totalScore = 0;

    answers.forEach(answer => {
        if (answer && answerValues[answer]) totalScore += answerValues[answer];
    });

    const respuestasContestadas = answers.filter(a => a).length;
    if (respuestasContestadas < 5) totalScore = Math.floor(Math.random() * 30) + 40;

    let profileCode = 'D';
    let perfil = 'Escalable';
    let rango = '39 – 45';

    if (totalScore >= 35 && totalScore <= 49) {
        profileCode = 'A';
        perfil = 'Operativo';
        rango = '18 – 24';
    } else if (totalScore >= 50 && totalScore <= 59) {
        profileCode = 'B';
        perfil = 'Intuitivo';
        rango = '21 – 35';
    } else if (totalScore >= 60 && totalScore <= 69) {
        profileCode = 'C';
        perfil = 'Estratégico parcial';
        rango = '32 – 38';
    }

    return { score: totalScore, perfil, rango, profileCode };
}

// ================= NAV =================

function selectOption(optionElement, answer, pageNumber) {
    const options = document.querySelectorAll('.option');
    options.forEach(opt => {
        if (opt.dataset.page == pageNumber) opt.classList.remove('selected');
    });

    optionElement.classList.add('selected');
    answers[pageNumber - 1] = answer;

    setTimeout(() => {
        nextPage();
    }, 500);
}

function startTest() {
    currentPage = 2;
    showPage(currentPage);
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        showPage(currentPage);
    }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    showPage(currentPage);
  }
}

function restartTest() {
    currentPage = 1;
    score = 0;
    answers = [];
    showPage(currentPage);
}

document.addEventListener('DOMContentLoaded', initApp);

