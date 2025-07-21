import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface BreadcrumbItem {
  label: string
  href?: string
  isCurrent?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link
          to="/"
          className="flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
      </motion.div>

      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + (index + 1) * 0.1 }}
          className="flex items-center space-x-2"
        >
          <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          {item.isCurrent ? (
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {item.label}
            </span>
          ) : item.href ? (
            <Link
              to={item.href}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-600 dark:text-slate-400">
              {item.label}
            </span>
          )}
        </motion.div>
      ))}
    </nav>
  )
} 