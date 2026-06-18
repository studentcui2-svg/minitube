import heroImg from "../assets/hero.png";

// A helper delay to simulate network loading for the skeleton loaders
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWatchPageData(category = "All", searchQuery = "") {
  // 1. THIS FIXES THE ESLINT ERROR: We "use" the variables by logging them.
  // This also helps you debug and see when your App triggers a new fetch!
  console.log(
    `[API Request] Category: "${category}" | Search: "${searchQuery}"`,
  );

  await delay(800); // Simulate API load

  return {
    categories: [
      "All",
      "Gaming",
      "Music",
      "Live",
      "Coding",
      "Podcasts",
      "AI",
      "News",
    ],
    sidebarLinks: [
      { label: "Home", icon: "🏠" },
      { label: "Shorts", icon: "📱" },
      { label: "Subscriptions", icon: "📺" },
      { label: "Library", icon: "📚" },
      { label: "History", icon: "🕒" },
      { label: "Watch later", icon: "🕒" },
    ],
    recommendedVideos: [
      {
        videoId: "dQw4w9WgXcQ",
        title: "Design a scalable homepage for your own video streaming app",
        channel: "Pixel Forge",
        views: "410K views",
        time: "1 day ago",
        duration: "18:42",
        thumbnail: heroImg,
      },
      {
        videoId: "M7lc1UVf-VE",
        title: "How to wire an API-driven feed with responsive cards",
        channel: "UI Signal",
        views: "235K views",
        time: "4 days ago",
        duration: "12:05",
        thumbnail: heroImg,
      },
      {
        videoId: "LXb3EKWsInQ",
        title:
          "Creator dashboards, analytics, and upload flows in one interface",
        channel: "Studio Grid",
        views: "128K views",
        time: "1 week ago",
        duration: "22:19",
        thumbnail: heroImg,
      },
    ],
    featuredVideo: {
      videoId: "dQw4w9WgXcQ",
      title:
        "Build a modern video platform with a clean creator-first interface",
      category: "Featured",
      views: "1.2M views",
      publishedAt: "2 hours ago",
      description:
        "This structure gives you a strong YouTube-style foundation with a top navigation bar, sidebar, player area, metadata panel, comments, live chat, and an up-next rail. Swap in your API data when ready and keep the layout intact.",
      channel: {
        name: "VideoFlow Studio",
        subscribers: "2.4M subscribers",
      },
    },
    stats: [
      { label: "Likes", value: "84K" },
      { label: "Comments", value: "12.5K" },
      { label: "Shares", value: "4.8K" },
    ],
    liveChat: [
      {
        user: "Mina",
        message: "This layout is perfect for plugging in a live stream API.",
      },
      {
        user: "Devon",
        message:
          "The right rail and comments section are exactly what I needed.",
      },
      {
        user: "Sara",
        message:
          "Nice. I can already see where the video and metadata endpoints go.",
      },
    ],
    comments: [
      {
        user: "Arjun",
        time: "3m ago",
        text: "Clean structure. The page feels ready for real video and channel data.",
      },
      {
        user: "Nora",
        time: "12m ago",
        text: "The split between featured content and recommendations makes sense.",
      },
      {
        user: "Theo",
        time: "27m ago",
        text: "This is a good base for a custom player, search, and upload flow.",
      },
    ],
  };
}
