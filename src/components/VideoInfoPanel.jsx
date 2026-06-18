import { useMemo, useState } from "react";

function YouTubeVideoInfo({ video, featuredVideo }) {
  const info = video ?? featuredVideo ?? {};
  const channel = info.channel ?? {};
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const likeLabel = useMemo(() => {
    if (!info.likes) {
      return liked ? "Liked" : "Like";
    }

    return liked ? `${info.likes} liked` : info.likes;
  }, [info.likes, liked]);

  const handleShare = async () => {
    const shareText = info.videoUrl || window.location.href;

    try {
      await navigator.clipboard.writeText(shareText);
      setShareMessage("Link copied");
      window.setTimeout(() => setShareMessage(""), 1500);
    } catch {
      setShareMessage("Copy failed");
      window.setTimeout(() => setShareMessage(""), 1500);
    }
  };

  return (
    <section className="flex w-full max-w-250 flex-col gap-3 font-sans text-[#f1f1f1]">
      {/* 1. Video Title */}
      <h1 className="text-xl font-bold sm:text-2xl">
        {info.title || "Video Title Goes Here"}
      </h1>

      {/* 2. Channel Info & Actions Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: Channel Avatar, Name, Subs, and Subscribe Button */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
            {(channel.name?.slice(0, 1) || "V").toUpperCase()}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-medium">
              {channel.name || "Channel Name"}
            </span>
            <span className="text-xs text-[#aaaaaa]">
              {channel.subscribers || "0"} subscribers
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSubscribed((value) => !value)}
            className={`ml-3 rounded-full px-4 py-2 text-sm font-medium transition ${
              subscribed
                ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                : "bg-[#f1f1f1] text-[#0f0f0f] hover:bg-[#d9d9d9]"
            }`}
          >
            {subscribed ? "Subscribed" : "Subscribe"}
          </button>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Like / Dislike Button */}
          <div className="flex items-center rounded-full bg-[#272727] text-sm font-medium">
            <button
              type="button"
              onClick={() => setLiked((value) => !value)}
              className="flex items-center gap-2 rounded-l-full border-r border-white/20 px-4 py-2 hover:bg-[#3f3f3f]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
              </svg>
              {likeLabel}
            </button>
            <button
              type="button"
              className="rounded-r-full px-4 py-2 hover:bg-[#3f3f3f]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
              </svg>
            </button>
          </div>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full bg-[#272727] px-4 py-2 text-sm font-medium hover:bg-[#3f3f3f]"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.7333 15.6667V12.3333C5.06667 12.3333 1.73333 17.3333 0 22.3333C1.33333 15.6667 5.06667 9 11.7333 9V5.66667L18.4 10.6667L11.7333 15.6667Z" />
            </svg>
            {shareMessage || "Share"}
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={() => setSaved((value) => !value)}
            className="flex items-center gap-2 rounded-full bg-[#272727] px-4 py-2 text-sm font-medium hover:bg-[#3f3f3f]"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
            </svg>
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* 3. Integrated Description Box */}
      <div className="mt-2 cursor-pointer rounded-xl bg-[#272727] p-3 text-sm transition hover:bg-[#3f3f3f]">
        <div className="mb-1 flex flex-wrap gap-2 font-semibold">
          <span>{info.views || "0"} views</span>
          <span>{info.publishedAt || ""}</span>
          {info.tags &&
            info.tags.map((tag) => (
              <span key={tag} className="text-[#3ea6ff]">
                {tag}
              </span>
            ))}
        </div>
        <p className="whitespace-pre-line text-[#f1f1f1]">
          {info.description || ""}
        </p>
      </div>
    </section>
  );
}

export default YouTubeVideoInfo;
