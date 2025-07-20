import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft,
  Save,
  Play,
  Trash2,
  Copy,
  Settings,
  Workflow,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  Power,
  PowerOff,
  Archive,
  Plus,
  X,
  Variable,
  Clock,
  Zap,
  MousePointer,
  Globe
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Workflow as WorkflowType } from '@/services/api'
import { WorkflowStudio } from '@/components/WorkflowStudio'
import { apiService } from '@/services/api'

interface WorkflowVariable {
  id: string
  name: string
  value: string
  type: 'Global' | 'System'
}

interface WorkflowTrigger {
  id: string
  name: string
  type: 'Manual' | 'Cron' | 'Webhook'
  configuration: string
  isActive: boolean
}

export function EditWorkflow() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [workflow, setWorkflow] = useState<WorkflowType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'settings' | 'studio'>('settings')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  // Variables state
  const [variables, setVariables] = useState<WorkflowVariable[]>([])
  const [newVariable, setNewVariable] = useState({
    name: '',
    value: '',
    type: 'Global' as 'Global' | 'System'
  })

  // Triggers state
  const [triggers, setTriggers] = useState<WorkflowTrigger[]>([])
  const [newTrigger, setNewTrigger] = useState({
    name: '',
    type: 'Manual' as 'Manual' | 'Cron' | 'Webhook',
    configuration: '',
    isActive: true
  })

  useEffect(() => {
    if (id) {
      loadWorkflow()
    }
  }, [id])

  const loadWorkflow = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Ensure we have a valid ID
      const workflowId = id || '1'
      
      // Load workflow from API
      const workflowData = await apiService.getWorkflowById(workflowId)
      
      setWorkflow(workflowData)
      setFormData({
        name: workflowData.name,
        description: workflowData.description || ''
      })

      // Load variables from API (when available)
      // For now, we'll use empty array until variables API is implemented
      setVariables([])

      // Load triggers from API (when available)
      // For now, we'll use empty array until triggers API is implemented
      setTriggers([])
    } catch (err) {
      console.error('Failed to load workflow:', err)
      setError('Failed to load workflow. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Validate form data
      if (!formData.name.trim()) {
        setError('Workflow name is required')
        return
      }

      // Update workflow data
      const updatedWorkflow: WorkflowType = {
        ...workflow!,
        name: formData.name,
        description: formData.description,
        updatedAt: new Date().toISOString()
      }

      // In a real app, you would call the API here
      // await apiService.updateWorkflow(updatedWorkflow)
      
      setWorkflow(updatedWorkflow)
      setSuccess('Workflow updated successfully!')
      
      // Navigate back to workflows list after a short delay
      setTimeout(() => {
        navigate('/workflows')
      }, 2000)
    } catch (err) {
      console.error('Failed to save workflow:', err)
      setError('Failed to save workflow. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const newActiveState = !workflow?.isActive
      
      // In a real app, you would call the API here
      // await apiService.updateWorkflow({ ...workflow!, isActive: newActiveState })
      
      setWorkflow(prev => prev ? { ...prev, isActive: newActiveState } : null)
      setSuccess(`Workflow ${newActiveState ? 'activated' : 'deactivated'} successfully!`)
    } catch (err) {
      console.error('Failed to toggle workflow status:', err)
      setError('Failed to update workflow status. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    try {
      setSaving(true)
      setError(null)
      
      // In a real app, you would call the API here
      // await apiService.archiveWorkflow(workflow!.id)
      
      setSuccess('Workflow archived successfully!')
      setTimeout(() => {
        navigate('/workflows')
      }, 2000)
    } catch (err) {
      console.error('Failed to archive workflow:', err)
      setError('Failed to archive workflow. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddVariable = () => {
    if (!newVariable.name.trim() || !newVariable.value.trim()) {
      setError('Variable name and value are required')
      return
    }

    if (variables.some(v => v.name === newVariable.name)) {
      setError('Variable name already exists')
      return
    }

    const variable: WorkflowVariable = {
      id: Date.now().toString(),
      name: newVariable.name.trim(),
      value: newVariable.value.trim(),
      type: newVariable.type
    }

    setVariables(prev => [...prev, variable])
    setNewVariable({ name: '', value: '', type: 'Global' })
    setError(null)
  }

  const handleRemoveVariable = (id: string) => {
    setVariables(prev => prev.filter(v => v.id !== id))
  }

  const handleAddTrigger = () => {
    if (!newTrigger.name.trim()) {
      setError('Trigger name is required')
      return
    }

    if (newTrigger.type === 'Cron' && !newTrigger.configuration.trim()) {
      setError('Cron expression is required for scheduled triggers')
      return
    }

    if (newTrigger.type === 'Webhook' && !newTrigger.configuration.trim()) {
      setError('Webhook URL is required for webhook triggers')
      return
    }

    if (triggers.some(t => t.name === newTrigger.name)) {
      setError('Trigger name already exists')
      return
    }

    const trigger: WorkflowTrigger = {
      id: Date.now().toString(),
      name: newTrigger.name.trim(),
      type: newTrigger.type,
      configuration: newTrigger.configuration.trim(),
      isActive: newTrigger.isActive
    }

    setTriggers(prev => [...prev, trigger])
    setNewTrigger({ name: '', type: 'Manual', configuration: '', isActive: true })
    setError(null)
  }

  const handleRemoveTrigger = (id: string) => {
    setTriggers(prev => prev.filter(t => t.id !== id))
  }

  const handleToggleTrigger = (id: string) => {
    setTriggers(prev => prev.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ))
  }

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'Manual':
        return <MousePointer className="h-4 w-4" />
      case 'Cron':
        return <Clock className="h-4 w-4" />
      case 'Webhook':
        return <Globe className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  const getTriggerBadge = (type: string) => {
    switch (type) {
      case 'Manual':
        return <Badge variant="outline" className="border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400">Manual</Badge>
      case 'Cron':
        return <Badge variant="outline" className="border-green-200 dark:border-green-700 text-green-600 dark:text-green-400">Scheduled</Badge>
      case 'Webhook':
        return <Badge variant="outline" className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400">Webhook</Badge>
      default:
        return <Badge variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">Unknown</Badge>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading workflow...</span>
        </div>
      </div>
    )
  }

  if (error && !workflow) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={loadWorkflow} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
                Edit Workflow
              </motion.h1>
              <motion.p 
                className="text-lg text-slate-600 dark:text-slate-400 mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Modify workflow settings and configuration
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
              onClick={() => navigate('/workflows')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center space-x-2"
        >
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-700 dark:text-green-300">{success}</span>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-2"
        >
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </motion.div>
      )}

      {/* Quick Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-xl p-4 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="hover:bg-green-500/10 dark:hover:bg-green-500/20">
              <Play className="h-4 w-4 mr-2" />
              Run Workflow
            </Button>
            <Button variant="outline" size="sm" className="hover:bg-blue-500/10 dark:hover:bg-blue-500/20">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button variant="outline" size="sm" className="hover:bg-purple-500/10 dark:hover:bg-purple-500/20">
              <Eye className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleToggleActive}
              disabled={saving}
              className={`hover:bg-orange-500/10 dark:hover:bg-orange-500/20 ${
                workflow?.isActive 
                  ? 'text-orange-600 hover:text-orange-700' 
                  : 'text-green-600 hover:text-green-700'
              }`}
            >
              {workflow?.isActive ? (
                <PowerOff className="h-4 w-4 mr-2" />
              ) : (
                <Power className="h-4 w-4 mr-2" />
              )}
              {workflow?.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleArchive}
              disabled={saving}
              className="hover:bg-yellow-500/10 dark:hover:bg-yellow-500/20 text-yellow-600 hover:text-yellow-700"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Modern Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative"
      >
        {/* Tab Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-2xl blur-xl" />
        
        {/* Tab Container */}
        <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 shadow-xl p-1">
          <div className="flex space-x-1">
            <motion.button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-6 py-4 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                activeTab === 'settings'
                  ? 'text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeTab === 'settings' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative flex items-center justify-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </div>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('studio')}
              className={`flex-1 px-6 py-4 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                activeTab === 'studio'
                  ? 'text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeTab === 'studio' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative flex items-center justify-center space-x-2">
                <Workflow className="h-4 w-4" />
                <span>Studio</span>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'settings' ? (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="border-blue-500/20 dark:border-blue-400/20 bg-gradient-to-br from-white/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 dark:text-white">
                    <Settings className="h-5 w-5 text-blue-500" />
                    <span>Basic Information</span>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Configure the basic workflow settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-white">Workflow Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter workflow name"
                      className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-blue-500/20 dark:border-blue-400/20 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="dark:text-white">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this workflow does"
                      rows={4}
                      className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-blue-500/20 dark:border-blue-400/20 dark:text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Triggers Management */}
              <Card className="border-blue-500/20 dark:border-blue-400/20 bg-gradient-to-br from-white/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 dark:text-white">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span>Triggers</span>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Configure how and when this workflow should be executed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add New Trigger */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="dark:text-white">Trigger Name</Label>
                        <Input
                          value={newTrigger.name}
                          onChange={(e) => setNewTrigger(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Daily Schedule"
                          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-blue-500/20 dark:border-blue-400/20 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="dark:text-white">Trigger Type</Label>
                        <select
                          value={newTrigger.type}
                          onChange={(e) => setNewTrigger(prev => ({ 
                            ...prev, 
                            type: e.target.value as 'Manual' | 'Cron' | 'Webhook',
                            configuration: ''
                          }))}
                          className="w-full p-2 rounded-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-blue-500/20 dark:border-blue-400/20 dark:text-white"
                        >
                          <option value="Manual">Manual Execution</option>
                          <option value="Cron">Scheduled (Cron)</option>
                          <option value="Webhook">Webhook</option>
                        </select>
                      </div>
                    </div>
                    
                    {newTrigger.type === 'Cron' && (
                      <div className="space-y-2">
                        <Label className="dark:text-white">Cron Expression</Label>
                        <Input
                          value={newTrigger.configuration}
                          onChange={(e) => setNewTrigger(prev => ({ ...prev, configuration: e.target.value }))}
                          placeholder="e.g., 0 9 * * * (daily at 9 AM)"
                          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-blue-500/20 dark:border-blue-400/20 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Format: minute hour day month weekday
                        </p>
                      </div>
                    )}
                    
                    {newTrigger.type === 'Webhook' && (
                      <div className="space-y-2">
                        <Label className="dark:text-white">Webhook URL</Label>
                        <Input
                          value={newTrigger.configuration}
                          onChange={(e) => setNewTrigger(prev => ({ ...prev, configuration: e.target.value }))}
                          placeholder="https://api.example.com/webhook"
                          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-blue-500/20 dark:border-blue-400/20 dark:text-white"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="triggerActive"
                        checked={newTrigger.isActive}
                        onChange={(e) => setNewTrigger(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="triggerActive" className="dark:text-white">Active Trigger</Label>
                    </div>
                    
                    <Button 
                      onClick={handleAddTrigger}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Trigger
                    </Button>
                  </div>

                  {/* Triggers List */}
                  <div className="space-y-3">
                    <h4 className="font-medium dark:text-white">Current Triggers</h4>
                    {triggers.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No triggers defined yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {triggers.map((trigger) => (
                          <motion.div
                            key={trigger.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                {getTriggerIcon(trigger.type)}
                                <span className="font-medium dark:text-white">{trigger.name}</span>
                                {getTriggerBadge(trigger.type)}
                                <Badge 
                                  variant={trigger.isActive ? "default" : "secondary"}
                                  className={trigger.isActive 
                                    ? "bg-green-500 text-white dark:bg-green-600" 
                                    : "bg-gray-500 text-white dark:bg-gray-600"
                                  }
                                >
                                  {trigger.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              {trigger.configuration && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-mono">
                                  {trigger.configuration}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleTrigger(trigger.id)}
                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                {trigger.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTrigger(trigger.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Variables Management */}
              <Card className="border-blue-500/20 dark:border-blue-400/20 bg-gradient-to-br from-white/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 dark:text-white">
                    <Variable className="h-5 w-5 text-purple-500" />
                    <span>Variables</span>
                  </CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    Manage global and system variables for this workflow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add New Variable */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="dark:text-white">Variable Name</Label>
                        <Input
                          value={newVariable.name}
                          onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., API_BASE_URL"
                          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-blue-500/20 dark:border-blue-400/20 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="dark:text-white">Value</Label>
                        <Input
                          value={newVariable.value}
                          onChange={(e) => setNewVariable(prev => ({ ...prev, value: e.target.value }))}
                          placeholder="e.g., https://api.example.com"
                          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border-blue-500/20 dark:border-blue-400/20 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="dark:text-white">Type</Label>
                        <select
                          value={newVariable.type}
                          onChange={(e) => setNewVariable(prev => ({ ...prev, type: e.target.value as 'Global' | 'System' }))}
                          className="w-full p-2 rounded-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-blue-500/20 dark:border-blue-400/20 dark:text-white"
                        >
                          <option value="Global">Global</option>
                          <option value="System">System</option>
                        </select>
                      </div>
                    </div>
                    <Button 
                      onClick={handleAddVariable}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Variable
                    </Button>
                  </div>

                  {/* Variables List */}
                  <div className="space-y-3">
                    <h4 className="font-medium dark:text-white">Current Variables</h4>
                    {variables.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No variables defined yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {variables.map((variable) => (
                          <motion.div
                            key={variable.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3 bg-white/30 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium dark:text-white">{variable.name}</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    variable.type === 'System' 
                                      ? 'border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                  }`}
                                >
                                  {variable.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{variable.value}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveVariable(variable.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Current Status */}
              <Card className="border-blue-500/20 dark:border-blue-400/20 bg-gradient-to-br from-white/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="dark:text-white">Current Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getStatusBadge(workflow?.status || 'active')}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <Badge 
                      variant={workflow?.isActive ? "default" : "secondary"}
                      className={workflow?.isActive 
                        ? "bg-green-500 text-white dark:bg-green-600" 
                        : "bg-gray-500 text-white dark:bg-gray-600"
                      }
                    >
                      {workflow?.isActive ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Workflow Stats */}
              {workflow && (
                <Card className="border-blue-500/20 dark:border-blue-400/20 bg-gradient-to-br from-white/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Workflow Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 rounded-lg bg-blue-500/5 dark:bg-blue-500/20">
                        <div className="font-semibold dark:text-white">{workflow.executionCount || 0}</div>
                        <div className="text-xs text-muted-foreground">Executions</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-green-500/5 dark:bg-green-500/20">
                        <div className="font-semibold dark:text-white">{workflow.avgDuration || 0}s</div>
                        <div className="text-xs text-muted-foreground">Avg Duration</div>
                      </div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-purple-500/5 dark:bg-purple-500/20">
                      <div className="font-semibold dark:text-white">{workflow.successRate || 0}%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Triggers Summary */}
              <Card className="border-blue-500/20 dark:border-blue-400/20 bg-gradient-to-br from-white/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="dark:text-white">Triggers Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 rounded-lg bg-yellow-500/5 dark:bg-yellow-500/20">
                      <div className="font-semibold dark:text-white">{triggers.filter(t => t.isActive).length}</div>
                      <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-gray-500/5 dark:bg-gray-500/20">
                      <div className="font-semibold dark:text-white">{triggers.filter(t => !t.isActive).length}</div>
                      <div className="text-xs text-muted-foreground">Inactive</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {triggers.filter(t => t.type === 'Manual').length > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Manual</span>
                        <span className="dark:text-white">{triggers.filter(t => t.type === 'Manual').length}</span>
                      </div>
                    )}
                    {triggers.filter(t => t.type === 'Cron').length > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Scheduled</span>
                        <span className="dark:text-white">{triggers.filter(t => t.type === 'Cron').length}</span>
                      </div>
                    )}
                    {triggers.filter(t => t.type === 'Webhook').length > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Webhook</span>
                        <span className="dark:text-white">{triggers.filter(t => t.type === 'Webhook').length}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Variables Summary */}
              <Card className="border-blue-500/20 dark:border-blue-400/20 bg-gradient-to-br from-white/50 to-gray-50/30 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="dark:text-white">Variables Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-2 rounded-lg bg-purple-500/5 dark:bg-purple-500/20">
                      <div className="font-semibold dark:text-white">{variables.filter(v => v.type === 'Global').length}</div>
                      <div className="text-xs text-muted-foreground">Global</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-blue-500/5 dark:bg-blue-500/20">
                      <div className="font-semibold dark:text-white">{variables.filter(v => v.type === 'System').length}</div>
                      <div className="text-xs text-muted-foreground">System</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="h-[600px] bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl">
            <WorkflowStudio workflowId={workflow?.id || ''} />
          </div>
        )}
      </motion.div>
    </motion.div>
  )
} 