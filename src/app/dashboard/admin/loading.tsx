import { ShieldAlert, Search, Bell } from "lucide-react";

export default function LoadingAdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Navbar Skeleton */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-xl relative z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800/80 border border-slate-700/60 rounded-xl text-brand-blue-400">
            <ShieldAlert className="w-5 h-5 text-brand-blue-400" />
          </div>
          <div className="space-y-1.5">
            <div className="h-4 w-40 bg-slate-800 rounded animate-pulse" />
            <div className="h-2 w-24 bg-slate-800 rounded animate-pulse" />
          </div>
        </div>

        <div className="hidden md:flex items-center relative w-80">
          <Search className="w-4 h-4 text-slate-500 absolute start-3 pointer-events-none" />
          <div className="w-full h-8 bg-slate-950/70 border border-slate-800 rounded-lg animate-pulse" />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-24 h-8 bg-slate-800 rounded-lg animate-pulse" />
          <div className="w-10 h-10 bg-slate-800 rounded-lg animate-pulse" />
          <div className="w-10 h-10 bg-slate-800 rounded-full animate-pulse" />
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Skeleton */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 w-full bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="p-4">
            <div className="h-10 w-full bg-slate-800 rounded-xl animate-pulse" />
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-8 w-64 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-96 bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="h-10 w-32 bg-slate-800 rounded-lg animate-pulse" />
            </div>

            {/* Metrics Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-slate-800 rounded animate-pulse" />
                      <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" />
                    </div>
                    <div className="w-10 h-10 bg-slate-800 rounded-xl animate-pulse" />
                  </div>
                  <div className="h-6 w-32 bg-slate-800 rounded-full animate-pulse" />
                </div>
              ))}
            </div>

            {/* Main Chart Skeleton */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl h-96 flex items-end gap-4">
               {[...Array(7)].map((_, i) => (
                  <div key={i} className="w-full bg-slate-800 rounded-t-lg animate-pulse" style={{ height: `${Math.random() * 60 + 20}%` }} />
               ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
