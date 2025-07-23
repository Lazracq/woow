import React from 'react';

export type NodeHandlerContextType = {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export const NodeHandlerContext = React.createContext<NodeHandlerContextType>({
  onEdit: () => {},
  onDelete: () => {},
}); 