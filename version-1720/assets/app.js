(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupMenu() {
        var button = qs("[data-menu-button]");
        var nav = qs("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            document.body.classList.toggle("menu-open");
        });
        qsa("a", nav).forEach(function (link) {
            link.addEventListener("click", function () {
                document.body.classList.remove("menu-open");
            });
        });
    }

    function setupHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa("[data-hero-slide]", hero);
        var dots = qsa("[data-hero-dot]", hero);
        var prev = qs("[data-hero-prev]", hero);
        var next = qs("[data-hero-next]", hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        if (slides.length > 1) {
            start();
        }
    }

    function setupCategoryFilters() {
        qsa("[data-filter-scope]").forEach(function (scope) {
            var input = qs("[data-category-search]", scope);
            var type = qs("[data-category-type]", scope);
            var year = qs("[data-category-year]", scope);
            var cards = qsa("[data-movie-card]", scope);

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var typeValue = type ? type.value : "";
                var yearValue = year ? year.value : "";
                var range = yearValue ? yearValue.split("-").map(Number) : null;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardType = card.getAttribute("data-type") || "";
                    var cardYear = Number(card.getAttribute("data-year") || "0");
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesType = !typeValue || cardType === typeValue;
                    var matchesYear = !range || (cardYear >= range[0] && cardYear <= range[1]);
                    card.style.display = matchesQuery && matchesType && matchesYear ? "" : "none";
                });
            }

            [input, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function setupSearchPage() {
        var input = qs("[data-site-search]");
        var form = qs("[data-search-form]");
        var results = qs("[data-search-results]");
        var status = qs("[data-search-status]");
        var defaultBlock = qs("[data-default-search-block]");
        if (!input || !results || !status || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function card(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return "<article class=\"movie-card\">" +
                "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">" +
                    "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                    "<span class=\"poster-shade\"></span>" +
                    "<span class=\"play-chip\">▶</span>" +
                "</a>" +
                "<div class=\"movie-card-body\">" +
                    "<div class=\"card-meta\"><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
                    "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
                    "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                    "<div class=\"tag-row\">" + tags + "</div>" +
                "</div>" +
            "</article>";
        }

        function render(query) {
            var cleanQuery = String(query || "").trim().toLowerCase();
            var items = window.MOVIE_INDEX.filter(function (movie) {
                return !cleanQuery || String(movie.search || "").toLowerCase().indexOf(cleanQuery) !== -1;
            }).slice(0, 120);
            results.innerHTML = items.map(card).join("");
            status.textContent = cleanQuery ? "找到 " + items.length + " 条相关影片" : "推荐影片";
            if (defaultBlock) {
                defaultBlock.style.display = cleanQuery ? "none" : "";
            }
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var query = input.value.trim();
                var url = new URL(window.location.href);
                if (query) {
                    url.searchParams.set("q", query);
                } else {
                    url.searchParams.delete("q");
                }
                window.history.replaceState({}, "", url.toString());
                render(query);
            });
        }
        input.addEventListener("input", function () {
            render(input.value);
        });
        render(initial);
    }

    function initMoviePlayer(mediaUrl) {
        var player = qs("[data-player]");
        if (!player) {
            return;
        }
        var video = qs("[data-player-video]", player);
        var button = qs("[data-player-button]", player);
        var attached = false;
        var hls = null;

        function attach() {
            if (attached || !video) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = mediaUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    backBufferLength: 30
                });
                hls.loadSource(mediaUrl);
                hls.attachMedia(video);
            } else {
                video.src = mediaUrl;
            }
        }

        function play() {
            attach();
            player.classList.add("is-playing");
            video.setAttribute("controls", "controls");
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    player.classList.remove("is-playing");
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupCategoryFilters();
        setupSearchPage();
    });
})();
