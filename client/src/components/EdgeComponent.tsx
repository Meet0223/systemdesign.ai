import React, { memo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

function EdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  selected,
  label,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Override the default style with any custom style
  const edgeStyle = {
    stroke: style?.stroke || '#CBD5E0',
    strokeWidth: style?.strokeWidth || 2,
    ...style,
  };

  return (
    <>
      <path
        id={id}
        style={edgeStyle}
        className={`react-flow__edge-path ${selected ? 'selected' : ''}`}
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      {/* Edge Arrows */}
      {!markerEnd && (
        <marker
          id={`${id}-arrow`}
          markerWidth="12"
          markerHeight="12"
          refX="6"
          refY="6"
          orient="auto"
        >
          <path
            d="M2,2 L10,6 L2,10 z"
            fill={edgeStyle.stroke}
            className={selected ? 'text-primary' : 'text-connection'}
          />
        </marker>
      )}
      
      {/* Label */}
      {label && (
        <foreignObject
          width="100"
          height="40"
          x={labelX - 50}
          y={labelY - 20}
          className="edge-label-container overflow-visible"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className="edge-label">
            {label}
          </div>
        </foreignObject>
      )}
    </>
  );
}

export default memo(EdgeComponent);
