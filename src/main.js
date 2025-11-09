import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style.css';

const navbar = document.getElementById('mainNavbar');
const navLinks = Array.from(document.querySelectorAll('#navbarNav .nav-link'));
const sections = navLinks
  .map((link) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.setAttribute('data-nav-target', '');
    }
    return target;
  })
  .filter(Boolean);

const toggleNavbarSolid = () => {
  if (!navbar) return;
  if (window.scrollY > 64) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
};

const handleActiveLink = (activeId) => {
  navLinks.forEach((link) => {
    const matches = link.getAttribute('href') === `#${activeId}`;
    link.classList.toggle('active', matches);
  });
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        handleActiveLink(entry.target.id);
      }
    });
  },
  {
    threshold: 0.6,
  }
);

sections.forEach((section) => observer.observe(section));

toggleNavbarSolid();
window.addEventListener('scroll', () => {
  toggleNavbarSolid();
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href');
    if (!href || href.length === 1) return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    const yOffset = navbar ? navbar.offsetHeight : 0;
    const y =
      target.getBoundingClientRect().top + window.pageYOffset - (yOffset + 16);
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

const heroVideo = document.querySelector('[data-hero-video]');
if (heroVideo) {
  heroVideo.addEventListener('loadeddata', () => {
    heroVideo.classList.add('is-ready');
  });
}
