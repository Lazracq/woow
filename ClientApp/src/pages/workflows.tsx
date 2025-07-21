import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Filter, 
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Sparkles,
  Zap,
  Target,
  Rocket,
  BarChart3,
  RefreshCw,
  Eye,
  Download,
  Share2,
  Loader2,
  Settings2,
  Clock,
  Calendar,
  ArrowRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiService, Workflow as WorkflowType } from '@/services/api'
import { NewWorkflowModal } from '@/components/NewWorkflowModal'

export function Workflows() {
  const [workflows, setWorkflows] = useState<WorkflowType[]>([])
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
      
      const workflowsData = await apiService.getWorkflows()
      
      // Ensure workflowsData is an array
      const validWorkflows = Array.isArray(workflowsData) ? workflowsData : []
      setWorkflows(validWorkflows)
    } catch (err) {
      console.error('Failed to load workflows:', err)
      setError('Failed to load workflows. Please try again.')
      // Set empty arrays as fallback
      setWorkflows([])
    } finally {
      setLoading(false)
    }
  }

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
    // Refresh workflows
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
        return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-3 py-1 text-sm font-semibold shadow-lg">🟢 Active</Badge>
      case 'paused':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-3 py-1 text-sm font-semibold shadow-lg">🟡 Paused</Badge>
      case 'error':
        return <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 px-3 py-1 text-sm font-semibold shadow-lg">🔴 Error</Badge>
      case 'completed':
        return <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-3 py-1 text-sm font-semibold shadow-lg">🔵 Completed</Badge>
      case 'running':
        return <Badge className="bg-gradient-to-r from-purple-500 to-violet-500 text-white border-0 px-3 py-1 text-sm font-semibold shadow-lg animate-pulse">⚡ Running</Badge>
      default:
        return <Badge className="bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0 px-3 py-1 text-sm font-semibold shadow-lg">❓ Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white border-0 px-3 py-1 text-sm font-semibold shadow-lg">🔥 High</Badge>
      case 'medium':
        return <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-0 px-3 py-1 text-sm font-semibold shadow-lg">⚡ Medium</Badge>
      case 'low':
        return <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 px-3 py-1 text-sm font-semibold shadow-lg">🌱 Low</Badge>
      default:
        return <Badge className="bg-gradient-to-r from-gray-600 to-slate-600 text-white border-0 px-3 py-1 text-sm font-semibold shadow-lg">📊 Unknown</Badge>
    }
  }

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
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
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
            <Button 
              variant="outline" 
              size="sm" 
              className="border-blue-500/20 dark:border-blue-400/20"
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

        {/* Enhanced Workflows List */}
        <motion.div 
          variants={itemVariants}
          className="space-y-3"
        >
          {filteredWorkflows.map((workflow) => (
            <motion.div
              key={workflow.id}
              variants={itemVariants}
              whileHover={{ y: -2, scale: 1.01 }}
              className="group"
            >
              <Card className="border-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-gray-800/80 dark:via-gray-800/60 dark:to-gray-800/40 backdrop-blur-xl hover:shadow-xl dark:hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group hover:scale-[1.01] overflow-hidden relative"
                onClick={() => navigate(`/workflows/${workflow.id}/edit`)}
              >
                {/* Thick left border gradient */}
                <div className="absolute top-0 left-0 h-full w-1 z-20 rounded-l-lg
                  bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500
                  dark:from-blue-700 dark:via-purple-700 dark:to-pink-700
                  "></div>
                {/* Card content */}
                <CardContent className="p-4 relative z-10">
                  <div className="flex flex-col space-y-4">
                    {/* Header Section */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                            {workflow.name || 'Unnamed Workflow'}
                          </h3>
                          <div className="flex space-x-2">
                            {workflow.isActive ? 
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-2 py-0.5 text-xs font-semibold shadow-md">🟢 Active</Badge> :
                              <Badge className="bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0 px-2 py-0.5 text-xs font-semibold shadow-md">⚫ Inactive</Badge>
                            }
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {workflow.description || 'No description available'}
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200/50 dark:border-blue-700/50">
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                          {workflow.executionCount || 0}
                        </div>
                        <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Executions</div>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200/50 dark:border-green-700/50">
                        <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">
                          {workflow.taskCount || 0}
                        </div>
                        <div className="text-xs font-medium text-green-700 dark:text-green-300">Tasks</div>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border border-purple-200/50 dark:border-purple-700/50">
                        <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                          {workflow.avgDuration || 0}s
                        </div>
                        <div className="text-xs font-medium text-purple-700 dark:text-purple-300">Avg Duration</div>
                      </div>
                    </div>

                    {/* Tags Section */}
                    {workflow.tags && workflow.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {workflow.tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="outline" 
                            className="px-2 py-0.5 text-xs font-medium border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500 transition-colors duration-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Timeline Section */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex space-x-6">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Last Run:</span>
                            <span className="ml-1 text-xs font-semibold text-gray-900 dark:text-white">
                              {workflow.lastRun || 'Never'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Next Run:</span>
                            <span className="ml-1 text-xs font-semibold text-gray-900 dark:text-white">
                              {workflow.nextRun || 'Not scheduled'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Subtle Action Indicator */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Click to edit</span>
                        <ArrowRight className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        {/*<motion.div variants={itemVariants}>
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
        </motion.div>*/}
      </motion.div>
    </>
  )
} 