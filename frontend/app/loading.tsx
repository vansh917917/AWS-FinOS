export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-600 border-t-transparent"></div>
        <p className="text-xs font-medium text-slate-500 animate-pulse">Loading FinOS...</p>
      </div>
    </div>
  );
}
