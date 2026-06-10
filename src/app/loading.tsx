function SkeletonCard() {
  return (
    <div className="h-[420px] rounded-[6px] border border-neutral-300 bg-white p-2">
      <div className="caruano-skeleton h-[230px] rounded-[4px]" />
      <div className="mt-3 h-4 w-2/3 caruano-skeleton rounded" />
      <div className="mt-2 h-3 w-full caruano-skeleton rounded" />
      <div className="mt-2 h-3 w-4/5 caruano-skeleton rounded" />
      <div className="mt-8 h-8 w-1/2 caruano-skeleton rounded" />
      <div className="mt-3 h-9 w-full caruano-skeleton rounded" />
    </div>
  );
}

export default function Loading() {
  return (
    <main className="mx-auto max-w-[1412px] px-4 py-4">
      <div className="caruano-skeleton h-[180px] rounded-[6px]" />
      <section className="mt-4 rounded-[6px] border border-neutral-300 bg-white p-2">
        <div className="mb-3 h-8 w-64 caruano-skeleton rounded" />
        <div className="caruano-product-grid">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
