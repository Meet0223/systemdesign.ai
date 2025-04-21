import React, { memo, useState, useEffect } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

// Animation for flowing dashed lines in SVG
const flowAnimation = `
@keyframes flow {
  from {
    stroke-dashoffset: 30;
  }
  to {
    stroke-dashoffset: 0;
  }
}
.animated-path {
  animation: flow 2s linear infinite;
}
`;

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
  animated,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Enhanced default styling based on the example image
  const edgeStyle = {
    stroke: (style as any)?.strokeColor || style?.stroke || '#64748B',
    strokeWidth: style?.strokeWidth || 2,
    strokeDasharray: (style as any)?.strokeDasharray || (animated ? '5,5' : ''),
    ...style,
  };

  // Apply marker end for arrow if not explicitly provided
  const actualMarkerEnd = markerEnd || `url(#${id}-arrow)`;

  // Create a background stroke for labels to ensure visibility
  return (
    <>
      <style>{flowAnimation}</style>
      <path
        id={id}
        style={edgeStyle}
        className={`react-flow__edge-path ${selected ? 'selected' : ''} ${animated ? 'animated-path' : ''}`}
        d={edgePath}
        markerEnd={actualMarkerEnd}
      />
      
      {/* Edge Arrows */}
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
      
      {/* Label with better styling */}
      {label && (
        <foreignObject
          width="120"
          height="30"
          x={labelX - 60}
          y={labelY - 15}
          className="edge-label-container overflow-visible"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              padding: '2px 5px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '1px solid #e2e8f0',
              color: edgeStyle.stroke,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {label}
          </div>
        </foreignObject>
      )}
    </>
  );
}

export default memo(EdgeComponent);
