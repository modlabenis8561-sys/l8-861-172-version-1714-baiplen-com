const loadHls = async () => {
  const module = await import('./hls-vendor-dru42stk.js');
  return module.H;
};

const attachStream = async (video, url) => {
  if (video.dataset.ready === 'true') {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
    video.dataset.ready = 'true';
    return;
  }

  try {
    const Hls = await loadHls();
    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video.dataset.ready = 'true';
      video._hls = hls;
      return;
    }
  } catch (error) {
    video.dataset.error = 'true';
  }

  video.src = url;
  video.dataset.ready = 'true';
};

document.querySelectorAll('[data-player]').forEach((player) => {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const stream = player.dataset.stream;

  if (!video || !stream) {
    return;
  }

  const start = async () => {
    if (button) {
      button.classList.add('is-hidden');
    }
    await attachStream(video, stream);
    const play = video.play();
    if (play && typeof play.catch === 'function') {
      play.catch(() => {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  };

  if (button) {
    button.addEventListener('click', start);
  }

  video.addEventListener('click', () => {
    if (video.paused) {
      start();
    }
  });
});
