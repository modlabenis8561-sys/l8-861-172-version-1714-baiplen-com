(function () {
    var button = document.querySelector('[data-play-button]');
    var video = document.querySelector('[data-player]');

    if (!button || !video) {
        return;
    }

    function playVideo() {
        var source = video.getAttribute('data-src');

        if (!source) {
            return;
        }

        button.classList.add('is-hidden');

        if (video.getAttribute('data-loaded') === 'true') {
            video.play().catch(function () {});
            return;
        }

        video.setAttribute('data-loaded', 'true');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            window.__activeHlsPlayer = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    video.src = source;
                    video.play().catch(function () {});
                }
            });
            return;
        }

        video.src = source;
        video.play().catch(function () {});
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });
})();
