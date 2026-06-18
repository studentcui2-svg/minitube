import { useEffect, useState } from "react";
import HomeFeedSkeleton from "./Homefeedskelton";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YT_BASE = "https://www.googleapis.com/youtube/v3";

const compactNumber = (value) => {
  if (!value) return "0";
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value));
};

const formatRelativeTime = (publishedAt) => {
  const publishedDate = new Date(publishedAt);
  const elapsed = Date.now() - publishedDate.getTime();
  const days = Math.floor(elapsed / 86400000);
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
  return "Just now";
};

export default function ChannelPage({ channelId, onPlayVideo }) {
  const [channelData, setChannelData] = useState(null);
  const [channelVideos, setChannelVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchChannelInfo = async () => {
      setLoading(true);
      setError(false);
      try {
        if (!API_KEY) throw new Error("Missing API Key");

        // 1. Fetch Channel Banner, Avatar, and Stats
        const channelRes = await fetch(
          `${YT_BASE}/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${API_KEY}`,
        );
        const channelJson = await channelRes.json();
        const channel = channelJson.items?.[0];

        if (!channel) throw new Error("Channel not found");

        // 2. Fetch the Channel's Latest Videos
        const searchRes = await fetch(
          `${YT_BASE}/search?part=snippet&channelId=${channelId}&maxResults=16&order=date&type=video&key=${API_KEY}`,
        );
        const searchJson = await searchRes.json();

        const videoIds = searchJson.items
          .map((item) => item.id.videoId)
          .filter(Boolean);

        // 3. Fetch exact views and duration for those videos
        let videos = [];
        if (videoIds.length > 0) {
          const statsRes = await fetch(
            `${YT_BASE}/videos?part=contentDetails,statistics&id=${videoIds.join(",")}&key=${API_KEY}`,
          );
          const statsJson = await statsRes.json();

          videos = searchJson.items.map((item) => {
            const stats = statsJson.items.find((s) => s.id === item.id.videoId);
            return {
              videoId: item.id.videoId,
              title: item.snippet.title,
              thumbnail:
                item.snippet.thumbnails?.medium?.url ||
                item.snippet.thumbnails?.default?.url,
              views: stats
                ? `${compactNumber(stats.statistics?.viewCount)} views`
                : "Views hidden",
              time: formatRelativeTime(item.snippet.publishedAt),
            };
          });
        }

        if (isMounted) {
          setChannelData(channel);
          setChannelVideos(videos);
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

    if (channelId) fetchChannelInfo();

    return () => {
      isMounted = false;
    };
  }, [channelId]);

  if (loading)
    return (
      <div className="p-8">
        <HomeFeedSkeleton />
      </div>
    );
  if (error || !channelData)
    return (
      <div className="p-8 text-center text-white">Could not load channel.</div>
    );

  const bannerUrl = channelData.brandingSettings?.image?.bannerExternalUrl;
  const avatarUrl = channelData.snippet?.thumbnails?.high?.url;

  return (
    <div className="flex w-full flex-col pb-12">
      {/* Channel Banner */}
      {bannerUrl ? (
        <div
          className="h-32 sm:h-48 md:h-64 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerUrl})` }}
        />
      ) : (
        <div className="h-32 w-full bg-[#272727]" />
      )}

      {/* Channel Header Info */}
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-8 sm:flex-row sm:items-start sm:px-12">
        <img
          src={avatarUrl}
          alt={channelData.snippet.title}
          className="h-32 w-32 rounded-full object-cover sm:h-40 sm:w-40"
        />
        <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
          <h1 className="text-2xl font-bold text-white sm:text-4xl">
            {channelData.snippet.title}
          </h1>
          <div className="mt-2 text-sm text-[#aaaaaa]">
            <span>{channelData.snippet.customUrl || "User"}</span>
            <span className="mx-2">•</span>
            <span>
              {compactNumber(channelData.statistics.subscriberCount)}{" "}
              subscribers
            </span>
            <span className="mx-2">•</span>
            <span>
              {compactNumber(channelData.statistics.videoCount)} videos
            </span>
          </div>
          <p className="mt-4 max-w-2xl text-sm text-[#aaaaaa] line-clamp-2">
            {channelData.snippet.description}
          </p>
          <button className="mt-6 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-gray-200">
            Subscribe
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl border-b border-white/10 px-4 sm:px-12">
        <div className="inline-block border-b-2 border-white pb-3 font-semibold text-white">
          Latest Videos
        </div>
      </div>

      {/* Channel Videos Grid */}
      <div className="mx-auto mt-8 grid w-full max-w-7xl grid-cols-1 gap-x-4 gap-y-10 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:px-12">
        {channelVideos.map((video) => (
          <article
            key={video.videoId}
            onClick={() => onPlayVideo(video.videoId, true)}
            className="group flex cursor-pointer flex-col gap-3"
          >
            <div className="relative w-full overflow-hidden rounded-xl bg-[#272727] pb-[56.25%]">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col pr-6">
              <h3 className="line-clamp-2 text-sm font-medium text-[#f1f1f1] group-hover:text-white">
                {video.title}
              </h3>
              <p className="mt-1 text-[13px] text-[#aaaaaa]">
                {video.views} • {video.time}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
