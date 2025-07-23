import { create } from 'zustand';

interface WorkflowStoreState {
  editNode: { id: string; data: any } | null;
  editDescription: string;
  setEditNode: (node: { id: string; data: any } | null) => void;
  setEditDescription: (desc: string) => void;
  deleteNode: (id: string) => void;
  setDeleteNodeHandler: (handler: (id: string) => void) => void;
}

export const useWorkflowStore = create<WorkflowStoreState>((set) => ({
  editNode: null,
  editDescription: '',
  setEditNode: (node) => set({ editNode: node }),
  setEditDescription: (desc) => set({ editDescription: desc }),
  // deleteNode is a placeholder, will be set from WorkflowStudio
  deleteNode: () => {},
  setDeleteNodeHandler: (handler) => set({ deleteNode: handler }),
})); 