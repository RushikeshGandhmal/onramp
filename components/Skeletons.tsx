export function CardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton h-3 w-40" />
        <div className="skeleton h-5 w-14 rounded-full" />
      </div>
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-4 w-2/3 mb-4" />
      <div className="skeleton h-3 w-full mb-2" />
      <div className="skeleton h-3 w-5/6 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-12 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="flex items-center justify-between border-t border-bg-border pt-3">
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-7 w-20 rounded-md" />
      </div>
    </div>
  );
}

export function ResultsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
