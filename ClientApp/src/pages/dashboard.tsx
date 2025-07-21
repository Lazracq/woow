import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  PlayCircle, 
  Workflow,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface Execution {
  id: string
  workflow: string
  status: string
  result: string | null
  startedAt: string
  duration: string
}

export function Dashboard() {
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    successfulExecutions: 0,
    avgDuration: '0s',
    successRate: '0%'
  })
  const [recentExecutions, setRecentExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // Load dashboard data from API
      // For now, using mock data
      setStats({
        totalWorkflows: 12,
        activeWorkflows: 8,
        totalExecutions: 1547,
        successfulExecutions: 1423,
        avgDuration: '1.2s',
        successRate: '92%'
      })
      setRecentExecutions([
        {
          id: '1',
          workflow: 'Data Processing Pipeline',
          status: 'completed',
          result: 'success',
          startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          duration: '1.2s'
        },
        {
          id: '2',
          workflow: 'Email Notification System',
          status: 'running',
          result: null,
          startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          duration: '0.8s'
        },
        {
          id: '3',
          workflow: 'File Backup Workflow',
          status: 'completed',
          result: 'success',
          startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          duration: '2.1s'
        }
      ])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
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
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500 text-white">Completed</Badge>
      case 'running':
        return <Badge variant="secondary" className="bg-blue-500 text-white">Running</Badge>
      case 'failed':
        return <Badge variant="destructive" className="bg-red-500 text-white">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getResultIcon = (result: string | null) => {
    switch (result) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-lg">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to Your Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor your workflows and track performance in real-time
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/workflows">
              <Button variant="outline" size="sm">
                <Workflow className="h-4 w-4 mr-2" />
                View Workflows
              </Button>
            </Link>
            <Link to="/executions">
              <Button variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                View Executions
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={itemVariants}
      >
        <Card className="border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Workflow className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{stats.totalWorkflows}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <PlayCircle className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold">{stats.activeWorkflows}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Activity className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold">{stats.totalExecutions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity and Quick Actions */}
      <motion.div 
        className="grid gap-6 md:grid-cols-1"
        variants={itemVariants}
      >
        {/* Recent Executions */}
        <Card className="border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Executions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExecutions.map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    {getResultIcon(execution.result)}
                    <div>
                      <p className="font-medium text-sm">{execution.workflow}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(execution.startedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(execution.status)}
                    <span className="text-xs text-muted-foreground">{execution.duration}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/executions">
                <Button variant="outline" size="sm" className="w-full">
                  View All Executions
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Overview */}
      <motion.div variants={itemVariants}>
        <Card className="border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Performance Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-blue-500/5">
                <div className="text-2xl font-bold text-blue-600">{stats.successfulExecutions}</div>
                <div className="text-sm text-muted-foreground">Successful Executions</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-500/5">
                <div className="text-2xl font-bold text-green-600">{stats.avgDuration}</div>
                <div className="text-sm text-muted-foreground">Average Duration</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-500/5">
                <div className="text-2xl font-bold text-purple-600">{stats.activeWorkflows}</div>
                <div className="text-sm text-muted-foreground">Active Workflows</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
} 