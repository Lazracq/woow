import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Server, 
  Variable,
  Save,
  Plus,
  X
} from 'lucide-react'
import { useState } from 'react'

interface GlobalVariable {
  id: string
  name: string
  value: string
  type: 'Global' | 'System'
}

export function Settings() {
  const [variables, setVariables] = useState<GlobalVariable[]>([])
  const [newVariable, setNewVariable] = useState({
    name: '',
    value: '',
    type: 'Global' as 'Global' | 'System'
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAddVariable = () => {
    if (!newVariable.name.trim() || !newVariable.value.trim()) {
      setError('Variable name and value are required')
      return
    }

    if (variables.some(v => v.name === newVariable.name)) {
      setError('Variable name already exists')
      return
    }

    const variable: GlobalVariable = {
      id: Date.now().toString(),
      name: newVariable.name.trim(),
      value: newVariable.value.trim(),
      type: newVariable.type
    }

    setVariables(prev => [...prev, variable])
    setNewVariable({ name: '', value: '', type: 'Global' })
    setError(null)
    setSuccess('Variable added successfully!')
  }

  const handleRemoveVariable = (id: string) => {
    setVariables(prev => prev.filter(v => v.id !== id))
    setSuccess('Variable removed successfully!')
  }

  const handleSaveVariables = () => {
    // In a real app, you would call the API here to save global variables
    setSuccess('Global variables saved successfully!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your workflow system settings and global variables.
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
                  <p className="text-sm text-muted-foreground">Running on port 5776</p>
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

      {/* Global Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Variable className="h-5 w-5" />
            <span>Global Variables</span>
          </CardTitle>
          <CardDescription>
            Manage global and system variables that are available across all workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Add New Variable */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Variable Name</Label>
                <Input
                  value={newVariable.name}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., API_BASE_URL"
                />
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  value={newVariable.value}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="e.g., https://api.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  value={newVariable.type}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, type: e.target.value as 'Global' | 'System' }))}
                  className="w-full p-2 rounded-md border border-input bg-background"
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
            <h4 className="font-medium">Current Variables</h4>
            {variables.length === 0 ? (
              <p className="text-sm text-muted-foreground">No global variables defined yet.</p>
            ) : (
              <div className="space-y-2">
                {variables.map((variable) => (
                  <div
                    key={variable.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{variable.name}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            variable.type === 'System' 
                              ? 'border-blue-200 text-blue-600'
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          {variable.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{variable.value}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVariable(variable.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          {variables.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button onClick={handleSaveVariables}>
                <Save className="mr-2 h-4 w-4" />
                Save Global Variables
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 