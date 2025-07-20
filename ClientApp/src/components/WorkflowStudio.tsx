import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings,
  Database,
  FileText,
  Mail,
  Zap,
  Clock,
  CheckCircle,
  Loader2,
  Workflow,
  Play,
  Star,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import { apiService, WorkflowNode, CreateWorkflowNodeRequest, UpdateWorkflowNodeRequest } from '@/services/api'

interface Task {
  id: string
  name: string
  type: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}

interface Connection {
  id: string
  sourceNodeId: string
  targetNodeId: string
}

interface WorkflowStudioProps {
  workflowId: string
}

export function WorkflowStudio({ workflowId }: WorkflowStudioProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [draggedNode, setDraggedNode] = useState<WorkflowNode | null>(null)
  const [connectingNode, setConnectingNode] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  // Available task types
  const availableTasks: Task[] = [
    {
      id: 'start',
      name: 'Start',
      type: 'trigger',
      description: 'Workflow starting point',
      icon: Play,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'data-processing',
      name: 'Data Processing',
      type: 'data',
      description: 'Process and transform data',
      icon: Database,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'email-notification',
      name: 'Email Notification',
      type: 'notification',
      description: 'Send email notifications',
      icon: Mail,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'file-operation',
      name: 'File Operation',
      type: 'file',
      description: 'Read or write files',
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      id: 'api-call',
      name: 'API Call',
      type: 'api',
      description: 'Make HTTP requests',
      icon: Zap,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      id: 'delay',
      name: 'Delay',
      type: 'control',
      description: 'Wait for specified time',
      icon: Clock,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10'
    },
    {
      id: 'condition',
      name: 'Condition',
      type: 'control',
      description: 'Conditional logic',
      icon: CheckCircle,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10'
    }
  ]

  useEffect(() => {
    loadWorkflowData()
  }, [workflowId])

  const loadWorkflowData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load workflow nodes from API
      const nodes = await apiService.getWorkflowNodes(workflowId)
      setWorkflowNodes(nodes || [])
      
      // Extract connections from nodes
      const nodeConnections: Connection[] = []
      if (nodes) {
        nodes.forEach(node => {
          node.connections.forEach(targetNodeId => {
            nodeConnections.push({
              id: `${node.id}-${targetNodeId}`,
              sourceNodeId: node.id,
              targetNodeId
            })
          })
        })
      }
      setConnections(nodeConnections)
      
      setTasks(availableTasks)
    } catch (err) {
      console.error('Failed to load workflow data:', err)
      setError('Failed to load workflow data. Please try again.')
      // Set empty arrays as fallback
      setWorkflowNodes([])
      setConnections([])
      setTasks(availableTasks)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
  }

  const handleCanvasDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedTask && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - pan.x) / zoom
      const y = (e.clientY - rect.top - pan.y) / zoom
      
      try {
        const newNodeRequest: CreateWorkflowNodeRequest = {
          taskId: draggedTask.id,
          position: { x, y },
          connections: [],
          isStartingNode: draggedTask.id === 'start'
        }
        
        const newNode = await apiService.createWorkflowNode(workflowId, newNodeRequest)
        setWorkflowNodes(prev => [...prev, newNode])
        setDraggedTask(null)
      } catch (err) {
        console.error('Failed to create workflow node:', err)
        setError('Failed to create workflow node. Please try again.')
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleNodeClick = (node: WorkflowNode) => {
    const task = tasks.find(t => t.id === node.taskId)
    setSelectedTask(task || null)
  }

  const handleDeleteNode = async (nodeId: string) => {
    try {
      await apiService.deleteWorkflowNode(workflowId, nodeId)
      setWorkflowNodes(prev => prev.filter(node => node.id !== nodeId))
      setConnections(prev => prev.filter(conn => 
        conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
      ))
      setSelectedTask(null)
    } catch (err) {
      console.error('Failed to delete workflow node:', err)
      setError('Failed to delete workflow node. Please try again.')
    }
  }

  const handleSetStartingNode = async (nodeId: string) => {
    try {
      await apiService.setStartingNode(workflowId, nodeId)
      setWorkflowNodes(prev => prev.map(node => ({
        ...node,
        isStartingNode: node.id === nodeId
      })))
    } catch (err) {
      console.error('Failed to set starting node:', err)
      setError('Failed to set starting node. Please try again.')
    }
  }

  const handleNodeDragStart = (node: WorkflowNode) => {
    setDraggedNode(node)
    setIsDragging(true)
  }

  const handleNodeDragEnd = async (nodeId: string, info: PanInfo) => {
    if (draggedNode) {
      const newPosition = {
        x: draggedNode.position.x + info.offset.x / zoom,
        y: draggedNode.position.y + info.offset.y / zoom
      }
      
      try {
        const updateRequest: UpdateWorkflowNodeRequest = {
          position: newPosition
        }
        
        await apiService.updateWorkflowNode(workflowId, nodeId, updateRequest)
        setWorkflowNodes(prev => prev.map(node => 
          node.id === nodeId 
            ? { ...node, position: newPosition }
            : node
        ))
      } catch (err) {
        console.error('Failed to update node position:', err)
        setError('Failed to update node position. Please try again.')
      }
    }
    
    setDraggedNode(null)
    setIsDragging(false)
  }

  const handleConnectionStart = (nodeId: string) => {
    setConnectingNode(nodeId)
  }

  const handleRemoveConnection = async (connectionId: string) => {
    try {
      const connection = connections.find(c => c.id === connectionId)
      if (connection) {
        await apiService.removeConnection(workflowId, connection.sourceNodeId, connection.targetNodeId)
        setConnections(prev => prev.filter(c => c.id !== connectionId))
        setWorkflowNodes(prev => prev.map(node => 
          node.id === connection.sourceNodeId
            ? { ...node, connections: node.connections.filter(c => c !== connection.targetNodeId) }
            : node
        ))
      }
    } catch (err) {
      console.error('Failed to remove connection:', err)
      setError('Failed to remove connection. Please try again.')
    }
  }

  // Zoom and pan handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3))
  }

  const handleResetZoom = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.3, Math.min(3, zoom * delta))
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      const zoomRatio = newZoom / zoom
      const newPanX = mouseX - (mouseX - pan.x) * zoomRatio
      const newPanY = mouseY - (mouseY - pan.y) * zoomRatio
      
      setZoom(newZoom)
      setPan({ x: newPanX, y: newPanY })
    }
  }, [zoom, pan])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && !isDragging) { // Left mouse button
      setIsPanning(true)
      setLastMousePos({ x: e.clientX, y: e.clientY })
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.cursor = 'grabbing'
      }
    }
  }, [isDragging])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && !isDragging) {
      const deltaX = e.clientX - lastMousePos.x
      const deltaY = e.clientY - lastMousePos.y
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      
      setLastMousePos({ x: e.clientX, y: e.clientY })
    }
  }, [isPanning, isDragging, lastMousePos])

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false)
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab'
      }
    }
  }, [isPanning])

  const getNodePosition = (node: WorkflowNode) => {
    return {
      x: node.position.x * zoom + pan.x,
      y: node.position.y * zoom + pan.y
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading workflow studio...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={loadWorkflowData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Task Palette */}
      <div className="w-64 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/50 p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold dark:text-white mb-2">Task Palette</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Drag tasks to the canvas to build your workflow
          </p>
        </div>
        
        <div className="space-y-2">
          {availableTasks.map((task) => (
            <motion.div
              key={task.id}
              draggable
              onDragStart={() => handleDragStart(task)}
              onDragEnd={handleDragEnd}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing ${task.bgColor} hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 ${
                task.id === 'start' ? 'border-green-300 dark:border-green-600' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${task.bgColor}`}>
                  <task.icon className={`h-4 w-4 ${task.color}`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm dark:text-white">{task.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{task.description}</div>
                </div>
                {task.id === 'start' && (
                  <Star className="h-3 w-3 text-green-500" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-lg p-2 shadow-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.3}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium dark:text-white min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div
          ref={canvasRef}
          className="h-full bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-slate-900/50 dark:to-slate-800/50 relative overflow-hidden cursor-grab"
          onDrop={handleCanvasDrop}
          onDragOver={handleDragOver}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              transform: `translate(${pan.x}px, ${pan.y}px)`
            }}
          />

          {/* SVG for Connections */}
          <svg className="absolute inset-0 pointer-events-none" style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}>
            {connections.map((connection) => {
              const sourceNode = workflowNodes.find(n => n.id === connection.sourceNodeId)
              const targetNode = workflowNodes.find(n => n.id === connection.targetNodeId)
              
              if (!sourceNode || !targetNode) return null
              
              const sourcePos = sourceNode.position
              const targetPos = targetNode.position
              
              return (
                <g key={connection.id}>
                  <path
                    d={`M ${sourcePos.x} ${sourcePos.y} L ${targetPos.x} ${targetPos.y}`}
                    stroke={connectingNode === connection.sourceNodeId ? "#3b82f6" : "#6b7280"}
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="transition-colors duration-200"
                  />
                  <circle
                    cx={sourcePos.x}
                    cy={sourcePos.y}
                    r="4"
                    fill="#3b82f6"
                    className="cursor-pointer"
                    onClick={() => handleRemoveConnection(connection.id)}
                  />
                </g>
              )
            })}
            
            {/* Arrow marker definition */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
          </svg>

          {/* Workflow Nodes */}
          {workflowNodes.map((node) => {
            const task = tasks.find(t => t.id === node.taskId)
            if (!task) return null

            const position = getNodePosition(node)

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                drag
                dragMomentum={false}
                dragElastic={0}
                onDragStart={() => handleNodeDragStart(node)}
                onDragEnd={(_, info) => handleNodeDragEnd(node.id, info)}
                className="absolute cursor-move"
                style={{
                  left: position.x,
                  top: position.y,
                  transform: 'translate(-50%, -50%)',
                  zIndex: connectingNode === node.id ? 10 : 1
                }}
                onClick={() => handleNodeClick(node)}
              >
                <Card className={`w-48 border-2 ${
                  node.isStartingNode 
                    ? 'border-green-200 dark:border-green-700 bg-green-50/90 dark:bg-green-900/90' 
                    : connectingNode === node.id
                    ? 'border-blue-300 dark:border-blue-600 bg-blue-50/90 dark:bg-blue-900/90'
                    : 'border-blue-200 dark:border-blue-700 bg-white/90 dark:bg-slate-800/90'
                } backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-200`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${task.bgColor}`}>
                          <task.icon className={`h-4 w-4 ${task.color}`} />
                        </div>
                        <CardTitle className="text-sm dark:text-white">{task.name}</CardTitle>
                        {node.isStartingNode && (
                          <Star className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNode(node.id)
                        }}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        ×
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 dark:text-gray-400">{task.description}</p>
                    <div className="mt-2 flex space-x-1">
                      <Badge variant="outline" className="text-xs border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400">Node</Badge>
                      <Badge variant="outline" className="text-xs border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">{task.type}</Badge>
                      {node.isStartingNode && (
                        <Badge variant="outline" className="text-xs border-green-200 dark:border-green-700 text-green-600 dark:text-green-400">Start</Badge>
                      )}
                    </div>
                    <div className="mt-2 flex space-x-1">
                      {!node.isStartingNode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSetStartingNode(node.id)
                          }}
                          className="text-xs text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Set as Start
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleConnectionStart(node.id)
                        }}
                        className={`text-xs ${
                          connectingNode === node.id
                            ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/20'
                        }`}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}

          {/* Drop Zone Indicator */}
          {draggedTask && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm">
                <div className="text-blue-600 dark:text-blue-400 font-medium">
                  Drop {draggedTask.name} here
                </div>
                <div className="text-sm text-blue-500 dark:text-blue-400 mt-1">
                  Release to add to workflow
                </div>
              </div>
            </div>
          )}

          {/* Connection Mode Indicator */}
          {connectingNode && (
            <div className="absolute top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Click on a node to connect</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {workflowNodes.length === 0 && !draggedTask && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <Workflow className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Empty Workflow
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Drag tasks from the palette to start building your workflow
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Properties Panel */}
      {selectedTask && (
        <div className="w-80 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border-l border-white/20 dark:border-slate-700/50 p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold dark:text-white mb-2">Task Properties</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure the selected task
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">Task Name</label>
              <input
                type="text"
                defaultValue={selectedTask.name}
                className="w-full p-2 rounded-md bg-white/50 dark:bg-gray-700/50 backdrop-blur-xl border border-gray-300 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">Description</label>
              <textarea
                defaultValue={selectedTask.description}
                rows={3}
                className="w-full p-2 rounded-md bg-white/50 dark:bg-gray-700/50 backdrop-blur-xl border border-gray-300 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">Type</label>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400">{selectedTask.type}</Badge>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                <Settings className="h-4 w-4 mr-2" />
                Configure Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 