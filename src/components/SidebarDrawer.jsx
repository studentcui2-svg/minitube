function SidebarDrawer({
  isOpen,
  sidebarLinks,
  categories,
  activeCategory,
  activeSidebarLabel,
  onSidebarSelect,
  onClose,
  onCategoryChange,
}) {
  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-slate-950/70 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`absolute left-0 top-0 h-full w-[88vw] max-w-sm border-r border-white/10 bg-slate-950 p-4 shadow-2xl shadow-black/40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-sm font-semibold text-white">Navigation</p>
            <p className="text-xs text-slate-400">VideoFlow menu</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-6 overflow-y-auto pb-4">
          <div className="space-y-2">
            {sidebarLinks.map((item) => (
              <button
                key={item.label ?? item}
                type="button"
                onClick={() => {
                  onSidebarSelect?.(item.label ?? String(item));
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  (item.label ?? String(item)) === activeSidebarLabel
                    ? "bg-white text-slate-950 shadow-lg shadow-white/10"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-current">
                  {(item.icon ?? item.label ?? String(item)).slice(0, 1)}
                </span>
                <span>{item.label ?? item}</span>
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Quick filters</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => onCategoryChange(category)}
                  className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                    category === activeCategory
                      ? "bg-white text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default SidebarDrawer;
