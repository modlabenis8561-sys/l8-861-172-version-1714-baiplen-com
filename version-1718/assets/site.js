(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot") || 0));
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }

      show(0);
      restart();
    }

    var searchInput = document.querySelector("[data-search-input]");
    var searchGrid = document.querySelector("[data-search-grid]");
    var emptyState = document.querySelector("[data-empty-state]");

    if (searchInput && searchGrid) {
      var cards = Array.prototype.slice.call(searchGrid.querySelectorAll("[data-movie-card]"));

      searchInput.addEventListener("input", function () {
        var keyword = searchInput.value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-year") || ""
          ].join(" ").toLowerCase();
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      });
    }
  });
})();
