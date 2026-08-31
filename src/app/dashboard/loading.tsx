export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="card animate-pulse">
        <div className="h-5 w-48 rounded bg-gray-200" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-gray-100" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="card animate-pulse">
            <div className="h-4 w-24 rounded bg-gray-100" />
            <div className="mt-4 h-8 w-32 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="card animate-pulse">
        <div className="h-64 rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}
