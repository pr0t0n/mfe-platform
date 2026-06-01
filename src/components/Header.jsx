import { Bell, Search } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useRequestStore } from '../store/useRequestStore'
import { useNavigate } from 'react-router-dom'

export default function Header({ title, subtitle }) {
  const { currentUser } = useAuthStore()
  const pendingCount = useRequestStore((s) => s.getPendingCount())
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-slate-800 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin/requests')}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Bell size={18} />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        )}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          onClick={() => navigate('/profile')}
        >
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
            {currentUser?.avatar}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">{currentUser?.name}</span>
        </div>
      </div>
    </header>
  )
}
