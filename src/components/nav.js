let navBound = false;
let closeMenu = () => {};

export function mountNav() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navbar = document.querySelector('.navbar');
  if (!hamburger || !navLinks) return;

  closeMenu = () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.classList.remove('menu-open');
  };

  if (!navBound) {
    hamburger.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) closeMenu();
      else {
        navLinks.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', 'Fermer le menu');
        document.body.classList.add('menu-open');
      }
    });
    navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMenu();
        hamburger.focus();
      }
    });
    window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => {
      if (e.matches) closeMenu();
    });
    window.addEventListener(
      'scroll',
      () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 40);
        spy();
      },
      { passive: true },
    );
    navBound = true;
  }

  spy();
}

function spy() {
  const links = document.querySelectorAll('.nav-links a');
  const path = window.location.pathname.replace(/\/$/, '');
  const hash = window.location.hash.replace('#', '');
  const onLab = path.endsWith('/lab');
  const onProject = path.includes('/projects/');

  let current = 'home';
  if (onLab) current = 'lab';
  else if (onProject) current = 'projects';
  else if (hash) current = hash;
  else {
    const sections = document.querySelectorAll('#home, #about, #services, #projects, #education, #contact');
    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;
    current = nearBottom ? 'contact' : 'home';
    if (!nearBottom) {
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= 120) current = section.id;
      });
    }
  }

  links.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('data-nav') === current);
  });
}
