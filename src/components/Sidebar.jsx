function Sidebar({
  categories,
  sidebarLinks,
  activeSidebarLabel,
  onSidebarSelect,
}) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-6 rounded-4xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="space-y-1">
          {sidebarLinks.map((item, index) => (
            <button
              key={item.label ?? String(item)}
              type="button"
              onClick={() => onSidebarSelect?.(item.label ?? String(item))}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                (item.label ?? String(item)) === activeSidebarLabel ||
                (!activeSidebarLabel && index === 0)
                  ? "bg-white text-slate-950 shadow-lg shadow-white/10"
                  : "text-slate-200 hover:bg-white/10"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-current">
                {(item.icon ?? item.label ?? String(item)).slice(0, 1)}
              </span>
              <span>{item.label ?? String(item)}</span>
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-sm font-semibold text-white">
            Trending categories
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-sm font-semibold text-white">Watch tips</p>
          <div className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
            <p>
              Use the API feed to swap categories, titles, and thumbnails
              without touching the layout.
            </p>
            <p>
              The watch page is already separated into player, metadata,
              comments, and queue panels.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
