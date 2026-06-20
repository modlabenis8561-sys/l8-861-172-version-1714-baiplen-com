const toggle = document.querySelector('.menu-toggle');
const mobilePanel = document.querySelector('.mobile-panel');

if (toggle && mobilePanel) {
  toggle.addEventListener('click', () => {
    mobilePanel.classList.toggle('is-open');
  });
}

const heroRoot = document.querySelector('[data-hero]');

if (heroRoot) {
  const slides = Array.from(heroRoot.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(heroRoot.querySelectorAll('[data-hero-dot]'));
  let index = 0;

  const setSlide = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      slide.classList.toggle('is-active', position === index);
    });
    dots.forEach((dot, position) => {
      dot.classList.toggle('is-active', position === index);
    });
  };

  dots.forEach((dot, position) => {
    dot.addEventListener('click', () => setSlide(position));
  });

  if (slides.length > 1) {
    setInterval(() => setSlide(index + 1), 5200);
  }
}

const normalize = (value) => (value || '').toString().trim().toLowerCase();

const applySearch = (scope, term, typeFilter) => {
  const cards = Array.from(scope.querySelectorAll('[data-card]'));
  const query = normalize(term);
  const filter = normalize(typeFilter || 'all');

  cards.forEach((card) => {
    const content = normalize([
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.genre,
      card.dataset.tags
    ].join(' '));
    const type = normalize(card.dataset.type + ' ' + card.dataset.genre + ' ' + card.dataset.tags);
    const matchesText = !query || content.includes(query);
    const matchesFilter = filter === 'all' || type.includes(filter);
    card.classList.toggle('is-hidden', !(matchesText && matchesFilter));
  });
};

document.querySelectorAll('[data-search-scope]').forEach((scope) => {
  const input = scope.querySelector('[data-page-search]');
  const buttons = Array.from(scope.querySelectorAll('[data-filter]'));
  let activeFilter = 'all';

  const run = () => applySearch(scope, input ? input.value : '', activeFilter);

  if (input) {
    input.addEventListener('input', run);
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      buttons.forEach((item) => item.classList.toggle('is-active', item === button));
      run();
    });
  });

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q && input) {
    input.value = q;
    const bigInput = document.querySelector('[data-main-query]');
    if (bigInput) {
      bigInput.value = q;
    }
    run();
  }
});
