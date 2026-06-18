function SkeletonBlock({ className = "", style = undefined, ...rest }) {
  return (
    <div
      className={`animate-pulse bg-[#272727] ${className}`}
      style={style}
      {...rest}
    />
  );
}

export default function WatchPageSkeleton({ compact = false }) {
  // ----------------------------------------------------
  // COMPACT VIEW (Right Column: Up Next Rail)
  // ----------------------------------------------------
  if (compact) {
    return (
      <aside className="flex w-full flex-col gap-4">
        {/* Filter Chips Placeholder */}
        <div className="flex gap-3 overflow-hidden pb-2">
          <SkeletonBlock className="h-8 w-16 rounded-lg" />
          <SkeletonBlock className="h-8 w-24 rounded-lg" />
          <SkeletonBlock className="h-8 w-20 rounded-lg" />
          <SkeletonBlock className="h-8 w-16 rounded-lg" />
        </div>

        {/* Recommended Videos List Placeholder */}
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              {/* Thumbnail */}
              <SkeletonBlock className="h-23.5 w-42 shrink-0 rounded-xl" />

              {/* Text Info */}
              <div className="flex flex-1 flex-col gap-2 py-1 pr-6">
                <SkeletonBlock className="h-4 w-[90%] rounded" />
                <SkeletonBlock className="h-4 w-[60%] rounded" />
                <SkeletonBlock className="mt-1 h-3 w-[40%] rounded" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  // ----------------------------------------------------
  // MAIN VIEW (Left Column: Player, Info, Comments)
  // ----------------------------------------------------
  return (
    <section className="flex w-full flex-col gap-4">
      {/* 1. Video Player Placeholder (16:9 Ratio) */}
      <SkeletonBlock className="relative w-full rounded-xl pb-[56.25%]" />

      <div className="mt-1 flex flex-col gap-4">
        {/* 2. Video Title */}
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-6 w-[80%] rounded" />
          <SkeletonBlock className="h-6 w-[40%] rounded sm:hidden" />
        </div>

        {/* 3. Channel & Actions Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Avatar & Channel Name */}
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex flex-col gap-2">
              <SkeletonBlock className="h-4 w-32 rounded" />
              <SkeletonBlock className="h-3 w-20 rounded" />
            </div>
            <SkeletonBlock className="ml-2 h-9 w-24 rounded-full" />
          </div>

          {/* Right: Action Buttons (Like, Share, Save) */}
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-9 w-32 rounded-full" />
            <SkeletonBlock className="h-9 w-24 rounded-full" />
            <SkeletonBlock className="h-9 w-24 rounded-full hidden sm:block" />
          </div>
        </div>

        {/* 4. Description Box Placeholder */}
        <SkeletonBlock className="mt-2 h-24 w-full rounded-xl" />
      </div>

      {/* 5. Comments Section Placeholder */}
      <div className="mt-6 flex flex-col gap-6">
        <SkeletonBlock className="h-6 w-32 rounded" /> {/* Comments Count */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <SkeletonBlock className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2 pt-1">
              <SkeletonBlock className="h-3 w-32 rounded" />
              <SkeletonBlock className="h-4 w-[90%] rounded" />
              <SkeletonBlock className="h-4 w-[60%] rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
