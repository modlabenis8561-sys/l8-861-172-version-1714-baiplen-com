(function () {
    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function initMobileNavigation() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        restart();
    }

    function getCardText(card) {
        return normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-category'),
            card.getAttribute('data-year'),
            card.textContent
        ].join(' '));
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var input = panel.querySelector('[data-filter-input]');
            var reset = panel.querySelector('[data-filter-reset]');
            var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
            var empty = panel.querySelector('[data-filter-empty]');
            var list = panel.parentElement ? panel.parentElement.querySelector('[data-card-list]') : null;
            if (!list) {
                list = document.querySelector('[data-card-list]');
            }
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
            var activeChip = '';

            function apply() {
                var query = input ? normalize(input.value) : '';
                var chipQuery = normalize(activeChip);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = getCardText(card);
                    var matched = (!query || text.indexOf(query) !== -1) && (!chipQuery || text.indexOf(chipQuery) !== -1);
                    card.classList.toggle('is-filter-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                var params = new URLSearchParams(window.location.search);
                var preset = params.get('q');
                if (preset) {
                    input.value = preset;
                }
                input.addEventListener('input', apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    activeChip = chip.getAttribute('data-filter-value') || '';
                    chips.forEach(function (item) {
                        item.classList.toggle('is-active', item === chip);
                    });
                    apply();
                });
            });
            if (reset) {
                reset.addEventListener('click', function () {
                    activeChip = '';
                    if (input) {
                        input.value = '';
                    }
                    chips.forEach(function (chip) {
                        chip.classList.toggle('is-active', (chip.getAttribute('data-filter-value') || '') === '');
                    });
                    apply();
                });
            }
            apply();
        });
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('[data-video-src]'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var cover = shell.querySelector('.player-cover');
            var source = shell.getAttribute('data-video-src');
            var configured = false;
            var hls = null;
            if (!video || !source) {
                return;
            }

            function configure() {
                if (configured) {
                    return;
                }
                configured = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    shell.hlsPlayer = hls;
                } else {
                    video.src = source;
                }
            }

            function play() {
                configure();
                if (cover) {
                    cover.classList.add('is-hidden');
                }
                video.controls = true;
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            }

            configure();
            if (cover) {
                cover.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNavigation();
        initHero();
        initFilters();
        initPlayers();
    });
}());
