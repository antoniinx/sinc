import { useEffect } from 'react'

export function useKeyboardShortcuts({ onCtrlK }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+K (or Cmd+K on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        onCtrlK?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCtrlK])
}
