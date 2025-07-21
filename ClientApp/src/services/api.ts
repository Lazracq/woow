export interface Workflow {
  id: string
  name: string
  description?: string
  isActive: boolean
  status: string
  createdAt: string
  updatedAt: string
  taskCount: number
  executionCount: number
  avgDuration: number
  successRate: number
  lastRun: string
  nextRun: string
  tags: string[]
  priority: string
  complexity: string
}

export interface WorkflowNode {
  id: string
  name: string
  type: string
  configuration: string
  positionX: number
  positionY: number
  isActive: boolean
  isStartingNode: boolean
  connections: string[]
}

export interface CreateWorkflowNodeRequest {
  name: string
  type: string
  configuration: string
  positionX: number
  positionY: number
  isActive?: boolean
  connections?: string[]
}

export interface UpdateWorkflowNodeRequest {
  position?: { x: number; y: number }
  name?: string
  type?: string
  configuration?: string
  isActive?: boolean
  connections?: string[]
}

export interface AddConnectionRequest {
  targetNodeId: string
}

export interface WorkflowStats {
  totalWorkflows: number
  activeWorkflows: number
  avgDuration: string
  successRate: string
}

export interface DashboardStats {
  totalWorkflows: number
  runningExecutions: number
  successRate: number
  avgExecutionTime: number
  systemHealth: {
    apiService: { status: string; uptime: string; port: string }
    workerService: { status: string; uptime: string; workers: string }
    database: { status: string; uptime: string; connections: string }
  }
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
  read: boolean
}

export interface Execution {
  id: string
  workflow: string
  status: 'completed' | 'running' | 'failed' | 'pending'
  startedAt: string
  completedAt: string | null
  duration: string
  progress: number
  result: 'success' | 'error' | 'warning' | null
  logs: string
  tags: string[]
}

export interface ExecutionStats {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  runningExecutions: number
  avgDuration: string
  successRate: number
}

export interface ExecutionDetails extends Execution {
  steps: ExecutionStep[]
}

export interface ExecutionStep {
  id: string
  name: string
  status: string
  duration: string
}

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = 'http://localhost:5776/api'
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    console.log('Fetching dashboard stats...')
    return this.request<DashboardStats>('/dashboard/stats')
  }

  async getDashboardNotifications(): Promise<Notification[]> {
    console.log('Fetching dashboard notifications...')
    return this.request<Notification[]>('/dashboard/notifications')
  }

  async refreshDashboard(): Promise<{ message: string }> {
    console.log('Refreshing dashboard...')
    return this.request<{ message: string }>('/dashboard/refresh', {
      method: 'POST',
    })
  }

  // Workflow endpoints
  async getWorkflows(): Promise<Workflow[]> {
    console.log('Fetching workflows...')
    const response = await this.request<{workflows: Workflow[], totalCount: number, page: number, pageSize: number, totalPages: number}>('/workflows')
    return response.workflows
  }

  async getWorkflowById(id: string): Promise<Workflow> {
    console.log('Fetching workflow by ID...')
    return this.request<Workflow>(`/workflows/workflow/${id}`)
  }

  async createWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
    console.log('Creating workflow...')
    return this.request<Workflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    })
  }

  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    console.log('Updating workflow...')
    return this.request<Workflow>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workflow),
    })
  }

  async deleteWorkflow(id: string): Promise<void> {
    console.log('Deleting workflow...')
    return this.request<void>(`/workflows/${id}`, {
      method: 'DELETE',
    })
  }

  // Workflow nodes endpoints
  async getWorkflowNodes(workflowId: string): Promise<WorkflowNode[]> {
    console.log('Fetching workflow nodes...')
    return this.request<WorkflowNode[]>(`/workflows/${workflowId}/nodes`)
  }

  async createWorkflowNode(workflowId: string, node: CreateWorkflowNodeRequest): Promise<WorkflowNode> {
    console.log('Creating workflow node...')
    return this.request<WorkflowNode>(`/workflows/${workflowId}/nodes`, {
      method: 'POST',
      body: JSON.stringify(node),
    })
  }

  async updateWorkflowNode(workflowId: string, nodeId: string, node: UpdateWorkflowNodeRequest): Promise<WorkflowNode> {
    console.log('Updating workflow node...')
    return this.request<WorkflowNode>(`/workflows/${workflowId}/nodes/${nodeId}`, {
      method: 'PUT',
      body: JSON.stringify(node),
    })
  }

  async deleteWorkflowNode(workflowId: string, nodeId: string): Promise<void> {
    console.log('Deleting workflow node...')
    return this.request<void>(`/workflows/${workflowId}/nodes/${nodeId}`, {
      method: 'DELETE',
    })
  }

  async addConnection(workflowId: string, nodeId: string, connection: AddConnectionRequest): Promise<{ message: string }> {
    console.log('Adding connection...')
    return this.request<{ message: string }>(`/workflows/${workflowId}/nodes/${nodeId}/connections`, {
      method: 'POST',
      body: JSON.stringify(connection),
    })
  }

  async removeConnection(workflowId: string, nodeId: string, targetNodeId: string): Promise<void> {
    console.log('Removing connection...')
    return this.request<void>(`/workflows/${workflowId}/nodes/${nodeId}/connections/${targetNodeId}`, {
      method: 'DELETE',
    })
  }

  async setStartingNode(workflowId: string, nodeId: string): Promise<{ message: string }> {
    console.log('Setting starting node...')
    return this.request<{ message: string }>(`/workflows/${workflowId}/nodes/${nodeId}/starting`, {
      method: 'PUT',
    })
  }

  // Stats endpoints
  async getWorkflowStats(): Promise<WorkflowStats> {
    console.log('Fetching workflow stats...')
    return this.request<WorkflowStats>('/workflowstats')
  }

  // Performance endpoints
  async getPerformanceMetrics(): Promise<Record<string, unknown>> {
    console.log('Fetching performance metrics...')
    return this.request<Record<string, unknown>>('/performance/metrics')
  }

  async getRecentExecutions(count: number = 100): Promise<Record<string, unknown>[]> {
    console.log('Fetching recent executions...')
    return this.request<Record<string, unknown>[]>(`/performance/executions/recent?count=${count}`)
  }

  // Execution endpoints
  async getExecutions(page: number = 1, pageSize: number = 10, status?: string, workflowId?: string): Promise<{executions: Execution[], totalCount: number, page: number, pageSize: number, totalPages: number}> {
    console.log('Fetching executions...')
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (pageSize) params.append('pageSize', pageSize.toString())
    if (status) params.append('status', status)
    if (workflowId) params.append('workflowId', workflowId)
    
    return this.request<{executions: Execution[], totalCount: number, page: number, pageSize: number, totalPages: number}>(`/executions?${params.toString()}`)
  }

  async getExecutionStats(): Promise<ExecutionStats> {
    console.log('Fetching execution stats...')
    return this.request<ExecutionStats>('/executions/stats')
  }

  async getExecutionById(id: string): Promise<ExecutionDetails> {
    console.log('Fetching execution by ID...')
    return this.request<ExecutionDetails>(`/executions/${id}`)
  }

  async cancelExecution(id: string): Promise<{ message: string }> {
    console.log('Cancelling execution...')
    return this.request<{ message: string }>(`/executions/${id}/cancel`, {
      method: 'POST',
    })
  }

  async retryExecution(id: string): Promise<{ message: string }> {
    console.log('Retrying execution...')
    return this.request<{ message: string }>(`/executions/${id}/retry`, {
      method: 'POST',
    })
  }

  // Alias for backward compatibility
  getNotifications = this.getDashboardNotifications
}

export const apiService = new ApiService(); 