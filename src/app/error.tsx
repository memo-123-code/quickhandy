"use client";

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
      <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl max-w-md w-full">
        <div className="mx-auto bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 dir="auto" className="text-2xl font-bold text-white mb-2 tracking-tight">Something went wrong!</h1>
        <p dir="auto" className="text-slate-400 mb-8 leading-relaxed">
          An unexpected error has occurred. We have been notified and are looking into it.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-slate-700"
        >
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  )
}
