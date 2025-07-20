import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  PlayCircle, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Download,
  RefreshCw,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Timer,
  TrendingUp
} from 'lucide-react'

export function Executions() {
  const executions = [
    {
      id: '1',
      workflow: 'Data Processing Pipeline',
      status: 'completed',
      startedAt: '2024-01-15 10:30:00',
      completedAt: '2024-01-15 10:31:12',
      duration: '1m 12s',
      progress: 100,
      result: 'success',
      logs: 'Processing completed successfully',
      tags: ['data', 'processing']
    },
    {
      id: '2',
      workflow: 'Email Notification System',
      status: 'running',
      startedAt: '2024-01-15 10:25:00',
      completedAt: null,
      duration: '5m 30s',
      progress: 65,
      result: null,
      logs: 'Sending notifications to 150 recipients...',
      tags: ['email', 'notifications']
    },
    {
      id: '3',
      workflow: 'Report Generation',
      status: 'failed',
      startedAt: '2024-01-15 10:20:00',
      completedAt: '2024-01-15 10:23:15',
      duration: '3m 15s',
      progress: 0,
      result: 'error',
      logs: 'Database connection timeout',
      tags: ['reports', 'analytics']
    },
    {
      id: '4',
      workflow: 'Backup System',
      status: 'completed',
      startedAt: '2024-01-15 10:00:00',
      completedAt: '2024-01-15 10:45:30',
      duration: '45m 30s',
      progress: 100,
      result: 'success',
      logs: 'Backup completed: 2.3GB saved',
      tags: ['backup', 'database']
    }
  ]

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
        return <Badge variant="default" className="bg-woow-lime text-woow-dark">Completed</Badge>
      case 'running':
        return <Badge variant="secondary" className="bg-woow-blue text-white">Running</Badge>
      case 'failed':
        return <Badge variant="destructive" className="bg-woow-pink">Failed</Badge>
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getResultIcon = (result: string | null) => {
    switch (result) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-woow-lime" />
      case 'error':
        return <XCircle className="h-4 w-4 text-woow-pink" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-woow-amber" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-woow-blue to-woow-magenta rounded-xl flex items-center justify-center shadow-woow">
            <PlayCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-woow-blue to-woow-magenta bg-clip-text text-transparent">
              Executions Z22
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage workflow executions in real-time.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        className="grid gap-4 md:grid-cols-4"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Card className="border-woow-blue/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-woow-blue/10">
                  <Activity className="h-4 w-4 text-woow-blue" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Executions</p>
                  <p className="text-2xl font-bold">1,247</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-woow-blue/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-woow-lime/10">
                  <CheckCircle className="h-4 w-4 text-woow-lime" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Successful</p>
                  <p className="text-2xl font-bold">1,156</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-woow-blue/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-woow-amber/10">
                  <Timer className="h-4 w-4 text-woow-amber" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold">2.3s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-woow-blue/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-woow-magenta/10">
                  <TrendingUp className="h-4 w-4 text-woow-magenta" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">92.7%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-woow-blue/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search executions..."
                  className="w-full pl-10 pr-4 py-2 border border-woow-blue/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-woow-blue/20"
                />
              </div>
              <Button variant="outline" className="border-woow-blue/20 hover:bg-woow-blue/5">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="border-woow-blue/20 hover:bg-woow-blue/5">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Executions List */}
      <motion.div 
        className="grid gap-4"
        variants={containerVariants}
      >
        {executions.map((execution, index) => (
          <motion.div key={execution.id} variants={itemVariants}>
            <Card className="border-woow-blue/20 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{execution.workflow}</h3>
                      {getStatusBadge(execution.status)}
                      {execution.result && getResultIcon(execution.result)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Started</p>
                        <p className="text-sm font-medium">{execution.startedAt}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-medium">{execution.duration}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-muted rounded-full h-1">
                            <motion.div 
                              className="bg-woow-blue h-1 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${execution.progress}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            />
                          </div>
                          <span className="text-xs">{execution.progress}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Result</p>
                        <p className="text-sm font-medium capitalize">{execution.result || 'Running'}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Latest Log</p>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        {execution.logs}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {execution.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-woow-blue/20 text-woow-blue">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button size="sm" variant="ghost" className="hover:bg-woow-blue/10">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="hover:bg-woow-blue/10">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="hover:bg-woow-blue/10">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
} 