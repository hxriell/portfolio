import { bootLabModules } from './modules.js';

const nativeRaf = window.requestAnimationFrame.bind(window);
const rafIds = [];
let mounted = false;

function idle(fn) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(fn, { timeout: 400 });
  } else {
    setTimeout(fn, 1);
  }
}

export function mountLab() {
  if (!document.getElementById('lab')) return;
  mounted = true;
  window.requestAnimationFrame = (cb) => {
    const id = nativeRaf((t) => {
      if (mounted) cb(t);
    });
    rafIds.push(id);
    return id;
  };
  idle(() => {
    if (mounted) bootLabModules();
  });
}

export function unmountLab() {
  mounted = false;
  rafIds.forEach((id) => cancelAnimationFrame(id));
  rafIds.length = 0;
  window.requestAnimationFrame = nativeRaf;
}
