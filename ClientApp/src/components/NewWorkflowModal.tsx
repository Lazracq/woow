import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Sparkles, Workflow as WorkflowIcon, Zap, Target } from 'lucide-react'
import { apiService, Workflow as WorkflowType } from '@/services/api'

interface NewWorkflowModalProps {
  isOpen: boolean
  onClose: () => void
  onWorkflowCreated: (workflow: WorkflowType) => void
}

export function NewWorkflowModal({ isOpen, onClose, onWorkflowCreated }: NewWorkflowModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    complexity: 'medium',
    tags: [] as string[],
    newTag: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Workflow name is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const newWorkflow = await apiService.createWorkflow({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isActive: true,
        status: 'active'
      })

      onWorkflowCreated(newWorkflow)
      handleClose()
    } catch (err) {
      console.error('Failed to create workflow:', err)
      setError('Failed to create workflow. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      priority: 'medium',
      complexity: 'medium',
      tags: [],
      newTag: ''
    })
    setError(null)
    onClose()
  }

  const addTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const templates = [
    {
      name: 'Data Processing Pipeline',
      description: 'Automated data processing and transformation workflow',
      icon: WorkflowIcon,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      name: 'Email Notification System',
      description: 'Sends automated email notifications based on events',
      icon: Zap,
      color: 'from-green-500 to-teal-500'
    },
    {
      name: 'Report Generation',
      description: 'Generates daily and weekly reports automatically',
      icon: Target,
      color: 'from-purple-500 to-pink-500'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Sparkles className="h-5 w-5 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-xl dark:text-white">Create New Workflow</CardTitle>
                      <CardDescription className="dark:text-gray-300">
                        Define a new workflow with tasks and configurations
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form Section */}
                  <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="dark:text-white">Workflow Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter workflow name..."
                          className="mt-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="dark:text-white">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your workflow..."
                          className="mt-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="priority" className="dark:text-white">Priority</Label>
                          <Select
                            value={formData.priority}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                          >
                            <SelectTrigger className="mt-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="complexity" className="dark:text-white">Complexity</Label>
                          <Select
                            value={formData.complexity}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, complexity: value }))}
                          >
                            <SelectTrigger className="mt-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="dark:text-white">Tags</Label>
                        <div className="mt-1 space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={formData.newTag}
                              onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                              placeholder="Add a tag..."
                              className="flex-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={addTag}
                              disabled={!formData.newTag.trim()}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {formData.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                >
                                  {tag}
                                  <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {error && (
                        <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                          {error}
                        </div>
                      )}

                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClose}
                          className="dark:border-gray-600 dark:text-gray-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading || !formData.name.trim()}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Create Workflow
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Templates Section */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold dark:text-white mb-3">Quick Templates</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Start with a pre-configured template to speed up your workflow creation
                      </p>
                    </div>

                    <div className="space-y-3">
                      {templates.map((template) => (
                        <motion.button
                          key={template.name}
                          className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-all duration-200 text-left"
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              name: template.name,
                              description: template.description
                            }))
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <motion.div 
                              className={`p-2 rounded-lg bg-gradient-to-r ${template.color}`}
                              whileHover={{ rotate: 5 }}
                            >
                              <template.icon className="h-5 w-5 text-white" />
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="font-medium dark:text-white">{template.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{template.description}</p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 