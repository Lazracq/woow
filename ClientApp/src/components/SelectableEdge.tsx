import React from 'react';
import { EdgeProps } from 'reactflow';
import { X } from 'lucide-react';

interface SelectableEdgeProps extends EdgeProps {
  selected?: boolean;
  onRemove?: (id: string) => void;
}

const ICON_SIZE = 20;

// Custom L-shaped (step) path generator
function getCustomStepPath({ sourceX, sourceY, targetX, targetY }: { sourceX: number; sourceY: number; targetX: number; targetY: number }): [string, number, number] {
  // Go horizontal from source, then vertical to target
  const midX = (sourceX + targetX) / 2;
  const path = `M${sourceX},${sourceY} L${midX},${sourceY} L${midX},${targetY} L${targetX},${targetY}`;
  // For label/icon, use the midpoint of the vertical segment
  const labelX = midX;
  const labelY = (sourceY + targetY) / 2;
  return [path, labelX, labelY];
}

export const SelectableEdge: React.FC<SelectableEdgeProps> = (props) => {
  // Get selected and onRemove from props or from data (React Flow passes custom props via data)
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    style = {},
    markerEnd,
    data = {},
  } = props;
  const selected = props.selected ?? data.selected ?? false;
  const onRemove = props.onRemove ?? data.onRemove;

  const [edgePath, labelX, labelY] = getCustomStepPath({ sourceX, sourceY, targetX, targetY });
  const isFailure = (data?.label || '').toLowerCase() === 'on failure';

  return (
    <g className="react-flow__edge-group">
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          stroke: isFailure ? '#ef4444' : (selected ? '#6366f1' : style.stroke || '#10b981'),
          strokeWidth: selected ? 7 : 4,
          filter: selected ? 'drop-shadow(0 0 4px #6366f1aa)' : undefined,
        }}
        markerEnd={markerEnd}
      />
      {/* Connection label */}
      {data?.label && (
        <foreignObject
          x={labelX - 50}
          y={labelY - 18}
          width={100}
          height={36}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              fontSize: 14,
              fontWeight: 600,
              color: isFailure ? '#ef4444' : (selected ? '#6366f1' : '#222'),
              background: 'rgba(255,255,255,0.85)',
              borderRadius: 6,
              border: isFailure ? '1.5px solid #ef4444' : (selected ? '1.5px solid #6366f1' : '1px solid #e5e7eb'),
              boxShadow: selected ? '0 1px 6px #6366f133' : '0 1px 3px #0001',
              padding: '2px 8px',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {data.label}
          </div>
        </foreignObject>
      )}
      {selected && (
        <foreignObject
          x={labelX - ICON_SIZE / 2}
          y={labelY - ICON_SIZE / 2}
          width={ICON_SIZE}
          height={ICON_SIZE}
          style={{ overflow: 'visible' }}
        >
          <button
            aria-label="Remove connection"
            onClick={e => {
              e.stopPropagation();
              if (onRemove) onRemove(id);
            }}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '50%',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              width: ICON_SIZE,
              height: ICON_SIZE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
            tabIndex={0}
          >
            <X size={16} color="#ef4444" />
          </button>
        </foreignObject>
      )}
    </g>
  );
};

export default SelectableEdge; 