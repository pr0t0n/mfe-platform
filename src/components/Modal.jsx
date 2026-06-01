import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(22,25,31,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizes[size]} animate-fadeIn rounded-xl overflow-hidden`}
        style={{ background: '#fff', border: '1px solid #e5dcd5', boxShadow: '0 8px 40px rgba(28,28,28,0.18)' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #e5dcd5' }}
        >
          <h2 className="text-[15px] font-semibold" style={{ color: '#1c1c1c', letterSpacing: '-0.01em' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded transition-all"
            style={{ color: '#6b6b6b', border: '1px solid transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f0ebe7'; e.currentTarget.style.borderColor = '#e5dcd5' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
