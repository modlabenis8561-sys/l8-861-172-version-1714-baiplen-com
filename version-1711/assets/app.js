(function () {
  var mobileButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var changeSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        changeSlide(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
      });
    });
    window.setInterval(function () {
      changeSlide(current + 1);
    }, 5600);
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var section = panel.closest('.section') || document;
    var list = section.querySelector('[data-card-list]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-card]')) : [];
    var input = panel.querySelector('[data-search-input]');
    var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-chip]'));
    var sort = panel.querySelector('[data-sort-select]');
    var empty = panel.querySelector('[data-empty-state]');
    var activeChip = '全部';

    var normalize = function (value) {
      return (value || '').toString().trim().toLowerCase();
    };

    var applyQueryFromUrl = function () {
      if (!input) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
    };

    var sortCards = function () {
      if (!list || !sort) {
        return;
      }
      var value = sort.value;
      var sorted = cards.slice();
      if (value === 'title') {
        sorted.sort(function (a, b) {
          return normalize(a.getAttribute('data-title')).localeCompare(normalize(b.getAttribute('data-title')), 'zh-Hans-CN');
        });
      }
      if (value === 'year') {
        sorted.sort(function (a, b) {
          return normalize(b.getAttribute('data-year')).localeCompare(normalize(a.getAttribute('data-year')));
        });
      }
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    };

    var applyFilters = function () {
      var query = input ? normalize(input.value) : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var type = normalize(card.getAttribute('data-type'));
        var genre = normalize(card.getAttribute('data-genre'));
        var title = normalize(card.getAttribute('data-title'));
        var chip = normalize(activeChip);
        var matchText = !query || haystack.indexOf(query) !== -1 || title.indexOf(query) !== -1;
        var matchChip = chip === '全部' || haystack.indexOf(chip) !== -1 || type.indexOf(chip) !== -1 || genre.indexOf(chip) !== -1;
        var show = matchText && matchChip;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
      sortCards();
    };

    applyQueryFromUrl();

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    if (sort) {
      sort.addEventListener('change', applyFilters);
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeChip = chip.getAttribute('data-filter-chip') || '全部';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        applyFilters();
      });
    });

    applyFilters();
  });
})();

function initMoviePlayer(streamUrl) {
  var shell = document.querySelector('[data-player]');
  if (!shell) {
    return;
  }
  var video = shell.querySelector('video');
  var layer = shell.querySelector('.play-layer');
  var started = false;

  var hideLayer = function () {
    if (layer) {
      layer.classList.add('is-hidden');
    }
  };

  var begin = function () {
    hideLayer();
    if (!video) {
      return;
    }
    if (started) {
      video.play().catch(function () {});
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }
    video.src = streamUrl;
    video.play().catch(function () {});
  };

  if (layer) {
    layer.addEventListener('click', begin);
  }
  if (video) {
    video.addEventListener('click', begin);
    video.addEventListener('play', hideLayer);
  }
}
