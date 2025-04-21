import React, { useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  NodeTypes,
  EdgeTypes,
  Node as ReactFlowNode,
  NodeChange,
  EdgeChange,
  useReactFlow,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDiagramStore } from '@/store/diagramStore';
import NodeComponent from './NodeComponent';
import EdgeComponent from './EdgeComponent';
import { nanoid } from 'nanoid';
import { Node as CustomNode, NodeType } from '@/lib/types';

interface DiagramCanvasProps {
  zoomLevel: number;
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
}

// Define custom node types
const nodeTypes: NodeTypes = {
  default: NodeComponent,
};

// Define custom edge types
const edgeTypes: EdgeTypes = {
  default: EdgeComponent,
};

export default function DiagramCanvas({
  zoomLevel,
  leftSidebarCollapsed,
  rightSidebarCollapsed,
}: DiagramCanvasProps) {
  const { 
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    selectNode,
    selectEdge,
  } = useDiagramStore();

  // Initialize with nodes and edges from store
  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project, getViewport, setViewport } = useReactFlow();

  // Keep local state in sync with store
  useEffect(() => {
    setNodes(storeNodes);
  }, [storeNodes, setNodes]);

  useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges, setEdges]);

  // Update zoom level when prop changes
  useEffect(() => {
    const { x, y } = getViewport();
    setViewport({ x, y, zoom: zoomLevel / 100 });
  }, [zoomLevel, getViewport, setViewport]);

  // Sync changes from ReactFlow back to our store
  useEffect(() => {
    setStoreNodes(nodes);
  }, [nodes, setStoreNodes]);

  useEffect(() => {
    setStoreEdges(edges);
  }, [edges, setStoreEdges]);

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: ReactFlowNode) => {
    selectNode(node as unknown as CustomNode);
  }, [selectNode]);

  // Handle edge selection
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    selectEdge(edge);
  }, [selectEdge]);

  // Handle connection (edge creation)
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: nanoid(),
        style: { stroke: '#CBD5E0', strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Handle drag over for adding new nodes
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop for adding new nodes
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (reactFlowWrapper.current) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow') as NodeType;
        
        // Check if the dropped element is valid
        if (typeof type === 'undefined' || !type) {
          return;
        }

        const position = project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode: ReactFlowNode = {
          id: nanoid(),
          type: 'default',
          position,
          data: { 
            label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            type,
            style: {
              backgroundColor: '#FFFFFF',
              borderColor: '#CBD5E0',
              textColor: '#1A202C',
              borderWidth: 1,
            },
          },
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [project, setNodes]
  );

  // Handle key down event for deleting nodes/edges
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Your delete logic here
      }
    },
    []
  );

  // Handle pane click to deselect elements
  const onPaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  return (
    <div
      className="w-full h-full"
      ref={reactFlowWrapper}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onKeyDown={onKeyDown}
      tabIndex={0} // Make the div focusable
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode="Delete"
        className="canvas-grid"
      >
        <Controls />
        <MiniMap />
        <Background color="#CBD5E0" gap={20} />
        <Panel position="bottom-right" className="bg-white p-2 rounded shadow text-xs text-gray-500">
          Drag and drop components from the left sidebar
        </Panel>
      </ReactFlow>
    </div>
  );
}
