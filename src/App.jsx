import { useEffect, useState } from "react";
import Header from "./components/Header";
import SidebarDrawer from "./components/SidebarDrawer";
import CategoryPills from "./components/CategoryPills";
import FeaturedPlayer from "./components/FeaturedPlayer";
import VideoInfoPanel from "./components/VideoInfoPanel";
import ChatPanel from "./components/ChatPanel";
import CommentsPanel from "./components/CommentsPanel";
import UpNextRail from "./components/UpNextRail";
import WatchPageSkeleton from "./components/WatchPageSkeleton";
import HomeFeedSkeleton from "./components/Homefeedskelton";
import HomeFeed from "./components/Homefeed";
import ShortsFeed from "./components/shortfeed";
import ChannelPage from "./components/channelpage"; // <--- Imported Channel Page
import { fetchWatchPageData } from "./services/mockVideoApi";

function App() {
  const [watchPageData, setWatchPageData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [activeSidebarLabel, setActiveSidebarLabel] = useState("Home");

  // ROUTER STATES
  const [currentView, setCurrentView] = useState("home"); // "home" | "watch" | "shorts" | "channel"
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [currentChannelId, setCurrentChannelId] = useState(null); // <--- Added to track clicked channel

  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [comments, setComments] = useState([]);
  const [liveMessages, setLiveMessages] = useState([]);

  useEffect(() => {
    let isMounted = true;

    fetchWatchPageData(selectedCategory, searchQuery)
      .then((data) => {
        if (isMounted) {
          setWatchPageData(data);
          setComments(data?.comments ?? []);
          setLiveMessages(data?.liveChat ?? []);
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setWatchPageData(null);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load the video feed",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery, reloadToken]);

  const handleCategoryChange = (category) => {
    if (category === "Shorts") {
      setCurrentView("shorts");
      setCurrentVideoId(null);
      setSelectedCategory("Shorts");
      setDrawerOpen(false);
      return;
    }

    setCurrentView("home");
    setLoading(true);
    setError("");
    setWatchPageData(null);
    setCurrentVideoId(null);
    setSelectedCategory(category);
    setDrawerOpen(false);
  };

  const handleSearchSubmit = (queryText) => {
    setCurrentView("home");
    setLoading(true);
    setError("");
    setWatchPageData(null);
    setCurrentVideoId(null);
    setSearchQuery(queryText);
  };

  const handleSidebarSelect = (label) => {
    setActiveSidebarLabel(label);

    if (label === "Shorts") {
      setCurrentView("shorts");
      setCurrentVideoId(null);
      setSelectedCategory("Shorts");
      setDrawerOpen(false);
    } else if (label === "Home") {
      setCurrentView("home");
      setCurrentVideoId(null);
      setSelectedCategory("All");
      setDrawerOpen(false);
    }
  };

  const handlePlayVideo = (videoId, autoplay = true) => {
    setCurrentView("watch");
    setCurrentVideoId(videoId);
    setShouldAutoplay(Boolean(autoplay));
  };

  // Handler for clicking a channel avatar/name
  const handleChannelClick = (channelId) => {
    setCurrentView("channel");
    setCurrentChannelId(channelId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePostComment = (commentText) => {
    setComments((currentComments) => [
      {
        user: "You",
        time: "Just now",
        text: commentText,
      },
      ...currentComments,
    ]);
  };

  const handleSendChat = (messageText) => {
    setLiveMessages((currentMessages) => [
      ...currentMessages,
      {
        user: "You",
        message: messageText,
      },
    ]);
  };

  const fallbackCategories = [
    "All",
    "Shorts",
    "Live",
    "News",
    "Music",
    "Mixes",
    "Gaming",
    "Podcasts",
  ];

  const rawCategories = watchPageData?.categories ?? fallbackCategories;
  const displayCategories = rawCategories.includes("Shorts")
    ? rawCategories
    : ["All", "Shorts", ...rawCategories.filter((c) => c !== "All")];

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1] font-sans selection:bg-[#3ea6ff] selection:text-white overflow-hidden">
      <Header
        onMenuClick={() => setDrawerOpen(true)}
        searchQuery={searchInput}
        onSearchQueryChange={setSearchInput}
        onSearch={handleSearchSubmit}
      />

      {/* =========================================================
          VIEW 1: SHORTS FEED
          ========================================================= */}
      {currentView === "shorts" && (
        <div className="w-full flex flex-col h-[calc(100vh-56px)]">
          <div className="px-4 py-3 sm:px-6 xl:px-12 shrink-0">
            <CategoryPills
              categories={displayCategories}
              activeCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              loading={loading}
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <ShortsFeed />
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 2: HOME PAGE GRID
          ========================================================= */}
      {currentView === "home" && (
        <div className="w-full pb-8 h-[calc(100vh-56px)] overflow-y-auto">
          <div className="px-4 py-3 sm:px-6 xl:px-12">
            <CategoryPills
              categories={displayCategories}
              activeCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              loading={loading}
            />
          </div>

          {loading || !watchPageData ? (
            <HomeFeedSkeleton />
          ) : (
            <HomeFeed
              videos={[
                watchPageData.featuredVideo,
                ...watchPageData.recommendedVideos,
              ].filter(Boolean)}
              onPlayVideo={handlePlayVideo}
              onChannelClick={handleChannelClick} // <--- Pass click handler down
            />
          )}
        </div>
      )}

      {/* =========================================================
          VIEW 3: WATCH PAGE
          ========================================================= */}
      {currentView === "watch" && (
        <div className="h-[calc(100vh-56px)] w-full overflow-y-auto">
          <div className="mx-auto flex max-w-[1800px] flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6 xl:px-12">
            <section className="min-w-0 flex-1 space-y-4">
              <div className="mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentView("home");
                    setCurrentVideoId(null);
                    setShouldAutoplay(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  aria-label="Back to Home"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1f1f1f]/70 px-3 py-2 text-sm font-medium hover:bg-[#2b2b2b]"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                  </svg>
                  <span className="hidden sm:inline">Back</span>
                </button>
              </div>

              {error ? (
                <div className="rounded-xl border border-[#ff0000]/20 bg-[#ff0000]/10 p-6">
                  <p className="text-sm font-semibold text-[#f1f1f1]">
                    Could not load video
                  </p>
                  <p className="mt-2 text-sm text-[#aaaaaa]">{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoading(true);
                      setError("");
                      setReloadToken((value) => value + 1);
                    }}
                    className="mt-4 rounded-full bg-[#3ea6ff] px-4 py-2 text-sm font-semibold text-[#0f0f0f] hover:bg-[#65b8ff]"
                  >
                    Retry
                  </button>
                </div>
              ) : loading || !watchPageData ? (
                <WatchPageSkeleton />
              ) : (
                <>
                  <FeaturedPlayer
                    featuredVideo={watchPageData.featuredVideo}
                    player={{
                      ...watchPageData.player,
                      videoId: currentVideoId,
                    }}
                    autoplay={shouldAutoplay}
                  />
                  <VideoInfoPanel
                    featuredVideo={watchPageData.featuredVideo}
                    stats={watchPageData.stats}
                  />
                  <CommentsPanel
                    comments={comments}
                    onPostComment={handlePostComment}
                  />
                </>
              )}
            </section>

            <aside className="w-full shrink-0 space-y-6 lg:w-100">
              {loading || !watchPageData ? (
                <WatchPageSkeleton compact />
              ) : error ? null : (
                <>
                  {liveMessages.length > 0 && (
                    <ChatPanel
                      messages={liveMessages}
                      onSendMessage={handleSendChat}
                    />
                  )}
                  <UpNextRail
                    videos={watchPageData.recommendedVideos}
                    onPlayVideo={handlePlayVideo}
                  />
                </>
              )}
            </aside>
          </div>
        </div>
      )}

      {/* =========================================================
          VIEW 4: CHANNEL PROFILE PAGE
          ========================================================= */}
      {currentView === "channel" && (
        <div className="h-[calc(100vh-56px)] w-full overflow-y-auto">
          <ChannelPage
            channelId={currentChannelId}
            onPlayVideo={handlePlayVideo}
          />
        </div>
      )}

      <SidebarDrawer
        isOpen={drawerOpen}
        categories={displayCategories}
        sidebarLinks={watchPageData?.sidebarLinks ?? []}
        activeCategory={selectedCategory}
        activeSidebarLabel={activeSidebarLabel}
        onSidebarSelect={handleSidebarSelect}
        onClose={() => setDrawerOpen(false)}
        onCategoryChange={handleCategoryChange}
      />
    </main>
  );
}

export default App;
