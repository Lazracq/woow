import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Zap, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  BarChart3,
  Sparkles,
  Rocket,
  Shield,
  Cpu,
  Database,
  Globe,
  RefreshCw,
  Settings,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiService, DashboardStats, Notification } from '@/services/api'
import { signalRService } from '@/services/signalR'

export function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
    connectSignalR()

    // Cleanup SignalR on unmount
    return () => {
      signalRService.disconnect()
    }
  }, [])

  useEffect(() => {
    // Listen for real-time updates
    const handleStatsUpdate = (event: CustomEvent) => {
      setDashboardStats(event.detail)
    }

    const handleNotificationsUpdate = (event: CustomEvent) => {
      setNotifications(event.detail)
    }

    const handleNewNotification = (event: CustomEvent) => {
      setNotifications(prev => [event.detail, ...prev.slice(0, 4)])
    }

    window.addEventListener('dashboardStatsUpdated', handleStatsUpdate as EventListener)
    window.addEventListener('notificationsUpdated', handleNotificationsUpdate as EventListener)
    window.addEventListener('newNotification', handleNewNotification as EventListener)

    return () => {
      window.removeEventListener('dashboardStatsUpdated', handleStatsUpdate as EventListener)
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdate as EventListener)
      window.removeEventListener('newNotification', handleNewNotification as EventListener)
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [stats, notifs] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getNotifications()
      ])
      
      setDashboardStats(stats)
      setNotifications(notifs)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const connectSignalR = async () => {
    try {
      await signalRService.connect()
    } catch (err) {
      console.error('Failed to connect to SignalR:', err)
    }
  }

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await apiService.refreshDashboard()
      await loadDashboardData()
    } catch (err) {
      console.error('Failed to refresh dashboard:', err)
      setError('Failed to refresh dashboard. Please try again.')
    } finally {
      setIsRefreshing(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const statsData = dashboardStats ? [
    {
      title: 'Total Workflows',
      value: dashboardStats.totalWorkflows.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'from-woow-blue to-woow-indigo',
      bgColor: 'bg-gradient-to-r from-woow-blue/10 to-woow-indigo/10',
      description: 'Active workflows in the system'
    },
    {
      title: 'Running Executions',
      value: dashboardStats.runningExecutions.toString(),
      change: '+3',
      changeType: 'positive' as const,
      icon: PlayCircle,
      color: 'from-woow-teal to-woow-lime',
      bgColor: 'bg-gradient-to-r from-woow-teal/10 to-woow-lime/10',
      description: 'Currently executing workflows'
    },
    {
      title: 'Success Rate',
      value: `${dashboardStats.successRate}%`,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'from-woow-magenta to-woow-pink',
      bgColor: 'bg-gradient-to-r from-woow-magenta/10 to-woow-pink/10',
      description: 'Successful executions this month'
    },
    {
      title: 'Avg Execution Time',
      value: `${dashboardStats.avgExecutionTime}s`,
      change: '-0.5s',
      changeType: 'positive' as const,
      icon: Clock,
      color: 'from-woow-amber to-woow-pink',
      bgColor: 'bg-gradient-to-r from-woow-amber/10 to-woow-pink/10',
      description: 'Average workflow execution time'
    }
  ] : []

  const systemHealth = dashboardStats?.systemHealth ? [
    {
      name: 'API Service',
      status: dashboardStats.systemHealth.apiService.status,
      uptime: dashboardStats.systemHealth.apiService.uptime,
      port: dashboardStats.systemHealth.apiService.port,
      icon: Cpu,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      name: 'Worker Service',
      status: dashboardStats.systemHealth.workerService.status,
      uptime: dashboardStats.systemHealth.workerService.uptime,
      workers: dashboardStats.systemHealth.workerService.workers,
      icon: Database,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      name: 'Database',
      status: dashboardStats.systemHealth.database.status,
      uptime: dashboardStats.systemHealth.database.uptime,
      connections: dashboardStats.systemHealth.database.connections,
      icon: Shield,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    }
  ] : []

  const quickActions = [
    { icon: Rocket, label: 'New Workflow', color: 'from-woow-blue to-woow-indigo', description: 'Create a new workflow' },
    { icon: BarChart3, label: 'View Reports', color: 'from-woow-teal to-woow-lime', description: 'Access analytics' },
    { icon: Settings, label: 'Settings', color: 'from-woow-amber to-woow-pink', description: 'Configure system' },
    { icon: Sparkles, label: 'Analytics', color: 'from-woow-magenta to-woow-pink', description: 'Performance insights' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-woow-blue" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-semibold">Error Loading Dashboard</div>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={loadDashboardData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Enhanced Header with Glassmorphism */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-woow-blue/5 via-woow-magenta/5 to-woow-indigo/5 p-8 border border-woow-blue/20 backdrop-blur-xl dark:from-woow-blue/10 dark:via-woow-magenta/10 dark:to-woow-indigo/10"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-woow-blue/10 to-woow-magenta/10 opacity-50 dark:opacity-30" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-r from-woow-blue to-woow-magenta rounded-2xl flex items-center justify-center shadow-woow"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src="/WooWStudioGoLogo.png" alt="WooWStudio" className="w-12 h-12" />
            </motion.div>
            <div>
              <motion.h1 
                className="text-4xl font-bold tracking-tight bg-gradient-to-r from-woow-blue to-woow-magenta bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              > 
                Dashboard 22
              </motion.h1>
              <motion.p 
                className="text-lg text-muted-foreground mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Monitor your workflow system performance and recent activity
              </motion.p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-3"
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="border-woow-blue/20 dark:border-woow-blue/40"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-woow-blue to-woow-magenta">
              <Sparkles className="h-4 w-4 mr-2" />
              Quick Actions
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Stats Grid */}
      <motion.div 
        variants={itemVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group"
          >
            <Card className="border-woow-blue/20 bg-gradient-to-br from-white/50 to-woow-light/30 backdrop-blur-xl hover:shadow-woow transition-all duration-300 dark:from-gray-800/50 dark:to-gray-900/30 dark:bg-gray-800/80 dark:border-gray-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground dark:text-gray-300">
                  {stat.title}
                </CardTitle>
                <motion.div 
                  className={`p-2 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}
                  whileHover={{ rotate: 5 }}
                >
                  <stat.icon className={`h-4 w-4 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold dark:text-white">{stat.value}</div>
                  <motion.div 
                    className={`flex items-center space-x-1 text-xs font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    <span>{stat.change}</span>
                  </motion.div>
                </div>
                <p className="text-xs text-muted-foreground dark:text-gray-400 mt-2">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced Performance Chart */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        <Card className="border-woow-blue/20 bg-gradient-to-br from-white/50 to-woow-light/30 backdrop-blur-xl dark:from-gray-800/50 dark:to-gray-900/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <motion.div 
                className="p-2 rounded-xl bg-gradient-to-r from-woow-blue/10 to-woow-magenta/10"
                whileHover={{ scale: 1.1 }}
              >
                <TrendingUp className="h-5 w-5 text-woow-magenta" />
              </motion.div>
              <span>Performance Overview</span>
            </CardTitle>
            <CardDescription>
              Execution performance over the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="w-full h-full flex items-end justify-between space-x-2 p-4">
                {dashboardStats?.performanceData?.map((data, index) => (
                  <motion.div
                    key={data.hour}
                    className="flex flex-col items-center space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="flex flex-col space-y-1">
                      <motion.div
                        className="bg-gradient-to-t from-woow-blue to-woow-indigo rounded-t-sm"
                        style={{ height: `${(data.executions / 100) * 120}px` }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                      <motion.div
                        className="bg-gradient-to-t from-woow-lime to-woow-teal rounded-t-sm"
                        style={{ height: `${(data.success / 100) * 120}px` }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{data.hour}</span>
                  </motion.div>
                )) || (
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Performance data loading...</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Recent Activity */}
        <Card className="border-woow-blue/20 bg-gradient-to-br from-white/50 to-woow-light/30 backdrop-blur-xl dark:from-gray-800/50 dark:to-gray-900/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <motion.div 
                className="p-2 rounded-xl bg-gradient-to-r from-woow-blue/10 to-woow-indigo/10"
                whileHover={{ scale: 1.1 }}
              >
                <Activity className="h-5 w-5 text-woow-blue" />
              </motion.div>
              <span>Recent Executions</span>
            </CardTitle>
            <CardDescription>
              Latest workflow executions and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats?.recentExecutions?.map((execution, index) => (
                <motion.div
                  key={execution.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="group"
                >
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-woow-blue/5 transition-all duration-200 border border-woow-blue/10 group-hover:border-woow-blue/20 dark:hover:bg-woow-blue/10">
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className={`text-2xl p-2 rounded-lg ${
                          execution.status === 'Completed' ? 'bg-green-500/10' :
                          execution.status === 'Running' ? 'bg-blue-500/10' :
                          'bg-red-500/10'
                        }`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {execution.status === 'Completed' ? '📊' :
                         execution.status === 'Running' ? '📧' : '📈'}
                      </motion.div>
                      <div>
                        <p className="text-sm font-medium">{execution.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(execution.startTime).toLocaleTimeString()} • {execution.duration}s
                        </p>
                        {execution.status === 'Running' && (
                          <div className="mt-1 w-full bg-muted rounded-full h-1">
                            <motion.div 
                              className="bg-gradient-to-r from-woow-blue to-woow-indigo h-1 rounded-full"
                              style={{ width: `${execution.progress}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${execution.progress}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={execution.status === 'Completed' ? 'default' : execution.status === 'Running' ? 'secondary' : 'destructive'}
                      className={`${
                        execution.status === 'Completed' ? 'bg-woow-lime text-woow-dark' :
                        execution.status === 'Running' ? 'bg-woow-blue text-white' :
                        'bg-woow-pink'
                      }`}
                    >
                      {execution.status}
                    </Badge>
                  </div>
                </motion.div>
              )) || (
                <div className="text-center text-muted-foreground py-8">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No recent executions</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced System Health */}
      <motion.div variants={itemVariants}>
        <Card className="border-woow-blue/20 bg-gradient-to-br from-white/50 to-woow-light/30 backdrop-blur-xl dark:from-gray-800/50 dark:to-gray-900/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <motion.div 
                className="p-2 rounded-xl bg-gradient-to-r from-woow-teal/10 to-woow-lime/10"
                whileHover={{ scale: 1.1 }}
              >
                <Zap className="h-5 w-5 text-woow-teal" />
              </motion.div>
              <span>System Health</span>
            </CardTitle>
            <CardDescription>
              Current system status and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {systemHealth.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="group"
                >
                  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-woow-teal/5 transition-all duration-200 border border-woow-teal/10 group-hover:border-woow-teal/20 dark:hover:bg-woow-teal/10">
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className={`p-2 rounded-lg ${service.bgColor}`}
                        whileHover={{ scale: 1.1 }}
                      >
                        <service.icon className={`h-4 w-4 ${service.color}`} />
                      </motion.div>
                      <div>
                        <p className="text-sm font-medium">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {service.port || service.workers || service.connections}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="bg-woow-lime text-woow-dark">
                        {service.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {service.uptime}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="border-woow-blue/20 bg-gradient-to-br from-white/50 to-woow-light/30 backdrop-blur-xl dark:from-gray-800/50 dark:to-gray-900/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <motion.div 
                className="p-2 rounded-xl bg-gradient-to-r from-woow-magenta/10 to-woow-pink/10"
                whileHover={{ scale: 1.1 }}
              >
                <Target className="h-5 w-5 text-woow-magenta" />
              </motion.div>
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Common actions to manage your workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.label}
                  className={`p-6 rounded-xl bg-gradient-to-r ${action.color} bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 border border-woow-blue/20 hover:border-woow-blue/40 group dark:border-woow-blue/40`}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <motion.div 
                    className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200"
                    whileHover={{ rotate: 5 }}
                  >
                    <action.icon className="h-8 w-8" />
                  </motion.div>
                  <div className="text-sm font-medium">{action.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
} 