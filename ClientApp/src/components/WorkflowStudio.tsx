import React, { useState, useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  Handle,
  Position,
  MarkerType,
  NodeChange,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play,
  Settings,
  Plus,
  Trash2,
  Database,
  Mail,
  Globe,
  Code,
  Clock,
  Loader2,
  Maximize2,
  Minimize2,
  UploadCloud,
  GitBranch,
  Repeat,
  Shuffle,
  GitMerge,
  HelpCircle,
  Plug
} from 'lucide-react'
import { apiService } from '@/services/api'
import { debounce } from 'lodash'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface NodeData {
  label: string
  type?: string
  description?: string
  isActive?: boolean
  config?: any // Added for dynamic config
}

interface WorkflowStudioProps {
  workflowId: string
}

// Custom Node Types
const StartingNode = () => {
  const [showStartModal, setShowStartModal] = useState(false);
  return (
    <Card className="w-64 border-2 border-green-500 bg-green-50 dark:bg-green-900/20 flex flex-col items-center justify-center relative">
      <CardContent className="flex flex-col items-center justify-center py-8">
        <button
          className="flex flex-col items-center justify-center focus:outline-none group"
          onClick={() => setShowStartModal(true)}
          title="Start Workflow"
        >
          <Play className="h-16 w-16 text-green-600 group-hover:scale-110 transition-transform duration-150" />
          <span className="mt-2 font-semibold text-lg text-green-700 dark:text-green-300">Start Workflow</span>
        </button>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Workflow starting point</p>
        {/* Plug handle */}
        <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', zIndex: 3, pointerEvents: 'none' }}>
          <Plug className="text-green-600 dark:text-green-400" style={{ width: 32, height: 32 }} />
        </div>
        <Handle
          type="source"
          position={Position.Right}
          id="onExecute"
          style={{
            background: '#10b981',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 24,
            height: 24,
            border: '3px solid #10b981',
            borderRadius: '50%',
            zIndex: 2,
            right: -12,
          }}
        />
      </CardContent>
      {/* Modal for execution confirmation */}
      <Dialog open={showStartModal} onOpenChange={setShowStartModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Execute Workflow</DialogTitle>
            <DialogDescription>Are you sure you want to start this workflow?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartModal(false)}>Cancel</Button>
            <Button className="bg-green-600 text-white" onClick={() => { setShowStartModal(false); /* TODO: trigger execution */ }}>Start</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Helper: Node type style map
const NODE_TYPE_STYLES: Record<string, { border: string; bg: string; icon: JSX.Element }> = {
  HttpCallout: {
    border: 'border-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: <Globe className="h-4 w-4 text-blue-500" />,
  },
  ScriptExecution: {
    border: 'border-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: <Code className="h-4 w-4 text-purple-500" />,
  },
  StoragePush: {
    border: 'border-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: <UploadCloud className="h-4 w-4 text-green-500" />,
  },
  Conditional: {
    border: 'border-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: <HelpCircle className="h-4 w-4 text-yellow-500" />,
  },
  Split: {
    border: 'border-pink-500',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    icon: <GitBranch className="h-4 w-4 text-pink-500" />,
  },
  Iteration: {
    border: 'border-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: <Repeat className="h-4 w-4 text-blue-400" />,
  },
  Merge: {
    border: 'border-gray-500',
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    icon: <GitMerge className="h-4 w-4 text-gray-500" />,
  },
  Delay: {
    border: 'border-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    icon: <Clock className="h-4 w-4 text-orange-500" />,
  },
  Batch: {
    border: 'border-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: <Shuffle className="h-4 w-4 text-red-500" />,
  },
  Parallel: {
    border: 'border-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: <Shuffle className="h-4 w-4 text-purple-500" />,
  },
  DataTransformation: {
    border: 'border-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    icon: <Code className="h-4 w-4 text-teal-500" />,
  },
  start: {
    border: 'border-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: <Play className="h-4 w-4 text-green-600" />,
  },
}

// Helper: Get node description
const getNodeDescription = (type: string, config: any) => {
  switch (type) {
    case 'Delay':
      return `Pause workflow for ${config?.DurationSeconds || 60} seconds.`
    case 'HttpCallout':
      return `Call ${config?.Url || 'an API endpoint'} (${config?.Method || 'GET'})`
    case 'ScriptExecution':
      return `Run a ${config?.Language || 'script'} script.`
    case 'StoragePush':
      return `Push data to ${config?.DestinationType || 'SFTP'}`
    case 'Conditional':
      return `If ${config?.Expression || 'condition'}`
    case 'Split':
      return `Split into ${config?.Branches || 2} branches.`
    case 'Iteration':
      return `For each in ${config?.Collection || 'items'}`
    case 'Merge':
      return `Merge branches.`
    case 'Batch':
      return `Run tasks in batch.`
    case 'Parallel':
      return `Run tasks in parallel.`
    case 'DataTransformation':
      return `Transform data using ${config?.Language || 'script'}`
    default:
      return ''
  }
}

// Modal state
// Remove these from the top-level scope:
// const [editNode, setEditNode] = useState<Node<NodeData> | null>(null)
// const [editConfig, setEditConfig] = useState<any>(null)
// const [editLabel, setEditLabel] = useState<string>('')

const TaskNode = ({ data, id }: { data: NodeData; id: string }) => {
  const style = NODE_TYPE_STYLES[data.type || 'HttpCallout'] || NODE_TYPE_STYLES['HttpCallout']
  return (
    <Card className={`w-64 border-2 ${style.border} ${style.bg} group relative`}>
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={e => { e.stopPropagation(); setEditNode({ id, data }); setEditConfig(data.config); setEditLabel(data.label); }}
          title="Edit"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
          onClick={e => { e.stopPropagation(); if (window.confirm('Delete this node?')) deleteNode(id); }}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center space-x-2 text-sm">
          {style.icon}
          <span>{data.label}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
          {getNodeDescription(data.type, data.config)}
        </p>
        <Handle
          type="target"
          position={Position.Left}
          id="target"
          style={{ background: '#3b82f6' }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="onSuccess"
          style={{ background: '#10b981', top: '30%' }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="onFailure"
          style={{ background: '#ef4444', top: '70%' }}
        />
      </CardContent>
    </Card>
  )
}

// Move nodeTypes outside the component
const nodeTypes: NodeTypes = {
  startingNode: StartingNode,
  taskNode: TaskNode,
};

export function WorkflowStudio({ workflowId }: WorkflowStudioProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSavedPositions, setLastSavedPositions] = useState<Record<string, { x: number; y: number }>>({})
  const studioRef = useRef<HTMLDivElement>(null);
  // Detect dark mode
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  // ✅ Move these hooks here:
  const [editNode, setEditNode] = useState<Node<NodeData> | null>(null)
  const [editConfig, setEditConfig] = useState<any>(null)
  const [editLabel, setEditLabel] = useState<string>('')
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  useEffect(() => {
    function updateStudioBg() {
      const isDark = document.documentElement.classList.contains('dark');
      if (studioRef.current) {
        studioRef.current.style.backgroundColor = isDark ? '#18181b' : '#fff';
      }
      if (document.fullscreenElement) {
        document.body.style.backgroundColor = isDark ? '#18181b' : '#fff';
      } else {
        document.body.style.backgroundColor = '';
      }
    }

    // Listen for theme changes
    const observer = new MutationObserver(updateStudioBg);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', updateStudioBg);

    // Initial set
    updateStudioBg();

    return () => {
      observer.disconnect();
      document.removeEventListener('fullscreenchange', updateStudioBg);
    };
  }, []);

  // Load workflow data from API
  useEffect(() => {
    const loadWorkflowData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load workflow nodes from API
        const workflowNodes = await apiService.getWorkflowNodes(workflowId)
        
        if (workflowNodes && workflowNodes.length > 0) {
          // Convert API nodes to React Flow nodes
          const reactFlowNodes: Node<NodeData>[] = workflowNodes.map(node => ({
            id: node.id,
            type: node.isStartingNode || node.type === 'start' ? 'startingNode' : 'taskNode',
            position: { x: node.positionX, y: node.positionY },
            data: {
              label: node.name,
              type: node.type || 'http',
              description: `Task ${node.name}`,
              isActive: node.isActive,
              config: node.configuration ? JSON.parse(node.configuration) : {}, // Add config
            },
          }))

          // Convert connections to React Flow edges
          const reactFlowEdges: Edge[] = []
          workflowNodes.forEach(node => {
            node.connections.forEach(targetNodeId => {
              reactFlowEdges.push({
                id: `${node.id}-${targetNodeId}`,
                source: node.id,
                target: targetNodeId,
                sourceHandle: 'onExecute', // Default handle
                targetHandle: 'target',
                type: 'smoothstep',
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 20,
                  height: 20,
                  color: '#10b981',
                },
                style: { 
                  stroke: '#10b981', 
                  strokeWidth: 2 
                },
                label: 'On Execute',
                labelStyle: { 
                  fill: '#10b981', 
                  fontWeight: 600 
                },
                labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
              })
            })
          })

          setNodes(reactFlowNodes)
          setEdges(reactFlowEdges)
        } else {
          // If no nodes exist, create a proper starting node in the database
          await createStartingNode()
        }
      } catch (err) {
        console.error('Failed to load workflow data:', err)
        setError('Failed to load workflow data. Please try again.')
        
        // Try to create a starting node as fallback
        try {
          await createStartingNode()
        } catch (createError) {
          console.error('Failed to create starting node as fallback:', createError)
          // If all else fails, show a minimal starting node
          const fallbackNodes: Node<NodeData>[] = [
            {
              id: 'start',
              type: 'startingNode',
              position: { x: 50, y: 200 },
              data: { label: 'Start Workflow' },
            },
          ]
          setNodes(fallbackNodes)
          setEdges([])
        }
      } finally {
        setLoading(false)
      }
    }

    if (workflowId) {
      loadWorkflowData()
    }
  }, [workflowId, setNodes, setEdges])

  // Create starting node if needed
  const createStartingNode = useCallback(async () => {
    try {
      await apiService.createWorkflowNode(workflowId, {
        name: 'Start Workflow',
        type: 'start',
        configuration: '{}',
        positionX: 0,
        positionY: 0,
        isActive: true,
        connections: []
      })
      
      // Reload the workflow data to get the new starting node
      const workflowNodes = await apiService.getWorkflowNodes(workflowId)
      
      if (workflowNodes && workflowNodes.length > 0) {
        const reactFlowNodes: Node<NodeData>[] = workflowNodes.map(node => ({
          id: node.id,
          type: node.isStartingNode ? 'startingNode' : 'taskNode',
          position: { x: node.positionX, y: node.positionY },
          data: {
            label: node.name,
            type: node.type || 'http',
            description: `Task ${node.name}`,
            isActive: node.isActive,
            config: node.configuration ? JSON.parse(node.configuration) : {}, // Add config
          },
        }))
        
        setNodes(reactFlowNodes)
        setEdges([])
      }
    } catch (error) {
      console.error('Failed to create starting node:', error)
      setError('Failed to create starting node. Please try again.')
    }
  }, [workflowId, setNodes, setEdges])

  // Debounced save function
  const saveNodePositions = useCallback(
    debounce(async (nodePositions: Record<string, { x: number; y: number }>) => {
      try {
        setSaving(true)
        console.log('Saving node positions:', nodePositions)
        
        // Filter out nodes with invalid GUIDs (like 'start' node)
        const validNodePositions = Object.entries(nodePositions).filter(([nodeId]) => {
          // Check if nodeId is a valid GUID
          const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          return guidRegex.test(nodeId)
        })
        
        if (validNodePositions.length === 0) {
          return
        }
        
        // Check if positions have actually changed
        const hasChanges = validNodePositions.some(([nodeId, position]) => {
          const lastSaved = lastSavedPositions[nodeId]
          return !lastSaved || 
                 lastSaved.x !== position.x || 
                 lastSaved.y !== position.y
        })

        if (hasChanges) {
          // Save each node position to the backend
          const savePromises = validNodePositions.map(([nodeId, position]) =>
            apiService.updateWorkflowNode(workflowId, nodeId, { position })
          )
          
          await Promise.all(savePromises)
          
          // Update last saved positions only for valid nodes
          const newLastSaved = { ...lastSavedPositions }
          validNodePositions.forEach(([nodeId, position]) => {
            newLastSaved[nodeId] = position
          })
          setLastSavedPositions(newLastSaved)
          
        }
      } catch (error) {
        console.error('Failed to save node positions:', error)
        setError('Failed to save node positions. Please try again.')
      } finally {
        setSaving(false)
      }
    }, 1000),
    [workflowId, lastSavedPositions]
  )

  // Debounced save effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (nodes.length > 0) {
        // Filter out nodes with invalid GUIDs
        const validNodes = nodes.filter(node => {
          const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          return guidRegex.test(node.id)
        })
        
        if (validNodes.length === 0) {
          return
        }
        
        const currentPositions = validNodes.reduce((acc, node) => {
          acc[node.id] = { x: node.position.x, y: node.position.y }
          return acc
        }, {} as Record<string, { x: number; y: number }>)

        // Check if any positions have changed
        const hasChanges = validNodes.some(node => {
          const lastSaved = lastSavedPositions[node.id]
          return !lastSaved || 
                 lastSaved.x !== node.position.x || 
                 lastSaved.y !== node.position.y
        })

        if (hasChanges) {
          saveNodePositions(currentPositions)
        }
      }
    }, 1000) // Save after 1 second of no changes

    return () => clearTimeout(timeoutId)
  }, [nodes, lastSavedPositions, saveNodePositions])

  // Custom node change handler to track position changes
  const onNodesChangeCustom = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes)
    
    // Check if any position changes occurred
    const positionChanges = changes.filter(change => 
      change.type === 'position' && change.position
    )
    
    if (positionChanges.length > 0) {
      // Positions changed, the useEffect will handle saving
    }
  }, [onNodesChange])

  const onConnect = useCallback(
    (params: Connection) => {
      const isStartToTask = params.sourceHandle === 'onExecute' && params.targetHandle === 'target';
      if (isStartToTask) {
        // Only allow one outgoing edge from the starting node
        const alreadyExists = edges.some(
          (e) => e.source === params.source && e.sourceHandle === 'onExecute'
        );
        if (alreadyExists) {
          window.alert('The Start Workflow node can only have one outgoing connection.');
          return;
        }
      }
      if (params.source && params.target && params.sourceHandle && params.targetHandle) {
        const newEdge: Edge = {
          id: `${params.source}-${params.target}-${Date.now()}`,
          source: params.source,
          target: params.target,
          sourceHandle: params.sourceHandle,
          targetHandle: params.targetHandle,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: params.sourceHandle === 'onFailure' ? '#ef4444' : '#10b981',
          },
          style: { 
            stroke: params.sourceHandle === 'onFailure' ? '#ef4444' : '#10b981', 
            strokeWidth: 2 
          },
          label: isStartToTask ? 'On Trigger' : undefined,
          labelStyle: isStartToTask
            ? { fill: '#10b981', fontWeight: 600 }
            : undefined,
          labelBgStyle: isStartToTask
            ? { fill: '#ffffff', fillOpacity: 0.8 }
            : undefined,
        }
        setEdges((eds) => addEdge(newEdge, eds))
      }
    },
    [setEdges, edges]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    setSelectedNode(node)
  }, [])

  const addTaskNode = useCallback(async () => {
    try {
      const newNode = await apiService.createWorkflowNode(workflowId, {
        name: 'New Task',
        type: 'http',
        configuration: '{}',
        positionX: 650,
        positionY: 200 + Math.random() * 200,
        isActive: true,
        connections: []
      })
      
      // Add the new node to the local state
      const reactFlowNode: Node<NodeData> = {
        id: newNode.id,
        type: 'taskNode',
        position: { x: newNode.positionX, y: newNode.positionY },
        data: {
          label: newNode.name,
          type: newNode.type,
          description: `Task ${newNode.name}`,
          isActive: newNode.isActive,
          config: newNode.configuration ? JSON.parse(newNode.configuration) : {}, // Add config
        },
      }
      
      setNodes((nds) => [...nds, reactFlowNode])
    } catch (error) {
      console.error('Failed to create new task:', error)
      setError('Failed to create new task. Please try again.')
    }
  }, [workflowId, setNodes])

  const deleteNode = useCallback(async (nodeId: string) => {
    try {
      await apiService.deleteWorkflowNode(workflowId, nodeId)
      setNodes((nds) => nds.filter((node) => node.id !== nodeId))
      setEdges((eds) => eds.filter((edge) => 
        edge.source !== nodeId && edge.target !== nodeId
      ))
      setSelectedNode(null)
    } catch (error) {
      console.error('Failed to delete node:', error)
      setError('Failed to delete node. Please try again.')
    }
  }, [workflowId, setNodes, setEdges])

  const saveNodeConfig = useCallback(async (nodeId: string, label: string, config: any) => {
    try {
      await apiService.updateWorkflowNode(workflowId, nodeId, { name: label, configuration: JSON.stringify(config) })
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, label: label, config: config } }
            : node
        )
      )
      setEditNode(null) // Close modal
    } catch (error) {
      console.error('Failed to save node config:', error)
      setError('Failed to save node config. Please try again.')
    }
  }, [workflowId, setNodes])

  // Drag-and-drop logic
  const dragTaskType = useRef<string | null>(null)

  // Helper: Default configs for each type
  const TASK_TYPE_CONFIGS: Record<string, { label: string; type: string; icon: JSX.Element; config: any; description: string }> = {
    HttpCallout: {
      label: 'HTTP Callout',
      type: 'HttpCallout',
      icon: <Globe className="h-5 w-5 text-blue-500" />,
      config: {
        Method: 'GET',
        Url: 'https://api.example.com/endpoint',
        TimeoutSeconds: 30,
        ContentType: 'application/json',
        Headers: {},
        Authentication: { Type: 'none' }
      },
      description: 'Call external APIs via HTTP(S)'
    },
    ScriptExecution: {
      label: 'Data Process (Bash Script)',
      type: 'ScriptExecution',
      icon: <Code className="h-5 w-5 text-purple-500" />,
      config: {
        Language: 'bash',
        Script: "#!/bin/bash\necho 'Hello World'",
        TimeoutSeconds: 30,
        OutputFormat: 'json'
      },
      description: 'Run a Bash script for data processing'
    },
    StoragePush: {
      label: 'Data Load (Push to SFTP)',
      type: 'StoragePush',
      icon: <UploadCloud className="h-5 w-5 text-green-500" />,
      config: {
        DestinationType: 'SFTP',
        Host: 'sftp.example.com',
        Port: 22,
        Username: 'user',
        Password: '',
        RemotePath: '/upload/path/'
      },
      description: 'Push data to SFTP server'
    },
    Conditional: {
      label: 'Conditional',
      type: 'Conditional',
      icon: <HelpCircle className="h-5 w-5 text-yellow-500" />,
      config: {
        Expression: 'x > 0',
        TrueBranch: [],
        FalseBranch: []
      },
      description: 'Branch workflow based on a condition'
    },
    Split: {
      label: 'Split',
      type: 'Split',
      icon: <GitBranch className="h-5 w-5 text-pink-500" />,
      config: {
        Branches: 2
      },
      description: 'Split execution into multiple branches'
    },
    Iteration: {
      label: 'Iteration',
      type: 'Iteration',
      icon: <Repeat className="h-5 w-5 text-blue-400" />,
      config: {
        Collection: 'items',
        Iterator: 'item'
      },
      description: 'Repeat a set of tasks for each item in a collection'
    },
    Merge: {
      label: 'Merge',
      type: 'Merge',
      icon: <GitMerge className="h-5 w-5 text-gray-500" />,
      config: {},
      description: 'Merge multiple branches back together'
    },
    Delay: {
      label: 'Delay',
      type: 'Delay',
      icon: <Clock className="h-5 w-5 text-orange-500" />,
      config: {
        DurationSeconds: 10
      },
      description: 'Pause the workflow for a specified duration'
    },
    Batch: {
      label: 'Batch',
      type: 'Batch',
      icon: <Shuffle className="h-5 w-5 text-red-500" />,
      config: {
        Tasks: []
      },
      description: 'Run multiple tasks in parallel or sequentially'
    },
    Parallel: {
      label: 'Parallel',
      type: 'Parallel',
      icon: <Shuffle className="h-5 w-5 text-purple-500" />,
      config: {
        Tasks: []
      },
      description: 'Run multiple tasks in parallel'
    },
    DataTransformation: {
      label: 'Data Transformation',
      type: 'DataTransformation',
      icon: <Code className="h-5 w-5 text-teal-500" />,
      config: {
        Script: '// This is a placeholder for a data transformation script',
        Language: 'javascript'
      },
      description: 'Apply complex data transformations using a scripting language'
    }
  }

  // Define categories for the palette
  const TASK_CATEGORIES: { label: string; key: string; tasks: string[] }[] = [
    { label: 'Integration', key: 'integration', tasks: ['HttpCallout', 'StoragePush', 'Notification'] },
    { label: 'Data', key: 'data', tasks: ['ScriptExecution', 'DataTransformation'] },
    { label: 'Control', key: 'control', tasks: ['Conditional', 'Split', 'Iteration', 'Merge', 'Delay', 'Batch', 'Parallel'] },
  ];

  // Drag events
  const onDragStart = (type: string) => (e: React.DragEvent) => {
    dragTaskType.current = type
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDragEnd = () => { dragTaskType.current = null }

  // React Flow drop handler
  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const flowPosition = reactFlowInstance?.project({ x, y }) ?? { x, y }; // Use React Flow's project
      const type = dragTaskType.current;
      if (!type) return;
      const def = TASK_TYPE_CONFIGS[type];
      try {
        const newNode = await apiService.createWorkflowNode(workflowId, {
          name: def.label,
          type: def.type,
          configuration: JSON.stringify(def.config),
          positionX: flowPosition.x,
          positionY: flowPosition.y,
          isActive: true,
          connections: []
        });
        const reactFlowNode: Node<NodeData> = {
          id: newNode.id,
          type: 'taskNode',
          position: { x: newNode.positionX, y: newNode.positionY },
          data: {
            label: newNode.name,
            type: newNode.type,
            description: def.description,
            isActive: newNode.isActive,
            config: newNode.configuration ? JSON.parse(newNode.configuration) : {},
          },
        };
        setNodes((nds) => [...nds, reactFlowNode]);
      } catch (error) {
        setError('Failed to create new task. Please try again.');
      }
    },
    [workflowId, setNodes, reactFlowInstance]
  );

  const handleFullscreen = () => {
    if (!document.fullscreenElement && studioRef.current) {
      studioRef.current.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <div
      ref={studioRef}
      className="h-screen flex flex-col relative"
      style={{
        backgroundColor: isDark ? '#18181b' : '#fff',
        transition: 'background 0.2s',
      }}
    >
      {/* Fullscreen button, always in top-right */}
      {/* Removed absolute fullscreen button */}
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 z-20">
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={addTaskNode} disabled={loading} className="hidden">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
          {selectedNode && selectedNode.id !== 'start' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteNode(selectedNode.id)}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">Nodes: {nodes.length}</Badge>
          <Badge variant="outline">Connections: {edges.length}</Badge>
          {saving && (
            <Badge variant="outline" className="flex items-center">
              <Loader2 className="h-3 w-3 mr-1" />
              Saving...
            </Badge>
          )}
          {loading && (
            <Badge variant="outline" className="flex items-center">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Loading...
            </Badge>
          )}
          <button
            className="bg-white dark:bg-gray-900 rounded-full shadow p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={handleFullscreen}
            aria-label="Fullscreen"
            type="button"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg m-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Main Studio Area */}
      <div className="flex flex-1 min-h-0 relative h-full">
        {/* Canvas */}
        <div
          className="flex-1 relative h-full"
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg ml-2">Loading workflow...</span>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChangeCustom}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              proOptions={{ hideAttribution: true }}
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: true,
                style: {
                  stroke: '#666',
                  strokeWidth: 3,
                },
              }}
              fitView
              attributionPosition="bottom-left"
              onInit={setReactFlowInstance}
              onEdgeUpdate={(oldEdge, newConnection) => {
                // Only allow one outgoing edge from the Start node
                if (
                  oldEdge.sourceHandle === 'onExecute' &&
                  edges.filter(e => e.source === oldEdge.source && e.sourceHandle === 'onExecute').length > 1
                ) {
                  window.alert('The Start Workflow node can only have one outgoing connection.');
                  return;
                }
                setEdges((eds) =>
                  eds.map((e) =>
                    e.id === oldEdge.id
                      ? {
                          ...e,
                          target: newConnection.target,
                          targetHandle: newConnection.targetHandle,
                          label: oldEdge.sourceHandle === 'onExecute' ? 'On Trigger' : e.label,
                        }
                      : e
                  )
                );
              }}
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          )}
        </div>
        {/* Task Palette Sidebar */}
        <div className="w-64 p-4 h-full flex flex-col border-l border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white/90 to-gray-50/80 dark:from-gray-900/90 dark:to-gray-800/80 gap-4 z-10 overflow-y-auto">
          <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Add Task</h4>
          {TASK_CATEGORIES.map(category => (
            <div key={category.key} className="mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 pl-1">{category.label}</div>
              <div className="flex flex-col gap-2">
                {category.tasks.map(taskKey => {
                  const def = TASK_TYPE_CONFIGS[taskKey];
                  if (!def) return null;
                  return (
                    <div
                      key={taskKey}
                      draggable
                      onDragStart={onDragStart(taskKey)}
                      onDragEnd={onDragEnd}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 shadow-sm cursor-grab hover:shadow-md transition-all select-none"
                      title={def.description}
                    >
                      {def.icon}
                      <div>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{def.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{def.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Node Properties Panel */}
      {selectedNode && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h3 className="font-semibold mb-2">Node Properties</h3>
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                value={selectedNode.data.label}
                onChange={(e) => {
                  setNodes((nds) =>
                    nds.map((node) =>
                      node.id === selectedNode.id
                        ? { ...node, data: { ...node.data, label: e.target.value } }
                        : node
                    )
                  )
                }}
                className="w-full p-2 border rounded-md"
              />
            </div>
            {selectedNode.type === 'taskNode' && (
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={selectedNode.data.type}
                  onChange={(e) => {
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, type: e.target.value } }
                          : node
                      )
                    )
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="HttpCallout">HTTP Callout</option>
                  <option value="ScriptExecution">Data Process (Bash Script)</option>
                  <option value="StoragePush">Data Load (Push to SFTP)</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Node Modal */}
      <Dialog open={!!editNode} onOpenChange={open => { if (!open) setEditNode(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Node</DialogTitle>
            <DialogDescription>Update the configuration for this node.</DialogDescription>
          </DialogHeader>
          {/* Dynamic config form based on node type */}
          {editNode && (
            <form onSubmit={e => { e.preventDefault(); saveNodeConfig(editNode.id, editLabel, editConfig); setEditNode(null); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  className="w-full p-2 border rounded"
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                />
              </div>
              {/* Example for Delay */}
              {editNode.data.type === 'Delay' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={editConfig?.DurationSeconds || 60}
                    min={1}
                    onChange={e => setEditConfig({ ...editConfig, DurationSeconds: parseInt(e.target.value) })}
                  />
                </div>
              )}
              {/* Add more type-specific fields here */}
              <DialogFooter>
                <button type="submit" className="btn btn-primary">Save</button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 