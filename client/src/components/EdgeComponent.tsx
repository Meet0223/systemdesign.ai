import React, { useState, useEffect, useMemo } from "react";
import {
  Edge as ReactFlowEdge,
  getBezierPath,
  EdgeLabelRenderer,
  useReactFlow,
  Position,
  Edge,
} from "reactflow";
// We need to install styled-components types or use a declare module workaround
// @ts-ignore
import styled, { keyframes, css } from "styled-components";
import { EdgeData, EdgeType } from "../types/Edge";

// Define edge types
export const EDGE_TYPES = {
  DEFAULT: "default",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(var(--edge-color-rgb), 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(var(--edge-color-rgb), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--edge-color-rgb), 0); }
`;

const glow = keyframes`
  0% { filter: drop-shadow(0 0 2px rgba(var(--edge-color-rgb), 0.6)); }
  50% { filter: drop-shadow(0 0 6px rgba(var(--edge-color-rgb), 0.8)); }
  100% { filter: drop-shadow(0 0 2px rgba(var(--edge-color-rgb), 0.6)); }
`;

const float = keyframes`
  0% { transform: translate(-50%, -50%); }
  50% { transform: translate(-50%, -53%); }
  100% { transform: translate(-50%, -50%); }
`;

// Styled Edge Path component
const StyledPath = styled.path<{
  $edgeType: string;
  $isHovered: boolean;
  $isActive: boolean;
}>`
  --edge-color: ${(props: { $edgeType: string }) => {
    switch (props.$edgeType) {
      case EDGE_TYPES.SUCCESS:
        return "#10b981";
      case EDGE_TYPES.WARNING:
        return "#f59e0b";
      case EDGE_TYPES.ERROR:
        return "#ef4444";
      default:
        return "#64748b";
    }
  }};

  --edge-color-rgb: ${(props: { $edgeType: string }) => {
    switch (props.$edgeType) {
      case EDGE_TYPES.SUCCESS:
        return "16, 185, 129";
      case EDGE_TYPES.WARNING:
        return "245, 158, 11";
      case EDGE_TYPES.ERROR:
        return "239, 68, 68";
      default:
        return "100, 116, 139";
    }
  }};

  stroke: var(--edge-color);
  stroke-width: ${(props: { $isHovered: boolean; $isActive: boolean }) =>
    props.$isHovered || props.$isActive ? "2.5px" : "1.5px"};
  fill: none;
  transition: stroke-width 0.2s ease, stroke 0.2s ease;

  ${(props: { $isActive: boolean }) =>
    props.$isActive &&
    css`
      animation: ${glow} 1.5s infinite ease-in-out;
    `}

  &:hover {
    cursor: pointer;
  }
`;

// Edge Label component with an elegant, minimalist design
const EdgeLabel = styled.div<{
  $isVisible: boolean;
  $edgeType: string;
}>`
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 12px;
  pointer-events: all;
  user-select: none;
  font-weight: 500;
  color: ${(props: { $edgeType: string }) => {
    switch (props.$edgeType) {
      case EDGE_TYPES.SUCCESS:
        return "#10b981";
      case EDGE_TYPES.WARNING:
        return "#f59e0b";
      case EDGE_TYPES.ERROR:
        return "#ef4444";
      default:
        return "#64748b";
    }
  }};
  opacity: ${(props: { $isVisible: boolean }) => (props.$isVisible ? 1 : 0)};
  transition: opacity 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
  animation: ${fadeIn} 0.3s ease-out;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(5px);
  padding: 3px 8px;
  border-radius: 4px;

  &::after {
    content: "";
    width: 100%;
    height: 2px;
    background: ${(props: { $edgeType: string }) => {
      switch (props.$edgeType) {
        case EDGE_TYPES.SUCCESS:
          return "#10b981";
        case EDGE_TYPES.WARNING:
          return "#f59e0b";
        case EDGE_TYPES.ERROR:
          return "#ef4444";
        default:
          return "#64748b";
      }
    }};
    margin-top: 2px;
    border-radius: 1px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  &:hover {
    transform: translate(-50%, -50%) scale(1.05);
    z-index: 10;
    animation: ${float} 2s ease-in-out infinite;
  }
`;

// Arrow Markers
const EdgeArrowMarker = ({ id, color }: { id: string; color: string }) => (
  <marker
    id={id}
    viewBox="0 0 12 12"
    refX="6"
    refY="6"
    markerWidth="12"
    markerHeight="12"
    orient="auto-start-reverse"
  >
    <path d="M 0 0 L 12 6 L 0 12 z" fill={color} stroke="none" />
  </marker>
);

// Extended EdgeData with additional properties needed for the component
interface ExtendedEdgeData extends EdgeData {
  active?: boolean;
  showLabel?: boolean;
}

// Edge Component Props
// We're defining our own props interface instead of extending Edge
interface EdgeComponentProps {
  id: string;
  source: string;
  target: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: React.CSSProperties;
  markerEnd?: string;
  data?: ExtendedEdgeData;
}

// Edge Component
export function EdgeComponent({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeComponentProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { getNode } = useReactFlow();

  // Get edge type from data or default
  const edgeType = data?.type || EDGE_TYPES.DEFAULT;
  const isActive = data?.active || false;

  // Get edge color based on type
  const getEdgeColor = () => {
    switch (edgeType) {
      case EDGE_TYPES.SUCCESS:
        return "#10b981";
      case EDGE_TYPES.WARNING:
        return "#f59e0b";
      case EDGE_TYPES.ERROR:
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  // Calculate bezier path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Custom marker ID
  const markerId = `edge-${edgeType}-${id}`;

  // Get label content
  const label = data?.label || edgeType;

  // Calculate the midpoint of the edge with a slight offset
  const midX = labelX;
  const midY = labelY;

  // Make label visible on hover or if edge is active
  const isLabelVisible = isHovered || isActive || data?.showLabel;

  return (
    <>
      <defs>
        <EdgeArrowMarker id={markerId} color={getEdgeColor()} />
      </defs>

      <StyledPath
        id={id}
        d={edgePath}
        $edgeType={edgeType}
        $isHovered={isHovered}
        $isActive={isActive}
        markerEnd={`url(#${markerId})`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      <EdgeLabelRenderer>
        <EdgeLabel
          $isVisible={isLabelVisible}
          $edgeType={edgeType}
          style={{
            transform: `translate(-50%, -50%) translate(${midX}px,${midY}px)`,
          }}
        >
          {label}
        </EdgeLabel>
      </EdgeLabelRenderer>
    </>
  );
}
