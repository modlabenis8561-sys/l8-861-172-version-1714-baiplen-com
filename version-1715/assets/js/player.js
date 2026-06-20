(function () {
  var loader = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadHls(callback, fail) {
    if (window.Hls) {
      callback();
      return;
    }

    if (loader) {
      loader.addEventListener("load", callback, { once: true });
      loader.addEventListener("error", fail, { once: true });
      return;
    }

    loader = document.createElement("script");
    loader.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
    loader.async = true;
    loader.addEventListener("load", callback, { once: true });
    loader.addEventListener("error", fail, { once: true });
    document.head.appendChild(loader);
  }

  function setupPlayer(frame) {
    var video = frame.querySelector("video");
    var button = frame.querySelector("[data-play-button]");
    var message = frame.querySelector("[data-player-message]");
    var stream = video ? video.getAttribute("data-stream") : "";
    var started = false;
    var hls = null;

    if (!video || !button || !stream) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function startVideo() {
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.then(function () {
          button.classList.add("hidden");
          setMessage("");
        }).catch(function () {
          button.classList.remove("hidden");
          setMessage("点击播放按钮开始观看");
        });
      } else {
        button.classList.add("hidden");
      }
    }

    function initAndPlay() {
      if (started) {
        startVideo();
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        started = true;
        startVideo();
        return;
      }

      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setMessage("视频加载失败，请稍后再试");
            }
          });
          started = true;
          startVideo();
        } else {
          setMessage("视频加载失败，请稍后再试");
        }
      }, function () {
        setMessage("视频加载失败，请稍后再试");
      });
    }

    button.addEventListener("click", function () {
      initAndPlay();
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        initAndPlay();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("hidden");
      setMessage("");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  });
})();
