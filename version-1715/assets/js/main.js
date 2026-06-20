(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          restart();
        });
      });

      show(0);
      restart();
    });

    document.querySelectorAll("[data-list-search]").forEach(function (input) {
      var scope = input.closest("main") || document;
      var items = Array.prototype.slice.call(scope.querySelectorAll("[data-search-item]"));

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();

        items.forEach(function (item) {
          var text = (item.getAttribute("data-search-text") || item.textContent || "").toLowerCase();
          item.classList.toggle("is-hidden", keyword && text.indexOf(keyword) === -1);
        });
      });
    });

    var queryInput = document.getElementById("globalSearch");
    var categorySelect = document.getElementById("globalCategory");
    var results = document.getElementById("searchResults");

    if (queryInput && categorySelect && results && Array.isArray(window.SITE_SEARCH_ITEMS)) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      queryInput.value = initialQuery;

      function movieCard(item) {
        var tags = item.tags.slice(0, 3).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return "<article class=\"movie-card\">" +
          "<a class=\"movie-cover\" href=\"" + item.url + "\">" +
          "<img src=\"" + item.image + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
          "<span class=\"cover-glow\"></span>" +
          "<span class=\"play-chip\">播放</span>" +
          "</a>" +
          "<div class=\"movie-info\">" +
          "<h2><a href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a></h2>" +
          "<p class=\"meta-line\">" + escapeHtml(item.year + " · " + item.region + " · " + item.type) + "</p>" +
          "<p class=\"card-desc\">" + escapeHtml(item.oneLine) + "</p>" +
          "<div class=\"tag-row\">" + tags + "</div>" +
          "</div>" +
          "</article>";
      }

      function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, function (character) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            "\"": "&quot;"
          }[character];
        });
      }

      function render() {
        var keyword = queryInput.value.trim().toLowerCase();
        var category = categorySelect.value;
        var html = window.SITE_SEARCH_ITEMS.filter(function (item) {
          var text = item.searchText.toLowerCase();
          var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
          var categoryMatch = !category || item.categoryId === category;
          return keywordMatch && categoryMatch;
        }).slice(0, 120).map(movieCard).join("");

        results.innerHTML = html;
      }

      queryInput.addEventListener("input", render);
      categorySelect.addEventListener("change", render);
      render();
    }
  });
})();
