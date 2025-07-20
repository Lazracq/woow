import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Sparkles,
  Workflow,
  Clock,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Rocket,
  BarChart3,
  Settings,
  RefreshCw,
  Eye,
  Download,
  Share2,
  Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiService, Workflow as WorkflowType, WorkflowStats } from '@/services/api'
import { NewWorkflowModal } from '@/components/NewWorkflowModal'

export function Workflows() {
  const [workflows, setWorkflows] = useState<WorkflowType[]>([])
  const [stats, setStats] = useState<WorkflowStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewWorkflowModal, setShowNewWorkflowModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadWorkflows()
  }, [])

  const loadWorkflows = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [workflowsData, statsData] = await Promise.all([
        apiService.getWorkflows(),
        apiService.getWorkflowStats()
      ])
      
      // Ensure workflowsData is an array
      const validWorkflows = Array.isArray(workflowsData) ? workflowsData : []
      setWorkflows(validWorkflows)
      setStats(statsData)
    } catch (err) {
      console.error('Failed to load workflows:', err)
      setError('Failed to load workflows. Please try again.')
      // Fallback to mock data if API fails
      setWorkflows(getMockWorkflows())
      setStats(getMockStats())
    } finally {
      setLoading(false)
    }
  }

  const getMockWorkflows = (): WorkflowType[] => [
    {
      id: '1',
      name: 'Data Processing Pipeline',
      description: 'Automated data processing and transformation workflow',
      isActive: true,
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      taskCount: 8,
      executionCount: 156,
      avgDuration: 1.2,
      successRate: 94.2,
      lastRun: '2 minutes ago',
      nextRun: 'in 5 minutes',
      tags: ['data', 'processing', 'automation'],
      priority: 'high',
      complexity: 'medium'
    },
    {
      id: '2',
      name: 'Email Notification System',
      description: 'Sends automated email notifications based on events',
      isActive: true,
      status: 'active',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-19T16:45:00Z',
      taskCount: 5,
      executionCount: 89,
      avgDuration: 0.8,
      successRate: 98.1,
      lastRun: '5 minutes ago',
      nextRun: 'in 10 minutes',
      tags: ['email', 'notifications', 'events'],
      priority: 'medium',
      complexity: 'low'
    }
  ]

  const getMockStats = (): WorkflowStats => ({
    totalWorkflows: 24,
    activeWorkflows: 18,
    avgDuration: '2.3s',
    successRate: '94.2%'
  })

  const filteredWorkflows = (workflows || []).filter(workflow =>
    (workflow.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (workflow.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleWorkflowCreated = (newWorkflow: WorkflowType) => {
    // Ensure the new workflow has all required properties
    const completeWorkflow: WorkflowType = {
      id: newWorkflow.id,
      name: newWorkflow.name || '',
      description: newWorkflow.description || '',
      isActive: newWorkflow.isActive ?? true,
      status: newWorkflow.status || 'active',
      createdAt: newWorkflow.createdAt || new Date().toISOString(),
      updatedAt: newWorkflow.updatedAt || new Date().toISOString(),
      taskCount: newWorkflow.taskCount || 0,
      executionCount: newWorkflow.executionCount || 0,
      avgDuration: newWorkflow.avgDuration || 0,
      successRate: newWorkflow.successRate || 0,
      lastRun: newWorkflow.lastRun || 'Never',
      nextRun: newWorkflow.nextRun || 'Not scheduled',
      tags: newWorkflow.tags || [],
      priority: newWorkflow.priority || 'medium',
      complexity: newWorkflow.complexity || 'medium'
    }
    
    setWorkflows(prev => [completeWorkflow, ...prev])
    // Refresh stats
    loadWorkflows()
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
      case 'active':
        return <Badge variant="default" className="bg-green-500 text-white dark:bg-green-600">Active</Badge>
      case 'paused':
        return <Badge variant="secondary" className="bg-yellow-500 text-white dark:bg-yellow-600">Paused</Badge>
      case 'error':
        return <Badge variant="destructive" className="bg-red-500 text-white dark:bg-red-600">Error</Badge>
      default:
        return <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="bg-red-500 text-white dark:bg-red-600">High</Badge>
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-500 text-white dark:bg-yellow-600">Medium</Badge>
      case 'low':
        return <Badge variant="outline" className="bg-green-500 text-white dark:bg-green-600">Low</Badge>
      default:
        return <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">Unknown</Badge>
    }
  }

  const statsData = [
    {
      title: 'Total Workflows',
      value: stats?.totalWorkflows?.toString() || '0',
      change: '+3',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20'
    },
    {
      title: 'Active',
      value: stats?.activeWorkflows?.toString() || '0',
      change: '+2',
      changeType: 'positive' as const,
      icon: Play,
      color: 'text-green-500 dark:text-green-400',
      bgColor: 'bg-green-500/10 dark:bg-green-500/20'
    },
    {
      title: 'Avg Duration',
      value: stats?.avgDuration || '0s',
      change: '-0.5s',
      changeType: 'positive' as const,
      icon: Clock,
      color: 'text-yellow-500 dark:text-yellow-400',
      bgColor: 'bg-yellow-500/10 dark:bg-yellow-500/20'
    },
    {
      title: 'Success Rate',
      value: stats?.successRate || '0%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-purple-500 dark:text-purple-400',
      bgColor: 'bg-purple-500/10 dark:bg-purple-500/20'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading workflows...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={loadWorkflows} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <NewWorkflowModal
        isOpen={showNewWorkflowModal}
        onClose={() => setShowNewWorkflowModal(false)}
        onWorkflowCreated={handleWorkflowCreated}
      />
      <motion.div 
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Enhanced Header with Glassmorphism */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-indigo-500/10" />
          <div className="relative flex items-center justify-between p-8">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Workflow className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Workflows
                </motion.h1>
                <motion.p 
                  className="text-lg text-slate-600 dark:text-slate-400 mt-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Manage and monitor your workflow definitions and configurations
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
                className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={loadWorkflows}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                onClick={() => setShowNewWorkflowModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Workflow
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
              <Card className="border-blue-500/20 dark:border-blue-400/20 bg-gradient-to-br from-white/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className={`p-2 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}
                        whileHover={{ rotate: 5 }}
                      >
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </motion.div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold dark:text-white">{stat.value}</p>
                      </div>
                    </div>
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
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-blue-500/20 dark:border-blue-400/20 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-blue-500/20 dark:border-blue-400/20">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="border-blue-500/20 dark:border-blue-400/20">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </motion.div>

        {/* Enhanced Workflows Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid gap-6 md:grid-cols-2"
        >
          {filteredWorkflows.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <Card className="border-blue-500/20 dark:border-blue-400/20 bg-gradient-to-br from-white/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl hover:shadow-lg dark:hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:border-blue-400/40 dark:hover:border-blue-300/40"
                onClick={() => navigate(`/workflows/${workflow.id}/edit`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg dark:text-white">{workflow.name || 'Unnamed Workflow'}</CardTitle>
                        {getStatusBadge(workflow.status || 'unknown')}
                        {workflow.priority && getPriorityBadge(workflow.priority)}
                      </div>
                      <CardDescription className="text-sm dark:text-gray-300">
                        {workflow.description || 'No description available'}
                      </CardDescription>
                    </div>
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Button variant="ghost" size="sm" className="dark:hover:bg-gray-700">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-2 rounded-lg bg-blue-500/5 dark:bg-blue-500/20">
                      <div className="font-semibold dark:text-white">{workflow.executionCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Executions</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-green-500/5 dark:bg-green-500/20">
                      <div className="font-semibold dark:text-white">{workflow.avgDuration || 0}s</div>
                      <div className="text-xs text-muted-foreground">Avg Duration</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-purple-500/5 dark:bg-purple-500/20">
                      <div className="font-semibold dark:text-white">{workflow.successRate || 0}%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                  </div>

                  {/* Tags */}
                  {workflow.tags && workflow.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {workflow.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-blue-500/20 dark:border-blue-400/20 dark:text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Run:</span>
                      <span className="font-medium dark:text-white">{workflow.lastRun || 'Never'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Run:</span>
                      <span className="font-medium dark:text-white">{workflow.nextRun || 'Not scheduled'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-blue-500/10 dark:border-blue-400/10" onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="ghost" size="sm" className="hover:bg-blue-500/10 dark:hover:bg-blue-500/20">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to={`/workflows/${workflow.id}/edit`}>
                          <Button variant="ghost" size="sm" className="hover:bg-blue-500/10 dark:hover:bg-blue-500/20">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="ghost" size="sm" className="hover:bg-blue-500/10 dark:hover:bg-blue-500/20">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                    <div className="flex space-x-2">
                      {(workflow.status || 'active') === 'active' ? (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button variant="ghost" size="sm" className="hover:bg-yellow-500/10 dark:hover:bg-yellow-500/20">
                            <Pause className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button variant="ghost" size="sm" className="hover:bg-green-500/10 dark:hover:bg-green-500/20">
                            <Play className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      )}
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="ghost" size="sm" className="hover:bg-red-500/10 dark:hover:bg-red-500/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="border-blue-500/20 dark:border-blue-400/20 bg-gradient-to-br from-white/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <motion.div 
                  className="p-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20"
                  whileHover={{ scale: 1.1 }}
                >
                  <Target className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                </motion.div>
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Common workflow management actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Rocket, label: 'Create Workflow', color: 'from-blue-500 to-indigo-500', description: 'Start from template' },
                  { icon: Zap, label: 'Import Workflow', color: 'from-teal-500 to-green-500', description: 'Import from file' },
                  { icon: Download, label: 'Export All', color: 'from-yellow-500 to-pink-500', description: 'Backup workflows' },
                  { icon: Share2, label: 'Share Templates', color: 'from-purple-500 to-pink-500', description: 'Share with team' },
                ].map((action, index) => (
                  <motion.button
                    key={action.label}
                    className={`p-6 rounded-xl bg-gradient-to-r ${action.color} bg-opacity-10 hover:bg-opacity-20 dark:bg-opacity-20 dark:hover:bg-opacity-30 transition-all duration-300 border border-blue-500/20 dark:border-blue-400/20 hover:border-blue-500/40 dark:hover:border-blue-400/40 group`}
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
                    <div className="text-sm font-medium dark:text-white">{action.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  )
} 