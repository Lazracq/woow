import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  PlayCircle, 
  Search, 
  MoreVertical,
  Eye,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
  BarChart3
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { apiService, Execution } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

export function Executions() {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

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

  const fetchExecutions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiService.getExecutions(
        currentPage, 
        10, 
        statusFilter || undefined
      )
      setExecutions(response.executions)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
    } catch (error) {
      console.error('Failed to fetch executions:', error)
      toast({
        title: "Error",
        description: "Failed to load executions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter, toast])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchExecutions()
    setRefreshing(false)
    toast({
      title: "Success",
      description: "Executions data refreshed successfully.",
    })
  }, [fetchExecutions, toast])

  const handleSearch = useCallback(() => {
    // Reset to first page when searching
    setCurrentPage(1)
    fetchExecutions()
  }, [fetchExecutions])

  const handleStatusFilter = useCallback((status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }, [])

  const handleCancelExecution = useCallback(async (id: string) => {
    try {
      await apiService.cancelExecution(id)
      toast({
        title: "Success",
        description: "Execution cancelled successfully.",
      })
      fetchExecutions() // Refresh the list
    } catch (error) {
      console.error('Failed to cancel execution:', error)
      toast({
        title: "Error",
        description: "Failed to cancel execution. Please try again.",
        variant: "destructive",
      })
    }
  }, [fetchExecutions, toast])

  const handleRetryExecution = useCallback(async (id: string) => {
    try {
      await apiService.retryExecution(id)
      toast({
        title: "Success",
        description: "Execution retry initiated successfully.",
      })
      fetchExecutions() // Refresh the list
    } catch (error) {
      console.error('Failed to retry execution:', error)
      toast({
        title: "Error",
        description: "Failed to retry execution. Please try again.",
        variant: "destructive",
      })
    }
  }, [fetchExecutions, toast])

  useEffect(() => {
    fetchExecutions()
  }, [fetchExecutions])

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

  const formatDuration = (duration: string) => {
    // Convert backend duration format to display format
    return duration
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading executions...</span>
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
      {/* Search and Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search executions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-woow-blue/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-woow-blue/20"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-woow-blue/20 hover:bg-woow-blue/5"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-woow-blue/20 hover:bg-woow-blue/5"
            asChild
          >
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="h-9 px-3 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-0"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="running">Running</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </Button>
          <Button variant="outline" size="sm" className="border-woow-blue/20 dark:border-woow-blue-400/20">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="border-woow-blue/20 dark:border-woow-blue-400/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </motion.div>

      {/* Executions List */}
      <motion.div 
        className="grid gap-3"
        variants={containerVariants}
      >
        {executions.length === 0 ? (
          <Card className="border-woow-blue/20">
            <CardContent className="p-8 text-center">
              <PlayCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">No executions found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter 
                  ? "Try adjusting your search or filter criteria."
                  : "No executions have been created yet."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          executions.map((execution, index) => (
            <motion.div key={execution.id} variants={itemVariants}>
              <Card className="border-woow-blue/20 hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-base font-semibold">{execution.workflow}</h3>
                        {getStatusBadge(execution.status)}
                        {execution.result && getResultIcon(execution.result)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Started</p>
                          <p className="text-sm font-medium">{formatDateTime(execution.startedAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-sm font-medium">{formatDuration(execution.duration)}</p>
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

                      <div className="mb-3">
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

                    <div className="flex items-center space-x-1 ml-3">
                      <Button size="sm" variant="ghost" className="hover:bg-woow-blue/10 h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="hover:bg-woow-blue/10 h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                      {execution.status === 'running' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="hover:bg-woow-pink/10 text-woow-pink h-8 w-8 p-0"
                          onClick={() => handleCancelExecution(execution.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {execution.status === 'failed' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="hover:bg-woow-lime/10 text-woow-lime h-8 w-8 p-0"
                          onClick={() => handleRetryExecution(execution.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="hover:bg-woow-blue/10 h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({totalCount} total)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
} 