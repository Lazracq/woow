import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Server, 
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your workflow system settings and connections.
        </p>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>System Status</span>
          </CardTitle>
          <CardDescription>
            Current status of all system components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium">API Service</p>
                  <p className="text-sm text-muted-foreground">Running on port 5000</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-500">Healthy</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium">Worker Service</p>
                  <p className="text-sm text-muted-foreground">3 workers active</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-500">Healthy</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-muted-foreground">PostgreSQL connected</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-500">Connected</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium">Redis Queue</p>
                  <p className="text-sm text-muted-foreground">5 jobs in queue</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-500">Operational</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Database Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure database connections for primary and read-replica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary-db">Primary Database</Label>
              <Input
                id="primary-db"
                placeholder="Host=primary-db;Database=workflows;Username=app;Password=secret"
                defaultValue="Host=primary-db;Database=workflows;Username=app;Password=secret"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replica-db">Read-Replica Database</Label>
              <Input
                id="replica-db"
                placeholder="Host=replica-db;Database=workflows;Username=app;Password=secret"
                defaultValue="Host=replica-db;Database=workflows;Username=app;Password=secret"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Redis Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Redis Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure Redis connection for queuing and caching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="redis-url">Redis Connection String</Label>
            <Input
              id="redis-url"
              placeholder="localhost:6379"
              defaultValue="localhost:6379"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Worker Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>Worker Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure worker service settings and scaling parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="max-workers">Max Workers</Label>
              <Input
                id="max-workers"
                type="number"
                defaultValue="10"
                min="1"
                max="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="queue-timeout">Queue Timeout (seconds)</Label>
              <Input
                id="queue-timeout"
                type="number"
                defaultValue="300"
                min="60"
                max="3600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retry-attempts">Retry Attempts</Label>
              <Input
                id="retry-attempts"
                type="number"
                defaultValue="3"
                min="0"
                max="10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Restart Workers
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>System Alerts</span>
          </CardTitle>
          <CardDescription>
            Configure alert thresholds and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="queue-alert">Queue Length Alert</Label>
              <Input
                id="queue-alert"
                type="number"
                defaultValue="100"
                placeholder="Alert when queue length exceeds"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="error-rate-alert">Error Rate Alert (%)</Label>
              <Input
                id="error-rate-alert"
                type="number"
                defaultValue="5"
                min="0"
                max="100"
                placeholder="Alert when error rate exceeds"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 