import { useMemo, useState } from "react";

function CommentsPanel({ comments, onPostComment }) {
  const [draftComment, setDraftComment] = useState("");
  const [sortMode, setSortMode] = useState("top");

  const displayedComments = useMemo(() => {
    const list = [...comments];

    if (sortMode === "newest") {
      return list.reverse();
    }

    return list;
  }, [comments, sortMode]);

  const handlePost = () => {
    const trimmed = draftComment.trim();
    if (!trimmed) {
      return;
    }

    onPostComment?.(trimmed);
    setDraftComment("");
  };

  return (
    <section className="rounded-4xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/15 backdrop-blur-xl sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Comments</h2>
          <p className="text-sm text-slate-400">
            Built for your future API data
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setSortMode((mode) => (mode === "top" ? "newest" : "top"))
          }
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
        >
          Sort: {sortMode === "top" ? "Top" : "Newest"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
        <textarea
          rows={3}
          placeholder="Add a public comment..."
          value={draftComment}
          onChange={(event) => setDraftComment(event.target.value)}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Post a comment locally while you wire your API endpoint.
          </p>
          <button
            type="button"
            onClick={handlePost}
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Post
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {displayedComments.map((comment) => (
          <div
            key={comment.user}
            className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-400 to-blue-500 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20">
              {comment.user.slice(0, 1)}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-white">{comment.user}</p>
                <span className="text-xs text-slate-500">{comment.time}</span>
              </div>
              <p className="text-sm leading-6 text-slate-300">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CommentsPanel;
