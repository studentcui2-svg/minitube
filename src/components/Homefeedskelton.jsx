function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse bg-[#272727] ${className}`} />;
}

export default function HomeFeedSkeleton() {
  return (
    <div className="w-full pb-8">
      {/* 1. Category Pills Skeleton Row */}
      <div className="flex gap-3 overflow-hidden px-4 py-3 sm:px-6 xl:px-12">
        <SkeletonBlock className="h-8 w-12 rounded-lg" />
        <SkeletonBlock className="h-8 w-24 rounded-lg" />
        <SkeletonBlock className="h-8 w-16 rounded-lg" />
        <SkeletonBlock className="h-8 w-28 rounded-lg" />
        <SkeletonBlock className="h-8 w-20 rounded-lg" />
        <SkeletonBlock className="h-8 w-32 rounded-lg hidden sm:block" />
        <SkeletonBlock className="h-8 w-24 rounded-lg hidden md:block" />
      </div>

      {/* 2. Video Grid Skeleton */}
      <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-x-4 gap-y-10 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:px-6 xl:px-12">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            {/* Thumbnail (16:9 Aspect Ratio) */}
            <SkeletonBlock className="relative w-full rounded-xl pb-[56.25%]" />

            {/* Details Row */}
            <div className="flex gap-3 pr-6">
              {/* Channel Avatar */}
              <SkeletonBlock className="h-9 w-9 shrink-0 rounded-full" />

              {/* Title & Metadata Lines */}
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <SkeletonBlock className="h-4 w-[90%] rounded" />
                <SkeletonBlock className="h-4 w-[60%] rounded" />
                <SkeletonBlock className="mt-1 h-3 w-[40%] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
