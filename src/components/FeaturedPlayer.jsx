import { useEffect, useId, useRef, useState } from "react";

// Helper to translate YouTube's internal quality strings to human-readable labels
const QUALITY_LABELS = {
  highres: "4K / 1440p",
  hd1080: "1080p",
  hd720: "720p",
  large: "480p",
  medium: "360p",
  small: "240p",
  tiny: "144p",
  auto: "Auto",
};

function loadYouTubeIframeApi() {
  return new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    window._youtubeIframeApiResolvers = window._youtubeIframeApiResolvers || [];
    if (window._youtubeIframeApiLoading) {
      window._youtubeIframeApiResolvers.push(resolve);
      return;
    }

    window._youtubeIframeApiLoading = true;
    window._youtubeIframeApiResolvers.push(resolve);

    const originalCb = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try {
        const resolvers = window._youtubeIframeApiResolvers || [];
        resolvers.forEach((r) => r(window.YT));
      } finally {
        window._youtubeIframeApiResolvers = [];
        window._youtubeIframeApiLoading = false;
        if (typeof originalCb === "function") {
          originalCb();
        }
      }
    };

    const existingScript = document.querySelector(
      'script[data-youtube-iframe-api="true"]',
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.dataset.youtubeIframeApi = "true";
      script.onerror = () => {
        const resolvers = window._youtubeIframeApiResolvers || [];
        resolvers.forEach((r) => r(null));
        window._youtubeIframeApiResolvers = [];
        window._youtubeIframeApiLoading = false;
        reject(new Error("Failed to load YouTube Iframe API"));
      };
      document.head.appendChild(script);
    }
  });
}

function formatTime(seconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function FeaturedPlayer({ featuredVideo, player, autoplay = false }) {
  const playerContainerId = useId().replace(/:/g, "");
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const progressTimerRef = useRef(null);
  const timelineRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playerError, setPlayerError] = useState(false);

  // Quality Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [availableQualities, setAvailableQualities] = useState(["auto"]);
  const [currentQuality, setCurrentQuality] = useState("auto");
  useEffect(() => {
    let isMounted = true;

    // Notice how those three lines are NO LONGER here!

    loadYouTubeIframeApi().then((YT) => {
      if (!isMounted || !playerRef.current) return;

      // ✅ MOVED HERE! Inside the asynchronous .then() block
      setPlayerError(false);
      setShowSettings(false);
      setCurrentQuality("auto");

      if (playerInstanceRef.current) playerInstanceRef.current.destroy();

      playerInstanceRef.current = new YT.Player(playerRef.current, {
        videoId: player?.videoId || featuredVideo?.videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          autoplay: autoplay ? 1 : 0,
        },
        // ... the rest of the code continues normally
        events: {
          onReady: (event) => {
            if (!isMounted) return;
            setIsReady(true);
            setDuration(event.target.getDuration() || 0);
            if (autoplay) {
              try {
                event.target.playVideo?.();
              } catch {
                // ignore autoplay errors
              }
            }
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            const instance = playerInstanceRef.current;
            const playing = event.data === YT.PlayerState.PLAYING;
            setIsPlaying(playing);

            if (progressTimerRef.current) {
              window.clearInterval(progressTimerRef.current);
            }

            if (playing) {
              // Fetch available qualities once the video actually starts playing
              const qualities = instance.getAvailableQualityLevels();
              if (qualities && qualities.length > 0) {
                // YT sometimes doesn't include 'auto' in the array, so we ensure it's there
                setAvailableQualities(
                  qualities.includes("auto")
                    ? qualities
                    : ["auto", ...qualities],
                );
              }
              setCurrentQuality(instance.getPlaybackQuality() || "auto");

              progressTimerRef.current = window.setInterval(() => {
                setCurrentTime(instance?.getCurrentTime() || 0);
              }, 200);
            }
          },
          onError: (event) => {
            if (!isMounted) return;
            if (event.data === 101 || event.data === 150) {
              setPlayerError(true);
            }
          },
        },
      });
    });

    return () => {
      isMounted = false;
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      playerInstanceRef.current?.destroy();
    };
  }, [player?.videoId, featuredVideo?.videoId, autoplay]);

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    setShowSettings(false); // Close settings if clicking video
    const instance = playerInstanceRef.current;
    if (!instance) return;
    instance.getPlayerState() === window.YT.PlayerState.PLAYING
      ? instance.pauseVideo()
      : instance.playVideo();
  };

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    const instance = playerInstanceRef.current;
    if (!instance) return;
    if (instance.isMuted()) {
      instance.unMute();
      setIsMuted(false);
    } else {
      instance.mute();
      setIsMuted(true);
    }
  };

  const handleTimelineClick = (e) => {
    e.stopPropagation();
    setShowSettings(false);
    if (!timelineRef.current || !playerInstanceRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    playerInstanceRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const toggleFullScreen = (e) => {
    if (e) e.stopPropagation();
    setShowSettings(false);
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.() || el.webkitRequestFullscreen?.();
    }
  };

  const handleQualitySelect = (e, quality) => {
    e.stopPropagation();
    const instance = playerInstanceRef.current;
    if (instance && instance.setPlaybackQuality) {
      // Send the request to YouTube (Warning: YouTube may override this)
      instance.setPlaybackQuality(quality);
      setCurrentQuality(quality);
    }
    setShowSettings(false);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <article
      ref={containerRef}
      className="group relative w-full overflow-hidden rounded-xl bg-black font-sans shadow-2xl"
    >
      <div className="relative w-full pb-[56.25%]">
        <div
          id={playerContainerId}
          ref={playerRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={togglePlay}
          aria-label="Toggle Play"
        />

        {playerError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 px-4 text-center">
            <svg
              className="mb-4 h-12 w-12 text-[#aaaaaa]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <p className="mb-4 text-sm font-medium text-[#f1f1f1] sm:text-base">
              The creator of this video has disabled embedding.
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${
                player?.videoId || featuredVideo?.videoId
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#f1f1f1] px-5 py-2 text-sm font-medium text-[#0f0f0f] transition hover:bg-[#d9d9d9]"
            >
              Watch on YouTube
            </a>
          </div>
        )}

        {!isPlaying && isReady && !playerError && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/40">
            <button className="flex h-16 w-24 items-center justify-center rounded-2xl bg-[#ff0000] text-white transition-transform hover:scale-105">
              <svg
                className="ml-1 h-8 w-8"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}

        {/* Custom Settings Menu Popup */}
        {showSettings && (
          <div className="absolute bottom-16 right-4 z-30 flex w-48 flex-col rounded-xl bg-[#272727]/95 py-2 backdrop-blur-md">
            <div className="border-b border-white/10 px-4 pb-2 pt-1 text-xs font-semibold text-[#aaaaaa]">
              Quality
            </div>
            {availableQualities.map((quality) => (
              <button
                key={quality}
                onClick={(e) => handleQualitySelect(e, quality)}
                className={`flex items-center gap-3 px-4 py-2 text-sm text-left transition hover:bg-[#3f3f3f] ${
                  currentQuality === quality ? "text-white" : "text-[#aaaaaa]"
                }`}
              >
                {/* Checkmark for active quality */}
                <span className="w-4">
                  {currentQuality === quality && (
                    <svg
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                    >
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                    </svg>
                  )}
                </span>
                {QUALITY_LABELS[quality] || quality}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Control Bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col bg-linear-to-t from-black/90 via-black/50 to-transparent px-4 pb-2 pt-16 transition-opacity duration-300 ${
            isPlaying && !playerError && !showSettings
              ? "opacity-0 group-hover:opacity-100"
              : "opacity-100"
          }`}
        >
          <div
            ref={timelineRef}
            onClick={handleTimelineClick}
            className="group/timeline relative mb-2 flex h-1.5 w-full cursor-pointer items-center bg-white/20 transition-all hover:h-2"
          >
            <div
              className="absolute left-0 top-0 h-full bg-[#ff0000]"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="hidden absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#ff0000] group-hover/timeline:block" />
            </div>
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="hover:text-gray-300">
                {isPlaying ? (
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button onClick={toggleMute} className="hover:text-gray-300">
                {isMuted ? (
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>
              <div className="text-[13px] font-medium tracking-wide text-[#f1f1f1]">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1 text-[#aaaaaa]">/</span>
                <span className="text-[#aaaaaa]">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Settings Gear - Toggles the Quality Menu */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(!showSettings);
                }}
                className="hover:text-gray-300 relative"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
                </svg>
                {/* Red dot if quality isn't auto to show user changed it */}
                {currentQuality !== "auto" && (
                  <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-[#ff0000]"></span>
                )}
              </button>

              <button
                onClick={toggleFullScreen}
                className="hover:text-gray-300"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default FeaturedPlayer;
