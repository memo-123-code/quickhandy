import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
      <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl max-w-md w-full">
        <div className="mx-auto bg-brand-orange-500/10 w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-brand-orange-500/20">
          <FileQuestion className="w-10 h-10 text-brand-orange-500" />
        </div>
        <h1 dir="auto" className="text-4xl font-extrabold text-white mb-2 tracking-tight">404</h1>
        <h2 dir="auto" className="text-xl font-semibold mb-4 text-slate-300">Page Not Found</h2>
        <p dir="auto" className="text-slate-400 mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved to another URL.
        </p>
        <Link 
          href="/dashboard/admin" 
          className="inline-flex items-center gap-2 bg-brand-orange-500 hover:bg-brand-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-brand-orange-500/20"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
