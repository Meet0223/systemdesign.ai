import dagre from 'dagre';
import { Node, Edge } from './types';

// Node dimensions by type - these will be used for layout calculations
const NODE_DIMENSIONS = {
  default: { width: 180, height: 80 },
  frontend: { width: 200, height: 100 },
  server: { width: 180, height: 90 },
  database: { width: 180, height: 90 },
  api: { width: 180, height: 80 },
  loadBalancer: { width: 180, height: 80 },
  security: { width: 160, height: 80 },
  storage: { width: 180, height: 90 },
  media: { width: 180, height: 90 },
  cdn: { width: 180, height: 80 },
  processing: { width: 200, height: 90 },
  player: { width: 180, height: 90 }
};

// Node type to layer mapping for hierarchical layout
const NODE_LAYERS = {
  frontend: 0,
  loadBalancer: 1,
  api: 2,
  security: 2,
  server: 3,
  processing: 3,
  media: 3,
  cdn: 4,
  player: 4,
  storage: 5,
  database: 6
};

interface LayoutOptions {
  direction?: 'TB' | 'LR'; // Top-to-bottom or left-to-right
  nodeSeparation?: number; // Horizontal separation between nodes
  rankSeparation?: number; // Vertical separation between ranks/layers
  edgeSpacing?: number; // Edge routing step size
  padding?: number; // Padding around the entire layout
  layerAssignment?: 'auto' | 'manual'; // Use automatic or manual layer assignment
}

/**
 * Apply automatic layout to nodes and edges using dagre
 */
export function applyAutomaticLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] {
  // Default options
  const {
    direction = 'TB',
    nodeSeparation = 80,
    rankSeparation = 120,
    edgeSpacing = 10,
    padding = 50,
    layerAssignment = 'manual'
  } = options;

  // Create a new directed graph
  const g = new dagre.graphlib.Graph();

  // Set graph properties
  g.setGraph({
    rankdir: direction,
    nodesep: nodeSeparation,
    ranksep: rankSeparation,
    edgesep: edgeSpacing,
    marginx: padding,
    marginy: padding
  });

  // Default to assigning edges a weight of 1
  g.setDefaultEdgeLabel(() => ({ weight: 1 }));

  // Add nodes to the graph with dimensions
  nodes.forEach(node => {
    const dimensions = NODE_DIMENSIONS[node.type as keyof typeof NODE_DIMENSIONS] || NODE_DIMENSIONS.default;
    
    g.setNode(node.id, {
      width: dimensions.width,
      height: dimensions.height,
      // If using manual layer assignment, assign the node to a specific rank
      ...(layerAssignment === 'manual' && {
        rank: NODE_LAYERS[node.type as keyof typeof NODE_LAYERS] || 3
      })
    });
  });

  // Add edges to the graph
  edges.forEach(edge => {
    g.setEdge(edge.source, edge.target);
  });

  // Run the layout algorithm
  dagre.layout(g);

  // Update node positions from the layout
  const positionedNodes = nodes.map(node => {
    const layoutNode = g.node(node.id);
    
    if (!layoutNode) {
      return node; // Return original node if no layout was applied
    }
    
    // Get dimensions to center the node on its position
    const dimensions = NODE_DIMENSIONS[node.type as keyof typeof NODE_DIMENSIONS] || NODE_DIMENSIONS.default;
    
    return {
      ...node,
      position: {
        // Center the node on the calculated position
        x: layoutNode.x - dimensions.width / 2,
        y: layoutNode.y - dimensions.height / 2
      }
    };
  });

  return positionedNodes;
}

/**
 * Detect and resolve any node overlaps
 * This is a failsafe in case the dagre layout doesn't perfectly separate nodes
 */
export function resolveNodeOverlaps(nodes: Node[]): Node[] {
  const resolvedNodes = [...nodes];
  const padding = 20; // Minimum padding between nodes
  
  // Simple overlap resolution - can be enhanced with more sophisticated algorithms
  for (let i = 0; i < resolvedNodes.length; i++) {
    const nodeA = resolvedNodes[i];
    const dimensionsA = NODE_DIMENSIONS[nodeA.type as keyof typeof NODE_DIMENSIONS] || NODE_DIMENSIONS.default;
    
    for (let j = i + 1; j < resolvedNodes.length; j++) {
      const nodeB = resolvedNodes[j];
      const dimensionsB = NODE_DIMENSIONS[nodeB.type as keyof typeof NODE_DIMENSIONS] || NODE_DIMENSIONS.default;
      
      // Check if nodes overlap
      const overlapX = 
        nodeA.position.x < nodeB.position.x + dimensionsB.width + padding && 
        nodeA.position.x + dimensionsA.width + padding > nodeB.position.x;
        
      const overlapY = 
        nodeA.position.y < nodeB.position.y + dimensionsB.height + padding && 
        nodeA.position.y + dimensionsA.height + padding > nodeB.position.y;
        
      if (overlapX && overlapY) {
        // Move the second node to resolve overlap
        // Determine which direction requires less movement
        const moveRight = (nodeB.position.x + dimensionsB.width + padding) - nodeA.position.x;
        const moveLeft = (nodeA.position.x + dimensionsA.width + padding) - nodeB.position.x;
        const moveDown = (nodeB.position.y + dimensionsB.height + padding) - nodeA.position.y;
        const moveUp = (nodeA.position.y + dimensionsA.height + padding) - nodeB.position.y;
        
        const minMove = Math.min(moveRight, moveLeft, moveDown, moveUp);
        
        if (minMove === moveRight) {
          nodeB.position.x = nodeA.position.x + dimensionsA.width + padding;
        } else if (minMove === moveLeft) {
          nodeB.position.x = nodeA.position.x - dimensionsB.width - padding;
        } else if (minMove === moveDown) {
          nodeB.position.y = nodeA.position.y + dimensionsA.height + padding;
        } else {
          nodeB.position.y = nodeA.position.y - dimensionsB.height - padding;
        }
      }
    }
  }
  
  return resolvedNodes;
}

/**
 * Apply snapping to grid for cleaner layout
 */
export function snapNodesToGrid(nodes: Node[], gridSize: number = 20): Node[] {
  return nodes.map(node => ({
    ...node,
    position: {
      x: Math.round(node.position.x / gridSize) * gridSize,
      y: Math.round(node.position.y / gridSize) * gridSize
    }
  }));
}

/**
 * Complete layout pipeline
 */
export function layoutDiagram(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] {
  // Apply the main layout algorithm
  let positionedNodes = applyAutomaticLayout(nodes, edges, options);
  
  // Resolve any remaining overlaps
  positionedNodes = resolveNodeOverlaps(positionedNodes);
  
  // Snap to grid for clean appearance
  positionedNodes = snapNodesToGrid(positionedNodes);
  
  return positionedNodes;
}