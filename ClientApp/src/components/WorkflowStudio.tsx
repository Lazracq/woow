import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useReactFlow } from 'reactflow';
import ReactFlow, {
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  MarkerType,
  NodeChange,
  NodePositionChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Maximize2, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { NodeHandlerContext } from './NodeHandlerContext';
import { nodeTypes } from './nodeTypesMap';
import { apiService } from '@/services/api';
import { debounce } from 'lodash';
import { uniqBy } from 'lodash';
import type { DelayTaskConfig, HttpCalloutTaskConfig, StartNodeConfig } from '@/services/api';
import type { Node } from 'reactflow';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import SelectableEdge from './SelectableEdge';

interface NodeData {
  label: string;
  type?: string;
  description?: string;
  isActive?: boolean;
  config?: DelayTaskConfig | HttpCalloutTaskConfig | StartNodeConfig | Record<string, unknown>;
}

interface WorkflowStudioProps {
  workflowId: string;
}

const TASK_TYPE_CONFIGS = {
  HttpCallout: {
    label: 'HTTP Callout',
    type: 'HttpCallout',
    icon: <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" /></svg>,
    config: {
      method: 'GET',
      url: '',
      timeoutSeconds: 30,
      contentType: 'application/json',
      headers: {},
      authentication: { type: 'none' },
      userDescription: ''
    } as HttpCalloutTaskConfig,
    description: 'Call external APIs via HTTP(S)',
    category: 'Integration',
  },
  Delay: {
    label: 'Delay',
    type: 'Delay',
    icon: <svg className="h-5 w-5 text-orange-500" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" /></svg>,
    config: {
      durationMilliseconds: 1000,
      userDescription: ''
    } as DelayTaskConfig,
    description: 'Pause the workflow for a specified duration',
    category: 'Control',
  },
  start: {
    label: 'Start',
    type: 'start',
    icon: <svg className="h-5 w-5 text-green-500" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" /></svg>,
    config: {
      userDescription: ''
    } as StartNodeConfig,
    description: 'Entry point of the workflow',
    category: 'System',
  },
};

const TASK_CATEGORIES = [
  { label: 'Integration', key: 'integration', tasks: ['HttpCallout'] },
  { label: 'Control', key: 'control', tasks: ['Delay'] },
];

// Type guard for authentication object
function isAuthType(obj: unknown): obj is { type: string } {
  return typeof obj === 'object' && obj !== null && 'type' in obj && typeof (obj as { type: unknown }).type === 'string';
}

export function WorkflowStudio({ workflowId }: WorkflowStudioProps) {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editNode, setEditNode] = useState<Node<NodeData> | null>(null);
  const [deleteNode, setDeleteNode] = useState<Node<NodeData> | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editConfig, setEditConfig] = useState<Record<string, unknown>>({});
  const lastSavedPositions = useRef<Record<string, { x: number; y: number }>>({});
  const studioRef = useRef<HTMLDivElement>(null);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const pendingNodeUpdates = useRef<{ id: string, position: { x: number, y: number } }[]>([]);
  const { toast } = useToast();
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  // Drag events
  const dragTaskType = useRef<string | null>(null);
  const onDragStart = (type: string) => (e: React.DragEvent) => {
    dragTaskType.current = type;
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragEnd = () => { dragTaskType.current = null; };

  // Load workflow data from API
  useEffect(() => {
    const loadWorkflow = async () => {
      setLoading(true);
      setError(null);
      try {
        const workflow = await apiService.getWorkflowById(workflowId);
        // Build nodes
        const reactFlowNodes: Node<NodeData>[] = (workflow.tasks || []).map(task => ({
          id: task.id,
          type: task.type === 'start' ? 'startingNode' : 'taskNode',
          position: { x: task.positionX, y: task.positionY },
          data: {
            label: task.name,
            type: task.type || 'http',
            description: task.configuration ? (JSON.parse(task.configuration).description || `Task ${task.name}`) : `Task ${task.name}`,
            isActive: task.isActive,
            config: task.configuration ? JSON.parse(task.configuration) : {},
          },
        }));
        // Build edges from connections
        const formatLabel = (label: string) => {
          if (!label) return '';
          if (label === 'onFailure') return 'On Failure';
          if (label === 'onSuccess') return 'On Success';
          if (label === 'onExecute') return 'On Execute';
          // Capitalize first letter and add space before capital letters
          return label.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, s => s.toUpperCase());
        };
        const reactFlowEdges: Edge[] = (workflow.connections || []).map(conn => {
          const rawLabel = conn.label || conn.associationType;
          const formattedLabel = formatLabel(rawLabel);
          return {
            id: conn.id,
            source: conn.fromTaskId,
            target: conn.toTaskId,
            sourceHandle: conn.associationType,
            type: 'smoothstep',
            label: formattedLabel,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: formattedLabel === 'On Failure' ? '#ef4444' : '#10b981',
            },
            style: { stroke: formattedLabel === 'On Failure' ? '#ef4444' : '#10b981', strokeWidth: 2 },
          };
        });
        setNodes(reactFlowNodes);
        setEdges(reactFlowEdges);
      } catch (err) {
        setError('Failed to load workflow. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (workflowId) loadWorkflow();
  }, [workflowId]);

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
        connections: [],
      });
      const workflowNodes = await apiService.getWorkflowNodes(workflowId);
      if (workflowNodes && workflowNodes.length > 0) {
        const reactFlowNodes: Node<NodeData>[] = workflowNodes.map(node => ({
          id: node.id,
          type: node.isStartingNode ? 'startingNode' : 'taskNode',
          position: { x: node.positionX, y: node.positionY },
          data: {
            label: node.name,
            type: node.type || 'http',
            description: node.configuration ? JSON.parse(node.configuration).description || `Task ${node.name}` : `Task ${node.name}`,
            isActive: node.isActive,
            config: node.configuration ? JSON.parse(node.configuration) : {},
          },
        }));
        setNodes(reactFlowNodes);
        setEdges([]);
      }
    } catch {
      setError('Failed to create starting node. Please try again.');
    }
  }, [workflowId, setNodes]);

  // Debounced save function
  const saveNodePositions = useCallback(
    debounce(async (nodePositions: Record<string, { x: number; y: number }>) => {
      try {
        setSaving(true);
        const validNodePositions = Object.entries(nodePositions).filter(([nodeId]) => {
          const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return guidRegex.test(nodeId);
        });
        if (validNodePositions.length === 0) return;
        const hasChanges = validNodePositions.some(([nodeId, position]) => {
          const lastSaved = lastSavedPositions.current[nodeId];
          return !lastSaved || lastSaved.x !== position.x || lastSaved.y !== position.y;
        });
        if (hasChanges) {
          const savePromises = validNodePositions.map(([nodeId, position]) =>
            apiService.updateWorkflowNode(workflowId, nodeId, { position })
          );
          await Promise.all(savePromises);
          const newLastSaved = { ...lastSavedPositions.current };
          validNodePositions.forEach(([nodeId, position]) => {
            newLastSaved[nodeId] = position;
          });
          lastSavedPositions.current = newLastSaved;
        }
      } catch {
        setError('Failed to save node positions. Please try again.');
      } finally {
        setSaving(false);
      }
    }, 1000),
    [workflowId]
  );

  // Debounced save effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (nodes.length > 0) {
        const validNodes = nodes.filter(node => {
          const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return guidRegex.test(node.id);
        });
        if (validNodes.length === 0) return;
        const currentPositions = validNodes.reduce((acc, node) => {
          acc[node.id] = { x: node.position.x, y: node.position.y };
          return acc;
        }, {} as Record<string, { x: number; y: number }>);
        const hasChanges = validNodes.some(node => {
          const lastSaved = lastSavedPositions.current[node.id];
          return !lastSaved || lastSaved.x !== node.position.x || lastSaved.y !== node.position.y;
        });
        if (hasChanges) {
          saveNodePositions(currentPositions);
        }
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [nodes, saveNodePositions]);

  // Custom node change handler
  const onNodesChangeCustom = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    // Only process NodePositionChange with defined position
    const movedNodes = changes
      .filter((change): change is NodePositionChange => change.type === 'position' && 'id' in change && 'position' in change && !!change.position)
      .filter(change => change.position !== undefined)
      .map(change => ({ id: change.id, position: change.position as { x: number; y: number } }));
    if (movedNodes.length > 0) {
      pendingNodeUpdates.current.push(...movedNodes);
      debouncedSyncNodePositions();
    }
  }, [onNodesChange]);

  const debouncedSyncNodePositions = useCallback(debounce(() => {
    // Remove duplicates by id (keep last move)
    const updates = uniqBy([...pendingNodeUpdates.current], 'id');
    pendingNodeUpdates.current = [];
    if (updates.length === 1) {
      apiService.updateWorkflowNode(workflowId, updates[0].id, { position: updates[0].position });
    } else if (updates.length > 1) {
      // Use the new batch API endpoint
      const batchPayload = updates.map(update => ({
        nodeId: update.id,
        positionX: update.position.x,
        positionY: update.position.y
      }));
      fetch(`/api/workflows/${workflowId}/nodes/positions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchPayload)
      });
    }
  }, 500), [workflowId]);

  const onConnect = useCallback(
    async (params: Connection) => {
      if (!params.source || !params.target) return;
      const sourceNode = nodes.find(n => n.id === params.source);
      const isConditional = sourceNode?.data?.type === 'Conditional';
      const isStartNode = sourceNode?.type === 'startingNode' || sourceNode?.data?.type === 'start';
      if (!isConditional) {
        const alreadyExists = edges.some(
          (e) => e.source === params.source && e.sourceHandle === params.sourceHandle
        );
        if (alreadyExists) {
          window.alert('Only one outgoing connection per handle is allowed.');
          return;
        }
      }
      let label = '';
      let associationType = params.sourceHandle || '';
      if (isStartNode) {
        label = 'On Execute';
        associationType = 'onExecute';
      } else if (params.sourceHandle === 'onSuccess') {
        label = 'On Success';
      } else if (params.sourceHandle === 'onFailure') {
        label = 'On Failure';
      } else if (isConditional) {
        label = params.sourceHandle || 'Case';
      }
      const labelStyle = {
        fill: isStartNode
          ? '#10b981'
          : params.sourceHandle === 'onFailure'
          ? '#ef4444'
          : '#10b981',
        fontWeight: 600,
        fontSize: 14,
        letterSpacing: 0.5,
      };
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
        label,
        labelStyle,
        labelBgStyle: {
          fill: '#fff',
          fillOpacity: 1,
          stroke: '#222',
          strokeWidth: 0.5,
        },
        style: {
          stroke: params.sourceHandle === 'onFailure' ? '#ef4444' : '#10b981',
          strokeWidth: 2,
        },
      };
      // Persist the connection to the backend
      try {
        await apiService.addConnection(workflowId, {
          fromTaskId: params.source,
          toTaskId: params.target,
          associationType,
          label,
        });
        setEdges((eds) => addEdge(newEdge, eds));
      } catch {
        setError('Failed to save connection. Please try again.');
      }
    },
    [setEdges, edges, nodes, workflowId]
  );

  const addTaskNode = useCallback(async () => {
    try {
      const newNode = await apiService.createWorkflowNode(workflowId, {
        name: 'New Task',
        type: 'http',
        configuration: '{}',
        positionX: 650,
        positionY: 200 + Math.random() * 200,
        isActive: true,
        connections: [],
      });
      const reactFlowNode: Node<NodeData> = {
        id: newNode.id,
        type: 'taskNode',
        position: { x: newNode.positionX, y: newNode.positionY },
        data: {
          label: newNode.name,
          type: newNode.type,
          description: newNode.configuration ? JSON.parse(newNode.configuration).description || `Task ${newNode.name}` : `Task ${newNode.name}`,
          isActive: newNode.isActive,
          config: newNode.configuration ? JSON.parse(newNode.configuration) : {},
        },
      };
      setNodes((nds) => [...nds, reactFlowNode]);
    } catch {
      setError('Failed to create new task. Please try again.');
    }
  }, [workflowId, setNodes]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement && studioRef.current) {
      studioRef.current.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  // Edit modal logic
  const openEditModal = (node: Node<NodeData>) => {
    setEditNode(node);
    const config = (node.data.config ?? {}) as Record<string, unknown>;
    setEditDescription(typeof config.userDescription === 'string' ? config.userDescription : '');
    setEditConfig(config);
  };

  // React Flow drop handler
  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const flowPosition = reactFlowInstance.project({ x, y });
      const type = dragTaskType.current;
      if (!type) return;
      const def = TASK_TYPE_CONFIGS[type as keyof typeof TASK_TYPE_CONFIGS];
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
            description: newNode.configuration ? JSON.parse(newNode.configuration).description || `Task ${newNode.name}` : `Task ${newNode.name}`,
            isActive: newNode.isActive,
            config: newNode.configuration ? JSON.parse(newNode.configuration) : {},
          },
        };
        setNodes((nds) => [...nds, reactFlowNode]);
      } catch {
        setError('Failed to create new task. Please try again.');
      }
    },
    [workflowId, setNodes, reactFlowInstance]
  );

  // Fullscreen background fix
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
    const observer = new MutationObserver(updateStudioBg);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('fullscreenchange', updateStudioBg);
    updateStudioBg();
    return () => {
      observer.disconnect();
      document.removeEventListener('fullscreenchange', updateStudioBg);
    };
  }, []);

  // Callbacks to pass to node components
  const handleEditNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditNode(node);
      const config = (node.data.config ?? {}) as Record<string, unknown>;
      setEditDescription(typeof config.userDescription === 'string' ? config.userDescription : '');
      setEditConfig(config);
    }
  }, [nodes]);
  const handleDeleteNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) setDeleteNode(node);
  }, [nodes]);

  // Edge removal handler
  const onEdgesDelete = useCallback(async (edgesToDelete: Edge[]) => {
    for (const edge of edgesToDelete) {
      try {
        await apiService.removeConnection(workflowId, edge.id);
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        toast({
          title: 'Connection removed',
          description: 'The connection was successfully removed.',
          variant: 'success',
        });
      } catch (error: any) {
        toast({
          title: 'Failed to remove connection',
          description: error?.message || 'An error occurred while removing the connection.',
          variant: 'destructive',
        });
      }
    }
  }, [workflowId, setEdges, toast]);

  // Edge removal handler (for close icon)
  const handleRemoveEdge = useCallback(async (edgeId: string) => {
    try {
      await apiService.removeConnection(workflowId, edgeId);
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      setSelectedEdge(null);
      toast({
        title: 'Connection removed',
        description: 'The connection was successfully removed.',
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to remove connection',
        description: error?.message || 'An error occurred while removing the connection.',
        variant: 'destructive',
      });
    }
  }, [workflowId, setEdges, toast]);

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 z-20">
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={addTaskNode} disabled={loading} className="hidden">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
          {editNode && editNode.id !== 'start' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setNodes((nds) => nds.filter((n) => n.id !== editNode.id))}
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
        <div
          className="flex-1 relative h-full"
          ref={studioRef}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg ml-2">Loading workflow...</span>
            </div>
          ) : (
            <NodeHandlerContext.Provider value={{ onEdit: handleEditNode, onDelete: handleDeleteNode }}>
              <ReactFlow
                nodes={nodes}
                edges={edges.map(edge => ({
                  ...edge,
                  type: 'selectable',
                  selected: edge.id === selectedEdge,
                  data: { ...edge.data, label: edge.label, onRemove: handleRemoveEdge },
                }))}
                onNodesChange={onNodesChangeCustom}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgesDelete={onEdgesDelete}
                onNodeClick={(_, node) => handleEditNode(node.id)}
                onEdgeClick={(_, edge) => setSelectedEdge(edge.id)}
                onPaneClick={() => setSelectedEdge(null)}
                nodeTypes={nodeTypes}
                edgeTypes={{ selectable: SelectableEdge }}
                proOptions={{ hideAttribution: true }}
                fitView
                attributionPosition="bottom-left"
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </NodeHandlerContext.Provider>
          )}
        </div>
        {/* Collapsible Palette Sidebar */}
        <div className={`transition-all duration-300 ${paletteOpen ? 'w-64' : 'w-10'} p-2 h-full flex flex-col border-l border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white/90 to-gray-50/80 dark:from-gray-900/90 dark:to-gray-800/80 gap-4 z-10 overflow-y-auto`}>
          <button
            className="mb-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setPaletteOpen(!paletteOpen)}
            title={paletteOpen ? 'Collapse' : 'Expand'}
          >
            {paletteOpen ? '>' : '<'}
          </button>
          {paletteOpen && TASK_CATEGORIES.map(category => (
            <div key={category.key} className="mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 pl-1">{category.label}</div>
              <div className="flex flex-col gap-2">
                {category.tasks.map(taskKey => {
                  const def = TASK_TYPE_CONFIGS[taskKey as keyof typeof TASK_TYPE_CONFIGS];
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Node Modal */}
      <Dialog open={!!editNode && !deleteNode} onOpenChange={open => { if (!open) setEditNode(null); }}>
        <DialogContent className="p-0 bg-transparent border-none shadow-none">
          <Card className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-fade-in-up">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 flex flex-col items-start gap-2 relative border-0">
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-300 p-2">
                  <Info className="h-6 w-6 text-blue-500" />
                </div>
                <DialogTitle asChild>
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    {editNode?.data?.type === 'start' || editNode?.id === 'start' ? 'Edit Starting Node' : editNode ? `Edit ${editNode?.data?.type || 'Node'}` : 'Edit Node'}
                  </span>
                </DialogTitle>
              </div>
              <DialogDescription asChild>
                <span className="dark:text-gray-300 mt-1 ml-1">
                  Update the configuration for this node.
                </span>
              </DialogDescription>
              <div className="w-full h-px bg-gradient-to-r from-blue-400/60 via-blue-300/30 to-transparent mt-2" />
            </CardHeader>
            <CardContent className="py-4">
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  const updatedConfig = { ...editConfig, userDescription: editDescription };
                  setSaving(true);
                  try {
                    await apiService.updateWorkflowNode(workflowId, editNode?.id ?? '', {
                      configuration: JSON.stringify(updatedConfig),
                      name: editNode?.data?.label ?? '',
                      type: editNode?.data?.type ?? '',
                      isActive: editNode?.data?.isActive ?? true,
                      position: editNode?.position ?? { x: 0, y: 0 },
                    });
                    setNodes(nds =>
                      nds.map(n =>
                        n.id === editNode?.id
                          ? {
                              ...n,
                              data: {
                                ...n.data,
                                description: editDescription,
                                config: updatedConfig,
                              },
                            }
                          : n
                      )
                    );
                    setEditNode(null);
                  } catch {
                    setError('Failed to update node.');
                  } finally {
                    setSaving(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="block text-sm font-medium">User Description</Label>
                    <span
                      tabIndex={-1}
                      className="relative inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-500 w-5 h-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 group"
                    >
                      <Info className="h-4 w-4" />
                      <span className="absolute left-1/2 top-full z-20 mt-2 w-max min-w-[220px] -translate-x-1/2 rounded bg-white px-3 py-2 text-xs text-blue-700 shadow-lg border border-blue-100 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-visible:opacity-100 group-focus-visible:pointer-events-auto transition-opacity duration-200">
                        User description of what the task is actually doing
                      </span>
                    </span>
                  </div>
                  <Textarea
                    className="w-full p-3 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg font-mono text-sm mb-2 transition-all"
                    rows={2}
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    placeholder="Describe this task's purpose or details"
                  />
                </div>
                {/* Per-type config fields */}
                {editNode?.data?.type === 'HttpCallout' && (
                  <>
                    <div>
                      <Label className="block text-sm font-medium mb-1">Method</Label>
                      <select
                        className="w-full p-2 border rounded text-sm mb-2"
                        value={String(editConfig.method || 'GET')}
                        onChange={e => setEditConfig({ ...editConfig, method: e.target.value })}
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1">URL</Label>
                      <Input
                        className="w-full mb-2"
                        value={String(editConfig.url || '')}
                        onChange={e => setEditConfig({ ...editConfig, url: e.target.value })}
                        placeholder="https://api.example.com"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1">Timeout (seconds)</Label>
                      <Input
                        type="number"
                        className="w-full mb-2"
                        value={editConfig.timeoutSeconds !== undefined ? Number(editConfig.timeoutSeconds) : 30}
                        onChange={e => setEditConfig({ ...editConfig, timeoutSeconds: Number(e.target.value) })}
                        min={1}
                        max={300}
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1">Content Type</Label>
                      <Input
                        className="w-full mb-2"
                        value={String(editConfig.contentType || 'application/json')}
                        onChange={e => setEditConfig({ ...editConfig, contentType: e.target.value })}
                        placeholder="application/json"
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1">Headers (JSON)</Label>
                      <Textarea
                        className="w-full font-mono text-xs mb-2"
                        rows={2}
                        value={JSON.stringify(editConfig.headers || {}, null, 2)}
                        onChange={e => {
                          try {
                            setEditConfig({ ...editConfig, headers: JSON.parse(e.target.value) });
                          } catch { /* ignore JSON parse errors */ }
                        }}
                        placeholder={`{
  "Authorization": "Bearer ..."
}`}
                      />
                    </div>
                    <div>
                      <Label className="block text-sm font-medium mb-1">Authentication</Label>
                      <Input
                        className="w-full mb-2"
                        value={isAuthType(editConfig.authentication) ? editConfig.authentication.type : 'none'}
                        onChange={e => setEditConfig({ ...editConfig, authentication: { type: e.target.value } })}
                        placeholder="none | basic | bearer"
                      />
                    </div>
                  </>
                )}
                {editNode?.data?.type === 'Delay' && (
                  <div>
                    <Label className="block text-sm font-medium mb-1">Duration (ms)</Label>
                    <Input
                      type="number"
                      className="w-full mb-2"
                      value={editConfig.durationMilliseconds !== undefined ? Number(editConfig.durationMilliseconds) : 1000}
                      onChange={e => setEditConfig({ ...editConfig, durationMilliseconds: Number(e.target.value) })}
                      min={1}
                      max={3600000}
                    />
                  </div>
                )}
                <div className="flex justify-end mt-6">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto transition-transform duration-150 ease-in-out shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-blue-300 focus:outline-none border-0 text-white font-semibold"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> Saving...</span>
                    ) : 'Save'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
      {/* Delete Node Modal */}
      <Dialog open={!!deleteNode} onOpenChange={open => { if (!open) setDeleteNode(null); }}>
        <DialogContent className="p-0 bg-transparent border-none shadow-none">
          <Card className="w-full max-w-md mx-auto rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-fade-in-up">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 flex flex-col items-start gap-2 relative border-0">
              <DialogTitle asChild>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  Delete Node
                </span>
              </DialogTitle>
              <DialogDescription asChild>
                <span className="dark:text-gray-300 mt-1 ml-1">
                  Are you sure you want to delete this node? This action cannot be undone.
                </span>
              </DialogDescription>
              <div className="w-full h-px bg-gradient-to-r from-red-400/60 via-orange-300/30 to-transparent mt-1" />
            </CardHeader>
            <CardContent className="py-4">
              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => setDeleteNode(null)}>
                  Cancel
                </Button>
                <Button type="button" className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold shadow-lg" onClick={async () => {
                  if (deleteNode) {
                    try {
                      await apiService.deleteWorkflowNode(workflowId, deleteNode.id);
                      setNodes(nds => nds.filter(n => n.id !== deleteNode.id));
                      setDeleteNode(null);
                    } catch {
                      setError('Failed to delete node.');
                    }
                  }
                }}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
} 