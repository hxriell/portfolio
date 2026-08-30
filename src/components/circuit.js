let rafId = 0;
let resizeHandler = null;
let running = false;

export function mountCircuit() {
  const canvas = document.getElementById('particles-js');
  if (!canvas || running) return;
  running = true;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = getComputedStyle(document.documentElement);
  const color = (css.getPropertyValue('--accent-primary') || '#00e5f0').trim();

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeHandler = resize;
  window.addEventListener('resize', resize);
  resize();

  const config = {
    nodeCount: reduceMotion ? 20 : 40,
    speed: reduceMotion ? 0 : 2,
    color,
  };

  class CircuitNode {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.round((Math.random() * canvas.width) / 20) * 20;
      this.y = Math.round((Math.random() * canvas.height) / 20) * 20;
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
        this.direction =
          this.direction === 0 || this.direction === 2
            ? Math.random() > 0.5
              ? 1
              : 3
            : Math.random() > 0.5
              ? 0
              : 2;
        this.steps = 0;
        this.maxSteps = Math.floor(Math.random() * 20) + 10;
      }
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }
    draw() {
      ctx.fillStyle = config.color;
      ctx.fillRect(this.x, this.y, 3, 3);
    }
  }

  const nodes = Array.from({ length: config.nodeCount }, () => new CircuitNode());

  function drawFrame() {
    ctx.fillStyle = reduceMotion ? 'rgba(6, 7, 10, 1)' : 'rgba(6, 7, 10, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    nodes.forEach((node) => {
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
        if (Math.hypot(dx, dy) < 100) {
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
    resizeHandler = () => {
      resize();
      drawFrame();
    };
    return;
  }

  function animate() {
    if (!running) return;
    drawFrame();
    rafId = requestAnimationFrame(animate);
  }
  animate();
}

export function unmountCircuit() {
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  if (resizeHandler) window.removeEventListener('resize', resizeHandler);
  resizeHandler = null;
}
