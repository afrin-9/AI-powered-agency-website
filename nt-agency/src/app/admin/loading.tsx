export default function AdminLoading() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <div className="skeleton h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-24" />
        ))}
      </div>
      <div className="skeleton h-64" />
    </div>
  );
}
