import { useEffect, useRef, useState } from "react";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YT_BASE = "https://www.googleapis.com/youtube/v3";

// Helper to format large numbers
const compactNumber = (value) => {
  if (!value) return "0";
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value));
};

// Helper to shuffle an array randomly
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Pool of random search queries to ensure fresh content on reload
const SHORTS_QUERIES = [
  "#shorts trending",
  "#shorts funny",
  "#shorts gaming",
  "#shorts satisfying",
  "#shorts motivation",
  "#shorts music",
  "#shorts tech",
  "#shorts comedy",
];

function ShortVideo({ short, isActive }) {
  return (
    <div className="relative flex h-full w-full max-w-112.5 flex-col items-center justify-center snap-center px-4 sm:px-0">
      <div className="relative flex h-[85%] max-h-212.5 min-h-150 w-full min-w-[320px] flex-col overflow-hidden rounded-2xl bg-black shadow-2xl">
        {isActive ? (
          <iframe
            className="absolute inset-0 h-full w-full pointer-events-none scale-[1.35]"
            src={`https://www.youtube.com/embed/${short.id}?autoplay=1&loop=1&mute=0&controls=0&modestbranding=1&playlist=${short.id}&playsinline=1`}
            title="YouTube Short"
            frameBorder="0"
            allow="autoplay; encrypted-media"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#272727] text-[#aaaaaa]">
            <svg
              className="h-10 w-10 animate-spin text-[#aaaaaa]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}

        {/* Right Side Action Buttons */}
        <div className="absolute bottom-6 right-4 z-10 flex flex-col items-center gap-5">
          <button className="group flex flex-col items-center gap-1 text-white transition hover:text-gray-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm group-hover:bg-black/70">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold">{short.likes}</span>
          </button>
          <button className="group flex flex-col items-center gap-1 text-white transition hover:text-gray-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm group-hover:bg-black/70">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold">{short.comments}</span>
          </button>
          <button className="group flex flex-col items-center gap-1 text-white transition hover:text-gray-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm group-hover:bg-black/70">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 7.82v8.37L15 12l-4-4.18zm4.24-4.59L14 1.5V6H5c-1.1 0-2 .9-2 2v6h2V8h9v4.5l1.24-1.73L21 12l-5.76-8.77z" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold">Share</span>
          </button>
        </div>

        {/* Bottom Metadata */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-3 bg-linear-to-t from-black/90 via-black/40 to-transparent p-4 pr-20 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3ea6ff] text-sm font-bold text-black">
              {short.channel.charAt(0).toUpperCase()}
            </div>
            <span className="text-[15px] font-bold">{short.channel}</span>
            <button className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black transition hover:bg-gray-200">
              Subscribe
            </button>
          </div>
          {/* Changed text-[14px] to the canonical text-sm class */}
          <p className="text-sm font-medium leading-snug drop-shadow-md line-clamp-2">
            {short.title}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ShortsFeed() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRealShorts = async () => {
      try {
        if (!API_KEY) throw new Error("Missing YouTube API Key");

        // Pick a random query from our pool to ensure fresh results
        const randomQuery =
          SHORTS_QUERIES[Math.floor(Math.random() * SHORTS_QUERIES.length)];

        // Fetch 15 results instead of 10 so we have enough to shuffle and pick from
        const searchRes = await fetch(
          `${YT_BASE}/search?part=snippet&maxResults=15&q=${encodeURIComponent(randomQuery)}&type=video&videoDuration=short&key=${API_KEY}`,
        );

        if (!searchRes.ok) throw new Error("Failed to fetch Shorts");
        const searchData = await searchRes.json();

        const videoIds = searchData.items
          .map((item) => item.id.videoId)
          .filter(Boolean);
        if (videoIds.length === 0) throw new Error("No Shorts found");

        // Fetch statistics for likes and comments
        const statsRes = await fetch(
          `${YT_BASE}/videos?part=statistics&id=${videoIds.join(",")}&key=${API_KEY}`,
        );
        const statsData = await statsRes.json();

        const statsMap = {};
        statsData.items.forEach((item) => {
          statsMap[item.id] = item.statistics;
        });

        const realShortsData = searchData.items.map((item) => {
          const videoId = item.id.videoId;
          return {
            id: videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            likes: compactNumber(statsMap[videoId]?.likeCount || 0),
            comments: compactNumber(statsMap[videoId]?.commentCount || 0),
          };
        });

        if (isMounted) {
          // Shuffle the array and take the top 10 so the order is randomized every reload!
          setShorts(shuffleArray(realShortsData).slice(0, 10));
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchRealShorts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollPosition = containerRef.current.scrollTop;
    const windowHeight = containerRef.current.clientHeight;
    const index = Math.round(scrollPosition / windowHeight);
    setActiveIndex(index);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center bg-[#0f0f0f]">
        <div className="flex flex-col items-center gap-4 text-[#aaaaaa]">
          <svg
            className="h-10 w-10 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="font-semibold text-white">Finding fresh Shorts...</p>
        </div>
      </div>
    );
  }

  if (error || shorts.length === 0) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center bg-[#0f0f0f]">
        <div className="rounded-xl bg-[#272727] p-6 text-center text-white">
          <p className="font-bold">Couldn't load Shorts.</p>
          <p className="mt-2 text-sm text-[#aaaaaa]">
            Check your network or API Quota.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[calc(100vh-56px)] w-full snap-y snap-mandatory overflow-y-scroll bg-[#0f0f0f] pb-20 scrollbar-hide"
      style={{
        scrollBehavior: "smooth",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      {shorts.map((short, index) => (
        <div
          key={short.id}
          className="flex h-full w-full snap-start justify-center py-4"
        >
          <ShortVideo short={short} isActive={index === activeIndex} />
        </div>
      ))}
    </div>
  );
}
