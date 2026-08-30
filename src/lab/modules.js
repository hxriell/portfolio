/* Lab modules — vanilla, invoked only from /lab */
export function bootLabModules() {
    initLabTabs();
    initWebInteraction();
    init3DCube();
    initCrypto();
    initWebIDE();
    initMarketAI();
    initNeuralNet();
    initTerminal2();
    initPhysics2();
    initGameProto();
    initAlgoVisualizer();
    initTicTacToe();
    initJSONFormatter();
    initMusicVisualizer();
    initWeatherDashboard();
}

/* =========================================
   1. Tech Background (Circuit / Data Flow)
   ========================================= */
function initCircuitBoard() {
    const canvas = document.getElementById('particles-js');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const config = {
        nodeCount: reduceMotion ? 20 : 40,
        connectionDistance: 150,
        speed: reduceMotion ? 0 : 2,
        color: '#00e5f0'
    };

    class CircuitNode {
        constructor() {
            this.init();
        }

        init() {
            this.x = Math.floor(Math.random() * canvas.width);
            this.y = Math.floor(Math.random() * canvas.height);
            this.x = Math.round(this.x / 20) * 20;
            this.y = Math.round(this.y / 20) * 20;
            this.direction = Math.floor(Math.random() * 4);
            this.steps = 0;
            this.maxSteps = Math.floor(Math.random() * 20) + 10;
        }

        update() {
            if (config.speed === 0) return;
            if (this.direction === 0) this.y -= config.speed;
            if (this.direction === 1) this.x += config.speed;
            if (this.direction === 2) this.y += config.speed;
            if (this.direction === 3) this.x -= config.speed;

            this.steps++;

            if (this.steps >= this.maxSteps || Math.random() < 0.02) {
                this.changeDirection();
            }

            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }

        changeDirection() {
            if (this.direction === 0 || this.direction === 2) {
                this.direction = Math.random() > 0.5 ? 1 : 3;
            } else {
                this.direction = Math.random() > 0.5 ? 0 : 2;
            }
            this.steps = 0;
            this.maxSteps = Math.floor(Math.random() * 20) + 10;
        }

        draw() {
            ctx.fillStyle = config.color;
            ctx.fillRect(this.x, this.y, 3, 3);
        }
    }

    const nodes = [];
    for (let i = 0; i < config.nodeCount; i++) {
        nodes.push(new CircuitNode());
    }

    function drawFrame() {
        if (reduceMotion) {
            ctx.fillStyle = 'rgba(5, 5, 5, 1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        nodes.forEach(node => {
            node.update();
            node.draw();
        });

        ctx.strokeStyle = 'rgba(0, 229, 240, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                }
            }
        }
        ctx.stroke();
    }

    if (reduceMotion) {
        drawFrame();
        window.addEventListener('resize', drawFrame);
        return;
    }

    function animate() {
        drawFrame();
        requestAnimationFrame(animate);
    }

    animate();
}

/* =========================================
   2. Core Utilities (Scroll, Nav, Lab Tabs)
   ========================================= */
function initScrollReveal() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section, .project-card, .service-card').forEach(section => {
        section.classList.add('reveal-ready');
        observer.observe(section);
    });
}

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (!hamburger || !navLinks) return;

    function closeMenu() {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Ouvrir le menu');
        document.body.classList.remove('menu-open');
    }

    function openMenu() {
        navLinks.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', 'Fermer le menu');
        document.body.classList.add('menu-open');
    }

    hamburger.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) {
            closeMenu();
            hamburger.focus();
        }
    });

    window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => {
        if (e.matches) closeMenu();
    });
}

function resizeLabCanvases() {
    document.querySelectorAll('#lab canvas').forEach(canvas => {
        const parent = canvas.parentElement;
        if (!parent) return;
        const w = parent.clientWidth;
        const h = parent.clientHeight || 200;
        if (w > 0 && (canvas.width !== w || canvas.height !== h)) {
            canvas.width = w;
            canvas.height = h;
        }
    });
    window.dispatchEvent(new Event('lab-panel-shown'));
}

function initLabTabs() {
    const tablist = document.querySelector('.lab-tablist');
    if (!tablist) return;

    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls'))).filter(Boolean);

    function activateTab(nextTab) {
        tabs.forEach(tab => {
            const selected = tab === nextTab;
            tab.setAttribute('aria-selected', selected ? 'true' : 'false');
            tab.tabIndex = selected ? 0 : -1;
        });

        panels.forEach(panel => {
            const isActive = panel.id === nextTab.getAttribute('aria-controls');
            if (isActive) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
        });

        requestAnimationFrame(() => resizeLabCanvases());
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => activateTab(tab));
        tab.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activateTab(tab);
            }
            const idx = tabs.indexOf(tab);
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const next = tabs[(idx + 1) % tabs.length];
                next.focus();
                activateTab(next);
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
                prev.focus();
                activateTab(prev);
            }
        });
    });

    const selected = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
    if (selected) activateTab(selected);
}

function initScrollSpy() {
    const sections = document.querySelectorAll('#home, #about, #services, #projects, #lab, #education, #contact');
    const links = document.querySelectorAll('.nav-links a');
    const navbar = document.querySelector('.navbar');
    if (!sections.length || !links.length) return;

    function onScroll() {
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 40);
        }

        const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;
        let current = nearBottom ? 'contact' : sections[0].id;

        if (!nearBottom) {
            sections.forEach(section => {
                const top = section.getBoundingClientRect().top;
                if (top <= 120) current = section.id;
            });
        }

        links.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${current}`);
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}


/* =========================================
   3. ORIGINAL MINI-MODULES INTERACTIVITY
   ========================================= */

/* =========================================
   3. ORIGINAL MINI-MODULES INTERACTIVITY
   ========================================= */

// Define functions globally
window.changeColor = function () {
    const box = document.getElementById('dynamic-box');
    const colors = ['#00f3ff', '#bc13fe', '#ff0055', '#ffff00', '#00ff88'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    box.style.backgroundColor = randomColor;
    box.style.color = '#000';
}

// Global Shape Index
let shapeIndex = 0;
window.changeShape = function () {
    const box = document.getElementById('dynamic-box');
    const shapes = [
        '0',           // Square
        '50%',         // Circle
        '10px',        // Rounded
        '50% 0 50% 0', // Leaf
        '100% 0 0 0'   // Teardrop
    ];

    shapeIndex = (shapeIndex + 1) % shapes.length;
    box.style.borderRadius = shapes[shapeIndex];
}

window.pulseAnim = function () {
    const box = document.getElementById('dynamic-box');
    // CSS Web Animations API
    box.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.2)' },
        { transform: 'scale(1)' }
    ], { duration: 300 });
}

window.spinAnim = function () {
    const box = document.getElementById('dynamic-box');
    box.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(360deg)' }
    ], { duration: 600, easing: 'ease-in-out' });
}

window.shakeAnim = function () {
    const box = document.getElementById('dynamic-box');
    box.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(0)' }
    ], { duration: 400 });
}

function initWebInteraction() {
    const box = document.getElementById('dynamic-box');
    if (box) {
        // Click triggers random effect
        box.addEventListener('click', () => {
            const effects = [window.changeColor, window.pulseAnim, window.spinAnim, window.shakeAnim];
            const randomEffect = effects[Math.floor(Math.random() * effects.length)];
            randomEffect();
        });
    }
}

function randomizeData() {
    const bars = document.querySelectorAll('.bar');
    bars.forEach(bar => {
        const height = Math.floor(Math.random() * 80) + 20;
        bar.style.height = height + '%';
        bar.querySelector('span').innerText = height + '%';
    });
}
window.randomizeData = randomizeData;

/* --- Cryptography Module --- */
let currentCipher = 'caesar';

function initCrypto() {
    const input = document.getElementById('crypto-input');
    const output = document.getElementById('crypto-output');
    if (!input || !output) return;

    input.addEventListener('input', () => {
        const text = input.value;
        if (text === '') {
            output.textContent = 'Message crypté apparaîtra ici...';
            output.style.color = '#555';
            return;
        }

        output.style.color = 'var(--accent-primary)';

        if (currentCipher === 'caesar') {
            output.textContent = caesarCipher(text, 3);
        } else if (currentCipher === 'base64') {
            try {
                output.textContent = btoa(unescape(encodeURIComponent(text)));
            } catch (err) {
                output.textContent = 'Encodage impossible pour ce texte.';
                output.style.color = 'var(--accent-detail)';
            }
        } else if (currentCipher === 'rot13') {
            output.textContent = rot13(text);
        }
    });
}

window.setCipher = function (cipher, evt) {
    currentCipher = cipher;

    document.querySelectorAll('#lab-crypto button').forEach(btn => {
        btn.classList.remove('active-cipher');
    });

    const target = (evt && evt.currentTarget) || (typeof event !== 'undefined' && event && event.target);
    if (target && target.classList) {
        target.classList.add('active-cipher');
    } else {
        const match = document.querySelector(`#lab-crypto button[data-cipher="${cipher}"]`);
        if (match) match.classList.add('active-cipher');
    }

    const input = document.getElementById('crypto-input');
    if (input) input.dispatchEvent(new Event('input'));
}

function caesarCipher(text, shift) {
    return text.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            const code = char.charCodeAt(0);
            const isUpperCase = code >= 65 && code <= 90;
            const base = isUpperCase ? 65 : 97;
            return String.fromCharCode(((code - base + shift) % 26) + base);
        }
        return char;
    }).join('');
}

function rot13(text) {
    return caesarCipher(text, 13);
}

/* --- 3D Cube Logic --- */
function init3DCube() {
    const container = document.querySelector('.scene-3d');
    const cube = document.querySelector('.cube');
    if (!container || !cube) return;

    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate center relative coordinates
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const dx = (x - cx) / cx; // -1 to 1
        const dy = (y - cy) / cy; // -1 to 1

        // Rotate based on mouse pos (max 180deg)
        const rotY = dx * 180;
        const rotX = -dy * 180;

        cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    // Reset on mouse leave
    container.addEventListener('mouseleave', () => {
        cube.style.transition = 'transform 0.5s ease';
        cube.style.transform = `rotateX(20deg) rotateY(20deg)`;
        setTimeout(() => {
            cube.style.transition = 'transform 0.1s linear';
        }, 500);
    });
}


/* =========================================
   4. ADVANCED MODULES IMPLEMENTATION
   ========================================= */

/* --- Module 1: Web IDE --- */
function initWebIDE() {
    const input = document.getElementById('code-input');
    const preview = document.getElementById('code-preview');
    if (!input || !preview) return;

    function updatePreview() {
        const code = input.value;
        preview.innerHTML = code;
    }

    input.addEventListener('input', updatePreview);
    updatePreview(); // Initial load
}


/* --- Module 2: AI Market Analyzer --- */
function initMarketAI() {
    const canvas = document.getElementById('market-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize needed for CSS dimensions
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    // Simulation State
    let price = 45000;
    let history = [];
    const maxDataPoints = 50;

    function generateData() {
        // Random Walk with drift
        const change = (Math.random() - 0.48) * 200; // Slight upward bias
        price += change;
        history.push(price);
        if (history.length > maxDataPoints) history.shift();
    }

    // Initialize with some data
    for (let i = 0; i < maxDataPoints; i++) generateData();

    function drawChart() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Find min/max for scaling
        const minFn = Math.min(...history);
        const maxFn = Math.max(...history);
        const range = maxFn - minFn;

        ctx.beginPath();
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2;

        for (let i = 0; i < history.length; i++) {
            const x = (i / (maxDataPoints - 1)) * canvas.width;
            const y = canvas.height - ((history[i] - minFn) / range) * (canvas.height - 20) - 10; // Padding

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw analysis overlay
        ctx.fillStyle = 'rgba(0, 243, 255, 0.1)';
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.fill();

        // Update Text
        const lastPrice = history[history.length - 1];
        const valEl = document.getElementById('market-value');
        const trendEl = document.getElementById('market-trend');

        if (valEl) valEl.innerText = `BTC: $${lastPrice.toFixed(2)}`;

        const change = history[history.length - 1] - history[history.length - 2];
        if (trendEl) {
            trendEl.innerText = change >= 0 ? `+${(Math.random() * 2).toFixed(2)}%` : `-${(Math.random() * 2).toFixed(2)}%`;
            trendEl.className = change >= 0 ? 'trending-up' : 'trending-down';
        }
    }

    setInterval(() => {
        generateData();
        drawChart();
    }, 100);
}


/* --- Module 3: Neural Network Visualizer --- */
function initNeuralNet() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Initial size
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    // Network definitions
    const layers = [3, 5, 4, 2]; // Nodes per layer
    const nodes = [];

    // Create Nodes
    const layerSpacing = canvas.width / (layers.length + 1);
    layers.forEach((count, layerIndex) => {
        const ySpacing = canvas.height / (count + 1);
        for (let i = 0; i < count; i++) {
            nodes.push({
                x: layerSpacing * (layerIndex + 1),
                y: ySpacing * (i + 1),
                layer: layerIndex,
                activation: Math.random()
            });
        }
    });

    let connections = [];
    // Create Connections
    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
            if (nodes[j].layer === nodes[i].layer + 1) {
                connections.push({
                    from: nodes[i],
                    to: nodes[j],
                    weight: Math.random(),
                    signal: 0 // For animation
                });
            }
        }
    }

    function animate() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Connections
        connections.forEach(conn => {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(188, 19, 254, ${0.2 + conn.signal})`;
            ctx.lineWidth = 1 + conn.signal * 2;
            ctx.moveTo(conn.from.x, conn.from.y);
            ctx.lineTo(conn.to.x, conn.to.y);
            ctx.stroke();

            // Decay signal
            conn.signal *= 0.9;
        });

        // Draw Nodes
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.fillStyle = `rgba(0, 243, 255, ${0.5 + node.activation / 2})`;
            ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
            ctx.fill();
        });

        // Random pulses
        if (Math.random() < 0.1) {
            const randomConn = connections[Math.floor(Math.random() * connections.length)];
            randomConn.signal = 1;
            randomConn.to.activation = 1; // "Fire" node
            setTimeout(() => randomConn.to.activation = Math.random(), 200);
        }

        requestAnimationFrame(animate);
    }

    animate();

    window.trainNetwork = function () {
        connections.forEach(c => c.signal = 1);
        nodes.forEach(n => n.activation = 1);
        setTimeout(() => nodes.forEach(n => n.activation = Math.random()), 300);
    }
}


/* --- Module 4: Terminal 2.0 --- */
function initTerminal2() {
    const input = document.getElementById('term-input');
    const output = document.getElementById('term-output');
    if (!input || !output) return;

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim().toLowerCase();
            processCommand(cmd);
            input.value = "";
        }
    });

    function print(text, color = '#fff') {
        const line = document.createElement('div');
        line.style.color = color;
        line.textContent = `> ${text}`;
        output.appendChild(line);
        output.parentElement.scrollTop = output.parentElement.scrollHeight;
    }

    function processCommand(cmd) {
        // Echo
        const line = document.createElement('div');
        line.textContent = `root@teko:~$ ${cmd}`;
        line.style.opacity = 0.7;
        output.appendChild(line);

        if (cmd === 'help') {
            print('Available commands: help, scan, whoami, clear, contact');
        } else if (cmd === 'scan') {
            print('Initializing security scan...', '#00f3ff');
            setTimeout(() => print('Scanning ports... [22, 80, 443 OPEN]', '#00ff88'), 500);
            setTimeout(() => print('No threats detected.', '#00ff88'), 1000);
        } else if (cmd === 'whoami') {
            print('Visitor: guest_user');
            print('Privileges: read-only');
        } else if (cmd === 'clear') {
            output.innerHTML = "";
            print('Console cleared.');
        } else if (cmd === 'contact') {
            print('Opening mail client...', '#bc13fe');
            window.location.href = "mailto:marceltko@gmail.com";
        } else if (cmd === '') {
            // Do nothing
        } else {
            print(`Command not found: ${cmd}`, '#ff0055');
        }
    }
}


/* --- Module 5: Physics Engine 2.0 --- */
function initPhysics2() {
    const canvas = document.getElementById('physics-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    // Physics State
    let bodies = [];
    let gravity = 0.5;

    class Body {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 10;
            this.vy = (Math.random() - 0.5) * 10;
            this.radius = Math.random() * 10 + 5;
            this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        }

        update() {
            this.vy += gravity;
            this.x += this.vx;
            this.y += this.vy;

            // Floor
            if (this.y + this.radius > canvas.height) {
                this.y = canvas.height - this.radius;
                this.vy *= -0.7; // Bounce
            }
            // Ceiling
            if (this.y - this.radius < 0) {
                this.y = this.radius;
                this.vy *= -0.7;
            }
            // Walls
            if (this.x + this.radius > canvas.width) {
                this.x = canvas.width - this.radius;
                this.vx *= -0.7;
            }
            if (this.x - this.radius < 0) {
                this.x = this.radius;
                this.vx *= -0.7;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Interactive Spawn
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        bodies.push(new Body(e.clientX - rect.left, e.clientY - rect.top));
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        bodies.forEach(b => {
            b.update();
            b.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();

    // Controls
    window.toggleGravity = () => {
        gravity = gravity === 0 ? 0.5 : 0;
    };
    window.addBody = () => {
        bodies.push(new Body(canvas.width / 2, canvas.height / 2));
    };
}


/* --- Module 6: Game Dev Prototype (Space Defender) --- */
function initGameProto() {
    const canvas = document.getElementById('game-canvas');
    const ui = document.getElementById('game-ui');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    // Game State
    let isPlaying = false;
    let player = { x: canvas.width / 2, y: canvas.height - 30, w: 20, h: 20, color: '#00f3ff' };
    let bullets = [];
    let enemies = [];
    let score = 0;
    let frame = 0;

    // Input
    let keys = {};
    window.addEventListener('keydown', e => keys[e.key] = true);
    window.addEventListener('keyup', e => keys[e.key] = false);

    function start() {
        isPlaying = true;
        ui.classList.add('hidden');
        score = 0;
        enemies = [];
        bullets = [];
        loop();
    }
    window.startGame = start;

    function loop() {
        if (!isPlaying) return;
        frame++;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Player Move
        if (keys['ArrowLeft'] && player.x > 0) player.x -= 5;
        if (keys['ArrowRight'] && player.x < canvas.width - player.w) player.x += 5;
        if (keys[' '] && frame % 10 === 0) { // Shoot
            bullets.push({ x: player.x + 10, y: player.y, v: 7 });
        }

        // Draw Player
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y + 20);
        ctx.lineTo(player.x + 10, player.y);
        ctx.lineTo(player.x + 20, player.y + 20);
        ctx.fill();

        // Update Bullets
        ctx.fillStyle = '#ff0';
        bullets.forEach((b, i) => {
            b.y -= b.v;
            ctx.fillRect(b.x - 2, b.y, 4, 10);
            if (b.y < 0) bullets.splice(i, 1);
        });

        // Spawn Enemies
        if (frame % 50 === 0) {
            enemies.push({
                x: Math.random() * (canvas.width - 20),
                y: -20,
                w: 20,
                h: 20,
                v: 2
            });
        }

        // Update Enemies & Interactions
        ctx.fillStyle = '#ff0055';
        enemies.forEach((e, i) => {
            e.y += e.v;
            ctx.fillRect(e.x, e.y, e.w, e.h);

            // Collision Bullet-Enemy
            bullets.forEach((b, bi) => {
                if (b.x > e.x && b.x < e.x + e.w && b.y > e.y && b.y < e.y + e.h) {
                    enemies.splice(i, 1);
                    bullets.splice(bi, 1);
                    score += 10;
                }
            });

            // Clean up
            if (e.y > canvas.height) enemies.splice(i, 1);
        });

        // Draw Score
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 30);

        requestAnimationFrame(loop);
    }
}

/* ==========================================
   PROFESSIONAL MODULES IMPLEMENTATION
   ========================================== */

/* --- Module 1: Algorithm Visualizer --- */
let algoArray = [];
let algoAnimating = false;

function initAlgoVisualizer() {
    const canvas = document.getElementById('algo-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    resetAlgo();
}

window.resetAlgo = function () {
    algoAnimating = false;
    algoArray = [];
    for (let i = 0; i < 30; i++) {
        algoArray.push(Math.floor(Math.random() * 100) + 10);
    }
    drawAlgoArray();
}

function drawAlgoArray(highlightIndices = []) {
    const canvas = document.getElementById('algo-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / algoArray.length;
    const maxHeight = Math.max(...algoArray);

    algoArray.forEach((value, index) => {
        const barHeight = (value / maxHeight) * (canvas.height - 20);
        const x = index * barWidth;
        const y = canvas.height - barHeight;

        // Color coding
        if (highlightIndices.includes(index)) {
            ctx.fillStyle = '#ff0055'; // Highlight swapping
        } else {
            ctx.fillStyle = '#00f3ff';
        }

        ctx.fillRect(x, y, barWidth - 2, barHeight);
    });
}

window.startBubbleSort = async function () {
    if (algoAnimating) return;
    algoAnimating = true;

    const n = algoArray.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (!algoAnimating) return;

            drawAlgoArray([j, j + 1]);
            await sleep(50);

            if (algoArray[j] > algoArray[j + 1]) {
                [algoArray[j], algoArray[j + 1]] = [algoArray[j + 1], algoArray[j]];
                drawAlgoArray([j, j + 1]);
                await sleep(50);
            }
        }
    }
    drawAlgoArray();
    algoAnimating = false;
}

window.startQuickSort = async function () {
    if (algoAnimating) return;
    algoAnimating = true;
    await quickSort(0, algoArray.length - 1);
    drawAlgoArray();
    algoAnimating = false;
}

async function quickSort(low, high) {
    if (low < high) {
        const pi = await partition(low, high);
        await quickSort(low, pi - 1);
        await quickSort(pi + 1, high);
    }
}

async function partition(low, high) {
    const pivot = algoArray[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
        if (!algoAnimating) return i + 1;

        drawAlgoArray([j, high]);
        await sleep(50);

        if (algoArray[j] < pivot) {
            i++;
            [algoArray[i], algoArray[j]] = [algoArray[j], algoArray[i]];
            drawAlgoArray([i, j]);
            await sleep(50);
        }
    }
    [algoArray[i + 1], algoArray[high]] = [algoArray[high], algoArray[i + 1]];
    return i + 1;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/* --- Module 2: AI Tic-Tac-Toe (Minimax) --- */
let tttBoard = ['', '', '', '', '', '', '', '', ''];
let tttCurrentPlayer = 'X';
let tttGameActive = true;

function initTicTacToe() {
    const cells = document.querySelectorAll('.ttt-cell');
    cells.forEach(cell => {
        cell.addEventListener('click', handleTTTClick);
    });
    resetTicTacToe();
}

function handleTTTClick(e) {
    const index = parseInt(e.target.dataset.index);

    if (tttBoard[index] !== '' || !tttGameActive || tttCurrentPlayer !== 'X') return;

    makeMove(index, 'X');

    if (checkWinner()) return;

    // AI plays
    setTimeout(() => {
        const aiMove = getBestMove();
        makeMove(aiMove, 'O');
        checkWinner();
    }, 300);
}

function makeMove(index, player) {
    tttBoard[index] = player;
    const cell = document.querySelector(`.ttt-cell[data-index="${index}"]`);
    cell.textContent = player;
    cell.style.color = player === 'X' ? '#00f3ff' : '#bc13fe';
    tttCurrentPlayer = tttCurrentPlayer === 'X' ? 'O' : 'X';
}

function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c]) {
            document.getElementById('ttt-status').textContent = `${tttBoard[a]} gagne !`;
            tttGameActive = false;
            return true;
        }
    }

    if (!tttBoard.includes('')) {
        document.getElementById('ttt-status').textContent = 'Match nul !';
        tttGameActive = false;
        return true;
    }

    document.getElementById('ttt-status').textContent =
        tttCurrentPlayer === 'X' ? 'Votre tour (X)' : 'Tour IA (O)';
    return false;
}

function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = 0;

    for (let i = 0; i < 9; i++) {
        if (tttBoard[i] === '') {
            tttBoard[i] = 'O';
            let score = minimax(tttBoard, 0, false);
            tttBoard[i] = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    const winner = evaluateBoard();
    if (winner !== null) return winner;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function evaluateBoard() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c]) {
            return tttBoard[a] === 'O' ? 10 : -10;
        }
    }

    if (!tttBoard.includes('')) return 0;
    return null;
}

window.resetTicTacToe = function () {
    tttBoard = ['', '', '', '', '', '', '', '', ''];
    tttCurrentPlayer = 'X';
    tttGameActive = true;
    document.querySelectorAll('.ttt-cell').forEach(cell => {
        cell.textContent = '';
    });
    document.getElementById('ttt-status').textContent = 'Votre tour (X)';
}


/* --- Module 3: JSON Formatter --- */
function initJSONFormatter() {
    // No initialization needed
}

window.formatJSON = function () {
    const input = document.getElementById('json-input').value;
    const output = document.getElementById('json-output');

    try {
        const parsed = JSON.parse(input);
        output.textContent = JSON.stringify(parsed, null, 2);
        output.classList.remove('json-error');
        output.style.color = '#0f0';
    } catch (e) {
        output.textContent = `Erreur: ${e.message}`;
        output.classList.add('json-error');
    }
}

window.validateJSON = function () {
    const input = document.getElementById('json-input').value;
    const output = document.getElementById('json-output');

    try {
        JSON.parse(input);
        output.textContent = '✓ JSON Valide !';
        output.classList.remove('json-error');
        output.style.color = '#00ff88';
    } catch (e) {
        output.textContent = `✗ Invalide: ${e.message}`;
        output.classList.add('json-error');
    }
}


/* --- Module 4: Music Visualizer --- */
let audioContext, analyser, dataArray, audioSource, isPlaying = false;

function initMusicVisualizer() {
    const fileInput = document.getElementById('audio-file');
    const audioPlayer = document.getElementById('audio-player');
    const canvas = document.getElementById('music-canvas');
    const ctx = canvas.getContext('2d');

    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            audioPlayer.src = url;
            setupAudioContext();
        }
    });

    function setupAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;

            audioSource = audioContext.createMediaElementSource(audioPlayer);
            audioSource.connect(analyser);
            analyser.connect(audioContext.destination);

            dataArray = new Uint8Array(analyser.frequencyBinCount);
        }
    }

    function visualize() {
        if (!isPlaying) return;

        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / dataArray.length;

        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;
            const x = i * barWidth;
            const y = canvas.height - barHeight;

            const hue = (i / dataArray.length) * 360;
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.fillRect(x, y, barWidth - 1, barHeight);
        }

        requestAnimationFrame(visualize);
    }

    window.toggleMusicPlay = function () {
        const player = document.getElementById('audio-player');
        const btn = document.getElementById('play-btn');

        if (isPlaying) {
            player.pause();
            btn.textContent = 'Play';
            isPlaying = false;
        } else {
            player.play();
            btn.textContent = 'Pause';
            isPlaying = true;
            visualize();
        }
    }
}


/* --- Module 5: Weather Dashboard --- */
function initWeatherDashboard() {
    // Simulated weather data
}

window.searchWeather = function () {
    const city = document.getElementById('city-input').value || 'Paris';

    // Simulated weather data
    const weatherData = {
        'paris': { icon: '🌤️', temp: 25, desc: 'Partiellement nuageux' },
        'london': { icon: '🌧️', temp: 18, desc: 'Pluvieux' },
        'tokyo': { icon: '☀️', temp: 30, desc: 'Ensoleillé' },
        'new york': { icon: '⛈️', temp: 22, desc: 'Orageux' },
        'default': { icon: '🌤️', temp: 20, desc: 'Nuageux' }
    };

    const data = weatherData[city.toLowerCase()] || weatherData['default'];

    document.querySelector('.weather-icon').textContent = data.icon;
    document.querySelector('.weather-temp').textContent = `${data.temp}°C`;
    document.querySelector('.weather-city').textContent = city.charAt(0).toUpperCase() + city.slice(1);
    document.querySelector('.weather-desc').textContent = data.desc;
}
