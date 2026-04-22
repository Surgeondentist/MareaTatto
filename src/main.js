import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style.css';

/* ── Year ── */
const yearEl = document.getElementById('js-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Reduced motion helper ── */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Navbar ── */
const navbar = document.getElementById('mainNavbar');
const navLinks = Array.from(document.querySelectorAll('#navbarNav .nav-link'));
const sections = navLinks
  .map((link) => {
    const id = link.getAttribute('href');
    const target = document.querySelector(id);
    if (target) target.setAttribute('data-nav-target', '');
    return target;
  })
  .filter(Boolean);

const toggleNavbarSolid = () => {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 64);
};

const handleActiveLink = (activeId) => {
  navLinks.forEach((link) => {
    const matches = link.getAttribute('href') === `#${activeId}`;
    link.classList.toggle('active', matches);
    if (matches) {
      link.setAttribute('aria-current', 'section');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) handleActiveLink(entry.target.id);
    });
  },
  { threshold: 0.35 }
);

sections.forEach((s) => navObserver.observe(s));
toggleNavbarSolid();
window.addEventListener('scroll', toggleNavbarSolid, { passive: true });

/* ── Smooth scroll (reduced-motion aware) ── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (!href || href.length === 1) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = navbar ? navbar.offsetHeight + 16 : 0;
    const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });
});

/* ── Hero video ── */
const heroVideo = document.querySelector('[data-hero-video]');
if (heroVideo) {
  heroVideo.addEventListener('loadeddata', () => heroVideo.classList.add('is-ready'));
}

/* ── Scroll reveal ── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

const initReveal = () => {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    if (prefersReducedMotion()) {
      el.classList.add('is-visible');
    } else {
      revealObserver.observe(el);
    }
  });
};

/* ── Staggered grid children reveal ── */
const initStagger = () => {
  document.querySelectorAll('[data-stagger]').forEach((parent) => {
    Array.from(parent.children).forEach((child, i) => {
      child.setAttribute('data-reveal', '');
      child.style.transitionDelay = prefersReducedMotion() ? '0ms' : `${i * 90}ms`;
      if (prefersReducedMotion()) {
        child.classList.add('is-visible');
      } else {
        revealObserver.observe(child);
      }
    });
  });
};

initReveal();
initStagger();

/* ── 3D card tilt ── */
const TILT_MAX = 9;
const TRANSITION_RESET = '500ms cubic-bezier(0.16, 1, 0.3, 1)';
const TRANSITION_TRACK = '80ms linear';

function applyTilt(card, e) {
  const rect = card.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (e.clientX - cx) / (rect.width / 2);
  const dy = (e.clientY - cy) / (rect.height / 2);
  const rotY = dx * TILT_MAX;
  const rotX = -dy * TILT_MAX;
  const mx = ((e.clientX - rect.left) / rect.width) * 100;
  const my = ((e.clientY - rect.top) / rect.height) * 100;

  card.style.transition = TRANSITION_TRACK;
  card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
  card.style.setProperty('--mx', `${mx}%`);
  card.style.setProperty('--my', `${my}%`);
}

function resetTilt(card) {
  card.style.transition = TRANSITION_RESET;
  card.style.transform = '';
  card.style.removeProperty('--mx');
  card.style.removeProperty('--my');
}

function bindCardTilt(cardList) {
  if (prefersReducedMotion()) return;
  cardList.forEach((card) => {
    card.addEventListener('mousemove', (e) => applyTilt(card, e));
    card.addEventListener('mouseleave', () => resetTilt(card));
  });
}

bindCardTilt(document.querySelectorAll('.benefit-card, .process-card, .testimonial-card'));

function escapeHtml(str) {
  if (str == null) return '';
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

function escapeAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;');
}

function starsHtml(rating) {
  const n = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)));
  return Array.from({ length: 5 }, (_, i) => {
    const on = i < n;
    return `<i class="fa-solid fa-star google-review-card__star${on ? ' is-on' : ''}" aria-hidden="true"></i>`;
  }).join('');
}

async function initGoogleReviews() {
  const root = document.getElementById('google-reviews-root');
  const summary = document.getElementById('google-reviews-summary');
  const statusEl = document.getElementById('google-reviews-status');
  const linkEl = document.getElementById('google-reviews-link');
  const attribEl = document.getElementById('google-reviews-attribution');
  if (!root) return;

  /* URL estable (evita maps.app.goo.gl / Dynamic Links rotos o "not found") */
  const FALLBACK_MAPS =
    'https://www.google.com/maps/search/Marea+Tattoo+Shop/@4.6663411,-74.1194166,17z';
  const ATTRIB_API =
    'Contenido de reseñas proporcionado por Google Places API (máximo cinco por consulta).';
  const ATTRIB_FALLBACK =
    'Textos ilustrativos locales mientras se configura la API; las opiniones verificadas en Google Maps están en el enlace.';
  const ATTRIB_EMPTY =
    'Las valoraciones verificadas del estudio están en Google Maps; puedes leerlas con el botón de abajo.';

  let apiData = null;
  try {
    const res = await fetch('/api/reviews');
    if (res.ok) apiData = await res.json();
  } catch {
    /* red local sin Vercel */
  }

  let fbData = null;
  try {
    const fb = await fetch('/reviews-fallback.json');
    if (fb.ok) fbData = await fb.json();
  } catch {
    /* sin archivo */
  }

  const usedApiReviews = apiData?.reviews?.length > 0;
  const reviews = usedApiReviews
    ? apiData.reviews
    : fbData?.reviews?.length > 0
      ? fbData.reviews
      : [];

  const rating = apiData?.rating ?? fbData?.rating ?? null;
  const userRatingsTotal = apiData?.user_ratings_total ?? fbData?.user_ratings_total ?? null;
  const mapsUrl = apiData?.url ?? fbData?.google_maps_url ?? null;

  if (linkEl) {
    linkEl.href = mapsUrl || FALLBACK_MAPS;
  }

  if (summary && (rating != null || userRatingsTotal != null)) {
    summary.hidden = false;
    const starRow = rating != null ? starsHtml(Math.round(rating)) : '';
    summary.innerHTML = `
      <div class="google-reviews-summary__inner">
        ${rating != null ? `<span class="google-reviews-summary__stars" aria-hidden="true">${starRow}</span>` : ''}
        ${rating != null ? `<strong class="google-reviews-summary__rating">${Number(rating).toFixed(1)}</strong>` : ''}
        ${
          userRatingsTotal != null
            ? `<span class="google-reviews-summary__count">${userRatingsTotal} opiniones en Google</span>`
            : ''
        }
      </div>`;
  }

  if (!reviews.length) {
    if (statusEl) {
      statusEl.hidden = true;
      statusEl.textContent = '';
    }

    const apiConfiguredButFailed =
      apiData?.configured === true && apiData?.ok === false;
    if (import.meta.env.DEV && apiConfiguredButFailed) {
      console.warn('[Reseñas Google]', apiData.status, apiData.error_message, apiData.hint);
    }

    const emptyHint = apiConfiguredButFailed
      ? `<p class="google-reviews-empty__hint">
          No pudimos cargar las opiniones desde Google en este momento.
          Las reseñas reales siguen disponibles en Google Maps con el botón de abajo.
        </p>`
      : '';

    root.innerHTML = `
      <div class="google-reviews-empty" data-reveal role="status">
        <div class="google-reviews-empty__brand" aria-hidden="true">
          <i class="fa-brands fa-google"></i>
        </div>
        <h3 class="google-reviews-empty__title">Opiniones en Google Maps</h3>
        <p class="google-reviews-empty__text">
          Las reseñas públicas y la valoración del estudio están en nuestro perfil de Google.
          Cuando la integración con Places API esté activa, aquí podremos destacar hasta cinco opiniones recientes.
        </p>
        ${emptyHint}
      </div>`;
    if (attribEl) attribEl.textContent = ATTRIB_EMPTY;
    const emptyEl = root.querySelector('.google-reviews-empty');
    if (emptyEl) {
      if (prefersReducedMotion()) {
        emptyEl.classList.add('is-visible');
      } else {
        revealObserver.observe(emptyEl);
      }
    }
    return;
  }

  if (statusEl) {
    statusEl.hidden = true;
  }

  if (attribEl) {
    attribEl.textContent = usedApiReviews ? ATTRIB_API : ATTRIB_FALLBACK;
  }

  root.innerHTML = '';
  reviews.forEach((rev) => {
    const article = document.createElement('article');
    article.className = 'google-review-card';
    const name = escapeHtml(rev.author_name || 'Cliente');
    const when = escapeHtml(rev.relative_time_description || '');
    const text = escapeHtml(rev.text || '');
    const stars = starsHtml(rev.rating);
    const avatar = rev.profile_photo_url
      ? `<img class="google-review-card__avatar" src="${escapeAttr(rev.profile_photo_url)}" alt="" width="44" height="44" loading="lazy" referrerpolicy="no-referrer" />`
      : `<div class="google-review-card__avatar-placeholder" aria-hidden="true"><i class="fa-solid fa-user"></i></div>`;
    article.innerHTML = `
      <div class="google-review-card__head">
        ${avatar}
        <div>
          <div class="google-review-card__name">${name}</div>
          <div class="google-review-card__meta">
            <span class="google-review-card__stars" aria-label="${Number(rev.rating) || 0} de 5">${stars}</span>
            ${when ? `<span class="google-review-card__when"> · ${when}</span>` : ''}
          </div>
        </div>
      </div>
      <p class="google-review-card__text">${text}</p>`;
    root.appendChild(article);
  });

  Array.from(root.children).forEach((child, i) => {
    child.setAttribute('data-reveal', '');
    child.style.transitionDelay = prefersReducedMotion() ? '0ms' : `${i * 90}ms`;
    if (prefersReducedMotion()) {
      child.classList.add('is-visible');
    } else {
      revealObserver.observe(child);
    }
  });

  bindCardTilt(root.querySelectorAll('.google-review-card'));
}

void initGoogleReviews();
