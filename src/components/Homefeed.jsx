import { useEffect, useState, useCallback, useRef } from "react";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YT_BASE = "https://www.googleapis.com/youtube/v3";

const RANDOM_QUERIES = [
  "latest tech news",
  "gaming live",
  "coding tutorial",
  "music mix",
  "space documentaries",
  "funny highlights",
  "productivity hacks",
];

export default function Homefeed() {
  const [videos, setVideos] = useState([]);
  const [nextPageToken, setNextPageToken] = useState("");
  const [loading, setLoading] = useState(false);
  const observer = useRef();

  // FIX 1: Move the random selection into a function or useMemo
  // to keep the render function "pure".
  const getRandomQuery = useCallback(() => {
    return RANDOM_QUERIES[Math.floor(Math.random() * RANDOM_QUERIES.length)];
  }, []);

  // FIX 2: We include getRandomQuery in the dependency array
  const fetchVideos = useCallback(
    async (pageToken = "") => {
      if (loading) return;
      setLoading(true);

      try {
        const query = getRandomQuery();
        const url = `${YT_BASE}/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}&pageToken=${pageToken}`;
        const response = await fetch(url);
        const data = await response.json();

        setVideos((prev) => [...prev, ...(data.items || [])]);
        setNextPageToken(data.nextPageToken || "");
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, getRandomQuery],
  );

  const lastVideoRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && nextPageToken) {
          fetchVideos(nextPageToken);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, nextPageToken, fetchVideos],
  );

  // FIX 3: useEffect now includes fetchVideos as a dependency
  // FIX 4: The effect body is now safe and follows React standards
  useEffect(() => {
    // Defer the initial fetch to avoid calling setState synchronously inside
    // the effect body which can cause cascading renders.
    const t = window.setTimeout(() => fetchVideos(), 0);
    return () => window.clearTimeout(t);
  }, [fetchVideos]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {videos.map((video, index) => {
        const isLast = videos.length === index + 1;
        return (
          <div ref={isLast ? lastVideoRef : null} key={video.id.videoId}>
            <VideoCard video={video} />
          </div>
        );
      })}
    </div>
  );
}

function VideoCard({ video }) {
  if (!video.snippet) return null;
  return (
    <div className="flex flex-col gap-2">
      <img
        src={video.snippet.thumbnails.medium.url}
        className="rounded-xl w-full"
        alt="thumbnail"
      />
      <h3 className="font-bold text-sm line-clamp-2">{video.snippet.title}</h3>
      <p className="text-xs text-gray-400">{video.snippet.channelTitle}</p>
    </div>
  );
}
