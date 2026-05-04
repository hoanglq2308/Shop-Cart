import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      addToast: () => {},
      removeToast: () => {},
    }
  }
  return ctx
}

let idCounter = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = idCounter++
    const next = { id, ...toast }
    setToasts((t) => [...t, next])

    if (toast.duration !== 0) {
      const timeout = setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id))
      }, toast.duration || 4000)

      return () => clearTimeout(timeout)
    }

    return () => {}
  }, [])

  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex max-w-xs flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded px-4 py-3 shadow-md flex items-start gap-3 max-w-xs ${
              t.type === 'success'
                ? 'bg-emerald-600 text-white'
                : t.type === 'error'
                ? 'bg-red-600 text-white'
                : t.type === 'warning'
                ? 'bg-yellow-400 text-black'
                : 'bg-zinc-800 text-white'
            }`}
          >
            <div className="flex-shrink-0">
              <span className="material-symbols-outlined">{t.icon || 'info'}</span>
            </div>
            <div className="flex-1">
              <div className="font-medium">{t.title}</div>
              {t.description && <div className="text-sm opacity-90">{t.description}</div>}
            </div>
            <button className="ml-2 opacity-80" onClick={() => removeToast(t.id)} type="button">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
