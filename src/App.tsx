import { useEffect, useState } from 'react'
import { getOrCreateSession } from './lib/auth'
import Board from './components/Board'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getOrCreateSession()
      .then(() => setReady(true))
      .catch(err => console.error('Auth error:', err))
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0 fixed top-0 bottom-0 left-0">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1.5" fill="white"/>
                <rect x="8" y="1" width="5" height="5" rx="1.5" fill="white" opacity="0.6"/>
                <rect x="1" y="8" width="5" height="5" rx="1.5" fill="white" opacity="0.6"/>
                <rect x="8" y="8" width="5" height="5" rx="1.5" fill="white" opacity="0.3"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-[15px]">TaskFlow</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-brand-50 text-brand-600 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            My Board
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-500 text-sm hover:bg-gray-50 cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-gray-200" />
            All Tasks
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-500 text-sm hover:bg-gray-50 cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-gray-200" />
            Team
          </div>
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold">
              G
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Guest</p>
              <p className="text-xs text-gray-400">Anonymous</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 min-w-0 p-8">
        <Board />
      </main>
    </div>
  )
}