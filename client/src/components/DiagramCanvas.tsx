import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge as ReactFlowEdge,
  NodeTypes,
  EdgeTypes,
  Node as ReactFlowNode,
  useReactFlow,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDiagramStore } from '@/store/diagramStore';
import NodeComponent from './NodeComponent';
import EdgeComponent from './EdgeComponent';
import { nanoid } from 'nanoid';
import { Node as CustomNode, NodeType, Edge as CustomEdge } from '@/lib/types';

interface DiagramCanvasProps {
  zoomLevel: number;
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
}

export default function DiagramCanvas({
  zoomLevel,
  leftSidebarCollapsed,
  rightSidebarCollapsed,
}: DiagramCanvasProps) {
  const diagramStore = useDiagramStore();
  
  // Memoize node types to avoid React Flow warning
  const nodeTypes = useMemo<NodeTypes>(() => ({
    default: NodeComponent,
    server: NodeComponent,
    database: NodeComponent,
    api: NodeComponent,
    loadBalancer: NodeComponent,
    security: NodeComponent,
    storage: NodeComponent,
    frontend: NodeComponent,
    media: NodeComponent,
    cdn: NodeComponent,
    processing: NodeComponent,
    player: NodeComponent,
  }), []);
  
  // Memoize edge types to avoid React Flow warning
  const edgeTypes = useMemo<EdgeTypes>(() => ({
    default: EdgeComponent,
  }), []);

  // Initialize with nodes and edges from store
  const [nodes, setNodes, onNodesChange] = useNodesState(diagramStore.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(diagramStore.edges);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project, getViewport, setViewport } = useReactFlow();

  // Keep local state in sync with store
  useEffect(() => {
    setNodes(diagramStore.nodes);
  }, [diagramStore.nodes, setNodes]);

  useEffect(() => {
    setEdges(diagramStore.edges);
  }, [diagramStore.edges, setEdges]);

  // Update zoom level when prop changes
  useEffect(() => {
    const { x, y } = getViewport();
    setViewport({ x, y, zoom: zoomLevel / 100 });
  }, [zoomLevel, getViewport, setViewport]);

  // Only sync back to store if a node is added, removed, or changed position
  const syncNodesToStore = useCallback((updatedNodes: ReactFlowNode[]) => {
    diagramStore.setNodes(updatedNodes as any);
  }, [diagramStore]);
  
  const syncEdgesToStore = useCallback((updatedEdges: ReactFlowEdge[]) => {
    diagramStore.setEdges(updatedEdges as any);
  }, [diagramStore]);

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: ReactFlowNode) => {
    diagramStore.selectNode(node as unknown as CustomNode);
  }, [diagramStore]);

  // Handle edge selection
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: ReactFlowEdge) => {
    diagramStore.selectEdge(edge as any);
  }, [diagramStore]);

  // Handle connection (edge creation)
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: nanoid(),
        style: { stroke: '#CBD5E0', strokeWidth: 2 },
      };
      setEdges((eds) => {
        const updatedEdges = addEdge(newEdge, eds);
        syncEdgesToStore(updatedEdges);
        return updatedEdges;
      });
    },
    [setEdges, syncEdgesToStore]
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
          type,
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

        setNodes((nds) => {
          const updatedNodes = nds.concat(newNode);
          syncNodesToStore(updatedNodes);
          return updatedNodes;
        });
      }
    },
    [project, setNodes, syncNodesToStore]
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
    diagramStore.selectNode(null);
    diagramStore.selectEdge(null);
  }, [diagramStore]);

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
        onNodesChange={(changes) => {
          onNodesChange(changes);
          syncNodesToStore(nodes);
        }}
        onEdgesChange={(changes) => {
          onEdgesChange(changes);
          syncEdgesToStore(edges);
        }}
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