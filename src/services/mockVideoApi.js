// 1. NO IMPORTS NEEDED HERE ANYMORE! We define the static data right below.

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YT_BASE = "https://www.googleapis.com/youtube/v3";
const REGION_CODE = "US";

// Static UI Data (Replaces your old siteContent import)
const categories = [
  "All",
  "Gaming",
  "Music",
  "Live",
  "Coding",
  "Podcasts",
  "AI",
  "News",
];

const sidebarLinks = [
  { label: "Home", icon: "🏠" },
  { label: "Shorts", icon: "📱" },
  { label: "Subscriptions", icon: "📺" },
  { label: "Library", icon: "📚" },
  { label: "History", icon: "🕒" },
  { label: "Watch later", icon: "🕒" },
];

const liveChat = [
  {
    user: "Mina",
    message: "This layout is perfect for plugging in a live stream API.",
  },
  {
    user: "Devon",
    message: "The right rail and comments section are exactly what I needed.",
  },
  {
    user: "Sara",
    message:
      "Nice. I can already see where the video and metadata endpoints go.",
  },
];

const DEFAULT_CATEGORY_QUERY = {
  All: "",
  Gaming: "gaming",
  Music: "music",
  Live: "live stream",
  Coding: "programming",
  Podcasts: "podcast",
  AI: "artificial intelligence",
  News: "news",
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const compactNumber = (value) => {
  const numericValue = Number(value ?? 0);
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(numericValue);
};

const formatDuration = (duration = "") => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const formatRelativeTime = (publishedAt) => {
  const publishedDate = new Date(publishedAt);
  const elapsed = Date.now() - publishedDate.getTime();
  const minutes = Math.floor(elapsed / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  return "Just now";
};

async function requestJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with status ${response.status}`);
  }
  return response.json();
}

async function fetchVideoIdsByCategory(selectedCategory, searchQuery = "") {
  if (!API_KEY) {
    throw new Error("Missing VITE_YOUTUBE_API_KEY in your .env file.");
  }

  const trimmedSearchQuery = searchQuery.trim();
  const categoryQuery =
    DEFAULT_CATEGORY_QUERY[selectedCategory] ?? selectedCategory;

  if (trimmedSearchQuery) {
    const combinedQuery = [categoryQuery, trimmedSearchQuery]
      .filter(Boolean)
      .join(" ");
    const searchResponse = await requestJson(
      `${YT_BASE}/search?part=snippet&type=video&order=relevance&maxResults=12&regionCode=${REGION_CODE}&safeSearch=moderate&q=${encodeURIComponent(combinedQuery)}&key=${API_KEY}`,
    );

    const videoIds = (searchResponse.items ?? [])
      .map((item) => item.id?.videoId)
      .filter(Boolean);
    if (videoIds.length === 0) return [];

    const detailsResponse = await requestJson(
      `${YT_BASE}/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(",")}&key=${API_KEY}`,
    );

    const detailsMap = new Map(
      (detailsResponse.items ?? []).map((item) => [item.id, item]),
    );
    return videoIds.map((videoId) => detailsMap.get(videoId)).filter(Boolean);
  }

  if (selectedCategory === "All") {
    const popularResponse = await requestJson(
      `${YT_BASE}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=12&regionCode=${REGION_CODE}&key=${API_KEY}`,
    );
    return popularResponse.items ?? [];
  }

  const searchResponse = await requestJson(
    `${YT_BASE}/search?part=snippet&type=video&order=relevance&maxResults=12&regionCode=${REGION_CODE}&safeSearch=moderate&q=${encodeURIComponent(categoryQuery)}&key=${API_KEY}`,
  );

  const videoIds = (searchResponse.items ?? [])
    .map((item) => item.id?.videoId)
    .filter(Boolean);
  if (videoIds.length === 0) return [];

  const detailsResponse = await requestJson(
    `${YT_BASE}/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(",")}&key=${API_KEY}`,
  );

  const detailsMap = new Map(
    (detailsResponse.items ?? []).map((item) => [item.id, item]),
  );
  return videoIds.map((videoId) => detailsMap.get(videoId)).filter(Boolean);
}

async function fetchChannelSummary(channelId) {
  if (!API_KEY || !channelId) return null;

  try {
    const response = await requestJson(
      `${YT_BASE}/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`,
    );
    const channel = response.items?.[0];
    if (!channel) return null;

    return {
      name: channel.snippet?.title ?? "Unknown channel",
      subscribers: `${compactNumber(channel.statistics?.subscriberCount)} subscribers`,
    };
  } catch {
    return null;
  }
}

async function fetchLiveComments(videoId) {
  if (!API_KEY || !videoId) return []; // Return empty if no real comments

  try {
    const response = await requestJson(
      `${YT_BASE}/commentThreads?part=snippet&videoId=${videoId}&maxResults=6&order=relevance&textFormat=plainText&key=${API_KEY}`,
    );

    const items = response.items ?? [];
    if (items.length === 0) return [];

    return items.map((item) => {
      const snippet = item.snippet?.topLevelComment?.snippet ?? {};
      return {
        user: snippet.authorDisplayName ?? "Viewer",
        time: formatRelativeTime(
          snippet.publishedAt ?? new Date().toISOString(),
        ),
        text: snippet.textDisplay ?? "",
      };
    });
  } catch {
    return [];
  }
}

function mapVideoItem(item) {
  const snippet = item.snippet ?? {};
  const statistics = item.statistics ?? {};

  return {
    videoId: item.id, // CRITICAL FIX: Changed from 'id' to 'videoId' to match your components!
    title: snippet.title ?? "Untitled video",
    channel: snippet.channelTitle ?? "Unknown channel",
    channelId: snippet.channelId,
    views: `${compactNumber(statistics.viewCount)} views`,
    time: formatRelativeTime(snippet.publishedAt ?? new Date().toISOString()),
    duration: formatDuration(item.contentDetails?.duration),
    thumbnail:
      snippet.thumbnails?.high?.url ??
      snippet.thumbnails?.medium?.url ??
      snippet.thumbnails?.default?.url ??
      "",
    videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
    description: snippet.description ?? "",
    publishedAt: snippet.publishedAt ?? new Date().toISOString(),
    statistics,
  };
}

export async function fetchWatchPageData(
  selectedCategory = "All",
  searchQuery = "",
) {
  await wait(300); // Slight wait for smooth skeleton loading

  const items = await fetchVideoIdsByCategory(selectedCategory, searchQuery);
  const videos = items.map(mapVideoItem);

  if (videos.length === 0) {
    throw new Error(
      "No videos were returned from YouTube. (Check your API Key and Quota)",
    );
  }

  const featured = videos[0];
  const [channel, liveComments] = await Promise.all([
    fetchChannelSummary(featured.channelId),
    fetchLiveComments(featured.videoId),
  ]);

  const stats = [
    { label: "Views", value: featured.views },
    {
      label: "Likes",
      value:
        featured.statistics.likeCount !== undefined
          ? compactNumber(featured.statistics.likeCount)
          : "Hidden",
    },
    { label: "Videos", value: String(videos.length) },
  ];

  return {
    categories,
    sidebarLinks,
    featuredVideo: {
      ...featured,
      category: selectedCategory,
      channel: channel ?? {
        name: featured.channel,
        subscribers: "Subscriber count unavailable",
      },
      description:
        featured.description ||
        "This video is loaded directly from the YouTube Data API.",
    },
    stats,
    liveChat, // Providing our static fallback live chat
    comments: liveComments.length > 0 ? liveComments : [], // Fallback to empty array if no comments exist
    recommendedVideos: videos.slice(1, 11),
    activeCategory: selectedCategory,
    player: {
      currentTime: "0:00",
      duration: featured.duration,
      buffered: 100,
      autoplay: true,
      captions: true,
      quality: "Auto",
      videoId: featured.videoId, // Properly matches the mapping
      videoUrl: featured.videoUrl,
    },
  };
}
