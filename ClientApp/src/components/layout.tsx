import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Workflow, 
  PlayCircle, 
  Settings, 
  Menu, 
  X,
  Moon,
  Sun,
  ChevronRight,
  Globe,
  Clock,
  ChevronDown,
  Bell,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from './theme-provider'
import { apiService, Notification } from '@/services/api'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  { 
    name: 'Workflows', 
    href: '/workflows', 
    icon: Workflow,
    description: 'Manage workflow definitions'
  },
  { 
    name: 'Executions', 
    href: '/executions', 
    icon: PlayCircle,
    description: 'Monitor job executions'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings,
    description: 'System configuration'
  },
]

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
]

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const unreadNotifications = notifications.filter(n => n.type === 'error' || n.type === 'warning').length

  useEffect(() => {
    loadNotifications()
    connectSignalR()

    // Listen for real-time notification updates
    const handleNotificationsUpdate = (event: CustomEvent) => {
      setNotifications(event.detail)
    }

    const handleNewNotification = (event: CustomEvent) => {
      setNotifications(prev => [event.detail, ...prev.slice(0, 4)])
    }

    window.addEventListener('notificationsUpdated', handleNotificationsUpdate as EventListener)
    window.addEventListener('newNotification', handleNewNotification as EventListener)

    return () => {
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdate as EventListener)
      window.removeEventListener('newNotification', handleNewNotification as EventListener)
      // Temporarily disable SignalR disconnect
      // signalRService.disconnect()
    }
  }, [])

  const loadNotifications = async () => {
    try {
      const notifs = await apiService.getNotifications()
      setNotifications(notifs)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const connectSignalR = async () => {
    try {
      // Temporarily disable SignalR to prevent errors
      console.log('SignalR connection disabled for now')
      // await signalRService.connect()
    } catch (error) {
      console.error('Failed to connect to SignalR:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'warning':
        return <AlertCircle className="h-4 w-4" />
      case 'error':
        return <XCircle className="h-4 w-4" />
      case 'info':
        return <Zap className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20 dark:from-slate-950 dark:via-slate-900/50 dark:to-indigo-950/30" />
      
      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 via-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 via-pink-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Main Layout Container */}
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <div className={`hidden lg:flex lg:flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-80'}`}>
          <div className="flex flex-col flex-grow bg-gradient-to-b from-blue-50/95 via-blue-100/95 to-blue-200/95 dark:from-slate-800/95 dark:via-slate-900/95 dark:to-slate-950/95 backdrop-blur-xl border-r border-blue-200/40 dark:border-slate-600/40 shadow-2xl">
            {/* Logo Section at Top */}
            <div className="flex h-16 items-center justify-center px-4 border-b border-blue-200/40 dark:border-slate-600/40">
              <div className="relative">
                {sidebarCollapsed ? (
                  // Collapsed sidebar - use ico file
                  <img 
                    src="/logoW.ico" 
                    alt="WooWStudio" 
                    className="relative w-8 h-8 filter dark:brightness-75 dark:contrast-125"
                    onError={(e) => {
                      // Fallback to the original logo if ico doesn't exist
                      e.currentTarget.src = '/WooWStudioGoLogo.png';
                    }}
                  />
                ) : (
                  // Expanded sidebar - use full logo with dark mode adjustments
                  <img 
                    src="/logoW.png" 
                    alt="WooWStudio" 
                    className="relative w-32 h-8 object-contain"
                    style={{
                      filter: `
                        brightness(55%)      /* overall darkness */
                        saturate(90%)        /* tone down vibrance */
                        hue-rotate(-5deg)    /* nudge toward cooler tones */
                      `
                    }}
                    onError={(e) => {
                      // Fallback to the original logo if logoW doesn't exist
                      e.currentTarget.src = '/WooWStudioGoLogo.png';
                      e.currentTarget.style.filter = 'brightness(75%) contrast(125%)';
                    }}
                  />
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item, index) => {
                const isActive = location.pathname === item.href
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      className={`group relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600/40 to-blue-500/40 border border-blue-500/60 dark:from-slate-600/40 dark:to-slate-500/40 dark:border-slate-500/60 shadow-lg'
                          : 'hover:bg-blue-100/50 hover:shadow-md dark:hover:bg-slate-700/30'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-blue-500/30 dark:from-slate-600/30 dark:to-slate-500/30 rounded-xl"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <div className={`relative flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'space-x-3 w-full'}`}>
                        <div className={`p-2 rounded-lg ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-lg dark:from-slate-500 dark:to-slate-400' 
                            : 'bg-blue-100/50 group-hover:bg-gradient-to-r group-hover:from-blue-600/40 group-hover:to-blue-500/40 dark:bg-slate-700/30 dark:group-hover:from-slate-600/40 dark:group-hover:to-slate-500/40'
                        }`}>
                          <item.icon className="h-5 w-5 text-blue-700 dark:text-white" />
                        </div>
                        {!sidebarCollapsed && (
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-blue-900 dark:text-white">{item.name}</span>
                              {isActive && (
                                <motion.div
                                  layoutId="activeDot"
                                  className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-300 dark:from-slate-400 dark:to-slate-300 rounded-full"
                                  initial={false}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              )}
                            </div>
                            <p className="text-xs text-blue-600 dark:text-slate-300 mt-1">{item.description}</p>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Collapse Toggle Button */}
            <div className="px-4 py-2 border-t border-blue-200/40 dark:border-slate-600/40">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`w-full hover:bg-blue-100/50 text-blue-700 dark:hover:bg-slate-700/30 dark:text-white ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4 rotate-180" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50 shadow-lg">
            <div className="flex h-16 items-center justify-between px-6">
              {/* Left side */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5 rotate-180" />
                  )}
                </Button>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">{unreadNotifications}</span>
                      </div>
                    )}
                  </Button>
                  
                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-12 w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-800/50 shadow-2xl z-[9999]"
                      >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                              No notifications
                            </div>
                          ) : (
                            notifications.slice(0, 5).map((notification, index) => (
                              <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`p-2 rounded-lg ${
                                    notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/20' :
                                    notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                    notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                                    'bg-blue-100 dark:bg-blue-900/20'
                                  }`}>
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                      {new Date(notification.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Time */}
                <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{currentTime}</span>
                </div>

                {/* Language Selector */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLanguageOpen(!languageOpen)}
                    className="hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{languages.find(l => l.code === selectedLanguage)?.flag}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                  
                  <AnimatePresence>
                    {languageOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-12 w-48 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl border border-white/20 dark:border-slate-800/50 shadow-2xl z-[9999]"
                      >
                        {languages.map((language) => (
                          <button
                            key={language.code}
                            onClick={() => {
                              setSelectedLanguage(language.code)
                              setLanguageOpen(false)
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800 first:rounded-t-xl last:rounded-b-xl ${
                              selectedLanguage === language.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{language.flag}</span>
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {language.name}
                              </span>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </header>

          {/* Breadcrumb Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-blue-200/50 dark:border-blue-700/50">
            <div className="px-6 py-3">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-blue-600 dark:text-blue-400 font-medium">WooWStudiO</span>
                <ChevronRight className="h-4 w-4 text-blue-400" />
                <span className="text-slate-600 dark:text-slate-400 capitalize">{location.pathname.slice(1) || 'Dashboard'}</span>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto bg-transparent">
            <div className="h-full p-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm" 
              onClick={() => setSidebarOpen(false)} 
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-blue-800/95 via-blue-900/95 to-blue-950/95 dark:from-blue-900/98 dark:via-blue-950/98 dark:to-black/98 backdrop-blur-xl border-r border-blue-600/40 dark:border-blue-500/40 shadow-2xl"
            >
              <div className="flex h-16 items-center justify-center px-6 border-b border-blue-600/40 dark:border-blue-500/40">
                <div className="flex items-center justify-center flex-1">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg blur-sm opacity-75" />
                    <img src="/WooWStudioGoLogo.png" alt="WooWStudio" className="relative w-8 h-8" />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="hover:bg-blue-700/30 text-white ml-4"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="px-4 py-4 space-y-2">
                {navigation.map((item, index) => {
                  const isActive = location.pathname === item.href
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600/40 to-blue-500/40 border border-blue-500/60 dark:from-slate-600/40 dark:to-slate-500/40 dark:border-slate-500/60 shadow-lg'
                            : 'hover:bg-blue-100/50 hover:shadow-md dark:hover:bg-slate-700/30'
                        }`}
                      >
                        <div className={`relative flex items-center space-x-3 w-full ${
                          isActive ? 'text-white' : 'text-white'
                        }`}>
                          <div className={`p-2 rounded-lg ${
                            isActive 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-lg dark:from-slate-500 dark:to-slate-400' 
                              : 'bg-blue-100/50 group-hover:bg-gradient-to-r group-hover:from-blue-600/40 group-hover:to-blue-500/40 dark:bg-slate-700/30 dark:group-hover:from-slate-600/40 dark:group-hover:to-slate-500/40'
                          }`}>
                            <item.icon className="h-5 w-5 text-blue-700 dark:text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-blue-900 dark:text-white">{item.name}</span>
                              {isActive && (
                                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-blue-300 dark:from-slate-400 dark:to-slate-300 rounded-full" />
                              )}
                            </div>
                            <p className="text-xs text-blue-600 dark:text-slate-300 mt-1">{item.description}</p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 