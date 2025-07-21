import { useCallback } from 'react'

interface ToastOptions {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    const { title, description, variant = 'default' } = options
    
    // For now, use console.log and alert as a simple implementation
    console.log(`[${variant.toUpperCase()}] ${title}: ${description}`)
    
    // You can replace this with a proper toast library like react-hot-toast or sonner
    if (variant === 'destructive') {
      alert(`Error: ${title}\n${description}`)
    } else if (variant === 'success') {
      alert(`Success: ${title}\n${description}`)
    } else {
      alert(`${title}\n${description}`)
    }
  }, [])

  return { toast }
} 