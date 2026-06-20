(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    shells.forEach(function (shell) {
      var video = shell.querySelector("video[data-source]");
      var start = shell.querySelector("[data-player-start]");
      var message = shell.querySelector("[data-player-message]");
      var hlsInstance = null;
      var attached = false;

      function showMessage(text) {
        if (message) {
          message.textContent = text;
          message.classList.add("is-visible");
        }
      }

      function attachSource() {
        if (!video || attached) {
          return Promise.resolve();
        }

        var source = video.getAttribute("data-source");

        if (!source) {
          showMessage("播放暂不可用，请稍后重试");
          return Promise.reject(new Error("missing source"));
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          attached = true;
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          attached = true;
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              showMessage("播放暂不可用，请稍后重试");
            }
          });
          return Promise.resolve();
        }

        showMessage("播放暂不可用，请稍后重试");
        return Promise.reject(new Error("hls unsupported"));
      }

      function playVideo() {
        attachSource().then(function () {
          shell.classList.add("is-playing");
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
              shell.classList.remove("is-playing");
            });
          }
        }).catch(function () {
          shell.classList.remove("is-playing");
        });
      }

      if (start) {
        start.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("play", function () {
          shell.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          shell.classList.remove("is-playing");
        });
        video.addEventListener("ended", function () {
          shell.classList.remove("is-playing");
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
