import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Trash2, Play, Plug, PlugZap } from 'lucide-react';
import { Handle, Position } from 'reactflow';
import { NODE_TYPE_STYLES, getNodeDescription } from './WorkflowNodeUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface NodeData {
  label: string;
  type?: string;
  description?: string;
  isActive?: boolean;
  config?: Record<string, unknown>;
}

export const TaskNode = ({ data, id }: { data: NodeData; id: string }) => {
  const style = NODE_TYPE_STYLES[data.type || 'HttpCallout'] || NODE_TYPE_STYLES['HttpCallout'];
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  // Prevent edit modal from opening after delete modal closes
  const ignoreNextEdit = React.useRef(false);

  return (
    <Card className={`w-64 border-2 ${style.border} ${style.bg} group relative`}>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={e => {
            e.stopPropagation();
            if (!ignoreNextEdit.current) {
              window.dispatchEvent(new CustomEvent('editNode', { detail: { id, data } }));
            }
            ignoreNextEdit.current = false;
          }}
          title="Edit Description"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
          onClick={e => {
            e.stopPropagation();
            setShowDeleteModal(true);
          }}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <button
            className="focus:outline-none"
            onClick={e => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('editNode', { detail: { id, data } }));
            }}
            title="Edit Node Description"
            type="button"
          >
            {style.icon}
          </button>
          <span>{data.label}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold truncate" title={data.config?.userDescription as string || getNodeDescription(data.type || '', data.config || {})}>
          {(data.config?.userDescription as string) || getNodeDescription(data.type || '', data.config || {})}
        </p>
        <div style={{ position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)', zIndex: 3, pointerEvents: 'none' }}>
          <PlugZap className="text-blue-500 dark:text-blue-300" style={{ width: 28, height: 28 }} />
        </div>
        <Handle
          type="target"
          position={Position.Left}
          id="target"
          style={{
            background: '#3b82f6',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 24,
            height: 24,
            border: '3px solid #3b82f6',
            borderRadius: '50%',
            zIndex: 2,
            left: -12,
          }}
        />
        <div style={{ position: 'absolute', right: -20, top: '30%', zIndex: 3, pointerEvents: 'none' }}>
          <Plug className="text-green-500 dark:text-green-400" style={{ width: 28, height: 28 }} />
        </div>
        <Handle
          type="source"
          position={Position.Right}
          id="onSuccess"
          style={{
            background: '#10b981',
            top: '30%',
            width: 24,
            height: 24,
            border: '3px solid #10b981',
            borderRadius: '50%',
            zIndex: 2,
            right: -12,
          }}
        />
        <div style={{ position: 'absolute', right: -20, top: '70%', zIndex: 3, pointerEvents: 'none' }}>
          <Plug className="text-red-500 dark:text-red-400" style={{ width: 28, height: 28 }} />
        </div>
        <Handle
          type="source"
          position={Position.Right}
          id="onFailure"
          style={{
            background: '#ef4444',
            top: '70%',
            width: 24,
            height: 24,
            border: '3px solid #ef4444',
            borderRadius: '50%',
            zIndex: 2,
            right: -12,
          }}
        />
      </CardContent>
      <Dialog open={showDeleteModal} onOpenChange={open => {
        if (!open) {
          // Block next edit event
          ignoreNextEdit.current = true;
        }
        setShowDeleteModal(open);
      }}>
        <DialogContent className="p-0 bg-transparent border-none shadow-none">
          <Card className="w-full max-w-md mx-auto rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-fade-in-up">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 flex flex-col items-start gap-2 relative border-0">
              {/* For accessibility, ensure DialogTitle is present as a direct child of DialogContent */}
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
                <Button type="button" variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button type="button" className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold shadow-lg" onClick={async () => {
                  setShowDeleteModal(false);
                  window.dispatchEvent(new CustomEvent('deleteNode', { detail: { id } }));
                }}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export const StartingNode = ({ data, id }: { data: NodeData; id: string }) => {
  const [showStartModal, setShowStartModal] = useState(false);
  return (
    <Card className="w-[340px] h-[220px] border-2 border-green-500 bg-green-50 dark:bg-green-900/20 flex flex-col items-center justify-center relative group rounded-xl">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={e => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent('editNode', { detail: { id, data } }));
          }}
          title="Edit Description"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
      <CardContent className="flex flex-col items-center justify-center py-8 w-full h-full">
        <button
          className="flex flex-col items-center justify-center focus:outline-none group"
          onClick={() => setShowStartModal(true)}
          title="Start Workflow"
        >
          <Play className="h-16 w-16 text-green-600 group-hover:scale-110 transition-transform duration-150" />
          <span className="mt-2 font-semibold text-lg text-green-700 dark:text-green-300">Start Workflow</span>
        </button>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 text-center font-medium max-w-[95%] break-words whitespace-pre-line" style={{minHeight: 32}} title={data.config?.userDescription as string || getNodeDescription(data.type || '', data.config || {})}>
          {(data.config?.userDescription as string) || getNodeDescription(data.type || '', data.config || {})}
        </p>
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
      <Dialog open={showStartModal} onOpenChange={setShowStartModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Execute Workflow</DialogTitle>
            <DialogDescription>Are you sure you want to start this workflow?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button" className="btn btn-outline" onClick={() => setShowStartModal(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={() => { setShowStartModal(false); /* TODO: trigger execution */ }}>Start</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export const nodeTypes = {
  startingNode: StartingNode,
  taskNode: TaskNode,
}; 