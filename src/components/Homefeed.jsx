function HomeFeed({ videos, onPlayVideo, onChannelClick }) {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-x-4 gap-y-10 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:px-6 xl:px-12">
      {videos.map((video, index) => {
        const channelName =
          typeof video.channel === "object"
            ? video.channel?.name || "Unknown"
            : video.channel || "Unknown";

        return (
          <article
            key={video.videoId ?? `home-video-${index}`}
            onClick={() => onPlayVideo(video.videoId, true)}
            className="group flex cursor-pointer flex-col gap-3"
          >
            {/* Thumbnail Area */}
            <div className="relative w-full overflow-hidden rounded-xl bg-[#272727] pb-[56.25%]">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#272727] text-slate-500">
                  No Thumbnail
                </div>
              )}
              <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
                {video.duration || "10:00"}
              </span>
            </div>

            <div className="flex gap-3 pr-6">
              {/* Channel Avatar (Clickable) */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (onChannelClick && video.channelId) {
                    onChannelClick(video.channelId);
                  }
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3ea6ff] text-sm font-bold text-[#0f0f0f] hover:opacity-80 cursor-pointer"
              >
                {channelName.charAt(0).toUpperCase()}
              </div>

              {/* Title and Stats */}
              <div className="flex flex-1 flex-col">
                <h3 className="line-clamp-2 text-sm font-medium text-[#f1f1f1] group-hover:text-white">
                  {video.title}
                </h3>
                <p
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onChannelClick && video.channelId) {
                      onChannelClick(video.channelId);
                    }
                  }}
                  className="mt-1 text-[13px] text-[#aaaaaa] transition-colors hover:text-white cursor-pointer"
                >
                  {channelName}
                </p>
                <p className="text-[13px] text-[#aaaaaa]">
                  {video.views} • {video.time}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default HomeFeed;
