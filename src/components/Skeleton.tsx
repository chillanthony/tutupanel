export function PostSkeleton() {
  return (
    <li className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
        <div className="h-3 w-24 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
      </div>
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
    </li>
  );
}

export function TipSkeleton() {
  return (
    <li className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="h-5 w-1/3 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
      <div className="mt-3 h-3 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
      <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
      <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
    </li>
  );
}

export function EmptyState({ emoji, title, hint }: { emoji: string; title: string; hint?: string }) {
  return (
    <li className="rounded-lg border border-dashed border-stone-300 p-8 text-center dark:border-stone-700">
      <div className="mb-2 text-5xl">{emoji}</div>
      <p className="text-sm text-stone-600 dark:text-stone-400">{title}</p>
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </li>
  );
}
