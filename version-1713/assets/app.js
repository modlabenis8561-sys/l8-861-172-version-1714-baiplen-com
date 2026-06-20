(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.style.opacity = '0';
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer;

        function activate(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function move(step) {
            activate(activeIndex + step);
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        if (previous) {
            previous.addEventListener('click', function () {
                move(-1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                move(1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
                restart();
            });
        });

        activate(0);
        restart();
    }

    var filterForm = document.querySelector('[data-filter-form]');

    if (filterForm) {
        var keywordInput = filterForm.querySelector('[data-filter-keyword]');
        var yearSelect = filterForm.querySelector('[data-filter-year]');
        var typeSelect = filterForm.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardType = normalize(card.getAttribute('data-type'));
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedYear = !year || cardYear === year;
                var matchedType = !type || cardType.indexOf(type) !== -1;

                card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear && matchedType));
            });
        }

        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    }

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage && window.SITE_MOVIES) {
        var searchForm = searchPage.querySelector('[data-search-form]');
        var searchInput = searchPage.querySelector('[data-search-input]');
        var searchResults = searchPage.querySelector('[data-search-results]');
        var searchEmpty = searchPage.querySelector('[data-search-empty]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        function normalizeSearch(value) {
            return String(value || '').trim().toLowerCase();
        }

        function escapeText(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function renderCard(movie) {
            return [
                '<article class="movie-card" data-movie-card>',
                '    <a class="poster-link" href="' + escapeText(movie.url) + '">',
                '        <span class="poster-frame">',
                '            <img src="' + escapeText(movie.cover) + '" alt="' + escapeText(movie.title) + '" loading="lazy">',
                '            <span class="play-chip">播放</span>',
                '        </span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <div class="movie-meta-line">',
                '            <a href="' + escapeText(movie.categoryUrl) + '">' + escapeText(movie.category) + '</a>',
                '            <span>' + escapeText(movie.year) + '</span>',
                '        </div>',
                '        <h3><a href="' + escapeText(movie.url) + '">' + escapeText(movie.title) + '</a></h3>',
                '        <p>' + escapeText(movie.oneLine) + '</p>',
                '        <div class="tag-row"><span class="tag-pill">' + escapeText(movie.region) + '</span><span class="tag-pill">' + escapeText(movie.type) + '</span></div>',
                '    </div>',
                '</article>'
            ].join('\n');
        }

        function renderSearch(query) {
            var normalized = normalizeSearch(query);
            var terms = normalized.split(/\s+/).filter(Boolean);
            var results = window.SITE_MOVIES;

            if (terms.length) {
                results = window.SITE_MOVIES.filter(function (movie) {
                    var haystack = normalizeSearch([
                        movie.title,
                        movie.region,
                        movie.type,
                        movie.genre,
                        movie.tags.join(' '),
                        movie.oneLine
                    ].join(' '));

                    return terms.every(function (term) {
                        return haystack.indexOf(term) !== -1;
                    });
                });
            } else {
                results = window.SITE_MOVIES.slice(0, 36);
            }

            searchResults.innerHTML = results.slice(0, 180).map(renderCard).join('\n');
            searchEmpty.hidden = results.length > 0;
        }

        if (searchInput) {
            searchInput.value = initialQuery;
        }

        if (searchForm) {
            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var query = searchInput ? searchInput.value : '';
                var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
                window.history.replaceState(null, '', nextUrl);
                renderSearch(query);
            });
        }

        renderSearch(initialQuery);
    }
})();
