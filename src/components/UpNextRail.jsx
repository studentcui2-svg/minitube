import { useState } from "react";

function UpNextRail({ videos, onPlayVideo }) {
  // Typical YouTube filter chips
  const filters = ["All", "Related", "Recently uploaded", "Watched"];
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <aside className="flex w-full flex-col gap-4 font-sans lg:w-100">
      {/* 1. Scrolling Filter Chips */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "bg-[#f1f1f1] text-[#0f0f0f]"
                : "bg-[#272727] text-[#f1f1f1] hover:bg-[#3f3f3f]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* 2. Video Recommendations List */}
      <div className="flex flex-col gap-3">
        {videos.map((video) => (
          <div key={video.videoId ?? video.title} className="group flex gap-2">
            {/* Clickable Thumbnail Area */}
            <button
              onClick={() => onPlayVideo?.(video.videoId ?? null, true)}
              className="relative h-23.5 w-42 shrink-0 overflow-hidden rounded-xl bg-[#272727]"
              aria-label={`Play ${video.title}`}
            >
              <img
                src={video.thumbnail}
                alt="" // Decorative since title is next to it
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
                {video.duration}
              </span>
            </button>

            {/* Video Metadata Area */}
            <div className="relative flex flex-1 flex-col pr-6">
              <button
                onClick={() => onPlayVideo?.(video.videoId ?? null, true)}
                className="text-left"
              >
                <h3 className="line-clamp-2 text-sm font-medium leading-5 text-[#f1f1f1] group-hover:text-white">
                  {video.title}
                </h3>
              </button>

              <div className="mt-1 flex flex-col">
                <a
                  href={`/channel/${video.channelId}`}
                  className="text-xs text-[#aaaaaa] hover:text-[#f1f1f1] transition-colors"
                >
                  {video.channel}
                </a>
                <p className="text-xs text-[#aaaaaa]">
                  {video.views} • {video.time}
                </p>
              </div>

              {/* YouTube-style 3-dot menu (Visible on hover) */}
              <button
                className="absolute right-0 top-0 hidden p-1 text-[#aaaaaa] hover:text-[#f1f1f1] group-hover:block"
                aria-label="Action menu"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default UpNextRail;
