
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
    });

    var scope = form.closest("[data-filter-scope]") || document;
    var input = form.querySelector('input[type="search"]');
    var yearSelect = form.querySelector('[data-filter="year"]');
    var typeSelect = form.querySelector('[data-filter="type"]');
    var regionSelect = form.querySelector('[data-filter="region"]');
    var items = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-row"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : "");
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";

      items.forEach(function (item) {
        var text = normalize(item.getAttribute("data-search"));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || item.getAttribute("data-year") === year;
        var matchType = !type || item.getAttribute("data-type") === type;
        var matchRegion = !region || item.getAttribute("data-region") === region;
        item.hidden = !(matchKeyword && matchYear && matchType && matchRegion);
      });
    }

    [input, yearSelect, typeSelect, regionSelect].forEach(function (field) {
      if (field) {
        field.addEventListener("input", applyFilters);
        field.addEventListener("change", applyFilters);
      }
    });
  });

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-to]"));
    var prev = slider.querySelector("[data-slide-prev]");
    var next = slider.querySelector("[data-slide-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-to")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");
    var stream = player.getAttribute("data-stream");
    var ready = false;
    var hls = null;

    function prepare() {
      if (!video || !stream || ready) {
        return;
      }
      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function startPlayback() {
      prepare();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (video) {
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener("click", startPlayback);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!ready || video.paused) {
          startPlayback();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
});
